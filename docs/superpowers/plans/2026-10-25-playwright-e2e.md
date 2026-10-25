# Playwright E2E Implementation Plan

> **For agentic workers:** Execute this plan task by task. Every task ends with focused validation and a small commit.

**Goal:** Add executable Playwright coverage for the twelve E2E groups required by `AGENTS.md`, with isolated mock state and desktop/mobile projects.

**Architecture:** Playwright starts the Vite app against the existing MSW browser worker. Each test gets a fresh browser context; deterministic scenarios are selected through `?scenario=` and the mock panel/reset API is used only when a test changes state mid-flow. Tests assert visible UI and user outcomes.

**Tech Stack:** Bun, `@playwright/test`, Chromium, Vite, MSW, React, TypeScript.

**Spec:** `AGENTS.md`, sections 1, 5, 6 and 8; `docs/REQUISITOS-COBERTURA.md`.

## Global Constraints

- Run `bun run typecheck`, `bun run lint` and `bun run test` before each commit.
- Use Chromium at 1440 px desktop and 390 px mobile; isolate state per test and control scenario/latency.
- Assert interface and operation results; Socket.IO coverage must use the actual client and MSW transport.
- Preserve no-charge operation; do not configure paid services.
- Each commit updates `docs/PROGRESSO.md`; update requirement statuses only when the recorded proof supports them.

## Review Focus

- Mock worker startup and direct-route navigation: tests wait for the first route-specific API result before asserting.
- Persistent local storage between tests: each test receives a fresh browser context and starts with a scenario query.
- Async/realtime flakiness: use deterministic scenarios and wait on visible state, not fixed sleeps.
- User/session isolation: seed two users and assert private data does not cross sessions.
- Mobile layout: exercise 390 px and assert key actions remain visible without horizontal overflow.

---

### Task 1: Playwright foundation and home smoke tests

**Files:** `package.json`, `bun.lock`, `.gitignore`, `playwright.config.ts`, `tests/e2e/home.spec.ts`, `README.md`, `docs/PROGRESSO.md`, `docs/REQUISITOS-COBERTURA.md`.

- [x] Add `@playwright/test` as a dev dependency and scripts `test:e2e` and `test:e2e:ui`.
- [x] Configure Chromium desktop (1440×1000) and mobile (390×844), isolated contexts, HTML report, trace on retry, and a Vite web server on port 4174.
- [x] Add smoke tests asserting the home heading, catalog content and campaign section on both projects; fail on uncaught page errors.
- [x] Run the two home tests and all required pre-commit checks; Chrome desktop/mobile passed. `typecheck` and Vitest passed; lint passed when rerun serially after a parallel E2E run briefly created/removed its ignored output directory.
- [x] Commit as `test: add Playwright home smoke coverage` (`2a30fb6`).

### Task 2: Catalog and history

**Files:** `tests/e2e/catalog.spec.ts`, `docs/PROGRESSO.md`, `docs/REQUISITOS-COBERTURA.md`.

- [x] Cover search, combinable filters, sort, pagination, query-string history/back, empty results and delayed/out-of-order responses.
- [x] Verify URL and rendered result set after each operation.
- [x] Run focused E2E and pre-commit checks; full E2E passed with 11 passed / 1 intentionally skipped, Vitest 18/18, typecheck clean, lint 0 errors / 9 existing warnings.
- [x] Commit `test: cover catalog navigation and history` (`ace6105`).

### Task 3: NFT detail and not-found

**Files:** `tests/e2e/nft-detail.spec.ts`, progress and coverage docs.

- [x] Cover direct access, gallery, edition selection, quantity limits, favorite redirect, add-to-cart and 404.
- [x] Run focused E2E and pre-commit checks; full suite passed with 19 passed / 1 skipped, Vitest 18/18, typecheck clean, lint 0 errors / 9 warnings.
- [x] Commit `test: cover NFT detail and not-found states` (`e73eae2`).

### Task 4: Account and session

**Files:** `tests/e2e/account.spec.ts`, progress and coverage docs.

- [x] Cover registration, duplicate account, login, preserved redirect, refresh and invalid-token cleanup. Clock expiry and private-cache isolation still need stronger assertions.
- [x] Verify session switch between Ana and Bruno on desktop; mobile skips because its current navigation has no logout action.
- [x] Focused E2E: 11 passed, 1 intentional mobile skip. Pre-commit `typecheck`, lint (0 errors/9 warnings) and Vitest (18/18) passed; committed as `b14649d test: cover account and session flows`.

