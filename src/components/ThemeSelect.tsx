import { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';

export interface ThemeSelectOption<T extends string> {
  value: T;
  label: string;
}

interface ThemeSelectProps<T extends string> {
  value: T;
  options: ThemeSelectOption<T>[];
  onChange: (v: T) => void;
}

/**
 * Themed replacement for native <select>: renders a styled trigger and opens
 * a bottom-sheet option list that matches the app's dark theme.
 */
export default function ThemeSelect<T extends string>({ value, options, onChange }: ThemeSelectProps<T>) {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.value === value);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="input flex items-center justify-between gap-2 text-left"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{current?.label ?? value}</span>
        <ChevronDown size={16} className={`shrink-0 text-text-faint transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 animate-fade-in sm:items-center"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-sm overflow-hidden rounded-t-lg border border-border bg-surface animate-slide-up sm:rounded-lg"
            onClick={(e) => e.stopPropagation()}
            role="listbox"
          >
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {options.map((o) => {
                const active = o.value === value;
                return (
                  <button
                    key={o.value}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => {
                      onChange(o.value);
                      setOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-3 py-3 text-left transition-colors ${
                      active ? 'bg-accent-lo text-accent-hi' : 'text-text-dim hover:bg-surfaceAlt hover:text-text'
                    }`}
                  >
                    <span className="text-body font-semibold">{o.label}</span>
                    {active && <Check size={16} className="shrink-0 text-accent" />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
