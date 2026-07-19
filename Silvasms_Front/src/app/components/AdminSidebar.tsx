import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Receipt, 
  ShoppingCart,
  LogOut,
  ChevronRight,
  Menu,
  X,
  ArrowLeft,
  Settings
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useState } from 'react';

export default function AdminSidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { 
      icon: LayoutDashboard, 
      label: 'Dashboard', 
      path: '/admin' 
    },
    { 
      icon: Users, 
      label: 'User Management', 
      path: '/admin/users' 
    },
    { 
      icon: Receipt, 
      label: 'Transaction Management', 
      path: '/admin/transactions' 
    },
    { 
      icon: ShoppingCart, 
      label: 'Order Management', 
      path: '/admin/orders' 
    },
    { 
      icon: Settings, 
      label: 'Settings', 
      path: '/admin/settings' 
    }
  ];

  const handleLinkClick = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-3 right-4 z-50 p-2.5 rounded-lg bg-[#16C784] text-[#06120C] shadow-lg hover:bg-[#0EA968] transition-colors"
      >
        {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-40
        w-72 bg-[#0A0D0B] border-r border-[#1B241D]
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo & Brand */}
        <div className="p-6 border-b border-[#1B241D]">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-md bg-[#16C784]/10 border border-[#16C784]/30 flex items-center justify-center flex-shrink-0">
              <span className="signal-dot w-1.5 h-1.5 rounded-full bg-[#16C784]" />
            </div>
            <div>
              <span className="text-lg tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                <span className="font-semibold text-[#EAF2ED]">Silva</span>
                <span className="font-semibold text-[#16C784]">-Sms</span>
              </span>
              <p className="text-xs text-[#6B8378]">Admin Panel</p>
            </div>
          </div>
        </div>

        {/* Admin Info */}
        <div className="p-4 border-b border-[#1B241D] bg-[#123825]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#16C784] flex items-center justify-center text-[#06120C] font-semibold flex-shrink-0">
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#EAF2ED] truncate">{user?.username}</p>
              <p className="text-xs text-[#16C784]">Administrator</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-0.5 px-3">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.path;
              const Icon = item.icon;

              return (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    onClick={handleLinkClick}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all border-l-[3px]
                      ${isActive
                        ? 'bg-[#1B241D] text-[#16C784] border-[#16C784]'
                        : 'text-[#8CA398] border-transparent hover:bg-[#111713] hover:text-[#EAF2ED]'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{item.label}</span>
                    {isActive && <ChevronRight className="w-4 h-4" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Quick Link to User Dashboard */}
        <div className="px-3 pb-4">
          <Link
            to="/dashboard"
            onClick={handleLinkClick}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all bg-[#111713] text-[#8CA398] hover:bg-[#1B241D] hover:text-[#EAF2ED] border border-[#1B241D]"
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1">User Dashboard</span>
          </Link>
        </div>

        {/* Logout */}
        <div className="p-3 border-t border-[#1B241D]">
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-[#8CA398] hover:text-[#F2555B] hover:bg-[#111713] transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 text-[#F2555B]" />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </>
  );
}