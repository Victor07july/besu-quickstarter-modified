# Script de Interação - interact.js

Este documento explica o funcionamento do script `interact.js`, que demonstra como interagir com o contrato `CarbonCreditNFT_Final` após o deploy.

## 📋 Visão Geral

O script `interact.js` executa um fluxo completo de teste do contrato, simulando o processo real de:
1. Registro de viagens ecológicas
2. Criação de NFTs de crédito de carbono
3. Saque de recompensas pelos condutores

## 🚀 Como Executar

```bash
cd /home/inmetro/besu-quickstarter-modified/dapps/hardHat
npm run interact
```

## 🔧 Funcionamento Passo a Passo

### 1. **Configuração Inicial**
```javascript
// Lê informações do deploy
const deployData = fs.readFileSync(`./deployments-${hre.network.name}.json`, 'utf8');
const deployInfo = JSON.parse(deployData);
```
- Carrega o endereço do contrato do arquivo de deploy
- Conecta às contas disponíveis (admin, condutor, etc.)
- Instancia o contrato para interação

### 2. **Verificação de Saldo do Contrato**
```javascript
const saldoContrato = await CarbonCredit.saldoContrato();
console.log("💰 Saldo atual:", hre.ethers.formatEther(saldoContrato), "ETH");
```
**O que faz:**
- Verifica quanto ETH o contrato possui
- Esse saldo é usado para pagar recompensas aos condutores

### 3. **Adição de Fundos (Se Necessário)**
```javascript
if (saldoContrato < hre.ethers.parseEther("1")) {
    const tx = await admin.sendTransaction({
        to: contractAddress,
        value: hre.ethers.parseEther("5") // 5 ETH
    });
}
```
**O que faz:**
- Se o contrato tem menos de 1 ETH, adiciona 5 ETH
- Garante que há fundos suficientes para pagar recompensas
- Apenas o admin pode adicionar fundos via transferência direta

### 4. **Registro de uma Viagem Ecológica**
```javascript
const registroTx = await CarbonCredit.connect(admin).registrarViagemDetalhada(
    condutor.address,  // Quem fez a viagem
    co2Meta,          // Meta de CO2 da viagem (1000g)
    economiaCO2,      // CO2 economizado (500g)
    recompensa,       // Recompensa em ETH (0.1 ETH)
    dadosHash         // Hash dos dados da viagem
);
```
**O que faz:**
- Apenas o admin pode registrar viagens
- Cria um NFT único para a viagem
- Associa os dados da viagem ao NFT
- Emite evento `ViagemRegistrada`

**Parâmetros:**
- `condutor.address`: Endereço de quem receberá o NFT
- `co2Meta`: Meta de emissão de CO2 para a viagem (em gramas)
- `economiaCO2`: Quantidade de CO2 economizada (em gramas)
- `recompensa`: Valor da recompensa em Wei
- `dadosHash`: Hash criptográfico dos dados da viagem

### 5. **Captura do Token ID**
```javascript
const viagemEvent = receipt.logs.find(log => {
    try {
        const parsed = CarbonCredit.interface.parseLog(log);
        return parsed.name === 'ViagemRegistrada';
    } catch (e) {
        return false;
    }
});
```
**O que faz:**
- Procura o evento `ViagemRegistrada` nos logs da transação
- Extrai o `tokenId` do NFT criado
- Usado para operações subsequentes

### 6. **Verificação das Informações da Viagem**
```javascript
const viagemInfo = await CarbonCredit.viagemInfo(tokenId);
```
**O que faz:**
- Consulta os dados armazenados para a viagem
- Mostra: CO2 meta, economia, recompensa, status de saque
- Verifica se os dados foram registrados corretamente

### 7. **Verificação da Propriedade do NFT**
```javascript
const owner = await CarbonCredit.ownerOf(tokenId);
const balance = await CarbonCredit.balanceOf(condutor.address);
```
**O que faz:**
- Confirma que o condutor é dono do NFT
- Verifica quantos NFTs o condutor possui
- Valida que o NFT foi criado corretamente

### 8. **Saque da Recompensa**
```javascript
const saqueTx = await CarbonCredit.connect(condutor).sacarRecompensa(tokenId);
```
**O que faz:**
- Permite que o dono do NFT saque sua recompensa
- Transfere ETH do contrato para o condutor
- Marca a recompensa como "já sacada"
- Emite evento `RecompensaSacada`

