import { useState } from 'react';
import { Server, ChevronDown, Check, Loader2 } from 'lucide-react';
import { useProvider } from '../contexts/ProviderContext';
import { cn } from './ui/utils';

// Map internal provider names to user-facing names
const getProviderDisplayName = (providerKey: string): string => {
  switch (providerKey) {
    case 'smsbus':
      return 'Server 1';
    case 'herosms':
      return 'Server 2';
    default:
      return 'Unknown Server';
  }
};

export default function ProviderSwitcher() {
  const { activeProvider, servers, isLoading, switchProvider } = useProvider();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const handleSwitch = async (providerKey: 'smsbus' | 'herosms') => {
    if (providerKey === activeProvider) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    await switchProvider(providerKey);
    setIsSwitching(false);
    setIsOpen(false);
  };

  const activeServer = servers.find(s => s.key === activeProvider);
  const displayName = activeServer ? getProviderDisplayName(activeServer.key) : 'Select Server';

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        disabled={isLoading || isSwitching}
        className="w-full bg-[#1E2A45] rounded-xl p-5 border border-[#2A3A5C] hover:border-[#3B82F6] hover:shadow-[0_0_0_1px_rgba(59,130,246,0.2)] transition-all text-left group disabled:opacity-50 disabled:cursor-not-allowed"
      >
        <div className="flex items-start justify-between mb-4">
          <div className="w-10 h-10 bg-[#8B5CF6] rounded-lg flex items-center justify-center">
            {isSwitching ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Server className="w-5 h-5 text-white" />
            )}
          </div>
          <ChevronDown 
            className={cn(
              "w-4 h-4 text-[#64748B] transition-transform",
              isOpen && "rotate-180"
            )} 
          />
        </div>
        <p className="text-[13px] text-[#94A3B8] mb-1">Active Server</p>
        <p className="text-2xl font-bold text-[#F1F5F9]">
          {isLoading ? '...' : displayName}
        </p>
        <p className="text-xs text-[#64748B] mt-1">
          {activeProvider ? 'Click to switch' : 'Select to begin'}
        </p>
      </button>

      {/* Dropdown Menu - Displays above the button */}
      {isOpen && !isLoading && (
        <div className="absolute bottom-full left-0 right-0 mb-2 bg-[#1E2A45] border border-[#2A3A5C] rounded-xl shadow-2xl overflow-hidden z-50">
          {servers.map((server) => (
            <button
              key={server.id}
              onClick={() => handleSwitch(server.key)}
              disabled={!server.globally_enabled || isSwitching}
              className={cn(
                "w-full px-5 py-4 flex items-center justify-between transition-all",
                server.globally_enabled
                  ? "hover:bg-[#0F1729] cursor-pointer"
                  : "opacity-50 cursor-not-allowed bg-[#0F1729]/50",
                server.is_active && "bg-[#0F1729]"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-8 h-8 rounded-lg flex items-center justify-center",
                  server.key === 'smsbus' ? "bg-[#059669]" : "bg-[#8B5CF6]"
                )}>
                  <Server className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <p className="text-sm font-semibold text-[#F1F5F9]">
                    {getProviderDisplayName(server.key)}
                  </p>
                  <p className="text-xs text-[#64748B]">
                    {server.globally_enabled 
                      ? (server.is_active ? 'Currently active' : 'Available')
                      : 'Unavailable'}
                  </p>
                </div>
              </div>
              {server.is_active && (
                <Check className="w-5 h-5 text-[#3B82F6]" />
              )}
            </button>
          ))}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
}