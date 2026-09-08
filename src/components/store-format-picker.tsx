import { cn } from '@/lib/utils';
import {
  formatStoreFormatInvestment,
  formatStoreFormatSpace,
  type StoreFormat,
} from '@/lib/store-formats';
import { formatINR } from '@/lib/format-currency';

interface StoreFormatPickerProps {
  formats: StoreFormat[];
  value: string | null;
  onChange: (formatId: string) => void;
  className?: string;
  label?: string;
  required?: boolean;
}

export function StoreFormatPicker({
  formats,
  value,
  onChange,
  className,
  label = 'Select outlet format',
  required,
}: StoreFormatPickerProps) {
  if (!formats.length) return null;

  return (
    <div className={cn('space-y-2', className)}>
      <p className="text-sm font-medium">
        {label}
        {required ? ' *' : ''}
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {formats.map((format) => {
          const selected = value === format.id;
          return (
            <button
              key={format.id}
              type="button"
              onClick={() => onChange(format.id)}
              className={cn(
                'text-left rounded-md border p-3 transition-colors cursor-pointer',
                selected
                  ? 'border-growth-green bg-growth-green/10 ring-1 ring-growth-green/40'
                  : 'border-border hover:border-foreground/30 hover:bg-secondary/40'
              )}
            >
              <div className="flex items-baseline justify-between gap-2 mb-1">
                <span className="font-semibold text-sm">{format.name}</span>
                {selected && (
                  <span className="text-[10px] uppercase tracking-wide text-growth-green font-medium">
                    Selected
                  </span>
                )}
              </div>
              <div className="font-mono text-base font-semibold tabular-nums">
                {formatStoreFormatInvestment(format)}
              </div>
              <div className="text-[12px] text-muted-foreground mt-1">
                {formatStoreFormatSpace(format)}
              </div>
              {format.franchiseFee != null && (
                <div className="text-[12px] text-muted-foreground mt-0.5">
                  Format fee: {formatINR(format.franchiseFee)}
                </div>
              )}
              {format.description && (
                <p className="text-[12px] text-muted-foreground mt-1.5 line-clamp-2">
                  {format.description}
                </p>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
