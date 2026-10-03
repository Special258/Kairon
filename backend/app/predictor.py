import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Tuple
from app.schemas import (
    CustomerProfile, PredictionResponse, FeatureImpact, 
    PrescriptiveAction, WhatIfSimulationResponse
)
from app.model_trainer import (
    MODELS_DIR, train_and_save_pipeline, 
    NUMERICAL_FEATURES, CATEGORICAL_FEATURES, FEATURE_DISPLAY_NAMES
)

_cached_model = None
_cached_preprocessor = None
_cached_metadata = None

def get_artifacts():
    global _cached_model, _cached_preprocessor, _cached_metadata
    model_path = os.path.join(MODELS_DIR, "best_model.joblib")
    preproc_path = os.path.join(MODELS_DIR, "preprocessor.joblib")
    meta_path = os.path.join(MODELS_DIR, "metadata.json")
    
    if not (os.path.exists(model_path) and os.path.exists(preproc_path) and os.path.exists(meta_path)):
        train_and_save_pipeline()
        
    if _cached_model is None:
        _cached_model = joblib.load(model_path)
        _cached_preprocessor = joblib.load(preproc_path)
        with open(meta_path, "r") as f:
            _cached_metadata = json.load(f)
            
    return _cached_model, _cached_preprocessor, _cached_metadata

