# Carbon Credit NFT - Projeto Hardhat

Este projeto implementa um sistema de NFTs para créditos de carbono na rede Besu usando Hardhat.

## 📁 Estrutura do Projeto

```
dapps/hardHat/
├── contracts/              # Contratos Solidity
│   └── CarbonCredit.sol    # Contrato principal do Carbon Credit NFT
├── scripts/                # Scripts de deploy e utilitários
│   ├── deploy.js          # Script de deploy do contrato
│   └── verify.js          # Script de verificação pós-deploy
├── test/                   # Testes automatizados
│   └── CarbonCredit.test.js # Testes do contrato principal
├── hardhat.config.js       # Configuração do Hardhat
├── package.json           # Dependências do projeto
├── .env                   # Variáveis de ambiente
└── README.md             # Este arquivo
```

## 🚀 Instalação e Configuração

### 1. Instalar Dependências

```bash
cd /home/inmetro/besu-quickstarter-modified/dapps/hardHat
npm install
```

### 2. Configurar Variáveis de Ambiente

Edite o arquivo `.env` com suas configurações:

```env
# URL do RPC da rede Besu
BESU_RPC_URL=http://localhost:8545

# Chave privada para deploy (USE UMA CHAVE DE TESTE!)
PRIVATE_KEY=0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63

# Chain ID da rede Besu
CHAIN_ID=1337

# Endereço do administrador do contrato
ADMIN_ADDRESS=0xfe3b557e8fb62b89f4916b721be55ceb828dbd73
```

## 🔧 Comandos Disponíveis

### Compilação
```bash
npm run compile
# ou
npx hardhat compile
```

### Deploy na Rede Besu
```bash
npm run deploy
# ou
npx hardhat run scripts/deploy.js --network besu
```

### Deploy Local (Hardhat Network)
```bash
npm run deploy:local
# ou
npx hardhat run scripts/deploy.js --network localhost
```

### Verificação do Contrato
```bash
npm run verify
# ou
npx hardhat run scripts/verify.js --network besu
```

### Executar Testes
```bash
npm test
# ou
npx hardhat test
```

### Iniciar Rede Local
```bash
npm run node
# ou
npx hardhat node
```

## 📋 Pré-requisitos

1. **Rede Besu em funcionamento**
   - Certifique-se de que sua rede Besu está rodando e acessível
   - Verifique se a URL do RPC está correta no `.env`

2. **Conta com saldo**
   - A conta especificada em `PRIVATE_KEY` deve ter ETH suficiente para o deploy
   - Para redes Besu locais, geralmente o gas price é 0

3. **Node.js e npm**
   - Node.js versão 16 ou superior
   - npm ou yarn instalado

## 🎯 Funcionalidades do Contrato

### CarbonCreditNFT_Final

- **Registro de Viagens**: Apenas o admin pode registrar viagens e emitir NFTs
- **Saque de Recompensas**: Portadores de NFTs podem sacar suas recompensas
- **Gestão de Preços**: Admin pode atualizar preços e cotações
- **Segurança**: Proteção contra reentrância e validações completas

### Parâmetros Principais

- `centavosPorG`: Preço em centavos por grama de CO2
- `cotacaoInicial`: Cotação do ETH em centavos (R$)
- `adminAddress`: Endereço do administrador do contrato

## 📊 Exemplo de Uso

### 1. Deploy do Contrato
```bash
npm run deploy
```

### 2. Adicionar Fundos ao Contrato
```javascript
// Via script ou interface
await admin.sendTransaction({
  to: contractAddress,
  value: ethers.parseEther("10") // 10 ETH
});
```

### 3. Registrar uma Viagem
```javascript
await carbonCredit.registrarViagemDetalhada(
  condutorAddress,
  1000, // 1000g CO2 meta
  500,  // 500g economia
  ethers.parseEther("0.1"), // 0.1 ETH recompensa
  dataHash
);
```

### 4. Sacar Recompensa
```javascript
await carbonCredit.connect(condutor).sacarRecompensa(tokenId);
```

## 🔒 Segurança

- ⚠️ **NUNCA** commite chaves privadas reais no git
- ✅ Use sempre chaves de teste em desenvolvimento
- ✅ Valide todos os endereços antes do deploy
- ✅ Teste em rede local antes do deploy em produção

## 📝 Notas Importantes

1. **Saldo do Contrato**: O contrato precisa ter ETH suficiente para pagar as recompensas
2. **Permissões**: Apenas o admin pode registrar viagens
3. **NFTs**: Cada viagem gera um NFT único para o condutor
4. **Recompensas**: Só podem ser sacadas uma vez por NFT

## 🐛 Solução de Problemas

### Erro: "Insufficient funds"
- Verifique se a conta tem ETH suficiente para o deploy

### Erro: "Network not found"
- Verifique se a rede Besu está rodando
- Confirme a URL do RPC no `.env`

### Erro: "Invalid private key"
- Verifique se a chave privada está no formato correto (0x...)
- Confirme se a chave corresponde a uma conta válida