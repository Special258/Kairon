import { 
  CustomerProfile, PredictionResponse, WhatIfSimulationResponse, 
  ModelMetrics, DatasetSummary, BatchPredictResponse,
  AIAssistantRequest, AIAssistantResolution
} from '../types';
import { getAccessToken } from './auth';

const API_BASE_URL = import.meta.env.VITE_API_URL || '';

async function authHeaders(): Promise<Record<string, string>> {
  const token = await getAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function fetchHealth(): Promise<{ status: string; model_loaded: boolean; model_name: string; roc_auc: number }> {
  const res = await fetch(`${API_BASE_URL}/api/health`);
  if (!res.ok) throw new Error('Backend health check failed');
  return res.json();
}

export async function fetchModelMetrics(): Promise<ModelMetrics> {
  const res = await fetch(`${API_BASE_URL}/api/model/metrics`);
  if (!res.ok) throw new Error('Failed to load model metrics');
  return res.json();
}

export async function fetchDatasetSummary(): Promise<DatasetSummary> {
  const res = await fetch(`${API_BASE_URL}/api/dataset/summary`, { headers: await authHeaders() });
  if (!res.ok) throw new Error('Failed to load dataset summary');
  return res.json();
}

export async function predictCustomer(profile: CustomerProfile): Promise<PredictionResponse> {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(profile)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Prediction failed' }));
    throw new Error(err.detail || 'Prediction failed');
  }
  return res.json();
}

export async function simulateWhatIf(
  baseline: CustomerProfile, 
  simulated: CustomerProfile
): Promise<WhatIfSimulationResponse> {
  const res = await fetch(`${API_BASE_URL}/api/simulate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify({ baseline, simulated })
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Simulation failed' }));
    throw new Error(err.detail || 'Simulation failed');
  }
  return res.json();
}

export async function uploadBatchCSV(file: File): Promise<BatchPredictResponse> {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(`${API_BASE_URL}/api/predict/batch`, {
    method: 'POST',
    headers: await authHeaders(),
    body: formData
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Batch upload failed' }));
    throw new Error(err.detail || 'Batch prediction failed');
  }
  return res.json();
}

export async function loadEnterpriseSampleCohort(): Promise<BatchPredictResponse> {
  const res = await fetch(`${API_BASE_URL}/api/cohort/load-enterprise-sample`, {
    method: 'POST',
    headers: await authHeaders()
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Failed to load enterprise cohort' }));
    throw new Error(err.detail || 'Failed to load enterprise cohort');
  }
  return res.json();
}

export async function downloadCohortTemplate(): Promise<void> {
  const res = await fetch(`${API_BASE_URL}/api/cohort/template`);
  if (!res.ok) throw new Error('Failed to download template');
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'kairon_cohort_template.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export async function triggerModelRetrain(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/model/retrain`, {
    method: 'POST',
    headers: await authHeaders()
  });
  if (!res.ok) throw new Error('Model retraining failed');
  return res.json();
}

export async function fetchSecurityAudit(): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/security/audit`);
  if (!res.ok) throw new Error('Failed to load security audit');
  return res.json();
}

export async function resolveCustomerProblem(
  request: AIAssistantRequest
): Promise<AIAssistantResolution> {
  const res = await fetch(`${API_BASE_URL}/api/ai/resolve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
    body: JSON.stringify(request)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'AI Resolution failed' }));
    throw new Error(err.detail || 'AI Resolution failed');
  }
  return res.json();
}

// Database API synchronization methods
export async function fetchAccountsFromDb(): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/accounts`, { headers: await authHeaders() });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

export async function saveAccountToDb(account: any): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/accounts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(account)
    });
  } catch {}
}

export async function deleteAccountFromDb(accountId: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/accounts/${encodeURIComponent(accountId)}`, {
      method: 'DELETE',
      headers: await authHeaders()
    });
  } catch {}
}

export async function fetchNotesFromDb(accountId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/reviews/${encodeURIComponent(accountId)}/notes`, {
      headers: await authHeaders()
    });
    if (res.ok) return await res.json();
  } catch {}
  return [];
}

export async function saveNoteToDb(accountId: string, noteData: any): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/reviews/${encodeURIComponent(accountId)}/notes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify(noteData)
    });
  } catch {}
}

export async function fetchWorkspaceFromDb(): Promise<string | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/workspace`, { headers: await authHeaders() });
    if (res.ok) {
      const data = await res.json();
      return data.workspace_name;
    }
  } catch {}
  return null;
}

export async function saveWorkspaceToDb(workspaceName: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/workspace`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(await authHeaders()) },
      body: JSON.stringify({ workspace_name: workspaceName })
    });
  } catch {}
}



