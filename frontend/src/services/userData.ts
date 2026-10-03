import { isDemoSession, getDemoUser, supabase } from './auth';
import { e2ee } from './e2ee';
import { 
  saveAccountToDb, deleteAccountFromDb, 
  saveNoteToDb, fetchNotesFromDb, saveWorkspaceToDb 
} from './api';

export interface UserProfileData {
  id: string;
  full_name: string | null;
  workspace_name: string;
  timezone: string;
}

export interface UserPreferencesData {
  user_id: string;
  risk_alerts_enabled: boolean;
  weekly_digest_enabled: boolean;
  reduce_motion: boolean;
}

export interface ReviewNoteData {
  id: string;
  user_id: string;
  account_id: string;
  note: string;
  author_name?: string;
  created_at: string;
  is_encrypted?: boolean;
  raw_ciphertext?: string;
  fingerprint?: string;
}

const LOCAL_PROFILE_KEY = 'kairon_user_profile';
const LOCAL_PREFS_KEY = 'kairon_user_preferences';
const LOCAL_NOTES_KEY = 'kairon_review_notes';
const LOCAL_ACCOUNTS_KEY = 'kairon_workspace_accounts';
const LOCAL_REVIEW_ACCOUNTS_KEY = 'kairon_review_accounts';
const LOCAL_WORKSPACE_NAME_KEY = 'kairon_workspace_name';

