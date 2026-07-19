import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Phone, 
  DollarSign, 
  MessageSquare, 
  Loader2, 
  AlertCircle,
  Copy,
  Check,
  XCircle,
  Clock,
  CheckCircle2,
  ArrowRight,
  CreditCard,
  Wallet,
  ShoppingBag,
  Activity,
  Sparkles,
  Info,
  ChevronRight,
  Server,
  ChevronDown
} from 'lucide-react';
import { api, DashboardStats, NumberHistory, VirtualAccount } from '../utils/api';
import { formatNaira } from '../utils/formatters';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { toast } from 'sonner@2.0.3';
import { useAuth } from '../contexts/AuthContext';
import { useProvider } from '../contexts/ProviderContext';
import { useNavigate } from 'react-router-dom';
import { cn } from '../components/ui/utils';
import ProviderSwitcher from '../components/ProviderSwitcher';

export default function DashboardPage() {
  const { updateBalance, user } = useAuth();
  const { activeProvider } = useProvider();
  const navigate = useNavigate();
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [recentPurchases, setRecentPurchases] = useState<NumberHistory[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const [isLoadingVirtualAccount, setIsLoadingVirtualAccount] = useState(false);
  const [showVirtualAccountModal, setShowVirtualAccountModal] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
    fetchRecentPurchases();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setIsLoading(true);
      const response = await api.getDashboardStats();
      if (response.success) {
        setDashboardStats(response.data);
        // Update the balance in AuthContext so the navbar shows the latest balance
        updateBalance(response.data.wallet_balance);
      }
    } catch (error: any) {
      console.error('Error fetching dashboard stats:', error);
      toast.error(error.message || 'Failed to load dashboard statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    toast.success(`${fieldName} copied to clipboard!`);
    
    setTimeout(() => setCopiedField(null), 2000);
  };

  const fetchRecentPurchases = async () => {
    try {
      setIsLoadingHistory(true);
      const response = await api.getNumberHistory();
      if (response.success) {
        // Get only the 3 most recent purchases
        setRecentPurchases(response.data.numbers.slice(0, 3));
      }
    } catch (error: any) {
      console.error('Error fetching number history:', error);
      // Don't show error toast on dashboard - just silently fail
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return diffInMinutes === 0 ? 'Just now' : `${diffInMinutes} ${diffInMinutes === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} ${diffInHours === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} ${diffInDays === 1 ? 'day' : 'days'} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const getStatusBadge = (status: string, otpCode: string | null) => {
    const normalizedStatus = status.toLowerCase();
    
    if (normalizedStatus === 'completed' || normalizedStatus === 'success') {
      return (
        <Badge className="bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/20">
          <CheckCircle2 className="w-3 h-3 mr-1" />
          Completed
        </Badge>
      );
    } else if (normalizedStatus === 'received') {
      return (
        <Badge className="bg-blue-100 dark:bg-blue-950/20 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-950/20">
          <MessageSquare className="w-3 h-3 mr-1" />
          Received
        </Badge>
      );
    } else if (normalizedStatus === 'failed' || normalizedStatus === 'cancelled') {
      return (
        <Badge className="bg-red-100 dark:bg-red-950/20 text-red-700 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-950/20">
          <XCircle className="w-3 h-3 mr-1" />
          {normalizedStatus === 'cancelled' ? 'Cancelled' : 'Failed'}
        </Badge>
      );
    } else if (normalizedStatus === 'expired' || normalizedStatus === 'timeout') {
      return (
        <Badge className="bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/20">
          <Clock className="w-3 h-3 mr-1" />
          Expired
        </Badge>
      );
    } else if (normalizedStatus === 'pending' || normalizedStatus === 'waiting') {
      return (
        <Badge className="bg-yellow-100 dark:bg-yellow-950/20 text-yellow-700 dark:text-yellow-400 hover:bg-yellow-100 dark:hover:bg-yellow-950/20">
          <Clock className="w-3 h-3 mr-1 animate-pulse" />
          Waiting
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-950/20">
          {status}
        </Badge>
      );
    }
  };

  const fetchVirtualAccount = async () => {
    try {
      setIsLoadingVirtualAccount(true);
      const response = await api.generateVirtualAccount();
      if (response.success) {
        setVirtualAccount(response.data.virtual_account);
      }
    } catch (error: any) {
      console.error('Error fetching virtual account:', error);
      // Don't show error toast on dashboard - just silently fail
    } finally {
      setIsLoadingVirtualAccount(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-[#0A0F1E] p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* Welcome Banner Card */}
          <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#1E40AF] to-[#0F2B6B] p-6 sm:p-8 shadow-2xl">
            {/* Radial glow overlay */}
            <div className="absolute inset-0 bg-gradient-radial from-[rgba(99,179,237,0.15)] to-transparent opacity-50" style={{
              background: 'radial-gradient(ellipse at 80% 50%, rgba(99,179,237,0.15) 0%, transparent 60%)'
            }}></div>
            
            <div className="relative z-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles className="w-5 h-5 text-white" />
                    <span className="text-white text-xl font-semibold">Welcome back, {user?.username || 'User'}!</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-white/65 text-[13px] block mb-1">Wallet Balance</span>
                    <div className="text-[40px] font-extrabold text-white leading-none">
                      {isLoading ? (
                        <Loader2 className="w-10 h-10 animate-spin" />
                      ) : (
                        formatNaira(dashboardStats?.wallet_balance || 0)
                      )}
                    </div>
                  </div>
                  <p className="text-white/55 text-[13px] max-w-md">
                    Your account is active and ready for virtual phone number purchases
                  </p>
                </div>
                
                <div className="flex flex-col gap-3 w-full lg:w-40">
                  <Button
                    onClick={() => navigate('/dashboard/fund-wallet')}
                    className="bg-white hover:bg-white/90 text-[#1D4ED8] font-semibold px-5 rounded-lg h-11 w-full shadow-lg transition-all"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Fund Wallet
                    <ArrowRight className="w-4 h-4 ml-auto" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Cards Row */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* SMS Purchased */}
            <div className="bg-[#1E2A45] rounded-xl p-5 border border-[#2A3A5C] hover:border-[#3B82F6] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.2)] transition-all group">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-[#1D4ED8] rounded-lg flex items-center justify-center">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <Activity className="w-4 h-4 text-[#64748B]" />
              </div>
              <p className="text-[13px] text-[#94A3B8] mb-1">SMS Purchased</p>
              <p className="text-2xl font-bold text-[#F1F5F9]">
                {isLoading ? '...' : `${dashboardStats?.total_sms_purchases || 0}`}
              </p>
              <p className="text-xs text-[#64748B] mt-1">Lifetime total</p>
            </div>

            {/* Provider Switcher - Replaces Total Recharge */}
            <ProviderSwitcher />

            {/* Virtual Account */}
            <div 
              onClick={async () => {
                if (!virtualAccount && !isLoadingVirtualAccount) {
                  await fetchVirtualAccount();
                }
                setShowVirtualAccountModal(true);
              }}
              className="bg-gradient-to-br from-[#6366F1] to-[#4F46E5] rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <CreditCard className="w-5 h-5 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[13px] text-white/90 mb-1">Virtual Account</p>
              <p className="text-xl font-bold text-white">Click to view</p>
              <p className="text-xs text-white/80 mt-1">Funding details</p>
            </div>

            {/* Quick Buy - USA Numbers */}
            <div 
              onClick={() => {
                // Navigate to the correct USA page based on active provider
                const usaRoute = activeProvider === 'smsbus' 
                  ? '/dashboard/usa-numbers-smsbus' 
                  : '/dashboard/usa-numbers';
                navigate(usaRoute);
              }}
              className="bg-gradient-to-br from-[#0EA5E9] to-[#0284C7] rounded-xl p-5 cursor-pointer hover:shadow-xl transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5 text-white" />
                </div>
                <ChevronRight className="w-5 h-5 text-white/70 group-hover:text-white group-hover:translate-x-1 transition-all" />
              </div>
              <p className="text-[13px] text-white/90 mb-1">Quick Buy</p>
              <p className="text-xl font-bold text-white">USA Numbers</p>
              <p className="text-xs text-white/80 mt-1">Instant purchase</p>
            </div>
          </div>

          {/* Recent Purchase History */}
          <div className="bg-[#1E2A45] rounded-xl border border-[#2A3A5C] overflow-hidden">
            <div className="px-6 py-5 border-b border-[#2A3A5C] flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#F1F5F9]">Recent Purchases</h2>
                <p className="text-[13px] text-[#64748B] mt-1">Your latest number purchases</p>
              </div>
              <Button 
                variant="ghost" 
                onClick={() => navigate('/dashboard/numbers-history')}
                className="text-[#3B82F6] hover:bg-[#0F1729] hover:underline font-semibold text-sm"
              >
                View All
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>

            <div className="p-6">
              {isLoadingHistory ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mb-3" />
                  <p className="text-sm text-[#64748B]">Loading history...</p>
                </div>
              ) : recentPurchases.length > 0 ? (
                <div className="space-y-3">
                  {recentPurchases.map((purchase) => {
                    const serviceName = purchase.daisy_service_name || purchase.service?.name || 'Unknown';
                    return (
                      <div 
                        key={purchase.id}
                        className="bg-[#0F1729] rounded-lg p-5 border border-[#2A3A5C] hover:border-[#3B82F6] transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-3 mb-3">
                              <p className="text-sm font-semibold text-[#F1F5F9] truncate">{serviceName}</p>
                              {getStatusBadge(purchase.status, purchase.otp_code)}
                            </div>
                            
                            <div className="flex items-center gap-2 mb-2">
                              <Phone className="w-4 h-4 text-[#94A3B8]" />
                              <p className="text-sm text-[#F1F5F9] font-mono">{purchase.phone_number}</p>
                              <button
                                onClick={() => handleCopy(purchase.phone_number, 'Phone number')}
                                className="text-[#64748B] hover:text-[#3B82F6] transition-colors"
                                title="Copy phone number"
                              >
                                {copiedField === `phone-${purchase.id}` ? (
                                  <Check className="w-4 h-4 text-green-500" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                            
                            {purchase.otp_code && (
                              <div className="flex items-center gap-2">
                                <MessageSquare className="w-4 h-4 text-[#94A3B8]" />
                                <p className="text-sm text-[#F1F5F9]">
                                  OTP: <span className="font-mono font-bold text-[#3B82F6]">{purchase.otp_code}</span>
                                </p>
                                <button
                                  onClick={() => handleCopy(purchase.otp_code!, 'OTP code')}
                                  className="text-[#64748B] hover:text-[#3B82F6] transition-colors"
                                  title="Copy OTP code"
                                >
                                  {copiedField === `otp-${purchase.id}` ? (
                                    <Check className="w-4 h-4 text-green-500" />
                                  ) : (
                                    <Copy className="w-4 h-4" />
                                  )}
                                </button>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 text-xs text-[#64748B]">
                            <Clock className="w-3.5 h-3.5" />
                            <span>{formatTimeAgo(purchase.created_at)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="w-16 h-16 bg-[#0F1729] rounded-full border-2 border-[#2A3A5C] flex items-center justify-center mb-4">
                    <AlertCircle className="w-8 h-8 text-[#64748B]" />
                  </div>
                  <p className="text-sm text-[#64748B] mb-4">No purchases yet</p>
                  <Button
                    onClick={() => navigate('/dashboard/all-countries')}
                    className="bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold px-6 py-3 rounded-lg transition-all"
                  >
                    <Phone className="w-4 h-4 mr-2" />
                    Buy Your First Number
                  </Button>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Virtual Account Modal */}
      <Dialog open={showVirtualAccountModal} onOpenChange={setShowVirtualAccountModal}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-[#1E2A45]">
          <DialogHeader>
            <DialogTitle className="text-center text-gray-900 dark:text-[#F1F5F9] flex items-center justify-center gap-2">
              <CreditCard className="w-5 h-5 text-[#3B82F6]" />
              Virtual Account Details
            </DialogTitle>
            <DialogDescription className="text-center text-gray-600 dark:text-[#94A3B8]">
              Use this account to fund your wallet
            </DialogDescription>
          </DialogHeader>
          
          {isLoadingVirtualAccount ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#3B82F6] animate-spin mb-3" />
              <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Loading account details...</p>
            </div>
          ) : virtualAccount ? (
            <div className="space-y-4">
              {/* Info Alert */}
              <div className="bg-blue-50 dark:bg-[#3B82F6]/10 border border-blue-200 dark:border-[#3B82F6]/30 rounded-xl p-3 flex gap-2">
                <Info className="w-4 h-4 text-blue-600 dark:text-[#3B82F6] flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-800 dark:text-[#94A3B8]">
                  Transfers to this account are automatically credited to your wallet within minutes.
                </p>
              </div>

              {/* Account Number - Highlighted */}
              <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl p-4 shadow-lg">
                <p className="text-xs text-blue-200 mb-2 uppercase tracking-wide">Account Number</p>
                <div className="flex items-center justify-between gap-3 bg-white/10 backdrop-blur-sm rounded-lg p-3">
                  <p className="text-2xl font-mono font-bold text-white tracking-wider">
                    {virtualAccount.account_number}
                  </p>
                  <button
                    onClick={() => handleCopy(virtualAccount.account_number, 'Account number')}
                    className="p-2 rounded-lg hover:bg-white/20 transition-colors"
                    title="Copy account number"
                  >
                    {copiedField === 'Account number' ? (
                      <Check className="w-5 h-5 text-green-300" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>

              {/* Account Name */}
              <div className="bg-gray-50 dark:bg-[#0F1729] rounded-xl p-4 border border-gray-200 dark:border-[#2A3A5C]">
                <p className="text-xs text-gray-600 dark:text-[#64748B] mb-1 uppercase tracking-wide">Account Name</p>
                <p className="text-base font-semibold text-gray-900 dark:text-[#F1F5F9]">{virtualAccount.account_name}</p>
              </div>

              {/* Bank Name */}
              <div className="bg-gray-50 dark:bg-[#0F1729] rounded-xl p-4 border border-gray-200 dark:border-[#2A3A5C]">
                <p className="text-xs text-gray-600 dark:text-[#64748B] mb-1 uppercase tracking-wide">Bank Name</p>
                <p className="text-base font-semibold text-gray-900 dark:text-[#F1F5F9]">{virtualAccount.bank_name}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-8">
              <AlertCircle className="w-8 h-8 text-gray-400 mb-3" />
              <p className="text-sm text-gray-600 dark:text-[#94A3B8]">Failed to load account details</p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}