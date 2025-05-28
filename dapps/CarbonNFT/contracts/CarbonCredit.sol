// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CarbonCreditNFT_Final is ERC721, ReentrancyGuard {
    // --- PARÂMETROS DE PREÇO E ADMINISTRAÇÃO ---
    uint256 public carbonPricePerG;
    uint256 public precoCentavosPorG;
    uint256 public cotacaoEthEmReais;
    uint256 public nextTokenId;
    
    // Variável para o endereço do administrador.
    address public admin;

    // --- ESTRUTURA DE DADOS DETALHADA ---
    struct ViagemDetalhada {
        uint256 co2MetaG;
        uint256 economiaCO2;
        uint256 recompensa;
        bytes32 dadosHash;
        bool recompensaSacada;
    }

    mapping(uint256 => ViagemDetalhada) public viagemInfo;
    mapping(address => uint256[]) public tokensDoCondutor;
    
    // --- EVENTOS ---
    event ViagemRegistrada(uint256 indexed tokenId, address indexed condutor, uint256 co2MetaG, uint256 economiaCO2, uint256 recompensa, bytes32 dadosHash);
    event RecompensaSacada(uint256 indexed tokenId, address indexed condutor, uint256 valor);
    event PrecoCarbonoAtualizado(uint256 novoPrecoWei, uint256 centavos, uint256 cotacao);
    
    // Criei esse modificador de acesso para o administrador para evitar o uso da Ownable
    modifier somenteAdmin() {
        require(msg.sender == admin, "Acao restrita ao administrador");
        _;
    }

    constructor(uint256 _centavosPorG, uint256 _cotacaoInicial, address initialAdmin)
        ERC721("CarbonCreditNFT", "CO2NFT")
    {
        admin = initialAdmin;
        
        precoCentavosPorG = _centavosPorG;
        cotacaoEthEmReais = _cotacaoInicial;
        _atualizarCarbonPricePerG();
    }

    function registrarViagemDetalhada(
        address _condutor,
        uint256 _co2MetaG,
        uint256 _economiaCO2,
        uint256 _recompensaEmWei,
        bytes32 _dadosHash
    ) external somenteAdmin returns (uint256) { 
        require(_recompensaEmWei > 0, "Recompensa deve ser positiva");
        require(_condutor != address(0), "Condutor invalido");

        uint256 tokenId = nextTokenId++;
        // O NFT é criado e atribuído diretamente ao '_condutor'
        _mint(_condutor, tokenId);

        viagemInfo[tokenId] = ViagemDetalhada({
            co2MetaG: _co2MetaG,
            economiaCO2: _economiaCO2,
            recompensa: _recompensaEmWei,
            dadosHash: _dadosHash,
            recompensaSacada: false
        });

        tokensDoCondutor[_condutor].push(tokenId);
        emit ViagemRegistrada(tokenId, _condutor, _co2MetaG, _economiaCO2, _recompensaEmWei, _dadosHash);
        return tokenId;
    }

    function sacarRecompensa(uint256 tokenId) external nonReentrant {
        // A verificação de posse do NFT garante que apenas o condutor autorizado possa sacar
        require(ownerOf(tokenId) == msg.sender, "Nao autorizado");

        ViagemDetalhada storage v = viagemInfo[tokenId];
        require(!v.recompensaSacada, "Recompensa ja sacada");
        require(v.recompensa > 0, "Sem recompensa neste NFT");
        require(address(this).balance >= v.recompensa, "Saldo insuficiente no contrato");

        v.recompensaSacada = true;

        (bool success, ) = msg.sender.call{value: v.recompensa}("");
        require(success, "Falha no pagamento");

        emit RecompensaSacada(tokenId, msg.sender, v.recompensa);
    }
     
    // --- FUNÇÕES DE ADMINISTRAÇÃO PARA O PREÇO ---
    function atualizarCotacaoEth(uint256 novaCotacaoEmReais) external somenteAdmin { 
        require(novaCotacaoEmReais > 0, "Cotacao invalida");
        cotacaoEthEmReais = novaCotacaoEmReais;
        _atualizarCarbonPricePerG();
    }

    function atualizarPrecoCentavos(uint256 novoPrecoCentavos) external somenteAdmin { 
        require(novoPrecoCentavos > 0, "Preco invalido");
        precoCentavosPorG = novoPrecoCentavos;
        _atualizarCarbonPricePerG();
    }

    function _atualizarCarbonPricePerG() internal {
        carbonPricePerG = (precoCentavosPorG * 1 ether) / (cotacaoEthEmReais * 100);
        emit PrecoCarbonoAtualizado(carbonPricePerG, precoCentavosPorG, cotacaoEthEmReais);
    }

    // --- FUNÇÕES AUXILIARES ---
    function saldoContrato() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}