import type { ReactNode } from 'react';
import { Star, Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ToolHeaderProps {
  title: string;
  description: string;
  icon: ReactNode;
  iconBgColor?: string;
  stats?: { label: string; value: string; icon: 'star' | 'bookmark' }[];
  className?: string;
}

export default function ToolHeader({ title, description, icon, iconBgColor, stats, className }: ToolHeaderProps) {
  return (
    <section className={cn('grid grid-cols-1 md:grid-cols-12 gap-gutter items-center p-4 md:p-8 rounded-3xl bg-surface-container-low dark:bg-surface-container shadow-clay border border-white/50', className)}>
      <div className="md:col-span-8">
        <div className="flex items-center gap-4 md:gap-6">
          <div
            className="w-14 h-14 md:w-20 md:h-20 rounded-2xl md:rounded-3xl flex items-center justify-center shadow-clay text-clay-green-deep transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)] shrink-0"
            style={iconBgColor ? { backgroundColor: iconBgColor } : undefined}
          >
            {icon}
          </div>
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-bold text-clay-green-deep dark:text-clay-green-main leading-tight">{title}</h2>
            <p className="font-body text-sm md:text-base text-on-surface-variant max-w-xl mt-1 leading-relaxed">{description}</p>
          </div>
        </div>
      </div>
      {stats && stats.length > 0 && (
        <div className="md:col-span-4 hidden md:flex justify-end gap-3">
          {stats.map((stat, idx) => (
            <div key={idx} className="flex flex-col items-center p-4 bg-white/40 dark:bg-inverse-surface/40 rounded-2xl shadow-clay-inset w-24">
              <span className={cn('text-2xl font-bold leading-tight', idx === 0 ? 'text-primary font-headline' : 'text-secondary font-headline')}>
                {stat.value}
              </span>
              <div className="flex items-center gap-1 mt-1">
                {stat.icon === 'star' ? <Star className="w-3 h-3 text-clay-yellow-deep" /> : <Bookmark className="w-3 h-3 text-clay-blue-deep" />}
                <span className="text-[10px] font-bold uppercase opacity-50 tracking-wider">{stat.label}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
