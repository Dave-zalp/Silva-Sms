import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { 
  DollarSign, 
  TrendingUp, 
  Save, 
  RefreshCw,
  AlertCircle,
  Loader2,
  Power,
  Server
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api, formatApiError } from '../utils/api';
import type { AdminSettings, UpdateAdminSettingsError, ProviderToggleError } from '../utils/api';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [originalSettings, setOriginalSettings] = useState<AdminSettings | null>(null);
  
  // SMS Activate settings
  const [smsActivateExcRate, setSmsActivateExcRate] = useState('');
  const [smsActivateTopUp, setSmsActivateTopUp] = useState('');
  
  // SMS Bus settings
  const [smsBusExcRate, setSmsBusExcRate] = useState('');
  const [smsBusTopUp, setSmsBusTopUp] = useState('');

  // Provider toggle states
  const [smsBusEnabled, setSmsBusEnabled] = useState(true);
  const [heroSmsEnabled, setHeroSmsEnabled] = useState(true);
  const [isTogglingSmsBus, setIsTogglingSmsBus] = useState(false);
  const [isTogglingHeroSms, setIsTogglingHeroSms] = useState(false);

  // Fetch settings on mount
  useEffect(() => {
    fetchSettings();
    fetchProviderStatus();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const response = await api.getAdminSettings();
      
      if (response.success) {
        const settings = response.data;
        setOriginalSettings(settings);
        setSmsActivateExcRate(settings.sms_activate_exc_rate);
        setSmsActivateTopUp(settings.sms_activate_top_up);
        setSmsBusExcRate(settings.sms_bus_exc_rate);
        setSmsBusTopUp(settings.sms_bus_top_up);
      }
    } catch (error: any) {
      toast.error(formatApiError(error));
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProviderStatus = async () => {
    try {
      const response = await api.getProviderStatus();
      
      if (response.success) {
        // Find the servers and get their globally_enabled status
        const smsBusServer = response.data.servers.find(s => s.key === 'smsbus');
        const heroSmsServer = response.data.servers.find(s => s.key === 'herosms');
        
        if (smsBusServer) {
          setSmsBusEnabled(smsBusServer.globally_enabled);
        }
        if (heroSmsServer) {
          setHeroSmsEnabled(heroSmsServer.globally_enabled);
        }
      }
    } catch (error: any) {
      console.error('Error fetching provider status:', error);
    }
  };

  const handleSave = async () => {
    // Validate inputs
    const smsActivateExcRateNum = parseFloat(smsActivateExcRate);
    const smsActivateTopUpNum = parseFloat(smsActivateTopUp);
    const smsBusExcRateNum = parseFloat(smsBusExcRate);
    const smsBusTopUpNum = parseFloat(smsBusTopUp);

    if (isNaN(smsActivateExcRateNum) || smsActivateExcRateNum <= 0) {
      toast.error('Please enter a valid SMS Activate exchange rate');
      return;
    }

    if (isNaN(smsActivateTopUpNum) || smsActivateTopUpNum < 0) {
      toast.error('Please enter a valid SMS Activate top-up rate');
      return;
    }

    if (isNaN(smsBusExcRateNum) || smsBusExcRateNum <= 0) {
      toast.error('Please enter a valid SMS Bus exchange rate');
      return;
    }

    if (isNaN(smsBusTopUpNum) || smsBusTopUpNum < 0) {
      toast.error('Please enter a valid SMS Bus top-up rate');
      return;
    }

    try {
      setIsSaving(true);
      
      const response = await api.updateAdminSettings({
        sms_activate_exc_rate: smsActivateExcRateNum,
        sms_activate_top_up: smsActivateTopUpNum,
        sms_bus_exc_rate: smsBusExcRateNum,
        sms_bus_top_up: smsBusTopUpNum,
      });
      
      if (response.success) {
        const settings = response.data;
        setOriginalSettings(settings);
        setSmsActivateExcRate(settings.sms_activate_exc_rate);
        setSmsActivateTopUp(settings.sms_activate_top_up);
        setSmsBusExcRate(settings.sms_bus_exc_rate);
        setSmsBusTopUp(settings.sms_bus_top_up);
        toast.success(response.message || 'Settings updated successfully');
      }
    } catch (error: any) {
      const apiError = error as UpdateAdminSettingsError;
      toast.error(formatApiError(apiError));
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    if (originalSettings) {
      setSmsActivateExcRate(originalSettings.sms_activate_exc_rate);
      setSmsActivateTopUp(originalSettings.sms_activate_top_up);
      setSmsBusExcRate(originalSettings.sms_bus_exc_rate);
      setSmsBusTopUp(originalSettings.sms_bus_top_up);
      toast.info('Settings reset to saved values');
    }
  };

  const toggleProvider = async (provider: 'smsbus' | 'herosms', enabled: boolean) => {
    try {
      if (provider === 'smsbus') {
        setIsTogglingSmsBus(true);
      } else {
        setIsTogglingHeroSms(true);
      }

      const response = await api.toggleProvider({ provider, enabled });
      
      if (response.success) {
        if (provider === 'smsbus') {
          setSmsBusEnabled(enabled);
        } else {
          setHeroSmsEnabled(enabled);
        }
        toast.success(response.message || 'Server toggled successfully');
      }
    } catch (error: any) {
      const apiError = error as ProviderToggleError;
      toast.error(formatApiError(apiError));
    } finally {
      if (provider === 'smsbus') {
        setIsTogglingSmsBus(false);
      } else {
        setIsTogglingHeroSms(false);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
            <p className="text-sm text-gray-600 dark:text-gray-400">Loading settings...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 bg-gray-50 dark:bg-gray-950 min-h-screen">
      {/* Mobile Header */}
      <div className="lg:hidden mb-4">
        <h1 className="text-xl text-black dark:text-white mb-1">Settings</h1>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Manage platform settings
        </p>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:block mb-6 lg:mb-8">
        <h1 className="text-2xl lg:text-3xl text-black dark:text-white mb-2">Settings</h1>
        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-400">
          Configure platform-wide exchange rates and top-up percentages
        </p>
      </div>

      {/* Info Alert */}
      <Card className="border border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950/30 mb-4 lg:mb-6">
        <CardContent className="p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              These settings control the exchange rates and top-up percentages for both SMS Activate and SMS Bus providers. Changes will take effect immediately for all new transactions.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Provider Toggle Section */}
      <div className="mb-6">
        <h2 className="text-lg text-black dark:text-white mb-3">Server Management</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* Server 1 (SMSBus) Toggle */}
          <Card className={`border border-gray-200 dark:border-gray-800 ${smsBusEnabled ? 'bg-white dark:bg-[#1E2A45]' : 'bg-gray-100 dark:bg-gray-900'}`}>
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${smsBusEnabled ? 'bg-blue-50 dark:bg-blue-950/30' : 'bg-gray-200 dark:bg-gray-800'}`}>
                    <Server className={`w-5 h-5 ${smsBusEnabled ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg text-black dark:text-white">Server 1</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Enable or disable Server 1 globally
                    </CardDescription>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  smsBusEnabled 
                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                }`}>
                  {smsBusEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {smsBusEnabled 
                    ? 'Server 1 is currently enabled for all users. Click below to disable it globally.' 
                    : 'Server 1 is currently disabled. Users cannot access this server. Click below to enable it.'}
                </p>
                <Button
                  onClick={() => toggleProvider('smsbus', !smsBusEnabled)}
                  disabled={isTogglingSmsBus}
                  className={`w-full ${
                    smsBusEnabled 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {isTogglingSmsBus ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2" />
                      {smsBusEnabled ? 'Disable Server 1' : 'Enable Server 1'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Server 2 (HeroSMS) Toggle */}
          <Card className={`border border-gray-200 dark:border-gray-800 ${heroSmsEnabled ? 'bg-white dark:bg-[#1E2A45]' : 'bg-gray-100 dark:bg-gray-900'}`}>
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${heroSmsEnabled ? 'bg-purple-50 dark:bg-purple-950/30' : 'bg-gray-200 dark:bg-gray-800'}`}>
                    <Server className={`w-5 h-5 ${heroSmsEnabled ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400'}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg text-black dark:text-white">Server 2</CardTitle>
                    <CardDescription className="text-xs sm:text-sm">
                      Enable or disable Server 2 globally
                    </CardDescription>
                  </div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                  heroSmsEnabled 
                    ? 'bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-400' 
                    : 'bg-red-100 dark:bg-red-950/30 text-red-700 dark:text-red-400'
                }`}>
                  {heroSmsEnabled ? 'Enabled' : 'Disabled'}
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {heroSmsEnabled 
                    ? 'Server 2 is currently enabled for all users. Click below to disable it globally.' 
                    : 'Server 2 is currently disabled. Users cannot access this server. Click below to enable it.'}
                </p>
                <Button
                  onClick={() => toggleProvider('herosms', !heroSmsEnabled)}
                  disabled={isTogglingHeroSms}
                  className={`w-full ${
                    heroSmsEnabled 
                      ? 'bg-red-600 hover:bg-red-700' 
                      : 'bg-green-600 hover:bg-green-700'
                  } text-white`}
                >
                  {isTogglingHeroSms ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Power className="w-4 h-4 mr-2" />
                      {heroSmsEnabled ? 'Disable Server 2' : 'Enable Server 2'}
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SMS Activate Settings */}
      <div className="mb-6">
        <h2 className="text-lg text-black dark:text-white mb-3">SMS Activate Provider</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* SMS Activate Exchange Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-50 dark:bg-green-950/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Exchange Rate</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Dollar to Naira conversion rate for SMS Activate
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsActivateExcRate" className="text-black dark:text-white">
                    Exchange Rate (₦/$)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      ₦
                    </span>
                    <Input
                      id="smsActivateExcRate"
                      type="number"
                      placeholder="1600"
                      value={smsActivateExcRate}
                      onChange={(e) => setSmsActivateExcRate(e.target.value)}
                      className="pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This rate will be used to calculate SMS Activate costs in Naira
                  </p>
                </div>

                {/* Preview */}
                {smsActivateExcRate && parseFloat(smsActivateExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{parseFloat(smsActivateExcRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(smsActivateExcRate) * 5).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(smsActivateExcRate) * 10).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SMS Activate Top-Up Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-950/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Top-Up Percentage</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Additional charge percentage for SMS Activate
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsActivateTopUp" className="text-black dark:text-white">
                    Top-Up Percentage (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="smsActivateTopUp"
                      type="number"
                      placeholder="0"
                      value={smsActivateTopUp}
                      onChange={(e) => setSmsActivateTopUp(e.target.value)}
                      className="pr-8"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Additional percentage added to SMS Activate prices
                  </p>
                </div>

                {/* Preview */}
                {smsActivateTopUp && parseFloat(smsActivateTopUp) >= 0 && smsActivateExcRate && parseFloat(smsActivateExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview (with top-up)</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsActivateExcRate) * (1 + parseFloat(smsActivateTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsActivateExcRate) * 5 * (1 + parseFloat(smsActivateTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsActivateExcRate) * 10 * (1 + parseFloat(smsActivateTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* SMS Bus Settings */}
      <div className="mb-6">
        <h2 className="text-lg text-black dark:text-white mb-3">SMS Bus Provider</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
          {/* SMS Bus Exchange Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                  <DollarSign className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Exchange Rate</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Dollar to Naira conversion rate for SMS Bus
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsBusExcRate" className="text-black dark:text-white">
                    Exchange Rate (₦/$)
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      ₦
                    </span>
                    <Input
                      id="smsBusExcRate"
                      type="number"
                      placeholder="1600"
                      value={smsBusExcRate}
                      onChange={(e) => setSmsBusExcRate(e.target.value)}
                      className="pl-8"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    This rate will be used to calculate SMS Bus costs in Naira
                  </p>
                </div>

                {/* Preview */}
                {smsBusExcRate && parseFloat(smsBusExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{parseFloat(smsBusExcRate).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(smsBusExcRate) * 5).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 USD</span>
                        <span className="text-black dark:text-white">= ₦{(parseFloat(smsBusExcRate) * 10).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* SMS Bus Top-Up Rate */}
          <Card className="border border-gray-200 dark:border-gray-800">
            <CardHeader className="border-b border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-orange-50 dark:bg-orange-950/30 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
                <div>
                  <CardTitle className="text-base sm:text-lg text-black dark:text-white">Top-Up Percentage</CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    Additional charge percentage for SMS Bus
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="smsBusTopUp" className="text-black dark:text-white">
                    Top-Up Percentage (%)
                  </Label>
                  <div className="relative">
                    <Input
                      id="smsBusTopUp"
                      type="number"
                      placeholder="0"
                      value={smsBusTopUp}
                      onChange={(e) => setSmsBusTopUp(e.target.value)}
                      className="pr-8"
                      min="0"
                      max="100"
                      step="0.1"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-400">
                      %
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Additional percentage added to SMS Bus prices
                  </p>
                </div>

                {/* Preview */}
                {smsBusTopUp && parseFloat(smsBusTopUp) >= 0 && smsBusExcRate && parseFloat(smsBusExcRate) > 0 && (
                  <div className="rounded-lg bg-gray-50 dark:bg-gray-900 p-4 border border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">Preview (with top-up)</p>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$1.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsBusExcRate) * (1 + parseFloat(smsBusTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$5.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsBusExcRate) * 5 * (1 + parseFloat(smsBusTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-gray-400">$10.00 base</span>
                        <span className="text-black dark:text-white">
                          = ₦{(parseFloat(smsBusExcRate) * 10 * (1 + parseFloat(smsBusTopUp) / 100)).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Action Buttons */}
      <Card className="border border-gray-200 dark:border-gray-800">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isSaving}
              className="w-full sm:w-auto"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Reset to Saved
            </Button>
            <Button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Information Section */}
      <Card className="border border-gray-200 dark:border-gray-800 mt-4 lg:mt-6">
        <CardHeader className="border-b border-gray-200 dark:border-gray-800">
          <CardTitle className="text-base sm:text-lg text-black dark:text-white">How These Settings Work</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4 text-sm text-gray-600 dark:text-gray-400">
            <div>
              <h4 className="font-medium text-black dark:text-white mb-2">Exchange Rates</h4>
              <p>
                Each provider has its own exchange rate that converts USD prices to Naira (₦). When a service returns prices in USD, 
                they will be converted using the respective provider's rate. A higher rate means users pay more in Naira for the same service.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-black dark:text-white mb-2">Top-Up Percentages</h4>
              <p>
                The top-up percentage is an additional markup applied to each provider's prices after exchange rate conversion. 
                For example, if a service costs $1.00, with an exchange rate of ₦1,600 and a 10% top-up, the final price would be ₦1,760.
              </p>
            </div>
            <div className="rounded-lg bg-yellow-50 dark:bg-yellow-950/30 p-3 border border-yellow-200 dark:border-yellow-900">
              <p className="text-yellow-900 dark:text-yellow-100">
                <strong>Important:</strong> Changes take effect immediately for all new transactions. Make sure to test the settings 
                carefully before making significant changes to avoid pricing errors.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}