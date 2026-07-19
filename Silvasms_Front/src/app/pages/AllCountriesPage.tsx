import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Loader2, RefreshCw, ShoppingCart, AlertCircle, ChevronDown } from 'lucide-react';
import { api, Country, Service } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { formatNaira } from '../utils/formatters';
import { Button } from '../components/ui/button';
import { cn } from '../components/ui/utils';

// Get country code from country name
const getCountryCode = (countryName: string): string => {
  const codeMap: Record<string, string> = {
    'russia': 'RU', 'ukraine': 'UA', 'kazakhstan': 'KZ', 'china': 'CN',
    'india': 'IN', 'united states': 'US', 'usa': 'US', 'united kingdom': 'GB',
    'uk': 'GB', 'canada': 'CA', 'australia': 'AU', 'germany': 'DE',
    'france': 'FR', 'italy': 'IT', 'spain': 'ES', 'brazil': 'BR',
    'mexico': 'MX', 'japan': 'JP', 'south korea': 'KR', 'nigeria': 'NG',
    'egypt': 'EG', 'south africa': 'ZA', 'kenya': 'KE', 'ghana': 'GH',
    'indonesia': 'ID', 'thailand': 'TH', 'vietnam': 'VN', 'philippines': 'PH',
    'malaysia': 'MY', 'singapore': 'SG', 'poland': 'PL', 'turkey': 'TR',
    'netherlands': 'NL', 'belgium': 'BE', 'sweden': 'SE', 'norway': 'NO',
    'denmark': 'DK', 'finland': 'FI', 'portugal': 'PT', 'greece': 'GR',
    'romania': 'RO', 'czech': 'CZ', 'hungary': 'HU', 'austria': 'AT',
    'switzerland': 'CH', 'ireland': 'IE', 'new zealand': 'NZ', 'argentina': 'AR',
    'colombia': 'CO', 'chile': 'CL', 'peru': 'PE', 'venezuela': 'VE',
    'pakistan': 'PK', 'bangladesh': 'BD', 'sri lanka': 'LK', 'afghanistan': 'AF',
    'iran': 'IR', 'iraq': 'IQ', 'saudi': 'SA', 'united arab': 'AE',
    'israel': 'IL', 'lebanon': 'LB', 'jordan': 'JO', 'syria': 'SY',
    'yemen': 'YE', 'oman': 'OM', 'kuwait': 'KW', 'qatar': 'QA',
    'bahrain': 'BH', 'ethiopia': 'ET', 'tanzania': 'TZ', 'uganda': 'UG',
    'algeria': 'DZ', 'morocco': 'MA', 'tunisia': 'TN', 'libya': 'LY',
    'sudan': 'SD', 'somalia': 'SO', 'senegal': 'SN', 'mali': 'ML',
    'niger': 'NE', 'burkina': 'BF', 'ivory coast': 'CI', 'cameroon': 'CM',
    'congo': 'CG', 'angola': 'AO', 'mozambique': 'MZ', 'madagascar': 'MG',
    'zambia': 'ZM', 'zimbabwe': 'ZW', 'botswana': 'BW', 'namibia': 'NA',
    'mauritius': 'MU', 'latvia': 'LV', 'lithuania': 'LT', 'estonia': 'EE',
    'belarus': 'BY', 'moldova': 'MD', 'armenia': 'AM', 'georgia': 'GE',
    'azerbaijan': 'AZ', 'uzbekistan': 'UZ', 'turkmenistan': 'TM', 'tajikistan': 'TJ',
    'kyrgyzstan': 'KG', 'mongolia': 'MN', 'taiwan': 'TW', 'hong kong': 'HK',
    'cambodia': 'KH', 'laos': 'LA', 'myanmar': 'MM', 'nepal': 'NP',
    'bhutan': 'BT', 'albania': 'AL', 'bosnia': 'BA', 'croatia': 'HR',
    'serbia': 'RS', 'montenegro': 'ME', 'slovenia': 'SI', 'slovakia': 'SK',
    'bulgaria': 'BG', 'macedonia': 'MK', 'cyprus': 'CY', 'malta': 'MT',
    'iceland': 'IS', 'luxembourg': 'LU', 'andorra': 'AD', 'monaco': 'MC',
    'panama': 'PA', 'costa rica': 'CR', 'nicaragua': 'NI', 'honduras': 'HN',
    'guatemala': 'GT', 'el salvador': 'SV', 'belize': 'BZ', 'jamaica': 'JM',
    'trinidad': 'TT', 'bahamas': 'BS', 'barbados': 'BB', 'dominican': 'DO',
    'cuba': 'CU', 'haiti': 'HT', 'uruguay': 'UY', 'paraguay': 'PY',
    'bolivia': 'BO', 'ecuador': 'EC', 'guyana': 'GY'
  };

  const lowerName = countryName.toLowerCase();
  for (const [key, code] of Object.entries(codeMap)) {
    if (lowerName.includes(key)) {
      return code;
    }
  }
  
  return countryName.substring(0, 2).toUpperCase();
};

