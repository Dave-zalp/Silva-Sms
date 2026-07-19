import { useLocation, useNavigate } from 'react-router-dom';
import { cn } from './ui/utils';
import { useAuth } from '../contexts/AuthContext';
import { useProvider } from '../contexts/ProviderContext';
import { 
  LayoutDashboard, 
  Wallet, 
  Phone, 
  Globe, 
  HelpCircle,
  FileText,
  Receipt,
  LogOut,
  Shield,
  Zap,
  Award
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  isMobile?: boolean;
  onNavigate?: () => void;
}

export default function Sidebar({ onLogout, isMobile = false, onNavigate }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { activeProvider } = useProvider();

  const handleNavClick = (path: string) => {
    navigate(path);
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleExternalLink = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
    if (onNavigate) {
      onNavigate();
    }
  };

  const handleLogoutClick = () => {
    onLogout();
    if (onNavigate) {
      onNavigate();
    }
  };

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
  };

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/dashboard',
      exact: true
    },
    { 
      icon: Wallet, 
      label: 'Fund Wallet', 
      path: '/dashboard/fund-wallet' 
    },
    { 
      icon: HelpCircle, 
      label: 'FAQs', 
      path: '/dashboard/faqs' 
    },
  ];

  const smsBusItems = [
    { 
      icon: Phone, 
      label: 'USA Numbers', 
      path: '/dashboard/usa-numbers-smsbus' 
    },
    { 
      icon: Globe, 
      label: 'Other Countries', 
      path: '/dashboard/other-countries-smsbus' 
    },
  ];

  const heroSmsItems = [
    { 
      icon: Phone, 
      label: 'USA Numbers', 
      path: '/dashboard/usa-numbers' 
    },
    { 
      icon: Globe, 
      label: 'Other Countries', 
      path: '/dashboard/all-countries' 
    },
  ];

  const historyItems = [
    { 
      icon: FileText, 
      label: 'Numbers History', 
      path: '/dashboard/numbers-history' 
    },
    { 
      icon: Receipt, 
      label: 'Transaction History', 
      path: '/dashboard/transaction-history' 
    },
  ];

  return (
    <div className={cn(
      "w-60 h-screen flex flex-col bg-[#111713]",
      isMobile ? "border-0" : "border-r border-[#1B241D] shadow-sm"
    )}>
      {/* Logo - Only on Desktop */}
      {!isMobile && (
        <div className="p-6 border-b border-[#1B241D] bg-[#111713]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#16C784]/10 border border-[#16C784]/30 flex items-center justify-center flex-shrink-0">
              <span className="signal-dot w-1.5 h-1.5 rounded-full bg-[#16C784]" />
            </div>
            <span className="text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="font-semibold text-[#EAF2ED]">Silva</span>
              <span className="font-semibold text-[#16C784]">-Sms</span>
            </span>
          </div>
        </div>
      )}

      {/* Mobile Header */}
      {isMobile && (
        <div className="p-6 border-b border-[#1B241D] bg-[#111713]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#16C784]/10 border border-[#16C784]/30 flex items-center justify-center flex-shrink-0">
              <span className="signal-dot w-1.5 h-1.5 rounded-full bg-[#16C784]" />
            </div>
            <span className="text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              <span className="font-semibold text-[#EAF2ED]">Silva</span>
              <span className="font-semibold text-[#16C784]">-Sms</span>
            </span>
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className={cn(
        "flex-1 overflow-y-auto bg-[#111713]",
        isMobile ? "py-4 px-3" : "py-5 px-3"
      )}>
        {/* Main Menu */}
        <nav className="space-y-0.5">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = item.exact 
              ? location.pathname === item.path
              : isActive(item.path);
            
            return (
              <button
                key={item.path}
                onClick={() => item.isExternal ? handleExternalLink(item.path) : handleNavClick(item.path)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm h-11",
                  active && !item.isExternal
                    ? "bg-[#1B241D] text-[#16C784] border-l-[3px] border-[#16C784]"
                    : "text-[#8CA398] hover:bg-[#16201A] hover:text-[#EAF2ED]"
                )}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Server 1 Section - Only show if SMSBus is active */}
        {activeProvider === 'smsbus' && (
          <div className="mt-6">
            <h3 className="px-3 mb-2 text-[11px] tracking-[0.08em] text-[#6B8378] uppercase font-semibold">
              SERVER 1
            </h3>
            <nav className="space-y-0.5">
              {smsBusItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm h-11",
                      active
                        ? "bg-[#1B241D] text-[#16C784] border-l-[3px] border-[#16C784]"
                        : "text-[#8CA398] hover:bg-[#16201A] hover:text-[#EAF2ED]"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* Server 2 Section - Only show if HeroSMS is active */}
        {activeProvider === 'herosms' && (
          <div className="mt-6">
            <h3 className="px-3 mb-2 text-[11px] tracking-[0.08em] text-[#6B8378] uppercase font-semibold">
              SERVER 2
            </h3>
            <nav className="space-y-0.5">
              {heroSmsItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.path);
                
                return (
                  <button
                    key={item.path}
                    onClick={() => handleNavClick(item.path)}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm h-11",
                      active
                        ? "bg-[#1B241D] text-[#16C784] border-l-[3px] border-[#16C784]"
                        : "text-[#8CA398] hover:bg-[#16201A] hover:text-[#EAF2ED]"
                    )}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        )}

        {/* History Section */}
        <div className="mt-6">
          <h3 className="px-3 mb-2 text-[11px] tracking-[0.08em] text-[#6B8378] uppercase font-semibold">
            HISTORY
          </h3>
          <nav className="space-y-0.5">
            {historyItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);
              
              return (
                <button
                  key={item.path}
                  onClick={() => handleNavClick(item.path)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm h-11",
                    active
                      ? "bg-[#1B241D] text-[#16C784] border-l-[3px] border-[#16C784]"
                      : "text-[#8CA398] hover:bg-[#16201A] hover:text-[#EAF2ED]"
                  )}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Admin Panel Quick Link - Only for Admins */}
      {user?.role === 'admin' && (
        <div className={cn(
          "border-t border-[#1B241D] bg-[#111713]",
          isMobile ? "p-3" : "p-3"
        )}>
          <button
            onClick={() => handleNavClick('/admin')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left bg-[#1B241D] text-[#16C784] hover:bg-[#16201A] transition-all text-sm border border-[#16C784]/20"
          >
            <Shield className="w-4 h-4 flex-shrink-0" />
            <span>Admin Panel</span>
          </button>
        </div>
      )}

      {/* Logout Section */}
      <div className={cn(
        "border-t border-[#1B241D] bg-[#111713]",
        isMobile ? "p-3" : "p-3"
      )}>
        <button
          onClick={handleLogoutClick}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left text-[#6B8378] hover:text-[#EF4444] hover:bg-[#16201A] transition-all text-sm"
        >
          <LogOut className="w-4 h-4 flex-shrink-0 text-[#EF4444]" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}