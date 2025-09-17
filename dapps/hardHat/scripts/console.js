const hre = require("hardhat");

async function setupConsole() {
    // Ler informações do deploy
    const fs = require('fs');
    let deployInfo;

    try {
        const deployData = fs.readFileSync(`./deployments-${hre.network.name}.json`, 'utf8');
        deployInfo = JSON.parse(deployData);
    } catch (error) {
        console.log("❌ Arquivo de deploy não encontrado.");
        return;
    }

    const contractAddress = deployInfo.contractAddress;
    const [admin, condutor, user3] = await hre.ethers.getSigners();
    const CarbonCredit = await hre.ethers.getContractAt("CarbonCreditNFT_Final", contractAddress);

    console.log("=== Console do CarbonCredit Setup ===");
    console.log("📍 Contrato:", contractAddress);
    console.log("👤 Admin:", admin.address);
    console.log("🚗 Condutor:", condutor.address);
    console.log("👥 User3:", user3.address);

    // Disponibilizar variáveis globalmente
    global.contract = CarbonCredit;
    global.admin = admin;
    global.condutor = condutor;
    global.user3 = user3;
    global.ethers = hre.ethers;

    console.log("\n=== Variáveis Disponíveis ===");
    console.log("- contract: Instância do contrato");
    console.log("- admin: Conta do administrador");
    console.log("- condutor: Conta do condutor");
    console.log("- user3: Terceira conta");
    console.log("- ethers: Biblioteca ethers.js");

    console.log("\n=== Exemplos de Comandos ===");
    console.log("// Verificar saldo do contrato");
    console.log("await contract.saldoContrato()");
    console.log("");
    console.log("// Registrar viagem");
    console.log("await contract.connect(admin).registrarViagemDetalhada(");
    console.log("  condutor.address,");
    console.log("  1000, // CO2 meta");
    console.log("  500,  // Economia");
    console.log("  ethers.parseEther('0.1'), // Recompensa");
    console.log("  ethers.keccak256(ethers.toUtf8Bytes('dados'))");
    console.log(")");
    console.log("");
    console.log("// Sacar recompensa");
    console.log("await contract.connect(condutor).sacarRecompensa(0)");
    console.log("");
    console.log("// Verificar informações da viagem");
    console.log("await contract.viagemInfo(0)");

    return {
        contract: CarbonCredit,
        admin,
        condutor,
        user3,
        contractAddress
    };
}

if (require.main === module) {
    setupConsole().then(() => {
        console.log("\n✅ Console configurado! Use as variáveis globais para interagir.");
    });
}

module.exports = setupConsole;