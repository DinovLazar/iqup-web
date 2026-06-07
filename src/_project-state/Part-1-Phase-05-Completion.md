# Completion Report — Part 1 · Phase 1.05 · Leads table, secure save-path, Supabase wiring

- **Phase ID + name:** 1.05 (Code) — Leads table, secure save-path, and Supabase wiring
- **Executing Claude:** Code
- **Date completed:** 2026-06-07

---

## What shipped

The full, security-sensitive plumbing for storing parent leads — built, reviewed,
and verified end-to-end against the live Supabase project. Phase 1.08 can now save a
lead by simply calling `insertLead()`.

- **`leads` table is live** in the Supabase project (`cpxssfodboukznzaksnb`,
  `eu-central-1`/Frankfurt), matching the spec exactly: all 12 columns with their
  types/defaults, the `child_age 3–13` / `band` / `locale` / `consent = true` CHECK
  constraints, and a `created_at DESC` index. Stored as a version-controlled
  migration at `supabase/migrations/20260607204206_create_leads.sql`.
- **Security model enforced and live-verified:** Row Level Security is enabled with
  **no policies** for `anon`/`authenticated`, plus a defense-in-depth
  `revoke all … from anon, authenticated`. The public anon key can neither read nor
  write `leads` (it gets a hard `permission denied`). All writes go through the
  **service-role** key server-side. Data minimization: only the strengths *summary*
  (`top_strengths`) is stored — never a child's individual answers.
- **Supabase client modules:** `src/lib/supabase/server.ts` (service-role, guarded by
  `import 'server-only'`, lazy env read), `client.ts` (anon, for future non-leads
  use), and `types.ts` (typed `Database`).
- **Validation + insert helper:** `src/lib/validation/lead.ts` (`leadSchema` + `Lead`/
  `LeadInput`, zod 4) and `src/lib/leads/insert-lead.ts` (`insertLead(input: unknown)`
  validates every field, then inserts via the service-role client).
- **End-to-end test:** `scripts/test-insert.ts` (+ `npm run test:insert`). **Run live
  and passed** (see Tests below).
- **Env + config:** `.env.local.example` (committed, placeholders only), `.env.local`
  (git-ignored, filled), a `.gitignore` exception so the example commits while
  secrets stay ignored, pinned deps, and `db:push` / `db:types` / `test:insert` npm
  scripts.

## Decisions made on the fly (with "why")

> Also appended to `Decisions.md`.

1. **Plain `@supabase/supabase-js`, not `@supabase/ssr`.** *Why: there is no Supabase
   Auth / user sessions here — a stateless service-role client and a plain anon
   client are correct and simpler. (Confirmed against current Supabase docs.)*
2. **Defense-in-depth `revoke all on leads from anon, authenticated`** on top of
   RLS-with-no-policies. *Why: belt-and-suspenders — even if a policy were ever added
   by mistake, the public roles have no table grant. Live effect: anon gets a hard
   `permission denied` instead of an empty result set — a stronger, unambiguous
   lockout.*
3. **`server-only` build-time tripwire** in `server.ts` and `insert-lead.ts`; the
   service-role key is read only from `SUPABASE_SERVICE_ROLE_KEY` (never a
   `NEXT_PUBLIC_` var). *Why: two independent guarantees that the secret can't reach
   the client bundle.*
4. **zod 4 API + deliberate strip/strict split.** `leadSchema` is a plain `z.object`
   (verified to STRIP unknown keys in zod 4) — forgiving for the form while
   guaranteeing only known fields are stored. `topStrengthsSchema` is `.strict()`.
   *Why: `top_strengths` is produced by our own scoring code (1.07), so strict-reject
   enforces "summary only" loudly; combined with a number-only `scores` map, raw
   answers cannot be smuggled in. The form stays forgiving so a future anti-spam
   honeypot field wouldn't drop a real lead.*
5. **`top_strengths` shape locked as the 1.07 contract:** `{ top1, top2, top3, scores }`
   with `scores` a `string → number` map. *Why: this phase defines the contract 1.07
   fills and 1.08 passes; number-only scores also block raw-answer storage.*
6. **Migration applied via the Supabase dashboard SQL editor (browser-driven), not
   `supabase db push`.** *Why: the build sandbox cannot reach the Postgres port
   (5432/6543); the dashboard SQL editor was the planned fallback. Same SQL, same
   result — verified live. The migration file remains the version-controlled source
   of truth.*
7. **`types.ts` hand-authored and verified against the live schema** rather than
   produced by `supabase gen types`. *Why: `gen types` also needs DB-port access,
   which the sandbox lacks. The types were checked column-by-column and proven by the
   passing live round-trip test; regenerate with `npm run db:types` once the project
   is linked from an environment with DB access.*
8. **Test runner uses `tsx --conditions=react-server`.** *Why: empirically, importing
   `server-only` throws outside a React-Server context; that flag is required to run
   the insert path from a plain Node/tsx script.*

