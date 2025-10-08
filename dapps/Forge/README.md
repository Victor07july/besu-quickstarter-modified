# Deploy do CarbonCredit com Foundry

Este guia mostra como fazer deploy do contrato CarbonCredit usando Foundry (forge).

## Pré-requisitos

### 1. Instalar Foundry
```bash
curl -L https://foundry.paradigm.xyz | bash
foundryup
```

### 2. Instalar dependências
No diretório `/dapps/Forge/`:
```bash
forge install OpenZeppelin/openzeppelin-contracts@v4.9.5
forge install foundry-rs/forge-std
```

### 3. Compilar o contrato
```bash
forge build
```

### 4. Rodar testes
```bash
forge test -vv
```

## Deploy

### 1. Configurar variáveis de ambiente

Crie um arquivo `.env` ou configure as variáveis:
```bash
# Chave privada do deployer
export PRIVATE_KEY=0xsua_chave_privada_aqui

# URL do RPC (Besu local exemplo)
export RPC_URL=http://localhost:8545

# Parâmetros do contrato (opcionais - há defaults)
export PRECO_CENTAVOS=5      # 5 centavos por grama de CO2
export COTACAO_INICIAL=15000 # R$ 15.000 por ETH
```

### 2. Executar o deploy
```bash
forge script script/DeployCarbonCredit.s.sol:DeployCarbonCredit --rpc-url $RPC_URL --broadcast
```

Para fazer apenas simulação (sem broadcast):
```bash
forge script script/DeployCarbonCredit.s.sol:DeployCarbonCredit --rpc-url $RPC_URL
```

### 3. Verificar deployment
O script mostrará:
- Endereço do contrato deployado
- Endereço do admin
- Preço do carbono por grama em wei

### 4. Funding o contrato
Para permitir pagamento de recompensas, envie ETH ao contrato:
```bash
cast send <ENDERECO_CONTRATO> --value 1ether --private-key $PRIVATE_KEY --rpc-url $RPC_URL
```

## Uso básico

### Registrar uma viagem (como admin)
```bash
cast send <ENDERECO_CONTRATO> \
  "registrarViagemDetalhada(address,uint256,uint256,uint256,bytes32)" \
  <ENDERECO_CONDUTOR> \
  1000 \
  500 \
  100000000000000000 \
  0x$(echo -n "dados-viagem-123" | xxd -p) \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL
```

### Sacar recompensa (como condutor)
```bash
cast send <ENDERECO_CONTRATO> \
  "sacarRecompensa(uint256)" \
  0 \
  --private-key <PRIVATE_KEY_CONDUTOR> \
  --rpc-url $RPC_URL
```

### Consultar saldo do contrato
```bash
cast call <ENDERECO_CONTRATO> "saldoContrato()" --rpc-url $RPC_URL
```

### Atualizar cotação ETH/BRL (como admin)
```bash
cast send <ENDERECO_CONTRATO> \
  "atualizarCotacaoEth(uint256)" \
  20000 \
  --private-key $PRIVATE_KEY \
  --rpc-url $RPC_URL
```

## Estrutura do projeto
```
dapps/Forge/
├── CarbonCredit.sol           # Contrato principal
├── foundry.toml               # Configuração Foundry
├── script/
│   └── DeployCarbonCredit.s.sol  # Script de deploy
├── test/
│   └── CarbonCredit.t.sol     # Testes
└── lib/                       # Dependências (criado pelo forge install)
    ├── openzeppelin-contracts/
    └── forge-std/
```

## Parâmetros do contrato

- `precoCentavosPorG`: Preço em centavos de real por grama de CO2
- `cotacaoEthEmReais`: Cotação ETH/BRL (ex: 15000 = R$ 15.000 por ETH)
- `carbonPricePerG`: Calculado automaticamente = (precoCentavos * 1e18) / (cotacao * 100)

## Comandos úteis

### Ver eventos do contrato
```bash
cast logs --from-block 0 --address <ENDERECO_CONTRATO> --rpc-url $RPC_URL
```

### Ver informações de um NFT
```bash
cast call <ENDERECO_CONTRATO> "viagemInfo(uint256)" 0 --rpc-url $RPC_URL
```

### Ver tokens de um condutor
```bash
cast call <ENDERECO_CONTRATO> "tokensDoCondutor(address,uint256)" <ENDERECO_CONDUTOR> 0 --rpc-url $RPC_URL
```
