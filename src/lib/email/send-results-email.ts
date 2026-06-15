import 'server-only';

/**
 * Results-email orchestrator (Phase 2.01).
 *
 * Called from the lead-submit server action via `after()` once a lead has saved.
 * Given only the data the submit action already has (parent email, child first
 * name, stored band, locale, and the per-strength ratio summary), it:
 *   1. reproduces the on-screen ranked result from the ratio summary
 *      (`reconstructResult` — no new data, same deterministic ranking);
 *   2. assembles the §6 strengths body copy (`getResultCopy`, the single source);
 *   3. renders the certificate PNG server-side and base64-encodes it as an
 *      attachment (the child's name lives only in memory + the email — never stored,
 *      never in a URL);
 *   4. renders the React Email template to HTML + plain text;
 *   5. sends one transactional email via the thin Brevo client.
 *
 * The ENTIRE function is wrapped so it NEVER throws: a send failure is logged
 * (structured) and swallowed, so it can never fail the lead save or the parent's
 * redirect to `/result`. If `BREVO_API_KEY` is unset the send is a logged no-op,
 * so the funnel still runs locally before Cowork's Brevo account exists.
 *
 * Scope guard: this is a single explicit transactional send — NO CRM / contact
 * lists / Brevo automations (2.02 owns lead routing) and NO marketing/nurture
 * content beyond the standard trial invite (2.03 owns follow-ups).
 */
import type {Band, Locale} from '@/lib/validation/lead';
import {BAND_KEY_BY_LEAD} from '@/lib/leads/lead-mapping';
import {reconstructResult} from '@/lib/scoring';
import {getResultCopy, fillSlots} from '@/content/results';
import type {EmailChrome} from '@/emails/types';
import {renderResultsEmail} from '@/emails/render';
import {renderCertificatePng} from './certificate-image';
import {sendTransactionalEmail} from './brevo';
import enMessages from '@/messages/en.json';
import mkMessages from '@/messages/mk.json';

/** What the submit action hands the orchestrator (all already on the submission). */
export interface SendResultsEmailParams {
  readonly email: string;
  readonly childFirstName: string;
  /** Stored `leadSchema` band (`band-a`/`band-b`/`band-c`). */
  readonly band: Band;
  readonly locale: Locale;
  /** Per-strength ratio summary (`top_strengths.scores`) — number-only, no answers. */
  readonly scores: Record<string, number>;
}

/** Absolute site URL for the trial CTA, locale-prefixed (EN at `/en`). */
function siteUrlFor(locale: Locale): string {
  const base = (process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000').replace(
    /\/+$/,
    ''
  );
  return locale === 'en' ? `${base}/en` : base;
}

/** Resolve the `Email` chrome for a locale, `{name}` slots filled. */
function resolveChrome(locale: Locale, name: string): EmailChrome {
  const E = (locale === 'mk' ? mkMessages : enMessages).Email;
  const slots = {name};
  return {
    subject: fillSlots(E.subject, slots),
    preview: fillSlots(E.preview, slots),
    greeting: fillSlots(E.greeting, slots),
    intro: fillSlots(E.intro, slots),
    certificateAttached: fillSlots(E.certificateAttached, slots),
    trial: {
      heading: fillSlots(E.trial.heading, slots),
      body: fillSlots(E.trial.body, slots),
      cta: fillSlots(E.trial.cta, slots)
    },
    curiousMind: fillSlots(E.curiousMind, slots),
    footer: {
      identity: fillSlots(E.footer.identity, slots),
      contact: fillSlots(E.footer.contact, slots),
      signoff: fillSlots(E.footer.signoff, slots)
    }
  };
}

export async function sendResultsEmail(
  params: SendResultsEmailParams
): Promise<void> {
  const {email, childFirstName, band, locale, scores} = params;
  const bandKey = BAND_KEY_BY_LEAD[band];

  try {
    const apiKey = process.env.BREVO_API_KEY;
    if (!apiKey) {
      // Graceful degradation: app runs locally before the Brevo account exists.
      console.warn(
        JSON.stringify({
          event: 'results-email',
          status: 'skipped-no-key',
          band: bandKey,
          locale
        })
      );
      return;
    }

    const fromAddress = process.env.EMAIL_FROM_ADDRESS;
    if (!fromAddress) {
      console.warn(
        JSON.stringify({
          event: 'results-email',
          status: 'skipped-no-sender',
          band: bandKey,
          locale
        })
      );
      return;
    }
    const fromName = process.env.EMAIL_FROM_NAME || 'IqUp';
    const replyTo = process.env.EMAIL_REPLY_TO;

    // 1. Reproduce the exact on-screen ranking from the stored ratio summary.
    const result = reconstructResult(scores, bandKey, locale);
    // 2. Assemble the SAME §6 strengths copy the result screen shows.
    const copy = getResultCopy(result, childFirstName, locale);
    const chrome = resolveChrome(locale, childFirstName);

    // 3. Render + base64-encode the certificate (in memory; never stored / in a URL).
    const png = await renderCertificatePng({
      childFirstName,
      celebrated: [result.top1, result.top2],
      locale
    });
    const attachment = [
      {content: Buffer.from(png).toString('base64'), name: 'certificate.png'}
    ];

    // 4. Render the email to HTML + plain text.
    const {html, text} = await renderResultsEmail({
      childFirstName,
      bandKey,
      locale,
      copy,
      chrome,
      siteUrl: siteUrlFor(locale)
    });

    // 5. Send one transactional email. Tags help 2.02 segment later.
    await sendTransactionalEmail(
      {
        sender: {email: fromAddress, name: fromName},
        to: [{email}],
        subject: chrome.subject,
        htmlContent: html,
        textContent: text,
        attachment,
        replyTo: replyTo ? {email: replyTo} : undefined,
        tags: ['results-email', bandKey, locale]
      },
      apiKey
    );

    console.info(
      JSON.stringify({
        event: 'results-email',
        status: 'sent',
        band: bandKey,
        locale
      })
    );
  } catch (err) {
    // NEVER rethrow — lead capture + the /result redirect must be untouched.
    console.error(
      JSON.stringify({
        event: 'results-email',
        status: 'failed',
        band: bandKey,
        locale,
        err: err instanceof Error ? err.message : String(err)
      })
    );
  }
}
