create table if not exists public.user_profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  workspace_name text not null default 'Northstar Labs',
  timezone text not null default 'UTC',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.user_preferences (
  user_id uuid primary key references auth.users(id) on delete cascade,
  risk_alerts_enabled boolean not null default true,
  weekly_digest_enabled boolean not null default true,
  reduce_motion boolean not null default false,
  updated_at timestamptz not null default now()
);

create table if not exists public.review_notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  account_id text not null,
  note text not null check (char_length(note) between 1 and 5000),
  created_at timestamptz not null default now()
);

alter table public.user_profiles enable row level security;
alter table public.user_preferences enable row level security;
alter table public.review_notes enable row level security;

create policy "Users can view their own profile" on public.user_profiles for select using (auth.uid() = id);
create policy "Users can create their own profile" on public.user_profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.user_profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can view their own preferences" on public.user_preferences for select using (auth.uid() = user_id);
create policy "Users can create their own preferences" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "Users can update their own preferences" on public.user_preferences for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

create policy "Users can view their own review notes" on public.review_notes for select using (auth.uid() = user_id);
create policy "Users can create their own review notes" on public.review_notes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own review notes" on public.review_notes for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.user_profiles (id, full_name)
  values (new.id, new.raw_user_meta_data ->> 'full_name')
  on conflict (id) do nothing;
  insert into public.user_preferences (user_id)
  values (new.id)
  on conflict (user_id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
