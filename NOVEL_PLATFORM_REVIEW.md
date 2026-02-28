# Novel Platform — Full Review & Implementation Plan

> Date: 2026-02-28  
> Comparing implementation against [NOVEL_PLATFORM_SPEC.md](./NOVEL_PLATFORM_SPEC.md)

---

# Part A — Codebase Audit Report

---

## 1. 🔴 Critical Security Issues

### 1.1 Supabase Using Anon Key Instead of Service Role Key

**Files:** `src/lib/supabase.ts`, `src/app/api/upload/cover/route.ts`

Both the `supabase.ts` helper and the upload route create the Supabase client with `NEXT_PUBLIC_SUPABASE_ANON_KEY` instead of `SUPABASE_SERVICE_ROLE_KEY`.

> [!CAUTION]
> The **anon key** is subject to RLS policies and will likely **fail to upload** files on a properly secured bucket. Server-side operations should use the **service role key**, which the spec explicitly defines on line 91.

```diff
- process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
+ process.env.SUPABASE_SERVICE_ROLE_KEY!
```

### 1.2 PATCH Chapter — Unsanitized Body Passed Directly to Prisma

**File:** `src/app/api/chapters/[id]/route.ts` (lines 56–67)

```typescript
const body = await request.json();
// ... only content is checked
const updated = await prisma.chapter.update({
  where: { id },
  data: body,  // ← ANY field can be overwritten
});
```

> [!CAUTION]
> A malicious user could send `{ "novelId": "someone-elses-novel" }` or `{ "isPublished": true }` to hijack chapter ownership or bypass the publish workflow. **Always whitelist allowed fields.**

**Fix:** Destructure only allowed fields:
```typescript
const { title, content, chapterNumber } = body;
```

### 1.3 Missing Upload Route for Avatars

**Spec says:** `POST /api/upload/avatar` should exist (§4.6)  
**Reality:** Only `/api/upload/cover/route.ts` exists — **no avatar upload route**.

Users cannot update their profile avatars.

### 1.4 No View Count API

**Spec says:** `POST /api/novels/[id]/view` to increment views (§4.4)  
**Reality:** Not implemented. The `views` field in the DB always stays at `0`.

### 1.5 No Rate Limiting on Auth Endpoints

Both `/api/auth/register` and credentials login have **zero rate limiting**, making them vulnerable to brute-force and credential-stuffing attacks.

---

## 2. 🟠 Architecture & Configuration Issues

### 2.1 Duplicate JWT/Session Callbacks

**Files:** `src/lib/auth.config.ts` (lines 36–51), `src/lib/auth.ts` (lines 52–69)

The `jwt` and `session` callbacks are defined **twice** — once in `auth.config.ts` and once in `auth.ts` with `...authConfig.callbacks`. The spread in `auth.ts` includes the config callbacks, then immediately overrides them. This is confusing and error-prone.

**Fix:** Remove the `jwt`/`session` callbacks from `auth.config.ts` (keep only `authorized` there) and keep them only in `auth.ts`.

### 2.2 Prisma Schema Missing `url` in Datasource

**File:** `prisma/schema.prisma` (lines 6–8)

```prisma
datasource db {
  provider = "postgresql"
  // Missing: url = env("DATABASE_URL") and directUrl = env("DIRECT_URL")
}
```

The spec (§3.1) includes both `url` and `directUrl`. While the project uses `@prisma/adapter-pg` with a manual connection pool (which explains this), it deviates from the spec's standard Prisma setup and won't work with `prisma migrate` or `prisma db push` without the URL.

### 2.3 Two Different `NextAuth()` Initializations

The codebase creates **two separate** `NextAuth()` instances:
1. `middleware.ts` → `NextAuth(authConfig)` — only for middleware
2. `auth.ts` → `NextAuth({ ...authConfig, adapter, providers, ... })` — for auth logic

