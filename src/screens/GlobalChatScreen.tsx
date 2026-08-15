import { useEffect, useRef, useState } from 'react';
import { Send, MessageCircle, LogIn, LogOut, AlertCircle } from 'lucide-react';
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import ScreenHeader from '@/components/ScreenHeader';

interface Message {
  id: string;
  room_id: string;
  user_id: string | null;
  user_name: string;
  content: string;
  created_at: string;
}

const ROOM = 'global';
const PAGE = 50;

export default function GlobalChatScreen() {
  const [msgs, setMsgs] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<{ id: string; name: string } | null>(null);
  const [authEmail, setAuthEmail] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [authInfo, setAuthInfo] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<RealtimeChannel | null>(null);

  // Resolve current user
  useEffect(() => {
    if (!isSupabaseConfigured) {
      setError('Supabase not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env.');
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

  // Initial fetch
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    (async () => {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('room_id', ROOM)
        .order('created_at', { ascending: false })
        .limit(PAGE);
      if (error) setError(error.message);
      else setMsgs((data ?? []).reverse() as Message[]);
    })();
  }, []);

  // Realtime subscription
  useEffect(() => {
    if (!isSupabaseConfigured) return;
    const channel = supabase
      .channel(`room:${ROOM}`)
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'messages', filter: `room_id=eq.${ROOM}` },
        (payload) => setMsgs((prev) => [...prev, payload.new as Message])
      )
      .subscribe();
    channelRef.current = channel;
    return () => {
      supabase.removeChannel(channel);
      channelRef.current = null;
    };
  }, []);

  // Auto-scroll on new
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [msgs.length]);

  const signIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authEmail.trim() || authLoading) return;
    setAuthLoading(true);
    setError(null);
    setAuthInfo(null);
    const { error } = await supabase.auth.signInWithOtp({
      email: authEmail.trim(),
      options: { emailRedirectTo: window.location.origin },
    });
    if (error) setError(error.message);
    else setAuthInfo('Check your email for a sign-in link.');
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
    setSending(true);
    setError(null);
    const { error } = await supabase.from('messages').insert({
      room_id: ROOM,
      user_id: user.id,
      user_name: user.name,
      content,
    });
    if (error) setError(error.message);
    else setText('');
    setSending(false);
  };

  if (!user) {
    return (
      <div className="min-h-screen pb-24">
        <ScreenHeader title="Global Chat" subtitle={`#${ROOM}`} backTo="/tools" />
        <div className="mx-auto max-w-md px-4 py-4">
          <section className="card space-y-4">
            <div className="flex items-center gap-2">
              <MessageCircle size={18} className="text-accent" />
              <h3 className="text-h3">Sign in to chat</h3>
            </div>
            <p className="text-body text-text-dim">
              Enter your email — we'll send you a one-tap sign-in link. No password.
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
                <LogIn size={18} /> {authLoading ? 'Sending link…' : 'Send sign-in link'}
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
        title="Global Chat"
        subtitle={`#${ROOM} · ${user.name}`}
        backTo="/tools"
        right={
          <button
            type="button"
            onClick={signOut}
            className="flex h-9 w-9 items-center justify-center rounded-md text-text-dim hover:bg-surfaceAlt hover:text-text"
            aria-label="Sign out"
          >
            <LogOut size={18} />
          </button>
        }
      />

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3">
        {msgs.length === 0 && (
          <div className="flex h-full items-center justify-center text-caption text-text-faint">
            <MessageCircle size={14} className="mr-1" /> No messages yet. Break the ice.
          </div>
        )}
        <ul className="space-y-2">
          {msgs.map((m) => (
            <Bubble key={m.id} m={m} isMine={m.user_id === user.id} />
          ))}
        </ul>
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
          placeholder="Say something to the table…"
          maxLength={1000}
          className="flex-1 rounded-md border border-border bg-surfaceAlt px-3 py-2 text-body text-text placeholder:text-text-faint focus:border-accent focus:outline-none"
        />
        <button
          type="submit"
          disabled={sending || text.trim().length === 0}
          className="btn-primary flex items-center gap-1.5 disabled:opacity-50"
        >
          <Send size={16} /> {sending ? 'Sending' : 'Send'}
        </button>
      </form>
    </div>
  );
}

function Bubble({ m, isMine }: { m: Message; isMine: boolean }) {
  const time = new Date(m.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return (
    <li className={`rounded-md border p-2.5 ${isMine ? 'border-accent/30 bg-accent-lo' : 'border-border bg-surfaceAlt'}`}>
      <div className="mb-0.5 flex items-baseline justify-between gap-2">
        <span className="text-caption font-semibold text-text">{m.user_name}</span>
        <span className="text-micro text-text-faint">{time}</span>
      </div>
      <p className="text-body text-text-dim break-words whitespace-pre-wrap">{m.content}</p>
    </li>
  );
}
