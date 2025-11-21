-- Migration: create subscriptions and payments tables based on docs/05_db_supabase_schema.md

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id),
  status text not null,
  trial_started_at timestamptz not null,
  trial_ends_at timestamptz not null,
  current_period_start timestamptz,
  current_period_end timestamptz,
  created_at timestamptz not null default timezone('utc', now())
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  doctor_id uuid not null references public.doctors(id),
  provider text not null,
  external_payment_id text not null,
  amount numeric not null,
  currency text not null,
  status text not null,
  created_at timestamptz not null default timezone('utc', now()),
  paid_at timestamptz
);

