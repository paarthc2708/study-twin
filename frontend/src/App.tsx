import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './components/ui/ToastProvider';
import { ProtectedRoute } from './routes/ProtectedRoute';
import { MarketingLayout } from './layouts/MarketingLayout';
import { AppShellLayout } from './layouts/AppShellLayout';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { DashboardPage } from './pages/DashboardPage';
import { AiMentorPage } from './pages/AiMentorPage';
import { QuizGeneratorPage } from './pages/QuizGeneratorPage';
import { StudyStrategyPage } from './pages/StudyStrategyPage';
import { LearningAnalyticsPage } from './pages/LearningAnalyticsPage';
import { DigitalTwinPage } from './pages/DigitalTwinPage';
import { SettingsPage } from './pages/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <Routes>
            <Route element={<MarketingLayout />}>
              <Route path="/" element={<LandingPage />} />
            </Route>
            <Route path="/sign-in" element={<SignInPage />} />

            <Route element={<ProtectedRoute />}>
              <Route element={<AppShellLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/quiz" element={<QuizGeneratorPage />} />
                <Route path="/strategy" element={<StudyStrategyPage />} />
                <Route path="/analytics" element={<LearningAnalyticsPage />} />
                <Route path="/settings" element={<SettingsPage />} />
              </Route>
              <Route element={<AppShellLayout showTopNav={false} fullBleed />}>
                <Route path="/digital-twin" element={<DigitalTwinPage />} />
                <Route path="/mentor" element={<AiMentorPage />} />
              </Route>
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
