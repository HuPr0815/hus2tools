import type { ReactNode } from 'react';
import { Star, Bookmark } from 'lucide-react';

interface ComplexToolLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  stats?: { label: string; value: string }[];
  configSection: ReactNode;
  mainSection: ReactNode;
  actionSection?: ReactNode;
  previewSection?: ReactNode;
}

export default function ComplexToolLayout({ title, description, icon, stats, configSection, mainSection, actionSection, previewSection }: ComplexToolLayoutProps) {
  return (
    <div className="pt-16 md:pt-20 pb-12 px-4 md:px-container-padding min-h-screen flex flex-col gap-6">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-clay-green-light dark:bg-clay-green-deep flex items-center justify-center shadow-clay text-clay-green-deep dark:text-clay-green-light shrink-0">
          {icon}
        </div>
        <div className="flex-1">
          <h2 className="font-headline text-2xl text-on-surface dark:text-white font-bold">{title}</h2>
          <p className="text-on-surface-variant dark:text-gray-400 text-sm">{description}</p>
        </div>
        {stats && (
          <div className="hidden md:flex items-center gap-4">
            {stats.map((stat, idx) => (
              <div key={idx} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface-container-low dark:bg-inverse-surface rounded-full shadow-clay-inset">
                {idx === 0 ? <Star className="w-3.5 h-3.5 text-clay-yellow-deep" /> : <Bookmark className="w-3.5 h-3.5 text-clay-blue-deep" />}
                <span className="text-xs font-bold text-on-surface dark:text-white">{stat.value}</span>
                <span className="text-[10px] text-on-surface-variant dark:text-gray-400">{stat.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1">
        <div className="w-full lg:w-80 shrink-0">
          <div className="sticky top-24 p-4 md:p-container-padding bg-surface dark:bg-surface-container rounded-3xl md:rounded-[2rem] shadow-clay border border-white/30 dark:border-white/5 flex flex-col gap-6">
            {configSection}
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-6 min-w-0">
          <div className="flex-1 min-h-[300px] md:min-h-[500px] bg-surface-container-lowest dark:bg-black/10 rounded-3xl md:rounded-[2.5rem] shadow-clay overflow-hidden">
            {mainSection}
          </div>

          {actionSection && (
            <div className="h-auto md:h-20 bg-surface-container dark:bg-inverse-surface rounded-3xl shadow-clay flex items-center justify-between px-4 md:px-8 py-4 md:py-0">
              {actionSection}
            </div>
          )}
        </div>
      </div>

      {previewSection && (
        <div className="mt-6">
          {previewSection}
        </div>
      )}
    </div>
  );
}
