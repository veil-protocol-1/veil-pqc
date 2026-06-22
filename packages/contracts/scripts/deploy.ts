import { ethers, network } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Safe multisig that owns x402PQCPayments on Base mainnet.
// All other networks (Sepolia, hardhat) use the deployer EOA so testnet
// ops aren't gated on a multisig.
const SAFE = "0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b";

// ERC-4337 EntryPoint on Base Sepolia (v0.6)
const ENTRY_POINT = "0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789";
// Initial exchange rate: 1000 VEIL per wei (adjustable post-deploy)
const INITIAL_VEIL_PER_WEI = ethers.parseUnits("1000", 18);

async function verifyBytecode(address: string, label: string): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = await ethers.provider.getCode(address);
    if (code !== "0x") {
      console.log(`     bytecode verified (${Math.floor(code.length / 2 - 1)} bytes)`);
      return;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`${label}: no bytecode at ${address} after retries`);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();

  console.log("=== Veil PQC Contract Deployment ===");
  console.log(`Network:   ${network.name} (chainId: ${network.chainId})`);
  console.log(`Deployer:  ${deployer.address}`);
  console.log(`Balance:   ${ethers.formatEther(await ethers.provider.getBalance(deployer.address))} ETH`);
  console.log("");

  // 1. VEILToken
  console.log("1/6  Deploying VEILToken...");
  const VEILToken = await ethers.getContractFactory("VEILToken");
  const veilToken = await VEILToken.deploy(deployer.address);
  await veilToken.waitForDeployment();
  const tokenAddress = await veilToken.getAddress();
  console.log(`     VEILToken:        ${tokenAddress}`);
  console.log(`     Supply:           1,000,000,000 VEIL`);
  await verifyBytecode(tokenAddress, "VEILToken");

  // 2. VEILTreasury
  console.log("2/6  Deploying VEILTreasury...");
  const VEILTreasury = await ethers.getContractFactory("VEILTreasury");
  const veilTreasury = await VEILTreasury.deploy(deployer.address, tokenAddress);
  await veilTreasury.waitForDeployment();
  const treasuryAddress = await veilTreasury.getAddress();
  console.log(`     VEILTreasury:     ${treasuryAddress}`);
  await verifyBytecode(treasuryAddress, "VEILTreasury");

  // 3. VEILVesting
  console.log("3/6  Deploying VEILVesting...");
  const startTime = Math.floor(Date.now() / 1000);
  const VEILVesting = await ethers.getContractFactory("VEILVesting");
  const veilVesting = await VEILVesting.deploy(
    deployer.address,        // initialOwner
    tokenAddress,            // token
    deployer.address,        // beneficiary (deployer manages distribution)
    ethers.parseEther("1"),  // amount — 1 VEIL placeholder; fund specific schedules post-deploy
    startTime,               // startTime
    0,                       // cliffDuration
    365 * 24 * 3600,        // vestingDuration (1 year)
    true,                    // revocable
  );
  await veilVesting.waitForDeployment();
  const vestingAddress = await veilVesting.getAddress();
  console.log(`     VEILVesting:      ${vestingAddress}`);
  await verifyBytecode(vestingAddress, "VEILVesting");

  // 4. VEILNodeRegistry
  console.log("4/6  Deploying VEILNodeRegistry...");
  const VEILNodeRegistry = await ethers.getContractFactory("VEILNodeRegistry");
  const veilNodeRegistry = await VEILNodeRegistry.deploy(deployer.address);
  await veilNodeRegistry.waitForDeployment();
  const registryAddress = await veilNodeRegistry.getAddress();
  console.log(`     VEILNodeRegistry: ${registryAddress}`);
  await verifyBytecode(registryAddress, "VEILNodeRegistry");

  // 5. VEILPaymaster
  console.log("5/6  Deploying VEILPaymaster...");
  const VEILPaymaster = await ethers.getContractFactory("VEILPaymaster");
  const veilPaymaster = await VEILPaymaster.deploy(
    deployer.address,
    tokenAddress,
    ENTRY_POINT,
    INITIAL_VEIL_PER_WEI,
  );
  await veilPaymaster.waitForDeployment();
  const paymasterAddress = await veilPaymaster.getAddress();
  console.log(`     VEILPaymaster:    ${paymasterAddress}`);
  await verifyBytecode(paymasterAddress, "VEILPaymaster");

  // 6. x402PQCPayments
  // Mainnet: owned by the Safe multisig. All other networks: owned by deployer.
  const x402Owner = network.name === "base" ? SAFE : deployer.address;
  console.log("6/6  Deploying x402PQCPayments...");
  console.log(`     initialOwner: ${x402Owner}${network.name === "base" ? " (Safe)" : " (deployer)"}`);
  const x402PQCPayments = await ethers.getContractFactory("x402PQCPayments");
  const x402Payments = await x402PQCPayments.deploy(x402Owner);
  await x402Payments.waitForDeployment();
  const paymentsAddress = await x402Payments.getAddress();
  console.log(`     x402PQCPayments:  ${paymentsAddress}`);
  await verifyBytecode(paymentsAddress, "x402PQCPayments");

  // Save deployment manifest
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

  const manifest = {
    network: network.name,
    chainId: Number(network.chainId),
    deployedAt: new Date().toISOString(),
    contracts: {
      VEILToken: tokenAddress,
      VEILTreasury: treasuryAddress,
      VEILVesting: vestingAddress,
      VEILNodeRegistry: registryAddress,
      VEILPaymaster: paymasterAddress,
      x402PQCPayments: paymentsAddress,
    },
    x402PQCPaymentsOwner: x402Owner,
  };

  const outPath = path.join(deploymentsDir, `${network.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));

  console.log("");
  console.log("=== Deployment Summary ===");
  console.log(`VEILToken:        ${tokenAddress}`);
  console.log(`VEILTreasury:     ${treasuryAddress}`);
  console.log(`VEILVesting:      ${vestingAddress}`);
  console.log(`VEILNodeRegistry: ${registryAddress}`);
  console.log(`VEILPaymaster:    ${paymasterAddress}`);
  console.log(`x402PQCPayments:  ${paymentsAddress}`);
  console.log("");
  console.log(`Manifest saved:   ${outPath}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
