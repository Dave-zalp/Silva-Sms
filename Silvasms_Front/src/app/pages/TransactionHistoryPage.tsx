import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { 
  Search, 
  Filter,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  CreditCard,
  Loader2,
  AlertCircle,
  RefreshCcw
} from 'lucide-react';
import { api, Transaction } from '../utils/api';
import { toast } from 'sonner@2.0.3';
import { formatNaira } from '../utils/formatters';

export default function TransactionHistoryPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      console.log('Fetching transactions...');
      console.log('Auth token:', api.getToken() ? 'Present' : 'Missing');
      console.log('User:', api.getUser());
      
      setIsLoading(true);
      setError(null);
      
      const response = await api.getTransactions();
      console.log('Transactions response:', response);
      
      if (response.success) {
        // Use data.numbers instead of data.transactions
        setTransactions(response.data.numbers || []);
        console.log('Transactions set:', response.data.numbers?.length || 0, 'items');
      }
    } catch (error: any) {
      console.error('Error fetching transactions:', error);
      const errorMessage = error.message || 'Failed to load transaction history';
      setError(errorMessage);
      setTransactions([]); // Set to empty array on error
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Ensure transactions is always an array before filtering
  const filteredTransactions = (transactions || []).filter(tx =>
    tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tx.reference.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getTypeIcon = (type: string) => {
    const normalizedType = type.toLowerCase();
    
    if (normalizedType.includes('deposit') || normalizedType.includes('credit') || normalizedType.includes('refund')) {
      return <ArrowDownRight className="w-4 h-4 text-green-600 dark:text-green-400" />;
    } else if (normalizedType.includes('purchase') || normalizedType.includes('debit') || normalizedType.includes('withdrawal')) {
      return <ArrowUpRight className="w-4 h-4 text-red-600 dark:text-red-400" />;
    } else {
      return <DollarSign className="w-4 h-4 text-gray-600 dark:text-gray-400" />;
    }
  };

  const getTypeBadge = (type: string) => {
    const normalizedType = type.toLowerCase();
    
    if (normalizedType.includes('deposit') || normalizedType.includes('credit')) {
      return (
        <Badge className="bg-green-100 dark:bg-green-950/20 text-green-700 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-950/20">
          Deposit
        </Badge>
      );
    } else if (normalizedType.includes('purchase') || normalizedType.includes('debit')) {
      return (
        <Badge className="bg-[#16C784]/10 dark:bg-blue-950/20 text-[#16C784] dark:text-blue-400 hover:bg-[#16C784]/10 dark:hover:bg-blue-950/20">
          Purchase
        </Badge>
      );
    } else if (normalizedType.includes('refund')) {
      return (
        <Badge className="bg-orange-100 dark:bg-orange-950/20 text-orange-700 dark:text-orange-400 hover:bg-orange-100 dark:hover:bg-orange-950/20">
          Refund
        </Badge>
      );
    } else if (normalizedType.includes('referral') || normalizedType.includes('bonus')) {
      return (
        <Badge className="bg-purple-100 dark:bg-purple-950/20 text-purple-700 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-950/20">
          Bonus
        </Badge>
      );
    } else {
      return (
        <Badge className="bg-gray-100 dark:bg-gray-950/20 text-gray-700 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-950/20">
          {type}
        </Badge>
      );
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const dateOnly = date.toLocaleDateString();
    const todayOnly = today.toLocaleDateString();
    const yesterdayOnly = yesterday.toLocaleDateString();

    if (dateOnly === todayOnly) {
      return {
        date: 'Today',
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } else if (dateOnly === yesterdayOnly) {
      return {
        date: 'Yesterday',
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    } else {
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        time: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    }
  };

  // Calculate totals - with safety checks
  const totalDeposits = (transactions || [])
    .filter(tx => tx && tx.type?.toLowerCase() === 'credit')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  const totalSpent = (transactions || [])
    .filter(tx => tx && tx.type?.toLowerCase() === 'debit')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  const totalRefunds = (transactions || [])
    .filter(tx => tx && tx.type?.toLowerCase() === 'refund')
    .reduce((sum, tx) => sum + parseFloat(tx.amount || '0'), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A0D0B] via-[#111713] to-[#1B241D] p-3 sm:p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-4 sm:mb-6 md:mb-8 p-4 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl bg-gradient-to-r from-[#0B8055] via-[#0B8055] to-[#0B2018] shadow-lg sm:shadow-xl shadow-blue-500/20 dark:shadow-blue-900/30">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl text-white mb-1 sm:mb-2">Transaction History</h1>
            <p className="text-xs sm:text-sm md:text-base text-blue-100 dark:text-blue-200">
              View all your wallet transactions
            </p>
          </div>
          <Button
            onClick={fetchTransactions}
            variant="secondary"
            size="sm"
            className="bg-white/20 hover:bg-white/30 text-white border-white/20 dark:bg-white/10 dark:hover:bg-white/20 w-full sm:w-auto"
            disabled={isLoading}
          >
            <RefreshCcw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      {!isLoading && !error && transactions.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 sm:mb-6 md:mb-8">
          <Card className="border border-blue-100 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-green-50 dark:bg-green-950/30">
                  <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-0.5">Total Deposits</p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-white">{formatNaira(totalDeposits)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-[#16C784]/10 dark:bg-blue-950/30">
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-[#16C784] dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-0.5">Total Spent</p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-white">{formatNaira(totalSpent)}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow sm:col-span-2 md:col-span-1">
            <CardContent className="p-3 sm:p-4 md:p-6">
              <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
                <div className="p-2 sm:p-2.5 md:p-3 rounded-lg sm:rounded-xl bg-purple-50 dark:bg-purple-950/30">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-0.5">Refunds & Bonuses</p>
                  <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-900 dark:text-white">{formatNaira(totalRefunds)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filter */}
      <div className="mb-4 sm:mb-6 flex flex-col sm:flex-row gap-2 sm:gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 dark:text-gray-500" />
          <Input
            placeholder="Search transactions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 sm:pl-10 text-sm sm:text-base border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 dark:text-white dark:placeholder:text-gray-400 h-9 sm:h-10"
            disabled={isLoading}
          />
        </div>
        <Button 
          variant="outline" 
          className="border-2 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700 h-9 sm:h-10 text-sm sm:text-base" 
          disabled={isLoading}
        >
          <Filter className="w-4 h-4 mr-2" />
          Filter
        </Button>
      </div>

      {/* Transactions Table */}
      <Card className="border-0 dark:border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg sm:shadow-xl overflow-hidden">
        <div className="h-1 bg-gradient-to-r from-[#16C784] via-[#0EA968] to-[#0B8055]"></div>
        <CardHeader className="border-b border-blue-100 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-transparent dark:from-blue-950/30 dark:to-transparent p-3 sm:p-4 md:p-6">
          <CardTitle className="text-gray-900 dark:text-white text-base sm:text-lg md:text-xl">
            All Transactions {transactions.length > 0 && `(${transactions.length})`}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="w-10 h-10 text-[#16C784] animate-spin mb-3" />
              <p className="text-gray-600 dark:text-gray-400">Loading transactions...</p>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 px-4">
              <AlertCircle className="w-12 h-12 text-orange-400 dark:text-orange-500 mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-center">{error}</p>
              <Button 
                onClick={fetchTransactions}
                className="bg-gradient-to-r from-[#16C784] to-[#0EA968] hover:from-[#0EA968] hover:to-[#0B8055] text-white"
              >
                <RefreshCcw className="w-4 h-4 mr-2" />
                Try Again
              </Button>
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-16 px-4">
              <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400 mb-2">No transactions yet</p>
              <p className="text-sm text-gray-500 dark:text-gray-500">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-pink-50 to-purple-50 dark:from-pink-950/30 dark:to-purple-950/30 border-b border-pink-100 dark:border-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-700 dark:text-gray-400">Type</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-700 dark:text-gray-400">Description</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-700 dark:text-gray-400">Date & Time</th>
                      <th className="px-6 py-3 text-left text-xs tracking-wider text-gray-700 dark:text-gray-400">Reference</th>
                      <th className="px-6 py-3 text-right text-xs tracking-wider text-gray-700 dark:text-gray-400">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {filteredTransactions.map((tx) => {
                      const { date, time } = formatDate(tx.created_at);
                      const amount = parseFloat(tx.amount);
                      // For debit transactions, show as negative
                      const displayAmount = tx.type.toLowerCase() === 'debit' ? -amount : amount;
                      
                      return (
                        <tr key={tx.id} className="hover:bg-gradient-to-r hover:from-pink-50/50 hover:to-purple-50/50 dark:hover:from-pink-950/20 dark:hover:to-purple-950/20 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-2">
                              {getTypeIcon(tx.type)}
                              {getTypeBadge(tx.type)}
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <div className="text-gray-900 dark:text-white">{tx.description}</div>
                          </td>
                          <td className="px-6 py-4 text-gray-600 dark:text-gray-300">
                            <div>{date}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">{time}</div>
                          </td>
                          <td className="px-6 py-4">
                            <code className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-2 py-1 rounded">
                              {tx.reference}
                            </code>
                          </td>
                          <td className={`px-6 py-4 text-right ${
                            displayAmount > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {displayAmount > 0 ? '+' : ''}{formatNaira(displayAmount)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card View */}
              <div className="lg:hidden divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((tx) => {
                  const { date, time } = formatDate(tx.created_at);
                  const amount = parseFloat(tx.amount);
                  // For debit transactions, show as negative
                  const displayAmount = tx.type.toLowerCase() === 'debit' ? -amount : amount;
                  
                  return (
                    <div key={tx.id} className="p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                      {/* Type & Date Row */}
                      <div className="flex items-start justify-between mb-2 sm:mb-3 gap-2">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                          <div className="flex-shrink-0">
                            {getTypeIcon(tx.type)}
                          </div>
                          <div className="flex-shrink-0">
                            {getTypeBadge(tx.type)}
                          </div>
                        </div>
                        <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 text-right flex-shrink-0">
                          <div className="whitespace-nowrap">{date}</div>
                          <div className="text-gray-500 dark:text-gray-400 whitespace-nowrap">{time}</div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="mb-2 sm:mb-3">
                        <p className="text-sm sm:text-base text-gray-900 dark:text-white leading-snug">{tx.description}</p>
                      </div>

                      {/* Reference & Amount Row */}
                      <div className="flex items-end justify-between pt-2 sm:pt-3 border-t border-gray-100 dark:border-gray-700 gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Reference</p>
                          <code className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-1.5 sm:px-2 py-1 rounded block break-all">
                            {tx.reference}
                          </code>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</p>
                          <p className={`text-base sm:text-lg font-semibold whitespace-nowrap ${
                            displayAmount > 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {displayAmount > 0 ? '+' : ''}{formatNaira(displayAmount)}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {filteredTransactions.length === 0 && searchQuery && (
                <div className="text-center py-12 px-4">
                  <DollarSign className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">No transactions found matching your search.</p>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}