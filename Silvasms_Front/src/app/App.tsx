import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import SignInPage from './pages/SignInPage';
import SignUpPage from './pages/SignUpPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
import DashboardLayout from './pages/DashboardLayout';
import DashboardPage from './pages/DashboardPage';
import FundWalletPage from './pages/FundWalletPage';
import USANumbersPage from './pages/USANumbersPage';
import AllCountriesPage from './pages/AllCountriesPage';
import USANumbersSMSBusPage from './pages/USANumbersSMSBusPage';
import OtherCountriesSMSBusPage from './pages/OtherCountriesSMSBusPage';
import ReferEarnPage from './pages/ReferEarnPage';
import FAQsPage from './pages/FAQsPage';
import NumbersHistoryPage from './pages/NumbersHistoryPage';
import TransactionHistoryPage from './pages/TransactionHistoryPage';
import NumberSelectionPage from './pages/NumberSelectionPage';
import ActiveNumberPage from './pages/ActiveNumberPage';
import AdminLayout from './pages/AdminLayout';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';
import AdminTransactionsPage from './pages/AdminTransactionsPage';
import AdminOrdersPage from './pages/AdminOrdersPage';
import AdminSettingsPage from './pages/AdminSettingsPage';
import { Toaster } from './components/ui/sonner';
import { ThemeProvider } from './components/ThemeProvider';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProviderProvider } from './contexts/ProviderContext';
import { cache } from './utils/cache';
import SocialFloatingButtons from './components/SocialFloatingButtons';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  return <>{children}</>;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    // Redirect admins to admin panel, regular users to dashboard
    return <Navigate to={isAdmin ? "/admin" : "/dashboard"} replace />;
  }

  return <>{children}</>;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  // Redirect non-admin users to dashboard
  if (!isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route 
        path="/signin" 
        element={
          <PublicRoute>
            <SignInPage />
          </PublicRoute>
        } 
      />
      <Route 
        path="/signup" 
        element={
          <PublicRoute>
            <SignUpPage />
          </PublicRoute>
        } 
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="fund-wallet" element={<FundWalletPage />} />
        <Route path="usa-numbers" element={<USANumbersPage />} />
        <Route path="all-countries" element={<AllCountriesPage />} />
        <Route path="usa-numbers-smsbus" element={<USANumbersSMSBusPage />} />
        <Route path="other-countries-smsbus" element={<OtherCountriesSMSBusPage />} />
        <Route path="refer" element={<ReferEarnPage />} />
        <Route path="faqs" element={<FAQsPage />} />
        <Route path="numbers-history" element={<NumbersHistoryPage />} />
        <Route path="transaction-history" element={<TransactionHistoryPage />} />
        <Route path="numbers/:countryId" element={<NumberSelectionPage />} />
        <Route path="active/:numberId" element={<ActiveNumberPage />} />
      </Route>

      {/* Admin Routes */}
      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route index element={<AdminDashboardPage />} />
        <Route path="users" element={<AdminUsersPage />} />
        <Route path="transactions" element={<AdminTransactionsPage />} />
        <Route path="orders" element={<AdminOrdersPage />} />
        <Route path="settings" element={<AdminSettingsPage />} />
      </Route>

      {/* Catch all - redirect to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  // Clear expired cache on app startup
  useEffect(() => {
    cache.clearExpired();
    
    // Set document title and meta description
    document.title = 'GoldenSMS - Your Privacy, Your Number';
    
    // Update or create meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'Get temporary virtual numbers from 150+ countries. Secure, anonymous SMS verification for WhatsApp, Twitter, Instagram, and more. Pay as you go with instant delivery.');
  }, []);

  return (
    <ThemeProvider>
      <CustomThemeProvider>
        <AuthProvider>
          <ProviderProvider>
            <BrowserRouter>
              <div className="min-h-screen">
                <AppRoutes />
                <Toaster />
                <SocialFloatingButtons />
              </div>
            </BrowserRouter>
          </ProviderProvider>
        </AuthProvider>
      </CustomThemeProvider>
    </ThemeProvider>
  );
}