import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

interface ClayInputProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

const ClayInput = forwardRef<HTMLTextAreaElement, ClayInputProps>(
  ({ label, error, className, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label className="text-[11px] font-semibold tracking-wider text-primary dark:text-clay-green-main ml-3 uppercase">
            {label}
          </label>
        )}
        <div className={cn(
          'w-full p-3 md:p-4 rounded-2xl shadow-clay-inset bg-surface-container-low dark:bg-black/20 overflow-hidden transition-all',
          'focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-clay',
          error && 'ring-2 ring-error/30'
        )}>
          <textarea
            ref={ref}
            className={cn(
              'w-full h-full bg-transparent border-none outline-none resize-none text-sm text-on-surface placeholder:text-outline font-mono',
              className
            )}
            {...props}
          />
        </div>
        {error && <p className="text-[11px] text-error ml-3">{error}</p>}
      </div>
    );
  }
);

ClayInput.displayName = 'ClayInput';
export default ClayInput;
