import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("🚀 Iniciando deploy do CarbonCreditNFT_Fabric...");
    
    // Obter contas
    const [deployer] = await ethers.getSigners();
    console.log("📝 Deploying com a conta:", deployer.address);
    
    // Verificar saldo
    const balance = await deployer.provider.getBalance(deployer.address);
    console.log("💰 Saldo da conta:", ethers.formatEther(balance), "ETH");
    
    // Parâmetros do contrato
    const carbonPriceEUR = process.env.CARBON_PRICE_EUR || "50000000"; // 50 EUR/ton (6 decimais)
    const cotacaoEurBRL = process.env.EUR_BRL_RATE || "6000000";       // 6.0 BRL/EUR (6 decimais)
    
    console.log("\n=== Parâmetros do Deploy ===");
    console.log("💵 Carbon Price EUR:", carbonPriceEUR, "(50 EUR/ton)");
    console.log("💱 Cotação EUR/BRL:", cotacaoEurBRL, "(6.0 BRL/EUR)");
    
    try {
        // Deploy do contrato
        console.log("\n📦 Fazendo deploy do contrato...");
        const CarbonCreditFactory = await ethers.getContractFactory("CarbonCreditNFT_FabricEquivalent");
        const carbonCredit = await CarbonCreditFactory.deploy();
        
        // Aguardar deploy
        await carbonCredit.waitForDeployment();
        const contractAddress = await carbonCredit.getAddress();
        
        console.log("✅ Contrato deployado em:", contractAddress);
        
        // Inicializar o contrato
        console.log("\n⚙️  Inicializando contrato...");
        const initTx = await carbonCredit.initializeContract(carbonPriceEUR, cotacaoEurBRL);
        await initTx.wait();
        console.log("✅ Contrato inicializado com sucesso!");
        
        // Autorizar o deployer para tokenizar (equivalente ao INMETROMSP)
        console.log("\n🔐 Autorizando deployer para tokenizar...");
        const authTx = await carbonCredit.setAuthorized(deployer.address, true);
        await authTx.wait();
        console.log("✅ Deployer autorizado!");
        
        // Enviar ETH para o contrato (para pagar recompensas)
        const fundAmount = process.env.FUND_AMOUNT || "1.0"; // 1 ETH por padrão
        console.log(`\n💸 Enviando ${fundAmount} ETH para o contrato...`);
        const fundTx = await deployer.sendTransaction({
            to: contractAddress,
            value: ethers.parseEther(fundAmount)
        });
        await fundTx.wait();
        console.log("✅ Contrato financiado!");
        
        // Verificar estado final
        console.log("\n=== Estado Final do Contrato ===");
        const contractState = await carbonCredit.getContractState();
        const saldo = await carbonCredit.saldoContrato();
        const isAuthorized = await carbonCredit.authorized(deployer.address);
        const owner = await carbonCredit.owner();
        
        console.log("🏠 Endereço do contrato:", contractAddress);
        console.log("👤 Owner:", owner);
        console.log("🔢 Next Token ID:", contractState.nextTokenId.toString());
        console.log("💵 Carbon Price EUR:", contractState.carbonPriceEUR.toString());
        console.log("💱 Cotação EUR/BRL:", contractState.cotacaoEuroBRL.toString());
        console.log("✅ Inicializado:", contractState.initialized);
        console.log("🔐 Deployer autorizado:", isAuthorized);
        console.log("💰 Saldo do contrato:", ethers.formatEther(saldo), "ETH");
        
        // Salvar informações de deploy
        const deployInfo = {
            contractAddress: contractAddress,
            deployer: deployer.address,
            network: (await deployer.provider.getNetwork()).name,
            chainId: (await deployer.provider.getNetwork()).chainId.toString(),
            carbonPriceEUR: carbonPriceEUR,
            cotacaoEurBRL: cotacaoEurBRL,
            fundAmount: fundAmount,
            deployedAt: new Date().toISOString(),
            txHash: carbonCredit.deploymentTransaction()?.hash
        };
        
        console.log("\n=== Informações de Deploy ===");
        console.log(JSON.stringify(deployInfo, null, 2));
        
        // Instruções de uso
        console.log("\n=== Próximos Passos ===");
        console.log("1. Para autorizar outros endereços:");
        console.log(`   await carbonCredit.setAuthorized("0xADDRESS", true)`);
        
        console.log("\n2. Para tokenizar créditos de carbono:");
        console.log(`   await carbonCredit.calculateE1AndTokenize(`);
        console.log(`     "VEH001",                    // vehicleId`);
        console.log(`     "0xCONDUTOR_ADDRESS",        // condutor`);
        console.log(`     100000000,                   // 100 km highway`);
        console.log(`     50000000,                    // 50 km city`);
        console.log(`     27000000,                    // 27% ethanol`);
        console.log(`     15000000000,                 // 15 kg CO2 original`);
        console.log(`     15000000,                    // 15 km/L road gasoline`);
        console.log(`     10000000,                    // 10 km/L road ethanol`);
        console.log(`     12000000,                    // 12 km/L city gasoline`);
        console.log(`     8000000,                     // 8 km/L city ethanol`);
        console.log(`     73000000,                    // 73% gasoline`);
        console.log(`     "2024-01-01T10:00:00Z"       // timestamp`);
        console.log(`   )`);
        
        console.log("\n3. Para atualizar cotações:");
        console.log(`   await carbonCredit.updateCotacoes(newCarbonPriceEUR, newEurBrlRate)`);
        
        return {
            contract: carbonCredit,
            address: contractAddress,
            deployInfo: deployInfo
        };
        
    } catch (error) {
        console.error("❌ Erro durante o deploy:", error);
        throw error;
    }
}

// Executar deploy
if (process.argv[1] === new URL(import.meta.url).pathname) {
    main()
        .then(() => {
            console.log("\n🎉 Deploy concluído com sucesso!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Deploy falhou:", error);
            process.exit(1);
        });
}

export { main };
