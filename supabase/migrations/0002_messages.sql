-- 0002_messages.sql
create table if not exists public.messages (
  id          uuid primary key default gen_random_uuid(),
  room_id     text not null,                          -- 'global' | 'eu-hw' | group uuid
  user_id     uuid references auth.users(id) on delete set null,
  user_name   text not null,
  content     text not null check (char_length(content) between 1 and 1000),
  created_at  timestamptz not null default now()
);

create index if not exists idx_messages_room_time on public.messages (room_id, created_at desc);

alter table public.messages enable row level security;

-- Anyone authenticated can read any room
create policy "messages_read_auth"
  on public.messages for select
  to authenticated
  using (true);

-- Authenticated users can insert their own messages.
-- For group rooms, tighten this with a join against public.room_members.
create policy "messages_insert_auth"
  on public.messages for insert
  to authenticated
  with check (auth.uid() = user_id);

-- Users can delete their own messages
create policy "messages_delete_own"
  on public.messages for delete
  to authenticated
  using (auth.uid() = user_id);

-- Enable Realtime
alter publication supabase_realtime add table public.messages;
