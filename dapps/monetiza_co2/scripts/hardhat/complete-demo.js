import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("🌱 === SISTEMA DE TOKENIZAÇÃO DE CRÉDITOS DE CARBONO ===\n");
    
    // 1. Deploy do contrato
    console.log("📦 1. FAZENDO DEPLOY DO CONTRATO");
    const [deployer, user1] = await ethers.getSigners();
    console.log("👤 Deployer:", deployer.address);
    console.log("👤 User1:", user1.address);
    
    const CarbonCredit = await ethers.getContractFactory("CarbonCreditNFT_FabricEquivalent");
    const carbonCredit = await CarbonCredit.deploy();
    await carbonCredit.waitForDeployment();
    const contractAddress = await carbonCredit.getAddress();
    
    console.log("✅ Contrato deployado:", contractAddress);
    
    // 2. Inicialização
    console.log("\n🔧 2. INICIALIZANDO CONTRATO");
    const initTx = await carbonCredit.initializeContract(
        ethers.parseUnits("0.1", 6), // CO2 price: 0.1 EUR
        ethers.parseUnits("5.5", 6)  // EUR/BRL: 5.5
    );
    await initTx.wait();
    console.log("✅ Parâmetros configurados: CO2=0.1 EUR, EUR/BRL=5.5");
    
    // 3. Adicionar fundos
    console.log("\n💰 3. ADICIONANDO FUNDOS AO CONTRATO");
    const fundTx = await deployer.sendTransaction({
        to: contractAddress,
        value: ethers.parseEther("2.0")
    });
    await fundTx.wait();
    const balance = await carbonCredit.saldoContrato();
    console.log("✅ Fundos adicionados:", ethers.formatEther(balance), "ETH");
    
    // 4. Autorizar usuários
    console.log("\n🔐 4. AUTORIZANDO USUÁRIOS");
    await carbonCredit.setAuthorized(deployer.address, true);
    await carbonCredit.setAuthorized(user1.address, true);
    console.log("✅ Deployer e User1 autorizados");
    
    // 5. Primeira tokenização
    console.log("\n🌿 5. PRIMEIRA TOKENIZAÇÃO - Viagem Eficiente");
    const tokenize1 = await carbonCredit.calculateE1AndTokenize(
        "VEH001",                     // Vehicle ID
        user1.address,                // Condutor
        ethers.parseUnits("200", 6),  // Highway: 200km
        ethers.parseUnits("100", 6),  // City: 100km
        ethers.parseUnits("80", 6),   // Ethanol: 80%
        ethers.parseUnits("2000", 6), // CO2 original: 2000g
        ethers.parseUnits("14", 6),   // Road gasoline: 14 km/L
        ethers.parseUnits("10", 6),   // Road ethanol: 10 km/L
        ethers.parseUnits("16", 6),   // City gasoline: 16 km/L
        ethers.parseUnits("12", 6),   // City ethanol: 12 km/L
        ethers.parseUnits("30", 6),   // Tank gasoline: 30%
        "2024-01-15T08:30:00Z"        // Timestamp
    );
    await tokenize1.wait();
    console.log("✅ Token 1 criado para User1");
    
    // 6. Segunda tokenização
    console.log("\n🌿 6. SEGUNDA TOKENIZAÇÃO - Viagem Urbana");
    const tokenize2 = await carbonCredit.calculateE1AndTokenize(
        "VEH002",                     // Vehicle ID
        deployer.address,             // Condutor
        ethers.parseUnits("50", 6),   // Highway: 50km
        ethers.parseUnits("150", 6),  // City: 150km
        ethers.parseUnits("90", 6),   // Ethanol: 90%
        ethers.parseUnits("1800", 6), // CO2 original: 1800g
        ethers.parseUnits("13", 6),   // Road gasoline: 13 km/L
        ethers.parseUnits("9", 6),    // Road ethanol: 9 km/L
        ethers.parseUnits("17", 6),   // City gasoline: 17 km/L
        ethers.parseUnits("13", 6),   // City ethanol: 13 km/L
        ethers.parseUnits("25", 6),   // Tank gasoline: 25%
        "2024-01-15T14:45:00Z"        // Timestamp
    );
    await tokenize2.wait();
    console.log("✅ Token 2 criado para Deployer");
    
    // 7. Verificar resultados
    console.log("\n📊 7. RESULTADOS FINAIS");
    
    const finalBalance = await carbonCredit.saldoContrato();
    console.log("💰 Saldo final do contrato:", ethers.formatEther(finalBalance), "ETH");
    
    const user1Tokens = await carbonCredit.balanceOf(user1.address);
    const deployerTokens = await carbonCredit.balanceOf(deployer.address);
    
    console.log("🎨 NFTs criados:");
    console.log("  - User1:", user1Tokens.toString(), "tokens");
    console.log("  - Deployer:", deployerTokens.toString(), "tokens");
    
    // 8. Verificar eventos
    console.log("\n📝 8. HISTÓRICO DE TRANSAÇÕES");
    const filter = carbonCredit.filters.Transfer();
    const events = await carbonCredit.queryFilter(filter);
    
    console.log(`📋 Total de transfers: ${events.length}`);
    events.forEach((event, index) => {
        const { from, to, tokenId } = event.args;
        const isCreation = from === "0x0000000000000000000000000000000000000000";
        if (isCreation) {
            console.log(`  🆕 Token ${tokenId} criado para ${to.slice(0, 8)}...`);
        }
    });
    
    console.log("\n🎉 === DEMONSTRAÇÃO COMPLETA ===");
    console.log("✅ Contrato deployado e funcional");
    console.log("✅ Sistema de autorização ativo");
    console.log("✅ Tokenização de créditos de carbono operacional");
    console.log("✅ NFTs criados com base em economia de CO2");
    console.log("✅ Sistema equivalente ao chaincode Fabric implementado");
    
    return {
        contractAddress,
        totalTokens: events.length,
        contractBalance: ethers.formatEther(finalBalance)
    };
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    main()
        .then((result) => {
            console.log(`\n📋 RESUMO:`);
            console.log(`🏠 Contrato: ${result.contractAddress}`);
            console.log(`🎨 Tokens: ${result.totalTokens}`);
            console.log(`💰 Saldo: ${result.contractBalance} ETH`);
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Erro na demonstração:", error);
            process.exit(1);
        });
}

export { main };