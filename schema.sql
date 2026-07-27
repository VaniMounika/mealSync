-- Run this once in your Supabase project's SQL editor (Supabase dashboard → SQL Editor → New query).

create table if not exists households (
  id text primary key,               -- the 6-character household code
  profiles jsonb not null default '[]',
  pantry jsonb not null default '[]',
  preferences text not null default '',
  created_at timestamptz not null default now()
);

create table if not exists meal_plans (
  household_id text not null references households(id) on delete cascade,
  date date not null,
  slots jsonb not null default '{}',
  nutrition jsonb,
  status text not null default 'empty',
  ai_notes text,
  updated_at timestamptz not null default now(),
  primary key (household_id, date)
);

alter table households enable row level security;
alter table meal_plans enable row level security;

-- No login system here — access is controlled only by knowing the household code.
-- That's a reasonable tradeoff for a private, two-person family app, but it does mean
-- anyone with your public anon key could technically query any household's data if they
-- already knew (or guessed) its code. Fine for personal use; don't store anything sensitive.
create policy "household read" on households for select using (true);
create policy "household insert" on households for insert with check (true);
create policy "household update" on households for update using (true);

create policy "plans read" on meal_plans for select using (true);
create policy "plans insert" on meal_plans for insert with check (true);
create policy "plans update" on meal_plans for update using (true);
