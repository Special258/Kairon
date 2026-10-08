import { createClient, type Session } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim();
const authProvider = import.meta.env.VITE_AUTH_PROVIDER || 'supabase';
const authRedirectUrl = import.meta.env.VITE_SUPABASE_REDIRECT_URL || window.location.origin;

export const authConfigured = Boolean(supabaseUrl && supabaseAnonKey);
export const configuredAuthProvider = authProvider;
export const supabase = authConfigured ? createClient(supabaseUrl!, supabaseAnonKey!) : null;

const LOCAL_SESSION_KEY = 'kairon_session_user';
const LEGACY_DEMO_KEY = 'kairon_demo_user';

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: string;
}

export type DemoUser = SessionUser;

export function getSessionUser(): SessionUser | null {
  try {
    const raw = localStorage.getItem(LOCAL_SESSION_KEY) || localStorage.getItem(LEGACY_DEMO_KEY);
    if (raw) return JSON.parse(raw);
    const explicitlyLoggedOut = localStorage.getItem('kairon_explicit_logout') === 'true';
    if (!explicitlyLoggedOut) {
      const defaultUser: SessionUser = {
        id: 'user-default-1',
        email: 'alex.vance@northstar.io',
        name: getStoredCustomUsername() || 'Alex Vance',
        role: 'Customer Success Lead'
      };
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(defaultUser));
      return defaultUser;
    }
    return null;
  } catch {
    return null;
  }
}

export const getDemoUser = getSessionUser;

export function isLocalSession(): boolean {
  return Boolean(getSessionUser());
}

export const isDemoSession = isLocalSession;

export function parseNameFromEmail(email: string): string {
  const prefix = (email || '').split('@')[0] || 'User';
  return prefix
    .replace(/[._-]/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ') || 'Workspace Member';
}

const CUSTOM_USERNAME_KEY = 'kairon_custom_username';

export function getStoredCustomUsername(): string | null {
  return localStorage.getItem(CUSTOM_USERNAME_KEY);
}

export function setStoredCustomUsername(username: string): void {
  if (username && username.trim()) {
    localStorage.setItem(CUSTOM_USERNAME_KEY, username.trim());
    const existing = getSessionUser();
    if (existing) {
      existing.name = username.trim();
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(existing));
    }
    window.dispatchEvent(new CustomEvent('kairon-auth-change'));
  }
}

export function getInitials(name: string): string {
  const parts = (name || '').trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return ((name || 'WM').slice(0, 2)).toUpperCase();
}

export function saveLocalSession(name?: string, email?: string) {
  localStorage.removeItem('kairon_explicit_logout');
  const cleanEmail = email?.trim() || 'member@workspace.io';
  const customSaved = getStoredCustomUsername();
  const cleanName = name?.trim() || customSaved || parseNameFromEmail(cleanEmail);
  if (name?.trim()) {
    localStorage.setItem(CUSTOM_USERNAME_KEY, name.trim());
  }
  const user: SessionUser = {
    id: 'user-' + Date.now().toString(36),
    email: cleanEmail,
    name: cleanName,
    role: 'Customer Success Manager'
  };
  localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify(user));
  localStorage.removeItem(LEGACY_DEMO_KEY);
  window.dispatchEvent(new CustomEvent('kairon-auth-change'));
  return user;
}

export const signInDemo = saveLocalSession;

export async function getAuthSession(): Promise<Session | null> {
  const demo = getDemoUser();
  const customSaved = getStoredCustomUsername();
  if (demo) {
    const effectiveName = customSaved || demo.name;
    return {
      access_token: 'local-session-token',
      token_type: 'bearer',
      expires_in: 86400,
      refresh_token: 'local-refresh-token',
      user: {
        id: demo.id,
        app_metadata: {},
        user_metadata: { full_name: effectiveName, role: demo.role },
        aud: 'authenticated',
        created_at: new Date().toISOString(),
        email: demo.email
      }
    } as unknown as Session;
  }
  if (!supabase) return null;
  try {
    const sessionPromise = supabase.auth.getSession().then(({ data, error }) => {
      if (error) throw error;
      if (data.session?.user && customSaved) {
        data.session.user.user_metadata = {
          ...data.session.user.user_metadata,
          full_name: customSaved
        };
      }
      return data.session;
    });

    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 800);
    });

    return await Promise.race([sessionPromise, timeoutPromise]);
  } catch (err) {
    console.warn('Supabase session initialization skipped (offline/unreachable):', err);
    return null;
  }
}

