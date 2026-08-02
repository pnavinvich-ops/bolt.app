interface SegmentedControlProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  size?: 'sm' | 'md';
}

export default function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  size = 'md',
}: SegmentedControlProps<T>) {
  return (
    <div className="flex gap-1 rounded-md border border-border bg-surfaceAlt p-1">
      {options.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`seg ${active ? 'seg-active' : 'seg-idle'} ${
              size === 'sm' ? 'px-2 py-1.5 text-caption' : ''
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
