# the-shopping-list

Anonymous, mobile-only group shopping web app. Users maintain personal shopping lists, optionally spawn collaborative shopping sessions from them, track a predicted budget total, and export a digital receipt.

## Architecture

- **Type**: Single Page Application (SPA) with client-side routing.
- **Sync model**: Polling-based (~30 s interval). Do not introduce WebSocket or server-sent event dependencies without a deliberate architecture decision.
- **Sessions**: Anonymous — no user accounts, no authentication. Sessions are identified by unguessable CUID2 tokens. Invalid or expired tokens must show a clear error state.
- **Lists**: Personal, persistent — identified by unguessable CUID2 tokens stored in `localStorage` (`lists_registry`). No expiry (or 1-year idle cleanup). Lists are single-user; only sessions are collaborative.
- **Mobile-only gate**: Non-mobile viewports must render a "mobile only app" screen and must not expose any in-session UI. Mobile browsers (iOS Safari-class, Android Chromium-class) are the primary target.
- **SEO split**: Public/marketing routes are indexable. Private session and list routes must be excluded from indexing.
- **Architecture doc**: `docs/architecture.md`

## List Lifecycle

A **list** is a persistent personal entity. It outlives sessions.

- Lists are created from the home page ("My Lists" section).
- Lists contain `list_items` with two states: `active` (default) and `deleted` (soft).
- A shopping session is spawned from a list via `POST /api/lists/[token]/sessions`. All active list items are **copied** (not moved) into the session as `active` items.
- After a session ends, list items are unchanged — uncollected session items simply weren't found in-store; the list still holds them.
- Lists survive session deletion.

## Session Lifecycle

- Sessions spawned from a list carry a `list_id` FK. Sessions without a list (Quick Shop) have `list_id = NULL`.
- Sessions expire after 48 hours. Lists do not expire (or expire after 1 year idle).
- When a list-linked session is deleted, **no template is created** — the list already preserves the items.
- When a Quick Shop session is deleted, a template QR blueprint is created (existing behavior, kept for backward compat).

## Item Lifecycle (session items)

Items have exactly three states: `active` → `collected` ↔ `active`, and soft `deleted`. These are the only states.

- `active`: default state when created.
- `collected`: item picked up; visual treatment is strikethrough. Optional price can be entered at this point.
- `deleted`: soft removed from session.

Never introduce additional item states without a product decision.

## Templates (deprecated pattern)

The `templates` / `template_items` tables and `GET /api/templates/[token]` route are kept alive for backward compatibility with issued QR codes (30-day expiry). Do not create new template-creation flows. New functionality should use lists.

## Conflict Resolution

Deterministic last-write-wins using edit timestamps. When near-simultaneous edits collide, one authoritative final state is preserved. Agents must not implement optimistic merging or silent state drops — the resolved state must be clear to the user.

## Budget Prediction

Running total is derived only from prices entered on **collected** items. Prices are optional — the flow must always continue without them. Total recalculates within 1 s after a sync cycle applies new data.

## Key Documents

- Requirements & scope: [docs/prd.md](../docs/prd.md)
- Epic and story breakdown: [docs/epics.md](../docs/epics.md)
- Architecture: [docs/architecture.md](../docs/architecture.md)

## Conventions

- **Mobile-first**: All app screens are built for mobile. Gate non-mobile viewports at the layout/router level, not component-by-component.
- **No auth**: Never add login, registration, or session-cookie auth to the core shopping flow.
- **Polling, not push**: State freshness target is ≤ 30 s. Do not add live subscriptions for MVP.
- **Accessibility baseline**: Semantic HTML, readable contrast in light/dark, keyboard-operable primary actions, screen-reader labels on key controls and sync/conflict states.

## Build and Test

- Framework: Next.js 14+ (App Router)
- Styling: Tailwind CSS
- Database: Neon (serverless PostgreSQL) via `@neondatabase/serverless`
- Token generation: `@paralleldrive/cuid2`
- Data fetching / polling: SWR

