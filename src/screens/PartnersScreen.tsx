import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Plus, Trash2, Users, AlertCircle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ScreenHeader from '@/components/ScreenHeader';
import PullToRefresh from '@/components/PullToRefresh';

interface Club {
  id: string;
  name: string;
  city: string;
  country?: string | null;
  contact?: string | null;
  created_by?: string | null;
}

export default function PartnersScreen() {
  const { t } = useTranslation();
  const [clubs, setClubs] = useState<Club[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [user, setUser] = useState<{ id: string } | null>(null);

  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ name: '', city: '', country: '', contact: '' });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setError(t('chat.notConfigured'));
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('clubs')
      .select('id,name,city,country,contact,created_by')
      .order('created_at', { ascending: false })
      .limit(300);
    if (err) setError(err.message);
    else setClubs((data ?? []) as Club[]);
    setLoading(false);
  }, [t]);

  useEffect(() => {
    load();
    if (!isSupabaseConfigured) return;
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUser({ id: data.user.id });
    });
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clubs;
    return clubs.filter((c) =>
      `${c.name} ${c.city} ${c.country ?? ''}`.toLowerCase().includes(q),
    );
  }, [clubs, query]);

  const submitClub = async () => {
    if (!user || !form.name.trim() || !form.city.trim() || saving) return;
    setSaving(true);
    setError(null);
    const { error: err } = await supabase.from('clubs').insert({
      name: form.name.trim(),
      city: form.city.trim(),
      country: form.country.trim() || null,
      contact: form.contact.trim() || null,
      created_by: user.id,
    });
    if (err) setError(err.message);
    else {
      setAdding(false);
      setForm({ name: '', city: '', country: '', contact: '' });
      await load();
    }
    setSaving(false);
  };

  const removeClub = async (id: string) => {
    const { error: err } = await supabase.from('clubs').delete().eq('id', id);
    if (err) setError(err.message);
    else await load();
  };

  return (
    <div className="min-h-screen pb-32">
      <ScreenHeader title={t('partners.title')} subtitle={t('partners.subtitle')} backTo="/tools" />

      <PullToRefresh onRefresh={load}>
        <div className="mx-auto max-w-md space-y-4 px-4 py-4">
        {!isSupabaseConfigured ? (
          <section className="card space-y-3">
            <p className="flex items-start gap-2 text-caption text-warn">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              {t('chat.notConfigured')}
            </p>
            <p className="text-caption text-text-faint">{t('partners.migrationHint')}</p>
          </section>
        ) : (
          <>
            {/* Search */}
            <input
              className="input"
              placeholder={t('partners.searchPh')}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />

            {/* Add */}
            {!adding && (
              <button type="button" onClick={() => setAdding(true)} className="btn-primary w-full">
                <Plus size={18} /> {t('partners.addCta')}
              </button>
            )}

            {(adding || (!user && adding)) && (
              <section className="card space-y-3">
                {!user ? (
                  <p className="text-caption text-text-dim">
                    {t('partners.needAuth')}{' '}
                    <Link to="/chat" className="font-semibold text-accent">
                      {t('chat.title')}
                    </Link>
                  </p>
                ) : (
                  <>
                    <h3 className="text-h3">{t('partners.addTitle')}</h3>
                    <input
                      className="input"
                      placeholder={t('partners.namePh')}
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                    />
                    <input
                      className="input"
                      placeholder={t('partners.cityPh')}
                      value={form.city}
                      onChange={(e) => setForm({ ...form, city: e.target.value })}
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        className="input"
                        placeholder={t('partners.countryPh')}
                        value={form.country}
                        onChange={(e) => setForm({ ...form, country: e.target.value })}
                      />
                      <input
                        className="input"
                        placeholder={t('partners.contactPh')}
                        value={form.contact}
                        onChange={(e) => setForm({ ...form, contact: e.target.value })}
                      />
                    </div>
                    <div className="flex gap-2">
                      <button type="button" onClick={() => setAdding(false)} className="btn-ghost flex-1">
                        {t('common.cancel')}
                      </button>
                      <button
                        type="button"
                        onClick={submitClub}
                        disabled={!form.name.trim() || !form.city.trim() || saving}
                        className="btn-primary flex-1"
                      >
                        {t('common.save')}
                      </button>
                    </div>
                  </>
                )}
              </section>
            )}

            {loading && <p className="py-8 text-center text-caption text-text-faint">{t('common.loading')}</p>}

            {error && (
              <div className="card flex items-start gap-3 border-warn/30">
                <AlertCircle size={18} className="mt-0.5 shrink-0 text-warn" />
                <p className="text-body text-text">{error}</p>
              </div>
            )}

            {!loading && filtered.length === 0 && !error && (
              <div className="card flex flex-col items-center gap-2 py-8 text-center">
                <Users size={24} className="text-text-faint" />
                <p className="text-body font-semibold">{t('partners.empty')}</p>
                <p className="text-caption text-text-faint">{t('partners.emptyMsg')}</p>
              </div>
            )}

            {/* List */}
            <div className="space-y-2">
              {filtered.map((c) => {
                const mine = user && c.created_by === user.id;
                return (
                  <section key={c.id} className="card flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-accent-lo">
                      <MapPin size={18} className="text-accent" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-body font-semibold">{c.name}</p>
                      <p className="truncate text-caption text-text-faint">
                        {[c.city, c.country].filter(Boolean).join(', ')}
                        {c.contact ? ` · ${c.contact}` : ''}
                      </p>
                    </div>
                    {mine && (
                      <span className="shrink-0 rounded-xs bg-accent-lo px-1.5 py-0.5 text-micro font-bold text-accent-hi">
                        {t('partners.mine')}
                      </span>
                    )}
                    {mine && (
                      <button
                        type="button"
                        onClick={() => removeClub(c.id)}
                        aria-label={t('common.delete')}
                        className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-text-faint transition-colors hover:bg-bad-tint hover:text-bad"
                      >
                        <Trash2 size={15} />
                      </button>
                    )}
                  </section>
                );
              })}
            </div>
          </>
        )}
        </div>
      </PullToRefresh>
    </div>
  );
}
