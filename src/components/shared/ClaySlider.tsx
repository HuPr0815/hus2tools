import { cn } from '@/lib/utils';

interface ClaySliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  unit?: string;
  onChange: (value: number) => void;
  className?: string;
}

export default function ClaySlider({ label, value, min = 0, max = 100, unit = '%', onChange, className }: ClaySliderProps) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex justify-between items-center mb-4">
        <label className="font-label text-xs font-semibold text-on-surface-variant">{label}</label>
        <span className="px-3 py-1 bg-primary-container text-on-primary-container rounded-full font-bold text-[10px]">
          {value}{unit}
        </span>
      </div>
      <div className="h-6 flex items-center px-2 bg-surface-container-highest dark:bg-inverse-surface rounded-full shadow-clay-inset">
        <input
          className="w-full appearance-none bg-transparent cursor-pointer"
          type="range"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
        />
      </div>
    </div>
  );
}
