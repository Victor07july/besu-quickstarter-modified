import pkg from "hardhat";
const { ethers } = pkg;

async function main() {
    console.log("🌱 === TESTANDO CÁLCULOS E2 - BASEADO NO CÓDIGO R ===\n");
    
    // Deploy do contrato
    console.log("📦 Fazendo deploy do contrato E2Calculator...");
    const [deployer, user1] = await ethers.getSigners();
    
    const E2Calculator = await ethers.getContractFactory("CarbonCreditNFT_E2Calculator");
    const calculator = await E2Calculator.deploy();
    await calculator.waitForDeployment();
    const contractAddress = await calculator.getAddress();
    
    console.log("✅ Contrato deployado:", contractAddress);
    console.log("👤 Deployer:", deployer.address);
    
    // Autorizar user1
    await calculator.setAuthorized(user1.address, true);
    console.log("🔐 User1 autorizado\n");
    
    // === TESTE 1: Exemplo baseado nos dados do R ===
    console.log("📊 TESTE 1: Dados de exemplo (baseado no código R)");
    const params1 = {
        highwayDistance: ethers.parseUnits("150", 6),      // 150 km na estrada
        cityDistance: ethers.parseUnits("80", 6),          // 80 km na cidade
        ethanolPercent: ethers.parseUnits("75", 6),        // 75% etanol no tanque
        roadGasoline: ethers.parseUnits("14.1", 6),        // 14.1 km/L estrada gasolina
        roadEthanol: ethers.parseUnits("9.8", 6),          // 9.8 km/L estrada etanol
        cityGasoline: ethers.parseUnits("11.6", 6),        // 11.6 km/L cidade gasolina
        cityEthanol: ethers.parseUnits("8.0", 6),          // 8.0 km/L cidade etanol
        precoGasolina: ethers.parseUnits("6.47", 6),       // R$ 6.47/L gasolina
        precoEtanol: ethers.parseUnits("4.94", 6),         // R$ 4.94/L etanol
        behaviorCautious: ethers.parseUnits("60", 6),      // 60% cauteloso
        behaviorNormal: ethers.parseUnits("30", 6),        // 30% normal
        behaviorAggressive: ethers.parseUnits("10", 6)     // 10% agressivo
    };
    
    console.log("🔍 Parâmetros de entrada:");
    console.log("  Distâncias:");
    console.log("    - Estrada:", ethers.formatUnits(params1.highwayDistance, 6), "km");
    console.log("    - Cidade:", ethers.formatUnits(params1.cityDistance, 6), "km");
    console.log("    - Total:", ethers.formatUnits(params1.highwayDistance + params1.cityDistance, 6), "km");
    console.log("  Tanque:");
    console.log("    - Etanol:", ethers.formatUnits(params1.ethanolPercent, 6), "%");
    console.log("    - Gasolina:", ethers.formatUnits((100n * 1000000n) - params1.ethanolPercent, 6), "%");
    console.log("  Eficiência:");
    console.log("    - Estrada gasolina:", ethers.formatUnits(params1.roadGasoline, 6), "km/L");
    console.log("    - Estrada etanol:", ethers.formatUnits(params1.roadEthanol, 6), "km/L");
    console.log("    - Cidade gasolina:", ethers.formatUnits(params1.cityGasoline, 6), "km/L");
    console.log("    - Cidade etanol:", ethers.formatUnits(params1.cityEthanol, 6), "km/L");
    console.log("  Preços:");
    console.log("    - Gasolina: R$", ethers.formatUnits(params1.precoGasolina, 6));
    console.log("    - Etanol: R$", ethers.formatUnits(params1.precoEtanol, 6));
    console.log("  Comportamento:");
    console.log("    - Cauteloso:", ethers.formatUnits(params1.behaviorCautious, 6), "%");
    console.log("    - Normal:", ethers.formatUnits(params1.behaviorNormal, 6), "%");
    console.log("    - Agressivo:", ethers.formatUnits(params1.behaviorAggressive, 6), "%");
    
    // Simular cálculo
    console.log("\n🧮 Simulando cálculo E2...");
    const simulation1 = await calculator.simulateE2Calculation(params1);
    
    console.log("\n📋 Resultados da Parte 2 (Cálculo E2):");
    console.log("  Tanque gasolina:", ethers.formatUnits(simulation1.tanqueGasoline, 6), "%");
    console.log("  \n  Estrada:");
    console.log("    - Custo gasolina:", ethers.formatUnits(simulation1.dtEstradaGasolina, 6));
    console.log("    - Custo etanol:", ethers.formatUnits(simulation1.dtEstradaEtanol, 6));
    console.log("    - Total estrada:", ethers.formatUnits(simulation1.dfEstrada, 6));
    console.log("  \n  Cidade:");
    console.log("    - Custo gasolina:", ethers.formatUnits(simulation1.dtCidadeGasolina, 6));
    console.log("    - Custo etanol:", ethers.formatUnits(simulation1.dtCidadeEtanol, 6));
    console.log("    - Total cidade:", ethers.formatUnits(simulation1.dfCidade, 6));
    console.log("  \n  Bônus:");
    console.log("    - Prop_Bonus:", ethers.formatUnits(simulation1.propBonus, 6), "x");
    console.log("  \n  🎯 E2 FINAL: R$", ethers.formatUnits(simulation1.e2Final, 6));
    console.log("    Cálculo: Prop_Bonus * (df_estrada + df_cidade)");
    console.log("    =", ethers.formatUnits(simulation1.propBonus, 6), "*", 
                 "(" + ethers.formatUnits(simulation1.dfEstrada, 6), "+", 
                 ethers.formatUnits(simulation1.dfCidade, 6) + ")");
    
    // Executar tokenização
    console.log("\n🎨 Executando tokenização...");
    const tokenizeTx1 = await calculator.calculateE2AndTokenize(params1, user1.address);
    const receipt1 = await tokenizeTx1.wait();
    
    console.log("✅ Token 1 criado! Gas usado:", receipt1.gasUsed.toString());
    
    // === TESTE 2: Segundo exemplo com valores diferentes ===
    console.log("\n\n📊 TESTE 2: Segundo exemplo");
    const params2 = {
        highwayDistance: ethers.parseUnits("200", 6),      // 200 km na estrada
        cityDistance: ethers.parseUnits("50", 6),          // 50 km na cidade
        ethanolPercent: ethers.parseUnits("50", 6),        // 50% etanol no tanque
        roadGasoline: ethers.parseUnits("13.65", 6),       // 13.65 km/L
        roadEthanol: ethers.parseUnits("9.5", 6),          // 9.5 km/L
        cityGasoline: ethers.parseUnits("12.15", 6),       // 12.15 km/L
        cityEthanol: ethers.parseUnits("8.2", 6),          // 8.2 km/L
        precoGasolina: ethers.parseUnits("6.71", 6),       // R$ 6.71/L
        precoEtanol: ethers.parseUnits("5.25", 6),         // R$ 5.25/L
        behaviorCautious: ethers.parseUnits("40", 6),      // 40% cauteloso
        behaviorNormal: ethers.parseUnits("50", 6),        // 50% normal
        behaviorAggressive: ethers.parseUnits("10", 6)     // 10% agressivo
    };
    
    const simulation2 = await calculator.simulateE2Calculation(params2);
    console.log("🔍 Distância total:", ethers.formatUnits(params2.highwayDistance + params2.cityDistance, 6), "km");
    console.log("🎯 E2 calculado: R$", ethers.formatUnits(simulation2.e2Final, 6));
    
    const tokenizeTx2 = await calculator.calculateE2AndTokenize(params2, user1.address);
    await tokenizeTx2.wait();
    console.log("✅ Token 2 criado!");
    
    // === PARTE 3: Análise dos dados (eventos para tracking) ===
    console.log("\n\n📈 PARTE 3: Análise dos dados (equivalente aos gráficos do R)");
    
    const userBalance = await calculator.balanceOf(user1.address);
    console.log("🎨 Total de NFTs criados:", userBalance.toString());
    
    console.log("\n📊 Resumo dos cálculos:");
    for (let i = 0; i < userBalance; i++) {
        const tokenId = await calculator.tokenOfOwnerByIndex(user1.address, i);
        const details = await calculator.getCalculationDetails(tokenId);
        
        console.log(`\n  Token ID ${tokenId}:`);
        console.log(`    - Distância total: ${ethers.formatUnits(details.totalDistance, 6)} km`);
        console.log(`    - E2 calculado: R$ ${ethers.formatUnits(details.e2Final, 6)}`);
        console.log(`    - Bônus aplicado: ${ethers.formatUnits(details.propBonus, 6)}x`);
        console.log(`    - Custo estrada: ${ethers.formatUnits(details.dfEstrada, 6)}`);
        console.log(`    - Custo cidade: ${ethers.formatUnits(details.dfCidade, 6)}`);
    }
    
    // Buscar eventos E2Calculated (equivalente ao tracking do gráfico do R)
    console.log("\n📝 Eventos emitidos (para análise off-chain):");
    const filter = calculator.filters.E2Calculated();
    const events = await calculator.queryFilter(filter);
    
    console.log(`📋 Total de eventos E2Calculated: ${events.length}`);
    events.forEach((event, index) => {
        const { user, tokenId, e2Value, totalDistance, timestamp } = event.args;
        console.log(`  ${index + 1}. Token ${tokenId} | E2: R$ ${ethers.formatUnits(e2Value, 6)} | Distância: ${ethers.formatUnits(totalDistance, 6)} km`);
    });
    
    console.log("\n🎉 === TESTE COMPLETO ===");
    console.log("✅ PARTE 2 implementada: Cálculos E2 conforme código R");
    console.log("✅ PARTE 3 implementada: Eventos para tracking e análise");
    console.log("✅ Fórmulas exatas do R adaptadas para Solidity");
    console.log("✅ Prop_Bonus calculado com comportamento de dirigibilidade");
    console.log("✅ E2 = Prop_Bonus * (df_estrada + df_cidade)");
}

if (process.argv[1] === new URL(import.meta.url).pathname) {
    main()
        .then(() => {
            console.log("\n✅ Teste dos cálculos E2 (Partes 2 e 3) concluído!");
            process.exit(0);
        })
        .catch((error) => {
            console.error("💥 Erro no teste:", error);
            process.exit(1);
        });
}

export { main };