import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, MessageCircle, LogIn, AlertCircle, Flag, Ban, Video } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { readJSON, writeJSON } from '@/storage/storage';
import { CHAT_CHANNELS } from '@/types/constants';
import i18n from '@/i18n';
import ScreenHeader from '@/components/ScreenHeader';
import ConfirmDialog from '@/components/ConfirmDialog';

const CLIP_PREFIX = '[clip] ';
const MAX_CLIP_BYTES = 50 * 1024 * 1024;

interface Message {
  id: string;
  room_id: string;
  user_id: string | null;
  user_name: string;
  content: string;
  created_at: string;
}

const PAGE = 50;
const SEND_COOLDOWN_MS = 1500;
const CHANNEL_KEY = 'chatChannel';
const BLOCK_KEY = 'blockedUsers';

export default function GlobalChatScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [channelId, setChannelId] = useState<string>(
    () => readJSON<{ id: string }>(CHANNEL_KEY)?.id ?? 'global',
  );
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const [blocked, setBlocked] = useState<string[]>(() => readJSON<string[]>(BLOCK_KEY) ?? []);
  const [action, setAction] = useState<{ type: 'report' | 'block'; msg: Message } | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);
  const lastSendRef = useRef(0);
  const clipInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const uploadClip = async (file: File) => {
    if (!user || uploading) return;
    if (file.size > MAX_CLIP_BYTES) {
      setNotice(t('clip.tooLarge'));
      setTimeout(() => setNotice(null), 3000);
      return;
    }
    setUploading(true);
    setError(null);
    try {
      const ext = (file.name.split('.').pop() ?? 'mp4').toLowerCase().replace(/[^a-z0-9]/g, '') || 'mp4';
      const path = `${user.id}/${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('clips').upload(path, file, {
        cacheControl: '3600',
        upsert: false,
      });
      if (upErr) throw new Error(upErr.message);
      const { data } = supabase.storage.from('clips').getPublicUrl(path);
      const { error: insErr } = await supabase.from('messages').insert({
        room_id: channelId,
        user_id: user.id,
        user_name: user.name,
        content: `${CLIP_PREFIX}${data.publicUrl}`,
      });
      if (insErr) throw new Error(insErr.message);
    } catch (e) {
      setError(e instanceof Error ? e.message : t('sync.fail'));
    }
    setUploading(false);
  };

  // Resolve current user
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError(i18n.t('chat.notConfigured'));
      return;
    }
    // Surface OAuth failures that come back as URL params
    const params = new URLSearchParams(window.location.search);
    const oauthErr = params.get('error_description') || params.get('error');
    if (oauthErr) {
      setError(decodeURIComponent(oauthErr));
      window.history.replaceState({}, '', window.location.pathname);
    }
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        setUser({ id: data.user.id, name: resolveDisplayName(data.user) });
      }
    })();
  }, []);

  // Initial fetch + realtime per channel
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', channelId)
        .order('created_at', { ascending: false })
        .limit(PAGE);
      if (error) setError(error.message);
      else setMsgs((data ?? []).reverse() as Message[]);
      setLoading(false);
    })();

    const rt = supabase
      .channel(`room:${channelId}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${channelId}` },
        (payload) =>
          setMsgs((prev) =>
            prev.some((m) => m.id === (payload.new as Message).id)
              ? prev
              : [...prev, payload.new as Message],
          ),
      )
      .subscribe();
    channelRef.current = rt;

    return () => {
      supabase.removeChannel(rt);
      channelRef.current = null;
    };
  }, [channelId]);

  // Auto-scroll on new
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs.length]);

  const visibleMsgs = useMemo(() => {
    const set = new Set(blocked);
    return msgs.filter((m) => !(m.user_id && set.has(m.user_id)));
  }, [msgs, blocked]);

  const pickChannel = (id: string) => {
    if (id === channelId) return;
    setChannelId(id);
    setMsgs([]);
    writeJSON(CHANNEL_KEY, { id });
  };

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || authLoading) return;
    setAuthLoading(true);
    setError(null);
    setAuthInfo(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: {
        emailRedirectTo: `${window.location.origin}/#/chat`,
      },
    });
    if (error) setError(error.message);
    else setAuthInfo(t('chat.linkSent'));
    setAuthLoading(false);
  };

  const signInGoogle = async () => {
    setError(null);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/#/chat` },
    });
    if (error) setError(error.message);
  };

  const signInGuest = async () => {
    setError(null);
    const { data, error } = await supabase.auth.signInAnonymously();
    if (error || !data.user) {
      setError(error?.message ?? t('sync.fail'));
      return;
    }
    setUser({ id: data.user.id, name: resolveDisplayName(data.user) });
  };

  const send = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = text.trim();
    if (!content || sending || !user) return;
    if (Date.now() - lastSendRef.current < SEND_COOLDOWN_MS) {
      setNotice(t('chat.tooFast'));
      setTimeout(() => setNotice(null), 2500);
      return;
    }
    setSending(true);
    setError(null);
    const { error } = await supabase.from('messages').insert({
      room_id: channelId,
      user_id: user.id,
      user_name: user.name,
      content,
    });
    if (error) setError(error.message);
    else {
      setText('');
      lastSendRef.current = Date.now();
    }
    setSending(false);
  };

  const confirmAction = async () => {
    if (!action) return;
    const { type, msg } = action;
    setAction(null);
    if (type === 'block') {
      if (msg.user_id) {
        const next = Array.from(new Set([...blocked, msg.user_id]));
        setBlocked(next);
        writeJSON(BLOCK_KEY, next);
        setNotice(t('chat.blockedNotice', { name: msg.user_name }));
      }
      return;
    }
    // report
    if (!isSupabaseConfigured) return;
    const { error } = await supabase.from('message_reports').insert({
      message_id: msg.id,
      reported_by: user?.id ?? null,
    });
    setNotice(error ? error.message : t('chat.reportedNotice'));
    setTimeout(() => setNotice(null), 3000);
  };

  const unblockAll = () => {
    setBlocked([]);
    writeJSON(BLOCK_KEY, []);
  };

  if (!isSupabaseConfigured) {
    return (
      <div className="min-h-screen pb-24">
        <ScreenHeader title={t('chat.title')} backTo="/tools" />
        <div className="mx-auto max-w-md px-4 py-4">
          <p className="flex items-start gap-2 text-caption text-warn">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {t('chat.notConfigured')}
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen pb-24">
        <ScreenHeader title={t('chat.title')} subtitle={`#${channelId}`} backTo="/tools" />
        <div className="mx-auto max-w-md px-4 py-4">
          <section className="card space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-accent" />
              <h3 className="text-h3">{t('chat.signIn')}</h3>
            </div>
            <p className="text-body text-text-dim">
              {t('chat.signInBody')}
            </p>
            <form onSubmit={signIn} className="space-y-2">
              <input
                type="email"
                required
                value={authEmail}
                onChange={(e) => setAuthEmail(e.target.value)}
                placeholder="you@example.com"
                className="input"
              />
              <button type="submit" disabled={authLoading} className="btn-primary w-full">
                <LogIn size={18} /> {authLoading ? t('chat.sendingLink') : t('chat.sendLink')}
              </button>
            </form>

            <div className="flex items-center gap-3 py-1">
              <span className="h-px flex-1 bg-border" />
              <span className="text-micro text-text-faint">{t('chat.orDivider')}</span>
              <span className="h-px flex-1 bg-border" />
            </div>

            <button type="button" onClick={signInGoogle} className="btn-ghost w-full">
              <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.76h3.57c2.08-1.92 3.27-4.74 3.27-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.76c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.05l3.66 2.84c.87-2.6 3.3-4.51 6.16-4.51z" />
              </svg>
              {t('chat.googleSignIn')}
            </button>
            <p className="text-micro text-text-faint">{t('chat.googleHint')}</p>
            <button type="button" onClick={signInGuest} className="btn-primary w-full">
              <MessageCircle size={18} /> {t('chat.guestSignIn')}
            </button>
            {authInfo && <p className="text-caption text-ok">{authInfo}</p>}
            {error && (
              <p className="flex items-start gap-1.5 text-caption text-warn">
                <AlertCircle size={14} className="mt-0.5 shrink-0" /> {error}
              </p>
            )}
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-bg">
      <ScreenHeader
        title={t('chat.title')}
        subtitle={`#${t(channelKeyFor(channelId))} · ${user.name}`}
        backTo="/tools"
        right={
          <button
            type="button"
            onClick={() => navigate('/account')}
            aria-label={t('acc.title')}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-accent-lo text-caption font-bold text-accent-hi transition-transform active:scale-90"
          >
            {user.name.charAt(0).toUpperCase()}
          </button>
        }
      />

      {/* Channels */}
      <div className="flex gap-1.5 overflow-x-auto border-b border-border bg-surface px-3 py-2">
        {CHAT_CHANNELS.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pickChannel(c.id)}
            className={`shrink-0 rounded-md border px-3 py-1.5 text-caption font-semibold transition-all active:scale-95 ${
              channelId === c.id
                ? 'border-accent bg-accent-lo text-accent-hi'
                : 'border-border bg-surfaceAlt text-text-dim hover:text-text'
            }`}
          >
            {t(c.key)}
          </button>
        ))}
      </div>

      {notice && <p className="px-4 py-1.5 text-caption font-semibold text-ok">{notice}</p>}
      {loading && <p className="px-4 py-1 text-caption text-text-faint">{t('common.loading')}</p>}

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {visibleMsgs.length === 0 && (
          <div className="flex h-full items-center justify-center text-caption text-text-faint">
            <MessageCircle size={14} className="mr-1" /> {t('chat.noMessages')}
          </div>
        )}
        <ul className="space-y-2">
          {visibleMsgs.map((m) => (
            <Bubble
              key={m.id}
              m={m}
              isMine={m.user_id === user.id}
              onReport={() => setAction({ type: 'report', msg: m })}
              onBlock={() => setAction({ type: 'block', msg: m })}
            />
          ))}
        </ul>
        {blocked.length > 0 && (
          <button
            type="button"
            onClick={unblockAll}
            className="mt-3 w-full text-center text-micro text-text-faint underline transition-colors hover:text-text-dim"
          >
            {t('chat.unblockAll', { count: blocked.length })}
          </button>
        )}
      </div>

      {error && <p className="px-4 py-1 text-caption text-warn">{error}</p>}

      <form
        onSubmit={send}
        className="safe-b flex gap-2 border-t border-border bg-surface px-4 py-3"
      >
        <input
          ref={clipInputRef}
          type="file"
          accept="video/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void uploadClip(f);
            e.target.value = '';
          }}
        />
        <button
          type="button"
          onClick={() => clipInputRef.current?.click()}
          disabled={uploading}
          aria-label={t('clip.attach')}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-border bg-surfaceAlt text-text-dim transition-all active:scale-90 hover:text-accent disabled:opacity-50"
        >
          <Video size={18} className={uploading ? 'animate-pulse' : ''} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder={t('chat.msgPh')}
          maxLength={1000}
          className="flex-1 rounded-md border border-border bg-surfaceAlt px-3 py-2 text-body text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || text.trim().length === 0}
          className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send size={16} /> {sending ? t('chat.sending') : t('common.send')}
        </button>
      </form>

      <ConfirmDialog
        open={action?.type === 'report'}
        title={t('chat.reportTitle')}
        message={t('chat.reportMsg')}
        confirmLabel={t('chat.reportConfirm')}
        danger
        onConfirm={confirmAction}
        onCancel={() => setAction(null)}
      />
      <ConfirmDialog
        open={action?.type === 'block'}
        title={t('chat.blockTitle')}
        message={t('chat.blockMsg', { name: action?.msg.user_name ?? '' })}
        confirmLabel={t('chat.blockConfirm')}
        danger
        onConfirm={confirmAction}
        onCancel={() => setAction(null)}
      />
    </div>
  );
}

