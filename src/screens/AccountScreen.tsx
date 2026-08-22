import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Cloud, User as UserIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ScreenHeader from '@/components/ScreenHeader';

interface Profile {
  id: string;
  name: string;
  email?: string;
  picture?: string;
  provider: 'google' | 'email' | 'guest';
}

function resolveProfile(user: {
  id: string;
  email?: string;
  is_anonymous?: boolean;
  app_metadata?: { provider?: string };
  user_metadata?: Record<string, unknown>;
}): Profile {
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  const provider = user.is_anonymous
    ? 'guest'
    : user.app_metadata?.provider === 'google'
      ? 'google'
      : 'email';
  return {
    id: user.id,
    name:
      meta.full_name?.trim() ||
      meta.name?.trim() ||
      meta.user_name?.trim() ||
      user.email?.split('@')[0] ||
      'Anonymous',
    email: user.email,
    picture: meta.picture || meta.avatar_url,
    provider,
  };
}

export default function AccountScreen() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setChecked(true);
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setProfile(resolveProfile(data.user));
      setChecked(true);
    });
  }, []);

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('acc.title')} subtitle={t('acc.subtitle')} backTo="/settings" />

      <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        {!checked ? null : !isSupabaseConfigured ? (
          <p className="text-caption text-warn">{t('chat.notConfigured')}</p>
        ) : !profile ? (
          <section className="card space-y-3 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surfaceAlt">
              <UserIcon size={28} className="text-text-faint" />
            </div>
            <p className="text-body font-semibold">{t('acc.notSignedIn')}</p>
            <p className="text-caption text-text-dim">{t('acc.signInBody')}</p>
            <button type="button" onClick={() => navigate('/chat')} className="btn-primary w-full">
              {t('chat.title')}
            </button>
          </section>
        ) : (
          <>
            {/* Profile card */}
            <section className="card flex items-center gap-4">
              {profile.picture ? (
                <img
                  src={profile.picture}
                  alt=""
                  referrerPolicy="no-referrer"
                  className="h-16 w-16 shrink-0 rounded-full border border-border object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-accent-lo text-h2 font-extrabold text-accent-hi">
                  {profile.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="truncate text-h3 font-bold">{profile.name}</p>
                {profile.email && (
                  <p className="truncate text-caption text-text-faint">{profile.email}</p>
                )}
                <span className="mt-1 inline-block rounded-xs bg-accent-lo px-2 py-0.5 text-micro font-bold uppercase tracking-wide text-accent-hi">
                  {profile.provider === 'google'
                    ? t('acc.provGoogle')
                    : profile.provider === 'guest'
                      ? t('acc.provGuest')
                      : t('acc.provEmail')}
                </span>
              </div>
            </section>

            {/* Backup pointer */}
            <section className="card space-y-2">
              <p className="label flex items-center gap-1.5">
                <Cloud size={12} /> {t('sync.title')}
              </p>
              <p className="text-caption text-text-dim">{t('acc.backupNote')}</p>
            </section>

            <button type="button" onClick={signOut} className="btn-danger w-full justify-start">
              <LogOut size={18} /> {t('acc.signOut')}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
