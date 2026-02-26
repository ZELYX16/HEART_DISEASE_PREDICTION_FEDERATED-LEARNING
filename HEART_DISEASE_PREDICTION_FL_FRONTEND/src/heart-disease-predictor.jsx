import React, { useState, useRef, useImperativeHandle } from "react";
import {
  Activity,
  Upload,
  ChevronRight,
  ArrowRight,
  Scan,
  Database,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Info,
  Menu,
  X,
  Plus,
  ArrowLeft,
  Crop
} from "lucide-react";
import "./styles.css";
import "./cropper-styles.css";

// ==========================================
// 1. BRANDING COMPONENTS
// ==========================================
const CardioLogo = ({ size = 32 }) => (
  <div className="cardio-logo" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 40 40" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      style={{ filter: 'drop-shadow(0 0 8px var(--glow-primary))' }}
    >
      <rect width="40" height="40" rx="10" fill="url(#logo-grad)" />
      <path 
        d="M10 21C10 21 12.5 21 14 17L17 27L21 12L24 21H30" 
        stroke="white" 
        strokeWidth="3" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className="pulse-path"
      />
      <circle cx="10" cy="21" r="2" fill="white" />
      <circle cx="30" cy="21" r="2" fill="white" />
      <defs>
        <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF3366" />
          <stop offset="1" stopColor="#9D50BB" />
        </linearGradient>
      </defs>
    </svg>
    <span style={{ 
      fontSize: '1.4rem', 
      fontWeight: 800, 
      letterSpacing: '-0.02em',
      fontFamily: 'var(--font-display)',
      background: 'linear-gradient(to right, #fff, #a5b4fc)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent'
    }}>
      CardioFL
    </span>
  </div>
);

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
            <div className="image-wrapper">
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
// 2. MLP INPUT FORM
// ==========================================
const MLPInputForm = React.forwardRef(
  ({ onSubmit, isLoading, result, hideSubmit }, ref) => {
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
      if (!formData.age || formData.age < 1 || formData.age > 120)
        newErrors.age = "Age must be between 1 - 120";
      if (
        !formData.gender ||
        (formData.gender !== "1" && formData.gender !== "2")
      )
        newErrors.gender = "Gender must be (female) or (male)";
      if (!formData.height || formData.height < 100 || formData.height > 250)
        newErrors.height = "Height must be between 100-250 cm";
      if (!formData.weight || formData.weight < 1 || formData.weight > 200)
        newErrors.weight = "Weight must be between 1-200 kg";
      if (!formData.ap_hi || formData.ap_hi < 50 || formData.ap_hi > 250)
        newErrors.ap_hi = "Systolic BP must be between 50-250 mmHg";
      if (!formData.ap_lo || formData.ap_lo < 30 || formData.ap_lo > 180)
        newErrors.ap_lo = "Diastolic BP must be between 30-180 mmHg";
      if (
        formData.ap_hi &&
        formData.ap_lo &&
        Number(formData.ap_hi) <= Number(formData.ap_lo)
      )
        newErrors.ap_hi = "Systolic BP must be higher than Diastolic BP";
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
      
      if (Object.keys(newErrors).length > 0) {
        // Find the first error field and scroll to it
        const firstErrorField = Object.keys(newErrors)[0];
        const element = document.getElementById(`field-${firstErrorField}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.focus();
        }
      }
      
      return Object.keys(newErrors).length === 0;
    };

    const getProcessedData = () => {
      if (validateForm()) {
        return {
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
      }
      return null;
    };

    useImperativeHandle(ref, () => ({ getValidatedData: getProcessedData }));

    const handleSubmit = (e) => {
      e.preventDefault();
      const data = getProcessedData();
      if (data && onSubmit) onSubmit(data);
    };

    const handleChange = (field, value) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
    };

    // STRICT CHECK: Determine if the result is Bad (Red) or Good (Green)
    const isBadResult = result && result.prediction === "Heart Disease Present";

    const resultRef = useRef(null);

    React.useEffect(() => {
      if (result && resultRef.current) {
        setTimeout(() => {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }, [result]);

    return (
      <div>
        <form onSubmit={handleSubmit} className="mlp-form">
          <div className="form-section">
            <h3>Basic Information</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="field-age">Age</label>
                <input
                  id="field-age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => handleChange("age", e.target.value)}
                  placeholder="e.g.,18"
                  className={errors.age ? "error" : ""}
                />
                {errors.age && <span className="error-msg">{errors.age}</span>}
              </div>
              <div className="form-field">
                <label htmlFor="field-gender">Gender</label>
                <select
                  id="field-gender"
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
                <label htmlFor="field-height">Height (cm)</label>
                <input
                  id="field-height"
                  type="number"
                  value={formData.height}
                  onChange={(e) => handleChange("height", e.target.value)}
                  placeholder="e.g., 168"
                  className={errors.height ? "error" : ""}
                />
              </div>
              <div className="form-field">
                <label htmlFor="field-weight">Weight (kg)</label>
                <input
                  id="field-weight"
                  type="number"
                  step="0.1"
                  value={formData.weight}
                  onChange={(e) => handleChange("weight", e.target.value)}
                  placeholder="e.g., 60"
                  className={errors.weight ? "error" : ""}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Blood Pressure</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="field-ap_hi">Systolic BP (mmHg)</label>
                <input
                  id="field-ap_hi"
                  type="number"
                  value={formData.ap_hi}
                  onChange={(e) => handleChange("ap_hi", e.target.value)}
                  placeholder="e.g., 110"
                  className={errors.ap_hi ? "error" : ""}
                />
                {errors.ap_hi && (
                  <span className="error-msg">{errors.ap_hi}</span>
                )}
              </div>
              <div className="form-field">
                <label htmlFor="field-ap_lo">Diastolic BP (mmHg)</label>
                <input
                  id="field-ap_lo"
                  type="number"
                  value={formData.ap_lo}
                  onChange={(e) => handleChange("ap_lo", e.target.value)}
                  placeholder="e.g., 80"
                  className={errors.ap_lo ? "error" : ""}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Medical Indicators</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="field-cholesterol">Cholesterol Level</label>
                <select
                  id="field-cholesterol"
                  value={formData.cholesterol}
                  onChange={(e) => handleChange("cholesterol", e.target.value)}
                  className={errors.cholesterol ? "error" : ""}>
                  <option value="">Select level</option>
                  <option value="1">Normal</option>
                  <option value="2">Above Normal</option>
                  <option value="3">Well Above Normal</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="field-gluc">Glucose Level</label>
                <select
                  id="field-gluc"
                  value={formData.gluc}
                  onChange={(e) => handleChange("gluc", e.target.value)}
                  className={errors.gluc ? "error" : ""}>
                  <option value="">Select level</option>
                  <option value="1">Normal</option>
                  <option value="2">Above Normal</option>
                  <option value="3">Well Above Normal</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>Lifestyle Factors</h3>
            <div className="form-grid">
              <div className="form-field">
                <label htmlFor="field-smoke">Smoking</label>
                <select
                  id="field-smoke"
                  value={formData.smoke}
                  onChange={(e) => handleChange("smoke", e.target.value)}>
                  <option value="">Select</option>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="field-alco">Alcohol Intake</label>
                <select
                  id="field-alco"
                  value={formData.alco}
                  onChange={(e) => handleChange("alco", e.target.value)}>
                  <option value="">Select</option>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
              <div className="form-field">
                <label htmlFor="field-active">Physical Activity</label>
                <select
                  id="field-active"
                  value={formData.active}
                  onChange={(e) => handleChange("active", e.target.value)}>
                  <option value="">Select</option>
                  <option value="0">No</option>
                  <option value="1">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {!hideSubmit && (
            <button type="submit" className="submit-btn" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="loader-spinner"></div> Analyzing...
                </>
              ) : (
                <>
                  Analyze Clinical Data <ArrowRight size={18} />
                </>
              )}
            </button>
          )}
        </form>

        {!hideSubmit && result && (
          <div className={`result-card ${isBadResult ? "bad" : "good"}`}>
            <h3 className="result-title">
              {result.model} Results
            </h3>
            <div className="result-detail">
              <strong>Diagnosis:</strong>
              <span className={`diagnosis-text ${isBadResult ? "bad-text" : "good-text"}`}>
                {result.prediction}
              </span>
            </div>
            <div className="result-detail">
              <strong>Confidence:</strong>
              <span className="confidence-text">{result.confidence}</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

// ==========================================
// 3. ECG IMAGE UPLOAD COMPONENT
// ==========================================
const ECGImageUpload = React.forwardRef(
  ({ onSubmit, onReset, isLoading, result, hideSubmit }, ref) => {
    const [selectedImage, setSelectedImage] = useState(null);
    const [croppedBlob, setCroppedBlob] = useState(null);
    const [error, setError] = useState("");
    const fileInputRef = useRef(null);

    const handleImageSelect = (e) => {
      const file = e.target.files[0];
      if (file) {
        if (!file.type.startsWith("image/")) {
          setError("Please select a valid image file");
          return;
        }
        setError("");
        setSelectedImage(file);
        setCroppedBlob(null);
      }
    };

    const handleCrop = (blob) => {
      setCroppedBlob(blob);
      setError("");
    };

    useImperativeHandle(ref, () => ({
      getValidatedData: () => {
        if (!croppedBlob) {
          setError("Please confirm the crop before submitting");
          return null;
        }
        return croppedBlob;
      },
    }));

    const handleSubmit = () => {
      if (!croppedBlob) {
        setError("Please confirm the crop before submitting");
        return;
      }
      const formData = new FormData();
      formData.append("ecg_image", croppedBlob, "cropped-ecg.png");
      if (onSubmit) onSubmit(formData);
    };

    const isBadResult = result && result.prediction.includes("Abnormal");

    const resultRef = useRef(null);

    React.useEffect(() => {
      if (result && resultRef.current) {
        setTimeout(() => {
          resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 100);
      }
    }, [result]);
    
    // Also scroll to error if there is one
    const errorRef = useRef(null);
    React.useEffect(() => {
      if (error && errorRef.current) {
        errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, [error]);

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
                onClick={() => fileInputRef.current?.click()}
                role="button"
                tabIndex={0}>
                <Upload size={48} />
                <h3>Upload ECG Image</h3>
                <p>Click to select or drag and drop your ECG image</p>
                <span className="file-types">Supports: JPG, PNG, JPEG</span>
              </div>
            </div>
          ) : (
            <div className="image-editor">
              <div className="editor-header">
                <h3>Adjust Crop Edges</h3>
                <button
                  onClick={() => {
                    setSelectedImage(null);
                    setCroppedBlob(null);
                    setError("");
                    if (onReset) onReset();
                  }}
                  className="change-btn"
                  type="button">
                  Change Image
                </button>
              </div>
              <ImageCropper image={selectedImage} onCrop={handleCrop} />
            </div>
          )}
        </div>

        {error && (
          <div
            ref={errorRef}
            className="error-message"
            style={{ color: "#ef4444", marginTop: "1rem" }}>
            <AlertCircle size={18} /> {error}
          </div>
        )}

        {!hideSubmit && selectedImage && (
          <button
            onClick={handleSubmit}
            className="submit-btn"
            disabled={isLoading || !croppedBlob}
            type="button"
            style={{ marginTop: "1.5rem", width: "100%" }}>
            {isLoading ? (
              <>
                <div className="loader-spinner"></div> Analyzing ECG...
              </>
            ) : (
              <>
                Analyze ECG Image <ArrowRight size={18} />
              </>
            )}
          </button>
        )}

        {!hideSubmit && result && (
          <div ref={resultRef} className={`result-card ${isBadResult ? "bad" : "good"}`}>
            <h3 className="result-title">
              {result.model} Results
            </h3>
            <div className="result-detail">
              <strong>Diagnosis:</strong>
              <span className={`diagnosis-text ${isBadResult ? "bad-text" : "good-text"}`}>
                {result.prediction}
              </span>
            </div>
            <div className="result-detail">
              <strong>Confidence:</strong>
              <span className="confidence-text">{result.confidence}</span>
            </div>
          </div>
        )}
      </div>
    );
  },
);

// ==========================================
// 4. MAIN APPLICATION
// ==========================================
export default function HeartDiseasePrediction() {
  const [selectedMode, setSelectedMode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState({
    mlp: null,
    ecg: null,
    combined: null,
  });

  const mlpFormRef = useRef(null);
  const ecgFormRef = useRef(null);

  const handleApiError = async (response) => {
    const errorData = await response.json();
    let errorMsg = errorData.detail || "An unknown server error occurred";
    if (Array.isArray(errorMsg)) {
      errorMsg = errorMsg
        .map((err) => `${err.loc[err.loc.length - 1]}: ${err.msg}`)
        .join("\n");
    }
    throw new Error(errorMsg);
  };

  const handleMLPSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const isProd = import.meta.env.PROD;
      const API_BASE = import.meta.env.VITE_API_URL || (isProd ? "https://bkarthy-cardiofl-backend.hf.space" : "http://localhost:8000");
      const response = await fetch(`${API_BASE}/api/predict/mlp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) await handleApiError(response);
      const result = await response.json();
      setResults((prev) => ({ ...prev, mlp: result }));
    } catch (error) {
      alert(`Validation/Server Error:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleECGSubmit = async (formData) => {
    setIsLoading(true);
    try {
      const isProd = import.meta.env.PROD;
      const API_BASE = import.meta.env.VITE_API_URL || (isProd ? "https://bkarthy-cardiofl-backend.hf.space" : "http://localhost:8000");
      const response = await fetch(`${API_BASE}/api/predict/ecg`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) await handleApiError(response);
      const result = await response.json();
      setResults((prev) => ({ ...prev, ecg: result }));
    } catch (error) {
      alert(`Validation/Server Error:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCombinedSubmit = async () => {
    const mlpData = mlpFormRef.current?.getValidatedData();
    const ecgBlob = ecgFormRef.current?.getValidatedData();

    if (!mlpData || !ecgBlob) {
      if (!ecgBlob && mlpData)
        alert("Please upload and crop an ECG image to proceed.");
      return;
    }

    setIsLoading(true);
    try {
      const isProd = import.meta.env.PROD;
      const API_BASE = import.meta.env.VITE_API_URL || (isProd ? "https://bkarthy-cardiofl-backend.hf.space" : "http://localhost:8000");
      const formData = new FormData();
      formData.append("clinical_data", JSON.stringify(mlpData));
      formData.append("ecg_image", ecgBlob, "cropped-ecg.png");

      const response = await fetch(`${API_BASE}/api/predict/combined`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) await handleApiError(response);

      const result = await response.json();
      setResults((prev) => ({ ...prev, combined: result }));
    } catch (error) {
      alert(`Validation/Server Error:\n${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const isBadCombined =
    results.combined && results.combined.final_diagnosis.includes("High Risk");
  const isBadMLP =
    results.combined &&
    results.combined.details.mlp_contribution.includes("High Risk");
  const isBadECG =
    results.combined &&
    results.combined.details.cnn_contribution.includes("Abnormal");

  const combinedResultRef = useRef(null);

  React.useEffect(() => {
    if (results.combined && combinedResultRef.current) {
      setTimeout(() => {
        combinedResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 100);
    }
  }, [results.combined]);

  if (!selectedMode) {
    return (
      <div className="app-container">
        <header className="app-header">
          <CardioLogo size={40} />
          <div className="header-badge">Federated Learning Neural System</div>
        </header>

        <main className="hero-section">
          <h1 className="hero-title">
            Predictive Cardiology 
            <span className="accent-text"> Redefined through AI</span>
          </h1>
          <p className="hero-subtitle">
            Leveraging federated learning and deep clinical metrics to provide
            accurate heart disease risk assessments. Choose your diagnostic pathway below.
          </p>
          <div className="mode-cards">
            <div
              className="mode-card"
              onClick={() => setSelectedMode("mlp")}
              role="button"
              tabIndex={0}>
              <div className="card-icon">
                <Activity size={40} />
              </div>
              <h3>Clinical Data Analysis</h3>
              <p>
                Use MLP model with vitals, blood pressure, and lifestyle factors
              </p>
              <div className="card-features">
                <span>• Age & Gender</span>
                <span>• Blood Pressure</span>
                <span>• Cholesterol & Glucose</span>
                <span>• Lifestyle Factors</span>
              </div>
            </div>

            <div
              className="mode-card"
              onClick={() => setSelectedMode("ecg")}
              role="button"
              tabIndex={0}>
              <div className="card-icon">
                <Upload size={40} />
              </div>
              <h3>ECG Image Analysis</h3>
              <p>
                Upload and analyze electrocardiogram images using deep learning
              </p>
              <div className="card-features">
                <span>• Image Upload</span>
                <span>• Edge Adjustment</span>
                <span>• Deep Learning Analysis</span>
                <span>• Visual Diagnosis</span>
              </div>
            </div>

            <div
              className="mode-card"
              onClick={() => setSelectedMode("both")}
              role="button"
              tabIndex={0}>
              <div className="card-icon">
                <CheckCircle2 size={40} />
              </div>
              <h3>Comprehensive Analysis</h3>
              <p>
                Combine both clinical data and ECG imaging for complete
                assessment
              </p>
              <div className="card-features">
                <span>• Clinical Data</span>
                <span>• ECG Imaging</span>
                <span>• Dual Model Prediction</span>
                <span>• Enhanced Accuracy</span>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <CardioLogo size={32} />
        <button
          className="back-btn"
          onClick={() => {
            setSelectedMode(null);
            setResults({ mlp: null, ecg: null, combined: null });
          }}>
          <ArrowLeft size={18} /> Back to Dashboard
        </button>
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
              onReset={() => setResults(prev => ({ ...prev, ecg: null }))}
              isLoading={isLoading}
              result={results.ecg}
            />
          </div>
        )}

        {selectedMode === "both" && (
          <div className="combined-mode-wrapper">
            <div className="analysis-section">
              <div className="section-header">
                <Activity size={24} />
                <h2>Clinical Data Analysis</h2>
              </div>
              <MLPInputForm ref={mlpFormRef} hideSubmit={true} />
            </div>

            <div className="analysis-section">
              <div className="section-header">
                <Upload size={24} />
                <h2>ECG Image Analysis</h2>
              </div>
              <ECGImageUpload 
                ref={ecgFormRef} 
                hideSubmit={true} 
                onReset={() => setResults(prev => ({ ...prev, combined: null }))}
              />
            </div>

            <div
              className="combined-actions"
              style={{
                marginTop: "2rem",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
              }}>
              <button
                onClick={handleCombinedSubmit}
                className="submit-btn"
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "1.2rem",
                  fontSize: "1.1rem",
                  display: "flex",
                  justifyContent: "center",
                }}>
                {isLoading ? (
                  <>
                    <div className="loader-spinner"></div> Running Comprehensive Analysis...
                  </>
                ) : (
                  <>
                    Submit Comprehensive Analysis <ArrowRight size={20} style={{ marginLeft: "10px" }} />
                  </>
                )}
              </button>

              {results.combined && (
                <div ref={combinedResultRef} className={`result-card ${isBadCombined ? "bad" : "good"}`}>
                  <h3 className="result-title">
                    {results.combined.model} Results
                  </h3>

                  <div style={{ marginBottom: "1.5rem", paddingBottom: "1.5rem", borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
                    <div className="result-detail">
                      <strong>Final Diagnosis:</strong>
                      <span className={`diagnosis-text ${isBadCombined ? "bad-text" : "good-text"}`}>
                        {results.combined.final_diagnosis}
                      </span>
                    </div>
                    <div className="result-detail" style={{ marginTop: "1rem" }}>
                      <strong>Overall Confidence:</strong>
                      <span className="confidence-text">
                        {results.combined.overall_confidence}
                      </span>
                      <span style={{ fontSize: "0.9rem", color: "var(--text-muted)", marginTop: "0.5rem" }}>
                        Driven by: {results.combined.primary_driver}
                      </span>
                    </div>
                  </div>

                  <p style={{ margin: "0 0 1rem 0", color: "var(--text-muted)", fontSize: "0.9rem", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: "600" }}>
                    Individual Model Breakdown
                  </p>
                  
                  <div style={{ display: "grid", gap: "1.5rem", gridTemplateColumns: "1fr 1fr" }}>
                    <div style={{
                        padding: "1.5rem",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "16px",
                        border: results.combined.primary_driver.includes("MLP")
                          ? "1px solid var(--glow-secondary)"
                          : "1px solid rgba(255,255,255,0.05)",
                        boxShadow: results.combined.primary_driver.includes("MLP")
                          ? "inset 0 0 20px rgba(0, 210, 255, 0.1)"
                          : "none"
                      }}>
                      <div className="result-detail" style={{ margin: 0 }}>
                        <strong style={{ marginBottom: "0.5rem" }}>Clinical Contribution:</strong>
                        <span className={`diagnosis-text ${isBadMLP ? "bad-text" : "good-text"}`} style={{ fontSize: "1.4rem" }}>
                          {results.combined.details.mlp_contribution}
                        </span>
                        <span className="confidence-text" style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                          Conf: {results.combined.details.mlp_confidence}
                        </span>
                      </div>
                    </div>

                    <div style={{
                        padding: "1.5rem",
                        background: "rgba(0,0,0,0.2)",
                        borderRadius: "16px",
                        border: results.combined.primary_driver.includes("ECG")
                          ? "1px solid var(--glow-secondary)"
                          : "1px solid rgba(255,255,255,0.05)",
                        boxShadow: results.combined.primary_driver.includes("ECG")
                          ? "inset 0 0 20px rgba(0, 210, 255, 0.1)"
                          : "none"
                      }}>
                      <div className="result-detail" style={{ margin: 0 }}>
                        <strong style={{ marginBottom: "0.5rem" }}>ECG Contribution:</strong>
                        <span className={`diagnosis-text ${isBadECG ? "bad-text" : "good-text"}`} style={{ fontSize: "1.4rem" }}>
                          {results.combined.details.cnn_contribution}
                        </span>
                        <span className="confidence-text" style={{ fontSize: "0.9rem", marginTop: "0.5rem" }}>
                          Conf: {results.combined.details.cnn_confidence}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
