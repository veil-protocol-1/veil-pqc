import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";

// Gnosis Safe that becomes the immutable owner of x402PQCPayments on Base mainnet.
// transferOwnership() is called atomically at deploy time — the deployer EOA never
// holds owner rights after the constructor returns.
const SAFE_OWNER = "0xdEaD1f7583DEFE7A7fD701ea04ba49C14f871a0b";

async function verifyBytecode(address: string, label: string): Promise<void> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = await ethers.provider.getCode(address);
    if (code !== "0x") {
      console.log(`     bytecode verified (${Math.floor(code.length / 2 - 1)} bytes)`);
      return;
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  throw new Error(`${label}: no bytecode at ${address} after 10 retries`);
}

async function main() {
  const net = await ethers.provider.getNetwork();

  // Hard guard — this script must only execute against Base mainnet (chainId 8453).
  if (net.name !== "base" || net.chainId !== 8453n) {
    throw new Error(
      `Safety abort: expected Base mainnet (name=base, chainId=8453) ` +
        `but got name=${net.name}, chainId=${net.chainId}. ` +
        `Run with --network base.`
    );
  }

  const [deployer] = await ethers.getSigners();
  const balance = await ethers.provider.getBalance(deployer.address);

  console.log("=== x402PQCPayments — Base MAINNET Deploy ===");
  console.log(`Network:   ${net.name} (chainId: ${net.chainId})`);
  console.log(`Deployer:  ${deployer.address}`);
  console.log(`Balance:   ${ethers.formatEther(balance)} ETH`);
  console.log(`Owner:     ${SAFE_OWNER} (Gnosis Safe)`);
  console.log("");

  if (balance === 0n) {
    throw new Error("Deployer account has 0 ETH — fund before deploying.");
  }

  console.log("Deploying x402PQCPayments...");
  const Factory = await ethers.getContractFactory("x402PQCPayments");
  const contract = await Factory.deploy(SAFE_OWNER);
  const tx = contract.deploymentTransaction();
  console.log(`  tx hash:  ${tx?.hash}`);

  const receipt = await contract.waitForDeployment();
  const deployReceipt = await tx?.wait();
  const address = await contract.getAddress();

  console.log(`  address:  ${address}`);
  console.log(`  block:    ${deployReceipt?.blockNumber}`);
  console.log(`  gas used: ${deployReceipt?.gasUsed}`);
  console.log("");

  // Verify bytecode is on-chain
  console.log("Verifying bytecode on-chain...");
  await verifyBytecode(address, "x402PQCPayments");

  // Verify owner() returns the Safe, not the deployer
  console.log("Verifying owner()...");
  const deployed = Factory.attach(address) as any;
  const owner = await deployed.owner();
  console.log(`  owner():  ${owner}`);
  if (owner.toLowerCase() !== SAFE_OWNER.toLowerCase()) {
    throw new Error(
      `Owner mismatch! Expected ${SAFE_OWNER} but got ${owner}. ` +
        `Do NOT proceed — investigate immediately.`
    );
  }
  console.log(`  owner() matches Safe address ✓`);
  console.log("");

  // Write deployment manifest
  const deploymentsDir = path.join(__dirname, "../deployments");
  if (!fs.existsSync(deploymentsDir)) fs.mkdirSync(deploymentsDir, { recursive: true });

  const manifest = {
    network: "base",
    label: "Base MAINNET (real funds)",
    chainId: 8453,
    deployedAt: new Date().toISOString(),
    contract: "x402PQCPayments",
    address,
    owner: SAFE_OWNER,
    txHash: tx?.hash,
    blockNumber: deployReceipt?.blockNumber,
    gasUsed: deployReceipt?.gasUsed?.toString(),
  };

  const outPath = path.join(deploymentsDir, "base-x402-only.json");
  fs.writeFileSync(outPath, JSON.stringify(manifest, null, 2));
  console.log(`Manifest saved: ${outPath}`);
  console.log("");

  console.log("=== Deployment Complete ===");
  console.log(`Address:     ${address}`);
  console.log(`Tx hash:     ${tx?.hash}`);
  console.log(`Block:       ${deployReceipt?.blockNumber}`);
  console.log(`Gas used:    ${deployReceipt?.gasUsed}`);
  console.log(`Owner (Safe):${SAFE_OWNER}`);
  console.log("");
  console.log("Next step: update PROJECT_FACTS.md with the new Base MAINNET address.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
