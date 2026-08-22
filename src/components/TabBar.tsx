import { Link } from 'react-router-dom';
import { Dumbbell, History, Activity, Wrench, TrendingUp } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const tabs = [
  { to: '/log', icon: Dumbbell, key: 'tabs.log' },
  { to: '/history', icon: History, key: 'tabs.history' },
  { to: '/progress', icon: TrendingUp, key: 'tabs.progress' },
  { to: '/diagnostics', icon: Activity, key: 'tabs.diagnostics' },
  { to: '/tools', icon: Wrench, key: 'tabs.tools' },
];

export default function TabBar() {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-surface/95 backdrop-blur-md safe-b">
      <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
        {tabs.map(({ to, icon: Icon, key }) => {
          const active = pathname === to || pathname.startsWith(to + '/');
          return (
            <Link
              key={to}
              to={to}
              className="group flex flex-1 flex-col items-center gap-1 py-2.5 transition-colors"
            >
              <span
                className={`flex h-7 w-12 items-center justify-center rounded-md transition-all ${
                  active ? 'bg-accent-lo text-accent-hi' : 'text-text-faint group-hover:text-text-dim'
                }`}
              >
                <Icon size={18} strokeWidth={active ? 2.6 : 2} />
              </span>
              <span
                className={`text-micro transition-colors ${
                  active ? 'text-accent' : 'text-text-faint group-hover:text-text-dim'
                }`}
              >
                {t(key)}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
