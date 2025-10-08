// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "forge-std/Test.sol";
import "../CarbonCredit.sol";

contract CarbonCreditTest is Test {
    CarbonCreditNFT_V1 public carbonCredit;
    address public admin;
    address public condutor = address(0x1);
    
    function setUp() public {
        admin = address(this);
        carbonCredit = new CarbonCreditNFT_V1(5, 15000); // 5 centavos/g, R$15k/ETH
        
        // Fund contract for rewards
        vm.deal(address(carbonCredit), 10 ether);
    }
    
    function testDeployment() public {
        assertEq(carbonCredit.admin(), admin);
        assertEq(carbonCredit.precoCentavosPorG(), 5);
        assertEq(carbonCredit.cotacaoEthEmReais(), 15000);
        assertGt(carbonCredit.carbonPricePerG(), 0);
    }
    
    function testRegistrarViagem() public {
        uint256 co2Meta = 1000; // 1kg CO2
        uint256 economia = 500;  // 500g economia
        uint256 recompensa = 0.001 ether; // Recompensa manual
        bytes32 dadosHash = keccak256("viagem-123");
        
        uint256 tokenId = carbonCredit.registrarViagemDetalhada(
            condutor,
            co2Meta,
            economia,
            recompensa,
            dadosHash
        );
        
        assertEq(tokenId, 0);
        assertEq(carbonCredit.ownerOf(tokenId), condutor);
        
        (uint256 co2, uint256 eco, uint256 rec, bytes32 hash, bool sacado) = carbonCredit.viagemInfo(tokenId);
        assertEq(co2, co2Meta);
        assertEq(eco, economia);
        assertEq(rec, recompensa);
        assertEq(hash, dadosHash);
        assertFalse(sacado);
    }
    
    function testSacarRecompensa() public {
        // Register trip
        uint256 recompensa = 0.1 ether;
        uint256 tokenId = carbonCredit.registrarViagemDetalhada(
            condutor,
            1000,
            500,
            recompensa,
            keccak256("viagem-saque")
        );
        
        // Check initial balance
        uint256 balanceInicial = condutor.balance;
        
        // Withdraw reward
        vm.prank(condutor);
        carbonCredit.sacarRecompensa(tokenId);
        
        // Check final balance
        assertEq(condutor.balance, balanceInicial + recompensa);
        
        // Check reward is marked as withdrawn
        (, , , , bool sacado) = carbonCredit.viagemInfo(tokenId);
        assertTrue(sacado);
    }
    
    function testFailSacarRecompensaDuasVezes() public {
        uint256 tokenId = carbonCredit.registrarViagemDetalhada(
            condutor,
            1000,
            500,
            0.1 ether,
            keccak256("viagem-dupla")
        );
        
        vm.startPrank(condutor);
        carbonCredit.sacarRecompensa(tokenId);
        carbonCredit.sacarRecompensa(tokenId); // Should fail
        vm.stopPrank();
    }
    
    function testAtualizarCotacao() public {
        uint256 novaCotacao = 20000; // R$ 20k/ETH
        uint256 precoCarbonAnterior = carbonCredit.carbonPricePerG();
        
        carbonCredit.atualizarCotacaoEth(novaCotacao);
        
        assertEq(carbonCredit.cotacaoEthEmReais(), novaCotacao);
        assertLt(carbonCredit.carbonPricePerG(), precoCarbonAnterior); // Price should be lower
    }
}
