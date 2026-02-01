# Heart Disease Predictor Frontend

A React-based frontend for heart disease prediction using federated learning with MLP and ECG image analysis models.

## 🚀 Quick Start (3 Steps)

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Update backend URL in `.env` file:**
   ```env
   VITE_API_URL=http://localhost:5000
   ```

3. **Start the app:**
   ```bash
   npm run dev
   ```

   Open http://localhost:3000 in your browser!

---

## 📖 Full Setup Guide

**New to this?** → Read `SETUP_INSTRUCTIONS.md` for detailed step-by-step instructions!

---

## ✨ Features

### Three Analysis Modes:
- **Clinical Data Analysis** - MLP model with 11 health parameters
- **ECG Image Analysis** - Deep learning on ECG images with resize capability
- **Comprehensive** - Both models combined

### Smart Validation:
- Real-time form validation
- Range checks for all inputs
- Logical consistency (e.g., systolic > diastolic BP)
- File type and size validation

### Clinical Data Inputs (MLP):
Based on cardiovascular dataset fields:
- Age (days), Gender, Height (cm), Weight (kg)
- Blood Pressure: Systolic & Diastolic
- Cholesterol Level, Glucose Level
- Lifestyle: Smoking, Alcohol, Physical Activity

### ECG Image Features:
- Upload images (JPG, PNG, JPEG, max 10MB)
- Interactive resize slider (25% - 200%)
- Real-time canvas preview
- Sends resized PNG to backend

---

## 🛠️ Tech Stack

- **React 18** - UI framework
- **Vite** - Build tool
- **Lucide React** - Icons
- **Canvas API** - Image resizing

---

## 📁 Project Structure

```
heart-disease-predictor/
├── src/
│   ├── main.jsx                          # Entry point
│   └── heart-disease-predictor.jsx       # Main component
├── .env                                   # Backend config
├── index.html                             # HTML template
├── package.json                           # Dependencies
├── vite.config.js                         # Vite config
└── SETUP_INSTRUCTIONS.md                  # Detailed guide
```

---

## 🔧 Configuration

### Backend URL

Update `.env` file:
```env
VITE_API_URL=http://your-backend-url:port
```

The app uses Vite's environment variables (`import.meta.env.VITE_API_URL`).

### API Endpoints

The app expects these endpoints:

**MLP Model:**
```
POST /api/predict/mlp
Content-Type: application/json

Body: {
  "age": 18393,
  "gender": 2,
  "height": 168,
  "weight": 62.0,
  "ap_hi": 110,
  "ap_lo": 80,
  "cholesterol": 1,
  "gluc": 1,
  "smoke": 0,
  "alco": 0,
  "active": 1
}
```

**ECG Model:**
```
POST /api/predict/ecg
Content-Type: multipart/form-data

Fields:
- ecg_image: File (PNG blob)
- scale: Number (resize percentage)
```

---

## 🧪 Testing Without Backend

You can test the UI without a backend:

1. Start the app: `npm run dev`
2. Select any mode
3. Fill in the form
4. Submit (will show connection error, but validates the UI)

---

## 🐛 Troubleshooting

### Port 3000 in use?
```bash
npm run dev -- --port 3001
```

### Dependencies not found?
```bash
npm install
```

### CORS errors?
Configure CORS on your backend to allow `http://localhost:3000`

**Flask:**
```python
from flask_cors import CORS
CORS(app, origins=["http://localhost:3000"])
```

**FastAPI:**
```python
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### More issues?
See `SETUP_INSTRUCTIONS.md` for detailed troubleshooting!

---

## 📊 Input Validation Rules

| Field | Range | Values |
|-------|-------|--------|
| age | 1000-30000 days | ~3-82 years |
| gender | 1 or 2 | 1=Female, 2=Male |
| height | 100-250 cm | Height in cm |
| weight | 30-300 kg | Weight in kg |
| ap_hi | 50-250 mmHg | Systolic BP |
| ap_lo | 30-180 mmHg | Diastolic BP |
| cholesterol | 1, 2, 3 | 1=Normal, 2=Above, 3=Well Above |
| gluc | 1, 2, 3 | 1=Normal, 2=Above, 3=Well Above |
| smoke | 0, 1 | 0=No, 1=Yes |
| alco | 0, 1 | 0=No, 1=Yes |
| active | 0, 1 | 0=No, 1=Yes |

---

## 🌐 Commands

```bash
# Development
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm run preview      # Preview production build

# Custom port
npm run dev -- --port 3001

# Network access (access from other devices)
npm run dev -- --host
```

---

## 🎨 Design

- Dark medical-professional theme
- Gradient accents (blue/pink)
- Smooth animations
- Fully responsive
- Accessible color contrasts

---

## 📄 License

MIT License - Free to use and modify

---

## 🆘 Need Help?

1. **Setup issues?** → Read `SETUP_INSTRUCTIONS.md`
2. **API integration?** → Check backend CORS configuration
3. **Still stuck?** → Check browser console (F12) for errors

---

**Built with ❤️ for federated learning research**
