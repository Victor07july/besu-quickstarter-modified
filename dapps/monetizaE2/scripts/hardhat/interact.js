import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    // Endereço do contrato deployado (substitua pelo endereço real)
    const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS || "0x5FbDB2315678afecb367f032d93F642f64180aa3";
    
    console.log("🔄 Interagindo com o contrato em:", CONTRACT_ADDRESS);
    
    // Obter contas
    const [deployer] = await ethers.getSigners();
    console.log("👤 Usando conta:", deployer.address);
    
    // Conectar ao contrato
    const CarbonCredit = await ethers.getContractAt("CarbonCreditNFT_FabricEquivalent", CONTRACT_ADDRESS);
    
    try {
        // === CONSULTAR ESTADO ATUAL ===
        console.log("\n=== Estado Atual do Contrato ===");
        const contractState = await CarbonCredit.getContractState();
        const saldo = await CarbonCredit.saldoContrato();
        const isAuthorized = await CarbonCredit.authorized(deployer.address);
        
        console.log("🔢 Next Token ID:", contractState.nextTokenId.toString());
        console.log("💵 Carbon Price EUR:", contractState.carbonPriceEUR.toString());
        console.log("💱 Cotação EUR/BRL:", contractState.cotacaoEuroBRL.toString());
        console.log("✅ Inicializado:", contractState.initialized);
        console.log("🔐 Deployer autorizado:", isAuthorized);
        console.log("💰 Saldo do contrato:", ethers.formatEther(saldo), "ETH");
        
        // === EXEMPLO DE TOKENIZAÇÃO ===
        console.log("\n=== Exemplo de Tokenização ===");
        
        // Dados de exemplo para uma viagem com economia de CO2
        const viagemDados = {
            vehicleId: "HONDA_CIVIC_2024",
            condutor: deployer.address, // Use deployer como condutor para teste
            highwayDistance: 100000000,    // 100 km highway (6 decimais)
            cityDistance: 50000000,        // 50 km city (6 decimais)
            ethanolPercent: 27000000,      // 27% ethanol (6 decimais)
            co2EtanolOriginal: 15000000000, // 15 kg CO2 original (6 decimais)
            roadGasoline: 15000000,        // 15 km/L road gasoline
            roadEthanol: 10000000,         // 10 km/L road ethanol
            cityGasoline: 12000000,        // 12 km/L city gasoline
            cityEthanol: 8000000,          // 8 km/L city ethanol
            tanqueGasoline: 73000000,      // 73% gasoline (6 decimais)
            timestamp: "2024-01-01T10:00:00Z"
        };
        
        console.log("🚗 Vehicle ID:", viagemDados.vehicleId);
        console.log("👤 Condutor:", viagemDados.condutor);
        console.log("🛣️  Highway Distance:", (parseInt(viagemDados.highwayDistance) / 1e6), "km");
        console.log("🏙️  City Distance:", (parseInt(viagemDados.cityDistance) / 1e6), "km");
        console.log("⛽ Ethanol %:", (parseInt(viagemDados.ethanolPercent) / 1e6), "%");
        console.log("💨 CO2 Original:", (parseInt(viagemDados.co2EtanolOriginal) / 1e6), "g");
        
        if (isAuthorized) {
            console.log("\n📝 Criando NFT de crédito de carbono...");
            
            const tokenizeTx = await CarbonCredit.calculateE1AndTokenize(
                viagemDados.vehicleId,
                viagemDados.condutor,
                viagemDados.highwayDistance,
                viagemDados.cityDistance,
                viagemDados.ethanolPercent,
                viagemDados.co2EtanolOriginal,
                viagemDados.roadGasoline,
                viagemDados.roadEthanol,
                viagemDados.cityGasoline,
                viagemDados.cityEthanol,
                viagemDados.tanqueGasoline,
                viagemDados.timestamp
            );
            
            const receipt = await tokenizeTx.wait();
            console.log("✅ NFT criado! Tx hash:", receipt.hash);
            
            // Extrair tokenId do evento
            const event = receipt.logs.find(log => {
                try {
                    const parsed = CarbonCredit.interface.parseLog(log);
                    return parsed.name === "CarbonTokenized";
                } catch (e) {
                    return false;
                }
            });
            
            if (event) {
                const parsedEvent = CarbonCredit.interface.parseLog(event);
                const tokenId = parsedEvent.args.tokenId;
                
                console.log("\n=== Informações do NFT Criado ===");
                console.log("🆔 Token ID:", tokenId.toString());
                console.log("👤 Condutor:", parsedEvent.args.condutor);
                console.log("🚗 Vehicle ID:", parsedEvent.args.vehicleId);
                console.log("💨 Economia CO2:", (parseInt(parsedEvent.args.co2Economy) / 1e6), "g");
                console.log("🎯 Meta CO2:", (parseInt(parsedEvent.args.metaCO2) / 1e6), "g");
                console.log("📊 CO2 Original:", (parseInt(parsedEvent.args.originalCO2) / 1e6), "g");
                console.log("💰 Recompensa:", ethers.formatEther(parsedEvent.args.recompensaWei), "ETH");
                
                // Consultar dados completos
                console.log("\n=== Dados Completos do Token ===");
                const dadosCarb = await CarbonCredit.getDadosCarbonizacao(tokenId);
                const statusRecomp = await CarbonCredit.getStatusRecompensa(tokenId);
                
                console.log("📋 Dados de Carbonização:");
                console.log("  - Vehicle ID:", dadosCarb.vehicleId);
                console.log("  - Highway Distance:", (parseInt(dadosCarb.highwayDistance) / 1e6), "km");
                console.log("  - City Distance:", (parseInt(dadosCarb.cityDistance) / 1e6), "km");
                console.log("  - Meta CO2:", (parseInt(dadosCarb.metaCO2) / 1e6), "g");
                console.log("  - Diff (Economia):", (parseInt(dadosCarb.diff) / 1e6), "g");
                console.log("  - Token Value:", (parseInt(dadosCarb.tokenValue) / 1e6), "BRL");
                console.log("  - Recompensa:", ethers.formatEther(dadosCarb.recompensaEmWei), "ETH");
                console.log("  - Timestamp:", dadosCarb.timestamp);
                
                console.log("\n💰 Status da Recompensa:");
                console.log("  - Token ID:", statusRecomp.tokenId);
                console.log("  - Condutor:", statusRecomp.condutor);
                console.log("  - Valor:", ethers.formatEther(statusRecomp.valor), "ETH");
                console.log("  - Sacada:", statusRecomp.sacada);
                
                // === EXEMPLO DE SAQUE ===
                if (!statusRecomp.sacada) {
                    console.log("\n💸 Sacando recompensa...");
                    const saqueTx = await CarbonCredit.sacarRecompensa(tokenId);
                    await saqueTx.wait();
                    console.log("✅ Recompensa sacada! Tx hash:", saqueTx.hash);
                    
                    // Verificar novo status
                    const novoStatus = await CarbonCredit.getStatusRecompensa(tokenId);
                    console.log("🔄 Novo status - Sacada:", novoStatus.sacada);
                }
            }
        } else {
            console.log("❌ Deployer não está autorizado para tokenizar");
        }
        
        // === ESTATÍSTICAS FINAIS ===
        console.log("\n=== Estatísticas Finais ===");
        const novoEstado = await CarbonCredit.getContractState();
        const novoSaldo = await CarbonCredit.saldoContrato();
        
        console.log("🔢 Total de tokens criados:", (novoEstado.nextTokenId - 1n).toString());
        console.log("💰 Saldo restante do contrato:", ethers.formatEther(novoSaldo), "ETH");
        
    } catch (error) {
        console.error("❌ Erro durante interação:", error.message);
        if (error.data) {
            console.error("📋 Dados do erro:", error.data);
        }
    }
}

// Executar interação
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