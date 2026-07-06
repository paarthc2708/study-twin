-- StudyTwin AI — initial schema
--
-- Derived directly from the 9 Stitch-exported screens:
--   profiles              <- Settings (personal info, AI twin preferences, streak shown on Dashboard/Analytics)
--   courses                <- topic/subject chips on Dashboard, Quiz Generator, Study Strategy, Analytics
--   notes                  <- "Custom Topic: Upload PDF/Link" (Quiz Generator), "summarize my notes" (AI Mentor)
--   flashcard_decks/cards  <- "Create flashcards" quick action (AI Mentor), Spaced Repetition Calendar (Study Strategy)
--   quizzes/questions/     <- Quiz Generator's 3-state flow: selection -> quiz -> results
--   quiz_attempts/answers
--   ai_chat_sessions/      <- AI Mentor's chat history sidebar + message thread
--   ai_chat_messages
--   study_sessions          <- Dashboard "Today's Focus", Recent Activity, Analytics "Study Hours per Week"
--   topic_mastery,          <- Analytics (Topic Mastery grid, Quiz Scores by Subject), Digital Twin
--   daily_activity,           (Cognitive Radar, Subject Calibration), Study Strategy (progress bar)
--   cognitive_metrics,
--   confidence_calibration
--   goals                   <- Dashboard "Today's Tasks" + "Upcoming Deadlines", Study Strategy "Milestones"
--   ai_recommendations      <- Dashboard "AI Recommendations", Study Strategy "AI Strategy Insight",
--                              Digital Twin "AI Insights"
--
-- "users" is Supabase's built-in auth.users — not created here. "profiles" is
-- its 1:1 public extension table, auto-populated by the trigger at the
-- bottom of this file.

-- gen_random_uuid() is a Postgres core function since v13 (Supabase runs 15+),
-- so no extension is required for the uuid defaults used throughout this file.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  avatar_url text,
  academic_level text check (academic_level in ('undergraduate', 'graduate', 'phd_candidate', 'lifelong_learner')),
  bio text,
  plan text not null default 'free' check (plan in ('free', 'pro', 'premium')),
  mentor_personality smallint not null default 50 check (mentor_personality between 0 and 100), -- 0 = Encouraging, 100 = Strict
  daily_study_reminders boolean not null default true,
  push_alerts boolean not null default true,
  dark_mode boolean not null default false,
  language text not null default 'en',
  current_streak_days integer not null default 0,
  longest_streak_days integer not null default 0,
  last_active_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new Supabase Auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- courses
-- ---------------------------------------------------------------------------

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  subject text,
  icon text,
  color text,
  mastery_percent numeric(5, 2) not null default 0 check (mastery_percent between 0 and 100),
  is_archived boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists courses_user_id_idx on public.courses (user_id);

create trigger set_courses_updated_at
  before update on public.courses
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- notes
-- ---------------------------------------------------------------------------

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  content text,
  source_type text not null default 'manual' check (source_type in ('manual', 'upload', 'link', 'ai_summary')),
  source_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_id_idx on public.notes (user_id);
create index if not exists notes_course_id_idx on public.notes (course_id);

create trigger set_notes_updated_at
  before update on public.notes
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- flashcards
-- ---------------------------------------------------------------------------

create table if not exists public.flashcard_decks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  name text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flashcard_decks_user_id_idx on public.flashcard_decks (user_id);

create trigger set_flashcard_decks_updated_at
  before update on public.flashcard_decks
  for each row execute function public.set_updated_at();

create table if not exists public.flashcards (
  id uuid primary key default gen_random_uuid(),
  deck_id uuid not null references public.flashcard_decks (id) on delete cascade,
  front text not null,
  back text not null,
  -- SM-2 spaced repetition state, drives the Study Strategy "Spaced Repetition Calendar"
  ease_factor numeric(4, 2) not null default 2.5,
  interval_days integer not null default 0,
  repetitions integer not null default 0,
  next_review_date date not null default current_date,
  last_reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists flashcards_deck_id_idx on public.flashcards (deck_id);
create index if not exists flashcards_next_review_date_idx on public.flashcards (next_review_date);

create trigger set_flashcards_updated_at
  before update on public.flashcards
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- quizzes (Quiz Generator: selection -> quiz -> results)
-- ---------------------------------------------------------------------------

create table if not exists public.quizzes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  difficulty text not null default 'adaptive_ai' check (difficulty in ('standard', 'adaptive_ai', 'expert')),
  question_count integer not null default 10 check (question_count > 0),
  created_at timestamptz not null default now()
);

