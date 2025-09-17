const hre = require("hardhat");

async function main() {
    console.log("=== Deploy do CarbonCreditNFT_Final ===");
    console.log("Rede:", hre.network.name);

    // Parâmetros do constructor
    const centavosPorG = process.env.CENTAVOS_POR_GRAMA || 5; // 5 centavos por grama de CO2
    const cotacaoInicial = process.env.COTACAO_INICIAL_ETH_CENTAVOS || 15000; // R$ 150,00 = 15000 centavos por ETH
    const adminAddress = process.env.ADMIN_ADDRESS || "0xfe3b557e8fb62b89f4916b721be55ceb828dbd73";

    console.log("\nParâmetros do deploy:");
    console.log("- Centavos por grama CO2:", centavosPorG);
    console.log("- Cotação inicial ETH em centavos:", cotacaoInicial);
    console.log("- Endereço do admin:", adminAddress);

    // Verificar se o admin address é válido
    if (!hre.ethers.isAddress(adminAddress)) {
        throw new Error("Endereço do admin inválido: " + adminAddress);
    }

    // Deploy do contrato
    console.log("\nIniciando deploy...");
    const CarbonCreditNFT = await hre.ethers.getContractFactory("CarbonCreditNFT_Final");

    const carbonCredit = await CarbonCreditNFT.deploy(
        parseInt(centavosPorG),
        parseInt(cotacaoInicial),
        adminAddress
    );

    console.log("Aguardando confirmação do deploy...");
    await carbonCredit.waitForDeployment();

    const contractAddress = await carbonCredit.getAddress();
    console.log("✅ CarbonCreditNFT_Final deployed to:", contractAddress);

    // Verificar algumas informações do contrato
    console.log("\n=== Verificação pós-deploy ===");

    try {
        const carbonPricePerG = await carbonCredit.carbonPricePerG();
        const admin = await carbonCredit.admin();
        const name = await carbonCredit.name();
        const symbol = await carbonCredit.symbol();
        const nextTokenId = await carbonCredit.nextTokenId();

        console.log("- Preço do carbono por grama (Wei):", carbonPricePerG.toString());
        console.log("- Admin configurado:", admin);
        console.log("- Nome do token:", name);
        console.log("- Símbolo do token:", symbol);
        console.log("- Próximo Token ID:", nextTokenId.toString());
        console.log("- Saldo do contrato:", await carbonCredit.saldoContrato());

        // Salvar informações do deploy
        const deployInfo = {
            network: hre.network.name,
            contractAddress: contractAddress,
            admin: admin,
            deployedAt: new Date().toISOString(),
            parameters: {
                centavosPorG: parseInt(centavosPorG),
                cotacaoInicial: parseInt(cotacaoInicial),
                adminAddress: adminAddress
            }
        };

        const fs = require('fs');
        fs.writeFileSync(
            `./deployments-${hre.network.name}.json`,
            JSON.stringify(deployInfo, null, 2)
        );
        console.log(`\n📝 Informações do deploy salvas em: deployments-${hre.network.name}.json`);

    } catch (error) {
        console.log("⚠️  Erro na verificação pós-deploy:", error.message);
    }

    return contractAddress;
}

main()
    .then((address) => {
        console.log("\n🎉 Deploy concluído com sucesso!");
        console.log("📍 Endereço do contrato:", address);
        console.log("\n💡 Próximos passos:");
        console.log("1. Adicionar ETH ao contrato para pagar recompensas");
        console.log("2. Testar o registro de viagens");
        console.log("3. Verificar o saque de recompensas");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Erro no deploy:", error);
        process.exit(1);
    });