def calculate_local_impacts(profile: CustomerProfile, base_prob: float) -> List[FeatureImpact]:
    """
    Computes local feature impact breakdown (Waterfall analysis)
    by evaluating the marginal risk contribution of each feature relative to healthy baseline norms.
    """
    impacts = []
    
    # 1. Contract Type Impact
    if profile.contract_type == "Month-to-Month":
        impacts.append(FeatureImpact(
            feature_name="contract_type",
            display_name="Contract Type: Month-to-Month",
            impact_score=+24.5,
            impact_type="risk_increasing",
            current_value=profile.contract_type,
            benchmark_value="Annual / Multi-Year",
            description="Short-term commitment without renewal lock-in significantly increases churn vulnerability."
        ))
    elif profile.contract_type == "Two-Year":
        impacts.append(FeatureImpact(
            feature_name="contract_type",
            display_name="Contract Type: 2-Year Term",
            impact_score=-18.0,
            impact_type="risk_reducing",
            current_value=profile.contract_type,
            benchmark_value="Month-to-Month",
            description="Multi-year commitment provides high contractual stability and retention buffer."
        ))
        
    # 2. Support Tickets in 90d
    if profile.support_tickets_90d >= 4:
        score = min(30.0, profile.support_tickets_90d * 4.5)
        impacts.append(FeatureImpact(
            feature_name="support_tickets_90d",
            display_name=f"Support Escalations ({profile.support_tickets_90d} tickets)",
            impact_score=round(score, 1),
            impact_type="risk_increasing",
            current_value=f"{profile.support_tickets_90d} tickets",
            benchmark_value="≤ 1 ticket / 90d",
            description="Elevated support friction indicates unresolved product blockages or customer frustration."
        ))
    elif profile.support_tickets_90d <= 1:
        impacts.append(FeatureImpact(
            feature_name="support_tickets_90d",
            display_name="Low Support Friction (≤1 ticket)",
            impact_score=-6.5,
            impact_type="risk_reducing",
            current_value=f"{profile.support_tickets_90d} tickets",
            benchmark_value="> 3 tickets",
            description="Smooth operation with minimal troubleshooting tickets."
        ))

    # 3. Usage Velocity Trend
    if profile.usage_trend_pct < -10.0:
        score = min(28.0, abs(profile.usage_trend_pct) * 0.45)
        impacts.append(FeatureImpact(
            feature_name="usage_trend_pct",
            display_name=f"Usage Dip ({profile.usage_trend_pct}%)",
            impact_score=round(score, 1),
            impact_type="risk_increasing",
            current_value=f"{profile.usage_trend_pct}%",
            benchmark_value="> 0% growth",
            description="Declining platform activity is one of the strongest leading indicators of shelfware churn."
        ))
    elif profile.usage_trend_pct > 15.0:
        impacts.append(FeatureImpact(
            feature_name="usage_trend_pct",
            display_name=f"Usage Expansion (+{profile.usage_trend_pct}%)",
            impact_score=-12.5,
            impact_type="risk_reducing",
            current_value=f"+{profile.usage_trend_pct}%",
            benchmark_value="0% growth",
            description="Expanding adoption across business workflows signifies entrenched stickiness."
        ))

    # 4. Late Payments
    if profile.late_payments_count >= 1:
        score = min(22.0, profile.late_payments_count * 8.0)
        impacts.append(FeatureImpact(
            feature_name="late_payments_count",
            display_name=f"Payment Delinquency ({profile.late_payments_count} late invoices)",
            impact_score=round(score, 1),
            impact_type="risk_increasing",
            current_value=f"{profile.late_payments_count} invoices",
            benchmark_value="0 late",
            description="Billing friction or budgetary constraints often precede subscription cancellations."
        ))

    # 5. NPS Score
    if profile.nps_score <= 5:
        score = (7 - profile.nps_score) * 4.2
        impacts.append(FeatureImpact(
            feature_name="nps_score",
            display_name=f"Low Customer NPS ({profile.nps_score}/10)",
            impact_score=round(score, 1),
            impact_type="risk_increasing",
            current_value=f"{profile.nps_score}/10",
            benchmark_value="≥ 8/10",
            description="Detractor sentiment indicates dissatisfaction with product value or service quality."
        ))
    elif profile.nps_score >= 8:
        impacts.append(FeatureImpact(
            feature_name="nps_score",
            display_name=f"High Promoter NPS ({profile.nps_score}/10)",
            impact_score=-14.0,
            impact_type="risk_reducing",
            current_value=f"{profile.nps_score}/10",
            benchmark_value="< 7/10",
            description="Strong champion advocacy and user satisfaction."
        ))

    # 6. Feature Adoption Rate
    if profile.feature_adoption_rate < 35.0:
        impacts.append(FeatureImpact(
            feature_name="feature_adoption_rate",
            display_name=f"Underutilized Features ({profile.feature_adoption_rate}%)",
            impact_score=+11.5,
            impact_type="risk_increasing",
            current_value=f"{profile.feature_adoption_rate}%",
            benchmark_value="> 60%",
            description="Customer is only using a small fraction of the platform capabilities."
        ))
    elif profile.feature_adoption_rate >= 70.0:
        impacts.append(FeatureImpact(
            feature_name="feature_adoption_rate",
            display_name=f"Deep Feature Integration ({profile.feature_adoption_rate}%)",
            impact_score=-10.0,
            impact_type="risk_reducing",
            current_value=f"{profile.feature_adoption_rate}%",
            benchmark_value="< 50%",
            description="High workflow integration makes switching to competitors painful and unlikely."
        ))

    # 7. Dedicated Tech Support
    if not profile.has_tech_support and (profile.support_tickets_90d >= 3 or profile.monthly_charges > 300):
        impacts.append(FeatureImpact(
            feature_name="has_tech_support",
            display_name="No Dedicated Tech Support Tier",
            impact_score=+8.5,
            impact_type="risk_increasing",
            current_value="Standard Support",
            benchmark_value="Dedicated Support",
            description="Lack of dedicated technical account manager leaves complex issues unresolved."
        ))
    elif profile.has_tech_support:
        impacts.append(FeatureImpact(
            feature_name="has_tech_support",
            display_name="Dedicated Tech Support Active",
            impact_score=-8.0,
            impact_type="risk_reducing",
            current_value="Dedicated Tier",
            benchmark_value="Standard Support",
            description="Priority SLA and assigned engineer safeguard account health."
        ))

    # Sort drivers by absolute impact score
    impacts = sorted(impacts, key=lambda x: abs(x.impact_score), reverse=True)
    return impacts