**Validações:**
- Apenas o dono do NFT pode sacar
- Recompensa só pode ser sacada uma vez
- Contrato deve ter saldo suficiente

### 9. **Verificação Final**
```javascript
const viagemFinal = await CarbonCredit.viagemInfo(tokenId);
console.log("🔒 Recompensa sacada?", viagemFinal.recompensaSacada);
```
**O que faz:**
- Confirma que o status foi atualizado
- Verifica saldo final do contrato
- Mostra o resultado completo da operação

## 📊 Dados de Exemplo Utilizados

### Viagem Simulada:
- **CO2 Meta**: 1.000g (meta de emissão)
- **Economia de CO2**: 500g (economia real)
- **Recompensa**: 0.1 ETH
- **Hash dos Dados**: Hash de "viagem_eco_001"

### Contas Utilizadas:
- **Admin**: `0xfe3b557e8fb62b89f4916b721be55ceb828dbd73`
- **Condutor**: `0x627306090abaB3A6e1400e9345bC60c78a8BEf57`

## 🔒 Validações de Segurança

### 1. **Controle de Acesso**
- Apenas admin pode registrar viagens
- Apenas dono do NFT pode sacar recompensa

### 2. **Proteção contra Duplo Saque**
- Sistema verifica se recompensa já foi sacada
- Status permanente no blockchain

### 3. **Verificação de Saldo**
- Contrato deve ter ETH suficiente
- Falha segura se não houver fundos

### 4. **Proteção contra Reentrância**
- Contrato usa `ReentrancyGuard`
- Previne ataques de reentrada

## 📈 Eventos Emitidos

### ViagemRegistrada
```solidity
event ViagemRegistrada(
    uint256 indexed tokenId,
    address indexed condutor,
    uint256 co2MetaG,
    uint256 economiaCO2,
    uint256 recompensa,
    bytes32 dadosHash
);
```

### RecompensaSacada
```solidity
event RecompensaSacada(
    uint256 indexed tokenId,
    address indexed condutor,
    uint256 valor
);
```

## 🐛 Tratamento de Erros

### Erros Comuns:
1. **"Arquivo de deploy não encontrado"**
   - Execute `npm run deploy` primeiro

2. **"Saldo insuficiente no contrato"**
   - O contrato precisa de ETH para pagar recompensas

3. **"Nao autorizado"**
   - Apenas o dono do NFT pode sacar

4. **"Recompensa ja sacada"**
   - Cada recompensa só pode ser sacada uma vez

## 💡 Uso em Produção

Este script serve como:
- **Exemplo** de integração com o contrato
- **Teste** de funcionalidades
- **Base** para desenvolver interfaces
- **Documentação** viva do fluxo de negócio

## 🔧 Personalização

Para adaptar o script:

1. **Modificar parâmetros da viagem:**
```javascript
const co2Meta = 2000; // Alterar valores
const economiaCO2 = 800;
const recompensa = hre.ethers.parseEther("0.2");
```

2. **Usar diferentes contas:**
```javascript
const condutor = signers[2]; // Usar terceira conta
```

3. **Adicionar mais operações:**
```javascript
// Registrar múltiplas viagens
// Testar diferentes cenários
// Validar edge cases
```

## 📚 Referência das Funções

### Funções do Contrato Utilizadas:
- `saldoContrato()`: Consulta saldo do contrato
- `registrarViagemDetalhada()`: Registra nova viagem
- `viagemInfo()`: Consulta dados da viagem
- `ownerOf()`: Verifica dono do NFT
- `balanceOf()`: Conta NFTs de um endereço
- `sacarRecompensa()`: Saca recompensa do NFT

### Funções do Ethers.js:
- `getSigners()`: Obtém contas disponíveis
- `getContractAt()`: Conecta a contrato existente
- `parseEther()`: Converte ETH para Wei
- `formatEther()`: Converte Wei para ETH
- `keccak256()`: Gera hash criptográfico

Este script demonstra o ciclo completo de vida de um crédito de carbono NFT, desde a criação até o saque da recompensa! 🌱