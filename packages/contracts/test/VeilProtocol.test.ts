import "@nomicfoundation/hardhat-chai-matchers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { anyValue } from "@nomicfoundation/hardhat-chai-matchers/withArgs";
import { VEILToken, VEILTreasury, VeilStaking, VEILNodeRegistry } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

const TOTAL_SUPPLY = ethers.parseEther("1000000000");
const TREASURY_AMOUNT = ethers.parseEther("220000000"); // 22%

describe("Veil PQC Protocol", () => {
  let owner: HardhatEthersSigner;
  let user1: HardhatEthersSigner;
  let user2: HardhatEthersSigner;

  let veilToken: VEILToken;
  let veilTreasury: VEILTreasury;
  let veilStaking: VeilStaking;
  let veilNodeRegistry: VEILNodeRegistry;

  // ─── x402PQCPayments ─────────────────────────────────────────────────────────

  describe("x402PQCPayments", () => {
    it("renounceOwnership() always reverts", async () => {
      const [signer] = await ethers.getSigners();
      const Factory = await ethers.getContractFactory("x402PQCPayments");
      const contract = await Factory.deploy(signer.address);
      await contract.waitForDeployment();

      let errorMsg = "";
      try {
        await contract.renounceOwnership();
      } catch (err: unknown) {
        errorMsg = (err as Error).message ?? "";
      }
      expect(errorMsg).to.include("disabled");
    });
  });

  beforeEach(async () => {
    [owner, user1, user2] = await ethers.getSigners();

    const VEILTokenFactory = await ethers.getContractFactory("VEILToken");
    veilToken = (await VEILTokenFactory.deploy(owner.address)) as unknown as VEILToken;

    const VEILTreasuryFactory = await ethers.getContractFactory("VEILTreasury");
    veilTreasury = (await VEILTreasuryFactory.deploy(owner.address, await veilToken.getAddress())) as unknown as VEILTreasury;

    const VeilStakingFactory = await ethers.getContractFactory("VeilStaking");
    veilStaking = (await VeilStakingFactory.deploy(owner.address, await veilToken.getAddress())) as unknown as VeilStaking;

    const VEILNodeRegistryFactory = await ethers.getContractFactory("VEILNodeRegistry");
    veilNodeRegistry = (await VEILNodeRegistryFactory.deploy(owner.address)) as unknown as VEILNodeRegistry;

    await veilToken.transfer(await veilTreasury.getAddress(), TREASURY_AMOUNT);
  });

  // ─── VEILToken ───────────────────────────────────────────────────────────────

  describe("VEILToken", () => {
    it("has correct name and symbol", async () => {
      expect(await veilToken.name()).to.equal("Veil");
      expect(await veilToken.symbol()).to.equal("VEIL");
    });

    it("total supply is exactly 1,000,000,000 VEIL", async () => {
      expect(await veilToken.totalSupply()).to.equal(TOTAL_SUPPLY);
    });

    it("mints entire supply to deployer", async () => {
      const deployerBalance = await veilToken.balanceOf(owner.address);
      expect(deployerBalance).to.equal(TOTAL_SUPPLY - TREASURY_AMOUNT);
    });

    it("has 18 decimals", async () => {
      expect(await veilToken.decimals()).to.equal(18n);
    });

    it("allows holder to burn their own tokens", async () => {
      const burnAmount = ethers.parseEther("1000");
      await veilToken.burn(burnAmount);
      expect(await veilToken.totalSupply()).to.equal(TOTAL_SUPPLY - burnAmount);
    });

    it("allows burnFrom with approval", async () => {
      const burnAmount = ethers.parseEther("500");
      await veilToken.transfer(user1.address, burnAmount);
      await veilToken.connect(user1).approve(owner.address, burnAmount);
      await veilToken.burnFrom(user1.address, burnAmount);
      expect(await veilToken.balanceOf(user1.address)).to.equal(0n);
    });

    it("does not have a mint function", () => {
      const iface = veilToken.interface;
      const mintFragment = iface.getFunction("mint" as never);
      expect(mintFragment).to.be.null;
    });
  });

  // ─── VEILTreasury ────────────────────────────────────────────────────────────

  describe("VEILTreasury", () => {
    it("holds 22% of total supply (220M VEIL)", async () => {
      expect(await veilTreasury.balance()).to.equal(TREASURY_AMOUNT);
    });

    it("proposes a withdrawal and emits WithdrawalProposed", async () => {
      const amount = ethers.parseEther("1000");
      await expect(veilTreasury.proposeWithdrawal(user1.address, amount))
        .to.emit(veilTreasury, "WithdrawalProposed")
        .withArgs(0n, user1.address, amount, anyValue);
    });

    it("cannot execute before 48-hour timelock expires", async () => {
      const amount = ethers.parseEther("1000");
      await veilTreasury.proposeWithdrawal(user1.address, amount);
      await expect(veilTreasury.executeWithdrawal(0n)).to.be.revertedWith("VeilTreasury: timelock active");
    });

    it("executes withdrawal after 48 hours and emits WithdrawalExecuted", async () => {
      const amount = ethers.parseEther("1000");
      await veilTreasury.proposeWithdrawal(user1.address, amount);
      await time.increase(48 * 3600 + 1);

      await expect(veilTreasury.executeWithdrawal(0n))
        .to.emit(veilTreasury, "WithdrawalExecuted")
        .withArgs(0n, user1.address, amount);

      expect(await veilToken.balanceOf(user1.address)).to.equal(amount);
    });

    it("cannot execute same withdrawal twice", async () => {
      const amount = ethers.parseEther("1000");
      await veilTreasury.proposeWithdrawal(user1.address, amount);
      await time.increase(48 * 3600 + 1);
      await veilTreasury.executeWithdrawal(0n);
      await expect(veilTreasury.executeWithdrawal(0n)).to.be.revertedWith("VeilTreasury: already executed");
    });

    it("cancels a pending withdrawal", async () => {
      const amount = ethers.parseEther("1000");
      await veilTreasury.proposeWithdrawal(user1.address, amount);
      await expect(veilTreasury.cancelWithdrawal(0n)).to.emit(veilTreasury, "WithdrawalCancelled").withArgs(0n);
      await time.increase(48 * 3600 + 1);
      await expect(veilTreasury.executeWithdrawal(0n)).to.be.revertedWith("VeilTreasury: cancelled");
    });

    it("reverts if non-owner proposes withdrawal", async () => {
      await expect(veilTreasury.connect(user1).proposeWithdrawal(user1.address, ethers.parseEther("100")))
        .to.be.revertedWithCustomError(veilTreasury, "OwnableUnauthorizedAccount");
    });
  });

  // ─── VeilStaking ─────────────────────────────────────────────────────────────

  describe("VeilStaking", () => {
    const STAKE_AMOUNT = ethers.parseEther("10000");

    beforeEach(async () => {
      await veilToken.transfer(user1.address, STAKE_AMOUNT * 2n);
      await veilToken.connect(user1).approve(await veilStaking.getAddress(), STAKE_AMOUNT * 2n);
    });

    it("accepts deposits and tracks them", async () => {
      await veilStaking.connect(user1).stake(STAKE_AMOUNT);
      const info = await veilStaking.stakes(user1.address);
      expect(info.amount).to.equal(STAKE_AMOUNT);
      expect(await veilStaking.totalStaked()).to.equal(STAKE_AMOUNT);
    });

    it("emits Staked event", async () => {
      await expect(veilStaking.connect(user1).stake(STAKE_AMOUNT))
        .to.emit(veilStaking, "Staked")
        .withArgs(user1.address, STAKE_AMOUNT);
    });

    it("tracks staking duration", async () => {
      await veilStaking.connect(user1).stake(STAKE_AMOUNT);
      await time.increase(3600);
      const duration = await veilStaking.stakingDuration(user1.address);
      expect(duration).to.be.gte(3600n);
    });

    it("allows unstake and returns tokens", async () => {
      await veilStaking.connect(user1).stake(STAKE_AMOUNT);
      const before = await veilToken.balanceOf(user1.address);
      await veilStaking.connect(user1).unstake(STAKE_AMOUNT);
      const after = await veilToken.balanceOf(user1.address);
      expect(after - before).to.equal(STAKE_AMOUNT);
    });

    it("emergency withdraw returns stake and emits event", async () => {
      await veilStaking.connect(user1).stake(STAKE_AMOUNT);
      await expect(veilStaking.connect(user1).emergencyWithdraw())
        .to.emit(veilStaking, "EmergencyWithdraw")
        .withArgs(user1.address, STAKE_AMOUNT);
      expect(await veilToken.balanceOf(user1.address)).to.equal(STAKE_AMOUNT * 2n);
    });

    it("owner can set reward rate", async () => {
      await expect(veilStaking.setRewardRate(100n))
        .to.emit(veilStaking, "RewardRateUpdated")
        .withArgs(0n, 100n);
      expect(await veilStaking.rewardRate()).to.equal(100n);
    });

    it("reverts stake of zero", async () => {
      await expect(veilStaking.connect(user1).stake(0n)).to.be.revertedWith("VeilStaking: zero amount");
    });
  });

  // ─── VEILNodeRegistry ────────────────────────────────────────────────────────

  describe("VEILNodeRegistry", () => {
    it("registers a node and emits NodeRegistered", async () => {
      await expect(veilNodeRegistry.register(user1.address, ethers.parseEther("1000")))
        .to.emit(veilNodeRegistry, "NodeRegistered")
        .withArgs(user1.address, ethers.parseEther("1000"));
    });

    it("isRegistered returns true after registration", async () => {
      await veilNodeRegistry.register(user1.address, ethers.parseEther("1000"));
      expect(await veilNodeRegistry.isRegistered(user1.address)).to.equal(true);
    });

    it("getStake returns the registered stake amount", async () => {
      const stake = ethers.parseEther("5000");
      await veilNodeRegistry.register(user1.address, stake);
      expect(await veilNodeRegistry.getStake(user1.address)).to.equal(stake);
    });

    it("cannot register the same node twice", async () => {
      await veilNodeRegistry.register(user1.address, ethers.parseEther("1000"));
      await expect(
        veilNodeRegistry.register(user1.address, ethers.parseEther("1000"))
      ).to.be.revertedWith("VEILNodeRegistry: already registered");
    });

    it("deregisters a node and emits NodeDeregistered", async () => {
      await veilNodeRegistry.register(user1.address, ethers.parseEther("1000"));
      await expect(veilNodeRegistry.deregister(user1.address))
        .to.emit(veilNodeRegistry, "NodeDeregistered")
        .withArgs(user1.address);
    });

    it("isRegistered returns false after deregistration", async () => {
      await veilNodeRegistry.register(user1.address, ethers.parseEther("1000"));
      await veilNodeRegistry.deregister(user1.address);
      expect(await veilNodeRegistry.isRegistered(user1.address)).to.equal(false);
    });

    it("reverts if non-owner calls register", async () => {
      await expect(
        veilNodeRegistry.connect(user1).register(user2.address, ethers.parseEther("1000"))
      ).to.be.revertedWithCustomError(veilNodeRegistry, "OwnableUnauthorizedAccount");
    });

    it("reverts deregister on non-registered node", async () => {
      await expect(veilNodeRegistry.deregister(user1.address)).to.be.revertedWith(
        "VEILNodeRegistry: not registered"
      );
    });
  });
});
