import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import DashboardLayout from './components/layout/DashboardLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import BatchPredict from './pages/BatchPredict';
import Analytics from './pages/Analytics';
import History from './pages/History';
import ModelEvaluation from './pages/ModelEvaluation';
import ExplainableAI from './pages/ExplainableAI';
import Reports from './pages/Reports';
import LiveSimulation from './pages/LiveSimulation';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import BlockedTransactions from './pages/BlockedTransactions';
import CaseManagement from './pages/CaseManagement';
import Notifications from './pages/Notifications';
import SystemHealth from './pages/SystemHealth';
import NotFound from './pages/NotFound';
import ForgotPassword from './pages/ForgotPassword';

export const ToastContext = React.createContext<{
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
}>({ showToast: () => {} });

const App: React.FC = () => {
  const [toast, setToast] = React.useState<{ message: string; type: 'success' | 'error' | 'info' | 'warning'; id: number } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info') => {
    setToast({ message, type, id: Date.now() });
  };

  useEffect(() => {
    document.title = 'FraudShield - AI-Powered Fraud Detection Platform';
    const metas: { name?: string; property?: string; content: string }[] = [
      { name: 'description', content: 'Enterprise-grade AI-powered credit card fraud detection system with 99.91% accuracy. Real-time predictions, batch processing, and explainable AI.' },
      { property: 'og:title', content: 'FraudShield - AI Fraud Detection Platform' },
      { property: 'og:description', content: 'Enterprise-grade ML fraud detection with explainable AI' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'FraudShield - AI Fraud Detection' },
      { name: 'twitter:description', content: 'Enterprise-grade ML fraud detection platform' },
      { name: 'theme-color', content: '#050510' },
    ];
    metas.forEach(({ name, property, content }) => {
      const key = name ? `name="${name}"` : `property="${property}"`;
      if (!document.querySelector(`meta[${key}]`)) {
        const m = document.createElement('meta');
        if (name) m.name = name;
        if (property) m.setAttribute('property', property);
        m.content = content;
        document.head.appendChild(m);
      }
    });
  }, []);

  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <ToastContext.Provider value={{ showToast }}>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/login" element={<Login />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/dashboard" element={<DashboardLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="batch-predict" element={<BatchPredict />} />
                <Route path="analytics" element={<Analytics />} />
                <Route path="history" element={<History />} />
                <Route path="model-evaluation" element={<ModelEvaluation />} />
                <Route path="explainable-ai" element={<ExplainableAI />} />
                <Route path="simulation" element={<LiveSimulation />} />
                <Route path="reports" element={<Reports />} />
                <Route path="blocked" element={<BlockedTransactions />} />
                <Route path="cases" element={<CaseManagement />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="system-health" element={<SystemHealth />} />
                <Route path="profile" element={<Profile />} />
                <Route path="settings" element={<Settings />} />
              </Route>
              <Route path="/404" element={<NotFound />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            {toast && (
              <div className={`fixed top-4 right-4 z-[100] animate-slide-down p-4 rounded-2xl backdrop-blur-xl border shadow-2xl max-w-sm ${
                toast.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' :
                toast.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-300' :
                toast.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-300' :
                'bg-blue-500/10 border-blue-500/20 text-blue-300'
              }`}>
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-medium">{toast.message}</p>
                  <button onClick={() => setToast(null)} className="text-current opacity-60 hover:opacity-100">&times;</button>
                </div>
              </div>
            )}
          </ToastContext.Provider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
};

export default App;