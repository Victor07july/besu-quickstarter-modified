import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log("🔍 Verificando estado final do contrato:", CONTRACT_ADDRESS);
    
    const [deployer] = await ethers.getSigners();
    const carbonCredit = await ethers.getContractAt("CarbonCreditNFT_FabricEquivalent", CONTRACT_ADDRESS);
    
    try {
        // Verificar estado do contrato
        const contractState = await carbonCredit.contractState();
        console.log("📊 Estado do contrato:");
        console.log("  - NextTokenId:", contractState[0].toString());
        console.log("  - CO2 Price EUR:", ethers.formatUnits(contractState[1], 6), "EUR");
        console.log("  - EUR/BRL Rate:", ethers.formatUnits(contractState[2], 6));
        console.log("  - Initialized:", contractState[3]);
        
        // Verificar saldo
        const balance = await carbonCredit.saldoContrato();
        console.log("\n💰 Saldo do contrato:", ethers.formatEther(balance), "ETH");
        
        // Verificar se o deployer tem NFTs
        const deployerBalance = await carbonCredit.balanceOf(deployer.address);
        console.log("🎨 NFTs do deployer:", deployerBalance.toString());
        
        if (deployerBalance > 0) {
            console.log("\n🏷️  Detalhes dos NFTs:");
            for (let i = 0; i < deployerBalance; i++) {
                const tokenId = await carbonCredit.tokenOfOwnerByIndex(deployer.address, i);
                console.log(`  - Token ID: ${tokenId}`);
                
                try {
                    const tokenURI = await carbonCredit.tokenURI(tokenId);
                    console.log(`  - Token URI: ${tokenURI}`);
                } catch (error) {
                    console.log(`  - Token URI: (não disponível)`);
                }
            }
        }
        
        // Verificar eventos recentes
        console.log("\n📝 Buscando eventos de Transfer...");
        const filter = carbonCredit.filters.Transfer();
        const events = await carbonCredit.queryFilter(filter, -1000);
        
        console.log(`📋 Encontrados ${events.length} eventos de Transfer:`);
        events.forEach((event, index) => {
            console.log(`  ${index + 1}. From: ${event.args[0]} -> To: ${event.args[1]} | Token ID: ${event.args[2]}`);
        });
        
    } catch (error) {
        console.error("❌ Erro:", error.message);
    }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    main()
        .then(() => {
            console.log("\n✅ Verificação concluída!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Erro:", error);
            process.exit(1);
        });
}

export { main };