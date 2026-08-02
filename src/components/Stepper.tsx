interface StepperProps {
  current: number;
  total: number;
}

export default function Stepper({ current, total }: StepperProps) {
  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: total }).map((_, i) => (
        <div
          key={i}
          className={`h-1.5 rounded-full transition-all duration-300 ${
            i === current
              ? 'w-6 bg-accent'
              : i < current
                ? 'w-1.5 bg-accent-hi'
                : 'w-1.5 bg-border'
          }`}
        />
      ))}
    </div>
  );
}