def generate_retention_playbook(profile: CustomerProfile, prob: float) -> List[PrescriptiveAction]:
    actions = []
    
    if profile.contract_type == "Month-to-Month" and prob > 35:
        actions.append(PrescriptiveAction(
            title="Annual Contract Migration Offer with 15% Discount",
            urgency="High" if prob > 60 else "Medium",
            category="Contract",
            description="Lock in account for 12 months with a loyalty pricing tier, eliminating month-to-month volatility.",
            estimated_risk_reduction_pct=22.0
        ))
        
    if profile.support_tickets_90d >= 3:
        actions.append(PrescriptiveAction(
            title="Deploy Senior Solutions Engineer for Health Audit",
            urgency="High",
            category="Support",
            description="Schedule a 1-on-1 technical review to resolve open escalation bottlenecks and streamline configuration.",
            estimated_risk_reduction_pct=18.5
        ))
        
    if profile.usage_trend_pct < -10.0:
        actions.append(PrescriptiveAction(
            title="Executive CSM Re-Engagement & Workflow Refresher",
            urgency="High",
            category="Engagement",
            description="Conduct a stakeholder value review to realign product capabilities with customer's quarterly business goals.",
            estimated_risk_reduction_pct=15.0
        ))
        
    if profile.late_payments_count >= 1:
        actions.append(PrescriptiveAction(
            title="Switch Payment Method to Automated ACH / Credit Card",
            urgency="Medium",
            category="Pricing",
            description="Incentivize automated payment scheduling to prevent administrative invoice lapses.",
            estimated_risk_reduction_pct=10.0
        ))
        
    if profile.feature_adoption_rate < 40.0:
        actions.append(PrescriptiveAction(
            title="Targeted Advanced Module Training Workshop",
            urgency="Medium",
            category="Engagement",
            description="Deliver tailored team onboarding on high-value underutilized integrations and automations.",
            estimated_risk_reduction_pct=12.0
        ))
        
    if not actions:
        actions.append(PrescriptiveAction(
            title="Proactive Quarterly Business Review & Expansion Check",
            urgency="Low",
            category="Engagement",
            description="Account is healthy. Present roadmap preview and identify expansion / cross-sell opportunities.",
            estimated_risk_reduction_pct=5.0
        ))
        
    return actions

def predict_single(profile: CustomerProfile) -> PredictionResponse:
    model, preprocessor, metadata = get_artifacts()
    
    # Prepare input dataframe
    row_dict = {
        "tenure_months": profile.tenure_months,
        "monthly_charges": profile.monthly_charges,
        "feature_adoption_rate": profile.feature_adoption_rate,
        "support_tickets_90d": profile.support_tickets_90d,
        "late_payments_count": profile.late_payments_count,
        "usage_trend_pct": profile.usage_trend_pct,
        "nps_score": profile.nps_score,
        "contract_type": profile.contract_type,
        "payment_method": profile.payment_method,
        "has_tech_support": profile.has_tech_support
    }
    input_df = pd.DataFrame([row_dict])
    
    # Transform and predict
    transformed = preprocessor.transform(input_df)
    prob = float(model.predict_proba(transformed)[0][1]) * 100.0
    prob_rounded = round(prob, 1)
    
    # Determine risk tier & aesthetic color code
    if prob_rounded < 25.0:
        risk_tier = "Low"
        risk_color = "#2E7D32" # dark green
    elif prob_rounded < 50.0:
        risk_tier = "Moderate"
        risk_color = "#C9A227" # ochre / amber
    elif prob_rounded < 75.0:
        risk_tier = "High"
        risk_color = "#E65100" # deep orange
    else:
        risk_tier = "Critical"
        risk_color = "#C62828" # crimson red
        
    # Financial metrics
    # Estimated CLV = Monthly MRR * (estimated remaining lifetime in months based on risk)
    remaining_lifetime_months = max(2, int((100 - prob) / 100.0 * 36))
    estimated_clv = round(profile.monthly_charges * remaining_lifetime_months, 2)
    revenue_at_risk = round(profile.monthly_charges * 12 * (prob / 100.0), 2)
    
    top_drivers = calculate_local_impacts(profile, prob)
    playbook = generate_retention_playbook(profile, prob)
    
    return PredictionResponse(
        churn_probability=prob_rounded,
        risk_tier=risk_tier,
        risk_color=risk_color,
        predicted_churn=bool(prob >= 50.0),
        estimated_clv=estimated_clv,
        revenue_at_risk=revenue_at_risk,
        top_drivers=top_drivers,
        retention_playbook=playbook,
        model_version=metadata.get("version", "1.0.0"),
        model_name=metadata.get("model_name", "Random Forest Classifier")
    )

