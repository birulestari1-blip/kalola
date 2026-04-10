import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import DompetPage from './pages/Dompet';
import TransPage from './pages/Trans';
import BudgetPage from './pages/Budget';
import GoalsPage from './pages/Goals';
import AsetPage from './pages/Aset';
import UtangPage from './pages/Utang';
import InvestasiPage from './pages/Investasi';
import AIAdvisorPage from './pages/AIAdvisor';
import LaporanPage from './pages/Laporan';
import ProfilPage from './pages/Profil';
import LoginPage from './pages/Login';
import SignupPage from './pages/Signup';
import SubscriptionPage from './pages/Subscription';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSubscriptions from './pages/admin/AdminSubscriptions';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-neon border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-dark flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/dashboard" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/dompet" element={<ProtectedRoute><DompetPage /></ProtectedRoute>} />
          <Route path="/trans" element={<ProtectedRoute><TransPage /></ProtectedRoute>} />
          <Route path="/budget" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
          <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
          <Route path="/aset" element={<ProtectedRoute><AsetPage /></ProtectedRoute>} />
          <Route path="/utang" element={<ProtectedRoute><UtangPage /></ProtectedRoute>} />
          <Route path="/investasi" element={<ProtectedRoute><InvestasiPage /></ProtectedRoute>} />
          <Route path="/ai-advisor" element={<ProtectedRoute><AIAdvisorPage /></ProtectedRoute>} />
          <Route path="/laporan" element={<ProtectedRoute><LaporanPage /></ProtectedRoute>} />
          <Route path="/profil" element={<ProtectedRoute><ProfilPage /></ProtectedRoute>} />
          <Route path="/subscription" element={<ProtectedRoute><SubscriptionPage /></ProtectedRoute>} />
          
          {/* Admin Routes */}
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/subscriptions" element={<AdminRoute><AdminSubscriptions /></AdminRoute>} />
          
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
