import React, { useState, useRef } from "react";
import {
  Heart,
  Activity,
  Upload,
  Crop,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RotateCcw,
} from "lucide-react";
import "./styles.css";
import "./cropper-styles.css";

// ==========================================
// 1. IMAGE CROPPER
// ==========================================
const ImageCropper = ({ image, onCrop }) => {
  const [cropEdges, setCropEdges] = useState({
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isConfirmed, setIsConfirmed] = useState(false);

  const canvasRef = useRef(null);
  const imgRef = useRef(null);

  React.useEffect(() => {
    if (image) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setCropEdges({ left: 0, right: 0, top: 0, bottom: 0 });
        setIsConfirmed(false);
      };
      img.src = URL.createObjectURL(image);
    }
  }, [image]);

  const getCropDimensions = () => {
    return {
      x: cropEdges.left,
      y: cropEdges.top,
      width: Math.max(1, imageSize.width - cropEdges.left - cropEdges.right),
      height: Math.max(1, imageSize.height - cropEdges.top - cropEdges.bottom),
    };
  };

  React.useEffect(() => {
    if (!image || !canvasRef.current || imageSize.width === 0) return;

    const ctx = canvasRef.current.getContext("2d");
    const img = new Image();
    img.onload = () => {
      const { x, y, width, height } = getCropDimensions();
      canvasRef.current.width = width;
      canvasRef.current.height = height;
      ctx.drawImage(img, x, y, width, height, 0, 0, width, height);
      setIsConfirmed(false);
    };
    img.src = URL.createObjectURL(image);
  }, [cropEdges, imageSize, image]);

  const handleEdgeChange = (edge, value) => {
    const val = parseInt(value);
    setCropEdges((prev) => {
      const next = { ...prev, [edge]: val };
      if (edge === "left" && val >= imageSize.width - next.right) return prev;
      if (edge === "right" && val >= imageSize.width - next.left) return prev;
      if (edge === "top" && val >= imageSize.height - next.bottom) return prev;
      if (edge === "bottom" && val >= imageSize.height - next.top) return prev;
      return next;
    });
  };

  const confirmCrop = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) {
        onCrop(blob, getCropDimensions());
        setIsConfirmed(true);
      }
    }, "image/png");
  };

  const overlayStyle = {
    left: `${(cropEdges.left / imageSize.width) * 100}%`,
    top: `${(cropEdges.top / imageSize.height) * 100}%`,
    right: `${(cropEdges.right / imageSize.width) * 100}%`,
    bottom: `${(cropEdges.bottom / imageSize.height) * 100}%`,
  };

  const { width, height } = getCropDimensions();

  return (
    <div className="cropper-container">
      <div className="cropper-row-layout">
        <div className="editor-pane">
          <div className="image-stage">
            <img
              ref={imgRef}
              src={image ? URL.createObjectURL(image) : ""}
              alt="Source"
              className="source-image"
            />
            <div className="crop-overlay" style={overlayStyle}>
              <div className="grid-lines"></div>
            </div>
          </div>
          <div className="controls-panel">
            <h5 className="controls-title">Edge Adjustments (px)</h5>
            <div className="sliders-grid">
              {["left", "right", "top", "bottom"].map((edge) => {
                let max = 0;
                if (edge === "left")
                  max = imageSize.width - cropEdges.right - 10;
                if (edge === "right")
                  max = imageSize.width - cropEdges.left - 10;
                if (edge === "top")
                  max = imageSize.height - cropEdges.bottom - 10;
                if (edge === "bottom")
                  max = imageSize.height - cropEdges.top - 10;

                return (
                  <div key={edge} className="slider-group">
                    <div className="slider-header">
                      <span>
                        {edge.charAt(0).toUpperCase() + edge.slice(1)}
                      </span>
                      <span className="slider-value">{cropEdges[edge]}</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(0, max)}
                      value={cropEdges[edge]}
                      onChange={(e) => handleEdgeChange(edge, e.target.value)}
                      className="custom-range"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="preview-pane">
          <div className="preview-header">
            {isConfirmed ? (
              <CheckCircle2 size={20} className="text-green-500" />
            ) : (
              <Crop size={20} />
            )}
            <h4>Cropped Result</h4>
          </div>
          <div className="preview-canvas-container">
            <canvas ref={canvasRef} className="preview-canvas" />
          </div>
          <small
            style={{ textAlign: "center", color: "#9ca3af", display: "block" }}>
            Final Size: {Math.round(width)} × {Math.round(height)} px
          </small>
          <button
            type="button"
            onClick={confirmCrop}
            className={`btn-primary ${isConfirmed ? "confirmed" : ""}`}>
            {isConfirmed ? (
              <>
                <CheckCircle2 size={18} /> Crop Confirmed
              </>
            ) : (
              <>
                <ArrowRight size={18} /> Confirm Crop
              </>
            )}
          </button>
          <button
            type="button"
            onClick={() =>
              setCropEdges({ left: 0, right: 0, top: 0, bottom: 0 })
            }
            className="btn-secondary">
            Reset Original
          </button>
        </div>
      </div>
    </div>
  );
};

// ==========================================
// 2. MLP CLINICAL DATA FORM
// ==========================================
const MLPInputForm = ({ onSubmit, isLoading, result }) => {
  const [formData, setFormData] = useState({
    age: "",
    gender: "",
    height: "",
    weight: "",
    ap_hi: "",
    ap_lo: "",
    cholesterol: "",
    gluc: "",
    smoke: "",
    alco: "",
    active: "",
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.age || formData.age < 1000 || formData.age > 30000)
      newErrors.age = "Age must be between 1000-30000 days";
    if (!formData.gender || !["1", "2"].includes(formData.gender))
      newErrors.gender = "Gender must be 1 (female) or 2 (male)";
    if (!formData.height || formData.height < 100 || formData.height > 250)
      newErrors.height = "Height must be between 100-250 cm";
    if (!formData.weight || formData.weight < 30 || formData.weight > 300)
      newErrors.weight = "Weight must be between 30-300 kg";
    if (!formData.ap_hi || formData.ap_hi < 50 || formData.ap_hi > 250)
      newErrors.ap_hi = "Systolic BP must be between 50-250 mmHg";
    if (!formData.ap_lo || formData.ap_lo < 30 || formData.ap_lo > 180)
      newErrors.ap_lo = "Diastolic BP must be between 30-180 mmHg";
    if (
      formData.ap_hi &&
      formData.ap_lo &&
      Number(formData.ap_hi) <= Number(formData.ap_lo)
    )
      newErrors.ap_hi = "Systolic BP must be > Diastolic BP";
    if (
      !formData.cholesterol ||
      !["1", "2", "3"].includes(formData.cholesterol)
    )
      newErrors.cholesterol = "Required";
    if (!formData.gluc || !["1", "2", "3"].includes(formData.gluc))
      newErrors.gluc = "Required";
    if (formData.smoke === "" || !["0", "1"].includes(formData.smoke))
      newErrors.smoke = "Required";
    if (formData.alco === "" || !["0", "1"].includes(formData.alco))
      newErrors.alco = "Required";
    if (formData.active === "" || !["0", "1"].includes(formData.active))
      newErrors.active = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      // CRITICAL UPDATE: Convert strings to correct data types for FastAPI Pydantic
      const processedData = {
        age: parseInt(formData.age, 10),
        gender: parseInt(formData.gender, 10),
        height: parseFloat(formData.height),
        weight: parseFloat(formData.weight),
        ap_hi: parseInt(formData.ap_hi, 10),
        ap_lo: parseInt(formData.ap_lo, 10),
        cholesterol: parseInt(formData.cholesterol, 10),
        gluc: parseInt(formData.gluc, 10),
        smoke: parseInt(formData.smoke, 10),
        alco: parseInt(formData.alco, 10),
        active: parseInt(formData.active, 10),
      };
      onSubmit(processedData);
    }
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  return (
    <div className="form-container">
      <form onSubmit={handleSubmit} className="mlp-form">
        <div className="form-section">
          <h3>Basic Information</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Age (days)</label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => handleChange("age", e.target.value)}
                placeholder="e.g., 18393"
                className={errors.age ? "error" : ""}
              />
              {errors.age && <span className="error-msg">{errors.age}</span>}
            </div>
            <div className="form-field">
              <label>Gender</label>
              <select
                value={formData.gender}
                onChange={(e) => handleChange("gender", e.target.value)}
                className={errors.gender ? "error" : ""}>
                <option value="">Select gender</option>
                <option value="1">Female</option>
                <option value="2">Male</option>
              </select>
              {errors.gender && (
                <span className="error-msg">{errors.gender}</span>
              )}
            </div>
            <div className="form-field">
              <label>Height (cm)</label>
              <input
                type="number"
                value={formData.height}
                onChange={(e) => handleChange("height", e.target.value)}
                placeholder="e.g., 168"
                className={errors.height ? "error" : ""}
              />
            </div>
            <div className="form-field">
              <label>Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={formData.weight}
                onChange={(e) => handleChange("weight", e.target.value)}
                placeholder="e.g., 62.0"
                className={errors.weight ? "error" : ""}
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Vitals & Indicators</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Systolic BP (ap_hi)</label>
              <input
                type="number"
                value={formData.ap_hi}
                onChange={(e) => handleChange("ap_hi", e.target.value)}
                placeholder="e.g., 110"
              />
            </div>
            <div className="form-field">
              <label>Diastolic BP (ap_lo)</label>
              <input
                type="number"
                value={formData.ap_lo}
                onChange={(e) => handleChange("ap_lo", e.target.value)}
                placeholder="e.g., 80"
              />
            </div>
            <div className="form-field">
              <label>Cholesterol</label>
              <select
                value={formData.cholesterol}
                onChange={(e) => handleChange("cholesterol", e.target.value)}>
                <option value="">Select level</option>
                <option value="1">Normal</option>
                <option value="2">Above Normal</option>
                <option value="3">Well Above Normal</option>
              </select>
            </div>
            <div className="form-field">
              <label>Glucose</label>
              <select
                value={formData.gluc}
                onChange={(e) => handleChange("gluc", e.target.value)}>
                <option value="">Select level</option>
                <option value="1">Normal</option>
                <option value="2">Above Normal</option>
                <option value="3">Well Above Normal</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>Lifestyle</h3>
          <div className="form-grid">
            <div className="form-field">
              <label>Smoking</label>
              <select
                value={formData.smoke}
                onChange={(e) => handleChange("smoke", e.target.value)}>
                <option value="">Select</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            <div className="form-field">
              <label>Alcohol</label>
              <select
                value={formData.alco}
                onChange={(e) => handleChange("alco", e.target.value)}>
                <option value="">Select</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
            <div className="form-field">
              <label>Physical Activity</label>
              <select
                value={formData.active}
                onChange={(e) => handleChange("active", e.target.value)}>
                <option value="">Select</option>
                <option value="0">No</option>
                <option value="1">Yes</option>
              </select>
            </div>
          </div>
        </div>

        <button type="submit" className="submit-btn" disabled={isLoading}>
          {isLoading ? "Analyzing..." : "Analyze Clinical Data"}
          <ArrowRight size={18} />
        </button>
      </form>

      {/* RESULT UI */}
      {result && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "#1f2937",
            borderRadius: "12px",
            borderLeft: `6px solid ${result.prediction.includes("Present") ? "#ef4444" : "#10b981"}`,
          }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#f3f4f6" }}>
            {result.model} Results
          </h3>
          <p
            style={{
              margin: "0.5rem 0",
              fontSize: "1.1rem",
              color: result.prediction.includes("Present")
                ? "#fca5a5"
                : "#6ee7b7",
            }}>
            <strong>Diagnosis:</strong> {result.prediction}
          </p>
          <p style={{ margin: "0.5rem 0", color: "#d1d5db" }}>
            <strong>Confidence:</strong> {result.confidence}
          </p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 3. ECG UPLOAD
// ==========================================
const ECGImageUpload = ({ onSubmit, isLoading, result }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [croppedBlob, setCroppedBlob] = useState(null);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/"))
        return setError("Please select a valid image file");
      setError("");
      setSelectedImage(file);
      setCroppedBlob(null);
    }
  };

  const handleSubmit = () => {
    if (!croppedBlob)
      return setError("Please confirm the crop before submitting");
    const formData = new FormData();
    formData.append("ecg_image", croppedBlob, "cropped-ecg.png");
    onSubmit(formData);
  };

  return (
    <div className="ecg-upload-container">
      <div className="upload-section">
        {!selectedImage ? (
          <div className="upload-area">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              style={{ display: "none" }}
            />
            <div
              className="upload-prompt"
              onClick={() => fileInputRef.current?.click()}>
              <Upload size={48} />
              <h3>Upload ECG Image</h3>
              <p>Click to select or drag and drop your ECG image</p>
            </div>
          </div>
        ) : (
          <div className="image-editor">
            <div
              className="editor-header"
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: "1rem",
              }}>
              <h3 style={{ margin: 0 }}>Adjust Crop Edges</h3>
              <button
                onClick={() => {
                  setSelectedImage(null);
                  setCroppedBlob(null);
                }}
                className="change-btn"
                type="button">
                Change Image
              </button>
            </div>
            <ImageCropper
              image={selectedImage}
              onCrop={(blob) => setCroppedBlob(blob)}
            />
          </div>
        )}
      </div>

      {error && (
        <div
          className="error-message"
          style={{ color: "#ef4444", marginTop: "1rem" }}>
          <AlertCircle size={18} /> {error}
        </div>
      )}

      {selectedImage && (
        <button
          onClick={handleSubmit}
          className="submit-btn"
          disabled={isLoading || !croppedBlob}
          type="button"
          style={{ marginTop: "1.5rem", width: "100%" }}>
          {isLoading ? "Analyzing ECG..." : "Analyze ECG Image"}
        </button>
      )}

      {/* RESULT UI */}
      {result && (
        <div
          style={{
            marginTop: "2rem",
            padding: "1.5rem",
            background: "#1f2937",
            borderRadius: "12px",
            borderLeft: `6px solid ${result.prediction.includes("Abnormal") ? "#ef4444" : "#10b981"}`,
          }}>
          <h3 style={{ margin: "0 0 1rem 0", color: "#f3f4f6" }}>
            {result.model} Results
          </h3>
          <p
            style={{
              margin: "0.5rem 0",
              fontSize: "1.1rem",
              color: result.prediction.includes("Abnormal")
                ? "#fca5a5"
                : "#6ee7b7",
            }}>
            <strong>Diagnosis:</strong> {result.prediction}
          </p>
          <p style={{ margin: "0.5rem 0", color: "#d1d5db" }}>
            <strong>Confidence:</strong> {result.confidence}
          </p>
        </div>
      )}
    </div>
  );
};

