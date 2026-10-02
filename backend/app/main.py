import io
import os
import pandas as pd
from dotenv import load_dotenv
from fastapi import Depends, FastAPI, UploadFile, File, HTTPException, Request, Response
from fastapi.middleware.cors import CORSMiddleware

from app.schemas import (
    CustomerProfile, PredictionResponse, WhatIfSimulationRequest, 
    WhatIfSimulationResponse, ModelMetrics, DatasetSummary
)
from app.predictor import (
    predict_single, simulate_what_if, predict_batch_df, 
    get_artifacts
)
from app.model_trainer import (
    train_and_save_pipeline, get_dataset_summary
)
from app.assistant import (
    AIAssistantRequest, AIAssistantResolution, resolve_customer_issue
)
from app.security import require_user, rate_limiter, sanitize_string, get_security_posture
from app.database import (
    init_db, get_all_accounts, save_account, save_accounts_batch, delete_account, clear_all_accounts,
    get_notes_for_account, save_note, get_workspace_setting, set_workspace_setting
)
from contextlib import asynccontextmanager
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

load_dotenv()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize SQLite database schema
    try:
        init_db()
    except Exception as e:
        print(f"Database initialization warning: {e}")

    # Ensure models and datasets are generated and initialized
    try:
        get_artifacts()
    except Exception as e:
        print(f"Initializing model pipeline on startup: {e}")
        train_and_save_pipeline()
    yield

app = FastAPI(
    title="Kairon ML - Enterprise Predictive Analytics Engine",
    description="Production-grade Machine Learning API for Customer Churn Prediction, Explainability, and Retention Strategies",
    version="1.0.0",
    lifespan=lifespan
)

allowed_origins = [origin.strip() for origin in os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1)(:\d+)?",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def security_and_rate_limit_middleware(request: Request, call_next):
    # Rate limiting protection
    client_ip = request.client.host if request.client else "unknown"
    if request.url.path.startswith("/api/") and not request.url.path.startswith("/api/health"):
        if not rate_limiter.is_allowed(client_ip):
            return Response(
                content='{"detail":"Rate limit exceeded. Maximum 120 requests per minute."}',
                status_code=429,
                media_type="application/json"
            )

    response = await call_next(request)

    # Security headers (OWASP Top 10 compliance)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = (
        "default-src 'self'; "
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; "
        "font-src 'self' https://fonts.gstatic.com data:; "
        "img-src 'self' data: https: blob:; "
        "connect-src 'self' https: wss:; "
        "script-src 'self' 'unsafe-inline'; "
        "frame-ancestors 'none';"
    )

    return response

dist_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))

# Mount assets directory if dist exists
if os.path.isdir(os.path.join(dist_dir, "assets")):
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_dir, "assets")), name="assets")

@app.get("/api/status")
def api_status():
    return {
        "status": "online",
        "service": "Kairon ML Analytics API",
        "docs_url": "/docs"
    }

@app.get("/")
def root(request: Request):
    if "application/json" in request.headers.get("accept", ""):
        return {
            "status": "online",
            "service": "Kairon ML Analytics API",
            "docs_url": "/docs"
        }
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    return {
        "status": "online",
        "service": "Kairon ML Analytics API",
        "docs_url": "/docs"
    }

@app.get("/api/health")
def health_check():
    _, _, metadata = get_artifacts()
    return {
        "status": "healthy",
        "model_loaded": True,
        "model_name": metadata.get("model_name"),
        "roc_auc": metadata.get("roc_auc"),
        "accuracy": metadata.get("accuracy"),
        "version": metadata.get("version")
    }

@app.get("/api/model/metrics", response_model=ModelMetrics)
def get_metrics():
    _, _, metadata = get_artifacts()
    return metadata

@app.get("/api/dataset/summary")
def get_summary(_: dict = Depends(require_user)):
    return get_dataset_summary()

@app.get("/api/security/audit")
def security_audit():
    return get_security_posture()

