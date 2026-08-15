# Segmint — Intelligent Customer Segmentation & RFM Analytics

<div align="center">

**Turn raw e-commerce transactions into actionable customer personas with ML-powered segmentation.**

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.104+-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)

</div>

---

## 🎯 Problem Statement

A retailer doesn't want "Cluster 3" — they want to know *"these are my loyal high spenders, send them early access"* and *"these dormant customers need a win-back discount."* Segmint bridges the gap between unsupervised ML clustering and actionable business strategy.

## 🏗 Architecture

```
Raw Transactions (.xlsx)
    → Data Cleaning (drop nulls, cancellations)
    → RFM Calculation (per-customer Recency/Frequency/Monetary)
    → Feature Scaling (log1p + StandardScaler)
    → Clustering (K-Means + DBSCAN in parallel)
    → PCA Projection (3D → 2D for visualization)
    → Business Labeling (personas + recommended actions)
    → Interactive Dashboard (React + Plotly)
```

| Layer | Tech | Purpose |
|-------|------|---------|
| **Data Pipeline** | Pandas, NumPy, Scikit-learn | Clean, transform, cluster |
| **REST API** | FastAPI | Serve results to frontend |
| **Frontend** | React, Vite, Plotly.js | Interactive dashboard |
| **Dataset** | UCI Online Retail | ~540K transaction rows |

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- Node.js 18+
- npm

### 1. Backend Setup

```bash
cd backend
python3 -m pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Run the Pipeline

1. Open the frontend at `http://localhost:5173`
2. Navigate to **Pipeline** page
3. Click **▶ Run Pipeline**
4. Wait for all 7 stages to complete (~1-2 minutes)
5. Explore the **Dashboard** and **Customers** pages

## 📊 Methodology

### RFM Analysis
- **Recency**: Days since last purchase (lower = better)
- **Frequency**: Count of unique invoices (purchase events)
- **Monetary**: Total spend across all orders

### Clustering
- **K-Means**: Optimal k chosen via silhouette score analysis
- **DBSCAN**: eps from k-distance elbow, identifies noise/outliers

### Business Personas
Each cluster is mapped to a human-readable persona with actionable recommendations:
- 🏆 **Champions** — Reward with early access and loyalty programs
- 💎 **Loyal Customers** — Upsell and cross-sell
- ⭐ **Potential Loyalists** — Engage with membership programs
- 🌱 **New Customers** — Nurture with onboarding
- ⚠️ **At Risk** — Win-back campaigns
- 😴 **About to Sleep** — Aggressive reactivation
- ❄️ **Hibernating** — Last-resort re-engagement

## 📁 Project Structure

```
Segmint/
├── backend/                 # FastAPI + Data Pipeline
│   ├── app/
│   │   ├── main.py          # FastAPI entry point
│   │   ├── config.py        # Settings
│   │   ├── api/             # REST endpoints
│   │   └── pipeline/        # 6-stage ML pipeline
│   ├── data/                # Raw + processed data
│   └── outputs/             # Generated plots
├── frontend/                # React + Vite Dashboard
│   └── src/
│       ├── pages/           # Dashboard, Customers, Pipeline
│       ├── components/      # Reusable UI components
│       └── api/             # Backend API client
└── README.md
```

## ⚠️ Limitations

- Single retailer, single country (UK), single year (Dec 2010 – Dec 2011)
- DBSCAN noise points may reflect data quality issues, not genuine outlier customers
- PCA explained variance caveat: if <70%, 2D plot may not fully represent cluster separation
- No real-time data ingestion — batch pipeline on historical data

## 🔮 Next Steps

- Layer a churn-prediction model on top of segments
- Add real-time data streaming
- A/B test marketing actions per persona
- Multi-country analysis

---

<div align="center">
  Built with ◆ Segmint
</div>
