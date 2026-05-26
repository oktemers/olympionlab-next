-- Olympion MVP Supabase tablo taslağı
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  grade text,
  school_type text,
  target_branch text,
  plan text default 'free',
  created_at timestamptz default now()
);

create table if not exists videos (
  id text primary key,
  title text not null,
  branch text,
  level text,
  youtube_id text,
  duration text,
  is_premium boolean default false,
  sort_order int default 0
);

create table if not exists courses (
  id text primary key,
  title text not null,
  branch text,
  description text
);

create table if not exists progress (
  user_id uuid references profiles(id) on delete cascade,
  video_id text references videos(id) on delete cascade,
  completed boolean default false,
  completed_at timestamptz,
  primary key(user_id, video_id)
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade,
  video_id text,
  content text,
  created_at timestamptz default now()
);
