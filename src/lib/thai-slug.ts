/**
 * Thai-safe slug generator.
 * Keeps Thai characters (Unicode range U+0E00–U+0E7F) alongside
 * standard a-z, 0-9, and hyphens.  Spaces become hyphens.
 *
 * Examples:
 *   "ดาวร้าว ฟ้า!"       → "ดาวร้าว-ฟ้า"
 *   "My Novel ภาค 2"     → "my-novel-ภาค-2"
 *   "Hello World"         → "hello-world"
 */
export function thaiSlug(title: string): string {
    return title
        .trim()
        .toLowerCase()
        .replace(/[\s]+/g, "-")                       // spaces → hyphens
        .replace(/[^\u0E00-\u0E7Fa-z0-9-]/g, "")     // keep Thai + ASCII alphanumeric + hyphens
        .replace(/-+/g, "-")                          // collapse consecutive hyphens
        .replace(/^-|-$/g, "");                       // trim leading/trailing hyphens
}
