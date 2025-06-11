"use client";
import { useState } from "react";
import { ConnectWalletClient, ConnectPublicClient } from "./client";

export default function WalletButton() {
    //State variables for address & balance
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<BigInt>(BigInt(0));
    // Function requests connection and retrieves the address of wallet
    // Then it retrievies the balance of the address 
    // Finally it updates the value for address & balance variable
    async function handleClick() {
        try {
            // Instantiate a Wallet & Public Client
            const walletClient = ConnectWalletClient();
            const publicClient = ConnectPublicClient();
        
            // Performs Wallet Action to retrieve wallet address
            const [address] = await walletClient.getAddresses();
            
            // Performs Public Action to retrieve address balance
            const balance = await publicClient.getBalance({ address });
            // Update values for address & balance state variable
            setAddress(address);
            setBalance(balance);
        } catch (error) {
            // Error handling
            alert(`Transaction failed: ${error}`);
        }
    }
    return (
        <div className="p-6 bg-gradient-to-br from-purple-900 to-blue-900 rounded-lg shadow-xl max-w-md mx-auto">
            <h2 className="text-2xl font-bold text-white mb-4 text-center">Wallet Connection</h2>
            
            <button
                onClick={handleClick}
                className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 mb-4"
            >
                Connect Wallet
            </button>
            
            <Status address={address} balance={balance} />
        </div>
    );
}

function Status({
    address,
    balance,
}: {
    address: string | null;
    balance: BigInt;
}) {
    if (!address) {
        return (
            <div className="text-center p-4 bg-red-900/30 rounded-lg border border-red-500/50">
                <div className="w-3 h-3 bg-red-500 rounded-full mx-auto mb-2"></div>
                <p className="text-red-200 font-medium">Disconnected</p>
            </div>
        );
    }
    
    return (
        <div className="text-center p-4 bg-green-900/30 rounded-lg border border-green-500/50">
            <div className="w-3 h-3 bg-green-500 rounded-full mx-auto mb-2"></div>
            <p className="text-green-200 font-medium mb-2">Connected</p>
            <p className="text-white text-sm break-all mb-2">
                <strong>Address:</strong> {address}
            </p>
            <p className="text-white text-sm">
                <strong>Balance:</strong> {(Number(balance) / 1e18).toFixed(4)} ETH
            </p>
        </div>
    );
}