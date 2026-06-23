-- Phase 3.06 — `assessment_scores` table: Store A of the two-store v2 data model.
--
-- The anonymous-scores store (plan.md §12 / spec Дел 14). It holds NO PII and only
-- a DAY-LEVEL date. It is one of two deliberately UNLINKABLE stores:
--   * Store A (this table) — anonymous scores, in Supabase (EU).
--   * Store B            — the parent lead, in Brevo (EU).
-- The two share NO key: this table's `id` is never sent to Brevo, Brevo's contact
-- id is never stored here, and this table carries only `created_date` (a DATE, not
-- a timestamp) so the two stores cannot be correlated by exact submission time.
--
-- Security model (mirrors the v1 `leads` table exactly — children's data, GDPR):
--   * Row Level Security ENABLED with NO policies for anon/authenticated, so the
--     public anon key (which ships in client code) can neither read nor write.
--   * All inserts happen SERVER-SIDE via the service_role key (bypasses RLS),
--     through the validated insertAnonymousScore() helper.
--   * Data minimisation: only demographics + the derived 0–100 signals/indices +
--     a coarse day-level date. Never a name, email, phone, or exact timestamp.

create table public.assessment_scores (
  id              uuid              primary key default gen_random_uuid(),

  -- Demographics (no PII): coarse buckets only.
  age             smallint          not null    check (age between 5 and 13),
  gender          text                          check (gender is null or gender in ('female', 'male', 'unspecified')),
  city            text              not null,
  language        text              not null    check (language in ('mk', 'en')),

  -- The 8 internal signals (0–100; the scorer clamps signals to 8–99).
  signal_gf         double precision  not null  check (signal_gf        between 0 and 100),
  signal_gv         double precision  not null  check (signal_gv        between 0 and 100),
  signal_gsm        double precision  not null  check (signal_gsm       between 0 and 100),
  signal_gs         double precision  not null  check (signal_gs        between 0 and 100),
  signal_attention  double precision  not null  check (signal_attention between 0 and 100),
  signal_ef         double precision  not null  check (signal_ef        between 0 and 100),
  signal_glr        double precision  not null  check (signal_glr       between 0 and 100),
  signal_ct         double precision  not null  check (signal_ct        between 0 and 100),

  -- The 5 parent-facing indices (0–100).
  index_logical        double precision not null check (index_logical        between 0 and 100),
  index_spatial        double precision not null check (index_spatial        between 0 and 100),
  index_memory_focus   double precision not null check (index_memory_focus   between 0 and 100),
  index_planning_speed double precision not null check (index_planning_speed between 0 and 100),
  index_learning_stem  double precision not null check (index_learning_stem  between 0 and 100),

  -- So aggregate stats / future norm calibration can exclude non-representative runs.
  validity        text              not null    check (validity in ('valid', 'not_representative')),
  -- The PROVISIONAL norms version that produced these numbers (re-calibration trail).
  norms_version   text              not null,

  -- DAY-LEVEL only — a deliberate unlinkability measure (no exact submission time).
  created_date    date              not null    default current_date
);

comment on table public.assessment_scores is
  'Store A of the v2 two-store model: anonymous cognitive-assessment scores. No PII; day-level date only; intentionally unlinkable to the Brevo lead store (no shared key). RLS enabled with no anon/authenticated policies; all writes happen server-side via the service_role key.';

-- Aggregation index for stats by day.
create index assessment_scores_created_date_idx on public.assessment_scores (created_date desc);

-- Lock the table down. With RLS enabled and ZERO policies, the anon and
-- authenticated roles get no rows on read and are rejected on write.
alter table public.assessment_scores enable row level security;

-- Defense-in-depth: revoke the public roles' table privileges entirely, so even
-- if a policy is ever added by mistake the anon key still has no access. The
-- service_role used server-side bypasses RLS and keeps its grant.
revoke all on table public.assessment_scores from anon, authenticated;

-- NOTE: no `create policy` statements are intentional. Inserts use the
-- service_role key (server-only) via src/lib/scores/insert-anonymous-score.ts.
