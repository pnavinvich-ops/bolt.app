import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: React.ReactNode;
}

export default function EmptyState({ icon: Icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center animate-fade-in">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-surfaceAlt">
        <Icon size={28} className="text-text-faint" />
      </div>
      <h3 className="mb-1 text-h3">{title}</h3>
      <p className="mb-6 max-w-xs text-body text-text-dim">{message}</p>
      {action}
    </div>
  );
}
