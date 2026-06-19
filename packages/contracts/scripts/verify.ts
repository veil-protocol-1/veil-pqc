import { run } from "hardhat";
import * as fs from "fs";
import * as path from "path";

async function main() {
  const deploymentsPath = path.join(__dirname, "../deployments/base-sepolia.json");
  if (!fs.existsSync(deploymentsPath)) {
    throw new Error("No deployment found. Run 'npm run deploy:base-sepolia' first.");
  }

  const deployments = JSON.parse(fs.readFileSync(deploymentsPath, "utf8"));
  const { contracts, deployer } = deployments;

  console.log("=== Verifying Veil 2.0 Contracts on BaseScan ===\n");

  await verifyContract("VeilToken", contracts.VeilToken, [deployer]);
  await verifyContract("VeilTreasury", contracts.VeilTreasury, [deployer, contracts.VeilToken]);
  await verifyContract("VeilStaking", contracts.VeilStaking, [deployer, contracts.VeilToken]);
  await verifyContract("VeilNodeRegistry", contracts.VeilNodeRegistry, [deployer, contracts.VeilToken]);

  console.log("\nVerification complete.");
}

async function verifyContract(name: string, address: string, constructorArgs: unknown[]) {
  console.log(`Verifying ${name} at ${address}...`);
  try {
    await run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log(`  ✓ ${name} verified`);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes("Already Verified") || msg.includes("already verified")) {
      console.log(`  ✓ ${name} already verified`);
    } else {
      console.error(`  ✗ ${name} verification failed:`, msg);
    }
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
