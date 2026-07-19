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
    <div className="min-h-screen bg-[#0A0F1E] p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Balance Card - Prominent Display */}
        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-[#1D4ED8] via-[#1E40AF] to-[#0F2B6B] p-6 sm:p-8 shadow-2xl">
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
          <div className="bg-[#1E2A45] rounded-xl shadow-2xl border border-[#2A3A5C] overflow-hidden">
            <div className="bg-[#0F1729] p-6 sm:p-8 border-b border-[#2A3A5C]">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl flex items-center justify-center shadow-lg">
                  <CreditCard className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">Virtual Account</h2>
                  <p className="text-sm text-[#94A3B8]">Get your dedicated account number</p>
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-8 lg:p-12">
              <div className="max-w-md mx-auto text-center space-y-6">
                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#0F1729] rounded-2xl flex items-center justify-center mx-auto border border-[#2A3A5C]">
                  <Building2 className="w-10 h-10 sm:w-12 sm:h-12 text-[#3B82F6]" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">
                    Generate Your Account
                  </h3>
                  <p className="text-[#94A3B8]">
                    Get a unique virtual account number to fund your wallet instantly via bank transfer
                  </p>
                </div>

                <Button
                  onClick={handleGenerateAccount}
                  disabled={isGenerating}
                  className="w-full max-w-sm h-14 sm:h-16 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-base sm:text-lg font-semibold shadow-xl rounded-xl transition-all"
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
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F1729] rounded-lg border border-[#2A3A5C]">
                    <Info className="w-4 h-4 text-[#3B82F6]" />
                    <p className="text-xs text-[#94A3B8]">
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
            <div className="bg-[#1E2A45] rounded-xl shadow-2xl border border-[#22C55E]/30 overflow-hidden">
              <div className="bg-[#0F1729] p-6 sm:p-8 border-b border-[#2A3A5C]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-[#22C55E] to-[#16A34A] rounded-xl flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-[#F1F5F9]">Active Account</h2>
                      <p className="text-sm text-[#94A3B8]">Transfer to fund instantly</p>
                    </div>
                  </div>
                  <Button
                    onClick={handleGenerateAccount}
                    disabled={isGenerating}
                    variant="ghost"
                    size="sm"
                    className="text-[#22C55E] hover:bg-[#0F1729]"
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
                <div className="flex items-start gap-3 p-4 bg-[#0F1729] rounded-xl border border-[#2A3A5C]">
                  <Info className="w-5 h-5 text-[#3B82F6] flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-[#94A3B8]">
                    Transfer any amount to this account and your wallet will be credited automatically within minutes
                  </p>
                </div>

                {/* Account Details */}
                <div className="space-y-4">
                  {/* Bank Name */}
                  <div className="bg-[#0F1729] rounded-xl p-5 border border-[#2A3A5C]">
                    <p className="text-xs text-[#64748B] mb-2 uppercase tracking-wide">Bank Name</p>
                    <div className="flex items-center gap-3">
                      <Building2 className="w-5 h-5 text-[#3B82F6]" />
                      <p className="text-lg font-semibold text-[#F1F5F9]">{virtualAccount.bank_name}</p>
                    </div>
                  </div>

                  {/* Account Number - Highlight */}
                  <div className="bg-gradient-to-br from-[#3B82F6] to-[#2563EB] rounded-xl p-5 shadow-lg">
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
                  <div className="bg-[#0F1729] rounded-xl p-5 border border-[#2A3A5C]">
                    <p className="text-xs text-[#64748B] mb-2 uppercase tracking-wide">Account Name</p>
                    <p className="text-lg font-semibold text-[#F1F5F9]">{virtualAccount.account_name}</p>
                  </div>
                </div>

                {/* Action Button */}
                <Button
                  onClick={handlePaymentConfirmation}
                  className="w-full h-14 sm:h-16 bg-gradient-to-r from-[#22C55E] to-[#16A34A] hover:from-[#16A34A] hover:to-[#15803D] text-white text-base sm:text-lg font-semibold shadow-xl rounded-xl transition-all"
                >
                  <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 mr-2" />
                  I Have Made This Payment
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 ml-2" />
                </Button>
                
                <p className="text-xs text-center text-[#64748B]">
                  Your payment will reflect in your wallet within 5 minutes
                </p>
              </div>
            </div>

            {/* Additional Info Cards */}
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Benefits */}
              <div className="bg-[#1E2A45] rounded-xl p-5 shadow-lg border border-[#2A3A5C]">
                <h3 className="text-base font-semibold text-[#F1F5F9] mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-[#3B82F6]" />
                  Benefits
                </h3>
                <ul className="space-y-2.5 text-sm text-[#94A3B8]">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                    <span>No transfer fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                    <span>Instant auto-credit</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                    <span>Funds never expire</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                    <span>Minimum: ₦100</span>
                  </li>
                </ul>
              </div>

              {/* Support */}
              <div className="bg-[#0F1729] rounded-xl p-5 shadow-lg border border-[#2A3A5C]">
                <h3 className="text-base font-semibold text-[#F1F5F9] mb-3 flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#F59E0B]" />
                  Need Help?
                </h3>
                <p className="text-sm text-[#94A3B8] mb-4">
                  If your payment doesn't reflect within 10 minutes, contact support.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full border-[#2A3A5C] text-[#94A3B8] hover:bg-[#1E2A45] hover:text-[#F1F5F9]"
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