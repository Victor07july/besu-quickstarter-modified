const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("CarbonCreditNFT_Final", function () {
    let carbonCredit;
    let admin;
    let condutor;
    let otherAccount;

    const CENTAVOS_POR_G = 5;
    const COTACAO_INICIAL = 15000; // R$ 150,00 em centavos

    beforeEach(async function () {
        [admin, condutor, otherAccount] = await ethers.getSigners();

        const CarbonCreditNFT = await ethers.getContractFactory("CarbonCreditNFT_Final");
        carbonCredit = await CarbonCreditNFT.deploy(
            CENTAVOS_POR_G,
            COTACAO_INICIAL,
            admin.address
        );
        await carbonCredit.waitForDeployment();
    });

    describe("Deployment", function () {
        it("Should set the right admin", async function () {
            expect(await carbonCredit.admin()).to.equal(admin.address);
        });

        it("Should set correct initial parameters", async function () {
            expect(await carbonCredit.precoCentavosPorG()).to.equal(CENTAVOS_POR_G);
            expect(await carbonCredit.cotacaoEthEmReais()).to.equal(COTACAO_INICIAL);
        });

        it("Should calculate carbon price correctly", async function () {
            const expectedPrice = (CENTAVOS_POR_G * ethers.parseEther("1")) / BigInt(COTACAO_INICIAL * 100);
            expect(await carbonCredit.carbonPricePerG()).to.equal(expectedPrice);
        });
    });

    describe("Viagem Registration", function () {
        it("Should register a trip successfully", async function () {
            const co2Meta = 1000; // 1000g
            const economia = 500; // 500g
            const recompensa = ethers.parseEther("0.1");
            const dadosHash = ethers.keccak256(ethers.toUtf8Bytes("trip_data"));

            await expect(
                carbonCredit.connect(admin).registrarViagemDetalhada(
                    condutor.address,
                    co2Meta,
                    economia,
                    recompensa,
                    dadosHash
                )
            ).to.emit(carbonCredit, "ViagemRegistrada");

            // Verificar se o NFT foi criado
            expect(await carbonCredit.balanceOf(condutor.address)).to.equal(1);
            expect(await carbonCredit.ownerOf(0)).to.equal(condutor.address);
        });

        it("Should reject registration from non-admin", async function () {
            await expect(
                carbonCredit.connect(condutor).registrarViagemDetalhada(
                    condutor.address,
                    1000,
                    500,
                    ethers.parseEther("0.1"),
                    ethers.keccak256(ethers.toUtf8Bytes("trip_data"))
                )
            ).to.be.revertedWith("Acao restrita ao administrador");
        });

        it("Should reject invalid parameters", async function () {
            // Recompensa zero
            await expect(
                carbonCredit.connect(admin).registrarViagemDetalhada(
                    condutor.address,
                    1000,
                    500,
                    0,
                    ethers.keccak256(ethers.toUtf8Bytes("trip_data"))
                )
            ).to.be.revertedWith("Recompensa deve ser positiva");

            // Condutor inválido
            await expect(
                carbonCredit.connect(admin).registrarViagemDetalhada(
                    ethers.ZeroAddress,
                    1000,
                    500,
                    ethers.parseEther("0.1"),
                    ethers.keccak256(ethers.toUtf8Bytes("trip_data"))
                )
            ).to.be.revertedWith("Condutor invalido");
        });
    });

    describe("Reward Withdrawal", function () {
        let tokenId;
        const recompensa = ethers.parseEther("0.1");

        beforeEach(async function () {
            // Registrar uma viagem
            const tx = await carbonCredit.connect(admin).registrarViagemDetalhada(
                condutor.address,
                1000,
                500,
                recompensa,
                ethers.keccak256(ethers.toUtf8Bytes("trip_data"))
            );
            const receipt = await tx.wait();
            tokenId = 0; // Primeiro token

            // Adicionar fundos ao contrato
            await admin.sendTransaction({
                to: await carbonCredit.getAddress(),
                value: ethers.parseEther("1")
            });
        });

        it("Should allow token owner to withdraw reward", async function () {
            const balanceBefore = await ethers.provider.getBalance(condutor.address);

            await expect(
                carbonCredit.connect(condutor).sacarRecompensa(tokenId)
            ).to.emit(carbonCredit, "RecompensaSacada");

            const viagemInfo = await carbonCredit.viagemInfo(tokenId);
            expect(viagemInfo.recompensaSacada).to.be.true;
        });

        it("Should reject withdrawal from non-owner", async function () {
            await expect(
                carbonCredit.connect(otherAccount).sacarRecompensa(tokenId)
            ).to.be.revertedWith("Nao autorizado");
        });

        it("Should reject double withdrawal", async function () {
            await carbonCredit.connect(condutor).sacarRecompensa(tokenId);

            await expect(
                carbonCredit.connect(condutor).sacarRecompensa(tokenId)
            ).to.be.revertedWith("Recompensa ja sacada");
        });

        it("Should reject withdrawal when contract has insufficient balance", async function () {
            // Drenar o contrato
            const contractBalance = await ethers.provider.getBalance(await carbonCredit.getAddress());
            // Como não há função de saque admin, vamos registrar uma viagem com recompensa maior que o saldo

            await carbonCredit.connect(admin).registrarViagemDetalhada(
                otherAccount.address,
                1000,
                500,
                contractBalance + ethers.parseEther("1"), // Maior que o saldo
                ethers.keccak256(ethers.toUtf8Bytes("trip_data_2"))
            );

            await expect(
                carbonCredit.connect(otherAccount).sacarRecompensa(1)
            ).to.be.revertedWith("Saldo insuficiente no contrato");
        });
    });

    describe("Price Management", function () {
        it("Should update ETH quotation", async function () {
            const novaCotacao = 20000; // R$ 200,00

            await expect(
                carbonCredit.connect(admin).atualizarCotacaoEth(novaCotacao)
            ).to.emit(carbonCredit, "PrecoCarbonoAtualizado");

            expect(await carbonCredit.cotacaoEthEmReais()).to.equal(novaCotacao);
        });

        it("Should update price in centavos", async function () {
            const novoPreco = 10; // 10 centavos

            await expect(
                carbonCredit.connect(admin).atualizarPrecoCentavos(novoPreco)
            ).to.emit(carbonCredit, "PrecoCarbonoAtualizado");

            expect(await carbonCredit.precoCentavosPorG()).to.equal(novoPreco);
        });

        it("Should reject price updates from non-admin", async function () {
            await expect(
                carbonCredit.connect(condutor).atualizarCotacaoEth(20000)
            ).to.be.revertedWith("Acao restrita ao administrador");

            await expect(
                carbonCredit.connect(condutor).atualizarPrecoCentavos(10)
            ).to.be.revertedWith("Acao restrita ao administrador");
        });
    });

    describe("Contract Balance", function () {
        it("Should receive ETH", async function () {
            const amount = ethers.parseEther("1");

            await admin.sendTransaction({
                to: await carbonCredit.getAddress(),
                value: amount
            });

            expect(await carbonCredit.saldoContrato()).to.equal(amount);
        });

        it("Should return correct balance", async function () {
            expect(await carbonCredit.saldoContrato()).to.equal(0);

            const amount = ethers.parseEther("0.5");
            await admin.sendTransaction({
                to: await carbonCredit.getAddress(),
                value: amount
            });

            expect(await carbonCredit.saldoContrato()).to.equal(amount);
        });
    });
});