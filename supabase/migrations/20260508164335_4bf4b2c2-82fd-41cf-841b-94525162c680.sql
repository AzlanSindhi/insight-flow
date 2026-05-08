
-- profiles
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  company text,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.profiles enable row level security;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name) values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  insert into public.user_settings (user_id) values (new.id);
  return new;
end;
$$;

-- datasets
create table public.datasets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  file_name text not null,
  file_size bigint not null default 0,
  file_type text,
  row_count integer not null default 0,
  column_count integer not null default 0,
  health_score integer not null default 90,
  status text not null default 'Analyzed',
  summary text,
  created_at timestamptz not null default now()
);
alter table public.datasets enable row level security;
create policy "datasets_all_own" on public.datasets for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index datasets_user_idx on public.datasets(user_id, created_at desc);

-- chat_messages
create table public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user','assistant')),
  content text not null,
  created_at timestamptz not null default now()
);
alter table public.chat_messages enable row level security;
create policy "chat_all_own" on public.chat_messages for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
create index chat_user_idx on public.chat_messages(user_id, created_at);

-- user_settings
create table public.user_settings (
  user_id uuid primary key references auth.users(id) on delete cascade,
  theme text not null default 'Light',
  language text not null default 'English (US)',
  notifications jsonb not null default '{"analysis_alerts":true,"weekly_digest":true,"product_updates":false}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.user_settings enable row level security;
create policy "settings_all_own" on public.user_settings for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- trigger
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute function public.handle_new_user();
