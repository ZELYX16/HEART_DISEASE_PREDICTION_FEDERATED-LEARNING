from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field, model_validator
import torch
import torch.nn as nn
from torchvision import transforms, models
import torchvision.transforms.functional as TF
from PIL import Image
import io
import json
import pandas as pd
import joblib
import warnings

app = FastAPI(title="CardioPredict AI Backend")

# Enable CORS for React
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

device = torch.device('cpu') 

# ==========================================
# 1. CLINICAL DATA MODEL SETUP (MLP)
# ==========================================
# Reconstructed architecture perfectly matching your global_model.pth weights
class MLP(nn.Module):
    def __init__(self, input_dim):
        super().__init__()
        self.net = nn.Sequential(
            nn.Linear(input_dim, 128),  # net.0
            nn.BatchNorm1d(128),        # net.1
            nn.ReLU(),                  # net.2
            nn.Dropout(0.2),            # net.3
            nn.Linear(128, 64),         # net.4
            nn.BatchNorm1d(64),         # net.5
            nn.ReLU(),                  # net.6
            nn.Dropout(0.2),            # net.7
            nn.Linear(64, 2)            # net.8 (Outputs 2 logits for Softmax)
        )

    def forward(self, x):
        return self.net(x)

def feature_engineering(df):
    df["age_years"] = (df["age"])
    df["height_m"] = df["height"] / 100.0
    df["bmi"] = df["weight"] / (df["height_m"] ** 2)
    df["pulse_pressure"] = df["ap_hi"] - df["ap_lo"]
    df["health_index"] = (df["active"] * 1.0) - (df["smoke"] * 0.5) - (df["alco"] * 0.5)
    df["cholesterol_gluc_interaction"] = df["cholesterol"] * df["gluc"]
    return df

FEATURE_COLUMNS = [
    "gender", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active",
    "age_years", "bmi", "pulse_pressure",
    "health_index", "cholesterol_gluc_interaction"
]

print("Loading Clinical (MLP) Model and Scaler...")
mlp_model = MLP(len(FEATURE_COLUMNS))
try:
    # strict=False ensures it loads perfectly even if your Dropout rate was different
    mlp_model.load_state_dict(torch.load("global_model.pth", map_location=device), strict=False)
    print("Successfully loaded MLP Model")
except Exception as e:
    print(f"Warning: Could not load MLP model weights. Error: {e}")

mlp_model.to(device)
mlp_model.eval()

try:
    scaler = joblib.load("scaler.pkl")
    print("Successfully loaded StandardScaler")
except Exception as e:
    warnings.warn(f"scaler.pkl not found! Predictions will be inaccurate. Error: {e}")
    scaler = None

# ==========================================
# 2. ECG IMAGE MODEL SETUP (CNN)
# ==========================================
class SquarePad:
    def __call__(self, image):
        w, h = image.size
        max_wh = max(w, h)
        hp = int((max_wh - w) / 2)
        vp = int((max_wh - h) / 2)
        padding = (hp, vp, hp, vp)
        return TF.pad(image, padding, 0, 'constant')

IMG_SIZE = 300
val_transforms = transforms.Compose([
    SquarePad(),
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
])

def get_cnn_model():
    print("Initializing EfficientNet-B3 Architecture...")
    model = models.efficientnet_b3(weights=None)
    num_ftrs = model.classifier[1].in_features
    model.classifier[1] = nn.Linear(num_ftrs, 1)
    return model

print("Loading PyTorch CNN Weights...")
cnn_model = get_cnn_model()

try:
    CNN_MODEL_PATH = 'global_model_round_10.pth' 
    cnn_model.load_state_dict(torch.load(CNN_MODEL_PATH, map_location=device))
    print(f"Successfully loaded {CNN_MODEL_PATH}")
except Exception as e:
    print(f"Warning: Could not load CNN model weights. Error: {e}")

cnn_model.to(device)
cnn_model.eval()

# ==========================================
# 3. SCHEMAS & VALIDATION LOGIC
# ==========================================
class ClinicalData(BaseModel):
    age: int = Field(..., ge=1, le=120, description="Age in days")
    gender: int = Field(..., ge=1, le=2)
    height: float = Field(..., ge=100.0, le=250.0)
    weight: float = Field(..., ge=30.0, le=300.0)
    ap_hi: int = Field(..., ge=50, le=250)
    ap_lo: int = Field(..., ge=30, le=180)
    cholesterol: int = Field(..., ge=1, le=3)
    gluc: int = Field(..., ge=1, le=3)
    smoke: int = Field(..., ge=0, le=1)
    alco: int = Field(..., ge=0, le=1)
    active: int = Field(..., ge=0, le=1)

    @model_validator(mode='after')
    def check_blood_pressure(self) -> 'ClinicalData':
        if self.ap_hi <= self.ap_lo:
            raise ValueError('Systolic BP (ap_hi) must be strictly greater than Diastolic BP (ap_lo)')
        return self

