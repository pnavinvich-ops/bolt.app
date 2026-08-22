import { useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import type { ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}

const THRESHOLD = 64;
const MAX_PULL = 90;

/**
 * Lightweight touch pull-to-refresh for page-scrolling lists.
 * Subtle indicator: a muted icon that rotates with the drag, then spins
 * softly while refreshing. Native browser refresh is suppressed via CSS.
 */
export default function PullToRefresh({ onRefresh, children }: PullToRefreshProps) {
  const [pull, setPull] = useState(0);
  const [refreshing, setRefreshing] = useState(false);
  const startY = useRef<number | null>(null);

  const atTop = () => window.scrollY <= 0;

  const onTouchStart = (e: React.TouchEvent) => {
    if (refreshing || !atTop()) {
      startY.current = null;
      return;
    }
    startY.current = e.touches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (startY.current == null || refreshing || !atTop()) return;
    const dy = e.touches[0].clientY - startY.current;
    setPull(dy > 0 ? Math.min(Math.round(dy * 0.45), MAX_PULL) : 0);
  };

  const onTouchEnd = () => {
    startY.current = null;
    if (pull >= THRESHOLD && !refreshing) {
      setRefreshing(true);
      setPull(THRESHOLD);
      Promise.resolve(onRefresh()).finally(() => {
        setRefreshing(false);
        setPull(0);
      });
    } else {
      setPull(0);
    }
  };

  const showIndicator = refreshing || pull > 4;
  const armed = refreshing || pull >= THRESHOLD;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div
        className="flex items-center justify-center overflow-hidden transition-[height] duration-200"
        style={{ height: showIndicator ? Math.max(pull * 0.6, refreshing ? 36 : 0) : 0 }}
      >
        <RefreshCw
          size={15}
          strokeWidth={2.2}
          className={`shrink-0 ${armed ? 'animate-spin text-text-dim' : 'text-text-faint opacity-70'}`}
          style={armed ? undefined : { transform: `rotate(${pull * 3.5}deg)` }}
        />
      </div>
      {children}
    </div>
  );
}
