<div align="center">

# 🧬 AIRA — AI Research & Analysis Platform
### *Front-End*

**AI-assisted clinical decision support for cancer diagnosis, prognosis, and treatment planning.**

[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-7-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![React Router](https://img.shields.io/badge/React_Router-v7-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](https://www.docker.com)

</div>

---

## 📋 Table of Contents

- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Page Routes](#-page-routes)
- [Data Flow](#-data-flow)
- [Docker Deployment](#-docker-deployment)
- [Clinical Disclaimer](#️-clinical-disclaimer)

---

## 🔭 Overview

AIRA (AI Research & Analysis) is a clinical decision-support web application developed as part of the **PRO-STEP Research Programme at Universitas Multimedia Nusantara (UMN)**. It bridges the gap between trained machine learning models and clinical practice by providing an intuitive interface for:

- **Cancer staging diagnosis** from multi-modal biological data (gene expression, miRNA, methylation, radiomic, tabular)
- **Prognosis prediction** for survival and disease progression
- **Treatment recommendation** support
- **Medical news** aggregation for oncology updates

The front-end communicates exclusively through a **Node.js API Gateway** — it never calls the Python FastAPI inference service directly. All model selection, file routing, and validation logic is handled server-side.

---

## 🏗 System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  AIRA Front-End (React)                  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │Diagnosis │  │Prognosis │  │Treatment │  │  News  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
│       └─────────────┴─────────────┴─────────────┘       │
│                   Axios / fetch (VITE_AI_BACKEND_URL)    │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP  (port 8001)
                             ▼
┌─────────────────────────────────────────────────────────┐
│              API Gateway  (Node.js / Express)            │
│  • Validates & routes requests via DB metadata           │
│  • Multipart forwarding to AI service                    │
│  • Sync  POST /cancers/:slug/predict                     │
│  • Async POST /cancers/:slug/predict-async               │
│  • Poll  GET  /prediction-result/:job_id                 │
└────────────────────────────┬────────────────────────────┘
                             │ HTTP  (port 8000)
                             ▼
┌─────────────────────────────────────────────────────────┐
│           AI Inference Service  (Python / FastAPI)        │
│  • scikit-learn / XGBoost / TensorFlow models            │
│  • Supported cancer types:                               │
│      Prostate · Breast · Bladder                         │
│      Lung Adenocarcinoma · Kidney Papillary              │
│  • Data types: GENE · miRNA · METHYL · RADIOMIC          │
└─────────────────────────────────────────────────────────┘
```

### Async Job Flow

Long-running AI inferences (e.g. large radiomic models) use a non-blocking async pattern:

```
Upload page  ──► POST /predict-async ──► job_id (202 Accepted)
     │                                        │
     │  sessionStorage saves job metadata     │
     │                                        ▼
     └──── AsyncJobPanel polls ──► GET /prediction-result/:job_id
                                        │
                              ┌─────────┴──────────┐
                          processing           completed / failed
                              │                    │
                           poll again        navigate to Results
```

Job metadata is persisted in `sessionStorage` (survives hard-refresh, auto-expires in 24 h, wiped on tab close).

---

## ✨ Features

### 🔬 Diagnosis
- **3-step wizard**: Parameters → Upload → Results
- Dynamic cancer type and AI feature selection (loaded live from API)
- Supports both **synchronous** and **asynchronous** prediction modes
- Real-time job status polling with `AsyncJobPanel`
- Results page with:
  - Verified AI output (Predicted Stage, Confidence %)
  - Top contributing biomarkers with importance bars
  - **PDF export** (jsPDF) — branded A4 report with disclaimer sections

### 📈 Prognosis
- Single and multi-file upload modes
- Survival/progression prediction output

### 💊 Treatment
- Single and multi-file upload modes
- Treatment suitability scoring

### 📰 News
- Medical oncology news feed from CMS
- Detail view per article

### 🎨 UX & Accessibility
- Mobile-first responsive layout (breakpoints: `xs`, `sm`, `lg`)
- Touch-target compliance (`min-h-[44px]` on all interactive elements)
- `animate-fadeIn` transitions throughout
- Clear distinction between **verified AI output** and **simulated placeholder content**
- Breadcrumb navigation on all sub-pages

---

## 🛠 Tech Stack

| Category | Library | Version |
|---|---|---|
| UI Framework | React | 19 |
| Language | TypeScript | ~5.8 |
| Build Tool | Vite | 7 |
| Styling | Tailwind CSS | v4 |
| Routing | React Router DOM | 7 |
| Animations | Framer Motion | 12 |
| Component Primitives | Radix UI (`@radix-ui/react-slot`) | latest |
| Icons | Lucide React + React Icons | latest |
| HTTP Client | Axios + native `fetch` | latest |
| PDF Generation | jsPDF | 3 |
| Canvas Capture | html2canvas | 1.4 |
| Class Utilities | clsx + tailwind-merge + cva | latest |

---

## 📁 Project Structure

```
src/
├── components/
│   ├── diagnosis/
│   │   └── AsyncJobPanel.tsx      # Live polling UI for async jobs
│   ├── home/
│   │   ├── HeroSection.tsx
│   │   ├── DiagnosisFeature.tsx
│   │   ├── PrognosisFeature.tsx
│   │   ├── TreatmentFeature.tsx
│   │   ├── DiagnosisCTA.tsx
│   │   ├── FeatureBox.tsx
│   │   ├── InformationSection.tsx
│   │   ├── IntroductionSection.tsx
│   │   └── SocietySection.tsx
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── Footer.tsx
│   └── ui/                        # shadcn/ui primitives
│       ├── button.tsx
│       └── card.tsx
│
├── models/
│   ├── diagnosis-model.ts         # DTO types + data transformation
│   └── news-model.ts
│
├── pages/
│   ├── home/HomePage.tsx
│   ├── diagnosis/
│   │   ├── DiagnosisPage.tsx      # Step 1 — Parameter selection
│   │   ├── UploadDiagnosis.tsx    # Step 2 — File upload + async handling
│   │   ├── UploadDiagnosisMulti.tsx
│   │   └── ResultDiagnosis.tsx    # Step 3 — Results + PDF export
│   ├── prognosis/
│   │   ├── PrognosisPage.tsx
│   │   ├── UploadPrognosis.tsx
│   │   ├── UploadPrognosisMulti.tsx
│   │   └── ResultPrognosis.tsx
│   ├── treatment/
│   │   ├── TreatmentPage.tsx
│   │   ├── UploadTreatment.tsx
│   │   ├── UploadTreatmentMulti.tsx
│   │   └── ResultTreatment.tsx
│   └── news/
│       ├── NewsPage.tsx
│       └── NewsDetail.tsx
│
├── repository/
│   ├── diagnosis-repository.ts    # Raw API calls — NO data transformation
│   └── news-repository.ts
│
├── utils/
│   └── async-job-store.ts         # sessionStorage helpers for async jobs
│
├── lib/
│   └── utils.ts                   # cn() helper (clsx + tailwind-merge)
│
├── App.tsx                        # Route definitions
└── main.tsx
```

### Architectural Layers

```
┌────────────────┐
│  Page / View   │  UI, state, navigation
├────────────────┤
│     Model      │  Type definitions, data mapping/transformation
├────────────────┤
│  Repository    │  Raw fetch/axios calls — returns raw Response or any[]
└────────────────┘
```

The **repository layer never transforms data**. All mapping from raw API shapes to typed DTOs happens in the model layer. This keeps API consumers decoupled from the wire format.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 20
- **npm** ≥ 10
- API Gateway running on port `8001` (see [cancer-gateway](../cancer-gateway))

### Installation

```bash
# Clone & install
git clone <repo-url>
cd front-end-AIRA
npm install
```

### Development

```bash
npm run dev
```

App starts at **http://localhost:5173**

### Build

```bash
npm run build        # output → dist/
npm run preview      # preview production build locally
```

### Lint

```bash
npm run lint
```

---

## 🔧 Environment Variables

Create a `.env` file in the project root:

```env
# Base URL of the API Gateway (Node.js/Express)
VITE_AI_BACKEND_URL=http://localhost:8001

# Base URL of the CMS / news backend
VITE_CMS_URL=http://localhost:8000
```

> ⚠️ Vite only exposes variables prefixed with `VITE_` to the browser bundle.  
> Never put secrets or API keys in these variables — they are publicly visible in the built JS.

---

## 🗺 Page Routes

| Path | Component | Description |
|---|---|---|
| `/` | `HomePage` | Landing page with feature overview |
| `/diagnosis` | `DiagnosisPage` | Step 1 — Select cancer type & AI feature |
| `/upload/diagnosis/:cancerSlug` | `UploadDiagnosis` | Step 2 — Upload CSV, sync/async prediction |
| `/result-diagnosis` | `ResultDiagnosis` | Step 3 — AI output + PDF export |
| `/prognosis` | `PrognosisPage` | Prognosis configuration |
| `/upload/prognosis` | `UploadPrognosis` | Single-file prognosis upload |
| `/upload/prognosis/multi` | `UploadPrognosisMulti` | Multi-file prognosis upload |
| `/result/prognosis` | `ResultPrognosis` | Prognosis results |
| `/treatment` | `TreatmentPage` | Treatment configuration |
| `/upload/treatment` | `UploadTreatment` | Single-file treatment upload |
| `/upload/treatment/multi` | `UploadTreatmentMulti` | Multi-file treatment upload |
| `/result/treatment` | `ResultTreatment` | Treatment results |
| `/news` | `NewsPage` | Oncology news feed |
| `/news/:id` | `NewsDetail` | Article detail |

---

## 🔄 Data Flow

### Diagnosis (Synchronous)

```
DiagnosisPage
  └─► getDiagnosisCancerList()            GET /cancers?ai_feature=diagnosis
  └─► getDiagnosisFeatureOptions(slug)    GET /cancers/:slug/feature-options
  └─► navigate to UploadDiagnosis

UploadDiagnosis
  └─► submitDiagnosisPredictionRaw()      POST /cancers/:slug/predict
  └─► navigate to ResultDiagnosis (via location.state)

ResultDiagnosis
  └─► renders prediction, confidence, top features
  └─► buildPDF() → download .pdf
```

### Diagnosis (Asynchronous)

```
UploadDiagnosis
  └─► submitDiagnosisAsyncRaw()           POST /cancers/:slug/predict-async
  └─► saveJob(jobId) → sessionStorage
  └─► AsyncJobPanel polls every N sec     GET /prediction-result/:job_id
  └─► on completed → navigate to ResultDiagnosis
  └─► clearJob() on result page mount
```

### Prediction Response Shape

**Binary model** (most cancer types):
```json
{
  "status": "OK",
  "prediction": 1,
  "probability": 0.87
}
```

**Multi-class model** (e.g. Lung Adenocarcinoma — `pandu_lung`):
```json
{
  "status": "OK",
  "prediction": 2,
  "probability": 0.57,
  "probabilities": [0.3992, 0.0330, 0.5678]
}
```

| `prediction` value | Meaning |
|---|---|
| `0` | Early Stage (I–II) — or Stage 0 for multi-class |
| `1` | Advanced Stage (III–IV) — or Stage 1 for multi-class |
| `2` | Stage 2 *(multi-class models only)* |

---

## 🐳 Docker Deployment

The Dockerfile uses a **multi-stage build** — Node compiles the app, nginx serves the static output.

```bash
# Build image
docker build -t aira-frontend .

# Run (override env at build time if needed)
docker run -p 80:80 aira-frontend
```

To pass environment variables at build time:

```bash
docker build \
  --build-arg VITE_AI_BACKEND_URL=http://your-gateway:8001 \
  --build-arg VITE_CMS_URL=http://your-cms:8000 \
  -t aira-frontend .
```

> **Note:** Because Vite bakes env vars into the static bundle at build time, you **cannot** override them at container runtime with `-e`. Rebuild the image if you change the backend URL.

---

## ⚕️ Clinical Disclaimer

> **AIRA is a research prototype and decision-support tool — not a certified medical device.**
>
> - AI predictions must be validated by a **licensed clinician** before any clinical action is taken.
> - Sections labelled **"Simulated Data"** or **"[SIMULATED]"** in the Results page contain static placeholder content generated for UI demonstration. They do **not** represent validated clinical AI output.
> - Only the **Predicted Stage**, **Model Confidence**, and **Cancer Type** fields are derived directly from the AI model.
> - The PDF export report includes a mandatory preliminary data notice on every page.

---

<div align="center">

**AIRA** · PRO-STEP Research Programme · Universitas Multimedia Nusantara

*Built with React + TypeScript + Vite*

</div>
