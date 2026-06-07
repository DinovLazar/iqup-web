import {createNavigation} from 'next-intl/navigation';
import {routing} from './routing';

// Locale-aware navigation APIs. Use these (not next/link or next/navigation)
// for any internal navigation so the active locale and `as-needed` prefixing
// are handled automatically.
export const {Link, redirect, usePathname, useRouter, getPathname} =
  createNavigation(routing);