create index if not exists quizzes_user_id_idx on public.quizzes (user_id);

create table if not exists public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question_text text not null,
  options jsonb not null, -- [{ "label": "A", "text": "..." }, ...]
  correct_option text not null,
  explanation text,
  order_index integer not null default 0
);

create index if not exists quiz_questions_quiz_id_idx on public.quiz_questions (quiz_id);

create table if not exists public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed', 'abandoned')),
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  score integer,
  accuracy_percent numeric(5, 2),
  time_spent_seconds integer,
  ai_feedback text -- "Twin Feedback" paragraph on the results screen
);

create index if not exists quiz_attempts_user_id_idx on public.quiz_attempts (user_id);
create index if not exists quiz_attempts_quiz_id_idx on public.quiz_attempts (quiz_id);

create table if not exists public.quiz_attempt_answers (
  id uuid primary key default gen_random_uuid(),
  attempt_id uuid not null references public.quiz_attempts (id) on delete cascade,
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  selected_option text,
  is_correct boolean not null default false,
  flagged_for_review boolean not null default false,
  answered_at timestamptz not null default now(),
  unique (attempt_id, question_id)
);

create index if not exists quiz_attempt_answers_attempt_id_idx on public.quiz_attempt_answers (attempt_id);

-- ---------------------------------------------------------------------------
-- ai_chats (AI Mentor)
-- ---------------------------------------------------------------------------

create table if not exists public.ai_chat_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null default 'New Session',
  preview text,
  icon text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_chat_sessions_user_id_idx on public.ai_chat_sessions (user_id);

create trigger set_ai_chat_sessions_updated_at
  before update on public.ai_chat_sessions
  for each row execute function public.set_updated_at();

create table if not exists public.ai_chat_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.ai_chat_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists ai_chat_messages_session_id_idx on public.ai_chat_messages (session_id);

-- ---------------------------------------------------------------------------
-- study_sessions (Dashboard "Today's Focus" / Recent Activity, Analytics "Study Hours per Week")
-- ---------------------------------------------------------------------------

create table if not exists public.study_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  session_type text not null default 'focus' check (session_type in ('focus', 'quiz', 'flashcard_review', 'reading', 'ai_chat')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  duration_minutes integer,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists study_sessions_user_id_idx on public.study_sessions (user_id);
create index if not exists study_sessions_started_at_idx on public.study_sessions (started_at);

-- ---------------------------------------------------------------------------
-- progress tracking (Analytics + Digital Twin screens)
-- ---------------------------------------------------------------------------

-- Per-topic mastery within a course, e.g. "Cell Structure 88%" on the
-- Analytics "Topic Mastery" grid.
create table if not exists public.topic_mastery (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  topic_name text not null,
  mastery_percent numeric(5, 2) not null default 0 check (mastery_percent between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id, topic_name)
);

create index if not exists topic_mastery_user_id_idx on public.topic_mastery (user_id);

create trigger set_topic_mastery_updated_at
  before update on public.topic_mastery
  for each row execute function public.set_updated_at();

-- One row per user per day: backs the Analytics heatmap, the "Study Hours
-- per Week" chart, and the Dashboard streak counter.
create table if not exists public.daily_activity (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  activity_date date not null,
  minutes_studied integer not null default 0,
  quizzes_completed integer not null default 0,
  unique (user_id, activity_date)
);

create index if not exists daily_activity_user_id_idx on public.daily_activity (user_id);
create index if not exists daily_activity_date_idx on public.daily_activity (activity_date);

-- One row per user: the Digital Twin's "Cognitive Radar" (Logic/Memory/
-- Detail/Speed/Consistency) and learning-style card.
create table if not exists public.cognitive_metrics (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  learning_style text check (learning_style in ('visual', 'auditory', 'kinesthetic', 'reading_writing')),
  logic_score smallint check (logic_score between 0 and 100),
  memory_score smallint check (memory_score between 0 and 100),
  detail_score smallint check (detail_score between 0 and 100),
  speed_score smallint check (speed_score between 0 and 100),
  consistency_score smallint check (consistency_score between 0 and 100),
  cognitive_load_percent smallint check (cognitive_load_percent between 0 and 100),
  updated_at timestamptz not null default now()
);

create trigger set_cognitive_metrics_updated_at
  before update on public.cognitive_metrics
  for each row execute function public.set_updated_at();