@app.post("/api/predict", response_model=PredictionResponse)
def predict(profile: CustomerProfile, _: dict = Depends(require_user)):
    try:
        # Sanitize text fields against injection
        if profile.company_name:
            profile.company_name = sanitize_string(profile.company_name)
        if profile.customer_id:
            profile.customer_id = sanitize_string(profile.customer_id)
        return predict_single(profile)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/simulate", response_model=WhatIfSimulationResponse)
def simulate(request: WhatIfSimulationRequest, _: dict = Depends(require_user)):
    try:
        return simulate_what_if(request.baseline, request.simulated)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/predict/batch")
async def batch_predict(file: UploadFile = File(...), _: dict = Depends(require_user)):
    if not file.filename.endswith(".csv"):
        raise HTTPException(status_code=400, detail="Only CSV files are supported.")
    try:
        contents = await file.read()
        if len(contents) > 10 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="CSV file must be 10 MB or smaller.")
        df = pd.read_csv(io.StringIO(contents.decode("utf-8")))
        results = predict_batch_df(df)

        # Directly persist parsed and scored records to database
        db_accounts = []
        for p in results.get("predictions", []):
            cid = str(p.get("customer_id", ""))
            cname = str(p.get("company_name", ""))
            mrr = float(p.get("monthly_charges", 0))
            churn_p = float(p.get("churn_probability", 0))
            db_accounts.append({
                "id": f"cohort-{cid}",
                "customer_id": cid,
                "company_name": cname,
                "monthly_charges": mrr,
                "churn_probability": churn_p,
                "risk_tier": p.get("risk_tier", "Low"),
                "risk_color": p.get("risk_color", "#238b67"),
                "revenue_at_risk": float(p.get("revenue_at_risk", 0)),
                "estimated_clv": mrr * 24,
                "profile": {
                    "customer_id": cid,
                    "company_name": cname,
                    "monthly_charges": mrr,
                    "tenure_months": 12,
                    "contract_type": p.get("contract_type", "One-Year"),
                    "payment_method": "Credit Card",
                    "support_tickets_90d": int(p.get("support_tickets_90d", 1)),
                    "feature_adoption_rate": 65,
                    "late_payments_count": 0,
                    "nps_score": int(p.get("nps_score", 8)),
                    "has_tech_support": True,
                    "usage_trend_pct": 5
                }
            })
        if db_accounts:
            save_accounts_batch(db_accounts)

        return results
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to process CSV: {str(e)}")

@app.get("/api/cohort/template")
def get_cohort_template():
    csv_template = (
        "customer_id,company_name,tenure_months,monthly_charges,contract_type,payment_method,support_tickets_90d,feature_adoption_rate,late_payments_count,nps_score,has_tech_support,usage_trend_pct\n"
        "ENT-101,Acme Enterprise Cloud,24,4200.0,One-Year,Credit Card,1,85.0,0,9,True,15.0\n"
        "ENT-102,Global Logistics Tech,8,1850.0,Month-to-Month,Electronic Check,4,42.0,1,5,False,-12.0\n"
    )
    return Response(
        content=csv_template,
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=kairon_cohort_template.csv"}
    )

