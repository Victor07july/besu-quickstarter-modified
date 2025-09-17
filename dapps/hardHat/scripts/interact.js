const hre = require("hardhat");

async function main() {
    console.log("=== Interação com CarbonCreditNFT_Final ===");

    // Ler informações do deploy
    const fs = require('fs');
    let deployInfo;

    try {
        const deployData = fs.readFileSync(`./deployments-${hre.network.name}.json`, 'utf8');
        deployInfo = JSON.parse(deployData);
    } catch (error) {
        console.log("❌ Arquivo de deploy não encontrado. Certifique-se de ter feito o deploy primeiro.");
        return;
    }

    const contractAddress = deployInfo.contractAddress;
    console.log("📍 Endereço do contrato:", contractAddress);

    // Conectar ao contrato
    const signers = await hre.ethers.getSigners();
    const admin = signers[0]; // Primeira conta (do .env)

    // Se só temos uma conta, usar a mesma para admin e condutor
    // Se temos mais contas, usar a segunda como condutor
    const condutor = signers.length > 1 ? signers[1] : admin;

    const CarbonCredit = await hre.ethers.getContractAt("CarbonCreditNFT_Final", contractAddress);

    console.log("👤 Admin:", admin.address);
    console.log("🚗 Condutor:", condutor.address);

    if (admin.address === condutor.address) {
        console.log("ℹ️  Usando a mesma conta para admin e condutor");
    } try {
        // 1. Verificar saldo do contrato
        console.log("\n=== 1. Verificando Saldo do Contrato ===");
        const saldoContrato = await CarbonCredit.saldoContrato();
        console.log("💰 Saldo atual:", hre.ethers.formatEther(saldoContrato), "ETH");

        // 2. Adicionar fundos ao contrato (se necessário)
        if (saldoContrato < hre.ethers.parseEther("1")) {
            console.log("\n=== 2. Adicionando Fundos ao Contrato ===");
            const tx = await admin.sendTransaction({
                to: contractAddress,
                value: hre.ethers.parseEther("5") // 5 ETH
            });
            await tx.wait();
            console.log("✅ Adicionados 5 ETH ao contrato");

            const novoSaldo = await CarbonCredit.saldoContrato();
            console.log("💰 Novo saldo:", hre.ethers.formatEther(novoSaldo), "ETH");
        }

        // 3. Registrar uma viagem
        console.log("\n=== 3. Registrando uma Viagem ===");
        const co2Meta = 1000; // 1000g de CO2
        const economiaCO2 = 500; // Economizou 500g
        const recompensa = hre.ethers.parseEther("0.1"); // 0.1 ETH de recompensa
        const dadosHash = hre.ethers.keccak256(hre.ethers.toUtf8Bytes("viagem_eco_001"));

        const registroTx = await CarbonCredit.connect(admin).registrarViagemDetalhada(
            condutor.address,
            co2Meta,
            economiaCO2,
            recompensa,
            dadosHash
        );

        const receipt = await registroTx.wait();
        console.log("✅ Viagem registrada! Hash:", receipt.hash);

        // Encontrar o evento ViagemRegistrada
        const viagemEvent = receipt.logs.find(log => {
            try {
                const parsed = CarbonCredit.interface.parseLog(log);
                return parsed.name === 'ViagemRegistrada';
            } catch (e) {
                return false;
            }
        });

        let tokenId = 0;
        if (viagemEvent) {
            const parsed = CarbonCredit.interface.parseLog(viagemEvent);
            tokenId = parsed.args[0];
            console.log("🎫 Token ID criado:", tokenId.toString());
        }

        // 4. Verificar informações da viagem
        console.log("\n=== 4. Verificando Informações da Viagem ===");
        const viagemInfo = await CarbonCredit.viagemInfo(tokenId);
        console.log("📊 CO2 Meta:", viagemInfo.co2MetaG.toString(), "g");
        console.log("🌱 Economia CO2:", viagemInfo.economiaCO2.toString(), "g");
        console.log("💵 Recompensa:", hre.ethers.formatEther(viagemInfo.recompensa), "ETH");
        console.log("🔒 Já sacada?", viagemInfo.recompensaSacada);

        // 5. Verificar propriedade do NFT
        console.log("\n=== 5. Verificando NFT ===");
        const owner = await CarbonCredit.ownerOf(tokenId);
        const balance = await CarbonCredit.balanceOf(condutor.address);
        console.log("👤 Dono do NFT:", owner);
        console.log("🎫 NFTs do condutor:", balance.toString());

        // 6. Sacar recompensa
        console.log("\n=== 6. Sacando Recompensa ===");
        const saldoAntes = await hre.ethers.provider.getBalance(condutor.address);

        const saqueTx = await CarbonCredit.connect(condutor).sacarRecompensa(tokenId);
        await saqueTx.wait();

        const saldoDepois = await hre.ethers.provider.getBalance(condutor.address);
        const diferenca = saldoDepois - saldoAntes;

        console.log("✅ Recompensa sacada!");
        console.log("💰 Valor recebido:", hre.ethers.formatEther(diferenca), "ETH");

        // 7. Verificar status atualizado
        console.log("\n=== 7. Status Final ===");
        const viagemFinal = await CarbonCredit.viagemInfo(tokenId);
        console.log("🔒 Recompensa sacada?", viagemFinal.recompensaSacada);

        const saldoFinalContrato = await CarbonCredit.saldoContrato();
        console.log("💰 Saldo final do contrato:", hre.ethers.formatEther(saldoFinalContrato), "ETH");

    } catch (error) {
        console.error("❌ Erro na execução:", error.message);
    }
}

main()
    .then(() => {
        console.log("\n🎉 Interação concluída com sucesso!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Erro:", error);
        process.exit(1);
    });