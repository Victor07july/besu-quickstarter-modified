"use client";
import { useState, useEffect } from "react";
import { ConnectPublicClient } from "./client";

interface BlockchainInfo {
    blockNumber: bigint | null;
    chainId: number | null;
    gasPrice: bigint | null;
    isConnected: boolean;
}

export default function BlockchainTest() {
    const [info, setInfo] = useState<BlockchainInfo>({
        blockNumber: null,
        chainId: null,
        gasPrice: null,
        isConnected: false,
    });
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    async function testBlockchainConnection() {
        setIsLoading(true);
        setError(null);

        try {
            const publicClient = ConnectPublicClient();

            // Test blockchain connectivity by fetching various data
            const [blockNumber, chainId, gasPrice] = await Promise.all([
                publicClient.getBlockNumber(),
                publicClient.getChainId(),
                publicClient.getGasPrice(),
            ]);

            setInfo({
                blockNumber,
                chainId,
                gasPrice,
                isConnected: true,
            });

        } catch (err: any) {
            setError(`Connection failed: ${err.message}`);
            setInfo({
                blockNumber: null,
                chainId: null,
                gasPrice: null,
                isConnected: false,
            });
        } finally {
            setIsLoading(false);
        }
    }

    // Auto-test connection on component mount
    useEffect(() => {
        testBlockchainConnection();
    }, []);

    return (
        <div className="p-6 bg-gradient-to-br from-emerald-900 to-teal-900 rounded-lg shadow-xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">Blockchain Test</h2>
            
            <div className="space-y-4">
                {/* Connection Status */}
                <div className={`p-4 rounded-lg border ${
                    info.isConnected 
                        ? 'bg-green-900/30 border-green-500/50' 
                        : 'bg-red-900/30 border-red-500/50'
                }`}>
                    <div className="flex items-center justify-center mb-2">
                        <div className={`w-3 h-3 rounded-full mr-2 ${
                            info.isConnected ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <span className={`font-medium ${
                            info.isConnected ? 'text-green-200' : 'text-red-200'
                        }`}>
                            {info.isConnected ? 'Connected' : 'Disconnected'}
                        </span>
                    </div>
                </div>

                {/* Blockchain Info */}
                {info.isConnected && (
                    <div className="space-y-3">
                        <div className="p-3 bg-white/10 rounded-lg">
                            <p className="text-white text-sm">
                                <strong>Chain ID:</strong> {info.chainId}
                            </p>
                        </div>
                        
                        <div className="p-3 bg-white/10 rounded-lg">
                            <p className="text-white text-sm">
                                <strong>Block Number:</strong> {info.blockNumber?.toString()}
                            </p>
                        </div>
                        
                        <div className="p-3 bg-white/10 rounded-lg">
                            <p className="text-white text-sm">
                                <strong>Gas Price:</strong> {info.gasPrice ? (Number(info.gasPrice) / 1e9).toFixed(2) : 'N/A'} Gwei
                            </p>
                        </div>
                    </div>
                )}

                {/* Error Display */}
                {error && (
                    <div className="p-3 bg-red-900/30 border border-red-500/50 rounded-lg">
                        <p className="text-red-200 text-sm">{error}</p>
                    </div>
                )}

                {/* Test Button */}
                <button
                    onClick={testBlockchainConnection}
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 disabled:from-gray-600 disabled:to-gray-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 disabled:scale-100 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Testing..." : "Test Connection"}
                </button>
            </div>
        </div>
    );
}
