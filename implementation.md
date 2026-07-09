# Unimart Implementation Plan

This plan turns the project spec into build phases with concrete steps. Completed items are marked so another assistant can continue without rechecking prior setup work.

## Phase 1: Foundation

- [x] Confirm the target versions exist: Next.js `16.2.10` and Prisma `7.x`.
- [x] Scaffold the Next.js app with TypeScript, App Router, Tailwind, and the `@/*` alias.
- [x] Initialize `shadcn/ui`.
- [x] Install Prisma 7, `@prisma/client`, `@prisma/adapter-pg`, and PostgreSQL packages.
- [x] Create `prisma.config.ts`, `prisma/schema.prisma`, and generated client output.
- [x] Add the Campus Marketplace Prisma schema.
- [x] Add `lib/prisma.ts` for the shared Prisma client.
- [x] Add `prisma/seed.ts` for the default categories.
- [x] Apply the marketplace color palette in `app/globals.css`.
- [x] Set up Cloudinary service credentials and the shared server helper.
- [x] Apply the spacing/layout tokens from the spec in `app/globals.css` or the Tailwind theme layer.
- [x] Run the first migration against the real database.
- [x] Seed the database against the real database.

## Phase 2: Design System

- [x] Add the core shadcn components needed for the MVP:
  `card`, `input`, `textarea`, `label`, `select`, `form`, `badge`, `table`, `dialog`, `dropdown-menu`, `sheet`, `tabs`, `avatar`, `skeleton`, `pagination`.
- [x] Create shared layout primitives:
  `container`, section wrapper, page header, empty state, loading state, status badge.
- [x] Encode spacing rhythm from the spec so pages consistently use the same section and grid spacing.
- [x] Replace the temporary home screen with the actual marketplace landing page shell.

## Phase 3: Database Bootstrap

- [ ] Run `pnpm prisma migrate dev --name init`.
- [ ] Run `pnpm prisma db seed`.
- [ ] Verify seeded categories in Prisma Studio.
- [ ] Add any helpful Prisma query helpers if repeated access patterns emerge.

## Phase 4: Authentication

- [x] Install and configure NextAuth.js.
- [x] Create signup and login pages.
- [x] Implement credentials auth with password hashing.
- [x] Implement email verification flow.
- [ ] Add password reset flow.
- [ ] Add route protection for dashboard and admin routes.
- [x] Enforce banned-user and verified-user checks in auth/session logic.

## Phase 5: User Profile

- [ ] Create the profile data model usage in forms and server actions or route handlers.
- [ ] Build "My Profile" UI for name, phone number, department, and photo.
- [ ] Validate all profile inputs with Zod.
- [ ] Ensure phone number formatting works for WhatsApp links.

## Phase 6: Categories

- [x] Define the `Category` model in Prisma.
- [x] Prepare a seed for the default categories.
- [ ] Build category read endpoints for public browsing.
- [ ] Build admin CRUD for categories.
- [ ] Prevent deletion issues when categories are linked to listings.

## Phase 7: Listings CRUD

- [ ] Create the "new listing" page.
- [ ] Build server-side create listing validation with Zod.
- [ ] Enforce image count `1-4` on both client and server.
- [ ] Build owner-only edit listing flow.
- [ ] Build owner-only delete listing flow.
- [ ] Build mark-as-sold action.
- [ ] Ensure listings default to `ACTIVE`.

## Phase 8: Image Uploads

- [x] Set up the Cloudinary SDK and environment configuration.
- [ ] Integrate the listing upload flow with Cloudinary.
- [ ] Enforce type and size limits: jpg/png/webp, max `5MB` each.
- [ ] Support up to four listing images.
- [ ] Store optimized URLs in Prisma.

## Phase 9: Public Marketplace

- [ ] Build the real homepage with listing grid, search, and category filter.
- [ ] Build `/listings/[id]` detail page.
- [ ] Add search by title/description.
- [ ] Add filters for category, price range, condition, and date posted.
- [ ] Add sort options: newest, price low-high, price high-low.
- [ ] Add pagination or infinite loading.

## Phase 10: Seller Contact and Reports

- [ ] Add WhatsApp contact button on listing detail pages.
- [ ] Generate the prefilled WhatsApp message from the listing title and price.
- [ ] Add listing report flow with allowed reasons.
- [ ] Store report status and moderation history cleanly.

## Phase 11: Student Dashboard

- [ ] Build `/dashboard` shell and navigation.
- [ ] Build "My Listings" with status display and quick actions.
- [ ] Show per-listing basic view counts.
- [ ] Connect dashboard actions to the listing CRUD endpoints.

## Phase 12: Admin Dashboard

- [ ] Build `/admin` dashboard shell.
- [ ] Add stats cards for total users, total listings, and open reports.
- [ ] Build admin listings moderation page.
- [ ] Build admin users page with ban/suspend actions.
- [ ] Build admin reports page with resolve/dismiss/remove actions.
- [ ] Build admin categories management page.

## Phase 13: Quality and Hardening

- [x] Validate the current project with `pnpm lint`.
- [x] Validate the current project with `pnpm build`.
- [ ] Add rate limiting on auth and sensitive mutation routes.
- [ ] Add loading, error, and empty states across core routes.
- [ ] Review responsive behavior across mobile, tablet, and desktop breakpoints.
- [ ] Confirm no component uses ad hoc hex colors outside the theme tokens.
- [ ] Add focused tests where they meaningfully reduce regression risk.

## Immediate Next Steps

- [x] Run the first Prisma migration now that the real database URL is set.
- [x] Seed the default categories.
- [x] Add the next batch of shadcn primitives needed for auth and listings.
- [x] Replace the temporary homepage with the actual marketplace homepage shell.
- [ ] Verify seeded categories in Prisma Studio.
- [ ] Start Phase 4 by installing and configuring NextAuth.js.
