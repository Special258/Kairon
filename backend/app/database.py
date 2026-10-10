"""
Database module for Kairon Intelligence Platform.
Provides persistent SQLite storage for scored accounts, encrypted review notes,
workspace settings, and prediction history.
"""

import json
import os
import sqlite3
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

DB_FILE = os.getenv("DB_PATH", os.path.join(os.path.dirname(__file__), "..", "kairon.db"))

_initialized = False

def get_db_connection() -> sqlite3.Connection:
    global _initialized
    os.makedirs(os.path.dirname(os.path.abspath(DB_FILE)), exist_ok=True)
    conn = sqlite3.connect(DB_FILE, timeout=30.0, check_same_thread=False)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL;")
    conn.execute("PRAGMA busy_timeout=5000;")
    conn.execute("PRAGMA synchronous=NORMAL;")
    conn.execute("PRAGMA cache_size=-64000;")
    if not _initialized:
        _initialized = True
        _run_migrations(conn)
    return conn

def _run_migrations(conn: sqlite3.Connection) -> None:
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS accounts (
            id TEXT PRIMARY KEY,
            customer_id TEXT NOT NULL,
            company_name TEXT NOT NULL,
            monthly_charges REAL NOT NULL,
            churn_probability REAL NOT NULL,
            risk_tier TEXT NOT NULL,
            risk_color TEXT NOT NULL,
            revenue_at_risk REAL NOT NULL,
            estimated_clv REAL NOT NULL,
            profile_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS review_notes (
            id TEXT PRIMARY KEY,
            account_id TEXT NOT NULL,
            user_id TEXT,
            author_name TEXT,
            note TEXT NOT NULL,
            is_encrypted INTEGER DEFAULT 1,
            raw_ciphertext TEXT,
            fingerprint TEXT,
            created_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS workspace_settings (
            key TEXT PRIMARY KEY,
            value TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
    """)
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS prediction_history (
            id TEXT PRIMARY KEY,
            customer_id TEXT,
            company_name TEXT,
            churn_probability REAL,
            risk_tier TEXT,
            revenue_at_risk REAL,
            created_at TEXT NOT NULL
        )
    """)
    # Performance indexes for high data scale
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_accounts_customer_id ON accounts(customer_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_accounts_company_name ON accounts(company_name)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_accounts_risk_tier ON accounts(risk_tier)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_review_notes_account_id ON review_notes(account_id)")
    cursor.execute("CREATE INDEX IF NOT EXISTS idx_pred_history_created_at ON prediction_history(created_at)")
    conn.commit()

def init_db() -> None:
    """Initialize database tables with schema migrations."""
    with get_db_connection():
        pass


# --- Account Operations ---

def get_all_accounts() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM accounts ORDER BY created_at DESC")
        rows = cursor.fetchall()
        result = []
        for row in rows:
            acc = dict(row)
            try:
                acc["profile"] = json.loads(acc["profile_json"])
            except Exception:
                acc["profile"] = None
            del acc["profile_json"]
            result.append(acc)
        return result

def save_account(account_data: Dict[str, Any]) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        acc_id = account_data.get("id") or f"acc_{int(datetime.now(timezone.utc).timestamp()*1000)}"
        customer_id = account_data.get("customer_id", "")
        company_name = account_data.get("company_name", "")
        monthly_charges = float(account_data.get("monthly_charges", 0))
        churn_prob = float(account_data.get("churn_probability", 0))
        risk_tier = account_data.get("risk_tier", "Low")
        risk_color = account_data.get("risk_color", "#238b67")
        rev_at_risk = float(account_data.get("revenue_at_risk", 0))
        clv = float(account_data.get("estimated_clv", 0))
        profile_json = json.dumps(account_data.get("profile", {}))
        created_at = account_data.get("created_at") or datetime.now(timezone.utc).isoformat()

        # Delete existing duplicate if matching ID or company name
        cursor.execute("""
            DELETE FROM accounts 
            WHERE id = ? OR (customer_id = ? AND customer_id != '') OR (lower(company_name) = lower(?) AND company_name != '')
        """, (acc_id, customer_id, company_name))

        cursor.execute("""
            INSERT INTO accounts (
                id, customer_id, company_name, monthly_charges,
                churn_probability, risk_tier, risk_color, revenue_at_risk,
                estimated_clv, profile_json, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            acc_id, customer_id, company_name, monthly_charges,
            churn_prob, risk_tier, risk_color, rev_at_risk,
            clv, profile_json, created_at
        ))

        # Also log to prediction history
        hist_id = f"hist_{acc_id}_{int(datetime.now(timezone.utc).timestamp()*1000)}"
        cursor.execute("""
            INSERT INTO prediction_history (id, customer_id, company_name, churn_probability, risk_tier, revenue_at_risk, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, (hist_id, customer_id, company_name, churn_prob, risk_tier, rev_at_risk, created_at))

        conn.commit()

        account_data["id"] = acc_id
        return account_data

def save_accounts_batch(accounts: List[Dict[str, Any]]) -> None:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        for account_data in accounts:
            acc_id = account_data.get("id") or f"acc_{int(datetime.now(timezone.utc).timestamp()*1000)}"
            customer_id = account_data.get("customer_id", "")
            company_name = account_data.get("company_name", "")
            monthly_charges = float(account_data.get("monthly_charges", 0))
            churn_prob = float(account_data.get("churn_probability", 0))
            risk_tier = account_data.get("risk_tier", "Low")
            risk_color = account_data.get("risk_color", "#238b67")
            rev_at_risk = float(account_data.get("revenue_at_risk", 0))
            clv = float(account_data.get("estimated_clv", 0))
            profile_json = json.dumps(account_data.get("profile", {}))
            created_at = account_data.get("created_at") or datetime.now(timezone.utc).isoformat()

            cursor.execute("""
                DELETE FROM accounts 
                WHERE id = ? OR (customer_id = ? AND customer_id != '') OR (lower(company_name) = lower(?) AND company_name != '')
            """, (acc_id, customer_id, company_name))

            cursor.execute("""
                INSERT INTO accounts (
                    id, customer_id, company_name, monthly_charges,
                    churn_probability, risk_tier, risk_color, revenue_at_risk,
                    estimated_clv, profile_json, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                acc_id, customer_id, company_name, monthly_charges,
                churn_prob, risk_tier, risk_color, rev_at_risk,
                clv, profile_json, created_at
            ))

            hist_id = f"hist_{acc_id}_{int(datetime.now(timezone.utc).timestamp()*1000)}"
            cursor.execute("""
                INSERT INTO prediction_history (id, customer_id, company_name, churn_probability, risk_tier, revenue_at_risk, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            """, (hist_id, customer_id, company_name, churn_prob, risk_tier, rev_at_risk, created_at))
        conn.commit()

def delete_account(account_id: str) -> bool:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        if account_id.lower() == "all":
            cursor.execute("DELETE FROM accounts")
            conn.commit()
            return True
        cursor.execute("DELETE FROM accounts WHERE id = ? OR customer_id = ?", (account_id, account_id))
        conn.commit()
        return cursor.rowcount > 0

def clear_all_accounts() -> None:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM accounts")
        conn.commit()


# --- Review Notes Operations ---

def get_notes_for_account(account_id: str) -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT * FROM review_notes 
            WHERE lower(account_id) = lower(?) OR lower(account_id) LIKE ?
            ORDER BY created_at ASC
        """, (account_id, f"%{account_id.lower()}%"))
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def get_all_notes() -> List[Dict[str, Any]]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM review_notes ORDER BY created_at ASC")
        rows = cursor.fetchall()
        return [dict(row) for row in rows]

def save_note(note_data: Dict[str, Any]) -> Dict[str, Any]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        note_id = note_data.get("id") or f"note_{int(datetime.now(timezone.utc).timestamp()*1000)}"
        account_id = note_data.get("account_id", "")
        user_id = note_data.get("user_id", "")
        author_name = note_data.get("author_name", "Team Member")
        note_text = note_data.get("note", "")
        is_encrypted = 1 if note_data.get("is_encrypted", True) else 0
        raw_ciphertext = note_data.get("raw_ciphertext", "")
        fingerprint = note_data.get("fingerprint", "")
        created_at = note_data.get("created_at") or datetime.now(timezone.utc).isoformat()

        cursor.execute("""
            INSERT INTO review_notes (
                id, account_id, user_id, author_name, note,
                is_encrypted, raw_ciphertext, fingerprint, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            note_id, account_id, user_id, author_name, note_text,
            is_encrypted, raw_ciphertext, fingerprint, created_at
        ))
        conn.commit()
        note_data["id"] = note_id
        return note_data


# --- Workspace Settings Operations ---

def get_workspace_setting(key: str, default: Optional[str] = None) -> Optional[str]:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT value FROM workspace_settings WHERE key = ?", (key,))
        row = cursor.fetchone()
        return row["value"] if row else default

def set_workspace_setting(key: str, value: str) -> None:
    with get_db_connection() as conn:
        cursor = conn.cursor()
        now = datetime.now(timezone.utc).isoformat()
        cursor.execute("""
            INSERT INTO workspace_settings (key, value, updated_at)
            VALUES (?, ?, ?)
            ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
        """, (key, value, now))
        conn.commit()
