import pandas as pd
from sklearn.preprocessing import StandardScaler
import joblib

print("Loading dataset...")
try:
    # Ensure the file name perfectly matches your CSV
    df = pd.read_csv("cardio_train.csv", sep=";")
except FileNotFoundError:
    print("Error: cardio_train.csv not found! Make sure it is in the exact same folder.")
    exit()

print("Applying feature engineering...")
# The original Kaggle dataset stores age in days. 
# We divide by 365.25 to convert it to years so the scaler math perfectly
# matches the 'years' format coming from your React frontend!
df["age_years"] = df["age"] / 365.25 
df["height_m"] = df["height"] / 100.0
df["bmi"] = df["weight"] / (df["height_m"] ** 2)
df["pulse_pressure"] = df["ap_hi"] - df["ap_lo"]
df["health_index"] = (df["active"] * 1.0) - (df["smoke"] * 0.5) - (df["alco"] * 0.5)
df["cholesterol_gluc_interaction"] = df["cholesterol"] * df["gluc"]

FEATURE_COLUMNS = [
    "gender", "weight", "ap_hi", "ap_lo",
    "cholesterol", "gluc", "smoke", "alco", "active",
    "age_years", "bmi", "pulse_pressure",
    "health_index", "cholesterol_gluc_interaction"
]

# Extract only the exact features the neural network expects
X = df[FEATURE_COLUMNS].dropna()

print("Fitting Scaler...")
scaler = StandardScaler()
scaler.fit(X)

print("Saving to scaler.pkl...")
joblib.dump(scaler, "scaler.pkl")
print("✅ scaler.pkl generated successfully with your current scikit-learn version!")