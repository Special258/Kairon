"""
Kairon ML - Enterprise Customer Relationship Intelligence Engine
================================================================

Production-grade Machine Learning API and Analytics Engine for
predictive customer churn analysis, feature importance explainability,
prescriptive retention playbooks, What-If simulation sandboxing,
and end-to-end encrypted account persistence.
"""

__version__ = "1.0.0"
__author__ = "Kairon Engineering"

from app.schemas import (
    CustomerProfile,
    PredictionResponse,
    FeatureImpact,
    PrescriptiveAction,
    WhatIfSimulationRequest,
    WhatIfSimulationResponse,
    ModelMetrics,
    DatasetSummary,
)

from app.predictor import (
    predict_single,
    simulate_what_if,
    predict_batch_df,
    get_artifacts,
)

from app.assistant import (
    AIAssistantRequest,
    AIAssistantResolution,
    AIIntervention,
    resolve_customer_issue,
)

from app.database import (
    init_db,
    get_db_connection,
    get_all_accounts,
    save_account,
    save_accounts_batch,
    delete_account,
    clear_all_accounts,
    get_notes_for_account,
    save_note,
    get_workspace_setting,
    set_workspace_setting,
)

from app.model_trainer import (
    train_and_save_pipeline,
    get_dataset_summary,
    NUMERICAL_FEATURES,
    CATEGORICAL_FEATURES,
    FEATURE_DISPLAY_NAMES,
)

from app.security import (
    require_user,
    sanitize_string,
    get_security_posture,
    rate_limiter,
)

__all__ = [
    # Version metadata
    "__version__",
    "__author__",
    # Data models & schemas
    "CustomerProfile",
    "PredictionResponse",
    "FeatureImpact",
    "PrescriptiveAction",
    "WhatIfSimulationRequest",
    "WhatIfSimulationResponse",
    "ModelMetrics",
    "DatasetSummary",
    # Inference & prediction
    "predict_single",
    "simulate_what_if",
    "predict_batch_df",
    "get_artifacts",
    # AI Copilot & Resolution
    "AIAssistantRequest",
    "AIAssistantResolution",
    "AIIntervention",
    "resolve_customer_issue",
    # Database operations
    "init_db",
    "get_db_connection",
    "get_all_accounts",
    "save_account",
    "save_accounts_batch",
    "delete_account",
    "clear_all_accounts",
    "get_notes_for_account",
    "save_note",
    "get_workspace_setting",
    "set_workspace_setting",
    # Training & dataset telemetry
    "train_and_save_pipeline",
    "get_dataset_summary",
    "NUMERICAL_FEATURES",
    "CATEGORICAL_FEATURES",
    "FEATURE_DISPLAY_NAMES",
    # Security controls
    "require_user",
    "sanitize_string",
    "get_security_posture",
    "rate_limiter",
]
