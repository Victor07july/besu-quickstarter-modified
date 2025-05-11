require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.20",
  networks: {
    quickstart: {
      url: "http://localhost:8545",
      chainId: 1337,
      accounts: [
        // Adicione as chaves privadas das contas que você quer usar
        "0x8f2a55949038a9610f50fb23b5883af3b4ecb3c3bb792cbcefbd1542c692be63"
      ]
    }
  },
  sourcify: {
    enabled: true,
  }
};