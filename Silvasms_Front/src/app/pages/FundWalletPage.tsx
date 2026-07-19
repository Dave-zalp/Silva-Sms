import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { 
  Wallet, 
  Building2,
  Copy,
  CheckCircle2,
  Loader2,
  Info,
  CreditCard,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { toast } from 'sonner@2.0.3';
import { api, VirtualAccount } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

export default function FundWalletPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [virtualAccount, setVirtualAccount] = useState<VirtualAccount | null>(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateAccount = async () => {
    try {
      setIsGenerating(true);
      const response = await api.generateVirtualAccount();
      
      if (response.success) {
        setVirtualAccount(response.data.virtual_account);
        
        // Show success message based on whether it was created or already exists
        if (response.message.includes('created')) {
          toast.success('Virtual account created successfully!');
        } else {
          toast.success('Virtual account loaded successfully!');
        }
      }
    } catch (error: any) {
      console.error('Error generating virtual account:', error);
      toast.error(error.message || 'Failed to generate virtual account');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyAccountNumber = () => {
    if (virtualAccount?.account_number) {
      navigator.clipboard.writeText(virtualAccount.account_number);
      setCopied(true);
      toast.success('Account number copied to clipboard!');
      
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handlePaymentConfirmation = () => {
    toast.success('Thank you! Your payment will reflect shortly.');
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-[#0A0D0B] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Balance Card - Prominent Display */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0B8055] via-[#0B8055] to-[#0B2018] p-6 sm:p-8 shadow-2xl">
          {/* Radial glow overlay */}
          <div className="absolute inset-0 opacity-50" style={{
            background: 'radial-gradient(ellipse at 80% 50%, rgba(99,179,237,0.15) 0%, transparent 60%)'
          }}></div>
          
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-6 h-6 text-white" />
              <span className="text-white/65 text-sm sm:text-base">Wallet Balance</span>
            </div>
            <div className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white mb-4">
              ₦{user?.balance ? parseFloat(user.balance).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '0.00'}
            </div>
            <p className="text-white/55 text-sm">
              Fund your wallet to purchase virtual phone numbers
            </p>
          </div>
        </div>

        {/* Main Content Area */}
        {!virtualAccount ? (
          /* Generate Virtual Account Card */
          <div className="bg-[#1B241D] rounded-xl shadow-2xl border border-[#24352A] overflow-hidden">
            <div className="bg-[#111713] p-6 sm:p-8 border-b border-[#24352A]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#16C784] to-[#0EA968] rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#EAF2ED]">Virtual Account</h2>
                  <p className="text-sm text-[#8CA398]">Get your dedicated account number</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-12">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#111713] rounded-2xl flex items-center justify-center mx-auto border border-[#24352A]">
                  <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#16C784]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#EAF2ED]">
                    Generate Your Account
                  </h3>
                  <p className="text-[#8CA398]">
                    Get a unique virtual account number to fund your wallet instantly via bank transfer
                  </p>
                </div>

                <Button
                  onClick={handleGenerateAccount}
                  disabled={isGenerating}
                  className="w-full max-w-sm h-14 sm:h-16 bg-[#16C784] hover:bg-[#0EA968] text-white text-base sm:text-lg font-semibold shadow-xl rounded-xl transition-all"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                      Generate Account Now
                    </>
                  )}
                </Button>

                <div className="pt-4">
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#111713] rounded-lg border border-[#24352A]">
                    <Info className="w-4 h-4 text-[#16C784]" />
                    <p className="text-xs text-[#8CA398]">
                      This account is unique to you
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Virtual Account Details */
          <div className="space-y-6">
            {/* Account Details Card */}
            <div className="bg-[#1B241D] rounded-xl shadow-2xl border border-[#16C784]/30 overflow-hidden">
              <div className="bg-[#111713] p-6 sm:p-8 border-b border-[#24352A]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#16C784] to-[#0EA968] rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#EAF2ED]">Active Account</h2>
                      <p className="text-sm text-[#8CA398]">Transfer to fund instantly</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateAccount}
                    disabled={isGenerating}
                    variant="ghost"
                    size="sm"
                    className="text-[#16C784] hover:bg-[#111713]"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      'Refresh'
                    )}
                  </Button>
                </div>
              </div>

              <div className="p-6 sm:p-8 space-y-6">
                {/* Info Alert */}
                <div className="flex items-start gap-3 p-4 bg-[#111713] rounded-xl border border-[#24352A]">
                  <Info className="w-5 h-5 text-[#16C784] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#8CA398]">
                    Transfer any amount to this account and your wallet will be credited automatically within minutes
                  </p>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  {/* Bank Name */}
                  <div className="bg-[#111713] rounded-xl p-5 border border-[#24352A]">
                    <p className="text-xs text-[#6B8378] mb-2 uppercase tracking-wide">Bank Name</p>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[#16C784]" />
                      <p className="text-lg font-semibold text-[#EAF2ED]">{virtualAccount.bank_name}</p>
                    </div>
                  </div>

                  {/* Account Number - Highlight */}
                  <div className="bg-gradient-to-br from-[#16C784] to-[#0EA968] rounded-xl p-5 shadow-lg">
                    <p className="text-xs text-white/70 mb-3 uppercase tracking-wide">Account Number</p>
                    <div className="flex items-center justify-between gap-3 bg-white/10 backdrop-blur-sm rounded-xl p-4">
                      <p className="text-2xl sm:text-3xl font-mono font-bold text-white tracking-wider">
                        {virtualAccount.account_number}
                      </p>
                      <Button
                        onClick={handleCopyAccountNumber}
                        size="sm"
                        className={`flex-shrink-0 transition-all ${
                          copied 
                            ? 'bg-green-500 hover:bg-green-600 text-white' 
                            : 'bg-white/20 hover:bg-white/30 text-white border border-white/30'
                        }`}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="w-4 h-4 mr-1.5" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="w-4 h-4 mr-1.5" />
                            Copy
                          </>
                        )}
                      </Button>
                    </div>
                  </div>

                  {/* Account Name */}
                  <div className="bg-[#111713] rounded-xl p-5 border border-[#24352A]">
                    <p className="text-xs text-[#6B8378] mb-2 uppercase tracking-wide">Account Name</p>
                    <p className="text-lg font-semibold text-[#EAF2ED]">{virtualAccount.account_name}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handlePaymentConfirmation}
                  className="w-full h-14 sm:h-16 bg-gradient-to-r from-[#16C784] to-[#0EA968] hover:from-[#0EA968] hover:to-[#15803D] text-white text-base sm:text-lg font-semibold shadow-xl rounded-xl transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  I Have Made This Payment
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                </Button>
                
                <p className="text-xs text-center text-[#6B8378]">
                  Your payment will reflect in your wallet within 5 minutes
                </p>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Benefits */}
              <div className="bg-[#1B241D] rounded-xl p-5 shadow-lg border border-[#24352A]">
                <h3 className="text-base font-semibold text-[#EAF2ED] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#16C784]" />
                  Benefits
                </h3>
                <ul className="space-y-2.5 text-sm text-[#8CA398]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16C784] flex-shrink-0 mt-0.5" />
                    <span>No transfer fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16C784] flex-shrink-0 mt-0.5" />
                    <span>Instant auto-credit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16C784] flex-shrink-0 mt-0.5" />
                    <span>Funds never expire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#16C784] flex-shrink-0 mt-0.5" />
                    <span>Minimum: ₦100</span>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div className="bg-[#111713] rounded-xl p-5 shadow-lg border border-[#24352A]">
                <h3 className="text-base font-semibold text-[#EAF2ED] mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#F59E0B]" />
                  Need Help?
                </h3>
                <p className="text-sm text-[#8CA398] mb-4">
                  If your payment doesn't reflect within 10 minutes, contact support.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#24352A] text-[#8CA398] hover:bg-[#1B241D] hover:text-[#EAF2ED]"
                  onClick={() => toast.info('Support feature coming soon!')}
                >
                  Contact Support
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}