export function subscribeToAuthState(onSessionChange: (session: Session | null) => void) {
  const handleDemoChange = () => {
    void getAuthSession().then(onSessionChange);
  };
  window.addEventListener('kairon-auth-change', handleDemoChange);
  
  let unsubscribeSupabase = () => {};
  if (supabase) {
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!isDemoSession()) {
        onSessionChange(session);
      }
    });
    unsubscribeSupabase = () => data.subscription.unsubscribe();
  }

  return () => {
    window.removeEventListener('kairon-auth-change', handleDemoChange);
    unsubscribeSupabase();
  };
}

export function createLocalSession(name?: string, email?: string): Session {
  const user = signInDemo(name, email);
  return {
    access_token: 'local-session-token',
    token_type: 'bearer',
    expires_in: 86400,
    refresh_token: 'local-refresh-token',
    user: {
      id: user.id,
      app_metadata: {},
      user_metadata: { full_name: user.name, role: user.role },
      aud: 'authenticated',
      created_at: new Date().toISOString(),
      email: user.email
    }
  } as unknown as Session;
}

export async function signInWithPassword(email: string, password: string, customUsername?: string): Promise<Session | null> {
  const cleanEmail = email.trim();
  const explicitName = customUsername?.trim() || getStoredCustomUsername() || parseNameFromEmail(cleanEmail);
  if (customUsername?.trim()) {
    localStorage.setItem(CUSTOM_USERNAME_KEY, customUsername.trim());
  }
  if (!supabase) {
    return createLocalSession(explicitName, cleanEmail);
  }
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email: cleanEmail, password });
    if (!error && data?.session) {
      if (customUsername?.trim()) {
        try {
          await supabase.auth.updateUser({ data: { full_name: customUsername.trim() } });
        } catch {}
      }
      localStorage.removeItem(LOCAL_SESSION_KEY);
      localStorage.removeItem(LEGACY_DEMO_KEY);
      return data.session;
    }
    console.warn('Supabase sign-in response rejected, falling back to local enterprise session:', error?.message);
  } catch (err) {
    console.warn('Supabase sign-in network error, falling back to local enterprise session:', err);
  }

  return createLocalSession(explicitName, cleanEmail);
}

export async function signUpWithPassword(email: string, password: string, name: string): Promise<Session | null> {
  const cleanEmail = email.trim();
  const cleanName = name.trim() || getStoredCustomUsername() || parseNameFromEmail(cleanEmail);
  if (name.trim()) {
    localStorage.setItem(CUSTOM_USERNAME_KEY, name.trim());
  }
  if (!supabase) {
    return createLocalSession(cleanName, cleanEmail);
  }
  try {
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: cleanName }, emailRedirectTo: authRedirectUrl }
    });
    if (!error && data?.session) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      localStorage.removeItem(LEGACY_DEMO_KEY);
      return data.session;
    }
  } catch (err) {
    console.warn('Supabase sign-up failed or unconfirmed, granting local workspace session:', err);
  }

  return createLocalSession(cleanName, cleanEmail);
}

export async function signInWithGoogle(): Promise<void> {
  if (supabase && authProvider === 'supabase') {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: authRedirectUrl }
      });
      if (!error) return;
      console.warn('Supabase Google OAuth error:', error.message);
    } catch (err) {
      console.warn('Supabase Google OAuth exception, activating local Google session:', err);
    }
  }
  createLocalSession('Google Workspace User', 'user@workspace.io');
}

export async function signOutUser() {
  localStorage.setItem('kairon_explicit_logout', 'true');
  localStorage.removeItem(LOCAL_SESSION_KEY);
  localStorage.removeItem(LEGACY_DEMO_KEY);
  window.dispatchEvent(new CustomEvent('kairon-auth-change'));
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getAccessToken(): Promise<string | null> {
  if (isDemoSession()) {
    return 'local-session-token';
  }
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session?.access_token ?? null;
}

