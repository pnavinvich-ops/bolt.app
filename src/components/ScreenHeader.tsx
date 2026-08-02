import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ScreenHeaderProps {
  title: string;
  subtitle?: string;
  backTo?: string;
  right?: React.ReactNode;
}

export default function ScreenHeader({ title, subtitle, backTo, right }: ScreenHeaderProps) {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-bg/90 backdrop-blur-md safe-t">
      <div className="mx-auto flex max-w-md items-center gap-3 px-4 py-3">
        {backTo && (
          <Link
            to={backTo}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-text-dim transition-colors hover:bg-surfaceAlt hover:text-text"
            aria-label="Back"
          >
            <ArrowLeft size={20} />
          </Link>
        )}
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-h2 leading-tight">{title}</h1>
          {subtitle && <p className="truncate text-caption text-text-faint">{subtitle}</p>}
        </div>
        {right && <div className="shrink-0">{right}</div>}
      </div>
    </header>
  );
}
