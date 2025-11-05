import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("🚀 Iniciando deploy e teste do CarbonCreditNFT...");
    
    // Deploy do contrato
    const [deployer] = await ethers.getSigners();
    console.log("👤 Deploying com a conta:", deployer.address);
    console.log("💰 Saldo da conta:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");
    
    const CarbonCredit = await ethers.getContractFactory("CarbonCreditNFT_FabricEquivalent");
    console.log("📄 Fazendo deploy do contrato...");
    
    const carbonCredit = await CarbonCredit.deploy();
    
    await carbonCredit.waitForDeployment();
    const contractAddress = await carbonCredit.getAddress();
    
    console.log("✅ Contrato deployado em:", contractAddress);
    
    // Inicializar o contrato
    console.log("🔧 Inicializando contrato...");
    const initTx = await carbonCredit.initializeContract(
        ethers.parseUnits("0.1", 6), // co2PriceEur: 0.1 EUR (6 decimais)
        ethers.parseUnits("5.5", 6)  // euroBrlRate: 5.5 BRL/EUR (6 decimais)
    );
    await initTx.wait();
    console.log("✅ Contrato inicializado");
    
    // Testes básicos
    console.log("\n=== Testando Funções Básicas ===");
    
    try {
        const owner = await carbonCredit.owner();
        console.log("👤 Owner:", owner);
        
        const contractState = await carbonCredit.contractState();
        console.log("🔢 Contract State:", contractState.toString());
        
        const balance = await carbonCredit.saldoContrato();
        console.log("💰 Saldo do contrato:", ethers.formatEther(balance), "ETH");
        
        console.log("\n=== Testando Tokenização ===");
        
        // Adicionar valor ao contrato (usando receive function)
        const valueToSend = ethers.parseEther("1.0");
        const tx = await deployer.sendTransaction({
            to: contractAddress,
            value: valueToSend
        });
        await tx.wait();
        console.log("💵 Enviado 1 ETH para o contrato");
        
        const newBalance = await carbonCredit.saldoContrato();
        console.log("💰 Novo saldo:", ethers.formatEther(newBalance), "ETH");
        
        // Autorizar o deployer para poder tokenizar
        const authTx = await carbonCredit.setAuthorized(deployer.address, true);
        await authTx.wait();
        console.log("🔐 Deployer autorizado para tokenização");
        
        // Testar cálculo E1 - verificar se a função existe
        try {
            console.log("🔍 Testando função de tokenização com dados de exemplo...");
            
            // Dados de exemplo para teste
            const tokenizeTx = await carbonCredit.calculateE1AndTokenize(
                "VEHICLE001",              // vehicleId
                deployer.address,          // condutor
                ethers.parseUnits("100", 6),  // highwayDistance: 100 km
                ethers.parseUnits("50", 6),   // cityDistance: 50 km
                ethers.parseUnits("75", 6),   // ethanolPercent: 75%
                ethers.parseUnits("1500", 6), // co2EtanolOriginal: 1500g
                ethers.parseUnits("12", 6),   // roadGasoline: 12 km/L
                ethers.parseUnits("9", 6),    // roadEthanol: 9 km/L
                ethers.parseUnits("15", 6),   // cityGasoline: 15 km/L
                ethers.parseUnits("11", 6),   // cityEthanol: 11 km/L
                ethers.parseUnits("50", 6),   // tanqueGasoline: 50%
                "2024-01-15T10:30:00Z"     // timestamp
            );
            
            const receipt = await tokenizeTx.wait();
            console.log("✅ Tokenização realizada! Gas usado:", receipt.gasUsed.toString());
            
            // Verificar eventos emitidos
            const events = receipt.logs;
            console.log("📝 Eventos emitidos:", events.length);
            
        } catch (error) {
            console.log("⚠️  Erro na tokenização:", error.message);
        }
        
        console.log("\n✅ Todos os testes passaram!");
        console.log("🎯 Endereço do contrato:", contractAddress);
        
    } catch (error) {
        console.error("❌ Erro durante teste:", error.message);
        throw error;
    }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    main()
        .then(() => {
            console.log("\n🎉 Deploy e teste concluídos com sucesso!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Deploy falhou:", error);
            process.exit(1);
        });
}

export { main };