// client.ts

import { createWalletClient, createPublicClient, custom, http } from "viem";
import { polygonMumbai } from "viem/chains";
import "viem/window";

// Custom local blockchain configuration
const localChain = {
    id: 1337, // Local development chain ID
    name: 'Local Besu Network',
    network: 'local',
    nativeCurrency: {
        decimals: 18,
        name: 'Ether',
        symbol: 'ETH',
    },
    rpcUrls: {
        default: {
            http: ['http://localhost:8545'],
        },
        public: {
            http: ['http://localhost:8545'],
        },
    },
} as const;

export function ConnectWalletClient() {
    // Check for window.ethereum
    let transport;
    if (typeof window !== 'undefined' && window.ethereum) {
        transport = custom(window.ethereum);
    } else {
        // Fallback to HTTP transport for local development
        transport = http('http://localhost:8545');
    }
    
    // Declare a Wallet Client
    const walletClient = createWalletClient({
        chain: localChain, // Using local chain instead of polygonMumbai
        transport: transport,
    });
    
    return walletClient;
}

export function ConnectPublicClient() {
    // Check for window.ethereum
    let transport;
    if (typeof window !== 'undefined' && window.ethereum) {
        transport = custom(window.ethereum);
    } else {
        // Fallback to HTTP transport for local development
        transport = http('http://localhost:8545');
    }
    
    // Declare a Public Client
    const publicClient = createPublicClient({
        chain: localChain, // Using local chain instead of polygonMumbai
        transport: transport,
    });
    
    return publicClient;
}

