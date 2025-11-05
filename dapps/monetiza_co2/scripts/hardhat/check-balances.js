import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("💰 Verificando saldos das contas...\n");
    
    // Obter todas as contas
    const accounts = await ethers.getSigners();
    
    console.log("=== Saldos das Contas ===");
    for (let i = 0; i < Math.min(accounts.length, 10); i++) {
        const account = accounts[i];
        const balance = await account.provider.getBalance(account.address);
        console.log(`👤 Conta ${i}: ${account.address}`);
        console.log(`💰 Saldo: ${ethers.formatEther(balance)} ETH\n`);
    }
    
    // Se existir endereço do contrato, verificar saldo
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (contractAddress) {
        console.log("=== Saldo do Contrato ===");
        try {
            const CarbonCredit = await ethers.getContractAt("CarbonCreditNFT_FabricEquivalent", contractAddress);
            const contractBalance = await CarbonCredit.saldoContrato();
            const owner = await CarbonCredit.owner();
            const state = await CarbonCredit.getContractState();
            
            console.log(`🏠 Contrato: ${contractAddress}`);
            console.log(`👤 Owner: ${owner}`);
            console.log(`💰 Saldo: ${ethers.formatEther(contractBalance)} ETH`);
            console.log(`🔢 Próximo Token ID: ${state.nextTokenId}`);
            console.log(`✅ Inicializado: ${state.initialized}`);
        } catch (error) {
            console.log(`❌ Erro ao consultar contrato: ${error.message}`);
        }
    } else {
        console.log("ℹ️  Para verificar saldo do contrato, defina CONTRACT_ADDRESS");
    }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    main()
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

export { main };