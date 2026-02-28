import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// Load .env.local for local dev, but catch error if it doesn't exist on Vercel
try {
  config({ path: ".env.local" });
} catch (e) { }

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "npx tsx prisma/seed.ts",
  },
  datasource: {
    url: process.env["DIRECT_URL"] || process.env["DATABASE_URL"],
  },
});