export default function AllCountriesPage() {
  const navigate = useNavigate();
  const [countries, setCountries] = useState<Country[]>([]);
  const [isLoadingCountries, setIsLoadingCountries] = useState(true);
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [price, setPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [userBalance, setUserBalance] = useState<number>(0);
  const [isLoadingBalance, setIsLoadingBalance] = useState(true);
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');
  const [countrySearchQuery, setCountrySearchQuery] = useState('');
  const [isCountryDropdownOpen, setIsCountryDropdownOpen] = useState(false);
  const [isServiceDropdownOpen, setIsServiceDropdownOpen] = useState(false);
  
  const countryDropdownRef = useRef<HTMLDivElement>(null);
  const serviceDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchCountries();
    fetchUserBalance();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target as Node)) {
        setIsCountryDropdownOpen(false);
        setCountrySearchQuery('');
      }
      if (serviceDropdownRef.current && !serviceDropdownRef.current.contains(event.target as Node)) {
        setIsServiceDropdownOpen(false);
        setServiceSearchQuery('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchCountries = async () => {
    try {
      setIsLoadingCountries(true);
      const response = await api.getCountries();
      setCountries(response.data.countries);
    } catch (error) {
      toast.error('Failed to load countries');
      console.error('Error fetching countries:', error);
    } finally {
      setIsLoadingCountries(false);
    }
  };

  useEffect(() => {
    if (selectedCountry) {
      fetchServices();
    } else {
      setServices([]);
      setSelectedService(null);
    }
  }, [selectedCountry]);

  const fetchServices = async () => {
    if (!selectedCountry) return;
    
    try {
      setIsLoadingServices(true);
      const response = await api.getServicesByCountry(selectedCountry.id);
      
      if (response.success && response.data?.services && Array.isArray(response.data.services)) {
        setServices(response.data.services);
      } else {
        setServices([]);
      }
    } catch (error) {
      toast.error('Failed to load services for this country');
      console.error('Error fetching services:', error);
      setServices([]);
    } finally {
      setIsLoadingServices(false);
    }
  };

  const handleServiceSelect = (service: Service) => {
    setSelectedService(service);
    setPrice(null);
    setPriceError(null);
    setIsServiceDropdownOpen(false);
    setServiceSearchQuery('');
  };

  const handleCountrySelect = (country: Country) => {
    setSelectedCountry(country);
    setIsCountryDropdownOpen(false);
    setCountrySearchQuery('');
  };

  useEffect(() => {
    if (selectedCountry && selectedService) {
      fetchPrice();
    } else {
      setPrice(null);
      setPriceError(null);
    }
  }, [selectedCountry, selectedService]);

  const fetchPrice = async () => {
    if (!selectedCountry || !selectedService) return;

    try {
      setIsLoadingPrice(true);
      setPriceError(null);
      
      const response = await api.getServicePrice(selectedService.code, selectedCountry.id);
      
      if (response.success && response.data) {
        // Get the first country in the response (backend may return different country due to fallback logic)
        const countryIds = Object.keys(response.data);
        if (countryIds.length > 0) {
          const firstCountryData = response.data[countryIds[0]];
          if (firstCountryData && firstCountryData[selectedService.code]) {
            const costInNaira = firstCountryData[selectedService.code].cost;
            setPrice(costInNaira);
          } else {
            throw new Error('Price data not found');
          }
        } else {
          throw new Error('Price data not found');
        }
      } else {
        throw new Error('Invalid response');
      }
    } catch (error: any) {
      console.error('Error fetching price:', error);
      setPriceError('No price available for this service');
      setPrice(null);
    } finally {
      setIsLoadingPrice(false);
    }
  };

  const handleBuyNumber = async () => {
    if (!selectedCountry || !selectedService || isPurchasing || price === null) {
      return;
    }

    if (price > userBalance) {
      toast.error(
        `Insufficient balance. Required: ${formatNaira(price)}, Available: ${formatNaira(userBalance)}`,
        { duration: 6000 }
      );
      return;
    }
    
    try {
      setIsPurchasing(true);
      
      const response = await api.purchaseNumber(selectedService.code, selectedCountry.id);
      
      if (response.success) {
        const { purchased_number, balance } = response.data;
        
        setUserBalance(balance.current);
        
        toast.success(
          `Number purchased successfully! Phone: ${purchased_number.phone_number}`,
          { duration: 5000 }
        );
        
        navigate('/dashboard/numbers-history', {
          state: {
            newPurchase: purchased_number,
            balanceUpdate: balance
          }
        });
      }
    } catch (error: any) {
      console.error('Error purchasing number:', error);
      toast.error(error.message || 'Failed to purchase number. Please try again.');
    } finally {
      setIsPurchasing(false);
    }
  };

  const fetchUserBalance = async () => {
    try {
      setIsLoadingBalance(true);
      const response = await api.getBalance();
      setUserBalance(response.data.wallet_balance);
    } catch (error) {
      console.error('Error fetching user balance:', error);
    } finally {
      setIsLoadingBalance(false);
    }
  };

  const filteredServices = services.filter(service =>
    service.name.toLowerCase().includes(serviceSearchQuery.toLowerCase()) ||
    service.code.toLowerCase().includes(serviceSearchQuery.toLowerCase())
  );

  const filteredCountries = countries.filter(country =>
    country.name.toLowerCase().includes(countrySearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#0A0D0B] p-3 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-4 sm:mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
            <h1 className="text-lg sm:text-2xl font-bold text-[#EAF2ED]">
              All Countries 🌍
            </h1>
            {!isLoadingBalance && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 bg-[#1B241D] rounded-lg border border-[#24352A]">
                <span className="text-[10px] sm:text-xs text-[#8CA398]">Balance:</span>
                <span className="text-xs sm:text-sm font-semibold text-[#16C784]">{formatNaira(userBalance)}</span>
              </div>
            )}
          </div>
          <p className="text-xs text-[#8CA398]">
            Select a country and service to purchase a phone number for SMS verification
          </p>
        </div>

        {/* Step 1: Select Country */}
        <div className="bg-gradient-to-br from-[#0B8055] to-[#0EA968] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 mb-4 shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm sm:text-lg font-bold">
              1
            </div>
            <h2 className="text-base sm:text-xl font-bold text-white">Select Country</h2>
          </div>

          {isLoadingCountries ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-white" />
            </div>
          ) : (
            <>
              {!selectedCountry ? (
                <div className="relative" ref={countryDropdownRef}>
                  {/* Dropdown Button */}
                  <button
                    onClick={() => setIsCountryDropdownOpen(!isCountryDropdownOpen)}
                    className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-left flex items-center justify-between text-white hover:bg-white/20 transition-all"
                  >
                    <span className="text-xs sm:text-sm">Choose a country...</span>
                    <ChevronDown className={cn(
                      "w-4 h-4 sm:w-5 sm:h-5 transition-transform",
                      isCountryDropdownOpen && "rotate-180"
                    )} />
                  </button>

                  {/* Dropdown Menu */}
                  {isCountryDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#111713] border border-[#24352A] rounded-lg sm:rounded-xl shadow-2xl z-50 max-h-[250px] sm:max-h-[350px] overflow-hidden flex flex-col">
                      {/* Search Input Inside Dropdown */}
                      <div className="p-2 sm:p-3 border-b border-[#24352A] sticky top-0 bg-[#111713]">
                        <div className="relative">
                          <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B8378]" />
                          <input
                            type="text"
                            placeholder="Search countries..."
                            value={countrySearchQuery}
                            onChange={(e) => setCountrySearchQuery(e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-[#1B241D] border border-[#24352A] rounded-lg text-base text-[#EAF2ED] placeholder:text-[#6B8378] focus:outline-none focus:ring-2 focus:ring-[#16C784]"
                            autoFocus
                          />
                        </div>
                      </div>

                      {/* Countries List */}
                      <div className="overflow-y-auto">
                        {filteredCountries.length > 0 ? (
                          filteredCountries.map((country) => (
                            <button
                              key={country.id}
                              onClick={() => handleCountrySelect(country)}
                              className="w-full text-left p-2.5 sm:p-3 border-b border-[#24352A] hover:bg-[#1B241D] transition-colors flex items-center gap-2"
                            >
                              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                                <span className="text-white text-[10px] sm:text-xs font-bold">{getCountryCode(country.name)}</span>
                              </div>
                              <div className="text-xs sm:text-sm text-[#EAF2ED] font-medium">
                                {country.name}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="p-6 sm:p-8 text-center">
                            <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#6B8378] mx-auto mb-2" />
                            <p className="text-xs sm:text-sm text-[#8CA398]">No countries found</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white/10 backdrop-blur-sm rounded-lg sm:rounded-xl p-2.5 sm:p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-pink-500 to-orange-500 flex items-center justify-center flex-shrink-0">
                      <span className="text-white text-[10px] sm:text-xs font-bold">{getCountryCode(selectedCountry.name)}</span>
                    </div>
                    <div>
                      <p className="text-white/70 text-[10px] mb-0.5">Selected Country</p>
                      <p className="text-white text-xs sm:text-sm font-semibold">{selectedCountry.name}</p>
                    </div>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedCountry(null);
                      setSelectedService(null);
                      setPrice(null);
                      setPriceError(null);
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
                {countries.length} countries available
              </p>
            </>
          )}
        </div>

        {/* Step 2: Select Service */}
        {selectedCountry && (
          <div className="bg-gradient-to-br from-[#0B8055] to-[#0EA968] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 mb-4 shadow-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-full bg-white/20 flex items-center justify-center text-white text-sm sm:text-lg font-bold">
                2
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white">Select Service</h2>
            </div>

            {isLoadingServices ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 sm:w-7 sm:h-7 animate-spin text-white" />
              </div>
            ) : (
              <>
                {!selectedService ? (
                  <div className="relative" ref={serviceDropdownRef}>
                    {/* Dropdown Button */}
                    <button
                      onClick={() => setIsServiceDropdownOpen(!isServiceDropdownOpen)}
                      className="w-full p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 text-left flex items-center justify-between text-white hover:bg-white/20 transition-all"
                    >
                      <span className="text-xs sm:text-sm">Choose a service...</span>
                      <ChevronDown className={cn(
                        "w-4 h-4 sm:w-5 sm:h-5 transition-transform",
                        isServiceDropdownOpen && "rotate-180"
                      )} />
                    </button>

                    {/* Dropdown Menu */}
                    {isServiceDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-[#111713] border border-[#24352A] rounded-lg sm:rounded-xl shadow-2xl z-50 max-h-[300px] sm:max-h-[400px] overflow-hidden flex flex-col">
                        {/* Search Input Inside Dropdown */}
                        <div className="p-2 sm:p-3 border-b border-[#24352A] sticky top-0 bg-[#111713]">
                          <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#6B8378]" />
                            <input
                              type="text"
                              placeholder="Search services..."
                              value={serviceSearchQuery}
                              onChange={(e) => setServiceSearchQuery(e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-full pl-8 sm:pl-9 pr-3 py-1.5 sm:py-2 bg-[#1B241D] border border-[#24352A] rounded-lg text-base text-[#EAF2ED] placeholder:text-[#6B8378] focus:outline-none focus:ring-2 focus:ring-[#16C784]"
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
                                className="w-full text-left p-2.5 sm:p-3 border-b border-[#24352A] hover:bg-[#1B241D] transition-colors"
                              >
                                <div className="text-xs sm:text-sm text-[#EAF2ED] font-medium">
                                  {service.name}
                                </div>
                                <div className="text-[10px] sm:text-xs text-[#6B8378] mt-0.5">
                                  {service.code}
                                </div>
                              </button>
                            ))
                          ) : (
                            <div className="p-6 sm:p-8 text-center">
                              <AlertCircle className="w-8 h-8 sm:w-10 sm:h-10 text-[#6B8378] mx-auto mb-2" />
                              <p className="text-xs sm:text-sm text-[#8CA398]">No services found</p>
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
                        setPrice(null);
                        setPriceError(null);
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
        )}

        {/* Step 3: Price & Purchase */}
        {selectedService && (
          <div className="bg-[#1B241D] border border-[#24352A] rounded-xl sm:rounded-2xl p-3.5 sm:p-5 shadow-xl">
            {/* Price Display */}
            {isLoadingPrice ? (
              <div className="bg-[#111713] border border-[#24352A] rounded-lg sm:rounded-xl p-3 sm:p-4 flex items-center justify-center mb-4">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 animate-spin text-[#16C784]" />
                <span className="ml-2 text-xs sm:text-sm text-[#EAF2ED]">Loading price...</span>
              </div>
            ) : priceError ? (
              <div className="bg-[#111713] border border-[#EF4444]/30 rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4">
                <div className="flex items-center gap-2 text-[#EF4444]">
                  <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                  <p className="text-xs sm:text-sm">{priceError}</p>
                </div>
              </div>
            ) : price !== null ? (
              <div className="bg-gradient-to-br from-[#16C784] to-[#0EA968] rounded-lg sm:rounded-xl p-3 sm:p-4 mb-4">
                <p className="text-[10px] sm:text-xs text-white/80 mb-0.5">Total Price</p>
                <p className="text-2xl sm:text-3xl font-bold text-white">{formatNaira(price)}</p>
              </div>
            ) : null}

            {/* Purchase Button */}
            <Button
              onClick={handleBuyNumber}
              disabled={isPurchasing || isLoadingPrice || !!priceError || price === null}
              className="w-full py-3 sm:py-4 bg-[#16C784] hover:bg-[#0EA968] text-white rounded-lg sm:rounded-xl text-sm sm:text-base font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {isPurchasing ? (
                <>
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                  Buy Number{price !== null ? ` - ${formatNaira(price)}` : ''}
                </>
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}