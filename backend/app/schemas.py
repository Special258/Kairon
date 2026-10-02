from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field

class CustomerProfile(BaseModel):
    customer_id: Optional[str] = Field(default="CUST-8821")
    company_name: Optional[str] = Field(default="Acme Corp")
    tenure_months: int = Field(default=12, ge=0, le=360, description="Customer tenure in months")
    monthly_charges: float = Field(default=150.0, ge=0.0, le=1000000.0, description="Monthly recurring revenue in USD")
    contract_type: str = Field(default="Month-to-Month", description="Month-to-Month, One-Year, Two-Year")
    payment_method: str = Field(default="Electronic Check", description="Electronic Check, Credit Card, Bank Transfer, Manual Invoice")
    support_tickets_90d: int = Field(default=4, ge=0, le=500, description="Support tickets logged in past 90 days")
    feature_adoption_rate: float = Field(default=45.0, ge=0.0, le=100.0, description="Feature adoption percentage")
    late_payments_count: int = Field(default=1, ge=0, le=36, description="Number of late invoices")
    nps_score: int = Field(default=6, ge=0, le=10, description="Net Promoter Score (0-10)")
    has_tech_support: bool = Field(default=False, description="Has dedicated technical support tier")
    usage_trend_pct: float = Field(default=-15.0, ge=-100.0, le=500.0, description="Usage growth or dip percentage over 90 days")

class FeatureImpact(BaseModel):
    feature_name: str
    display_name: str
    impact_score: float # positive increases churn risk, negative decreases churn risk
    impact_type: str # "risk_increasing" or "risk_reducing"
    current_value: Any
    benchmark_value: Any
    description: str

class PrescriptiveAction(BaseModel):
    title: str
    urgency: str # "High", "Medium", "Low"
    category: str # "Pricing", "Support", "Engagement", "Contract"
    description: str
    estimated_risk_reduction_pct: float

class PredictionResponse(BaseModel):
    churn_probability: float # e.g. 74.2
    risk_tier: str # "Low", "Moderate", "High", "Critical"
    risk_color: str # hex color
    predicted_churn: bool
    estimated_clv: float
    revenue_at_risk: float
    top_drivers: List[FeatureImpact]
    retention_playbook: List[PrescriptiveAction]
    model_version: str
    model_name: str

class WhatIfSimulationRequest(BaseModel):
    baseline: CustomerProfile
    simulated: CustomerProfile

class WhatIfSimulationResponse(BaseModel):
    baseline_prediction: PredictionResponse
    simulated_prediction: PredictionResponse
    probability_delta: float # e.g. -24.5
    revenue_saved: float
    key_interventions_identified: List[str]

class ModelMetrics(BaseModel):
    model_name: str
    version: str = "1.0.0"
    roc_auc: float
    accuracy: float
    precision: float
    recall: float
    f1_score: float
    confusion_matrix: Dict[str, int]
    roc_curve: List[Dict[str, float]]
    feature_importances: List[Dict[str, Any]]
    total_training_samples: int
    test_samples: int

class DatasetSummary(BaseModel):
    total_customers: int
    overall_churn_rate: float
    avg_mrr: float
    total_mrr: float
    churn_by_contract: Dict[str, float]
    churn_by_payment: Dict[str, float]
    tenure_distribution: Dict[str, int]
    sample_records: List[Dict[str, Any]]
