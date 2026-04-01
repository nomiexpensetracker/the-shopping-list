# the-shopping-list

Anonymous, mobile-only group shopping web app. Users create or join sessions without accounts, collaborate on a shared list in-store, track a predicted budget total, and export a digital receipt.

## Architecture

- **Type**: Single Page Application (SPA) with client-side routing.
- **Sync model**: Polling-based (~30 s interval). Do not introduce WebSocket or server-sent event dependencies without a deliberate architecture decision.
- **Sessions**: Anonymous — no user accounts, no authentication. Sessions are identified by unguessable tokens. Invalid or expired tokens must show a clear error state.
- **Mobile-only gate**: Non-mobile viewports must render a "mobile only app" screen and must not expose any in-session UI. Mobile browsers (iOS Safari-class, Android Chromium-class) are the primary target.
- **SEO split**: Public/marketing routes are indexable. Private session routes must be excluded from indexing.
- **Architecture doc**: Not yet written (greenfield). Update these instructions when an architecture doc is created.

## Item Lifecycle

Items have exactly three states: `added` → `collected` ↔ `added`, and soft `deleted`. These are the only states.

- `added`: default state when first created.
- `collected`: item picked up; visual treatment is strikethrough. Optional price can be entered at this point.
- `deleted`: soft removed from list.

Never introduce additional item states without a product decision.

## Conflict Resolution

Deterministic last-write-wins using edit timestamps. When near-simultaneous edits collide, one authoritative final state is preserved. Agents must not implement optimistic merging or silent state drops — the resolved state must be clear to the user.

## Budget Prediction

Running total is derived only from prices entered on **collected** items. Prices are optional — the flow must always continue without them. Total recalculates within 1 s after a sync cycle applies new data.

## Key Documents

- Requirements & scope: [docs/prd.md](../docs/prd.md)
- Epic and story breakdown: [docs/epics.md](../docs/epics.md)

## Conventions

- **Mobile-first**: All app screens are built for mobile. Gate non-mobile viewports at the layout/router level, not component-by-component.
- **No auth**: Never add login, registration, or session-cookie auth to the core shopping flow.
- **Polling, not push**: State freshness target is ≤ 30 s. Do not add live subscriptions for MVP.
- **Accessibility baseline**: Semantic HTML, readable contrast in light/dark, keyboard-operable primary actions, screen-reader labels on key controls and sync/conflict states.

## Build and Test

> Tech stack not yet decided (greenfield). Update this section once tooling is chosen.