export function inferWorkspaceName(name?: string, email?: string): string {
  const cached = localStorage.getItem(LOCAL_WORKSPACE_NAME_KEY);
  if (cached && cached.trim()) return cached.trim();

  if (email && email.includes('@')) {
    const domain = email.split('@')[1]?.toLowerCase().trim();
    if (domain && !['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'workspace.io', 'test.com'].includes(domain)) {
      const company = domain.split('.')[0];
      return company.charAt(0).toUpperCase() + company.slice(1) + ' Workspace';
    }
  }
  const cleanName = (name || '').trim();
  if (cleanName && cleanName !== 'Workspace Lead' && cleanName !== 'User') {
    const first = cleanName.split(' ')[0];
    return `${first}'s Workspace`;
  }
  return 'My Workspace';
}

export function getStoredWorkspaceName(): string {
  return localStorage.getItem(LOCAL_WORKSPACE_NAME_KEY) || 'My Workspace';
}

export function setStoredWorkspaceName(name: string): void {
  if (name && name.trim()) {
    const clean = name.trim();
    localStorage.setItem(LOCAL_WORKSPACE_NAME_KEY, clean);
    saveWorkspaceToDb(clean);
    window.dispatchEvent(new CustomEvent('kairon-workspace-change', { detail: { workspaceName: clean } }));
  }
}

export interface ScoredAccountRecord {
  id: string;
  customer_id: string;
  company_name: string;
  monthly_charges: number;
  churn_probability: number;
  risk_tier: 'Low' | 'Moderate' | 'High' | 'Critical';
  risk_color: string;
  revenue_at_risk: number;
  estimated_clv: number;
  profile: any;
  created_at: string;
}

export function loadWorkspaceAccounts(): ScoredAccountRecord[] {
  try {
    const raw = localStorage.getItem(LOCAL_ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveWorkspaceAccount(account: ScoredAccountRecord): ScoredAccountRecord[] {
  try {
    // Persist to backend database
    saveAccountToDb(account);

    const existing = loadWorkspaceAccounts();
    const index = existing.findIndex(a => 
      (account.customer_id && a.customer_id.toLowerCase() === account.customer_id.toLowerCase()) ||
      (account.company_name && a.company_name.toLowerCase() === account.company_name.toLowerCase() && account.company_name.trim().length > 0)
    );
    let updated: ScoredAccountRecord[];
    if (index >= 0) {
      updated = [...existing];
      updated[index] = account;
    } else {
      updated = [account, ...existing];
    }
    localStorage.setItem(LOCAL_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}

export function clearWorkspaceAccounts(): void {
  localStorage.removeItem(LOCAL_ACCOUNTS_KEY);
  deleteAccountFromDb('all');
}

export interface WorkspaceReviewAccount {
  id: string;
  name: string;
  reason: string;
  risk: 'Low' | 'Moderate' | 'High' | 'Critical';
  owner: string;
  time: string;
  mrr: number;
  riskScore: number;
  suggestion: string;
  isUserAdded?: boolean;
}

export function loadReviewAccounts(userName?: string): WorkspaceReviewAccount[] {
  try {
    const raw = localStorage.getItem(LOCAL_REVIEW_ACCOUNTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return [];
}

export function saveReviewAccount(acc: WorkspaceReviewAccount): WorkspaceReviewAccount[] {
  try {
    const existing = loadReviewAccounts();
    const filtered = existing.filter(a => a.id.toLowerCase() !== acc.id.toLowerCase());
    const updated = [acc, ...filtered];
    localStorage.setItem(LOCAL_REVIEW_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [acc];
  }
}

export function deleteReviewAccount(id: string): WorkspaceReviewAccount[] {
  try {
    const existing = loadReviewAccounts();
    const updated = existing.filter(a => a.id.toLowerCase() !== id.toLowerCase());
    localStorage.setItem(LOCAL_REVIEW_ACCOUNTS_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
  }
}


const DEFAULT_PROFILE: UserProfileData = {
  id: 'workspace-user-001',
  full_name: 'Workspace Lead',
  workspace_name: 'My Workspace',
  timezone: 'GMT +05:30 | India Standard Time'
};

const DEFAULT_PREFERENCES: UserPreferencesData = {
  user_id: 'workspace-user-001',
  risk_alerts_enabled: true,
  weekly_digest_enabled: true,
  reduce_motion: false
};

const INITIAL_REVIEW_NOTES: ReviewNoteData[] = [];

export async function loadUserWorkspace() {
  const demo = getDemoUser();
  const wsName = inferWorkspaceName(demo?.name, demo?.email);
  if (isDemoSession() || !supabase) {
    const cachedProfile = localStorage.getItem(LOCAL_PROFILE_KEY);
    const cachedPrefs = localStorage.getItem(LOCAL_PREFS_KEY);
    return {
      user: { id: demo?.id || 'workspace-user-001', email: demo?.email || 'lead@workspace.io' },
      profile: cachedProfile ? JSON.parse(cachedProfile) : { ...DEFAULT_PROFILE, workspace_name: wsName, full_name: demo?.name || 'Workspace Lead' },
      preferences: cachedPrefs ? JSON.parse(cachedPrefs) : DEFAULT_PREFERENCES
    };
  }

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { user: null, profile: { ...DEFAULT_PROFILE, workspace_name: wsName }, preferences: DEFAULT_PREFERENCES };
    }

    const [profileRes, prefsRes] = await Promise.allSettled([
      supabase.from('user_profiles').select('*').eq('id', user.id).maybeSingle(),
      supabase.from('user_preferences').select('*').eq('user_id', user.id).maybeSingle()
    ]);

    const profileData = profileRes.status === 'fulfilled' && profileRes.value.data
      ? profileRes.value.data
      : { ...DEFAULT_PROFILE, id: user.id, full_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User', workspace_name: wsName };

    const prefsData = prefsRes.status === 'fulfilled' && prefsRes.value.data
      ? prefsRes.value.data
      : { ...DEFAULT_PREFERENCES, user_id: user.id };

    return { user, profile: profileData as UserProfileData, preferences: prefsData as UserPreferencesData };
  } catch {
    return { user: null, profile: { ...DEFAULT_PROFILE, workspace_name: wsName }, preferences: DEFAULT_PREFERENCES };
  }
}

export async function saveUserProfile(values: Pick<UserProfileData, 'full_name' | 'workspace_name' | 'timezone'>) {
  const current = (await loadUserWorkspace()).profile || DEFAULT_PROFILE;
  const updated: UserProfileData = { ...current, ...values };
  localStorage.setItem(LOCAL_PROFILE_KEY, JSON.stringify(updated));

  if (!isDemoSession() && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_profiles').upsert({ id: user.id, ...values, updated_at: new Date().toISOString() });
      }
    } catch (e) {
      console.warn('Could not persist profile to Supabase, saved locally:', e);
    }
  }

  return updated;
}

export async function saveUserPreferences(values: Pick<UserPreferencesData, 'risk_alerts_enabled' | 'weekly_digest_enabled' | 'reduce_motion'>) {
  const current = (await loadUserWorkspace()).preferences || DEFAULT_PREFERENCES;
  const updated: UserPreferencesData = { ...current, ...values };
  localStorage.setItem(LOCAL_PREFS_KEY, JSON.stringify(updated));

  if (!isDemoSession() && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        await supabase.from('user_preferences').upsert({ user_id: user.id, ...values, updated_at: new Date().toISOString() });
      }
    } catch (e) {
      console.warn('Could not persist preferences to Supabase, saved locally:', e);
    }
  }

  return updated;
}

export async function loadReviewNotes(accountId?: string): Promise<ReviewNoteData[]> {
  let rawNotes: ReviewNoteData[] = [];
  try {
    const raw = localStorage.getItem(LOCAL_NOTES_KEY);
    rawNotes = raw ? JSON.parse(raw) : INITIAL_REVIEW_NOTES;
  } catch {
    rawNotes = INITIAL_REVIEW_NOTES;
  }

  if (!isDemoSession() && supabase) {
    try {
      let query = supabase.from('review_notes').select('*').order('created_at', { ascending: false });
      if (accountId) query = query.eq('account_id', accountId);
      const { data } = await query;
      if (data && data.length > 0) rawNotes = data as ReviewNoteData[];
    } catch {
      // Fallback to local
    }
  }

  const filtered = accountId ? rawNotes.filter(n => n.account_id === accountId) : rawNotes;
  const fp = await e2ee.getFingerprint();

  // Decrypt each note client-side
  const decryptedNotes = await Promise.all(
    filtered.map(async (item) => {
      if (e2ee.isEncrypted(item.note)) {
        try {
          const plaintext = await e2ee.decrypt(item.note);
          return {
            ...item,
            note: plaintext,
            is_encrypted: true,
            raw_ciphertext: item.note,
            fingerprint: fp
          };
        } catch {
          return { ...item, is_encrypted: true, raw_ciphertext: item.note, fingerprint: fp };
        }
      }
      return { ...item, is_encrypted: false };
    })
  );

  return decryptedNotes;
}

export async function addReviewNote(accountId: string, noteText: string): Promise<ReviewNoteData> {
  const fp = await e2ee.getFingerprint();
  // Encrypt note before it is written to storage or network
  const encryptedPayload = await e2ee.encrypt(noteText);

  const activeUser = getDemoUser();
  const rawStorageNote: ReviewNoteData = {
    id: `note-${Date.now()}`,
    user_id: activeUser?.id || 'workspace-user-001',
    account_id: accountId,
    author_name: activeUser?.name || 'Workspace Lead',
    note: encryptedPayload,
    created_at: new Date().toISOString()
  };

  const raw = localStorage.getItem(LOCAL_NOTES_KEY);
  let existingRaw: ReviewNoteData[] = [];
  try {
    existingRaw = raw ? JSON.parse(raw) : INITIAL_REVIEW_NOTES;
  } catch {
    existingRaw = INITIAL_REVIEW_NOTES;
  }

  const updatedRaw = [rawStorageNote, ...existingRaw];
  localStorage.setItem(LOCAL_NOTES_KEY, JSON.stringify(updatedRaw));

  // Persist to backend SQLite database
  saveNoteToDb(accountId, rawStorageNote);

  if (!isDemoSession() && supabase) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        rawStorageNote.user_id = user.id;
        rawStorageNote.author_name = user.user_metadata?.full_name || 'Team Member';
        await supabase.from('review_notes').insert({
          user_id: user.id,
          account_id: accountId,
          note: encryptedPayload
        });
      }
    } catch (e) {
      console.warn('Could not persist encrypted review note to Supabase, saved to local DB:', e);
    }
  }

  // Return decrypted note in memory for immediate UI display
  return {
    ...rawStorageNote,
    note: noteText,
    is_encrypted: true,
    raw_ciphertext: encryptedPayload,
    fingerprint: fp
  };
}