-- Digital Twin's "Subject Calibration" bars: confidence vs. actual performance.
create table if not exists public.confidence_calibration (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  confidence_percent numeric(5, 2) not null check (confidence_percent between 0 and 100),
  actual_percent numeric(5, 2) not null check (actual_percent between 0 and 100),
  updated_at timestamptz not null default now(),
  unique (user_id, course_id)
);

create index if not exists confidence_calibration_user_id_idx on public.confidence_calibration (user_id);

create trigger set_confidence_calibration_updated_at
  before update on public.confidence_calibration
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- goals (Dashboard "Today's Tasks" + "Upcoming Deadlines", Study Strategy "Milestones")
-- ---------------------------------------------------------------------------

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  description text,
  goal_type text not null default 'task' check (goal_type in ('task', 'deadline', 'milestone')),
  priority text check (priority in ('low', 'medium', 'high')),
  due_date date,
  status text not null default 'pending' check (status in ('pending', 'completed')),
  completed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists goals_user_id_idx on public.goals (user_id);
create index if not exists goals_due_date_idx on public.goals (due_date);

create trigger set_goals_updated_at
  before update on public.goals
  for each row execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- ai_recommendations (Dashboard, Study Strategy, Digital Twin "AI Insight" cards)
-- ---------------------------------------------------------------------------

create table if not exists public.ai_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid references public.courses (id) on delete set null,
  title text not null,
  body text not null,
  recommendation_type text not null default 'insight' check (recommendation_type in ('review_topic', 'strategy_session', 'insight')),
  is_dismissed boolean not null default false,
  created_at timestamptz not null default now()
);

create index if not exists ai_recommendations_user_id_idx on public.ai_recommendations (user_id);

-- ---------------------------------------------------------------------------
-- Row Level Security — every table is private to its owning user.
-- ---------------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.courses enable row level security;
alter table public.notes enable row level security;
alter table public.flashcard_decks enable row level security;
alter table public.flashcards enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.quiz_attempt_answers enable row level security;
alter table public.ai_chat_sessions enable row level security;
alter table public.ai_chat_messages enable row level security;
alter table public.study_sessions enable row level security;
alter table public.topic_mastery enable row level security;
alter table public.daily_activity enable row level security;
alter table public.cognitive_metrics enable row level security;
alter table public.confidence_calibration enable row level security;
alter table public.goals enable row level security;
alter table public.ai_recommendations enable row level security;

-- profiles: a user can see and edit only their own profile row.
create policy "Profiles are viewable by owner" on public.profiles
  for select using (auth.uid() = id);
create policy "Profiles are updatable by owner" on public.profiles
  for update using (auth.uid() = id);

-- Tables with a direct user_id column: standard "owner does everything" policy.
do $$
declare
  t text;
begin
  foreach t in array array[
    'courses', 'notes', 'flashcard_decks', 'quizzes', 'quiz_attempts',
    'ai_chat_sessions', 'study_sessions', 'topic_mastery', 'daily_activity',
    'confidence_calibration', 'goals', 'ai_recommendations'
  ]
  loop
    execute format(
      'create policy "Owner has full access" on public.%I for all using (auth.uid() = user_id) with check (auth.uid() = user_id);',
      t
    );
  end loop;
end $$;

-- cognitive_metrics: user_id is the primary key here, same ownership rule.
create policy "Owner has full access" on public.cognitive_metrics
  for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Child tables without their own user_id: ownership is checked through the parent.
create policy "Owner has full access via quiz" on public.quiz_questions
  for all using (
    exists (select 1 from public.quizzes q where q.id = quiz_questions.quiz_id and q.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.quizzes q where q.id = quiz_questions.quiz_id and q.user_id = auth.uid())
  );

create policy "Owner has full access via attempt" on public.quiz_attempt_answers
  for all using (
    exists (select 1 from public.quiz_attempts a where a.id = quiz_attempt_answers.attempt_id and a.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.quiz_attempts a where a.id = quiz_attempt_answers.attempt_id and a.user_id = auth.uid())
  );

create policy "Owner has full access via session" on public.ai_chat_messages
  for all using (
    exists (select 1 from public.ai_chat_sessions s where s.id = ai_chat_messages.session_id and s.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.ai_chat_sessions s where s.id = ai_chat_messages.session_id and s.user_id = auth.uid())
  );

create policy "Owner has full access via deck" on public.flashcards
  for all using (
    exists (select 1 from public.flashcard_decks d where d.id = flashcards.deck_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.flashcard_decks d where d.id = flashcards.deck_id and d.user_id = auth.uid())
  );
