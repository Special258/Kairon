# Kairon
## Customer Relationship Intelligence and Retention Decision Platform

**Project report**  
**Date:** September 21, 2026  
**Repository:** PROJECT 3

---

## 1. Executive Summary

Kairon is a customer relationship intelligence platform designed to help customer success, account management, and revenue teams identify churn risk early and respond with a clear, evidence-based action.

The central idea is simple:

> **See the signal. Keep the relationship.**

Most teams do not lose customers because they lack data. They lose customers because the important signal is scattered across account notes, product usage, support activity, billing behavior, contract dates, and customer sentiment. By the time those signals are manually combined, the renewal conversation may already be difficult to recover.

Kairon brings those signals into one decision workflow. It estimates churn probability, identifies the strongest risk drivers, translates model output into financial exposure, and recommends practical retention actions.

It is not intended to be another passive reporting dashboard. It is designed as a decision layer between raw customer data and the next conversation a team needs to have.

---

## 2. What Kairon Means

Kairon is inspired by the Greek concept of **kairos**, the right, decisive, or opportune moment. The name reflects the product's central promise: help customer teams recognize the moment when a relationship needs attention and act while a helpful intervention is still possible.

The name is intentionally one word. It feels focused, memorable, and active rather than describing the product as another generic analytics dashboard.

Kairon does not promise that every account can be saved. Its purpose is more useful and more honest: make the right risks visible early enough that a thoughtful intervention is possible.

The product treats retention as a relationship problem, not only a prediction problem. A score by itself does not help a customer success manager decide what to do. The score must be connected to:

1. A reason the account is at risk.
2. The financial value that could be protected.
3. A recommended action.
4. A human owner and a review moment.

---

## 3. The Problem It Solves

Customer teams commonly face five problems:

### 3.1 Risk is discovered too late
Renewal dates and cancellation signals are often noticed after the customer has already disengaged.

### 3.2 Data is fragmented
Usage trend, product adoption, support tickets, payment behavior, NPS, contract type, and tenure may live in different systems or spreadsheets.

### 3.3 Generic dashboards explain the past
Traditional dashboards are good at showing totals and historical trends, but they often do not answer: "Which account should I act on today, and why?"

### 3.4 A churn score is not an action plan
A probability such as 72% is not useful unless the user can understand its drivers and select a practical next step.

### 3.5 Teams do not share context consistently
One person may understand why an account is at risk, while the rest of the team only sees a red label. This leads to duplicated work, slow escalation, and inconsistent customer conversations.

Kairon is designed around these gaps.

---

## 4. How the Web App Works

### Step 1: Enter the workspace
New users enter through the Kairon sign-in or create-account experience. The welcome screen explains the product before asking the user to work with a model.

The onboarding promise is:

> Kairon helps customer teams see which relationships need attention, understand why risk is rising, and choose the next best action before a renewal becomes a rescue mission.

### Step 2: Read the portfolio overview
The Overview page gives the team a calm starting point instead of immediately presenting a complex form. It shows:

- Protected revenue.
- Revenue currently at risk.
- Accounts being monitored.
- Average customer health.
- Health movement over time.
- Risk distribution across the portfolio.
- Retention opportunities that deserve attention.

This page answers the executive question: **Where should the team focus?**

### Step 3: Score an individual account
The Account Scorer lets a user enter or adjust customer signals such as:

- Account name and ID.
- Monthly recurring revenue.
- Tenure.
- Contract type.
- Payment method.
- Feature adoption.
- Usage trend.
- Support ticket volume.
- NPS.
- Late payment behavior.
- Dedicated technical support status.

The frontend sends this profile to the FastAPI prediction endpoint. The model returns churn probability, risk tier, revenue at risk, estimated customer lifetime value, top drivers, and recommended retention actions.

### Step 4: Understand the result
The result is intentionally layered:

- A visual risk score communicates urgency quickly.
- The risk tier gives a simpler label: Low, Moderate, High, or Critical.
- Financial cards translate risk into revenue exposure.
- Driver bars show what is influencing the score.
- The retention playbook translates the prediction into a next move.

This creates a path from **signal -> interpretation -> action**.

