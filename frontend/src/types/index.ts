export type Page = 'overview' | 'scorer' | 'whatif' | 'customers' | 'reviews' | 'model' | 'profile' | 'settings';

export interface CustomerProfile {
  customer_id?: string;
  company_name?: string;
  tenure_months: number;
  monthly_charges: number;
  contract_type: 'Month-to-Month' | 'One-Year' | 'Two-Year';
  payment_method: 'Electronic Check' | 'Credit Card' | 'Bank Transfer' | 'Manual Invoice';
  support_tickets_90d: number;
  feature_adoption_rate: number;
  late_payments_count: number;
  nps_score: number;
  has_tech_support: boolean;
  usage_trend_pct: number;
}

export interface FeatureImpact {
  feature_name: string;
  display_name: string;
  impact_score: number;
  impact_type: 'risk_increasing' | 'risk_reducing';
  current_value: string | number | boolean;
  benchmark_value: string | number;
  description: string;
}

export interface PrescriptiveAction {
  title: string;
  urgency: 'High' | 'Medium' | 'Low';
  category: 'Pricing' | 'Support' | 'Engagement' | 'Contract';
  description: string;
  estimated_risk_reduction_pct: number;
}

export interface PredictionResponse {
  churn_probability: number;
  risk_tier: 'Low' | 'Moderate' | 'High' | 'Critical';
  risk_color: string;
  predicted_churn: boolean;
  estimated_clv: number;
  revenue_at_risk: number;
  top_drivers: FeatureImpact[];
  retention_playbook: PrescriptiveAction[];
  model_version: string;
  model_name: string;
}

export interface WhatIfSimulationRequest {
  baseline: CustomerProfile;
  simulated: CustomerProfile;
}

export interface WhatIfSimulationResponse {
  baseline_prediction: PredictionResponse;
  simulated_prediction: PredictionResponse;
  probability_delta: number;
  revenue_saved: number;
  key_interventions_identified: string[];
}

export interface ModelMetrics {
  model_name: string;
  version: string;
  roc_auc: number;
  accuracy: number;
  precision: number;
  recall: number;
  f1_score: number;
  confusion_matrix: {
    true_negatives: number;
    false_positives: number;
    false_negatives: number;
    true_positives: number;
  };
  roc_curve: Array<{ fpr: number; tpr: number }>;
  feature_importances: Array<{
    feature: string;
    display_name: string;
    importance: number;
    importance_pct: number;
  }>;
  total_training_samples: number;
  test_samples: number;
}

export interface DatasetSummary {
  total_customers: number;
  overall_churn_rate: number;
  avg_mrr: number;
  total_mrr: number;
  churn_by_contract: Record<string, number>;
  churn_by_payment: Record<string, number>;
  tenure_distribution: Record<string, number>;
  sample_records: Array<Record<string, any>>;
}

export interface BatchItemResult {
  customer_id: string;
  company_name: string;
  churn_probability: number;
  risk_tier: 'Low' | 'Moderate' | 'High' | 'Critical';
  risk_color: string;
  monthly_charges: number;
  revenue_at_risk: number;
  contract_type: string;
  support_tickets_90d: number;
  nps_score: number;
}

export interface BatchPredictResponse {
  total_records: number;
  avg_churn_probability: number;
  high_risk_count: number;
  total_revenue_at_risk: number;
  risk_distribution: {
    Low: number;
    Moderate: number;
    High: number;
    Critical: number;
  };
  predictions: BatchItemResult[];
}

export interface AIIntervention {
  id: string;
  title: string;
  category: 'Commercial' | 'Technical' | 'Executive' | 'Product';
  impact: string;
  description: string;
  suggested_changes?: Partial<CustomerProfile>;
}

export interface AIAssistantResolution {
  problem_title: string;
  severity: 'Critical' | 'High' | 'Medium' | 'Low';
  severity_color: string;
  diagnosis_summary: string;
  root_causes: string[];
  estimated_revenue_at_risk: number;
  recommended_interventions: AIIntervention[];
  executive_outreach_draft: {
    recipient: string;
    subject: string;
    body: string;
  };
  step_by_step_playbook: string[];
  suggested_whatif_baseline?: CustomerProfile;
  suggested_whatif_simulated?: CustomerProfile;
}

export interface AIAssistantRequest {
  problem_type?: string;
  custom_query?: string;
  profile?: CustomerProfile;
}

