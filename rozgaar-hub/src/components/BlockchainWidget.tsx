import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, ShieldCheck, RefreshCw, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export function BlockchainWidget() {
  const [isConnected, setIsConnected] = useState(false);
  const [account, setAccount] = useState("");
  const [balance, setBalance] = useState("0");
  const [network, setNetwork] = useState("");
  const [loading, setLoading] = useState(false);

  // Check if wallet is already connected
  useEffect(() => {
    checkConnection();

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', checkConnection);
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', checkConnection);
      }
    };
  }, []);

  const checkConnection = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setIsConnected(true);
          setAccount(accounts[0]);
          fetchBalance(accounts[0]);
          fetchNetwork();
        } else {
          setIsConnected(false);
          setAccount("");
        }
      } catch (error) {
        console.error("Error checking connection:", error);
      }
    }
  };

  const fetchBalance = async (address: string) => {
    if (window.ethereum) {
      try {
        const balanceHex = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [address, 'latest'],
        });
        // Convert wei to eth (simple conversion)
        const balanceWei = parseInt(balanceHex, 16);
        const balanceEth = (balanceWei / 1e18).toFixed(4);
        setBalance(balanceEth);
      } catch (error) {
        console.error("Error fetching balance:", error);
      }
    }
  };

  const fetchNetwork = async () => {
    if (window.ethereum) {
      try {
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        // Map common chain IDs
        const networks: Record<string, string> = {
          '0x1': 'Ethereum Mainnet',
          '0x89': 'Polygon Mainnet',
          '0x13881': 'Mumbai Testnet',
          '0x539': 'Localhost', // 1337
          '0x7a69': 'Localhost', // 31337 (Hardhat)
        };
        setNetwork(networks[chainId] || `Chain ID: ${chainId}`);
      } catch (error) {
        console.error("Error fetching network:", error);
      }
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        setLoading(true);
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setIsConnected(true);
        setAccount(accounts[0]);
        fetchBalance(accounts[0]);
        fetchNetwork();
        toast.success("Wallet connected successfully!");
      } catch (error: any) {
        toast.error(error.message || "Failed to connect wallet");
      } finally {
        setLoading(false);
      }
    } else {
      toast.error("Please install MetaMask to use blockchain features");
      window.open("https://metamask.io/download/", "_blank");
    }
  };

  const disconnectWallet = () => {
    // MetaMask doesn't have a programmatic disconnect
    // We just clear local state
    setIsConnected(false);
    setAccount("");
    setBalance("0");
    toast.info("Wallet disconnected from dashboard");
  };

  const formatAddress = (addr: string) => {
    return `${addr.substring(0, 6)}...${addr.substring(addr.length - 4)}`;
  };

  return (
    <Card className="h-full border-primary/20 bg-primary/5">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <ShieldCheck className="h-5 w-5 text-primary" />
          Blockchain Status
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!isConnected ? (
          <div className="flex flex-col items-center justify-center py-6 text-center">
            <div className="bg-background p-3 rounded-full mb-4 shadow-sm">
              <Wallet className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-1">Connect Wallet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Secure payments with Ethereum
            </p>
            <Button
              onClick={connectWallet}
              disabled={loading}
              className="w-full gradient-saffron text-white"
            >
              {loading ? "Connecting..." : "Connect MetaMask"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-background rounded-lg border shadow-sm">
              <div className="text-xs text-muted-foreground mb-1">Connected Account</div>
              <div className="font-mono font-medium flex items-center justify-between">
                {formatAddress(account)}
                <a
                  href={`https://etherscan.io/address/${account}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:text-primary/80"
                >
                  <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-background rounded-lg border shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Balance</div>
                <div className="font-bold text-lg">{balance} <span className="text-xs font-normal text-muted-foreground">ETH</span></div>
              </div>
              <div className="p-3 bg-background rounded-lg border shadow-sm">
                <div className="text-xs text-muted-foreground mb-1">Network</div>
                <div className="font-medium text-sm truncate" title={network}>{network}</div>
              </div>
            </div>

            <div className="pt-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                  System Operational
                </span>
                <button onClick={() => fetchBalance(account)} className="hover:text-primary">
                  <RefreshCw className="h-3 w-3" />
                </button>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={disconnectWallet}
                className="w-full text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                Disconnect
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Add window type definition
declare global {
  interface Window {
    ethereum?: any;
  }
}
