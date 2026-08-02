# CardioFL — Predictive Cardiology Redefined through AI

A privacy-preserving heart disease risk assessment platform built with **Federated Learning**, combining structured clinical data and ECG imaging through a dual-model architecture — trained collaboratively across clients **without any raw patient data ever leaving its source**.

---

## 🩺 Overview

Centralized machine learning in healthcare faces a fundamental problem: patient data is sensitive, siloed, and often legally restricted from being pooled into a single dataset. CardioFL simulates a **federated learning** environment where multiple clients (e.g. hospitals or devices) collaboratively train shared models on their local data, and only **model updates** — never raw patient data — are exchanged and aggregated.

The platform offers three diagnostic pathways so users can assess heart disease risk using whichever data they have available — clinical vitals, ECG imaging, or both combined for higher-confidence predictions.

---

## ✨ Key Features

CardioFL offers **three diagnostic pathways**:

- 🫀 **Clinical Data Analysis** — an MLP (multi-layer perceptron) model trained on structured clinical inputs: age, gender, blood pressure, cholesterol & glucose levels, and lifestyle factors
- 📈 **ECG Image Analysis** — deep learning-based analysis of uploaded ECG images (built on **EfficientNetB3**), including image upload, edge adjustment/preprocessing, and visual diagnosis output
- 🔬 **Comprehensive Analysis** — combines both clinical data and ECG imaging via **dual model prediction**, fusing both models' outputs for enhanced diagnostic accuracy


## 🏗️ Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Client 1   │     │  Client 2   │     │  Client N   │
│ (local ECG  │     │ (local ECG  │     │ (local ECG  │
│   data)     │     │   data)     │     │   data)     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │  local model       │  local model       │  local model
       │  updates only      │  updates only      │  updates only
       ▼                    ▼                    ▼
              ┌───────────────────────────┐
              │   Flower (Flwr) Server     │
              │  Federated Aggregation     │
              │  (e.g. FedAvg strategy)    │
              └─────────────┬──────────────┘
                            ▼
              ┌───────────────────────────┐
              │  Global EfficientNetB3    │
              │       Model               │
              └───────────────────────────┘
```

Each client trains locally on its own partition of the data; only model weights/gradients are shared with the central server for aggregation, which then redistributes the improved global model back to clients for the next round.

---

## 🛠️ Tech Stack

| Component               | Technology                              |
|---------------------------|-------------------------------------------|
| Federated Learning        | Flower (Flwr)                              |
| Clinical Data Model       | MLP (Multi-Layer Perceptron) — scikit-learn |
| ECG Image Model           | EfficientNetB3 — PyTorch / torchvision     |
| Backend Framework         | FastAPI + Uvicorn                          |
| Data Handling             | pandas, numpy, scipy, joblib               |
| Image Processing          | Pillow, OpenCV (opencv-python-headless)    |
| Validation                | Pydantic                                   |
| Config                    | python-dotenv                              |
| Backend Language          | Python                                     |
| Frontend                  | React.js
| Data                      | Clinical vitals (age, gender, BP, cholesterol, glucose, lifestyle) + ECG images |

---


## 📊 Dataset

CardioFL uses two categories of input data:

- **Clinical data**: age, gender, blood pressure, cholesterol & glucose levels, lifestyle factors
- **ECG imaging data**: uploaded ECG images processed for visual diagnosis


---

## 📄 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.

---

## 👤 Author

**B Karthikeyan**
Computer Science Undergraduate | AI/ML & Full-Stack Development
[LinkedIn](https://www.linkedin.com/in/bkarthikeyan16/)