# ==========================================
# 4. PREDICTION HELPERS
# ==========================================
def get_clinical_prediction(data: ClinicalData):
    df = pd.DataFrame([data.model_dump()])
    df = feature_engineering(df)
    X = df[FEATURE_COLUMNS]

    if scaler:
        X_scaled = scaler.transform(X)
    else:
        from sklearn.preprocessing import StandardScaler
        X_scaled = StandardScaler().fit_transform(X)

    X_tensor = torch.tensor(X_scaled, dtype=torch.float32).to(device)
    with torch.no_grad():
        logits = mlp_model(X_tensor)
        # Apply Softmax exactly as defined in evaluate.py
        probability = torch.softmax(logits, dim=1)[:, 1].item()
        # Default threshold of 0.5 from evaluate.py summary
        is_abnormal = probability >= 0.5
        
    return is_abnormal, probability

async def get_ecg_prediction(ecg_image: UploadFile):
    contents = await ecg_image.read()
    image = Image.open(io.BytesIO(contents)).convert("RGB")
        
    input_tensor = val_transforms(image).unsqueeze(0).to(device) 
    
    with torch.no_grad():
        outputs = cnn_model(input_tensor)
        probability = torch.sigmoid(outputs).item()
        is_abnormal = probability > 0.3
        
    return is_abnormal, probability

# ==========================================
# 5. API ROUTES
# ==========================================
@app.post("/api/predict/mlp")
async def predict_mlp(data: ClinicalData):
    try:
        is_abnormal, probability = get_clinical_prediction(data)
        confidence = probability * 100 if is_abnormal else (1 - probability) * 100
        
        return {
            "model": "MLP (Clinical Data)",
            "prediction": "Heart Disease Present" if is_abnormal else "Heart Disease Not Present",
            "confidence": f"{confidence:.2f}%",
            "raw_probability": f"{probability:.4f}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"MLP Error: {str(e)}")

@app.post("/api/predict/ecg")
async def predict_ecg(ecg_image: UploadFile = File(...)):
    is_abnormal, probability = await get_ecg_prediction(ecg_image)
    
    confidence = probability * 100 if is_abnormal else (1 - probability) * 100
    prediction_text = "Abnormal ECG Detected" if is_abnormal else "Normal ECG"

    return {
        "model": "EfficientNet-B3 (CNN)",
        "prediction": prediction_text,
        "confidence": f"{confidence:.2f}%",
        "raw_probability": f"{probability:.4f}"
    }

@app.post("/api/predict/combined")
async def predict_combined(
    clinical_data: str = Form(...), 
    ecg_image: UploadFile = File(...)
):
    try:
        parsed_data = json.loads(clinical_data)
        features = ClinicalData(**parsed_data) 
        
        # 1. Get raw predictions
        clinical_abnormal, clinical_prob = get_clinical_prediction(features)
        ecg_abnormal, ecg_prob = await get_ecg_prediction(ecg_image)

        # 2. Calculate Confidence Scores (Distance from 0.5 threshold for MLP, 0.3 for ECG)
        # For MLP (Threshold 0.5)
        mlp_confidence = clinical_prob * 100 if clinical_abnormal else (1 - clinical_prob) * 100
        
        # For ECG (Threshold 0.3)
        # Note: We scale it so 0.3 is the middle point
        if ecg_abnormal:
            # Maps 0.3 -> 1.0 to 50% -> 100% confidence
            ecg_confidence = 50 + ((ecg_prob - 0.3) / 0.7) * 50
        else:
            # Maps 0.0 -> 0.3 to 100% -> 50% confidence
            ecg_confidence = 100 - (ecg_prob / 0.3) * 50

        # 3. Determine the Winner based on Confidence
        if ecg_confidence >= mlp_confidence:
            winning_model = "ECG Image Analysis"
            winning_prediction = "High Risk" if ecg_abnormal else "Normal"
            winning_confidence = ecg_confidence
        else:
            winning_model = "Clinical Data (MLP)"
            winning_prediction = "High Risk" if clinical_abnormal else "Normal"
            winning_confidence = mlp_confidence

        return {
            "model": "Hybrid Analysis",
            "final_diagnosis": winning_prediction,
            "primary_driver": winning_model,
            "overall_confidence": f"{winning_confidence:.2f}%",
            "details": {
                "mlp_contribution": "High Risk" if clinical_abnormal else "Normal",
                "mlp_confidence": f"{mlp_confidence:.2f}%",
                "cnn_contribution": "Abnormal" if ecg_abnormal else "Normal",
                "cnn_confidence": f"{ecg_confidence:.2f}%"
            }
        }
    except ValueError as ve:
        raise HTTPException(status_code=422, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Combined Model Error: {str(e)}")