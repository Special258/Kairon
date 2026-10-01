"""
Kairon AI Problem Resolution Engine.
Real-world prescriptive AI assistant for customer relationship difficulties,
churn prevention, intervention design, and stakeholder communication drafting.
"""

from typing import Dict, Any, List, Optional
from app.schemas import CustomerProfile, PrescriptiveAction
from pydantic import BaseModel, Field

class AIAssistantRequest(BaseModel):
    problem_type: Optional[str] = Field(default="auto_diagnose", description="auto_diagnose, champion_left, usage_drop, pricing_friction, renewal_cliff, onboarding_stalled, competitor_threat")
    custom_query: Optional[str] = Field(default="", description="Specific real-world difficulty described by the user")
    profile: Optional[CustomerProfile] = None

class AIIntervention(BaseModel):
    id: str
    title: str
    category: str  # "Commercial", "Technical", "Executive", "Product"
    impact: str    # e.g., "-18% Churn Risk"
    description: str
    suggested_changes: Optional[Dict[str, Any]] = None  # Lever values to apply to What-If simulator

class AIAssistantResolution(BaseModel):
    problem_title: str
    severity: str  # "Critical", "High", "Medium", "Low"
    severity_color: str
    diagnosis_summary: str
    root_causes: List[str]
    estimated_revenue_at_risk: float
    recommended_interventions: List[AIIntervention]
    executive_outreach_draft: Dict[str, str]  # subject, recipient, body
    step_by_step_playbook: List[str]
    suggested_whatif_baseline: Optional[Dict[str, Any]] = None
    suggested_whatif_simulated: Optional[Dict[str, Any]] = None


