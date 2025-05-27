// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

contract CarbonCreditNFT is ERC721, Ownable, ReentrancyGuard {
    uint256 public carbonPricePerG; // // em wei
    uint256 public precoCentavosPorG; // Preço desejado em centavos por g
    uint256 public cotacaoEthEmReais; // Cotação do ETH em reais (ex: 15000 = R$15.000)
    uint256 public nextTokenId;

    enum Combustivel {
        Gasolina,
        Etanol,
        Diesel,
        Eletrico
    }

    struct ViagemData {
        uint256 co2RealG;
        uint256 co2MetaG;
        uint256 recompensa;
        uint256 economia;
        bool recompensaSacada;
    }

    struct Veiculo {
        Combustivel combustivel;
        uint256 fatorEmissaoGCO2PorKm; // baseado no modelo e combustível do carro, em gCO2/km
        bool registrado;
    }

    mapping(address => mapping(uint256 => Veiculo)) public veiculos;
    mapping(address => uint256[]) public veiculosDoCondutor;
    mapping(uint256 => ViagemData) public viagemInfo;
    mapping(address => uint256[]) public tokensDoCondutor;

    event ViagemRegistrada(
        uint256 tokenId,
        address condutor,
        uint256 co2RealG,
        uint256 co2MetaG,
        uint256 recompensa,
        uint256 economia
    );
    event RecompensaSacada(uint256 tokenId, address condutor, uint256 valor);
    event VeiculoRegistrado(
        address condutor,
        uint256 idVeiculo,
        Combustivel combustivel,
        uint256 fator
    );
    event PrecoCarbonoAtualizado(
        uint256 novoPrecoWei,
        uint256 centavos,
        uint256 cotacao
    );

    constructor(
        uint256 _centavosPorG,
        uint256 _cotacaoInicial,
        address initialOwner
    ) ERC721("CarbonCreditNFT", "CO2NFT") Ownable(initialOwner) {
        precoCentavosPorG = _centavosPorG;
        cotacaoEthEmReais = _cotacaoInicial;
        _atualizarCarbonPricePerG();
    }

    // *****
    // ATUALIZAÇÃO: Prevenir veículos duplicados

    function registrarVeiculo(
        address _condutor,
        uint256 idVeiculo,
        Combustivel _combustivel,
        uint256 _fatorGCO2PorKm
    ) external onlyOwner {
        require(_fatorGCO2PorKm > 0, "Fator de emissao invalido");
        require(
            !veiculos[_condutor][idVeiculo].registrado,
            "Veiculo ja registrado"
        );

        veiculos[_condutor][idVeiculo] = Veiculo({
            combustivel: _combustivel,
            fatorEmissaoGCO2PorKm: _fatorGCO2PorKm,
            registrado: true
        });
        veiculosDoCondutor[_condutor].push(idVeiculo);

        emit VeiculoRegistrado(
            _condutor,
            idVeiculo,
            _combustivel,
            _fatorGCO2PorKm
        );
    }

    // ATUALIZAÇÃO: Verificar veículos do condutor
    function getVeiculosDoCondutor(
        address _condutor
    ) external view returns (uint256[] memory) {
        require(
            msg.sender == _condutor || msg.sender == owner(),
            "Apenas o proprio condutor ou o dono do contrato podem consultar"
        );

        return veiculosDoCondutor[_condutor];
    }

    // *****

    function registrarViagem(
        address _condutor,
        uint256 idVeiculo,
        uint256 _distanciaKm,
        uint256 _co2RealG
    ) external onlyOwner returns (uint256) {
        require(_distanciaKm > 0, "Distancia deve ser positiva");
        require(_co2RealG >= 0, "CO2 real invalido");
        require(
            veiculos[_condutor][idVeiculo].registrado,
            "Veiculo nao registrado"
        );

        Veiculo memory veiculo = veiculos[_condutor][idVeiculo];

        uint256 co2MetaG = veiculo.fatorEmissaoGCO2PorKm * _distanciaKm;
        uint256 economia = co2MetaG > _co2RealG ? (co2MetaG - _co2RealG) : 0;
        uint256 recompensa = economia * carbonPricePerG;

        uint256 tokenId = nextTokenId++;
        _mint(_condutor, tokenId);

        viagemInfo[tokenId] = ViagemData({
            co2RealG: _co2RealG,
            co2MetaG: co2MetaG,
            recompensa: recompensa,
            economia: economia,
            recompensaSacada: false
        });

        tokensDoCondutor[_condutor].push(tokenId);

        emit ViagemRegistrada(
            tokenId,
            _condutor,
            _co2RealG,
            co2MetaG,
            recompensa,
            economia
        );
        return tokenId;
    }

    function sacarRecompensa(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Nao autorizado");

        ViagemData storage v = viagemInfo[tokenId];
        require(!v.recompensaSacada, "Recompensa ja sacada");

        if (v.recompensa == 0) {
            revert("Sem recompensa nesta viagem");
        }

        require(
            address(this).balance >= v.recompensa,
            "Saldo insuficiente no contrato"
        );

        v.recompensaSacada = true;

        (bool success, ) = msg.sender.call{value: v.recompensa}("");
        require(success, "Falha no pagamento");

        emit RecompensaSacada(tokenId, msg.sender, v.recompensa);
    }

    function tokensDisponiveisParaSaque(
        address _condutor
    ) external view returns (uint256[] memory) {
        require(
            msg.sender == _condutor || msg.sender == owner(),
            "Apenas o proprio condutor ou o dono do contrato podem consultar"
        );

        uint256[] memory todos = tokensDoCondutor[_condutor];
        uint256 count;
        for (uint256 i = 0; i < todos.length; i++) {
            if (
                !viagemInfo[todos[i]].recompensaSacada &&
                viagemInfo[todos[i]].recompensa > 0
            ) {
                count++;
            }
        }

        uint256[] memory disponiveis = new uint256[](count);
        uint256 j;
        for (uint256 i = 0; i < todos.length; i++) {
            if (
                !viagemInfo[todos[i]].recompensaSacada &&
                viagemInfo[todos[i]].recompensa > 0
            ) {
                disponiveis[j++] = todos[i];
            }
        }

        return disponiveis;
    }

    function atualizarCotacaoEth(
        uint256 novaCotacaoEmReais
    ) external onlyOwner {
        require(novaCotacaoEmReais > 0, "Cotacao invalida");
        cotacaoEthEmReais = novaCotacaoEmReais;
        _atualizarCarbonPricePerG();
    }

    function atualizarPrecoCentavos(
        uint256 novoPrecoCentavos
    ) external onlyOwner {
        require(novoPrecoCentavos > 0, "Preco invalido");
        precoCentavosPorG = novoPrecoCentavos;
        _atualizarCarbonPricePerG();
    }

    function _atualizarCarbonPricePerG() internal {
        // Convertendo centavos -> reais -> ETH -> wei
        // (centavos * 1 ether) / (cotacao * 100)
        carbonPricePerG =
            (precoCentavosPorG * 1 ether) /
            (cotacaoEthEmReais * 100);
        emit PrecoCarbonoAtualizado(
            carbonPricePerG,
            precoCentavosPorG,
            cotacaoEthEmReais
        );
    }

    function saldoContrato() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}
}
