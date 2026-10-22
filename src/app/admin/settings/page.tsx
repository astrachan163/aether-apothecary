'use client';

import Link from 'next/link';
import { ByokSettingsPanel } from '../../../../vendor/byok-gemini/react/ByokSettingsPanel';
import { AI_WARNING, DEMO_AI_LIMIT } from '../../../../shared/notices';

export default function AdminSettingsPage() {
  return (
    <article className="mx-auto max-w-3xl space-y-4">
      <h1 className="text-3xl font-bold">Settings</h1>
      <p>{AI_WARNING}</p>
      <p>{DEMO_AI_LIMIT}</p>
      <p>You must be 18 or older to draft copy.</p>
      <ByokSettingsPanel />
      <p><Link className="inline-flex min-h-11 items-center underline" href="/admin/dashboard">Back to the dashboard</Link></p>
    </article>
  );
}
