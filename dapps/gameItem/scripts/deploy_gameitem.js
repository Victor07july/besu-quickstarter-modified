const hre = require("hardhat");
const fs = require("fs/promises");

async function main() {
    // Get the contract factory
    const GameItem = await hre.ethers.getContractFactory("GameItem");

    // Deploy the contract
    const gameItem = await GameItem.deploy();

    console.log("GameItem deployed to:", await gameItem.getAddress());

    // Wait for deployment to finish
    await gameItem.waitForDeployment();

    // Save deployment info
    await writeDeploymentInfo(gameItem, "gameitem-contract.json");
}

async function writeDeploymentInfo(contract, filename = "") {
    const data = {
        network: hre.network.name,
        contract: {
            address: await contract.getAddress(),
            signerAddress: await contract.runner.address,
            abi: await contract.interface.format()
        }
    };

    const content = JSON.stringify(data, null, 2);
    await fs.writeFile(filename, content, { encoding: "utf-8" });
}

// Execute deploy
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });