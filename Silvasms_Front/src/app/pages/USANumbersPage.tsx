import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, RefreshCw, ShoppingCart, AlertCircle, ChevronDown } from 'lucide-react';
import { api } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { formatNaira } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';

interface HeroService {
  code: string;
  name: string;
}

export default function USANumbersPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState<HeroService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const [selectedService, setSelectedService] = useState<HeroService | null>(null);
  const [servicePrice, setServicePrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  const USA_COUNTRY_ID = 187;

  useEffect(() => {
    fetchServices();
    fetchUserBalance();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
        setSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Fetch price when service is selected
  useEffect(() => {
    if (selectedService) {
      fetchPrice(selectedService);
    } else {
      setServicePrice(null);
    }
  }, [selectedService]);

  const fetchServices = async (forceRefresh: boolean = false) => {
    try {
      if (forceRefresh) setIsRefreshing(true);
      setIsLoading(true);
      
      const response = await api.getServicesByCountry(USA_COUNTRY_ID, forceRefresh);
      
      if (response.success) {
        setServices(response.data.services);
        
        if (forceRefresh) {
          toast.success('Services refreshed successfully');
        }
      } else {
        toast.error('Failed to load services');
      }
    } catch (error: any) {
      console.error('Error fetching services:', error);
      toast.error(error.message || 'Failed to load services');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const fetchPrice = async (service: HeroService) => {
    try {
      setIsLoadingPrice(true);
      const response = await api.getServicePrice(service.code, USA_COUNTRY_ID);
      
      if (response.success && response.data) {
        // Get the first country in the response (backend may return different country due to fallback logic)
        const countryIds = Object.keys(response.data);
        if (countryIds.length > 0) {
          const firstCountryData = response.data[countryIds[0]];
          if (firstCountryData && firstCountryData[service.code]) {
            setServicePrice(firstCountryData[service.code].cost);
          } else {
            setServicePrice(null);
            toast.error('Price not available for this service');
          }
        } else {
          setServicePrice(null);
          toast.error('Price not available for this service');
        }
      }
    } catch (error: any) {
      console.error('Error fetching price:', error);
      setServicePrice(null);
      toast.error('Failed to fetch price');
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await api.getBalance();
      if (response.success) {
        setUserBalance(response.data.wallet_balance);
      }
    } catch (error: any) {
      console.error('Error fetching balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const handleServiceSelect = (service: HeroService) => {
    setSelectedService(service);
    setIsDropdownOpen(false);
    setSearchQuery('');
  };

  const handlePurchase = async () => {
    if (!selectedService || servicePrice === null || isPurchasing) return;
    
    if (userBalance < servicePrice) {
      toast.error(
        `Insufficient balance. You need ${formatNaira(servicePrice)} but have ${formatNaira(userBalance)}. Please fund your wallet.`,
        { duration: 5000 }
      );
      return;
    }

    setIsPurchasing(true);

    try {
      const response = await api.purchaseNumber(selectedService.code, USA_COUNTRY_ID);

      if (response.success) {
        const { purchased_number, balance } = response.data;
        
        setUserBalance(balance.current);
        
        toast.success(
          `Number purchased successfully! Phone: ${purchased_number.phone_number}`,
          { duration: 5000 }
        );
        
        // Navigate to numbers history page with purchase data
        navigate('/dashboard/numbers-history', {
          state: {
            newPurchase: purchased_number,
            balanceUpdate: balance
          }
        });
      }
    } catch (error: any) {
      console.error('Purchase error:', error);
      
      if (error.required && error.available !== undefined) {
        toast.error(
          `Insufficient balance. Required: ${formatNaira(error.required)}, Available: ${formatNaira(error.available)}`,
          { duration: 5000 }
        );
      } else if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to purchase number. Please try again.');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    service.code.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0F1E] p-3 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[#F1F5F9]">
              United States Numbers 🇺🇸
            </h1>
            <div className="flex items-center gap-2">
              {/* Balance Display */}
              {!isLoadingBalance && (
                <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#1E2A45] rounded-lg border border-[#2A3A5C]">
                  <span className="text-[10px] sm:text-xs text-[#94A3B8]">Balance:</span>
                  <span className="text-xs sm:text-sm font-semibold text-[#3B82F6]">{formatNaira(userBalance)}</span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fetchServices(true)}
                disabled={isRefreshing}
                className="text-[#3B82F6] hover:text-[#2563EB] hover:bg-[#1E2A45] text-xs sm:text-sm px-2 sm:px-3 py-1.5 sm:py-2 h-auto"
              >
                <RefreshCw className={cn("w-3.5 h-3.5 sm:w-4 sm:h-4", isRefreshing && "animate-spin")} />
              </Button>
            </div>
          </div>
          <p className="text-xs text-[#94A3B8]">
            Select a service to purchase a USA phone number for SMS verification
          </p>
        </div>

        {/* Step 1: Service Selection */}
        <div className="bg-gradient-to-br from-[#1D4ED8] to-[#2563EB] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 mb-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm sm:text-lg font-bold">
              1
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white">Select Service</h2>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-white" />
            </div>
          ) : (
            <>
              {!selectedService ? (
                <div className="relative" ref={dropdownRef}>
                  {/* Dropdown Button */}
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-left flex items-center justify-between text-white hover:bg-white/20 transition-all"
                  >
                    <span className="text-xs sm:text-sm">Choose a service...</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 transition-transform",
                      isDropdownOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  {isDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#0F1729] border border-[#2A3A5C] rounded-lg sm:rounded-xl shadow-2xl z-50 max-h-[300px] sm:max-h-[400px] overflow-hidden flex flex-col">
                      {/* Search Input Inside Dropdown */}
                      <div className="p-2 sm:p-3 border-b border-[#2A3A5C] sticky top-0 bg-[#0F1729]">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#64748B]" />
                          <input
                            type="text"
                            placeholder="Search services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-[#1E2A45] border border-[#2A3A5C] rounded-lg text-base text-[#F1F5F9] placeholder:text-[#64748B] focus:outline-none focus:ring-2 focus:ring-[#3B82F6]"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Services List */}
                      <div className="overflow-y-auto">
                        {filteredServices.length > 0 ? (
                          filteredServices.map((service) => (
                            <button
                              key={service.code}
                              onClick={() => handleServiceSelect(service)}
                              className="w-full text-left p-2.5 sm:p-3 border-b border-[#2A3A5C] hover:bg-[#1E2A45] transition-colors"
                            >
                              <div className="text-xs sm:text-sm text-[#F1F5F9] font-medium">
                                {service.name}
                              </div>
                              <div className="text-[10px] sm:text-xs text-[#64748B] mt-0.5">
                                {service.code}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-6 sm:p-8 text-center">
                            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#64748B] mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-[#94A3B8]">No services found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-[10px] mb-0.5">Selected Service</p>
                    <p className="text-white text-xs sm:text-sm font-semibold">{selectedService.name}</p>
                    <p className="text-white/60 text-[10px] sm:text-xs">{selectedService.code}</p>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedService(null);
                      setServicePrice(null);
                    }}
                    variant="outline"
                    size="sm"
                    className="bg-white/20 border-white/30 text-white hover:bg-white/30 hover:text-white text-[10px] sm:text-xs px-2 sm:px-3 py-1 h-auto"
                  >
                    Change
                  </Button>
                </div>
              )}

              <p className="text-white/70 text-[10px] sm:text-xs text-center mt-2">
                {services.length} services available
              </p>
            </>
          )}
        </div>

        {/* Step 2: Price & Purchase */}
        {selectedService && (
          <div className="bg-[#1E2A45] border border-[#2A3A5C] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xl">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6] text-sm sm:text-lg font-bold border-2 border-[#3B82F6]">
                2
              </div>
              <h2 className="text-base sm:text-xl font-bold text-[#F1F5F9]">Review & Purchase</h2>
            </div>

            <div className="space-y-2.5 sm:space-y-3 mb-4 sm:mb-5">
              {/* Service Info */}
              <div className="bg-[#0F1729] border border-[#2A3A5C] rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-[#64748B] mb-0.5">Service</p>
                <p className="text-sm sm:text-base font-semibold text-[#F1F5F9]">{selectedService.name}</p>
              </div>

              {/* Country Info */}
              <div className="bg-[#0F1729] border border-[#2A3A5C] rounded-lg sm:rounded-xl p-2.5 sm:p-3">
                <p className="text-[10px] sm:text-xs text-[#64748B] mb-0.5">Country</p>
                <p className="text-sm sm:text-base font-semibold text-[#F1F5F9]">United States 🇺🇸</p>
              </div>

              {/* Price Display */}
              {isLoadingPrice ? (
                <div className="bg-[#0F1729] border border-[#2A3A5C] rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-center">
                  <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-[#3B82F6]" />
                  <span className="ml-2 text-xs sm:text-sm text-[#F1F5F9]">Loading price...</span>
                </div>
              ) : servicePrice !== null ? (
                <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <p className="text-[10px] sm:text-xs text-white/80 mb-0.5">Total Price</p>
                  <p className="text-2xl sm:text-3xl font-bold text-white">{formatNaira(servicePrice)}</p>
                </div>
              ) : (
                <div className="bg-[#0F1729] border border-[#EF4444]/30 rounded-lg sm:rounded-xl p-3 sm:p-4">
                  <div className="flex items-center gap-2 text-[#EF4444]">
                    <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                    <p className="text-xs sm:text-sm">Price not available for this service</p>
                  </div>
                </div>
              )}
            </div>

            {/* Purchase Button */}
            <Button
              onClick={handlePurchase}
              disabled={isPurchasing || isLoadingPrice || servicePrice === null}
              className="w-full py-3 sm:py-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Buy Number{servicePrice !== null ? ` - ${formatNaira(servicePrice)}` : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}