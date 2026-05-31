import { type ReactNode, useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BasicToolLayoutProps {
  title: string;
  description: string;
  icon: ReactNode;
  children: ReactNode;
  resultSection?: ReactNode;
  showResult?: boolean;
}

export default function BasicToolLayout({ title, description, icon, children, resultSection, showResult }: BasicToolLayoutProps) {
  const [resultExpanded, setResultExpanded] = useState(true);

  return (
    <div className="pt-20 pb-12 px-4 md:px-6 min-h-screen flex flex-col items-center justify-start">
      <div className="w-full md:max-w-2xl flex flex-col gap-6">
        <div className="bg-surface dark:bg-surface-container p-6 md:p-10 rounded-3xl md:rounded-[2.5rem] shadow-clay flex flex-col items-center text-center gap-6 relative overflow-hidden clay-noise">
          <div className="absolute -top-12 -right-12 w-40 h-40 bg-clay-purple-light/20 rounded-full blur-2xl" />
          <div className="absolute -bottom-8 -left-8 w-32 h-32 bg-clay-green-light/20 rounded-full blur-2xl" />

          <header className="flex flex-col items-center gap-3 relative z-10">
            <div className="w-14 h-14 rounded-2xl bg-clay-green-light dark:bg-clay-green-deep flex items-center justify-center shadow-clay text-clay-green-deep dark:text-clay-green-light animate-scale-bounce">
              {icon}
            </div>
            <div>
              <h3 className="font-headline text-xl md:text-2xl text-on-surface font-bold">{title}</h3>
              <p className="text-sm text-on-surface-variant mt-1 max-w-sm">{description}</p>
            </div>
          </header>

          <div className="w-full flex flex-col gap-5 relative z-10 text-left">
            {children}
          </div>
        </div>

        {resultSection !== undefined && (
          <div
            className={cn(
              'bg-surface dark:bg-surface-container rounded-3xl md:rounded-[2.5rem] shadow-clay border border-outline-variant/20 overflow-hidden transition-all duration-500 ease-out',
              showResult ? 'opacity-100 translate-y-0 max-h-[2000px]' : 'opacity-0 -translate-y-4 max-h-0 border-0'
            )}
          >
            <button
              onClick={() => setResultExpanded(!resultExpanded)}
              className="w-full flex items-center justify-between px-6 py-3 bg-surface-container-low border-b border-outline-variant/20 text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-clay-green-deep animate-pulse" />
                输出结果
              </span>
              {resultExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            <div className={cn(
              'p-6 transition-all duration-300',
              resultExpanded ? 'opacity-100 max-h-[2000px]' : 'opacity-0 max-h-0 p-0 overflow-hidden'
            )}>
              {resultSection}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