def resolve_customer_issue(request: AIAssistantRequest) -> AIAssistantResolution:
    """
    Analyzes the customer profile and real-world problem description to produce
    a complete, actionable diagnosis, tailored executive email draft, and executable What-If parameters.
    """
    profile = request.profile or CustomerProfile()
    q = (request.custom_query or "").lower()
    ptype = (request.problem_type or "auto_diagnose").lower()

    # Determine core difficulty pattern
    if "champion" in q or "sponsor" in q or ptype == "champion_left":
        issue_kind = "champion_departure"
    elif "price" in q or "expensive" in q or "cost" in q or "budget" in q or ptype == "pricing_friction":
        issue_kind = "pricing_friction"
    elif "usage" in q or "drop" in q or "inactive" in q or profile.usage_trend_pct < -20 or ptype == "usage_drop":
        issue_kind = "usage_drop"
    elif "renew" in q or "contract" in q or profile.contract_type == "Month-to-Month" or ptype == "renewal_cliff":
        issue_kind = "renewal_cliff"
    elif "onboard" in q or "adopt" in q or profile.feature_adoption_rate < 35 or ptype == "onboarding_stalled":
        issue_kind = "onboarding_stalled"
    elif "competitor" in q or "alternative" in q or ptype == "competitor_threat":
        issue_kind = "competitor_threat"
    elif profile.late_payments_count > 0:
        issue_kind = "billing_friction"
    else:
        issue_kind = "general_retention"

    company = profile.company_name or "Client Account"
    mrr = profile.monthly_charges
    arr = mrr * 12

    if issue_kind == "champion_departure":
        title = f"Executive Champion Transition at {company}"
        severity = "High"
        color = "#d76d3c"
        summary = f"Loss of key stakeholder relationship creates sudden vulnerability ahead of renewal. Without a sponsor championing ROI, usage drift and contract attrition risk escalate quickly."
        root_causes = [
            "Primary internal advocate departed or changed departments",
            "Institutional knowledge of product value not documented across broader team",
            "Remaining stakeholders have not seen executive reporting or business impact metrics"
        ]
        interventions = [
            AIIntervention(
                id="sponsor_realign",
                title="Executive Sponsor Briefing & ROI Deck",
                category="Executive",
                impact="-28% Churn Risk",
                description="Deliver a 1-page business outcomes summary to new VP/Director highlighting historical hours saved and revenue milestones.",
                suggested_changes={"feature_adoption_rate": min(100.0, profile.feature_adoption_rate + 12), "has_tech_support": True}
            ),
            AIIntervention(
                id="tech_onboard_new_lead",
                title="Dedicated Technical Onboarding for Successor",
                category="Technical",
                impact="-15% Churn Risk",
                description="Assign an enterprise engineer for a 45-minute architectural walkthrough with the incoming team lead.",
                suggested_changes={"has_tech_support": True, "support_tickets_90d": max(0, profile.support_tickets_90d - 1)}
            )
        ]
        outreach = {
            "recipient": f"New Team Lead / VP at {company}",
            "subject": f"Continuing {company}'s partnership & executive ROI summary",
            "body": f"Hi [Name],\n\nFirst, congratulations on stepping into your new role leading the team at {company}!\n\nOver the past {profile.tenure_months} months, {company} has leveraged our relationship intelligence infrastructure to safeguard customer operations and unlock key telemetry. With the recent transition, I wanted to share a concise 1-page executive summary of your team's historical wins and ensure your upcoming milestones remain uninterrupted.\n\nCould we find 15 minutes this Thursday or Friday for a brief introduction? I'd love to learn about your top priorities for this quarter and assign our dedicated technical lead to assist your team directly.\n\nBest regards,\n[Your Name] | Customer Success Lead"
        }
        playbook = [
            "Identify the incoming decision maker on LinkedIn or company directory within 24 hours.",
            "Generate the executive ROI summary showing adoption and protected revenue to date.",
            "Send the warm re-alignment outreach with zero friction.",
            "Schedule a Joint Success Plan review to lock in long-term platform value."
        ]

    elif issue_kind == "usage_drop":
        title = f"Sharp Usage Velocity Contraction at {company}"
        severity = "Critical" if profile.usage_trend_pct < -30 else "High"
        color = "#c75252" if severity == "Critical" else "#d76d3c"
        summary = f"Telemetry reveals a {abs(profile.usage_trend_pct):.0f}% contraction in 90-day activity. When active seats or feature queries drop without support tickets, it usually signals workflow abandonment or internal blockers."
        root_causes = [
            f"Usage trending downward by {abs(profile.usage_trend_pct):.0f}% over the last quarter",
            f"Feature adoption stalled at {profile.feature_adoption_rate:.0f}% capacity",
            "Lack of proactive ticket submissions indicates silent frustration rather than healthy steady state"
        ]
        interventions = [
            AIIntervention(
                id="workflow_audit",
                title="Proactive Workflow Health Audit",
                category="Product",
                impact="-32% Churn Risk",
                description="Diagnose API/feature bottlenecks and re-activate core user workflows with customized setup assistance.",
                suggested_changes={"usage_trend_pct": 10.0, "feature_adoption_rate": min(100.0, profile.feature_adoption_rate + 20)}
            ),
            AIIntervention(
                id="enable_dedicated_support",
                title="Deploy Priority SLA Support",
                category="Technical",
                impact="-20% Churn Risk",
                description="Assign dedicated technical engineer to resolve friction points and eliminate silent blockers.",
                suggested_changes={"has_tech_support": True, "support_tickets_90d": max(1, profile.support_tickets_90d - 2)}
            )
        ]
        outreach = {
            "recipient": f"Lead Administrator at {company}",
            "subject": f"Proactive health check & workflow optimization for {company}",
            "body": f"Hi [Name],\n\nOur telemetry detected a slight dip in query activity across your workspace over the past few weeks, and I wanted to proactively check in.\n\nOften when we see this pattern, teams have either encountered a workflow bottleneck or recently changed internal procedures. To ensure your team is getting maximum value, I have reserved time with our senior solutions engineer to run a complimentary health audit and optimize your pipelines.\n\nWould you have 20 minutes early next week for a quick diagnostic session?\n\nWarmly,\n[Your Name] | Customer Success Lead"
        }
        playbook = [
            "Audit system access logs to see which user seats or integrations stopped firing.",
            "Check if an API key rotated or team permissions changed on their side.",
            "Send the proactive health check message focusing on unblocking their team.",
            "Prepare a tailored workflow re-activation playbook before the call."
        ]

    elif issue_kind == "pricing_friction":
        title = f"Budget & Pricing Sensitivity at {company}"
        severity = "High"
        color = "#d76d3c"
        summary = f"Commercial misalignment on monthly run-rate (${mrr:,.0f}/mo). Month-to-month or unbundled pricing causes procurement friction; shifting to a structured annual tier protects revenue."
        root_causes = [
            f"Monthly rate of ${mrr:,.0f} perceived as unoptimized without multi-year commitment discounts",
            "Contract structure allows frictionless cancellation on next renewal cycle",
            "Value realized has not been tied directly to cost savings in procurement terms"
        ]
        interventions = [
            AIIntervention(
                id="annual_restructure",
                title="Migrate to 2-Year Contract with Value Lock",
                category="Commercial",
                impact="-38% Churn Risk",
                description="Restructure from Month-to-Month to a 2-Year agreement with a 15% incentive, locking in predictable revenue.",
                suggested_changes={"contract_type": "Two-Year", "monthly_charges": round(mrr * 0.88, 2)}
            ),
            AIIntervention(
                id="bundle_enterprise_support",
                title="Bundle Priority SLA Support At No Extra Cost",
                category="Technical",
                impact="-22% Churn Risk",
                description="Include technical tier value to satisfy cost-benefit requirements without deep price cutting.",
                suggested_changes={"has_tech_support": True}
            )
        ]
        outreach = {
            "recipient": f"Finance / Commercial Sponsor at {company}",
            "subject": f"Commercial alignment & partnership proposal for {company}",
            "body": f"Hi [Name],\n\nAs we approach your upcoming billing milestone, our team conducted a portfolio review for {company}. Given your tenure and consistent platform utilization, we would love to formalize our partnership on an enterprise footing.\n\nWe have approved an exclusive annual restructuring that locks in your current rate against future inflation, includes dedicated 24/7 technical support at no additional cost, and provides a favorable payment schedule.\n\nI have attached the side-by-side comparison for your finance team. Let's connect for 10 minutes this week to finalize what works best for your budget.\n\nBest,\n[Your Name] | Customer Relationship Intelligence Team"
        }
        playbook = [
            "Review customer gross margin and maximum allowable discount tier.",
            "Package a 2-year commitment bundle including free technical support SLA.",
            "Frame the offer around total cost of ownership and risk elimination.",
            "Present side-by-side ROI comparison before the next invoice generates."
        ]

    else:
        # Renewal cliff / general retention
        title = f"Proactive Renewal Risk Mitigation for {company}"
        severity = "High" if profile.contract_type == "Month-to-Month" else "Medium"
        color = "#bb8118" if severity == "Medium" else "#d76d3c"
        summary = f"Account {profile.customer_id} represents ${mrr:,.0f} MRR (${arr:,.0f} ARR). Current contract posture ({profile.contract_type}) and support profile require structured intervention."
        root_causes = [
            f"Contract type '{profile.contract_type}' has higher statistical churn velocity than multi-year agreements",
            f"Support ticket volume ({profile.support_tickets_90d} tickets in 90 days) indicates moderate touchpoint friction",
            f"Net Promoter Score ({profile.nps_score}/10) indicates room to convert neutral users into enthusiastic champions"
        ]
        interventions = [
            AIIntervention(
                id="contract_upgrade",
                title="Transition to One-Year or Two-Year Commitment",
                category="Commercial",
                impact="-35% Churn Risk",
                description="Secure long-term retention by packaging enterprise features into an annual agreement.",
                suggested_changes={"contract_type": "Two-Year", "has_tech_support": True}
            ),
            AIIntervention(
                id="cs_qbr_session",
                title="Executive Relationship Review (QBR)",
                category="Executive",
                impact="-24% Churn Risk",
                description="Present key relationship wins and roadmap milestones to cement renewal alignment.",
                suggested_changes={"feature_adoption_rate": min(100.0, profile.feature_adoption_rate + 15), "usage_trend_pct": 10.0}
            )
        ]
        outreach = {
            "recipient": f"Primary Contact at {company}",
            "subject": f"Strategic roadmap & partnership review for {company}",
            "body": f"Hi [Name],\n\nWith {company}'s renewal coming up, our leadership team wanted to make sure we celebrate your milestone achievements over the past year and align our product roadmap with your upcoming initiatives.\n\nWe have prepared an executive review of your team's results and would love to share a preview of upcoming platform enhancements that directly address your recent requests.\n\nCould we schedule 20 minutes next Tuesday or Wednesday to review this together?\n\nWarm regards,\n[Your Name] | Customer Success Lead"
        }
        playbook = [
            "Review health metrics in Account Scorer and confirm top risk drivers.",
            "Test scenario outcome in the What-If Simulator.",
            "Dispatch personalized executive check-in email.",
            "Log resolution strategy in client-side encrypted review notes."
        ]

    # Pre-calculated simulation setups for 1-click execution in What-If Sandbox
    simulated_state = profile.model_dump()
    simulated_state["contract_type"] = "Two-Year"
    simulated_state["has_tech_support"] = True
    simulated_state["feature_adoption_rate"] = min(100.0, profile.feature_adoption_rate + 18.0)
    simulated_state["usage_trend_pct"] = max(-20.0, profile.usage_trend_pct + 25.0)

    return AIAssistantResolution(
        problem_title=title,
        severity=severity,
        severity_color=color,
        diagnosis_summary=summary,
        root_causes=root_causes,
        estimated_revenue_at_risk=round(mrr * (12 if profile.contract_type == "Month-to-Month" else 6), 2),
        recommended_interventions=interventions,
        executive_outreach_draft=outreach,
        step_by_step_playbook=playbook,
        suggested_whatif_baseline=profile.model_dump(),
        suggested_whatif_simulated=simulated_state
    )
