import { cn } from '@/lib/utils';

interface ClayToggleProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
}

export default function ClayToggle({ label, description, checked, onChange, className }: ClayToggleProps) {
  return (
    <div className={cn('flex items-center justify-between p-4 bg-primary-container/10 rounded-2xl border border-primary/10', className)}>
      <div>
        <p className="font-label text-xs font-bold text-primary">{label}</p>
        {description && <p className="text-[10px] opacity-70">{description}</p>}
      </div>
      <button
        className={cn(
          'w-12 h-6 rounded-full p-1 flex items-center clay-spring shadow-clay-inset transition-colors duration-300',
          checked ? 'justify-end bg-primary' : 'justify-start bg-outline-variant'
        )}
        onClick={() => onChange(!checked)}
      >
        <div className="w-4 h-4 bg-white rounded-full shadow-sm" />
      </button>
    </div>
  );
}