Phase-mandated decisions also logged in `Decisions.md`: (a) the project starts on
Lazar's personal Supabase account — **transfer ownership to IqUp before launch**;
(b) region `eu-central-1` (Frankfurt); (c) summary-only storage (no raw answers);
(d) server-side-only inserts with RLS locking the anon key out; (e) a separate,
optional `marketing_opt_in` field — final consent/marketing wording is IqUp's legal
sign-off.

## Surprises / off-spec changes

- **Live DB work happened in a separate (browser/Cowork) session** that committed the
  migration + `supabase/config.toml` + `types.ts` first (commit `36e80c1`, authored
  as "Goran", **not pushed**). That commit was *partial* — it did not include the app
  code (clients, validation, insert helper, test), the env/gitignore/package changes,
  or any project-state docs. **This commit completes the phase.** (See Git below.)
- **The reported "live test" did not exercise `insertLead()`** — it checked schema +
  RLS via raw API/SQL in the browser. I therefore re-ran the real
  `npm run test:insert` myself against the live DB to verify the full validated path;
  it passed (below).
- **anon lockout is a hard `permission denied`**, not the empty result set the brief
  anticipated — because of the `revoke`. The test treats either outcome as "blocked".
- The new Supabase **publishable/secret API-key system** exists; we used the **legacy
  anon/service_role keys** per the Cowork hand-off. Migrating keys is noted for later.

## Files written / updated

- **Created:** `supabase/migrations/20260607204206_create_leads.sql`,
  `supabase/config.toml`, `supabase/.gitignore`, `src/lib/supabase/server.ts`,
  `src/lib/supabase/client.ts`, `src/lib/supabase/types.ts`,
  `src/lib/validation/lead.ts`, `src/lib/leads/insert-lead.ts`,
  `scripts/test-insert.ts`, `.env.local.example`, this report.
- **Modified:** `.gitignore` (commit-the-example exception), `package.json`
  (deps + `db:push`/`db:types`/`test:insert` scripts), `package-lock.json`,
  `src/_project-state/current-state.md`, `file-map.md`, `00_stack-and-config.md`,
  `Decisions.md`. **Removed:** `src/lib/supabase/.gitkeep`.
- **Not committed (created locally, gitignored):** `.env.local` (real keys).

## Tests run + results

- `npm run typecheck` — **clean**; `npm run lint` — **clean**; `npm run build` —
  **passes** (both locales prerendered; new server modules correctly stay out of the
  client bundle).
- Offline schema sanity (no DB): unknown keys stripped from `leadSchema`; name
  trimmed; `marketing_opt_in` defaults false; age < 3, bad band, and `consent: false`
  rejected; `topStrengthsSchema.strict()` rejects an injected `raw_answers` field.
- **LIVE `npm run test:insert` — all checks passed:**
  - zod rejects invalid input ✅
  - `insertLead()` inserted a row (real id returned) ✅
  - service-role read it back; name trimmed; `marketing_opt_in` = false ✅
  - **anon key CANNOT read leads** — `permission denied for table leads` ✅
  - **anon key CANNOT insert** — `permission denied for table leads` ✅
  - cleanup deleted the row; **table empty (count 0)** ✅
- Adversarial 4-lens security review (RLS lockout · service-role leak · zod-vs-DB +
  data minimization · runtime/test validity): RLS and key-leak lenses fully clean;
  the zod lens's "missing `.strict()`" P1 was based on a **false premise** (it claimed
  zod 4 `z.object` passes through unknown keys — empirically it STRIPS), so the
  storage risk did not exist; I still added `.strict()` to `topStrengthsSchema` as a
  genuine contract-enforcement hardening and hardened the test's cleanup (try/finally).

## Blocked / carryover items

- **Spam / rate-limit hardening on the public insert path is deferred to launch**
  (note for Phase 2.04 / 2.07). `leadSchema` is intentionally forgiving toward an
  eventual honeypot field.
- **Final consent/marketing wording pending IqUp legal review.** `consent_version`
  records which wording a parent saw.
- **`types.ts` is verified-hand-authored, not `gen types` output.** Regenerate with
  `npm run db:types` once `supabase login && supabase link` is done from an
  environment that can reach the DB.
- **`db:push` / `db:types` npm scripts assume a one-time `supabase login` + `link`.**
  This session used the dashboard SQL editor instead (sandbox has no DB-port access).
- **Transfer the Supabase project to an IqUp-controlled account before launch**
  (it currently lives on Lazar's personal account); migrate legacy → publishable/
  secret API keys at that point too.
- **`.mcp.json` (untracked) points at the wrong project** (`jkceucgiurcfgltfhvin`, not
  ours). Not used by this phase; recommend correcting or deleting it.

## What's next

- **Phase 1.07 (scoring)** produces the `top_strengths` summary that this schema
  expects.
- **Phase 1.08 (email gate)** builds the form + submit route that calls `insertLead()`
  — the hard security plumbing is already done and proven.
