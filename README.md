<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:0F172A,50:2563EB,100:06B6D4&height=180&section=header&text=KAIRON&fontSize=65&fontColor=ffffff&fontAlignY=40&animation=fadeIn" width="100%"/>

<img src="https://readme-typing-svg.demolab.com?font=Fira+Code&weight=600&size=18&pause=1000&color=06B6D4&center=true&vCenter=true&width=650&lines=Customer+Relationship+Intelligence;AI-Powered+Retention+Decision+Platform;See+the+Signal.+Keep+the+Relationship." alt="Typing Animation"/>

<br/>

[![GitHub stars](https://img.shields.io/badge/Release-v1.0.0-blue?style=flat-square)](https://github.com/Special258/Kairon)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)
[![Python](https://img.shields.io/badge/Python-3.14%2B-blue?style=flat-square&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6?style=flat-square&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

</div>

# 🧠 About Kairon

**Kairon** is a **Customer Relationship Intelligence and Retention Decision Platform** designed to help customer success, account management, and revenue teams identify **churn risk early**, understand the reasons behind that risk, estimate the **financial exposure**, and execute prescriptive **retention playbooks**.

Instead of being another passive reporting dashboard, Kairon acts as an active decision layer between customer behavioral signals and executive retention strategies.

### 🎯 Core Retention Flow

```text
Customer Signals
       ↓
🤖 Churn Prediction (Scikit-Learn ML)
       ↓
🔍 Explainable Risk Drivers (Feature Impact)
       ↓
🚦 Risk Tier (Low / Moderate / High / Critical)
       ↓
💰 Revenue at Risk & Estimated CLV
       ↓
🎯 Retention Action Playbooks
       ↓
🤝 Collaborative E2EE Team Reviews
```

> **"See the signal. Keep the relationship."**

---

# ✨ Key Features

* 🤖 **Predictive Churn Intelligence** — Real-time inference predicting customer churn probability and risk tier.
* 🚦 **Risk Classification** — Categorize accounts into Low, Moderate, High, and Critical risk tiers.
* 🔍 **Explainable Risk Drivers** — Local feature impact waterfall explaining top positive and negative churn drivers.
* 💰 **Financial Exposure Analysis** — Translates churn probability into Annual Revenue at Risk and Estimated Lifetime Value (CLV).
* 🎯 **Prescriptive Retention Playbooks** — Actionable retention plays with estimated risk reduction percentages.
* 🧪 **What-If Sensitivity Sandbox** — Compare baseline vs simulated interventions (+1-Year contract lock-in, dedicated tech support, feature adoption boosts).
* 📊 **Cohort & Batch CSV Scoring** — Drag-and-drop batch CSV scoring with distribution metrics and exportable risk reports.
* 🔒 **Zero-Knowledge E2EE Reviews** — Team notes encrypted in the browser with client-side AES-256-GCM before database storage.
* 🛡️ **Enterprise Security** — Built-in sliding-window rate limiting, input sanitization, OWASP Top 10 security transport headers, and CSRF protection.

---

# 🏗️ Architecture

```text
             👤 User / Browser
                     │
                     ▼
      ┌──────────────────────────────┐
      │   React 19 + TypeScript SPA  │
      │  (Vite, Tailwind, WebCrypto) │
      └──────────────┬───────────────┘
                     │ HTTP / REST / Bearer Token
                     ▼
      ┌──────────────────────────────┐
      │     FastAPI Python Backend   │
      │  (Uvicorn, Pydantic, OWASP)  │
      └──────┬───────────────┬───────┘
             │               │
      ┌──────▼──────┐ ┌──────▼──────┐
      │  ML Pipeline│ │ SQLite / DB │
      │ Scikit-Learn│ │ Encrypted   │
      │   Models    │ │ Persistence │
      └─────────────┘ └─────────────┘
```

---

# 🛠️ Tech Stack

<div align="center">

<table>
<tr>
<td align="center">
<img src="https://skillicons.dev/icons?i=react,ts,vite,tailwind,css" height="45"/><br/>
<b>Frontend</b>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=python" height="45"/><br/>
<b>Python 3.14</b>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=fastapi" height="45"/><br/>
<b>FastAPI</b>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=sqlite,supabase" height="45"/><br/>
<b>Database</b>
</td>

<td align="center">
<img src="https://skillicons.dev/icons?i=docker,git,github" height="45"/><br/>
<b>DevOps</b>
</td>
</tr>
</table>

<br/>

<img src="https://img.shields.io/badge/Pandas-150458?style=flat-square&logo=pandas&logoColor=white"/>
<img src="https://img.shields.io/badge/Scikit--Learn-F7931E?style=flat-square&logo=scikit--learn&logoColor=white"/>
<img src="https://img.shields.io/badge/Joblib-2E7D32?style=flat-square"/>
<img src="https://img.shields.io/badge/Pydantic-E92063?style=flat-square"/>
<img src="https://img.shields.io/badge/Web%20Crypto%20API-AES--256--GCM-blueviolet?style=flat-square"/>

</div>

---

# ⚡ Quick Start

### Prerequisites
- **Node.js** 18+ & **npm**
- **Python** 3.10+

### Option A: Unified Production Server (Single Command)
Run both backend and frontend seamlessly on `http://127.0.0.1:8000`:

```bash
# 1. Install dependencies
npm run build

# 2. Start unified server
npm run prod
```
Open **[http://127.0.0.1:8000](http://127.0.0.1:8000)** in your browser.

---

### Option B: Full-Stack Development Mode (Hot Reload)
Run frontend with Vite hot-reloading on port 5173 and backend on port 8000:

```bash
npm run dev
```

---

# 🔌 API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/status` | Service health and model status check |
| `GET` | `/api/model/metrics` | Model evaluation benchmarks, confusion matrix, ROC-AUC |
| `GET` | `/api/dataset/summary` | Synthetic customer dataset distribution & feature statistics |
| `POST` | `/api/predict` | Single customer account risk scoring & feature impact |
| `POST` | `/api/simulate` | What-If intervention sensitivity analysis |
| `POST` | `/api/predict/batch` | Batch CSV cohort risk scoring and portfolio metrics |
| `POST` | `/api/assistant/resolve` | AI Copilot real-world troubleshooting and customer guidance |
| `GET` / `POST` | `/api/accounts` | Persistent account storage and retrieval |
| `GET` / `POST` | `/api/reviews/{id}/notes` | End-to-end encrypted account review notes |
| `GET` / `POST` | `/api/workspace` | Workspace settings and team metadata |

Interactive Swagger documentation is available at **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)**.

---

# 📊 Customer Signals

Kairon evaluates multiple behavioral and commercial signals:

`Monthly Charges (MRR)` • `Tenure (Months)` • `Contract Type` • `Payment Method` • `Feature Adoption Index` • `Usage Velocity Trend` • `Support Tickets (90d)` • `Net Promoter Score (NPS)` • `Late Payment Frequency` • `Dedicated Tech Support Tier`

---

# 🧪 Automated Testing

Kairon includes a comprehensive automated test suite covering API endpoints, prediction pipeline, what-if simulations, rate limiting, and input sanitization:

```bash
npm test
```
All 20 pytest test suites run against the backend application with 100% pass rate.

---

# 👨‍💻 Author & Developer

**Jal Patel**

🎓 B.Tech Computer Science Engineering  
🤖 Artificial Intelligence & Data Science  
🏫 Parul University  

[![GitHub](https://img.shields.io/badge/GitHub-Special258-181717?style=for-the-badge&logo=github)](https://github.com/Special258)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Jal%20Patel-0A66C2?style=for-the-badge&logo=linkedin)](https://www.linkedin.com/in/jalpatel-dataai)

---

<div align="center">

### 🚦 See the Signal. 🔍 Understand the Risk. 🎯 Take Action.

**Kairon — Customer Relationship Intelligence & Retention Decision Platform**

</div>
