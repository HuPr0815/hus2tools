import { cn } from '@/lib/utils';

interface ClaySegmentedControlProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

export default function ClaySegmentedControl<T extends string>({ options, value, onChange, className }: ClaySegmentedControlProps<T>) {
  return (
    <div className={cn('flex p-1 bg-surface-container dark:bg-inverse-surface rounded-2xl shadow-clay-inset gap-1', className)}>
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={cn(
            'flex-1 py-2 rounded-xl text-xs font-bold spring-transition',
            value === opt.value
              ? 'bg-surface-container-lowest dark:bg-surface text-primary shadow-clay'
              : 'text-on-surface-variant hover:text-on-surface'
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
