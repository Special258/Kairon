import numpy as np
import pandas as pd
from typing import Tuple

COMPANY_PREFIXES = ["Nexus", "Apex", "Vanguard", "Quantum", "Hyperion", "Synthetix", "Acro", "Pulse", "Stratum", "Crest", "Cobalt", "Solace", "Krypton", "Veritas", "IronClad", "Omni", "Lumina", "Aero", "Skyline", "DataCore"]
COMPANY_SUFFIXES = ["Technologies", "SaaS", "Labs", "Analytics", "Solutions", "Networks", "Logistics", "Cloud", "Dynamics", "Systems", "Enterprises", "Ventures", "Group", "Global", "Finance", "Healthcare"]

def generate_enterprise_dataset(n_samples: int = 3500, random_state: int = 42) -> pd.DataFrame:
    """
    Generates a realistic enterprise customer churn dataset with multi-variable correlations.
    """
    np.random.seed(random_state)
    
    customer_ids = [f"CUST-{1000 + i}" for i in range(n_samples)]
    company_names = [
        f"{np.random.choice(COMPANY_PREFIXES)} {np.random.choice(COMPANY_SUFFIXES)}" 
        for _ in range(n_samples)
    ]
    
    # Contract type distribution
    contract_choices = ["Month-to-Month", "One-Year", "Two-Year"]
    contract_probs = [0.52, 0.28, 0.20]
    contract_types = np.random.choice(contract_choices, size=n_samples, p=contract_probs)
    
    # Tenure in months (longer for longer contracts)
    tenure = []
    for c in contract_types:
        if c == "Month-to-Month":
            t = np.random.exponential(scale=14) + 1
        elif c == "One-Year":
            t = np.random.normal(loc=26, scale=10)
        else:
            t = np.random.normal(loc=44, scale=12)
        tenure.append(int(np.clip(t, 1, 72)))
    tenure = np.array(tenure)
    
    # Monthly Charges ($50 to $1200)
    # Larger companies pay more
    base_tier = np.random.choice(["Starter", "Professional", "Enterprise"], size=n_samples, p=[0.45, 0.35, 0.20])
    monthly_charges = []
    for b in base_tier:
        if b == "Starter":
            m = np.random.normal(loc=85, scale=25)
        elif b == "Professional":
            m = np.random.normal(loc=280, scale=60)
        else:
            m = np.random.normal(loc=750, scale=180)
        monthly_charges.append(round(float(np.clip(m, 29.0, 1500.0)), 2))
    monthly_charges = np.array(monthly_charges)
    
    # Payment Method
    payment_methods = np.random.choice(
        ["Electronic Check", "Credit Card", "Bank Transfer", "Manual Invoice"],
        size=n_samples,
        p=[0.38, 0.32, 0.20, 0.10]
    )
    
    # Has Tech Support
    has_tech_support = np.random.choice([True, False], size=n_samples, p=[0.42, 0.58])
    
    # Feature Adoption Rate (0 to 100%)
    feature_adoption_rate = np.clip(
        np.random.normal(loc=55, scale=20, size=n_samples) + (tenure * 0.3),
        5.0, 98.0
    ).round(1)
    
    # Support tickets in past 90 days (skewed right)
    support_tickets_90d = np.random.negative_binomial(n=2, p=0.4, size=n_samples)
    support_tickets_90d = np.clip(support_tickets_90d, 0, 18)
    
    # Late payments count in past year
    late_payments = np.random.poisson(lam=0.7, size=n_samples)
    late_payments = np.clip(late_payments, 0, 8)
    
    # Usage trend percentage (-80% to +80%)
    usage_trend_pct = np.clip(
        np.random.normal(loc=5, scale=25, size=n_samples) - (late_payments * 5) - (support_tickets_90d * 3),
        -85.0, 85.0
    ).round(1)
    
    # NPS Score (0-10)
    nps_score = np.clip(
        np.random.normal(loc=7.2, scale=2.0, size=n_samples) 
        - (support_tickets_90d * 0.4) 
        + (1.0 if has_tech_support.any() else 0.0) 
        + (usage_trend_pct * 0.03),
        0, 10
    ).round().astype(int)
    
    # Realistic Churn Probability Logit Model
    # Higher risk: Month-to-Month, short tenure, high tickets, low feature adoption, late payments, negative usage trend, low NPS, electronic check, no tech support
    logit = (
        -0.8  # baseline
        - 0.045 * tenure
        + 0.0008 * (monthly_charges - 150)
        + 1.35 * (contract_types == "Month-to-Month")
        - 0.85 * (contract_types == "Two-Year")
        + 0.35 * (payment_methods == "Electronic Check")
        - 0.30 * (payment_methods == "Bank Transfer")
        + 0.28 * support_tickets_90d
        - 0.025 * (feature_adoption_rate - 50)
        + 0.45 * late_payments
        - 0.32 * (nps_score - 5)
        - 0.40 * has_tech_support.astype(int)
        - 0.022 * usage_trend_pct
        + np.random.normal(0, 0.45, size=n_samples) # Realistic noise
    )
    
    probabilities = 1.0 / (1.0 + np.exp(-logit))
    churned = (probabilities > 0.50).astype(int)
    
    df = pd.DataFrame({
        "customer_id": customer_ids,
        "company_name": company_names,
        "tenure_months": tenure,
        "monthly_charges": monthly_charges,
        "contract_type": contract_types,
        "payment_method": payment_methods,
        "has_tech_support": has_tech_support,
        "feature_adoption_rate": feature_adoption_rate,
        "support_tickets_90d": support_tickets_90d,
        "late_payments_count": late_payments,
        "usage_trend_pct": usage_trend_pct,
        "nps_score": nps_score,
        "churn_probability_latent": probabilities.round(4),
        "churn": churned
    })
    
    return df

if __name__ == "__main__":
    df = generate_enterprise_dataset()
    print(f"Generated {len(df)} samples.")
    print("Overall churn rate:", round(df['churn'].mean() * 100, 2), "%")
    print(df.head())
