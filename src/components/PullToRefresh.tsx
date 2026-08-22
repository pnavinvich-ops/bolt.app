import { useRef, useState } from 'react';
import type { ReactNode } from 'react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: ReactNode;
}

const THRESHOLD = 70;

/**
 * Lightweight touch pull-to-refresh for page-scrolling lists.
 * Shows a spinner that snaps/spins past the threshold while the user drags.
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
    setPull(dy > 0 ? Math.min(Math.round(dy * 0.5), 110) : 0);
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

  const showIndicator = refreshing || pull > 0;
  const spinning = refreshing || pull >= THRESHOLD;

  return (
    <div onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
      <div className="flex items-center justify-center overflow-hidden" style={{ height: showIndicator ? Math.max(pull, refreshing ? 44 : 0) : 0 }}>
        {showIndicator && (
          <div
            className={`h-6 w-6 shrink-0 rounded-full border-2 border-border border-t-accent ${spinning ? 'animate-spin' : ''}`}
            style={{ transform: spinning ? undefined : `rotate(${pull * 3}deg)` }}
          />
        )}
      </div>
      {children}
    </div>
  );
}
