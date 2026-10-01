import os
import json
import joblib
import numpy as np
import pandas as pd
from typing import Dict, Any, Tuple
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (
    roc_auc_score, accuracy_score, precision_score, 
    recall_score, f1_score, confusion_matrix, roc_curve
)

from app.data_generator import generate_enterprise_dataset

MODELS_DIR = os.path.join(os.path.dirname(os.path.dirname(__file__)), "models")
DATASET_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "app", "dataset.csv")

NUMERICAL_FEATURES = [
    "tenure_months",
    "monthly_charges",
    "feature_adoption_rate",
    "support_tickets_90d",
    "late_payments_count",
    "usage_trend_pct",
    "nps_score"
]

CATEGORICAL_FEATURES = [
    "contract_type",
    "payment_method",
    "has_tech_support"
]

FEATURE_DISPLAY_NAMES = {
    "tenure_months": "Contract Tenure (Months)",
    "monthly_charges": "Monthly Charges (MRR)",
    "feature_adoption_rate": "Feature Adoption Rate",
    "support_tickets_90d": "Support Tickets (90d)",
    "late_payments_count": "Late Invoices Count",
    "usage_trend_pct": "Usage Velocity Trend",
    "nps_score": "Net Promoter Score (NPS)",
    "contract_type_Month-to-Month": "Contract: Month-to-Month",
    "contract_type_One-Year": "Contract: 1 Year Term",
    "contract_type_Two-Year": "Contract: 2 Year Term",
    "payment_method_Electronic Check": "Payment: Electronic Check",
    "payment_method_Credit Card": "Payment: Credit Card",
    "payment_method_Bank Transfer": "Payment: Bank Transfer",
    "payment_method_Manual Invoice": "Payment: Manual Invoice",
    "has_tech_support_True": "Tech Support: Enrolled",
    "has_tech_support_False": "Tech Support: None"
}

