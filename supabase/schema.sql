-- ─────────────────────────────────────────────────────────────────────────────
-- LeadFlow CRM — Supabase Schema
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query → Run
-- ─────────────────────────────────────────────────────────────────────────────


-- ─── LEADS TABLE ─────────────────────────────────────────────────────────────

create table if not exists public.leads (
  id              uuid primary key default gen_random_uuid(),
  created_by      uuid references auth.users(id) on delete set null,
  name            text not null,
  email           text,
  phone           text,
  company         text,
  status          text not null default 'New'
                    check (status in ('New', 'Contacted', 'Interested', 'Closed', 'Not Interested')),
  score           integer not null default 50
                    check (score >= 1 and score <= 100),
  notes           text,
  follow_up_date  date,
  source          text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);


-- ─── UPDATED_AT TRIGGER ──────────────────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.leads;
create trigger set_updated_at
  before update on public.leads
  for each row execute function public.handle_updated_at();


-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────
-- All authenticated users can view and manage all leads (team access).
-- To restrict to personal leads only, replace the policies with:
--   using (auth.uid() = created_by)

alter table public.leads enable row level security;

-- Drop old policies if re-running
drop policy if exists "Authenticated users can select leads" on public.leads;
drop policy if exists "Authenticated users can insert leads" on public.leads;
drop policy if exists "Authenticated users can update leads" on public.leads;
drop policy if exists "Authenticated users can delete leads" on public.leads;

create policy "Authenticated users can select leads"
  on public.leads for select
  to authenticated
  using (true);

create policy "Authenticated users can insert leads"
  on public.leads for insert
  to authenticated
  with check (true);

create policy "Authenticated users can update leads"
  on public.leads for update
  to authenticated
  using (true);

create policy "Authenticated users can delete leads"
  on public.leads for delete
  to authenticated
  using (true);


-- ─── OPTIONAL: SAMPLE DATA ───────────────────────────────────────────────────
-- Uncomment the block below to seed 5 example leads for testing.

/*
insert into public.leads (name, email, company, status, score, notes, source, follow_up_date)
values
  ('Sarah Chen',   'sarah@nexusdyn.com',   'Nexus Dynamics',  'Interested',     85, 'Strong budget signal. Wants Q3 pilot.',     'LinkedIn',  current_date + 3),
  ('Marcus Howell','marcus@arkencap.com',  'Arken Capital',   'Contacted',      72, 'Awaiting board approval.',                  'Referral',  current_date + 7),
  ('Priya Nair',   'priya@voltasys.io',    'Volta Systems',   'New',            55, 'Inbound from website.',                    'Website',   null),
  ('Tom Reeves',   'tom@brightfield.com',  'Brightfield',     'Interested',     90, 'Contract review in progress.',              'Conference',current_date + 1),
  ('Elena Vasquez','elena@meridian.co',    'Meridian Labs',   'Not Interested', 20, 'Not a fit right now. Re-engage in Q4.',    'Cold Outreach', null);
*/
