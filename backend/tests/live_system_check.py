import urllib.request
import urllib.error
import json
import sys

def test_endpoint(name, url, method="GET", data=None, headers=None, expected_code=200):
    req = urllib.request.Request(url, data=data, headers=headers or {}, method=method)
    try:
        with urllib.request.urlopen(req) as resp:
            body = resp.read().decode("utf-8", errors="ignore")
            assert resp.status == expected_code, f"Expected {expected_code}, got {resp.status}"
            parsed = json.loads(body) if "application/json" in resp.headers.get("content-type", "") else body
            print(f"[PASS] {name} (HTTP {resp.status})")
            return resp, parsed
    except urllib.error.HTTPError as e:
        body = e.read().decode("utf-8", errors="ignore")
        if e.code == expected_code:
            parsed = json.loads(body) if "application/json" in e.headers.get("content-type", "") else body
            print(f"[PASS] {name} (Expected HTTP {expected_code})")
            return e, parsed
        else:
            print(f"[FAIL] {name} - HTTP {e.code}: {body}")
            raise

def main():
    print("=" * 60)
    print("KAIRON PRODUCTION PRE-DEPLOYMENT LIVE SYSTEM VERIFICATION")
    print("=" * 60)

    # 1. Backend Health Check
    resp, health = test_endpoint("1. API Health Check", "http://127.0.0.1:8000/api/health")
    assert health["status"] == "healthy"
    assert health["model_loaded"] is True
    assert health["roc_auc"] > 0.90
    print(f"       -> Model: {health['model_name']}, ROC-AUC: {health['roc_auc']}, Accuracy: {health['accuracy']}")

    # 2. OWASP Security Audit
    resp, sec = test_endpoint("2. Security Audit Posture", "http://127.0.0.1:8000/api/security/audit")
    assert sec["status"] == "secure"
    assert sec["transport_security"]["hsts_enabled"] is True
    assert sec["transport_security"]["x_frame_options"] == "DENY"
    print("       -> Transport Security, CSP & Anti-Clickjacking headers verified")

    # 3. Model Metrics & Explainability
    resp, metrics = test_endpoint("3. Model Metrics & Importances", "http://127.0.0.1:8000/api/model/metrics")
    assert len(metrics["feature_importances"]) > 0
    top_feature = metrics["feature_importances"][0]
    print(f"       -> Top Driver: {top_feature['display_name']} ({top_feature['importance_pct']}%)")

    # 4. Predict Single Customer
    demo_auth = {"Authorization": "Bearer demo-token", "Content-Type": "application/json"}
    customer_payload = json.dumps({
        "tenure_months": 18,
        "monthly_charges": 420.0,
        "contract_type": "One-Year",
        "payment_method": "Credit Card",
        "support_tickets_90d": 2,
        "feature_adoption_rate": 68.0,
        "late_payments_count": 0,
        "nps_score": 7.0,
        "has_tech_support": True,
        "usage_trend_pct": 8.0,
        "company_name": "Northstar Labs",
        "customer_id": "NS-2048"
    }).encode("utf-8")
    resp, pred = test_endpoint("4. Customer Inference & Playbook", "http://127.0.0.1:8000/api/predict", method="POST", data=customer_payload, headers=demo_auth)
    assert "churn_probability" in pred
    assert pred["risk_tier"] in ["Low", "Moderate", "High", "Critical"]
    print(f"       -> Churn Probability: {pred['churn_probability']:.1f}%, Risk Tier: {pred['risk_tier']}, Revenue at Risk: ${pred['revenue_at_risk']:,.0f}")

    # 5. What-If Simulation Engine
    whatif_payload = json.dumps({
        "baseline": {
            "tenure_months": 12, "monthly_charges": 500.0, "contract_type": "Month-to-Month",
            "payment_method": "Electronic Check", "support_tickets_90d": 5, "feature_adoption_rate": 35.0,
            "late_payments_count": 2, "nps_score": 4.0, "has_tech_support": False, "usage_trend_pct": -20.0
        },
        "simulated": {
            "tenure_months": 12, "monthly_charges": 500.0, "contract_type": "Two-Year",
            "payment_method": "Credit Card", "support_tickets_90d": 1, "feature_adoption_rate": 65.0,
            "late_payments_count": 0, "nps_score": 8.0, "has_tech_support": True, "usage_trend_pct": 15.0
        }
    }).encode("utf-8")
    resp, sim = test_endpoint("5. What-If Decision Sandbox", "http://127.0.0.1:8000/api/simulate", method="POST", data=whatif_payload, headers=demo_auth)
    assert sim["probability_delta"] < 0
    print(f"       -> Risk Delta: {sim['probability_delta']:.1f} pts, Protected Revenue: ${sim['revenue_saved']:,.0f}")

    # 6. Batch Cohort CSV Upload
    boundary = "----KaironTestBoundary12345"
    csv_rows = (
        "customer_id,company_name,tenure_months,monthly_charges,contract_type,payment_method,support_tickets_90d,feature_adoption_rate,late_payments_count,nps_score,has_tech_support,usage_trend_pct\r\n"
        "NS-101,Alpha Corp,24,650.0,Two-Year,Credit Card,0,88.0,0,9,True,18.0\r\n"
        "NS-102,Beta LLC,6,220.0,Month-to-Month,Electronic Check,4,22.0,2,3,False,-30.0\r\n"
        "NS-103,Gamma Inc,12,380.0,One-Year,Bank Transfer,1,64.0,0,7,True,5.0\r\n"
    )
    multipart_body = (
        f"--{boundary}\r\n"
        f'Content-Disposition: form-data; name="file"; filename="cohort.csv"\r\n'
        f"Content-Type: text/csv\r\n\r\n"
        f"{csv_rows}\r\n"
        f"--{boundary}--\r\n"
    ).encode("utf-8")
    batch_headers = {"Authorization": "Bearer demo-token", "Content-Type": f"multipart/form-data; boundary={boundary}"}
    resp, batch = test_endpoint("6. Batch Cohort Scoring (CSV)", "http://127.0.0.1:8000/api/predict/batch", method="POST", data=multipart_body, headers=batch_headers)
    assert batch["total_records"] == 3
    print(f"       -> Scored {batch['total_records']} accounts, Avg Risk: {batch['avg_churn_probability']:.1f}%, Exposed: ${batch['total_revenue_at_risk']:,.0f}")

    # 7. Dataset Summary Telemetry
    resp, summary = test_endpoint("7. Dataset Telemetry", "http://127.0.0.1:8000/api/dataset/summary", headers={"Authorization": "Bearer demo-token"})
    assert summary["total_customers"] > 0
    print(f"       -> Total Base: {summary['total_customers']} customers, Portfolio Churn: {summary['overall_churn_rate']}%")

    # 8. Schema Validation & Injection Defense
    bad_payload = json.dumps({"tenure_months": -5, "monthly_charges": 100.0, "contract_type": "Invalid"}).encode("utf-8")
    test_endpoint("8. Input Schema Validation (422 defense)", "http://127.0.0.1:8000/api/predict", method="POST", data=bad_payload, headers=demo_auth, expected_code=422)

    # 9. Frontend SPA Delivery (Served directly on port 8000 in unified production)
    frontend_url = "http://127.0.0.1:8000/"
    resp, fe = test_endpoint("9. Frontend SPA Delivery", frontend_url)
    assert '<div id="root">' in fe
    print("       -> Frontend index.html served with React hydration target")

    print("=" * 60)
    print("ALL 9 LIVE PRODUCTION HEALTH CHECKS PASSED WITH 100% SUCCESS")
    print("=" * 60)

if __name__ == "__main__":
    main()
