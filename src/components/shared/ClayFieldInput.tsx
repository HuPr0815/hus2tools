import { forwardRef, type InputHTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ClayFieldInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  prefix?: ReactNode;
  suffix?: ReactNode;
  size?: 'sm' | 'md';
}

const ClayFieldInput = forwardRef<HTMLInputElement, ClayFieldInputProps>(
  ({ label, error, prefix, suffix, className, size = 'md', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">
            {label}
          </label>
        )}
        <div
          className={cn(
            'w-full flex items-center gap-2 rounded-2xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all',
            'focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-clay',
            size === 'sm' && 'px-3 py-1.5',
            size === 'md' && 'px-4 py-3',
            error && 'ring-2 ring-error/30'
          )}
        >
          {prefix && (
            <span className="text-on-surface-variant text-sm shrink-0">{prefix}</span>
          )}
          <input
            ref={ref}
            className={cn(
              'w-full bg-transparent border-none outline-none text-on-surface placeholder:text-outline',
              size === 'sm' && 'text-xs',
              size === 'md' && 'text-sm',
              props.type === 'number' && 'font-mono',
              className
            )}
            {...props}
          />
          {suffix && (
            <span className="text-on-surface-variant text-xs shrink-0">{suffix}</span>
          )}
        </div>
        {error && <p className="text-[11px] text-error ml-3">{error}</p>}
      </div>
    );
  }
);

ClayFieldInput.displayName = 'ClayFieldInput';
export default ClayFieldInput;