@app.post("/api/cohort/load-enterprise-sample")
def load_enterprise_sample(_: dict = Depends(require_user)):
    """Loads enterprise customer sample directly from backend server and stores into database."""
    sample_file_path = os.path.join(os.path.dirname(__file__), "sample_enterprise_cohort.csv")
    if not os.path.exists(sample_file_path):
        sample_file_path = os.path.join(os.path.dirname(__file__), "dataset.csv")
    
    df = pd.read_csv(sample_file_path)
    if "company_name" not in df.columns:
        df["company_name"] = [f"Enterprise Corp {i+1}" for i in range(len(df))]
    if "customer_id" not in df.columns:
        df["customer_id"] = [f"ENT-{100+i}" for i in range(len(df))]
    
    df_sample = df.head(25)
    results = predict_batch_df(df_sample)
    
    db_accounts = []
    for p in results.get("predictions", []):
        cid = str(p.get("customer_id", ""))
        cname = str(p.get("company_name", ""))
        mrr = float(p.get("monthly_charges", 0))
        churn_p = float(p.get("churn_probability", 0))
        db_accounts.append({
            "id": f"cohort-{cid}",
            "customer_id": cid,
            "company_name": cname,
            "monthly_charges": mrr,
            "churn_probability": churn_p,
            "risk_tier": p.get("risk_tier", "Low"),
            "risk_color": p.get("risk_color", "#238b67"),
            "revenue_at_risk": float(p.get("revenue_at_risk", 0)),
            "estimated_clv": mrr * 24,
            "profile": {
                "customer_id": cid,
                "company_name": cname,
                "monthly_charges": mrr,
                "tenure_months": 12,
                "contract_type": p.get("contract_type", "One-Year"),
                "payment_method": "Credit Card",
                "support_tickets_90d": int(p.get("support_tickets_90d", 1)),
                "feature_adoption_rate": 65,
                "late_payments_count": 0,
                "nps_score": int(p.get("nps_score", 8)),
                "has_tech_support": True,
                "usage_trend_pct": 5
            }
        })
    if db_accounts:
        save_accounts_batch(db_accounts)

    return results

@app.post("/api/model/retrain")
def retrain_model(_: dict = Depends(require_user)):
    try:
        metadata = train_and_save_pipeline(force_regenerate=True)
        # Clear cache in predictor
        import app.predictor as pred
        pred._cached_model = None
        pred._cached_preprocessor = None
        pred._cached_metadata = None
        return {
            "status": "success",
            "message": "Model retrained and benchmarked successfully.",
            "metrics": metadata
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/ai/resolve", response_model=AIAssistantResolution)
def ai_resolve_problem(request: AIAssistantRequest, _: dict = Depends(require_user)):
    try:
        return resolve_customer_issue(request)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ==========================================
# Database & Workspace Persistence Endpoints
# ==========================================

@app.get("/api/accounts")
def list_accounts(_: dict = Depends(require_user)):
    return get_all_accounts()

@app.post("/api/accounts")
def create_account(account: dict, _: dict = Depends(require_user)):
    try:
        return save_account(account)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/api/accounts/{account_id}")
def remove_account(account_id: str, _: dict = Depends(require_user)):
    deleted = delete_account(account_id)
    return {"success": deleted}

@app.delete("/api/accounts")
def remove_all_accounts(_: dict = Depends(require_user)):
    clear_all_accounts()
    return {"success": True}

@app.get("/api/reviews/{account_id}/notes")
def get_account_notes(account_id: str, _: dict = Depends(require_user)):
    return get_notes_for_account(account_id)

@app.post("/api/reviews/{account_id}/notes")
def add_account_note(account_id: str, note_data: dict, _: dict = Depends(require_user)):
    note_data["account_id"] = account_id
    return save_note(note_data)

@app.get("/api/workspace")
def get_workspace(_: dict = Depends(require_user)):
    return {"workspace_name": get_workspace_setting("workspace_name", "My Workspace")}

@app.post("/api/workspace")
def update_workspace(data: dict, _: dict = Depends(require_user)):
    name = data.get("workspace_name", "").strip()
    if name:
        set_workspace_setting("workspace_name", name)
    return {"workspace_name": name}


# ==========================================
# SPA Fallback for Built Frontend Pages
# ==========================================

@app.get("/{full_path:path}")
async def serve_frontend_spa(full_path: str):
    # Don't intercept API or docs routes
    if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
        raise HTTPException(status_code=404, detail="Not Found")
    
    file_path = os.path.join(dist_dir, full_path)
    if os.path.isfile(file_path):
        return FileResponse(file_path)
    
    index_path = os.path.join(dist_dir, "index.html")
    if os.path.isfile(index_path):
        return FileResponse(index_path)
    
    raise HTTPException(status_code=404, detail="Page not found")



