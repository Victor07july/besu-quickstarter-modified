import WalletButton from "./walletButton";
import BlockchainTest from "./blockchainTest";

export default function Home() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
            <div className="container mx-auto max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                        Blockchain Test DApp
                    </h1>
                    <p className="text-xl text-gray-300">
                        Connect to the blockchain and explore Web3 functionality
                    </p>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 justify-center">
                    {/* Blockchain Connection Test */}
                    <div className="col-span-1">
                        <BlockchainTest />
                    </div>

                    {/* Wallet Connection */}
                    <div className="col-span-1">
                        <WalletButton />
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-16">
                    <p className="text-gray-400 text-sm">
                        Built with Next.js, TypeScript, Viem.sh, and Tailwind CSS
                    </p>
                </div>
            </div>
        </div>
    );
}