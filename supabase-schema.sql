-- ============================================================
--  SABI Diary — Supabase Schema
--  Run this ONCE in your Supabase SQL editor (Database → SQL Editor)
-- ============================================================

-- Profiles are readable by their owner, but role changes are server-controlled.
create table if not exists public.profiles (
  id    uuid primary key references auth.users(id) on delete cascade,
  role  text not null default 'viewer'
);
alter table public.profiles enable row level security;

-- Remove client-side role mutation paths, including policies from older schema versions.
drop policy if exists "own profile" on public.profiles;
drop policy if exists "own profile insert" on public.profiles;
drop policy if exists "own profile update" on public.profiles;
drop policy if exists "own profile select" on public.profiles;
drop policy if exists "own profile delete" on public.profiles;
create policy "own profile select" on public.profiles for select using (auth.uid() = id);
revoke all on public.profiles from public, anon, authenticated;
grant select on public.profiles to authenticated;

-- New accounts start as viewers. Assign an owner role only through a trusted admin operation.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, role)
  values (new.id, 'viewer')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- spreads
create table if not exists spreads (
  id          uuid primary key default gen_random_uuid(),
  spread_num  int  not null unique,
  created_at  timestamptz default now()
);
alter table spreads enable row level security;

-- FIXED: Replace single policy with explicit INSERT, UPDATE, SELECT policies
-- INSERT and UPDATE check role directly without fallback to avoid 401 when profile doesn't exist
drop policy if exists "owner full" on spreads;
drop policy if exists "viewer read" on spreads;

create policy "owner insert" on spreads for insert with check (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "owner update" on spreads for update using (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "viewer read" on spreads for select using (auth.uid() is not null);

-- memories
create table if not exists memories (
  id           text primary key,
  spread_id    uuid references spreads(id) on delete cascade,
  spread_num   int  not null,
  page_side    text not null,
  slot_index   int  not null default 0,
  date_val     text,
  time_val     text,
  title        text,
  body_text    text,
  notes        text,
  text_pct_x   float default 0,
  text_pct_y   float default 0,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
alter table memories enable row level security;

-- FIXED: Replace single policy with explicit INSERT, UPDATE, SELECT policies
drop policy if exists "owner full" on memories;
drop policy if exists "viewer read" on memories;

create policy "owner insert" on memories for insert with check (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "owner update" on memories for update using (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "viewer read" on memories for select using (auth.uid() is not null);

-- memory_photos
create table if not exists memory_photos (
  id           uuid primary key default gen_random_uuid(),
  memory_id    text references memories(id) on delete cascade,
  storage_path text not null,
  public_url   text,
  pos_pct_x    float default 0,
  pos_pct_y    float default 0,
  width_px     int   default 140,
  height_px    int   default 140,
  rotation_deg float default -2.5,
  created_at   timestamptz default now()
);
alter table memory_photos enable row level security;

drop policy if exists "owner full" on memory_photos;
drop policy if exists "viewer read" on memory_photos;

create policy "owner insert" on memory_photos for insert with check (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "owner update" on memory_photos for update using (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "viewer read" on memory_photos for select using (auth.uid() is not null);

-- memory_stickers
create table if not exists memory_stickers (
  id           text primary key,
  memory_id    text references memories(id) on delete cascade,
  emoji        text not null,
  pos_pct_x    float default 55,
  pos_pct_y    float default 8,
  rotation_deg float default 0,
  scale        float default 1.0,
  created_at   timestamptz default now()
);
alter table memory_stickers enable row level security;

drop policy if exists "owner full" on memory_stickers;
drop policy if exists "viewer read" on memory_stickers;

create policy "owner insert" on memory_stickers for insert with check (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "owner update" on memory_stickers for update using (
  (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "viewer read" on memory_stickers for select using (auth.uid() is not null);

-- Storage bucket
insert into storage.buckets (id, name, public) values ('diary-photos', 'diary-photos', false) on conflict do nothing;

drop policy if exists "owner upload" on storage.objects;
drop policy if exists "owner delete" on storage.objects;
drop policy if exists "auth read" on storage.objects;

create policy "owner upload" on storage.objects for insert with check (
  bucket_id = 'diary-photos' and (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "owner delete" on storage.objects for delete using (
  bucket_id = 'diary-photos' and (select role from profiles where id = auth.uid()) = 'owner'
);
create policy "auth read" on storage.objects for select using (
  bucket_id = 'diary-photos' and auth.uid() is not null
);

-- To grant diary editing access, update exactly one trusted account from an admin
-- context after confirming its auth user ID; never promote every viewer at once.
-- UPDATE public.profiles SET role = 'owner' WHERE id = '<confirmed-auth-user-uuid>';
