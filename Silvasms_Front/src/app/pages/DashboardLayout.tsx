import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Wallet, 
  ChevronRight,
  Smartphone,
  MonitorSmartphone,
  Loader2,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Avatar, AvatarFallback } from '../components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '../components/ui/sheet';
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../components/ui/alert-dialog';
import Sidebar from '../components/Sidebar';
import SocialFloatingButtons from '../components/SocialFloatingButtons';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { api } from '../utils/api';

export default function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logoutCurrentDevice, logoutAllDevices, updateBalance } = useAuth();
  const { isDarkMode, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get wallet balance from user or default
  const walletBalance = user ? parseFloat(user.balance) : 0;

  // Fetch balance on mount and when navigating to non-dashboard pages
  useEffect(() => {
    // Don't fetch balance on the dashboard home page (it will use stats endpoint)
    if (location.pathname !== '/dashboard') {
      fetchBalance();
    }
  }, [location.pathname]);

  const fetchBalance = async () => {
    try {
      const response = await api.getBalance();
      if (response.success) {
        updateBalance(response.data.wallet_balance);
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
      // Silently fail - keep showing current balance
    }
  };

  const handleLogout = () => {
    setShowLogoutDialog(true);
  };

  const handleLogoutCurrent = async () => {
    try {
      setIsLoggingOut(true);
      await logoutCurrentDevice();
      api.logout(); // Clear local storage
      toast.success('Logged out successfully');
      navigate('/signin');
    } catch (error: any) {
      console.error('Logout error:', error);
      toast.error(error.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  const handleLogoutAll = async () => {
    try {
      setIsLoggingOut(true);
      await logoutAllDevices();
      api.logout(); // Clear local storage
      toast.success('Logged out from all devices successfully');
      navigate('/signin');
    } catch (error: any) {
      console.error('Logout all devices error:', error);
      toast.error(error.message || 'Failed to logout. Please try again.');
    } finally {
      setIsLoggingOut(false);
      setShowLogoutDialog(false);
    }
  };

  // Get breadcrumb from current path
  const getBreadcrumb = () => {
    const path = location.pathname;
    if (path === '/dashboard') return 'Dashboard / Home';
    if (path.includes('usa-numbers-smsbus')) return 'Dashboard / SMS Bus / USA Numbers';
    if (path.includes('other-countries-smsbus')) return 'Dashboard / SMS Bus / Other Countries';
    if (path.includes('usa-numbers')) return 'Dashboard / Hero SMS / USA Numbers';
    if (path.includes('all-countries')) return 'Dashboard / Hero SMS / All Countries';
    if (path.includes('active-numbers')) return 'Dashboard / Active Numbers';
    if (path.includes('fund-wallet')) return 'Dashboard / Fund Wallet';
    if (path.includes('numbers-history')) return 'Dashboard / Numbers History';
    if (path.includes('transactions')) return 'Dashboard / Transaction History';
    if (path.includes('refer-earn')) return 'Dashboard / Refer & Earn';
    if (path.includes('faqs')) return 'Dashboard / FAQs';
    return 'Dashboard';
  };

  return (
    <div className="flex h-screen bg-[#0A0D0B] overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar onLogout={handleLogout} />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Navigation Bar */}
        <div className="sticky top-0 h-16 bg-[#111713] border-b border-[#1B241D] flex items-center justify-between px-4 lg:px-6 z-30">
          {/* Left Side - Mobile Menu + Breadcrumb */}
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="lg:hidden hover:bg-[#1B241D] text-[#8CA398]"
                >
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-60 bg-[#111713] border-[#1B241D]">
                <Sidebar onLogout={handleLogout} isMobile onNavigate={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>

            {/* Breadcrumb - Hidden on mobile */}
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#6B8378]">
              {getBreadcrumb().split(' / ').map((crumb, index, arr) => (
                <div key={index} className="flex items-center gap-2">
                  <span className={index === arr.length - 1 ? 'text-[#EAF2ED]' : 'text-[#6B8378]'}>
                    {crumb}
                  </span>
                  {index < arr.length - 1 && <ChevronRight className="w-4 h-4 text-[#24352A]" />}
                </div>
              ))}
            </div>

            {/* Mobile Logo */}
            <div className="flex items-center gap-1 sm:hidden" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="text-base font-semibold text-[#EAF2ED]">Silva</span>
              <span className="text-base font-semibold text-[#16C784]">-Sms</span>
            </div>
          </div>

          {/* Right Side - Theme Toggle + Balance + User */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Switcher */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="hover:bg-[#1B241D] rounded-lg flex-shrink-0 w-9 h-9"
              title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              <Sun className="w-5 h-5 text-[#8CA398]" />
            </Button>

            {/* Balance Display */}
            <div
              onClick={() => navigate('/dashboard/fund-wallet')}
              className="signal-chip flex items-center gap-2 px-3 py-2 rounded-lg bg-[#1B241D] hover:bg-[#24352A] cursor-pointer transition-colors border border-[#24352A] flex-shrink-0"
            >
              <span className="signal-dot w-1.5 h-1.5 rounded-full bg-[#16C784]" />
              <span className="text-sm font-semibold text-[#16C784]">₦{walletBalance.toFixed(0)}</span>
            </div>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-[#1B241D]">
                  <Avatar className="w-9 h-9 border-2 border-[#16C784]">
                    <AvatarFallback className="bg-[#16C784] text-white font-semibold">
                      {user?.username?.charAt(0).toUpperCase() || 'U'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-[#1B241D] border-[#24352A]">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm text-[#EAF2ED]">{user?.username || 'User'}</p>
                    <p className="text-xs text-[#8CA398]">{user?.email || 'user@example.com'}</p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[#24352A]" />
                <DropdownMenuItem onClick={() => navigate('/dashboard')} className="cursor-pointer text-[#8CA398] hover:text-[#EAF2ED] hover:bg-[#111713]">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer sm:hidden text-[#8CA398] hover:text-[#EAF2ED] hover:bg-[#111713]" onClick={() => navigate('/dashboard/fund-wallet')}>
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Wallet: ₦{walletBalance.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer text-[#8CA398] hover:text-[#EAF2ED] hover:bg-[#111713]">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-[#24352A]" />
                <DropdownMenuItem onClick={() => setShowLogoutDialog(true)} className="cursor-pointer text-[#EF4444] focus:text-[#EF4444] hover:bg-[#111713]">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Page Content */}
        <div className="flex-1 overflow-auto bg-[#0A0D0B]">
          <Outlet />
        </div>
      </div>

      {/* Social Floating Buttons */}
      <SocialFloatingButtons />

      {/* Logout Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent className="sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-gray-900 dark:text-slate-100">
              <LogOut className="w-5 h-5 text-red-600" />
              Logout Options
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600 dark:text-slate-400">
              Choose how you'd like to logout from your account
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="space-y-3 py-4">
            {/* Current Device Option */}
            <div 
              onClick={!isLoggingOut ? handleLogoutCurrent : undefined}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isLoggingOut 
                  ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 cursor-not-allowed opacity-50' 
                  : 'border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 hover:border-blue-400 dark:hover:border-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-800 rounded-lg">
                  <Smartphone className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-slate-100 mb-1">Logout Current Device</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    You'll be logged out from this device only
                  </p>
                </div>
              </div>
            </div>

            {/* All Devices Option */}
            <div 
              onClick={!isLoggingOut ? handleLogoutAll : undefined}
              className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                isLoggingOut 
                  ? 'border-gray-200 dark:border-slate-600 bg-gray-50 dark:bg-slate-700 cursor-not-allowed opacity-50' 
                  : 'border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 hover:border-red-400 dark:hover:border-red-600 hover:bg-red-100 dark:hover:bg-red-900/30'
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-800 rounded-lg">
                  <MonitorSmartphone className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <div className="flex-1">
                  <h4 className="text-gray-900 dark:text-slate-100 mb-1">Logout All Devices</h4>
                  <p className="text-sm text-gray-600 dark:text-slate-400">
                    You'll be logged out from all devices
                  </p>
                </div>
              </div>
            </div>
          </div>

          {isLoggingOut && (
            <div className="flex items-center justify-center gap-2 py-2">
              <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
              <p className="text-sm text-gray-600 dark:text-slate-400">Logging out...</p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Cancel</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}