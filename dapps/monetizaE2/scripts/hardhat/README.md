# Deploy com Hardhat - CarbonCreditNFT_Fabric

Este guia mostra como fazer deploy e interagir com o contrato usando Hardhat.

## 🚀 Setup Inicial

### 1. Instalar dependências
```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
npm install dotenv
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env
# Edite o arquivo .env com suas configurações
```

### 3. Compilar o contrato
```bash
npx hardhat compile
```

## 📦 Deploy

### Deploy local (rede Hardhat)
```bash
npx hardhat run scripts/hardhat/deploy.js --network hardhat
```

### Deploy no Besu local
```bash
npx hardhat run scripts/hardhat/deploy.js --network besu
```

### Deploy personalizado
```bash
# Configurar variáveis específicas
export CARBON_PRICE_EUR=75000000    # 75 EUR/ton
export EUR_BRL_RATE=5500000         # 5.5 BRL/EUR
export FUND_AMOUNT=2.0              # 2 ETH para o contrato

npx hardhat run scripts/hardhat/deploy.js --network besu
```

## 🔄 Interação

### Interagir com contrato deployado
```bash
# Usar endereço do deploy
export CONTRACT_ADDRESS=0x5FbDB2315678afecb367f032d93F642f64180aa3

npx hardhat run scripts/hardhat/interact.js --network besu
```

## 📋 Comandos Úteis

### Console interativo
```bash
npx hardhat console --network besu
```

### Verificar saldo de contas
```bash
npx hardhat run scripts/hardhat/check-balances.js --network besu
```

### Limpar cache
```bash
npx hardhat clean
```

### Executar testes
```bash
npx hardhat test
```

## 🛠️ Estrutura de Arquivos

```
dapps/monetizaE2/
├── contracts/
│   └── CarbonCreditNFT_e2.sol      # Contrato principal
├── scripts/
│   └── hardhat/
│       ├── deploy.js               # Script de deploy
│       ├── interact.js             # Script de interação
│       └── check-balances.js       # Verificar saldos
├── hardhat.config.js               # Configuração Hardhat
├── .env.example                    # Exemplo de variáveis
└── package.json                    # Dependências
```

## 🔧 Configurações de Rede

### Besu Local
```javascript
besu: {
  url: "http://localhost:8545",
  accounts: [process.env.PRIVATE_KEY],
  chainId: 1337
}
```

### Localhost
```javascript
localhost: {
  url: "http://127.0.0.1:8545",
  chainId: 31337
}
```

## 📊 Exemplo de Uso Completo

```javascript
// 1. Deploy do contrato
const { contract } = await require('./scripts/hardhat/deploy.js').main();

// 2. Tokenizar crédito de carbono
const tokenId = await contract.calculateE1AndTokenize(
    "HONDA_CIVIC_2024",              // vehicleId
    "0xConductorAddress",            // condutor
    100000000,                       // 100 km highway
    50000000,                        // 50 km city
    27000000,                        // 27% ethanol
    15000000000,                     // 15 kg CO2 original
    15000000,                        // 15 km/L road gasoline
    10000000,                        // 10 km/L road ethanol
    12000000,                        // 12 km/L city gasoline
    8000000,                         // 8 km/L city ethanol
    73000000,                        // 73% gasoline
    "2024-01-01T10:00:00Z"           // timestamp
);

// 3. Consultar dados
const dados = await contract.getDadosCarbonizacao(tokenId);
const status = await contract.getStatusRecompensa(tokenId);

// 4. Sacar recompensa
await contract.sacarRecompensa(tokenId);
```

## 🎯 Parâmetros com 6 Decimais

Todos os valores numéricos usam **6 decimais** para precisão:

```javascript
// Exemplos de conversão
const km = 100;           // 100 km
const kmWith6Decimals = km * 1e6;  // 100000000

const percent = 27;       // 27%
const percentWith6Decimals = percent * 1e6;  // 27000000

const consumption = 15;   // 15 km/L
const consumptionWith6Decimals = consumption * 1e6;  // 15000000
```

## 🔍 Debug e Troubleshooting

### Ver logs detalhados
```bash
npx hardhat run scripts/hardhat/deploy.js --network besu --verbose
```

### Verificar gas usado
```bash
REPORT_GAS=true npx hardhat test
```

### Console para debug
```bash
npx hardhat console --network besu

# Dentro do console:
const CarbonCredit = await ethers.getContractAt("CarbonCreditNFT_FabricEquivalent", "CONTRACT_ADDRESS");
const state = await CarbonCredit.getContractState();
console.log(state);
```

## 📱 Scripts Adicionais

### Atualizar cotações
```javascript
await contract.updateCotacoes(
    75000000,  // 75 EUR/ton
    5500000    // 5.5 BRL/EUR
);
```

### Autorizar novos endereços
```javascript
await contract.setAuthorized("0xNewAddress", true);
```

### Consultar tokens de um condutor
```javascript
const balance = await contract.balanceOf("0xConductorAddress");
const tokenId = await contract.tokenOfOwnerByIndex("0xConductorAddress", 0);
```