### Step 5: Analyze a cohort
Users can upload a CSV file and score many accounts at once. The Cohorts and Accounts page provides:

- Total accounts scored.
- High-risk account count.
- Average churn risk.
- Total revenue exposed.
- Searchable scored account rows.
- Risk tiers and revenue-at-risk values.

This answers the operations question: **How should our team prioritize the portfolio?**

### Step 6: Review accounts together
The Team Reviews page gives teams a shared place to discuss the accounts that need judgment. A review contains:

- Account context.
- Current health status.
- Risk explanation.
- Suggested retention plan.
- Team notes and feedback.

This is important because prediction should support human judgment, not replace it.

### Step 7: Improve the workspace
Profile and Settings pages help users manage their workspace identity, notification preferences, and working style. These pages make the product feel like a durable work environment rather than a one-time calculator.

---

## 5. What Makes Kairon Different

Kairon should not be positioned as a replacement for every CRM, warehouse, or business intelligence tool. Its differentiation is more specific: it is an action-oriented retention intelligence layer.

| Typical tool | Primary strength | Limitation for retention decisions | Kairon's difference |
|---|---|---|---|
| CRM | Stores accounts, contacts, activities, and ownership | Usually depends on manual updates and does not calculate risk from multiple signals | Converts customer signals into a prioritized relationship decision |
| BI dashboard | Explores historical metrics and trends | Often requires analysis expertise and stops at reporting | Presents the most relevant risk, reason, value, and next action together |
| Spreadsheet | Flexible and familiar | Manual, difficult to maintain, and easy to make inconsistent | Standardizes scoring and makes cohort analysis repeatable |
| Support platform | Captures tickets and service interactions | Sees only one part of the relationship | Combines support with usage, sentiment, tenure, billing, and contract signals |
| Generic AI assistant | Generates text and answers questions | May lack a grounded risk model and financial context | Uses a trained prediction pipeline and connects output to concrete retention actions |
| Static churn model | Produces a probability | Often difficult for non-technical teams to interpret | Adds explainability, revenue exposure, playbooks, and team review context |

### The key difference
Other tools generally answer one of these questions:

- What happened?
- What data do we have?
- What is the account record?
- What does the model predict?

Kairon is designed to answer:

> **What should our team understand and do next to protect this relationship?**

---

## 6. Product Ideology and Design Thinking

### 6.1 Clarity before complexity
A customer success professional should not need to understand machine learning terminology to use the product. The interface starts with plain-language questions and progressively reveals detail.

### 6.2 Every score needs a reason
A prediction without explanation creates distrust. Kairon surfaces top drivers so the user can challenge, validate, or contextualize the model output.

### 6.3 Every reason should lead to an action
The product does not stop at "risk is high." It offers a retention playbook with estimated risk reduction so users can move from analysis to a conversation or intervention.

### 6.4 Financial context creates prioritization
A high-risk low-value account and a high-risk strategic account may deserve different levels of attention. Revenue at risk and estimated lifetime value help teams allocate limited time responsibly.

### 6.5 Human judgment remains central
The model identifies patterns. People understand relationships, constraints, history, and trust. Kairon is therefore designed for shared review and context, not automated customer decisions without oversight.

### 6.6 Calm interfaces support better decisions
The light canvas, warm paper surfaces, restrained color accents, readable typography, and measured motion are intentional. Retention work often involves sensitive conversations and many competing signals. The interface should reduce cognitive load instead of creating more noise.

### 6.7 The product should earn trust gradually
A new user should be able to understand the product before uploading data or relying on a score. The onboarding story explains the purpose, the workflow demonstrates the value, and the explainability layer gives the user a reason to trust the output.

---

## 7. How to Switch New Users to Kairon

The most effective adoption strategy is not to ask users to learn every feature. Move them through one meaningful success loop.

### The first five minutes

1. **Explain the outcome**
   "Kairon helps you know which customer relationships need attention before renewal risk becomes urgent."

2. **Start with one familiar account**
   Ask the user to score an account they already understand well. This makes the model output easier to validate.

3. **Compare the score with human intuition**
   Ask: "Does the risk tier match your understanding? Which driver surprises you?"