def simulate_what_if(baseline: CustomerProfile, simulated: CustomerProfile) -> WhatIfSimulationResponse:
    base_pred = predict_single(baseline)
    sim_pred = predict_single(simulated)
    
    prob_delta = round(sim_pred.churn_probability - base_pred.churn_probability, 1)
    revenue_saved = round(max(0.0, base_pred.revenue_at_risk - sim_pred.revenue_at_risk), 2)
    
    interventions = []
    if baseline.contract_type != simulated.contract_type:
        interventions.append(f"Contract converted from {baseline.contract_type} to {simulated.contract_type}")
    if baseline.support_tickets_90d != simulated.support_tickets_90d:
        interventions.append(f"Support tickets reduced from {baseline.support_tickets_90d} to {simulated.support_tickets_90d}")
    if baseline.usage_trend_pct != simulated.usage_trend_pct:
        interventions.append(f"Usage trend accelerated from {baseline.usage_trend_pct}% to {simulated.usage_trend_pct}%")
    if baseline.has_tech_support != simulated.has_tech_support:
        interventions.append(f"Tech support status changed to {simulated.has_tech_support}")
    if baseline.nps_score != simulated.nps_score:
        interventions.append(f"NPS improved from {baseline.nps_score} to {simulated.nps_score}")
    if not interventions:
        interventions.append("Parameters identical to baseline")
        
    return WhatIfSimulationResponse(
        baseline_prediction=base_pred,
        simulated_prediction=sim_pred,
        probability_delta=prob_delta,
        revenue_saved=revenue_saved,
        key_interventions_identified=interventions
    )

def normalize_and_clean_batch_df(raw_df: pd.DataFrame) -> pd.DataFrame:
    """
    Intelligently normalizes column names, maps common industry aliases (MRR, company,
    tenure, tickets, NPS), and imputes sensible defaults so ANY CSV uploaded by ANY user
    is processed seamlessly without format failure.
    """
    df = raw_df.copy()
    
    col_map = {}
    for col in df.columns:
        norm = str(col).strip().lower().replace(" ", "_").replace("-", "_")
        col_map[col] = norm
    df = df.rename(columns=col_map)
    
    aliases = {
        "customer_id": ["customer_id", "cust_id", "id", "account_id", "client_id", "user_id", "account_number", "customer_number"],
        "company_name": ["company_name", "company", "account_name", "account", "customer_name", "customer", "client_name", "client", "org_name", "org", "organization", "name", "business", "business_name"],
        "monthly_charges": ["monthly_charges", "monthly_charge", "monthlycharges", "mrr", "monthly_revenue", "revenue", "charges", "amount", "spend", "cost", "billing"],
        "tenure_months": ["tenure_months", "tenure", "months", "tenure_mo", "tenuremonths", "age_months", "subscription_length"],
        "contract_type": ["contract_type", "contract", "contracttype", "plan_term", "term", "plan", "subscription_type"],
        "payment_method": ["payment_method", "payment", "paymentmethod", "billing_method", "pay_method"],
        "support_tickets_90d": ["support_tickets_90d", "support_tickets", "tickets", "tickets_90d", "support_cases", "cases", "tickets_count", "issues"],
        "feature_adoption_rate": ["feature_adoption_rate", "feature_adoption", "adoption_rate", "adoption_pct", "adoption", "usage_rate"],
        "late_payments_count": ["late_payments_count", "late_payments", "late_invoices", "unpaid_invoices", "overdue_invoices", "past_due"],
        "nps_score": ["nps_score", "nps", "csat", "score", "rating", "satisfaction"],
        "has_tech_support": ["has_tech_support", "tech_support", "support_tier", "dedicated_support", "premium_support"],
        "usage_trend_pct": ["usage_trend_pct", "usage_trend", "usage_growth", "growth_pct", "trend", "usage_change"]
    }
    
    for canonical, alias_list in aliases.items():
        if canonical not in df.columns:
            for alt in alias_list:
                if alt in df.columns:
                    df[canonical] = df[alt]
                    break

    if "customer_id" not in df.columns:
        df["customer_id"] = [f"CUST-{i+1}" for i in range(len(df))]
    if "company_name" not in df.columns:
        df["company_name"] = [f"Account {df['customer_id'].iloc[i]}" for i in range(len(df))]
        
    if "monthly_charges" not in df.columns:
        df["monthly_charges"] = 500.0
    else:
        df["monthly_charges"] = pd.to_numeric(df["monthly_charges"], errors="coerce").fillna(500.0).clip(lower=0)

    if "tenure_months" not in df.columns:
        df["tenure_months"] = 12
    else:
        df["tenure_months"] = pd.to_numeric(df["tenure_months"], errors="coerce").fillna(12).astype(int).clip(lower=0)

    if "contract_type" not in df.columns:
        df["contract_type"] = "One-Year"
    else:
        def norm_contract(c):
            s = str(c).lower()
            if "two" in s or "2" in s or "multi" in s:
                return "Two-Year"
            if "month" in s or "m2m" in s:
                return "Month-to-Month"
            return "One-Year"
        df["contract_type"] = df["contract_type"].apply(norm_contract)

    if "payment_method" not in df.columns:
        df["payment_method"] = "Credit Card"
    else:
        def norm_payment(p):
            s = str(p).lower()
            if "check" in s:
                return "Electronic Check"
            if "bank" in s or "wire" in s or "ach" in s:
                return "Bank Transfer"
            if "manual" in s or "invoice" in s:
                return "Manual Invoice"
            return "Credit Card"
        df["payment_method"] = df["payment_method"].apply(norm_payment)

    if "support_tickets_90d" not in df.columns:
        df["support_tickets_90d"] = 1
    else:
        df["support_tickets_90d"] = pd.to_numeric(df["support_tickets_90d"], errors="coerce").fillna(1).astype(int).clip(lower=0)

    if "feature_adoption_rate" not in df.columns:
        df["feature_adoption_rate"] = 65.0
    else:
        df["feature_adoption_rate"] = pd.to_numeric(df["feature_adoption_rate"], errors="coerce").fillna(65.0).clip(0, 100)

    if "late_payments_count" not in df.columns:
        df["late_payments_count"] = 0
    else:
        df["late_payments_count"] = pd.to_numeric(df["late_payments_count"], errors="coerce").fillna(0).astype(int).clip(lower=0)

    if "nps_score" not in df.columns:
        df["nps_score"] = 8
    else:
        df["nps_score"] = pd.to_numeric(df["nps_score"], errors="coerce").fillna(8).astype(int).clip(0, 10)

    if "has_tech_support" not in df.columns:
        df["has_tech_support"] = True
    else:
        def norm_tech(t):
            s = str(t).lower()
            return s in ["true", "1", "yes", "t", "y", "enrolled", "active"]
        df["has_tech_support"] = df["has_tech_support"].apply(norm_tech)

    if "usage_trend_pct" not in df.columns:
        df["usage_trend_pct"] = 5.0
    else:
        df["usage_trend_pct"] = pd.to_numeric(df["usage_trend_pct"], errors="coerce").fillna(5.0)

    return df

