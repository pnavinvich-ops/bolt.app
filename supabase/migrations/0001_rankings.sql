-- 0001_rankings.sql
-- World rankings scraped from external sources (WAF, EVW, PAL, etc.)
-- One row per (athlete, weight class, arm, source). Re-scraping updates in place.

create table if not exists public.rankings (
  id           bigserial primary key,
  rank         int          not null,
  athlete_name text         not null,
  country      text         not null,           -- ISO 3166-1 alpha-2
  country_name text,                            -- human-readable as the source wrote it
  weight_class text         not null,           -- 'SHW','HW','LHW','MW','WW','LW','FE', etc.
  weight_kg    numeric(5,1),                    -- null for "+" open classes
  arm_hand     text         not null check (arm_hand in ('right','left')),
  points       int,
  source       text         not null,           -- 'EVW', 'WAF', etc.
  source_url   text,
  updated_at   timestamptz  not null default now(),
  created_at   timestamptz  not null default now(),
  unique (athlete_name, weight_class, arm_hand, source)
);

create index if not exists idx_rankings_weight_arm on public.rankings (weight_class, arm_hand, rank);
create index if not exists idx_rankings_updated    on public.rankings (updated_at desc);

-- World rankings are public read
alter table public.rankings enable row level security;

create policy "rankings_read_public"
  on public.rankings for select
  using (true);

-- Writes only via service role (scraper uses service_role key)
create policy "rankings_write_service"
  on public.rankings for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

-- Optional: enable realtime for live leaderboard updates
-- alter publication supabase_realtime add table public.rankings;
