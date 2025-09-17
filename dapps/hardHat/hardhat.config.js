require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
    solidity: {
        version: "0.8.19",
        settings: {
            optimizer: {
                enabled: true,
                runs: 200
            }
        }
    },
    networks: {
        // Rede Besu local (padrão)
        besu: {
            url: process.env.BESU_RPC_URL || "http://localhost:8545",
            accounts: process.env.PRIVATE_KEY ? [
                process.env.PRIVATE_KEY,
                // Adicionar outras contas do genesis para testes
                "0xc87509a1c067bbde78beb793e6fa76530b6382a4c0241e5e4a9ec0a0f44dc0d3",
                "0xae6ae8e5ccbfb04590405997ee2d52d2b330726137b875053c36d94e974d162f"
            ] : [],
            chainId: parseInt(process.env.CHAIN_ID) || 1337,
            gas: 6000000,
            gasPrice: 0
        },
        // Para desenvolvimento local com Hardhat Network
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 31337
        },
        // Exemplo para outras redes Besu
        besu_testnet: {
            url: process.env.BESU_TESTNET_RPC_URL || "http://localhost:8546",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
            chainId: parseInt(process.env.TESTNET_CHAIN_ID) || 1338,
            gas: 6000000,
            gasPrice: 0
        }
    },
    // Configurações de compilação
    paths: {
        sources: "./contracts",
        tests: "./test",
        cache: "./cache",
        artifacts: "./artifacts"
    }
};