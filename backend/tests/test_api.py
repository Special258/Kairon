"""
Pre-deployment automated test suite for Kairon ML Analytics API.
Verifies health, security posture, model inference, explainability, rate limiting, and input sanitization.
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.security import SimpleRateLimiter, sanitize_string

client = TestClient(app)

# Helper headers for authenticated endpoints using demo token
DEMO_HEADERS = {"Authorization": "Bearer demo-session-token"}


def test_root():
    response = client.get("/", headers={"Accept": "application/json"})
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "online"
    assert "Kairon ML" in data["service"]

def test_frontend_production_serving():
    response = client.get("/")
    assert response.status_code == 200
    # Returns the built index.html or API status
    assert len(response.content) > 0


def test_health_endpoint():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "healthy"
    assert data["model_loaded"] is True
    assert "roc_auc" in data
    assert "accuracy" in data
    assert data["roc_auc"] > 0.70


def test_security_audit_endpoint():
    response = client.get("/api/security/audit")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "secure"
    assert data["transport_security"]["hsts_enabled"] is True
    assert data["transport_security"]["x_frame_options"] == "DENY"
    assert data["transport_security"]["x_content_type_options"] == "nosniff"
    assert data["authentication"]["rate_limiting_active"] is True
    assert data["e2ee_protocol"]["status"] == "active"


def test_security_headers_in_response():
    response = client.get("/api/health")
    assert response.headers.get("x-frame-options") == "DENY"
    assert response.headers.get("x-content-type-options") == "nosniff"
    assert "max-age=31536000" in response.headers.get("strict-transport-security", "")
    assert "frame-ancestors 'none'" in response.headers.get("content-security-policy", "")


def test_model_metrics():
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    data = response.json()
    assert "roc_auc" in data
    assert "accuracy" in data
    assert "feature_importances" in data
    assert len(data["feature_importances"]) > 0


def test_predict_single_with_auth():
    payload = {
        "tenure_months": 24,
        "monthly_charges": 450.0,
        "contract_type": "One-Year",
        "payment_method": "Credit Card",
        "support_tickets_90d": 1,
        "feature_adoption_rate": 75.0,
        "late_payments_count": 0,
        "nps_score": 8.0,
        "has_tech_support": True,
        "usage_trend_pct": 12.0,
        "company_name": "Acme Global",
        "customer_id": "ACME-1001"
    }
    response = client.post("/api/predict", json=payload, headers=DEMO_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "churn_probability" in data
    assert 0 <= data["churn_probability"] <= 100
    assert data["risk_tier"] in ["Low", "Moderate", "High", "Critical"]
    assert "top_drivers" in data
    assert len(data["top_drivers"]) > 0
    assert "retention_playbook" in data
    assert len(data["retention_playbook"]) > 0


def test_predict_requires_auth(monkeypatch):
    # Disable anonymous dev fallback to test production enforcement
    monkeypatch.setenv("ALLOW_DEV_ANONYMOUS", "false")
    payload = {
        "tenure_months": 12,
        "monthly_charges": 200.0,
        "contract_type": "Month-to-Month",
        "payment_method": "Electronic Check",
        "support_tickets_90d": 4,
        "feature_adoption_rate": 30.0,
        "late_payments_count": 1,
        "nps_score": 5.0,
        "has_tech_support": False,
        "usage_trend_pct": -15.0
    }
    response = client.post("/api/predict", json=payload)
    assert response.status_code == 401


def test_input_sanitization():
    dirty_string = "<script>alert('xss')</script>Acme Corporation<img src=x onerror=alert(1)>"
    cleaned = sanitize_string(dirty_string)
    assert "<script>" not in cleaned
    assert "</script>" not in cleaned
    assert "onerror=" not in cleaned
    assert "Acme Corporation" in cleaned


def test_whatif_simulate():
    baseline = {
        "tenure_months": 12,
        "monthly_charges": 500.0,
        "contract_type": "Month-to-Month",
        "payment_method": "Electronic Check",
        "support_tickets_90d": 5,
        "feature_adoption_rate": 35.0,
        "late_payments_count": 2,
        "nps_score": 4.0,
        "has_tech_support": False,
        "usage_trend_pct": -20.0
    }
    simulated = dict(baseline)
    simulated["contract_type"] = "One-Year"
    simulated["has_tech_support"] = True
    simulated["usage_trend_pct"] = 15.0

    payload = {"baseline": baseline, "simulated": simulated}
    response = client.post("/api/simulate", json=payload, headers=DEMO_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "baseline_prediction" in data
    assert "simulated_prediction" in data
    assert "probability_delta" in data
    assert "revenue_saved" in data


def test_rate_limiter_logic():
    limiter = SimpleRateLimiter(max_requests=3, window_seconds=60)
    test_ip = "192.168.1.100"
    assert limiter.is_allowed(test_ip) is True
    assert limiter.is_allowed(test_ip) is True
    assert limiter.is_allowed(test_ip) is True
    # 4th request exceeds max_requests=3
    assert limiter.is_allowed(test_ip) is False


def test_batch_predict_csv():
    csv_content = (
        "customer_id,company_name,tenure_months,monthly_charges,contract_type,payment_method,support_tickets_90d,feature_adoption_rate,late_payments_count,nps_score,has_tech_support,usage_trend_pct\n"
        "CUST-001,Acme Corp,18,350.0,One-Year,Credit Card,1,72.0,0,8,True,10.0\n"
        "CUST-002,Beta Labs,4,180.0,Month-to-Month,Electronic Check,4,25.0,2,3,False,-25.0\n"
    )
    files = {"file": ("cohort_test.csv", csv_content.encode("utf-8"), "text/csv")}
    response = client.post("/api/predict/batch", files=files, headers=DEMO_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert data["total_records"] == 2
    assert "predictions" in data
    assert len(data["predictions"]) == 2
    assert "avg_churn_probability" in data
    assert "total_revenue_at_risk" in data


def test_batch_predict_invalid_extension():
    files = {"file": ("test.txt", b"invalid data", "text/plain")}
    response = client.post("/api/predict/batch", files=files, headers=DEMO_HEADERS)
    assert response.status_code == 400
    assert "CSV files are supported" in response.json()["detail"]


def test_dataset_summary():
    response = client.get("/api/dataset/summary", headers=DEMO_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "total_customers" in data
    assert data["total_customers"] > 0
    assert "overall_churn_rate" in data


def test_cors_preflight():
    headers = {
        "Origin": "http://localhost:5173",
        "Access-Control-Request-Method": "POST",
        "Access-Control-Request-Headers": "authorization,content-type"
    }
    response = client.options("/api/predict", headers=headers)
    assert response.status_code == 200
    assert response.headers.get("access-control-allow-origin") == "http://localhost:5173"


def test_predict_input_validation():
    # Negative tenure should fail pydantic schema validation
    invalid_payload = {
        "tenure_months": -5,
        "monthly_charges": 200.0,
        "contract_type": "InvalidContractType",
        "payment_method": "Credit Card"
    }
    response = client.post("/api/predict", json=invalid_payload, headers=DEMO_HEADERS)
    assert response.status_code == 422


def test_ai_assistant_resolution():
    payload = {
        "problem_type": "champion_left",
        "custom_query": "Our executive champion departed and usage dropped 25%",
        "profile": {
            "company_name": "Lattice Cloud",
            "customer_id": "LC-9002",
            "monthly_charges": 680.0,
            "tenure_months": 16,
            "contract_type": "Month-to-Month",
            "payment_method": "Credit Card",
            "support_tickets_90d": 3,
            "feature_adoption_rate": 42.0,
            "late_payments_count": 0,
            "nps_score": 6,
            "has_tech_support": False,
            "usage_trend_pct": -25.0
        }
    }
    response = client.post("/api/ai/resolve", json=payload, headers=DEMO_HEADERS)
    assert response.status_code == 200
    data = response.json()
    assert "problem_title" in data
    assert "severity" in data
    assert len(data["root_causes"]) > 0
    assert len(data["recommended_interventions"]) > 0
    assert "executive_outreach_draft" in data
    assert "subject" in data["executive_outreach_draft"]
    assert "body" in data["executive_outreach_draft"]
    assert len(data["step_by_step_playbook"]) > 0
    assert data["estimated_revenue_at_risk"] > 0


def test_database_account_crud():
    test_account = {
        "id": "test_acc_999",
        "customer_id": "TEST-999",
        "company_name": "Test Integration Corp",
        "monthly_charges": 850.0,
        "churn_probability": 12.5,
        "risk_tier": "Low",
        "risk_color": "#238b67",
        "revenue_at_risk": 106.25,
        "estimated_clv": 25000.0,
        "profile": {"company_name": "Test Integration Corp", "tenure_months": 24}
    }
    # Create / Save
    save_res = client.post("/api/accounts", json=test_account, headers=DEMO_HEADERS)
    assert save_res.status_code == 200
    
    # List
    list_res = client.get("/api/accounts", headers=DEMO_HEADERS)
    assert list_res.status_code == 200
    accounts = list_res.json()
    assert any(a["customer_id"] == "TEST-999" for a in accounts)

    # Delete
    del_res = client.delete("/api/accounts/test_acc_999", headers=DEMO_HEADERS)
    assert del_res.status_code == 200
    assert del_res.json()["success"] is True


def test_database_review_notes():
    note_payload = {
        "author_name": "QA Tester",
        "note": "Client-side encrypted review test note",
        "is_encrypted": True,
        "fingerprint": "SHA-256:TEST"
    }
    # Add note
    add_res = client.post("/api/reviews/TEST-999/notes", json=note_payload, headers=DEMO_HEADERS)
    assert add_res.status_code == 200
    
    # Get notes
    notes_res = client.get("/api/reviews/TEST-999/notes", headers=DEMO_HEADERS)
    assert notes_res.status_code == 200
    notes = notes_res.json()
    assert len(notes) > 0
    assert notes[0]["author_name"] == "QA Tester"


def test_database_workspace_settings():
    # Update workspace
    update_res = client.post("/api/workspace", json={"workspace_name": "Test HQ Labs"}, headers=DEMO_HEADERS)
    assert update_res.status_code == 200
    assert update_res.json()["workspace_name"] == "Test HQ Labs"

    # Get workspace
    get_res = client.get("/api/workspace", headers=DEMO_HEADERS)
    assert get_res.status_code == 200
    assert get_res.json()["workspace_name"] == "Test HQ Labs"