This is actually the correct Next.js 15 pattern for NextAuth v5 (Edge middleware can't use Prisma). **No fix needed**, but worth documenting.

### 2.4 `.env` and `.env.local` Both Exist

Both `.env` (1481 bytes) and `.env.local` (841 bytes) exist at root. This can cause confusion about which variables take precedence.

**Recommendation:** Consolidate into `.env.local` only, and add `.env` to `.gitignore`.

---

## 3. 🟡 Code Quality Issues

### 3.1 Duplicated `extractText()` Function

**Files:** `src/app/api/novels/[id]/chapters/route.ts` (lines 74–84) and `src/app/api/chapters/[id]/route.ts` (lines 94–104)

Identical `extractText()` function is copy-pasted in two files.

**Fix:** Move to `src/lib/utils.ts` and import from both routes.

### 3.2 Missing Error Handling in Novel GET API

**File:** `src/app/api/novels/route.ts` (lines 7–61)

The GET handler has **no try/catch**. If Prisma throws (e.g., invalid sort option), the API returns a raw 500 error.

### 3.3 No Zustand Store

**Spec says:** Zustand for state management (§1.3)  
**Reality:** No Zustand store files exist. The project relies solely on server components and API calls.

This is actually fine for current scope, but deviates from the spec.

### 3.4 Missing `nanoid` and `date-fns` Usage

Both are listed in the spec's dependencies but neither `nanoid` nor `date-fns` are in `package.json` or used anywhere. This is minor but indicates spec drift.

### 3.5 `sharp` Not Installed

The spec requires `sharp` for image optimization (resize to 400×600 for covers, 200×200 for avatars). It's not in `package.json` and no image resizing occurs.

---

## 4. 🔵 Missing Features (Spec vs Implementation)

| Feature | Spec Section | Status |
|---------|-------------|--------|
| Avatar upload API | §4.6 | ❌ Missing |
| View count API (`/api/novels/[id]/view`) | §4.4 | ❌ Missing |
| Reading history API (`/api/history`) | §4.4 | ❌ Missing route |
| `most_read` sort option | §4.2 | ❌ Not implemented |
| Image resizing (sharp) | §4.6 | ❌ No processing |
| `settings/profile` page | §5.1 | ❌ Missing |
| `settings/account` page | §5.1 | ❌ Missing |
| `genre/[slug]` page | §5.1 | ❌ Missing |
| Reader settings (font/theme) | §5.2 | ⚠️ Component exists, unclear if wired |
| Auto-save drafts | §5.2 | ❌ No `AutoSave.tsx` component |
| Notification creation for follow/vote/chapter | §4.7 | ⚠️ Only comment notification exists |
| `WordCounter.tsx` component | §5.2 | ❌ Missing |
| `NovelCardCompact.tsx` | §5.2 | ❌ Missing |
| `ReadingProgress.tsx` | §5.2 | ❌ Missing |
| `TableOfContents.tsx` | §5.2 | ❌ Missing |
| `Sidebar.tsx` (genre filter) | §5.2 | ❌ Missing |

---

## 5. ⚡ Performance Concerns

### 5.1 N+1 Queries in Home Page

**File:** `src/app/(main)/page.tsx`

The home page fires **5 parallel Prisma queries** (featured, popular, latest, recentUpdates, genres), each with nested includes. While `Promise.all` helps, the query volume is high for every page load.

**Recommendation:** Add ISR or caching (`unstable_cache`) for the home page.

### 5.2 Comment Notification is Fire-and-Forget Without Await

**File:** `src/app/api/chapters/[id]/comments/route.ts` (lines 93–102)

```typescript
prisma.notification.create({ ... }).catch(() => {});
```

Silent failure means missed notifications with zero logging. At minimum add `console.error`.

### 5.3 No Database Connection Pooling Limits

**File:** `src/lib/prisma.ts`

The `pg.Pool` is created with no explicit `max` connections. Under load, this could exhaust Supabase's connection limit (especially on the free plan, which allows ~60 connections).

```diff
- const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
+ const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL, max: 10 });
```

---

## 6. 📋 Recommended Fix Priority

| Priority | Issue | Effort |
|----------|-------|--------|
| **P0 — Fix Now** | Supabase service role key (§1.1) | 5 min |
| **P0 — Fix Now** | Unsanitized PATCH body (§1.2) | 15 min |
| **P0 — Fix Now** | DB pool limits (§5.3) | 5 min |
| **P1 — High** | Add avatar upload route (§1.3) | 30 min |
| **P1 — High** | Add view count API (§1.4) | 20 min |
| **P1 — High** | Deduplicate callbacks in auth (§2.1) | 10 min |
| **P1 — High** | Extract `extractText()` to util (§3.1) | 10 min |
| **P2 — Medium** | Add missing pages (settings, genre) | 2-4 hrs |
| **P2 — Medium** | Add reading history API | 30 min |
| **P2 — Medium** | Install sharp + image processing | 1 hr |
| **P2 — Medium** | Add missing notification triggers | 1 hr |
| **P3 — Low** | Home page caching / ISR | 30 min |
| **P3 — Low** | Add missing UI components | 2-3 hrs |
| **P3 — Low** | Consolidate `.env` files | 5 min |
| **P3 — Low** | Add rate limiting | 1 hr |

> Total estimated effort for P0+P1 fixes: **~1.5 hours**  
> Total estimated effort for full spec compliance: **~10-15 hours**

---

# Part B — Eye-Comfort & Reading UX Implementation Plan

Add full dark mode support, blue light filter, and rich user-customizable reading settings (font family, font size, line height, paragraph spacing, content max-width, reading themes) across the platform. All preferences persist to `localStorage`.

---

## 7. Theme Provider (Dark Mode Foundation)

### [NEW] `src/components/providers/ThemeProvider.tsx`
- Wraps `next-themes` `ThemeProvider` with `attribute="class"`, `defaultTheme="system"`, `enableSystem`
- Enables system/light/dark mode site-wide

### [MODIFY] `src/app/layout.tsx`
- Wrap children with new `ThemeProvider`
- Add Google Font `Sarabun` (Thai-optimized reading font) alongside Geist

---

## 8. Navbar Theme Toggle

### [MODIFY] `src/components/layout/Navbar.tsx`
- Add a theme toggle button (Sun/Moon/Monitor icons) next to notification bell
- Uses `useTheme()` from `next-themes` to cycle: light → dark → system

---

## 9. Reader Settings Store (Zustand + localStorage)

### [NEW] `src/lib/useReaderSettings.ts`
Zustand store persisted to `localStorage` with these settings:
- **fontSize** — `12-32` (default 18)
- **lineHeight** — `1.2-3.0` (default 1.8)
- **fontFamily** — `"sans"` | `"serif"` | `"sarabun"` | `"mono"` (default `"sarabun"`)
- **paragraphSpacing** — `0-3rem` (default 0.8)
- **maxWidth** — `600-1000px` (default 720)
- **readingTheme** — `"default"` | `"sepia"` | `"dark"` | `"night"` (applies only to reading area)
- **blueLightFilter** — `0-100` intensity slider (default 0)
- **brightness** — `50-150%` (default 100)

---

## 10. Redesigned Reader Settings Panel

### [MODIFY] `src/components/reader/ReaderSettings.tsx`
Full redesign using `Sheet` (slide-out panel) instead of dropdown. Sections:

1. **Reading Theme** — 4 visual theme button cards (Default, Sepia, Dark, Night)
2. **Font** — Font family selector (4 choices with preview) + font size slider
3. **Layout** — Line height slider + paragraph spacing slider + max width slider
4. **Eye Protection** — Blue light filter intensity slider + Brightness slider
5. **Reset to defaults** button

### [NEW] `src/components/ui/slider.tsx`
- Add shadcn/ui Slider component (needed for settings sliders)

---

## 11. Updated Reader Content & Chapter Reader

### [MODIFY] `src/components/reader/ChapterContent.tsx`
- Apply all reading settings from Zustand store (font family, font size, line height, paragraph spacing, max width)
- Apply reading theme background/text colors via CSS variables
- Render blue light filter as a CSS overlay (`filter` or `::after` pseudo-element)

### [MODIFY] `src/components/reader/ChapterReader.tsx`
- Remove local `useState` for fontSize/lineHeight (moved to Zustand)
- Apply `readingTheme` background to entire reading area
- Apply `blueLightFilter` as CSS overlay on the reading container
- Apply `brightness` as CSS filter
- Pass store values to `ChapterContent` and `ReaderSettings`

---

## 12. CSS: Reading Themes + Blue Light + Fonts

### [MODIFY] `src/app/globals.css`
Add at the end:
- `.reading-theme-sepia` — warm cream background `#F5EFDC`, dark brown text `#5C4B3E`
- `.reading-theme-dark` — dark grey background `#1E1E1E`, off-white text `#D4D4D4`
- `.reading-theme-night` — pure black background `#0A0A0A`, dim warm text `#A89B8C`
- `.blue-light-filter` — amber/orange overlay using `background: rgba(255, 180, 50, var(--bl-intensity))`
- Smooth transitions for all theme switches (`transition: background-color 0.3s, color 0.3s`)

---

## 13. Verification Plan

### Browser Testing
1. Run `npm run dev` (port 3100)
2. Open browser at `http://localhost:3100`
3. **Dark mode**: Click theme toggle in navbar → verify entire site switches to dark mode, then system, then light
4. Navigate to any novel chapter reader page
5. **Reader settings**: Open reader settings panel → verify all sliders and selectors work:
   - Change font family → text font changes live
   - Adjust font size → text size changes live
   - Adjust line height → spacing between lines changes
   - Adjust paragraph spacing → spacing between paragraphs changes
   - Change reading theme (Sepia, Dark, Night) → reading area colors change
   - Adjust blue light filter → warm overlay appears and intensifies
   - Adjust brightness → content dims/brightens
   - Click reset → all settings return to defaults
6. **Persistence**: Change settings, refresh page → settings should persist
7. **Mobile responsive**: Resize to mobile width → settings panel should remain usable

### Build Verification
- Run `npm run build` to confirm no TypeScript or build errors
