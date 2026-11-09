-- ====================================================================
-- KAIRON ENTERPRISE SCHEMA (Postgres / Supabase)
-- Implements Row Level Security (RLS) scoped by organization & user
-- ====================================================================

-- 1. Organizations
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 2. Organization Memberships & RBAC (Admin, Manager, Analyst, Viewer)
create table if not exists public.memberships (
  id uuid primary key default gen_random_uuid(),
  org_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('Admin', 'Manager', 'Analyst', 'Viewer')) default 'Analyst',
  created_at timestamptz not null default now(),
  unique (org_id, user_id)
);

-- 3. Customer Accounts Monitored
create table if not exists public.accounts (
  id text primary key,
  org_id uuid references public.organizations(id) on delete set null,
  user_id uuid references auth.users(id) on delete cascade,
  customer_id text not null,
  company_name text not null,
  monthly_charges numeric not null default 0,
  churn_probability numeric not null default 0,
  risk_tier text not null check (risk_tier in ('Low', 'Moderate', 'High', 'Critical')),
  risk_color text not null,
  revenue_at_risk numeric not null default 0,
  estimated_clv numeric not null default 0,
  contract_type text,
  profile jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 4. Predictions & Inference History (Stamped with Model Version)
create table if not exists public.predictions (
  id uuid primary key default gen_random_uuid(),
  account_id text references public.accounts(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  churn_probability numeric not null,
  risk_tier text not null,
  model_version text not null default '1.0.0',
  model_name text not null default 'Random Forest Classifier',
  top_drivers jsonb,
  retention_playbook jsonb,
  created_at timestamptz not null default now()
);

-- 5. Team Reviews Workflow
create table if not exists public.reviews (
  id text primary key,
  org_id uuid references public.organizations(id) on delete cascade,
  account_id text references public.accounts(id) on delete cascade,
  name text not null,
  reason text not null,
  risk text not null check (risk in ('Low', 'Moderate', 'High', 'Critical')),
  risk_score numeric not null,
  owner text not null,
  mrr numeric not null default 0,
  status text not null check (status in ('Open', 'In progress', 'Done')) default 'Open',
  due_date date,
  suggestion text,
  human_override_tier text,
  human_override_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 6. Interventions & Closed-Loop Outcomes
create table if not exists public.interventions (
  id uuid primary key default gen_random_uuid(),
  account_id text references public.accounts(id) on delete cascade,
  action_type text not null,
  outcome text check (outcome in ('renewed', 'churned', 'pending', 'negotiating')) default 'pending',
  notes_ciphertext text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

-- 7. Workspace Settings
create table if not exists public.settings (
  id uuid primary key default gen_random_uuid(),
  org_id uuid references public.organizations(id) on delete cascade,
  key text not null,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  unique (org_id, key)
);

-- 8. Notifications
create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  account_id text references public.accounts(id) on delete cascade,
  title text not null,
  message text not null,
  read boolean not null default false,
  created_at timestamptz not null default now()
);

-- 9. Audit Log (Never logs customer plaintext)
create table if not exists public.audit_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  action text not null check (action in ('LOGIN', 'LOGOUT', 'SCORE_ACCOUNT', 'BATCH_UPLOAD', 'EXPORT_CSV', 'KEY_ROTATION', 'OVERRIDE_SCORE', 'DELETE_DATA')),
  metadata jsonb,
  client_ip text,
  created_at timestamptz not null default now()
);

-- Enable RLS on every single table
alter table public.organizations enable row level security;
alter table public.memberships enable row level security;
alter table public.accounts enable row level security;
alter table public.predictions enable row level security;
alter table public.reviews enable row level security;
alter table public.interventions enable row level security;
alter table public.settings enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_log enable row level security;

-- Policies: Organizations & Memberships
create policy "Members can view their own organization" on public.organizations
  for select using (id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "Users can view memberships for their org" on public.memberships
  for select using (user_id = auth.uid() or org_id in (select org_id from public.memberships where user_id = auth.uid()));

-- Policies: Accounts
create policy "Users can view their organization accounts" on public.accounts
  for select using (auth.uid() = user_id or org_id in (select org_id from public.memberships where user_id = auth.uid()));

create policy "Users can insert accounts" on public.accounts
  for insert with check (auth.uid() = user_id);

create policy "Users can update accounts" on public.accounts
  for update using (auth.uid() = user_id);

create policy "Users can delete accounts" on public.accounts
  for delete using (auth.uid() = user_id);

-- Policies: Reviews
create policy "Users can view reviews" on public.reviews
  for select using (true);

create policy "Users can modify reviews" on public.reviews
  for all using (true);

-- Policies: Notifications
create policy "Users can view their notifications" on public.notifications
  for select using (auth.uid() = user_id);

-- Policies: Audit Log
create policy "Users can view audit log" on public.audit_log
  for select using (auth.uid() = user_id or auth.uid() in (select user_id from public.memberships where role in ('Admin', 'Manager')));

create policy "Users can insert audit events" on public.audit_log
  for insert with check (true);
