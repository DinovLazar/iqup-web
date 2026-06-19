/**
 * Meta (Facebook) Pixel loader (Phase 2.04).
 *
 * STRICT load model: injected ONLY when called with marketing granted AND
 * `META_PIXEL_ID` is set. Idempotent, SSR-safe, never throws.
 */

import {META_PIXEL_ID, devNotice} from '../env';
import {isBrowser, isPixelLoaded, markPixelLoaded} from '../runtime';

/**
 * Inject fbevents.js, grant consent, init and fire the initial PageView.
 * No-ops if already loaded, if no id, or on SSR.
 */
export function loadPixel(): void {
  if (!isBrowser()) return;
  if (isPixelLoaded()) return;
  if (!META_PIXEL_ID) {
    devNotice('Meta Pixel id (NEXT_PUBLIC_META_PIXEL_ID) not set — skipping Pixel load.');
    return;
  }

  try {
    // Standard fbq bootstrap (queues calls until fbevents.js loads).
    if (typeof window.fbq !== 'function') {
      const fbq: NonNullable<Window['fbq']> = (...args: unknown[]) => {
        const self = window.fbq!;
        if (self.callMethod) {
          self.callMethod(...args);
        } else {
          (self.queue ||= []).push(args);
        }
      };
      fbq.queue = [];
      fbq.loaded = true;
      fbq.version = '2.0';
      window.fbq = fbq;
      window._fbq ||= fbq;
    }

    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://connect.facebook.net/en_US/fbevents.js';
    document.head.appendChild(script);

    // We only reach here when marketing is granted, so grant the pixel.
    // FUTURE(CAPI 2.x): the after() hook in runAfterLead is the home for a server-side Meta Conversions API send
    window.fbq?.('consent', 'grant');
    window.fbq?.('init', META_PIXEL_ID);
    window.fbq?.('track', 'PageView');

    markPixelLoaded();
  } catch {
    /* never throw */
  }
}

/** Signal pixel consent revoked (withdrawal). No-op if fbq absent. */
export function revokePixel(): void {
  if (!isBrowser() || typeof window.fbq !== 'function') return;
  try {
    window.fbq('consent', 'revoke');
  } catch {
    /* never throw */
  }
}
