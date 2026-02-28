/**
 * Fix Empty Slugs Script
 * Finds all novels with empty/null slugs and repairs them using thaiSlug.
 *
 * Run with:
 *   npx tsx prisma/fix-slugs.ts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import pg from "pg";

const pool = new pg.Pool({ connectionString: process.env.DIRECT_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

/** Same logic as src/lib/thai-slug.ts — inline to avoid TSConfig path issues */
function thaiSlug(title: string): string {
    return title
        .trim()
        .toLowerCase()
        .replace(/[\s]+/g, "-")
        .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, "")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "");
}

async function main() {
    const broken = await prisma.novel.findMany({
        where: { slug: "" },
        select: { id: true, title: true, slug: true },
    });

    console.log(`Found ${broken.length} novel(s) with broken slugs:`);
    broken.forEach((n) => console.log(`  - [${n.id}] "${n.title}" (slug: "${n.slug}")`));

    if (broken.length === 0) {
        console.log("✅ No broken slugs found — all good!");
        return;
    }

    for (const novel of broken) {
        const base = thaiSlug(novel.title) || `novel-${novel.id.slice(-6)}`;
        let slug = base;
        let attempt = 0;

        while (true) {
            const existing = await prisma.novel.findFirst({
                where: { slug, id: { not: novel.id } },
            });
            if (!existing) break;
            attempt++;
            slug = `${base}-${attempt}`;
        }

        await prisma.novel.update({ where: { id: novel.id }, data: { slug } });
        console.log(`  ✓ Fixed "${novel.title}" → slug: "${slug}"`);
    }

    console.log(`\n✅ Fixed ${broken.length} novel slug(s).`);
}

main()
    .catch(console.error)
    .finally(async () => {
        await prisma.$disconnect();
        await pool.end();
    });