### Task 5: Favorites and cart

**Files:** `tests/e2e/favorites.spec.ts`, `tests/e2e/cart.spec.ts`, progress and coverage docs.

- [x] Group 4: cover visitor CTA, empty state, favorite persistence across refresh, optimistic rollback on `favorite-fail`, and successful retry. Focused E2E passed 8/8 across desktop/mobile.
- [x] Commit favorites separately from cart as `5e00e02 test: cover favorites with failure recovery`.
- [x] Group 5: cover empty/add/update/remove cart, guest migration, coupon apply/remove/errors and totals in `cart.spec.ts`; focused E2E passed 6/6 across desktop/mobile.
- [x] Run pre-commit checks and commit separately as `8be3b9a test: cover cart persistence and totals`.

### Task 6: Successful checkout

**Files:** `tests/e2e/checkout-success.spec.ts`, progress and coverage docs.

- [x] Cover collector form, saved wallet, simulated connection, quote/review, confirmed order and receipt refresh in `checkout-success.spec.ts`; focused E2E passed 2/2 across desktop/mobile.
- [x] Pre-commit checks passed; commit `135c951 test: cover successful checkout flow`.

### Task 7: Checkout failures and idempotency

**Files:** `tests/e2e/checkout-failures.spec.ts`, progress and coverage docs.

- [x] Cover declined payment, stale price, sold-out edition, timeout recovery, double-click blocking and same-key retry; invalid/expired coupons were already covered in Task 5.
- [x] Focused E2E passed 10/10 across desktop/mobile; typecheck, lint (0 errors, 9 existing warnings) and Vitest (18/18) passed. Commit `2ecbec7 test: cover checkout failures and idempotency`.

### Task 8: Profile and wallets

**Files:** `tests/e2e/profile-wallets.spec.ts`, progress and coverage docs.

- [ ] Cover profile metadata limits, avatar/password actions, create/edit primary and secondary wallets, network/provider validation and 390 px usability.
- [ ] Run focused E2E and pre-commit checks; commit `test: cover profile and wallet management`.

### Task 9: Checkout Socket.IO

**Files:** `tests/e2e/checkout-realtime.spec.ts`, progress and coverage docs.

- [ ] Verify a pending checkout updates through the Socket.IO client and receipt; test disconnect/reconnect and REST reconciliation.
- [ ] Run focused E2E and pre-commit checks; commit `test: cover checkout realtime reconciliation`.

### Task 10: Event versioning

**Files:** `tests/e2e/event-versioning.spec.ts`, progress and coverage docs.

- [ ] Verify duplicate and older `nft.updated` / `order.updated` events are ignored and newer versions reconcile.
- [ ] Run focused E2E and pre-commit checks; commit `test: cover event deduplication and versions`.

### Task 11: Keyboard and focus

**Files:** `tests/e2e/accessibility.spec.ts`, progress and coverage docs.

- [ ] Cover keyboard navigation, visible focus, dialog focus trap/restore, labels, inline errors and live announcements.
- [ ] Run focused E2E and pre-commit checks; commit `test: cover keyboard and focus behavior`.

### Task 12: Skeletons and recovery

**Files:** `tests/e2e/loading-recovery.spec.ts`, progress and coverage docs.

- [ ] Cover loading placeholders, failed requests, retry, session recovery and reduced-motion behavior.
- [ ] Run focused E2E and pre-commit checks; commit `test: cover loading and recovery states`.

### Task 13: Visual regression and final suite

**Files:** `playwright.config.ts`, `tests/e2e/visual.spec.ts`, `tests/e2e/*.spec.ts`, progress and coverage docs.

- [ ] Add stable desktop/mobile baselines for home, detail, cart and checkout using fixed mock data and fonts.
- [ ] Run the full E2E suite, typecheck, lint, unit tests and production build; document any baseline/environment limitations.
- [ ] Commit `test: add responsive visual regression coverage`.

## Coverage notes

Only update matrix rows to `Verificado` after their named E2E assertion passes. This plan does not cover Lighthouse, full code comments, missing architecture documentation or deployment; those remain separate workstreams in `docs/PROGRESSO.md`.

Ruling: test sorting only on desktop because the supplied mobile frame does not expose a sort control — this avoids driving an invisible control — risk if wrong: mobile sorting remains untested and unavailable to users.
