import type { ReactNode } from 'react';

interface ToolPageLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
}

export default function ToolPageLayout({ title, description, children }: ToolPageLayoutProps) {
  return (
    <div className="w-full max-w-2xl mx-auto flex flex-col gap-10 p-6">
      <div className="bg-surface p-12 rounded-[2.5rem] shadow-clay flex flex-col items-center text-center gap-8 relative overflow-hidden">
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-clay-purple-light/20 rounded-full blur-2xl" />
        <header className="flex flex-col gap-2 relative z-10">
          <h3 className="text-xl font-bold text-clay-green-deep">{title}</h3>
          <p className="text-on-surface-variant opacity-70">{description}</p>
        </header>
        <div className="w-full flex flex-col gap-6 relative z-10 text-left">
          {children}
        </div>
      </div>
    </div>
  );
}
