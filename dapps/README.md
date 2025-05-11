## Tutorial de DEPLOY

- Instalar o hardhat e dependencias na pasta

```bash
npm install --save-dev hardhat @nomicfoundation/hardhat-toolbox
```

- Inicializar hardhat como empty project

```bash
npx hardhat init
```

- Configurar o hardhat.config.js

require("@nomicfoundation/hardhat-toolbox");

```bash
    require("@nomicfoundation/hardhat-toolbox");

    module.exports = {
    solidity: {
        version: "0.8.20",
        settings: {
        optimizer: {
            enabled: true,
            runs: 200
        }
        }
    },
    networks: {
        quickstart: {
        url: "http://localhost:8545",
        chainId: 1337,
        accounts: [
            "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
        ]
        }
    }
    };
```

- Coloque o contrato solidity na pasta contracts/

- Executa o script de deploy, na pasta scripts

```bash
npx hardhat run scripts/deploy_gameitem.js --network quorum-dev-quickstart
```

## Tutoriral de executar a transação

- Vá para a pasta sendTransaction

- Ative o ambiente virtual python

```bash
python3 -m venv venv
source venv/bin/activate
```

- Execute o código python

```bash
python3 transaction.py
```