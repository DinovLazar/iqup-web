import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const nextConfig: NextConfig = {
  // Phase 3.10: the server-side PDF generator embeds Montserrat from
  // `src/lib/pdf/fonts/*.ttf` (read via `process.cwd()`). Trace those files into
  // the report route's bundle so a standalone production build ships them too.
  outputFileTracingIncludes: {
    '/[locale]/report': ['./src/lib/pdf/fonts/*.ttf']
  }
};

// Wires next-intl into the build and points it at the per-request config.
const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

export default withNextIntl(nextConfig);