// ==========================================
// 4. MAIN APP
// ==========================================
export default function HeartDiseasePrediction() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({
    mlp: null,
    ecg: null,
    combined: null,
  });

  const handleMLPSubmit = async (processedData) => {
    setIsLoading(true);
    try {
      // NOTE: Update this URL to your Ngrok URL when testing hosted frontend vs local backend
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE}/api/predict/mlp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(processedData),
      });

      const result = await response.json();
      setResults((prev) => ({ ...prev, mlp: result }));
    } catch (error) {
      console.error("Error:", error);
      alert(
        "Connection failed. Ensure your FastAPI server (or Ngrok tunnel) is running.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleECGSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:8000";

      const response = await fetch(`${API_BASE}/api/predict/ecg`, {
        method: "POST",
        body: formData,
      });

      const result = await response.json();
      setResults((prev) => ({ ...prev, ecg: result }));
    } catch (error) {
      console.error("Error:", error);
      alert("Connection failed.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedMode) {
    return (
      <div className="app-container">
        <header className="app-header">
          <div className="header-content">
            <Heart className="logo-icon" size={32} />
            <h1>CardioPredict AI</h1>
            <p className="subtitle">
              Federated Learning Heart Disease Prediction
            </p>
          </div>
        </header>

        <main className="mode-selection">
          <h2>Select Analysis Mode</h2>
          <div className="mode-cards">
            <div className="mode-card" onClick={() => setSelectedMode("mlp")}>
              <div className="card-icon">
                <Activity size={40} />
              </div>
              <h3>Clinical Data Analysis</h3>
            </div>
            <div className="mode-card" onClick={() => setSelectedMode("ecg")}>
              <div className="card-icon">
                <Upload size={40} />
              </div>
              <h3>ECG Image Analysis</h3>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-content">
          <button
            className="back-btn"
            onClick={() => {
              setSelectedMode(null);
              setResults({ mlp: null, ecg: null, combined: null });
            }}>
            ← Back
          </button>
          <Heart className="logo-icon" size={28} />
          <h1>CardioPredict AI</h1>
        </div>
      </header>

      <main className="analysis-container">
        {selectedMode === "mlp" && (
          <div className="analysis-section">
            <div className="section-header">
              <Activity size={24} />
              <h2>Clinical Data Analysis</h2>
            </div>
            <MLPInputForm
              onSubmit={handleMLPSubmit}
              isLoading={isLoading}
              result={results.mlp}
            />
          </div>
        )}

        {selectedMode === "ecg" && (
          <div className="analysis-section">
            <div className="section-header">
              <Upload size={24} />
              <h2>ECG Image Analysis</h2>
            </div>
            <ECGImageUpload
              onSubmit={handleECGSubmit}
              isLoading={isLoading}
              result={results.ecg}
            />
          </div>
        )}
      </main>
    </div>
  );
}
