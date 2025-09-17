const hre = require("hardhat");

async function main() {
    console.log("=== Verificação do Contrato CarbonCreditNFT_Final ===");

    // Ler informações do deploy
    const fs = require('fs');
    let deployInfo;

    try {
        const deployData = fs.readFileSync(`./deployments-${hre.network.name}.json`, 'utf8');
        deployInfo = JSON.parse(deployData);
    } catch (error) {
        console.log("❌ Arquivo de deploy não encontrado. Execute o deploy primeiro.");
        return;
    }

    const contractAddress = deployInfo.contractAddress;
    console.log("📍 Endereço do contrato:", contractAddress);
    console.log("🌐 Rede:", hre.network.name);

    // Conectar ao contrato
    const CarbonCredit = await hre.ethers.getContractAt("CarbonCreditNFT_Final", contractAddress);

    console.log("\n=== Informações do Contrato ===");

    try {
        // Informações básicas
        const admin = await CarbonCredit.admin();
        const name = await CarbonCredit.name();
        const symbol = await CarbonCredit.symbol();
        const nextTokenId = await CarbonCredit.nextTokenId();
        const saldo = await CarbonCredit.saldoContrato();

        console.log("👤 Admin:", admin);
        console.log("🏷️  Nome:", name);
        console.log("🔖 Símbolo:", symbol);
        console.log("🆔 Próximo Token ID:", nextTokenId.toString());
        console.log("💰 Saldo do contrato:", hre.ethers.formatEther(saldo), "ETH");

        // Informações de preço
        const carbonPricePerG = await CarbonCredit.carbonPricePerG();
        const precoCentavos = await CarbonCredit.precoCentavosPorG();
        const cotacaoEth = await CarbonCredit.cotacaoEthEmReais();

        console.log("\n=== Configurações de Preço ===");
        console.log("💵 Preço por grama (Wei):", carbonPricePerG.toString());
        console.log("💳 Preço centavos/g:", precoCentavos.toString());
        console.log("📈 Cotação ETH (centavos):", cotacaoEth.toString());

        // Verificar se o contrato tem saldo para recompensas
        if (saldo > 0) {
            console.log("✅ Contrato tem saldo para pagar recompensas");
        } else {
            console.log("⚠️  Contrato não tem saldo - adicione ETH para pagar recompensas");
        }

        console.log("\n=== Status do Contrato ===");
        console.log("✅ Contrato funcional e verificado com sucesso!");

    } catch (error) {
        console.log("❌ Erro ao verificar contrato:", error.message);
    }
}

main()
    .then(() => {
        console.log("\n🎉 Verificação concluída!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Erro na verificação:", error);
        process.exit(1);
    });