-- Phase 1.05 — `leads` table for parent lead capture (IqUp brain-games funnel).
--
-- Security model (children's PII — see plan.md §14 and the phase brief):
--   * Row Level Security is ENABLED with NO policies for the anon/authenticated
--     roles, so the public anon key (which ships in client code) can neither read
--     nor write this table.
--   * All inserts happen SERVER-SIDE using the service_role key, which bypasses
--     RLS, through the validated insertLead() helper.
--   * Data minimization: we store only the strengths SUMMARY (top_strengths),
--     never a child's individual answers.

create table public.leads (
  id                uuid         primary key default gen_random_uuid(),
  created_at        timestamptz  not null    default now(),
  email             text         not null,
  child_first_name  text         not null,
  child_age         smallint     not null    check (child_age between 3 and 13),
  band              text         not null    check (band in ('band-a', 'band-b', 'band-c')),
  top_strengths     jsonb        not null,
  locale            text         not null    check (locale in ('mk', 'en')),
  consent           boolean      not null    check (consent = true),
  consent_at        timestamptz  not null    default now(),
  consent_version   text         not null,
  marketing_opt_in  boolean      not null    default false
);

comment on table public.leads is
  'Parent leads from the IqUp brain-games funnel. Summary only — never stores a child''s individual answers (GDPR data minimization). RLS enabled with no anon/authenticated policies; all writes happen server-side via the service_role key.';

-- Newest-first index for exports / sorting.
create index leads_created_at_idx on public.leads (created_at desc);

-- Lock the table down. With RLS enabled and ZERO policies, the anon and
-- authenticated roles get no rows on read and are rejected on write.
alter table public.leads enable row level security;

-- Defense-in-depth: revoke the public roles' table privileges entirely, so even
-- if a policy is ever added by mistake the anon key still has no access. The
-- service_role used server-side bypasses RLS and keeps its grant.
revoke all on table public.leads from anon, authenticated;

-- NOTE: no `create policy` statements are intentional. Inserts use the
-- service_role key (server-only) via src/lib/leads/insert-lead.ts.
