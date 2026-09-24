<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,50:2563EB,100:06B6D4&height=180&section=header&text=KAIRON&fontSize=65&fontColor=ffffff&fontAlignY=40&animation=fadeIn" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&pause=1000&color=06B6D4&center=true&vCenter=true&width=650&lines=Customer+Relationship+Intelligence;AI-Powered+Retention+Decision+Platform;See+the+Signal.+Keep+the+Relationship." alt="Typing Animation"/>

<br/>

![Status](https://img.shields.io/badge/Status-In%20Development-2563EB?style=for-the-badge)
![AI/ML](https://img.shields.io/badge/AI%2FML-Powered-06B6D4?style=for-the-badge)

</div>

# 🧠 About Kairon

**Kairon** is a **Customer Relationship Intelligence and Retention Decision Platform** designed to help customer success, account management, and revenue teams identify **churn risk early**, understand the reasons behind that risk, estimate the **financial exposure**, and choose practical **retention actions**.

Instead of being another passive reporting dashboard, Kairon works as a decision layer between customer data and the next action a team needs to take.

### 🎯 Core Flow

```text
Customer Signals
       ↓
🤖 Churn Prediction
       ↓
🔍 Risk Drivers
       ↓
🚦 Risk Tier
       ↓
💰 Revenue at Risk
       ↓
🎯 Retention Action
       ↓
🤝 Team Review
```

> **See the signal. Keep the relationship.**

---

# ✨ Key Features

* 🤖 **Churn Prediction** — Predict customer churn risk using multiple customer signals.
* 🚦 **Risk Classification** — Categorize accounts into Low, Moderate, High, and Critical risk.
* 🔍 **Explainable Risk Drivers** — Identify the key factors influencing the prediction.
* 💰 **Revenue at Risk** — Translate customer risk into financial exposure.
* 🎯 **Retention Playbook** — Connect risk insights with recommended retention actions.
* 📊 **Cohort Analysis** — Upload and analyze multiple customer accounts through CSV.
* 🧪 **What-If Simulation** — Compare baseline and modified customer scenarios.
* 🤝 **Team Reviews** — Review account context, risk, plans, and team feedback.

---

# 🏗️ Architecture

```text
             👤 USER
                │
                ▼
      ┌──────────────────┐
      │ React + TypeScript│
      │     Frontend      │
      └────────┬─────────┘
               │ REST API
               ▼
      ┌──────────────────┐
      │     FastAPI      │
      │      Backend     │
      └────────┬─────────┘
               │
        ┌──────┴──────┐
        ▼             ▼
   📊 Data        🤖 ML Model
   Processing     Scikit-learn
        │             │
        └──────┬──────┘
               ▼
        🎯 Risk Analysis
               │
               ▼
        💰 Retention Insights
```

---

# 🛠️ Tech Stack
# 🛠️ Tech Stack

<div align="center">

<table>
<tr>
<td align="center">
<img src="https://skillicons.dev/icons?i=react,ts,vite,css" height="45"/>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=python" height="45"/>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=fastapi" height="45"/>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=supabase" height="45"/>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=git,github,vscode" height="45"/>
</td>
</tr>
</table>

<br/>

<img src="https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white"/>
<img src="https://img.shields.io/badge/Scikit--Learn-F7931E?style=flat-square&logo=scikit--learn&logoColor=white"/>
<img src="https://img.shields.io/badge/Joblib-2E7D32?style=flat-square"/>
<img src="https://img.shields.io/badge/Pydantic-E92063?style=flat-square"/>
<img src="https://img.shields.io/badge/REST%20API-000000?style=flat-square"/>

</div>

---

# 🔌 API

| Method | Endpoint               | Purpose                            |
| ------ | ---------------------- | ---------------------------------- |
| GET    | `/api/health`          | Service & model status             |
| GET    | `/api/model/metrics`   | Model metrics & feature importance |
| GET    | `/api/dataset/summary` | Dataset summary                    |
| POST   | `/api/predict`         | Single account prediction          |
| POST   | `/api/simulate`        | What-if simulation                 |
| POST   | `/api/predict/batch`   | Batch account prediction           |
| POST   | `/api/model/retrain`   | Model retraining                   |

---

# 📊 Customer Signals

Kairon uses customer signals such as:

`MRR` • `Tenure` • `Contract Type` • `Payment Method` • `Feature Adoption` • `Usage Trend` • `Support Tickets` • `NPS` • `Late Payments` • `Technical Support`

---

# 🚀 Current Status

🚧 **Kairon is currently under active development.**

The core prediction, batch scoring, simulation, model metrics, and retraining capabilities are implemented through the FastAPI service.

---

# 👨‍💻 Developer

**Jal Patel**

🎓 B.Tech Computer Science Engineering
🤖 Artificial Intelligence & Data Science
🏫 Parul University

[![GitHub](https://img.shields.io/badge/GitHub-Special258-181717?style=for-the-badge\&logo=github)](https://github.com/Special258)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Jal%20Patel-0A66C2?style=for-the-badge\&logo=linkedin)](https://www.linkedin.com/in/jalpatel-dataai)

---

<div align="center">

### 🚦 See the Signal. 🔍 Understand the Risk. 🎯 Take Action.

**Kairon — Customer Relationship Intelligence & Retention Decision Platform**

</div>
