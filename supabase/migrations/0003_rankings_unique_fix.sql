-- 0003_rankings_unique_fix.sql
-- Run in the Supabase SQL editor to fix the live database.
-- The original 0001 used (athlete, class, arm, source, updated_at) as the
-- unique key, which means re-scraping inserts duplicates. Replace with a
-- stable (athlete, class, arm, source) key so re-runs update in place.

-- 1. Deduplicate: keep the most recent row per (athlete, class, arm, source)
delete from public.rankings a
using public.rankings b
where a.ctid < b.ctid
  and a.athlete_name = b.athlete_name
  and a.weight_class = b.weight_class
  and a.arm_hand = b.arm_hand
  and a.source = b.source;

-- 2. Drop the old unique constraint
alter table public.rankings
  drop constraint if exists rankings_athlete_name_weight_class_arm_hand_source_updated_at_key;

-- 3. Add the new constraint
alter table public.rankings
  add constraint rankings_athlete_class_arm_source_key
  unique (athlete_name, weight_class, arm_hand, source);
