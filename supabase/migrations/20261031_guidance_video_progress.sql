-- Run this migration in the existing Olympionlab Supabase project.
-- Shared YouTube guidance videos are not rows of lesson_videos, so their
-- per-student completion needs a separate table.
create table if not exists public.user_guidance_video_progress (
  user_id uuid not null references auth.users(id) on delete cascade,
  youtube_id text not null check (youtube_id ~ '^[A-Za-z0-9_-]{11}$'),
  completed_at timestamptz not null default now(),
  primary key (user_id, youtube_id)
);

create index if not exists user_guidance_video_progress_user_idx
  on public.user_guidance_video_progress (user_id);

alter table public.user_guidance_video_progress enable row level security;

drop policy if exists "guidance_read_own" on public.user_guidance_video_progress;
create policy "guidance_read_own" on public.user_guidance_video_progress
  for select to authenticated using (auth.uid() = user_id);

drop policy if exists "guidance_insert_own" on public.user_guidance_video_progress;
create policy "guidance_insert_own" on public.user_guidance_video_progress
  for insert to authenticated with check (auth.uid() = user_id);

drop policy if exists "guidance_update_own" on public.user_guidance_video_progress;
create policy "guidance_update_own" on public.user_guidance_video_progress
  for update to authenticated using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
