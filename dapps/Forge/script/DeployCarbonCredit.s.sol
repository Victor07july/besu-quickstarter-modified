// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Script.sol";
import "../CarbonCredit.sol";

contract DeployCarbonCredit is Script {
    function run() external returns (CarbonCreditNFT_V1) {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        
        // Parâmetros do contrato - podem ser customizados via env vars
        uint256 precoCentavosPorG = vm.envOr("PRECO_CENTAVOS", uint256(5)); // 5 centavos por grama
        uint256 cotacaoInicial = vm.envOr("COTACAO_INICIAL", uint256(15000)); // R$ 15.000 por ETH
        
        console.log("Deploying CarbonCreditNFT_V1...");
        console.log("Preco centavos por g:", precoCentavosPorG);
        console.log("Cotacao inicial (BRL/ETH):", cotacaoInicial);
        
        vm.startBroadcast(deployerKey);
        
        CarbonCreditNFT_V1 carbonCredit = new CarbonCreditNFT_V1(
            precoCentavosPorG,
            cotacaoInicial
        );
        
        vm.stopBroadcast();
        
        console.log("CarbonCreditNFT_V1 deployed at:", address(carbonCredit));
        console.log("Admin:", carbonCredit.admin());
        console.log("Carbon price per gram (wei):", carbonCredit.carbonPricePerG());
        
        return carbonCredit;
    }
}
