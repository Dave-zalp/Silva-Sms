import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { api, ProviderServer } from '../utils/api';
import { toast } from 'sonner@2.0.3';

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

interface ProviderContextType {
  activeProvider: 'smsbus' | 'herosms' | null;
  servers: ProviderServer[];
  isLoading: boolean;
  switchProvider: (provider: 'smsbus' | 'herosms') => Promise<void>;
  refreshProviderStatus: () => Promise<void>;
}

const ProviderContext = createContext<ProviderContextType | undefined>(undefined);

export function ProviderProvider({ children }: { children: ReactNode }) {
  const [activeProvider, setActiveProvider] = useState<'smsbus' | 'herosms' | null>(null);
  const [servers, setServers] = useState<ProviderServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProviderStatus = async () => {
    // Only fetch if user has a token (is authenticated)
    if (!api.getToken()) {
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.getProviderStatus();
      
      if (response.success) {
        setActiveProvider(response.data.active_provider);
        setServers(response.data.servers);
      }
    } catch (error: any) {
      console.error('Error fetching provider status:', error);
      // Don't show error toast on initial load - silently set defaults
      setActiveProvider(null);
      setServers([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSwitchProvider = async (provider: 'smsbus' | 'herosms') => {
    try {
      // Check if provider is globally enabled
      const providerServer = servers.find(s => s.key === provider);
      if (!providerServer?.globally_enabled) {
        toast.error('This server is currently unavailable');
        return;
      }

      const response = await api.switchProvider(provider);
      
      if ('success' in response && response.success) {
        setActiveProvider(response.active_provider);
        
        // Update servers to reflect the new active state
        setServers(prevServers =>
          prevServers.map(server => ({
            ...server,
            is_active: server.key === response.active_provider
          }))
        );

        if (response.active_provider === null) {
          toast.success('Provider deactivated');
        } else {
          toast.success(`Switched to ${getProviderDisplayName(provider)}`);
        }
      }
    } catch (error: any) {
      console.error('Error switching provider:', error);
      
      if (error.message) {
        toast.error(error.message);
      } else {
        toast.error('Failed to switch provider. Please try again.');
      }
    }
  };

  useEffect(() => {
    fetchProviderStatus();
  }, []);

  return (
    <ProviderContext.Provider
      value={{
        activeProvider,
        servers,
        isLoading,
        switchProvider: handleSwitchProvider,
        refreshProviderStatus: fetchProviderStatus,
      }}
    >
      {children}
    </ProviderContext.Provider>
  );
}

export function useProvider() {
  const context = useContext(ProviderContext);
  if (context === undefined) {
    throw new Error('useProvider must be used within a ProviderProvider');
  }
  return context;
}