4. **Choose one recommended action**
   Turn the playbook into a real next step, such as scheduling a value review, increasing technical support, or investigating a usage drop.

5. **Return to the account after the intervention**
   Use the review workflow to record context and monitor whether the relationship is moving in a healthier direction.

### The first week

- Upload a small, clean cohort rather than the entire customer database.
- Review the highest-risk accounts with customer success leadership.
- Assign an owner and next action to each priority account.
- Compare model predictions with known renewal outcomes or internal account health.
- Adjust data quality and thresholds based on real team feedback.

### The adoption message

Use this short explanation when introducing Kairon:

> Kairon is not another dashboard you have to monitor. It is a relationship intelligence workspace that helps you find the accounts that need attention, understand what changed, estimate what is at stake, and agree on the next best action with your team.

---

## 8. Technical Architecture

### Frontend

- React with TypeScript.
- Vite development and production build tooling.
- Lucide icon system.
- Responsive custom CSS visual system.
- Supabase-backed email/password and Google OAuth session state.
- Page-level navigation for Overview, Account Scorer, Cohorts, Reviews, Profile, and Settings.

### Backend

- FastAPI service.
- Pydantic request and response schemas.
- pandas CSV ingestion.
- scikit-learn model pipeline.
- joblib model and preprocessor artifacts.
- CORS configuration for local frontend development.

### Live API capabilities

- `GET /api/health`: model and service status.
- `GET /api/model/metrics`: evaluation metrics and feature importance.
- `GET /api/dataset/summary`: dataset-level summary.
- `POST /api/predict`: single account churn prediction.
- `POST /api/simulate`: baseline versus what-if comparison.
- `POST /api/predict/batch`: CSV cohort scoring.
- `POST /api/model/retrain`: retraining and re-benchmarking.

### Current implementation boundary

The prediction, batch scoring, simulation, health, metrics, and retraining capabilities are backed by the FastAPI service. Authentication is configured through Supabase and requires deployment-specific environment variables plus provider redirect settings. Profile details, review notes, settings, and overview snapshots remain frontend experience layers until a persistence service is connected.

This boundary is intentional: identity is delegated to a proven authentication provider, while product collaboration storage can be introduced separately without coupling it to the model API.

---

## 9. Recommended Production Roadmap

### Phase 1: Trust and data quality
- Add real authentication and organization-level access control.
- Persist profiles, review notes, settings, and account ownership.
- Add input validation and data quality feedback for CSV uploads.
- Store prediction versions and model metadata with every score.

### Phase 2: Operational workflows
- Connect CRM, billing, product analytics, and support systems.
- Add account ownership and due dates to the review queue.
- Add email or in-app notifications for risk threshold changes.
- Add exportable intervention plans and activity history.

### Phase 3: Learning loop
- Capture whether an intervention happened and what outcome followed.
- Track false positives and false negatives with user feedback.
- Monitor model drift across segments and contract types.
- Retrain with real customer outcomes instead of only synthetic or static data.

### Phase 4: Responsible intelligence
- Explain model limitations clearly.
- Audit score behavior across customer segments.
- Provide human override and reason capture.
- Never use the score as the sole basis for punitive or exclusionary customer treatment.

---

## 10. Success Measures

Kairon should be evaluated by the quality of decisions it improves, not only by model accuracy.

Recommended product metrics:

- Time from risk detection to assigned action.
- Percentage of high-risk accounts with an owner and next step.
- Renewal rate for accounts that received an intervention.
- Revenue protected after a recorded retention action.
- Agreement between model risk and expert account review.
- Weekly active customer success users.
- Percentage of new users who complete their first account score.
- Percentage of scored accounts that receive a review note.

The model metrics matter, but the product succeeds when better signals lead to better conversations and better timing.

---

## 11. Final Positioning

Kairon is a focused retention intelligence product for teams that already have customer data but need better timing, prioritization, and shared context.

Its strongest promise is not that it can predict the future perfectly. Its strongest promise is that it can help a team notice the present more clearly and respond while the relationship is still recoverable.

> **Kairon illuminates customer health, turns risk into a human-readable story, and helps teams keep valuable relationships growing.**

