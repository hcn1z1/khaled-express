'use client';

import React from 'react';
import TrackingSection from '@/components/TrackingSection';

export default function SuiviClient({ code }: { code: string }) {
  return (
    <div className="py-12 sm:py-16 px-4 sm:px-6 lg:px-8">
      <TrackingSection initialCode={code} />
    </div>
  );
}
