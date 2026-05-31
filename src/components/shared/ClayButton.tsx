import { type ButtonHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ClayButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: ReactNode;
  children: ReactNode;
}

export default function ClayButton({ variant = 'primary', size = 'md', icon, children, className, ...props }: ClayButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 font-semibold rounded-2xl spring-transition active:scale-95 ripple-effect disabled:opacity-40 disabled:pointer-events-none',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-8 py-4 text-base w-full',
        variant === 'primary' && 'bg-clay-green-deep text-white shadow-clay hover:shadow-clay-hover',
        variant === 'secondary' && 'bg-surface text-on-surface-variant shadow-clay-inset border border-outline-variant/30 hover:bg-surface-container-low',
        variant === 'ghost' && 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface',
        variant === 'danger' && 'bg-error text-white shadow-clay hover:shadow-clay-hover',
        className
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}
