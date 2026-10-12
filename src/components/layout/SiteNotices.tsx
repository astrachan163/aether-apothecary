import { MEDICAL_ADVICE_NOTICE, TEST_MODE_NOTICE } from '../../../shared/notices';

export function SiteNotices() {
  return (
    <div className="bg-foreground text-background">
      <p className="px-4 py-2 text-center text-sm font-semibold">{TEST_MODE_NOTICE}</p>
      <p className="px-4 pb-2 text-center text-sm">{MEDICAL_ADVICE_NOTICE}</p>
      <p className="px-4 pb-2 text-center text-sm">A project by Andrew Strachan</p>
    </div>
  );
}