function Bubble({
  m,
  isMine,
  onReport,
  onBlock,
}: {
  m: Message;
  isMine: boolean;
  onReport: () => void;
  onBlock: () => void;
}) {
  const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const isClip = m.content.startsWith(CLIP_PREFIX);
  const clipUrl = isClip ? m.content.slice(CLIP_PREFIX.length).trim() : null;
  return (
    <li className={`rounded-md border p-2.5 ${isMine ? 'border-accent/30 bg-accent-lo' : 'border-border bg-surfaceAlt'}`}>
      <div className="mb-1 flex items-center gap-2">
        <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-micro font-bold ${isMine ? 'bg-accent text-onAccent' : 'bg-surfaceHigh text-text-dim'}`}>
          {m.user_name.charAt(0).toUpperCase()}
        </span>
        <span className="min-w-0 flex-1 truncate text-caption font-semibold text-text">{m.user_name}</span>
        {!isMine && m.user_id && (
          <>
            <button
              type="button"
              onClick={onReport}
              aria-label="Report"
              className="text-text-faint opacity-60 transition-opacity hover:text-warn hover:opacity-100"
            >
              <Flag size={12} />
            </button>
            <button
              type="button"
              onClick={onBlock}
              aria-label="Block"
              className="text-text-faint opacity-60 transition-opacity hover:text-bad hover:opacity-100"
            >
              <Ban size={12} />
            </button>
          </>
        )}
        <span className="text-micro text-text-faint">{time}</span>
      </div>
      {isClip && clipUrl ? (
        <video src={clipUrl} controls preload="metadata" className="mt-1 max-h-72 w-full rounded-md bg-black" />
      ) : (
        <p className="text-body text-text-dim break-words whitespace-pre-wrap">{m.content}</p>
      )}
    </li>
  );
}

function channelKeyFor(id: string): string {
  return CHAT_CHANNELS.find((c) => c.id === id)?.key ?? 'chat.chGlobal';
}

/** Friendly display name for Google users, email users and anonymous guests. */
function resolveDisplayName(user: {
  user_metadata?: Record<string, unknown>;
  email?: string;
  is_anonymous?: boolean;
}): string {
  const meta = (user.user_metadata ?? {}) as Record<string, string | undefined>;
  if (user.is_anonymous) {
    const stored = readJSON<string>('guestName');
    const name = stored ?? `Guest-${Math.random().toString(36).slice(2, 6)}`;
    writeJSON('guestName', name);
    return name;
  }
  return (
    meta.full_name?.trim() ||
    meta.user_name?.trim() ||
    meta.name?.trim() ||
    user.email?.split('@')[0] ||
    'Anonymous'
  );
}