def train_and_save_pipeline(force_regenerate: bool = True) -> Dict[str, Any]:
    os.makedirs(MODELS_DIR, exist_ok=True)
    
    # 1. Dataset generation / load
    if force_regenerate or not os.path.exists(DATASET_PATH):
        df = generate_enterprise_dataset(n_samples=3500)
        df.to_csv(DATASET_PATH, index=False)
    else:
        df = pd.read_csv(DATASET_PATH)
    
    X = df[NUMERICAL_FEATURES + CATEGORICAL_FEATURES]
    y = df["churn"]
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.20, random_state=42, stratify=y
    )
    
    # 2. Preprocessor
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), NUMERICAL_FEATURES),
            ("cat", OneHotEncoder(drop=None, handle_unknown="ignore", sparse_output=False), CATEGORICAL_FEATURES)
        ]
    )
    
    X_train_transformed = preprocessor.fit_transform(X_train)
    X_test_transformed = preprocessor.transform(X_test)
    
    # Get transformed feature names
    cat_encoder = preprocessor.named_transformers_["cat"]
    cat_feature_names = list(cat_encoder.get_feature_names_out(CATEGORICAL_FEATURES))
    all_feature_names = NUMERICAL_FEATURES + cat_feature_names
    
    # 3. Model benchmarking
    models = {
        "Gradient Boosting Classifier": GradientBoostingClassifier(
            n_estimators=140, learning_rate=0.07, max_depth=4, random_state=42
        ),
        "Random Forest Classifier": RandomForestClassifier(
            n_estimators=150, max_depth=10, min_samples_split=4, random_state=42
        ),
        "Logistic Regression": LogisticRegression(
            max_iter=1000, C=1.0, random_state=42
        )
    }
    
    best_model_name = None
    best_model = None
    best_roc_auc = -1.0
    all_evaluations = {}
    
    for name, model in models.items():
        model.fit(X_train_transformed, y_train)
        y_probs = model.predict_proba(X_test_transformed)[:, 1]
        y_preds = model.predict(X_test_transformed)
        
        auc = float(roc_auc_score(y_test, y_probs))
        acc = float(accuracy_score(y_test, y_preds))
        prec = float(precision_score(y_test, y_preds, zero_division=0))
        rec = float(recall_score(y_test, y_preds, zero_division=0))
        f1 = float(f1_score(y_test, y_preds, zero_division=0))
        
        all_evaluations[name] = {
            "roc_auc": round(auc, 4),
            "accuracy": round(acc, 4),
            "precision": round(prec, 4),
            "recall": round(rec, 4),
            "f1_score": round(f1, 4)
        }
        
        if auc > best_roc_auc:
            best_roc_auc = auc
            best_model_name = name
            best_model = model
            
    # Calculate detailed metrics for winning model
    y_best_probs = best_model.predict_proba(X_test_transformed)[:, 1]
    y_best_preds = best_model.predict(X_test_transformed)
    
    cm = confusion_matrix(y_test, y_best_preds)
    # cm format: [[TN, FP], [FN, TP]]
    cm_dict = {
        "true_negatives": int(cm[0][0]),
        "false_positives": int(cm[0][1]),
        "false_negatives": int(cm[1][0]),
        "true_positives": int(cm[1][1])
    }
    
    fpr, tpr, _ = roc_curve(y_test, y_best_probs)
    # Sample 25 ROC points for sleek frontend rendering
    indices = np.linspace(0, len(fpr) - 1, min(30, len(fpr))).astype(int)
    roc_curve_points = [
        {"fpr": round(float(fpr[i]), 3), "tpr": round(float(tpr[i]), 3)} 
        for i in indices
    ]
    if roc_curve_points[-1]["fpr"] < 1.0:
        roc_curve_points.append({"fpr": 1.0, "tpr": 1.0})
    
    # Feature importances
    if hasattr(best_model, "feature_importances_"):
        raw_importances = best_model.feature_importances_
    elif hasattr(best_model, "coef_"):
        raw_importances = np.abs(best_model.coef_[0])
    else:
        raw_importances = np.ones(len(all_feature_names)) / len(all_feature_names)
        
    feat_imp = []
    for fn, imp in zip(all_feature_names, raw_importances):
        feat_imp.append({
            "feature": fn,
            "display_name": FEATURE_DISPLAY_NAMES.get(fn, fn.replace("_", " ").title()),
            "importance": round(float(imp), 4),
            "importance_pct": round(float(imp) * 100, 2)
        })
    feat_imp = sorted(feat_imp, key=lambda x: x["importance"], reverse=True)
    
    # Save artifacts
    joblib.dump(best_model, os.path.join(MODELS_DIR, "best_model.joblib"))
    joblib.dump(preprocessor, os.path.join(MODELS_DIR, "preprocessor.joblib"))
    
    metadata = {
        "model_name": best_model_name,
        "version": "1.0.0",
        "roc_auc": round(best_roc_auc, 4),
        "accuracy": all_evaluations[best_model_name]["accuracy"],
        "precision": all_evaluations[best_model_name]["precision"],
        "recall": all_evaluations[best_model_name]["recall"],
        "f1_score": all_evaluations[best_model_name]["f1_score"],
        "confusion_matrix": cm_dict,
        "roc_curve": roc_curve_points,
        "feature_importances": feat_imp,
        "feature_names": all_feature_names,
        "numerical_features": NUMERICAL_FEATURES,
        "categorical_features": CATEGORICAL_FEATURES,
        "all_model_evaluations": all_evaluations,
        "total_training_samples": len(X_train),
        "test_samples": len(X_test)
    }
    
    with open(os.path.join(MODELS_DIR, "metadata.json"), "w") as f:
        json.dump(metadata, f, indent=2)
        
    return metadata

def get_dataset_summary() -> Dict[str, Any]:
    if not os.path.exists(DATASET_PATH):
        train_and_save_pipeline()
        
    df = pd.read_csv(DATASET_PATH)
    
    churn_by_contract = df.groupby("contract_type")["churn"].mean().to_dict()
    churn_by_contract = {k: round(float(v) * 100, 1) for k, v in churn_by_contract.items()}
    
    churn_by_payment = df.groupby("payment_method")["churn"].mean().to_dict()
    churn_by_payment = {k: round(float(v) * 100, 1) for k, v in churn_by_payment.items()}
    
    tenure_bins = pd.cut(df["tenure_months"], bins=[0, 12, 24, 48, 100], labels=["0-12m", "13-24m", "25-48m", "49m+"])
    tenure_dist = tenure_bins.value_counts().to_dict()
    tenure_dist = {str(k): int(v) for k, v in tenure_dist.items()}
    
    sample_records = df.head(15).to_dict(orient="records")
    
    return {
        "total_customers": len(df),
        "overall_churn_rate": round(float(df["churn"].mean()) * 100, 1),
        "avg_mrr": round(float(df["monthly_charges"].mean()), 2),
        "total_mrr": round(float(df["monthly_charges"].sum()), 2),
        "churn_by_contract": churn_by_contract,
        "churn_by_payment": churn_by_payment,
        "tenure_distribution": tenure_dist,
        "sample_records": sample_records
    }

if __name__ == "__main__":
    print("Training and benchmarking models...")
    meta = train_and_save_pipeline(force_regenerate=True)
    print("Training complete! Selected model:", meta["model_name"])
    print("ROC-AUC:", meta["roc_auc"])
    print("Accuracy:", meta["accuracy"])

