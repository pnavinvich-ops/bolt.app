import { useEffect, useMemo, useRef, useState } from 'react';
import { Send, MessageCircle, LogIn, LogOut, AlertCircle, Flag, Ban } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { readJSON, writeJSON } from '@/storage/storage';
import { CHAT_CHANNELS } from '@/types/constants';
import i18n from '@/i18n';
import ScreenHeader from '@/components/ScreenHeader';
import ConfirmDialog from '@/components/ConfirmDialog';

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

  // Resolve current user
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError(i18n.t('chat.notConfigured'));
      return;
    }
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const name =
          (data.user.user_metadata?.user_name as string | undefined) ||
          data.user.email?.split('@')[0] ||
          'Anonymous';
        setUser({ id: data.user.id, name });
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

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
            onClick={signOut}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-dim hover:bg-surfaceAlt hover:text-text"
            aria-label={t('chat.signOutAria')}
          >
            <LogOut size={18} />
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
  return (
    <li className={`rounded-md border p-2.5 ${isMine ? 'border-accent/30 bg-accent-lo' : 'border-border bg-surfaceAlt'}`}>
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="text-caption font-semibold text-text">{m.user_name}</span>
        <span className="flex items-center gap-1.5">
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
        </span>
      </div>
      <p className="text-body text-text-dim break-words whitespace-pre-wrap">{m.content}</p>
    </li>
  );
}

function channelKeyFor(id: string): string {
  return CHAT_CHANNELS.find((c) => c.id === id)?.key ?? 'chat.chGlobal';
}
