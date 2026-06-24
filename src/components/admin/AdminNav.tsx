'use client';

/**
 * Admin section navigation (Phase 3.13). A small client component only so the
 * active link gets `aria-current="page"` from the current pathname. Two sections:
 * Contacts (Store B) and Statistics (Store A) — the two isolated data paths.
 */
import Link from 'next/link';
import {usePathname} from 'next/navigation';

const NAV = [
  {href: '/admin/contacts', label: 'Contacts'},
  {href: '/admin/statistics', label: 'Statistics'}
] as const;

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="flex gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? 'page' : undefined}
            className={
              'rounded-lg px-3 py-1.5 text-sm font-semibold transition-colors ' +
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--iq-violet)] ' +
              (active
                ? 'bg-[var(--iq-violet)]/10 text-[var(--iq-violet)]'
                : 'text-ink-soft hover:text-ink hover:bg-canvas')
            }
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
