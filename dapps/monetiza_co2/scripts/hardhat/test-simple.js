import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log("🔄 Interagindo com o contrato em:", CONTRACT_ADDRESS);
    
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando conta:", deployer.address);
    
    try {
        const CarbonCredit = await ethers.getContractAt("CarbonCreditNFT_FabricEquivalent", CONTRACT_ADDRESS);
        
        // Testes básicos primeiro
        console.log("\n=== Testes Básicos ===");
        const owner = await CarbonCredit.owner();
        console.log("👤 Owner:", owner);
        
        const saldo = await CarbonCredit.saldoContrato();
        console.log("💰 Saldo do contrato:", ethers.formatEther(saldo), "ETH");
        
        const isAuthorized = await CarbonCredit.authorized(deployer.address);
        console.log("🔐 Deployer autorizado:", isAuthorized);
        
        // Tentar obter estado individual
        try {
            const nextTokenId = await CarbonCredit.contractState();
            console.log("🔢 Contract State:", nextTokenId);
        } catch (error) {
            console.log("❌ Erro ao acessar contractState:", error.message);
        }
        
        console.log("\n✅ Testes básicos concluídos!");
        
    } catch (error) {
        console.error("❌ Erro durante interação:", error.message);
    }
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    main()
        .then(() => {
            console.log("\n🎉 Interação concluída!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Interação falhou:", error);
            process.exit(1);
        });
}

export { main };