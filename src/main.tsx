import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import './i18n';

async function setupNative() {
  try {
    const { Capacitor } = await import('@capacitor/core');
    if (!Capacitor.isNativePlatform()) return;
    const { StatusBar, Style } = await import('@capacitor/status-bar');
    const { SplashScreen } = await import('@capacitor/splash-screen');
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: '#0B0F14' });
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch {
    /* plugins only available on native platform */
  }
}

/**
 * Consume magic-link / OAuth tokens from the URL BEFORE the router mounts.
 * The link callback lands on `site#access_token=…` (no route), which
 * HashRouter would otherwise bounce away from before the session is read.
 * After consuming, we send the user straight into the chat, signed in.
 * Supabase is imported lazily here so normal visits stay lightweight.
 */
async function bootstrap() {
  const url = window.location.href;
  if (!url.includes('access_token=') && !/[?&]code=/.test(url)) return;
  try {
    const { supabase } = await import('./lib/supabase');
    await supabase.auth.getSession();
    const target = `${window.location.origin}/#/chat`;
    window.history.replaceState({}, '', target);
  } catch {
    /* no pending session */
  }
}

(async () => {
  await Promise.allSettled([setupNative(), bootstrap()]);
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>
  );
})();
