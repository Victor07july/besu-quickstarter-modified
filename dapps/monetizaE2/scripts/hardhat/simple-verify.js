import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log("🔍 Verificando contrato de forma simples:", CONTRACT_ADDRESS);
    
    const [deployer] = await ethers.getSigners();
    const carbonCredit = await ethers.getContractAt("CarbonCreditNFT_FabricEquivalent", CONTRACT_ADDRESS);
    
    try {
        // Verificar owner
        const owner = await carbonCredit.owner();
        console.log("👤 Owner:", owner);
        
        // Verificar saldo
        const balance = await carbonCredit.saldoContrato();
        console.log("💰 Saldo do contrato:", ethers.formatEther(balance), "ETH");
        
        // Verificar autorização
        const isAuthorized = await carbonCredit.authorized(deployer.address);
        console.log("🔐 Deployer autorizado:", isAuthorized);
        
        // Verificar se o deployer tem NFTs
        const deployerBalance = await carbonCredit.balanceOf(deployer.address);
        console.log("🎨 Quantidade de NFTs:", deployerBalance.toString());
        
        if (deployerBalance > 0) {
            console.log("\n🏷️  Tokens do deployer:");
            for (let i = 0; i < deployerBalance; i++) {
                const tokenId = await carbonCredit.tokenOfOwnerByIndex(deployer.address, i);
                console.log(`  - Token ID: ${tokenId.toString()}`);
            }
        }
        
        // Verificar eventos de Transfer
        console.log("\n📝 Verificando eventos...");
        const fromBlock = await ethers.provider.getBlockNumber() - 10;
        const filter = carbonCredit.filters.Transfer();
        const events = await carbonCredit.queryFilter(filter, fromBlock);
        
        console.log(`📋 Eventos de Transfer encontrados: ${events.length}`);
        events.forEach((event, index) => {
            const { from, to, tokenId } = event.args;
            console.log(`  ${index + 1}. Token ${tokenId} | ${from} → ${to}`);
        });
        
    } catch (error) {
        console.error("❌ Erro:", error.message);
    }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    main()
        .then(() => {
            console.log("\n✅ Verificação simplificada concluída!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Erro:", error);
            process.exit(1);
        });
}

export { main };