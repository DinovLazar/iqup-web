import {notFound} from 'next/navigation';

/**
 * Catch-all for any unmatched path under a locale. Without it, Next renders the
 * GLOBAL `app/not-found.tsx` (which owns its own `<html>`) for unknown routes,
 * causing a hydration mismatch against the `[locale]` layout. Routing unmatched
 * paths through `notFound()` here renders the localized `[locale]/not-found.tsx`
 * inside the locale layout instead — correct `<html lang>`, no mismatch.
 */
export default function CatchAllNotFound() {
  notFound();
}
