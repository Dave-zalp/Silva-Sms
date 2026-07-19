import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, RefreshCw, ShoppingCart, AlertCircle, Copy, Clock, X, CheckCircle2, ChevronLeft } from 'lucide-react';
import { api, DaisySMSService, DaisySMSRentedNumber } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { formatNaira } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { cn } from '../components/ui/utils';

export default function OtherCountriesSMSBusPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<DaisySMSService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);

  const [activePurchase, setActivePurchase] = useState<DaisySMSRentedNumber | null>(null);
  const [otpCode, setOtpCode] = useState<string>('');
  const [isPolling, setIsPolling] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number>(0);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    fetchServices();
    fetchUserBalance();
  }, []);

  useEffect(() => {
    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, []);

  useEffect(() => {
    if (activePurchase && activePurchase.status === 'waiting') {
      const updateCountdown = () => {
        const expiresAt = new Date(activePurchase.expires_at.replace(' ', 'T') + 'Z').getTime();
        const diff = Math.floor((expiresAt - Date.now()) / 1000);
        if (diff <= 0) {
          setTimeRemaining(0);
          if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
          handleExpired();
        } else {
          setTimeRemaining(diff);
        }
      };
      updateCountdown();
      countdownIntervalRef.current = setInterval(updateCountdown, 1000);
      return () => { if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current); };
    }
  }, [activePurchase]);

  useEffect(() => {
    if (activePurchase && activePurchase.status === 'waiting' && !isPolling) {
      startPolling();
    }
    return () => { stopPolling(); };
  }, [activePurchase]);

  const fetchServices = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      setIsLoading(true);
      const response = await api.getDaisySMSServices(forceRefresh);
      if (response.success) {
        setServices(response.data);
        if (forceRefresh) toast.success('Services refreshed successfully');
      } else {
        toast.error('Failed to load services');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await api.getBalance();
      if (response.success) setUserBalance(response.data.wallet_balance);
    } catch (error: any) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const startPolling = () => {
    if (!activePurchase || isPolling) return;
    setIsPolling(true);

    const poll = async () => {
      try {
        const response = await api.getDaisySMSCode(activePurchase.id);
        if (response.success) {
          setOtpCode(response.data.otp_code);
          setActivePurchase({ ...activePurchase, status: 'received' });
          toast.success(`OTP Code Received: ${response.data.otp_code}`, { duration: 10000 });
          stopPolling();
        } else if ('status' in response && (response.status === 'expired' || response.status === 'cancelled')) {
          setActivePurchase({ ...activePurchase, status: response.status });
          toast.error(response.message || `Number ${response.status}`);
          stopPolling();
        }
      } catch (error: any) {
        console.error('Polling error:', error);
      }
    };

    poll();
    pollingIntervalRef.current = setInterval(poll, 5000);
  };

  const stopPolling = () => {
    setIsPolling(false);
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  };

  const handlePurchase = async (service: DaisySMSService) => {
    if (isPurchasing) return;

    if (userBalance < service.final_cost) {
      toast.error(
        `Insufficient balance. You need ${formatNaira(service.final_cost)} but have ${formatNaira(userBalance)}. Please fund your wallet.`,
        { duration: 5000 }
      );
      return;
    }

    setIsPurchasing(true);
    try {
      const response = await api.rentDaisySMSNumber(service.service_code);
      if (response.success) {
        const rentedNumber = response.data.rented_number;
        setActivePurchase(rentedNumber);
        setOtpCode('');
        setUserBalance(response.data.balance.current);
        toast.success(`Number rented successfully! ${rentedNumber.phone_number}`, { duration: 5000 });
      } else {
        const err = response as any;
        if (err.required && err.available !== undefined) {
          toast.error(`Insufficient balance. Required: ${formatNaira(err.required)}, Available: ${formatNaira(err.available)}`, { duration: 5000 });
        } else {
          toast.error(err.message || 'Failed to rent number');
        }
      }
    } catch (error: any) {
      if (error.required && error.available !== undefined) {
        toast.error(`Insufficient balance. Required: ${formatNaira(error.required)}, Available: ${formatNaira(error.available)}`, { duration: 5000 });
      } else {
        toast.error(error.message || 'Failed to rent number. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCancelPurchase = async () => {
    if (!activePurchase) return;
    try {
      const response = await api.cancelDaisySMSActivation(activePurchase.id);
      if (response.success) {
        toast.success(`Number cancelled. Refunded: ${formatNaira(response.data.refunded_amount)}`, { duration: 5000 });
        setUserBalance(response.data.current_balance);
        setActivePurchase(null);
        setOtpCode('');
        stopPolling();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to cancel activation');
    }
  };

  const handleComplete = async () => {
    if (!activePurchase) return;
    try {
      const response = await api.markDaisySMSDone(activePurchase.id);
      if (response.success) {
        toast.success('Activation marked as completed!');
        stopPolling();
        navigate('/dashboard/numbers-history');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to complete activation');
    }
  };

  const handleExpired = () => {
    toast.error('Number expired. Your balance has been refunded.');
    setActivePurchase(null);
    setOtpCode('');
    stopPolling();
    fetchUserBalance();
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const filteredServices = services.filter(s =>
    s.service_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activePurchase) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] via-[#0F1729] to-[#1E2A45] p-4 sm:p-6 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-[#1D4ED8] via-[#1E40AF] to-[#0F2B6B] shadow-xl shadow-blue-500/20">
            <div className="flex items-center gap-3 mb-4">
              <Button
                onClick={() => { setActivePurchase(null); setOtpCode(''); stopPolling(); }}
                variant="ghost"
                size="sm"
                className="text-white hover:bg-white/20"
              >
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl text-white">Active Number</h1>
            </div>
            <p className="text-blue-100 ml-12">Your number is active and waiting for verification code</p>
          </div>

          <Card className="border-0 shadow-xl bg-white dark:bg-[#1E2A45]">
            <CardContent className="p-6">
              <div className="mb-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {activePurchase.service.toUpperCase()}
                </h2>
                <p className="text-gray-500 dark:text-gray-400">Server 1 Number</p>
              </div>

              <div className="mb-6 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/20 border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Phone Number</p>
                    <p className="text-2xl font-mono font-bold text-gray-900 dark:text-white truncate">
                      {activePurchase.phone_number}
                    </p>
                  </div>
                  <Button
                    onClick={() => copyToClipboard(activePurchase.phone_number)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white flex-shrink-0"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {activePurchase.status === 'waiting' && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-3 mb-4">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />
                    <p className="text-lg text-gray-700 dark:text-gray-300">Waiting for SMS...</p>
                  </div>
                  <div className="text-center mb-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-950/30">
                      <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <span className="text-lg font-mono font-bold text-blue-600 dark:text-blue-400">
                        {formatTime(timeRemaining)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Time remaining</p>
                  </div>
                  <Button
                    onClick={handleCancelPurchase}
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-950/20"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel & Refund
                  </Button>
                </div>
              )}

              {activePurchase.status === 'received' && otpCode && (
                <div className="mb-6">
                  <div className="flex items-center justify-center gap-2 mb-4">
                    <CheckCircle2 className="w-6 h-6 text-green-600" />
                    <p className="text-lg font-semibold text-green-600">Code Received!</p>
                  </div>
                  <div className="mb-6 p-6 rounded-lg bg-green-50 dark:bg-green-950/20 border-2 border-green-200 dark:border-green-800">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">Verification Code</p>
                        <p className="text-4xl font-mono font-bold text-green-600 dark:text-green-400 tracking-wider">
                          {otpCode}
                        </p>
                      </div>
                      <Button
                        onClick={() => copyToClipboard(otpCode)}
                        size="sm"
                        className="bg-green-600 hover:bg-green-700 text-white flex-shrink-0"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                  <Button onClick={handleComplete} className="w-full bg-green-600 hover:bg-green-700 text-white">
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark as Done
                  </Button>
                </div>
              )}

              <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Cost</span>
                  <span className="text-xl font-bold text-gray-900 dark:text-white">
                    {formatNaira(activePurchase.cost)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0F1E] via-[#0F1729] to-[#1E2A45] p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-6 p-6 rounded-2xl bg-gradient-to-r from-[#1D4ED8] via-[#1E40AF] to-[#0F2B6B] shadow-xl shadow-blue-500/20">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl sm:text-3xl text-white mb-2">Other Countries</h1>
              <p className="text-blue-100">Select a service to get a phone number</p>
            </div>
            <Button
              onClick={() => fetchServices(true)}
              variant="secondary"
              size="sm"
              disabled={isRefreshing}
              className="bg-white/20 hover:bg-white/30 text-white border-white/20"
            >
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
          </div>
        </div>

        <Card className="mb-6 border-0 shadow-lg bg-white dark:bg-[#1E2A45]">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Wallet Balance</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {isLoadingBalance ? <span className="text-gray-400">Loading...</span> : formatNaira(userBalance)}
                </p>
              </div>
              <Button onClick={() => navigate('/dashboard/fund-wallet')} className="bg-blue-600 hover:bg-blue-700 text-white">
                Fund Wallet
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search services..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#1E2A45] text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <p className="text-gray-600 dark:text-gray-400">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <Card className="border-0 shadow-lg bg-white dark:bg-[#1E2A45]">
            <CardContent className="p-12 text-center">
              <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No services found</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                {searchQuery ? 'Try a different search term' : 'Please try again later'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <Card key={service.service_code} className={cn("border-0 shadow-lg bg-white dark:bg-[#1E2A45] transition-all hover:shadow-xl", service.count === 0 && "opacity-50")}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                    {service.service_name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Available</span>
                      <span className={cn("font-semibold", service.count > 0 ? "text-green-600 dark:text-green-400" : "text-gray-400")}>
                        {service.count} numbers
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">Cost</span>
                      <span className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatNaira(service.final_cost)}
                      </span>
                    </div>
                    <Button
                      onClick={() => handlePurchase(service)}
                      disabled={service.count === 0 || isPurchasing}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ShoppingCart className="w-4 h-4 mr-2" />
                      {service.count === 0 ? 'Out of Stock' : 'Get Number'}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
