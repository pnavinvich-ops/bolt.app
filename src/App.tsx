import { useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useLifts } from '@/stores/lifts';
import { useSparring } from '@/stores/sparring';
import { useTendon } from '@/stores/tendon';
import { useSettings } from '@/stores/settings';
import { useOnboarding } from '@/stores/onboarding';
import { useOpponents } from '@/stores/opponents';
import { useTournaments } from '@/stores/tournaments';
import TabBar from '@/components/TabBar';
import LogScreen from '@/screens/LogScreen';
import HistoryScreen from '@/screens/HistoryScreen';
import DiagnosticsScreen from '@/screens/DiagnosticsScreen';
import ToolsScreen from '@/screens/ToolsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import TendonScreen from '@/screens/TendonScreen';
import SparringScreen from '@/screens/SparringScreen';
import VectorGuideScreen from '@/screens/VectorGuideScreen';
import EliteAthletesScreen from '@/screens/EliteAthletesScreen';
import WorldRankingsScreen from '@/screens/WorldRankingsScreen';
import GlobalChatScreen from '@/screens/GlobalChatScreen';
import ProgressScreen from '@/screens/ProgressScreen';
import ScoutBookScreen from '@/screens/ScoutBookScreen';
import PartnersScreen from '@/screens/PartnersScreen';
import TournamentPrepScreen from '@/screens/TournamentPrepScreen';
import RulesScreen from '@/screens/RulesScreen';
import ExercisesScreen from '@/screens/ExercisesScreen';
import StatCardScreen from '@/screens/StatCardScreen';
import IntroScreen from '@/screens/onboarding/IntroScreen';
import QuizScreen from '@/screens/onboarding/QuizScreen';
import PaywallScreen from '@/screens/onboarding/PaywallScreen';
import PlanScreen from '@/screens/onboarding/PlanScreen';

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
        </Layout>
      </Hydrator>
    </HashRouter>
  );
}
