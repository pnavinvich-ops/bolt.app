-- 0005_clips_backups.sql
-- Video form-check bucket + per-user cloud backup table.

-- Public-read bucket for form-check clips (uploads require auth)
insert into storage.buckets (id, name, public)
values ('clips', 'clips', true)
on conflict (id) do nothing;

create policy "clips_read_all"
  on storage.objects for select
  using (bucket_id = 'clips');

create policy "clips_insert_auth"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'clips');

create policy "clips_delete_own"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'clips' and owner = auth.uid());

-- Cloud backup: one JSON snapshot per user, upserted by the app
create table if not exists public.user_backups (
  user_id    uuid primary key references auth.users(id) on delete cascade,
  data       jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.user_backups enable row level security;

create policy "backups_own_rw"
  on public.user_backups for all
  to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
