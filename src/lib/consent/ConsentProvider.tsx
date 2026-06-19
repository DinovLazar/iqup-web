'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode
} from 'react';
import {CONSENT_COOKIE_NAME} from './constants';
import {parseConsent, writeConsentCookie} from './cookie';
import {
  DENIED_CONSENT,
  acceptAllState,
  consentStateFromStored,
  rejectAllState,
  toConsentState
} from './state';
import type {ConsentState, StoredConsent} from './types';

export type ConsentContextValue = {
  /** True once mounted + the cookie has been read. Gate banner render on this
   *  (client-only) to avoid a hydration mismatch + CLS — like LanguageToggle. */
  ready: boolean;
  /** A valid stored choice exists for the current COOKIE_CONSENT_VERSION. */
  decided: boolean;
  /** Current per-category grants. Deny-by-default until the parent chooses. */
  consent: ConsentState;
  /** Whether the "Manage preferences" dialog is open. */
  manageOpen: boolean;
  /** Grant analytics + marketing. */
  acceptAll: () => void;
  /** Deny analytics + marketing (reject all non-essential). */
  rejectAll: () => void;
  /** Persist an explicit per-category selection (from the Manage panel). */
  savePreferences: (next: ConsentState) => void;
  openManage: () => void;
  closeManage: () => void;
};

const ConsentContext = createContext<ConsentContextValue | null>(null);

/* ------------------------------------------------------------------ *
 * Cookie-backed external store.
 *
 * The `iqup_consent` cookie is the single source of truth — reads go through
 * `useSyncExternalStore` (the repo idiom, avoiding a setState-in-effect), and
 * every write re-reads + notifies subscribers. A stable `NOT_READY` server
 * snapshot makes the first client render match the server (banner hidden), then
 * resolves to the real cookie post-hydration — no mismatch, no CLS.
 * ------------------------------------------------------------------ */
const NOT_READY = Symbol('consent-not-ready');
type Snapshot = StoredConsent | null | typeof NOT_READY;

const listeners = new Set<() => void>();
let cachedRaw: string | null | undefined;
let cachedValue: StoredConsent | null = null;

function readRawCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const prefix = `${CONSENT_COOKIE_NAME}=`;
  const match = document.cookie.split('; ').find((c) => c.startsWith(prefix));
  return match ? match.slice(prefix.length) : null;
}

/** Cached so identical reads return a referentially stable value (required by
 *  useSyncExternalStore — otherwise it loops). */
function getClientSnapshot(): StoredConsent | null {
  const raw = readRawCookie();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedValue = parseConsent(raw ? decodeURIComponent(raw) : null);
  }
  return cachedValue;
}

function getServerSnapshot(): Snapshot {
  return NOT_READY;
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function notify(): void {
  for (const cb of listeners) cb();
}

function persist(state: ConsentState): void {
  writeConsentCookie(toConsentState(state));
  cachedRaw = undefined; // force a re-read on the next snapshot
  notify();
}

/**
 * Deny-by-default cookie-consent state machine (Phase 2.04 §2.1/§2.3).
 *
 * A valid stored choice → `decided`, banner hidden, `consent` reflects the
 * stored grants; no/expired/version-mismatched cookie → undecided, banner
 * shown, everything denied. Tracker loading is intentionally elsewhere
 * (`ConsentRoot` watches `consent`), so the provider stays analytics-free and
 * the "load nothing before consent" guarantee lives in one obvious place.
 */
export function ConsentProvider({children}: {children: ReactNode}) {
  const snapshot = useSyncExternalStore<Snapshot>(
    subscribe,
    getClientSnapshot,
    getServerSnapshot
  );
  const [manageOpen, setManageOpen] = useState(false);

  const ready = snapshot !== NOT_READY;
  const stored = ready ? (snapshot as StoredConsent | null) : null;
  const decided = stored !== null;
  const consent = useMemo<ConsentState>(
    () => (stored ? consentStateFromStored(stored) : DENIED_CONSENT),
    [stored]
  );

  const commit = useCallback((next: ConsentState) => {
    persist(next);
    setManageOpen(false);
  }, []);

  const acceptAll = useCallback(() => commit(acceptAllState()), [commit]);
  const rejectAll = useCallback(() => commit(rejectAllState()), [commit]);
  const savePreferences = useCallback(
    (next: ConsentState) => commit(next),
    [commit]
  );
  const openManage = useCallback(() => setManageOpen(true), []);
  const closeManage = useCallback(() => setManageOpen(false), []);

  const value = useMemo<ConsentContextValue>(
    () => ({
      ready,
      decided,
      consent,
      manageOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openManage,
      closeManage
    }),
    [
      ready,
      decided,
      consent,
      manageOpen,
      acceptAll,
      rejectAll,
      savePreferences,
      openManage,
      closeManage
    ]
  );

  return (
    <ConsentContext.Provider value={value}>{children}</ConsentContext.Provider>
  );
}

/** Consume the consent context. Throws if used outside the provider. */
export function useConsent(): ConsentContextValue {
  const ctx = useContext(ConsentContext);
  if (!ctx) {
    throw new Error('useConsent must be used within a ConsentProvider');
  }
  return ctx;
}
