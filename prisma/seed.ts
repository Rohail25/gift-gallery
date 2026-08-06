import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

/**
 * Main seed runner
 * Run with: npx prisma db seed
 *
 * Each seed runs in its own tsx process so the shared Prisma client
 * (lib/prisma singleton) stays open for the duration of one seed only.
 */

const require = createRequire(import.meta.url);
const tsxCli = join(dirname(require.resolve("tsx/package.json")), "dist", "cli.mjs");
const nodeBin = process.execPath;
const seedsDir = join(dirname(fileURLToPath(import.meta.url)), "seeds");

const SEEDS = [
  { name: "Admin User", file: "admin.seed.ts" },
  { name: "Gift Types", file: "giftTypes.seed.ts" },
  { name: "Product Categories", file: "productCategories.seed.ts" },
  { name: "Cities", file: "cities.seed.ts" },
  { name: "Delivery Zones", file: "deliveryZones.seed.ts" },
  { name: "Event Types", file: "eventTypes.seed.ts" },
  { name: "Decor Categories", file: "decorCategories.seed.ts" },
  { name: "Site Settings", file: "settings.seed.ts" },
];

async function main() {
  console.log("🌱 Starting database seeding...\n");

  for (const seed of SEEDS) {
    console.log(`\n📦 Running: ${seed.name}`);
    execFileSync(nodeBin, [tsxCli, join(seedsDir, seed.file)], {
      stdio: "inherit",
    });
    console.log(`✅ Completed: ${seed.name}\n`);
  }

  console.log("✅ All seeds completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  });
