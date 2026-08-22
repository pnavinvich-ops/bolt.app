-- 0004_clubs_reports.sql
-- Partner/club directory + chat abuse reports.

create table if not exists public.clubs (
  id         uuid primary key default gen_random_uuid(),
  name       text not null check (char_length(name) between 2 and 80),
  city       text not null check (char_length(city) between 2 and 60),
  country    text,
  contact    text,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_clubs_city on public.clubs (city);
create index if not exists idx_clubs_country on public.clubs (country);

alter table public.clubs enable row level security;

-- Anyone (even unauthenticated visitors) can browse the directory
create policy "clubs_read_all"
  on public.clubs for select
  using (true);

-- Only signed-in users can add a club; it must be attributed to them
create policy "clubs_insert_auth"
  on public.clubs for insert
  to authenticated
  with check (auth.uid() = created_by);

-- Authors can remove their own listing
create policy "clubs_delete_own"
  on public.clubs for delete
  to authenticated
  using (auth.uid() = created_by);

alter table public.clubs replica identity full;

-- ---------------------------------------------------------------------------
-- Chat abuse reports
create table if not exists public.message_reports (
  id          uuid primary key default gen_random_uuid(),
  message_id  uuid references public.messages(id) on delete cascade,
  reported_by uuid references auth.users(id) on delete set null,
  reason      text,
  created_at  timestamptz not null default now()
);

create index if not exists idx_message_reports_message on public.message_reports (message_id);

alter table public.message_reports enable row level security;

create policy "reports_insert_auth"
  on public.message_reports for insert
  to authenticated
  with check (auth.uid() = reported_by);
