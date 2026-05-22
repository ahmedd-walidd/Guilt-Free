create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  currency text not null default 'EGP',
  monthly_income numeric not null default 0 check (monthly_income >= 0),
  fixed_costs_percentage numeric not null default 50 check (fixed_costs_percentage >= 0),
  investments_percentage numeric not null default 10 check (investments_percentage >= 0),
  savings_percentage numeric not null default 15 check (savings_percentage >= 0),
  guilt_free_percentage numeric not null default 20 check (guilt_free_percentage >= 0),
  buffer_percentage numeric not null default 5 check (buffer_percentage >= 0),
  has_completed_onboarding boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_percentages_total_check check (
    fixed_costs_percentage
    + investments_percentage
    + savings_percentage
    + guilt_free_percentage
    + buffer_percentage = 100
  )
);

create table if not exists public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  amount numeric not null check (amount > 0),
  category text not null,
  transaction_type text not null check (
    transaction_type in (
      'income',
      'fixed_cost',
      'investment',
      'saving',
      'guilt_free',
      'waste'
    )
  ),
  transaction_date date not null default current_date,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  target_amount numeric not null check (target_amount > 0),
  current_amount numeric not null default 0 check (current_amount >= 0),
  monthly_contribution numeric not null default 0 check (monthly_contribution >= 0),
  target_date date,
  priority text not null default 'medium' check (priority in ('low', 'medium', 'high')),
  status text not null default 'active' check (status in ('active', 'completed', 'paused')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.purchase_checks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  item_name text not null,
  price numeric not null check (price > 0),
  reason text,
  decision text not null check (decision in ('green', 'yellow', 'red')),
  decision_message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.monthly_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  month text not null,
  what_went_well text,
  wasteful_spending_notes text,
  next_month_focus text,
  score numeric not null default 0 check (score >= 0 and score <= 100),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint monthly_reviews_user_month_unique unique (user_id, month)
);

create index if not exists profiles_completed_idx on public.profiles (has_completed_onboarding);
create index if not exists transactions_user_date_idx on public.transactions (user_id, transaction_date desc);
create index if not exists transactions_user_type_date_idx on public.transactions (user_id, transaction_type, transaction_date desc);
create index if not exists goals_user_status_idx on public.goals (user_id, status);
create index if not exists purchase_checks_user_created_idx on public.purchase_checks (user_id, created_at desc);
create index if not exists monthly_reviews_user_month_idx on public.monthly_reviews (user_id, month);

create or replace function public.update_updated_at_column()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_profiles_updated_at on public.profiles;
create trigger update_profiles_updated_at
before update on public.profiles
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_transactions_updated_at on public.transactions;
create trigger update_transactions_updated_at
before update on public.transactions
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_goals_updated_at on public.goals;
create trigger update_goals_updated_at
before update on public.goals
for each row
execute function public.update_updated_at_column();

drop trigger if exists update_monthly_reviews_updated_at on public.monthly_reviews;
create trigger update_monthly_reviews_updated_at
before update on public.monthly_reviews
for each row
execute function public.update_updated_at_column();

alter table public.profiles enable row level security;
alter table public.transactions enable row level security;
alter table public.goals enable row level security;
alter table public.purchase_checks enable row level security;
alter table public.monthly_reviews enable row level security;

drop policy if exists "Users can select their own profile" on public.profiles;
create policy "Users can select their own profile"
on public.profiles
for select
using (auth.uid() = id);

drop policy if exists "Users can insert their own profile" on public.profiles;
create policy "Users can insert their own profile"
on public.profiles
for insert
with check (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.profiles;
create policy "Users can update their own profile"
on public.profiles
for update
using (auth.uid() = id)
with check (auth.uid() = id);

drop policy if exists "Users can delete their own profile" on public.profiles;
create policy "Users can delete their own profile"
on public.profiles
for delete
using (auth.uid() = id);

drop policy if exists "Users can select their own transactions" on public.transactions;
create policy "Users can select their own transactions"
on public.transactions
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own transactions" on public.transactions;
create policy "Users can insert their own transactions"
on public.transactions
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own transactions" on public.transactions;
create policy "Users can update their own transactions"
on public.transactions
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own transactions" on public.transactions;
create policy "Users can delete their own transactions"
on public.transactions
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select their own goals" on public.goals;
create policy "Users can select their own goals"
on public.goals
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own goals" on public.goals;
create policy "Users can insert their own goals"
on public.goals
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own goals" on public.goals;
create policy "Users can update their own goals"
on public.goals
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own goals" on public.goals;
create policy "Users can delete their own goals"
on public.goals
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select their own purchase checks" on public.purchase_checks;
create policy "Users can select their own purchase checks"
on public.purchase_checks
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own purchase checks" on public.purchase_checks;
create policy "Users can insert their own purchase checks"
on public.purchase_checks
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own purchase checks" on public.purchase_checks;
create policy "Users can update their own purchase checks"
on public.purchase_checks
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own purchase checks" on public.purchase_checks;
create policy "Users can delete their own purchase checks"
on public.purchase_checks
for delete
using (auth.uid() = user_id);

drop policy if exists "Users can select their own monthly reviews" on public.monthly_reviews;
create policy "Users can select their own monthly reviews"
on public.monthly_reviews
for select
using (auth.uid() = user_id);

drop policy if exists "Users can insert their own monthly reviews" on public.monthly_reviews;
create policy "Users can insert their own monthly reviews"
on public.monthly_reviews
for insert
with check (auth.uid() = user_id);

drop policy if exists "Users can update their own monthly reviews" on public.monthly_reviews;
create policy "Users can update their own monthly reviews"
on public.monthly_reviews
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists "Users can delete their own monthly reviews" on public.monthly_reviews;
create policy "Users can delete their own monthly reviews"
on public.monthly_reviews
for delete
using (auth.uid() = user_id);
