'use client';

import { MEDICAL_ADVICE_NOTICE } from '../../../shared/notices';
import { useData } from '@/contexts/DataContext';

export function SiteNotices() {
  const { catalogStatus } = useData();
  return (
    <div className="bg-foreground text-background">
      <p className="px-4 py-2 text-center text-sm font-semibold">{MEDICAL_ADVICE_NOTICE}</p>
      <p className="px-4 pb-2 text-center text-sm">A project by Andrew Strachan</p>
      {catalogStatus !== 'ready' && <p role="status" className="px-4 pb-2 text-center text-sm">Sample catalog is read-only. {catalogStatus === 'loading' ? 'Connecting to the store.' : 'The store connection is unavailable.'}</p>}
    </div>
  );
}
