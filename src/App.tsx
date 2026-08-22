import { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { useTendon } from '@/stores/tendon';
import { useSettings } from '@/stores/settings';
import { useOnboarding } from '@/stores/onboarding';
import { useOpponents } from '@/stores/opponents';
import { useTournaments } from '@/stores/tournaments';
import TabBar from '@/components/TabBar';

// Route-level code splitting: each screen ships as its own chunk and loads
// on first visit, keeping the initial bundle small.
const LogScreen = lazy(() => import('@/screens/LogScreen'));
const HistoryScreen = lazy(() => import('@/screens/HistoryScreen'));
const DiagnosticsScreen = lazy(() => import('@/screens/DiagnosticsScreen'));
const ToolsScreen = lazy(() => import('@/screens/ToolsScreen'));
const SettingsScreen = lazy(() => import('@/screens/SettingsScreen'));
const TendonScreen = lazy(() => import('@/screens/TendonScreen'));
const SparringScreen = lazy(() => import('@/screens/SparringScreen'));
const VectorGuideScreen = lazy(() => import('@/screens/VectorGuideScreen'));
const EliteAthletesScreen = lazy(() => import('@/screens/EliteAthletesScreen'));
const WorldRankingsScreen = lazy(() => import('@/screens/WorldRankingsScreen'));
const GlobalChatScreen = lazy(() => import('@/screens/GlobalChatScreen'));
const ProgressScreen = lazy(() => import('@/screens/ProgressScreen'));
const ScoutBookScreen = lazy(() => import('@/screens/ScoutBookScreen'));
const PartnersScreen = lazy(() => import('@/screens/PartnersScreen'));
const TournamentPrepScreen = lazy(() => import('@/screens/TournamentPrepScreen'));
const RulesScreen = lazy(() => import('@/screens/RulesScreen'));
const ExercisesScreen = lazy(() => import('@/screens/ExercisesScreen'));
const StatCardScreen = lazy(() => import('@/screens/StatCardScreen'));
const IntroScreen = lazy(() => import('@/screens/onboarding/IntroScreen'));
const QuizScreen = lazy(() => import('@/screens/onboarding/QuizScreen'));
const PaywallScreen = lazy(() => import('@/screens/onboarding/PaywallScreen'));
const PlanScreen = lazy(() => import('@/screens/onboarding/PlanScreen'));

function RouteFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
    </div>
  );
}

function Hydrator({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    useLifts.getState().hydrate();
    useSparring.getState().hydrate();
    useTendon.getState().hydrate();
    useSettings.getState().hydrate();
    useOnboarding.getState().hydrate();
    useOpponents.getState().hydrate();
    useTournaments.getState().hydrate();
    setReady(true);
  }, []);
  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-border border-t-accent" />
      </div>
    );
  }
  return <>{children}</>;
}

function Layout({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const hideNav = location.pathname.startsWith('/onboarding') || location.pathname === '/';
  return (
    <div className="min-h-screen bg-bg">
      {children}
      {!hideNav && <TabBar />}
    </div>
  );
}

function RootRedirect() {
  const completed = useOnboarding((s) => s.onboardingCompleted);
  return <Navigate to={completed ? '/log' : '/onboarding'} replace />;
}

export default function App() {
  return (
    <HashRouter>
      <Hydrator>
        <Layout>
          <Suspense fallback={<RouteFallback />}>
            <Routes>
            <Route path="/" element={<RootRedirect />} />
            <Route path="/onboarding" element={<IntroScreen />} />
            <Route path="/log" element={<LogScreen />} />
            <Route path="/history" element={<HistoryScreen />} />
            <Route path="/diagnostics" element={<DiagnosticsScreen />} />
            <Route path="/tools" element={<ToolsScreen />} />
            <Route path="/tendon" element={<TendonScreen />} />
            <Route path="/sparring" element={<SparringScreen />} />
            <Route path="/settings" element={<SettingsScreen />} />
            <Route path="/onboarding/quiz" element={<QuizScreen />} />
            <Route path="/onboarding/paywall" element={<PaywallScreen />} />
            <Route path="/onboarding/plan" element={<PlanScreen />} />
            <Route path="/guide" element={<VectorGuideScreen />} />
            <Route path="/athletes" element={<EliteAthletesScreen />} />
            <Route path="/rankings" element={<WorldRankingsScreen />} />
            <Route path="/chat" element={<GlobalChatScreen />} />
            <Route path="/progress" element={<ProgressScreen />} />
            <Route path="/scout" element={<ScoutBookScreen />} />
            <Route path="/partners" element={<PartnersScreen />} />
            <Route path="/tournament" element={<TournamentPrepScreen />} />
            <Route path="/rules" element={<RulesScreen />} />
            <Route path="/exercises" element={<ExercisesScreen />} />
            <Route path="/card" element={<StatCardScreen />} />
            <Route path="*" element={<Navigate to="/log" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </Hydrator>
    </HashRouter>
  );
}
