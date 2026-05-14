import type { Metadata } from 'next';

import DailySermon from '@/components/DailySermon';
import { createPageMetadata } from '@/lib/seo';

export const metadata: Metadata = createPageMetadata({
  title: 'Tagespredigt nach dem Kirchenjahr',
  description:
    'Lies jeden Tag eine neue, KI-gestützte Predigt mit liturgischem Bezug, praktischem Impuls und kurzem Gebet.',
  path: '/predigt',
  keywords: ['Predigt', 'Tagespredigt', 'Kirchenjahr', 'Liturgie', 'Gebet'],
});

export default function PredigtPage() {
  return <DailySermon />;
}
