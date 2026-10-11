import React from 'react';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { RouterProvider, useRouter } from './context/RouterContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { PropertyViewPage } from './pages/PropertyViewPage';
import { PropertyDetailPage } from './pages/PropertyDetailPage';
import { DashboardPage } from './pages/DashboardPage';
import { AdminPage } from './pages/AdminPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

const AppContent: React.FC = () => {
  const { path } = useRouter();

  const renderRoute = () => {
    // 1. Landing Page
    if (path === '/') {
      return <LandingPage />;
    }

    // 2. Property View
    if (path === '/propertyview' || path.startsWith('/propertyview')) {
      return <PropertyViewPage />;
    }

    // 3. Property Detail (/property/[id])
    if (path.startsWith('/property/')) {
      return <PropertyDetailPage />;
    }

    // 4. Owner Dashboard (/dashboard)
    if (path === '/dashboard') {
      return (
        <ProtectedRoute allowedRoles={['owner', 'admin']}>
          <DashboardPage />
        </ProtectedRoute>
      );
    }

    // 5. Admin Panel (/admin)
    if (path === '/admin') {
      return (
        <ProtectedRoute allowedRoles={['admin']}>
          <AdminPage />
        </ProtectedRoute>
      );
    }

    // 6. Auth Pages
    if (path === '/login') {
      return <LoginPage />;
    }

    if (path === '/register') {
      return <RegisterPage />;
    }

    // Fallback: 404 or redirect to home
    return <LandingPage />;
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-slate-900 font-sans antialiased selection:bg-emerald-500 selection:text-white">
      <Navbar />
      <main className="flex-1">{renderRoute()}</main>
      <Footer />
    </div>
  );
};

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <RouterProvider>
          <AppContent />
        </RouterProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
