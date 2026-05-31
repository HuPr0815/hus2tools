import type { ReactNode } from 'react';

interface BentoPreviewProps {
  previewCard?: ReactNode;
  historyCard?: ReactNode;
  premiumCard?: ReactNode;
}

export default function BentoPreview({ previewCard, historyCard, premiumCard }: BentoPreviewProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-gutter mt-4">
      {previewCard && (
        <div className="md:col-span-2 bg-surface dark:bg-surface-container rounded-3xl p-4 md:p-6 shadow-clay border border-white/40 overflow-hidden relative group">
          {previewCard}
        </div>
      )}
      {historyCard && (
        <div className="bg-surface dark:bg-surface-container rounded-3xl p-4 md:p-6 shadow-clay border border-white/40 flex flex-col items-center justify-center text-center">
          {historyCard}
        </div>
      )}
      {premiumCard && (
        <div className="bg-primary rounded-3xl p-4 md:p-6 shadow-clay-primary flex flex-col items-center justify-center text-center text-white">
          {premiumCard}
        </div>
      )}
    </div>
  );
}