def predict_batch_df(df: pd.DataFrame) -> Dict[str, Any]:
    model, preprocessor, metadata = get_artifacts()
    
    # Intelligently clean, normalize, and impute any user CSV format
    cleaned_df = normalize_and_clean_batch_df(df).reset_index(drop=True)
    
    required_cols = NUMERICAL_FEATURES + CATEGORICAL_FEATURES
    transformed = preprocessor.transform(cleaned_df[required_cols])
    probs = model.predict_proba(transformed)[:, 1] * 100.0
    
    results = []
    for i, row in cleaned_df.iterrows():
        p = round(float(probs[i]), 1)
        if p < 25.0:
            tier = "Low"
            color = "#2E7D32"
        elif p < 50.0:
            tier = "Moderate"
            color = "#C9A227"
        elif p < 75.0:
            tier = "High"
            color = "#E65100"
        else:
            tier = "Critical"
            color = "#C62828"
            
        mrr = float(row["monthly_charges"])
        at_risk = round(mrr * 12 * (p / 100.0), 2)
        
        results.append({
            "customer_id": str(row["customer_id"]),
            "company_name": str(row["company_name"]),
            "churn_probability": p,
            "risk_tier": tier,
            "risk_color": color,
            "monthly_charges": mrr,
            "revenue_at_risk": at_risk,
            "contract_type": str(row["contract_type"]),
            "support_tickets_90d": int(row["support_tickets_90d"]),
            "nps_score": int(row["nps_score"])
        })
        
    total = len(results)
    high_critical_count = sum(1 for r in results if r["risk_tier"] in ["High", "Critical"])
    total_rev_at_risk = round(sum(r["revenue_at_risk"] for r in results), 2)
    avg_churn_prob = round(sum(r["churn_probability"] for r in results) / max(1, total), 1)
    
    risk_distribution = {
        "Low": sum(1 for r in results if r["risk_tier"] == "Low"),
        "Moderate": sum(1 for r in results if r["risk_tier"] == "Moderate"),
        "High": sum(1 for r in results if r["risk_tier"] == "High"),
        "Critical": sum(1 for r in results if r["risk_tier"] == "Critical")
    }
    
    return {
        "total_records": total,
        "avg_churn_probability": avg_churn_prob,
        "high_risk_count": high_critical_count,
        "total_revenue_at_risk": total_rev_at_risk,
        "risk_distribution": risk_distribution,
        "predictions": results
    }
