# Part 1 · Phase 1.05 (Cowork) — Completion Report

**Date:** 2026-06-07
**Phase:** Create the Supabase project (manual dashboard work)
**Status:** ✅ Complete

## Project details

| Item | Value |
|---|---|
| Project name | `iqup-web` |
| Organization | IqUp Iq (Free Plan) |
| Region | `eu-central-1` — Central EU (Frankfurt), AWS |
| Project ref | `cpxssfodboukznzaksnb` |
| Project URL | `https://cpxssfodboukznzaksnb.supabase.co` |
| Compute | Nano (free plan default) |
| Status at hand-off | Healthy (provisioned) |

## Hand-off values — all retrieved and stored privately

All five values were copied by Lazar directly from the dashboard into his password
manager / private notes. **No secret values appear in this report or in any chat.**

- [x] Project URL
- [x] anon public key
- [x] service_role secret key (secret — password manager)
- [x] Database password (secret — password manager; generated via the dashboard's
  "Generate a password", strong, copied before project creation)
- [x] Project ref

## Data residency

Region confirmed as `eu-central-1` (Frankfurt) — EU-hosted, satisfies the GDPR
data-residency requirement for children's/parent data.

## ⚠️ Flagged reminder

> **Transfer project ownership to an IqUp-controlled account before launch.**
> The project starts on Lazar's personal account by decision; real parent data
> only arrives at launch.

## Deviations from the planned steps

1. **Organization already existed** — named **"IqUp Iq"** (not "IqUp"); reused as-is.
2. **A pre-existing project** ("DinovLazar's Project", region `eu-west-3` Paris)
   was already in the organization. Decision: leave it untouched and create
   `iqup-web` fresh in Frankfurt, per plan.
3. **Free-plan project limit reached** — creating `iqup-web` brought the account
   to its cap of 2 active free projects. The dashboard now blocks further free
   projects; if another project is ever needed, one must be paused/deleted or
   the plan upgraded. No action required for this phase.
4. **New API-key system** — Supabase now defaults to "Publishable and secret API
   keys". The plan's anon/service_role keys were retrieved from the
   **"Legacy anon, service_role API keys"** tab (Project Settings → API Keys).
   The dashboard recommends migrating to publishable/secret keys eventually —
   worth noting for a later phase.

## Definition of Done

- [x] Supabase project `iqup-web` exists in `eu-central-1` on Lazar's account
- [x] Database password saved in password manager
- [x] All five hand-off values stored privately (secrets never in chat)
- [x] Completion report written

**Next step (Claude Code phase):** paste the five values into the project's
settings file and build the leads table. File this report in the repo at
`src/_project-state/`.
