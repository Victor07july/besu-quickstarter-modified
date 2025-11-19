const hre = require("hardhat");

async function main() {
    console.log("=== Deploy do CarbonCreditNFT_E2Calculator ===");
    console.log("Rede:", hre.network.name);
    console.log("\nNota: O contrato não recebe parâmetros no constructor.");
    console.log("O deployer será automaticamente autorizado como owner.\n");

    // Verificar se há uma conta configurada
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying com a conta:", deployer.address);
    console.log("Saldo da conta:", hre.ethers.formatEther(await deployer.provider.getBalance(deployer.address)), "ETH");

    // Deploy do contrato
    console.log("\nIniciando deploy...");
    const CarbonCreditNFT = await hre.ethers.getContractFactory("CarbonCreditNFT_E2Calculator");

    // Nota: O constructor não recebe parâmetros, apenas autoriza o deployer
    const carbonCredit = await CarbonCreditNFT.deploy();

    console.log("Aguardando confirmação do deploy...");
    await carbonCredit.waitForDeployment();

    const contractAddress = await carbonCredit.getAddress();
    console.log("✅ CarbonCreditNFT_E2Calculator deployed to:", contractAddress);

    // Verificar algumas informações do contrato
    console.log("\n=== Verificação pós-deploy ===");

    try {
        const owner = await carbonCredit.owner();
        const name = await carbonCredit.name();
        const symbol = await carbonCredit.symbol();
        const nextTokenId = await carbonCredit.nextTokenId();
        const brlPerEth = await carbonCredit.brlPerEth();
        const isAuthorized = await carbonCredit.authorized(owner);

        console.log("- Owner (deployer):", owner);
        console.log("- Nome do token:", name);
        console.log("- Símbolo do token:", symbol);
        console.log("- Próximo Token ID:", nextTokenId.toString());
        console.log("- Taxa BRL/ETH:", (Number(brlPerEth) / 1e6).toFixed(2), "BRL por ETH");
        console.log("- Owner autorizado:", isAuthorized);
        
        const balance = await carbonCredit.getContractBalance();
        console.log("- Saldo do contrato:", balance.toString(), "wei", `(${hre.ethers.formatEther(balance)} ETH)`);

        // Salvar informações do deploy
        const deployInfo = {
            network: hre.network.name,
            contractAddress: contractAddress,
            owner: owner,
            deployedAt: new Date().toISOString(),
            contractInfo: {
                name: name,
                symbol: symbol,
                brlPerEth: brlPerEth.toString(),
                nextTokenId: nextTokenId.toString()
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
        console.log("1. Autorizar endereços para calcular e tokenizar E2");
        console.log("2. Enviar dados do CSV para criar NFTs");
        console.log("3. Ajustar a taxa BRL/ETH se necessário");
        console.log("4. Listar tokens no marketplace");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Erro no deploy:", error);
        process.exit(1);
    });