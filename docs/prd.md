---
stepsCompleted:
  - step-01-init
  - step-02-discovery
  - step-02b-vision
  - step-02c-executive-summary
  - step-03-success
  - step-04-journeys
  - step-05-domain
  - step-06-innovation
  - step-07-project-type
  - step-08-scoping
  - step-09-functional
  - step-10-nonfunctional
  - step-11-polish
  - step-12-complete
inputDocuments: []
workflowType: prd
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
classification:
  projectType: web_app
  domain: general
  complexity: medium
  projectContext: greenfield
---

# Product Requirements Document - the-shopping-list-bmad

**Author:** Dian  
**Date:** 2026-04-01  
**Last Updated:** 2026-04-10 — List-first architecture (Phase 2 feature)

## Executive Summary

Build a mobile-screen-only web app for anonymous group shopping that prevents two common in-store failures: (1) duplicated items when people split up and coordinate via screenshots, and (2) budget surprises at checkout. The product enables a group to share a shopping list, collaborate while physically separated in the store, and stay aligned on both what to buy and what it will cost before reaching the cashier.

As of Phase 2, the app is **list-first**: users maintain persistent personal shopping lists that survive across shopping trips. A collaborative shopping session is an opt-in add-on spawned from a list. When a trip ends and some items were unavailable in-store, they automatically remain on the list ready for the next trip — no manual recovery needed.

### What Makes This Special

- **Persistent personal lists**: a named list lives on the user's device (via URL token) and carries over across shopping trips — no items are ever lost to a session expiry.
- Total price prediction: users enter item prices while shopping to maintain a running estimated total, giving the group a tactical budget radar to adjust in real time (before checkout).
- Anonymous collaboration: no accounts required; the core workflow is optimized for quick, situational group use (e.g., friends/household shopping trips).
- Lightweight sync: semi real-time updates (auto-refresh ~every 30 seconds) keep collaborators aligned without requiring live real-time infrastructure.

## Project Classification

- Project Type: Web app (mobile-screen-only; tablet/desktop shows a "mobile only app" screen)
- Domain: General consumer utility (shopping list)
- Complexity: Medium (shared collaboration + sync; otherwise simple)
- Project Context: Greenfield

## Success Criteria

### User Success

- Users can start a group shopping session in < 60 seconds: create session, add initial items, and begin shopping.
- Groups can shop tactically:
  - Avoid duplicate pickups while members split up in-store.
  - Stay on budget before checkout using a running total prediction.
- Shopping completion produces a digital receipt page summarizing picked/paid items and entered prices, usable to compare against the cashier receipt after checkout.

### Business Success

- Product goal: strictly free.
- Adoption goals (to define):
  - 3 months: target active users, repeat usage, shares per session.
  - 12 months: target retention and weekly usage.

### Technical Success

- Sync/refresh: list updates visible to collaborators within ≤ 30 seconds (polling).
- Collaboration reliability: no conflicting edits that cause lost/duplicated state.
- Integrity requirement: prevent duplicate item picked up outcomes via UX + state rules (e.g., item claimed/picked states).

### Measurable Outcomes

- Budget prediction accuracy: predicted total within ±10% of the final paid total.
- Duplicate purchases: 0 duplicate items picked up in-session (define precisely: same SKU vs same list item vs same quantity).
- Time-to-coordinate:
  - Median time-to-start-shopping ≤ 60 seconds
  - P90 time-to-start-shopping ≤ 90 seconds

## Product Scope

### MVP - Minimum Viable Product

- **Persistent personal lists** — named, multi-list, device-local (URL-as-identity)
- **List item management** — add, edit, soft-delete; items survive indefinitely
- **Session spawned from list** — active list items copied into session at start; list is unchanged during and after the session
- **Quick Shop** — create a one-off session without a list (preserved for fast/ad-hoc use)
- Group shopping session with collaborative shared list
- QR code generator (join/share session)
- Shopping list CRUD (in-session)
- PDF generator (digital receipt export)
- Receipt shows uncollected items with note that they remain on the list
- Light & dark mode

### Growth Features (Post-MVP)

- Per-item collected history on list ("last collected on [date]", populated from past sessions)
- List sharing / cross-device transfer without accounts
- Item frequency/reorder suggestions based on session history

### Vision (Future)

- TBD

## User Journeys

### Journey 0 - List-First Path: Plan Before You Go

Persona: Sari, 34, weekly grocery shopper who always forgets something.

Opening scene: Sari builds her grocery list throughout the week on her phone. On shopping day, she wants to start a shared session with her partner.

Rising action:
1. Sari opens the app and sees "My Lists" on the home screen.
2. She taps her existing "Weekly Groceries" list — 12 items ready.
3. She taps "Start Shopping", enters her name, and a session is created with all 12 items pre-loaded.
4. She shares the session link with her partner who joins.
5. They split across aisles and collect items.
6. The store is out of oat milk — neither of them marks it collected.

Climax: Session ends. The receipt shows 11 collected items and a note: "1 item still on your list." Sari and her partner finish with a clear digital receipt.

Resolution: Sari goes back to her "Weekly Groceries" list — oat milk is still there for next week. She didn't have to re-type it.

### Journey 1 - Primary User Success Path: Fast Tactical Group Shop

Persona: Maya, 27, shopping with two friends before a weekend gathering.

Opening scene: The group usually shares screenshots and ends up with duplicate items and budget surprises.

Rising action:
1. Maya opens the app, creates a new named list "Party Supplies", and adds items.
2. She taps "Start Shopping", enters her name, and the session is created with all items pre-loaded.
3. She shares access via QR code and shared link.
4. Teammates join anonymously and see the same list.
5. They split across aisles. Items begin in active state.
6. When someone picks an item, they mark it collected (item is struck through).
7. Price is optionally entered at collection time (or skipped if tag not visible).

Climax: The group sees collected progress and running totals from entered prices, preventing duplicated pickups and late budget shocks.

Resolution: They finish with a digital receipt view containing who contributed what, item qty/name/price, and total. The "Party Supplies" list is preserved for future reference.

### Journey 2 - Primary User Edge Case: Conflicting Edits on the Same Item

Persona: Arif, 31, moving quickly through a crowded store with weak attention and urgency.

Opening scene: Two members reach for the same item around the same time.

Rising action:
1. Arif toggles item to collected while another member is also editing.
2. The app receives near-simultaneous updates in a polling model (~30s).
3. System applies deterministic conflict handling (last-write-wins + edit timestamp) and preserves one final item state.

Climax: Instead of a broken/inconsistent list, users see a clear final state with a recent-update indicator.

Resolution: Group proceeds without uncertainty; no silent state corruption and no duplicated purchased output from edit collisions.

### Journey 3 - Primary User Edge Case: Wrong Price, Corrected Before Checkout

Persona: Lina, 24, price-conscious shopper helping keep the group under budget.

Opening scene: Lina marks an item collected and enters an estimated price quickly.

Rising action:
1. Later she notices the entered price is wrong.
2. She edits the item price before checkout.
3. Total prediction recalculates on next sync cycle and reflects correction.

Climax: The group sees updated expected total and can still adjust the cart proactively.

Resolution: Final digital receipt better matches real checkout, increasing trust in the app.

### Journey 4 - Support/Troubleshooting Path: Resolve Receipt Mismatch

Persona: Niko, 29, compares app receipt with cashier receipt after shopping.

Opening scene: Total in app and cashier receipt differ beyond expectation.

Rising action:
1. Niko reviews the digital receipt breakdown by contributor and item details (qty/name/price).
2. Team identifies which item had missing or incorrect optional price input.
3. They correct historical understanding for next trip behavior (enter price when visible, fix obvious mistakes).

Climax: Mismatch cause is understandable, not mysterious.

Resolution: Users keep trust in the workflow even with optional pricing.

### Journey Requirements Summary

- **Persistent personal lists**
  - Named lists created from the home screen, stored by URL token
  - Multiple lists per device, managed via localStorage registry
  - List items: add, edit, soft-delete; items survive sessions
  - "Copy list link" CTA — URL is the identity; users must bookmark to access from other devices
  - "Add to My Lists" banner when a list URL is opened on a device without the list in localStorage
- Session spawned from list
  - "Start Shopping" on a list copies all active items into a new session
  - Session carries `list_id` FK so the relationship is preserved
  - List is unchanged during and after the session
- Anonymous session collaboration
  - Session creation and join via QR code and shared link
  - Multi-user shared list without login
- Quick Shop path (preserved)
  - Create a one-off session without a list from the home screen
- Session item state model
  - Item states: active, collected, deleted
  - Visual collected indication (strikethrough)
- Collection + pricing workflow
  - Optional price entry when marking collected
  - Smooth path when price is unknown
- Conflict handling
  - Deterministic edit resolution for simultaneous updates
  - Clear state consistency behavior for users
- Correction workflow
  - Edit collected item price with recalculated predicted total
- Digital receipt output
  - Contributor-based item attribution
  - Item fields: qty, name, price
  - Session total
  - "Items still on your list" section showing uncollected items, with note they remain on the list
  - For list-linked sessions: redirect to the list after session ends
  - For Quick Shop sessions: show QR template code for next-trip restart (existing behavior)
- Sync model
  - Polling-based refresh around 30s with predictable consistency semantics

## Web App Specific Requirements

### Project-Type Overview

This product is a Single Page Application (SPA) optimized for mobile-screen usage, with anonymous collaborative shopping sessions. The app prioritizes fast in-session interactions, predictable shared state updates via 30-second polling, and lightweight onboarding through QR/link join flows. Although session-centric, SEO is required for discovery and product visibility.

### Technical Architecture Considerations

- Application model: SPA with client-side routing; **list-first navigation** (home → list → session).
- **List identity model**: URL-as-identity. The CUID2 list token is the sole identifier. Lists are registered in `localStorage` (`lists_registry`) on the creating device. Multi-device access requires the user to share/bookmark the URL.
- **Session ↔ list relationship**: sessions carry a nullable `list_id` FK. `NULL` = Quick Shop. A list-linked session copies active list items at creation; the list row is never mutated by session activity.
- **Template deprecation**: the `templates`/`template_items` tables and `GET /api/templates/[token]` route are kept alive for backward compatibility with issued QR codes (30-day expiry). No new template-creation flows. New functionality uses lists.
- Real-time strategy: polling-based synchronization every 30 seconds for shared session state and predicted totals. No polling on the list page (personal/single-user).
- Cross-browser support: broad modern browser compatibility, with graceful degradation where needed.
- Mobile-only gating behavior: non-mobile viewports must render a clear mobile only app screen and prevent normal app interaction.
- State consistency: deterministic conflict resolution for near-simultaneous edits on shared items.
- Performance baseline: interaction-first UX (fast session create/join, low-latency item state toggles, non-blocking optional price input).
- SEO enablement for SPA: SEO-friendly landing/marketing routes, metadata strategy, indexable public pages, and crawler-compatible rendering approach.

### Browser Matrix

- Support a broad set of modern browsers across mobile and desktop engines.
- Define and maintain a compatibility matrix (minimum major versions) for:
  - Mobile browsers (iOS Safari-class, Android Chromium-class)
  - Desktop browsers (Chromium-class, Safari-class, Firefox-class) for landing/SEO pages and mobile-only gate screen
- Ensure core non-app pages and join-entry surfaces fail gracefully in unsupported environments.

### Responsive Design

- Primary UX target is mobile screens.
- App interaction screens are optimized for mobile only.
- Tablet/desktop behavior:
  - Show mobile-only gate screen
  - Do not expose full in-session UI on non-mobile form factors
- Consistent visual treatment for light/dark mode in both app and gate screen.

### Performance Targets

- Session creation and first actionable state available in under 60 seconds end-to-end.
- Shared-state freshness target aligned to polling cadence (updates visible within 30 seconds under normal conditions).
- Keep critical interactions lightweight:
  - Add item
  - Mark collected
  - Optional price input
  - Price correction
- Budget total recalculation should feel immediate after synced updates.

### SEO Strategy

- SEO is required for public discovery surfaces.
- Focus SEO on public, indexable routes (home, value proposition, how-it-works, share/join explainer where appropriate).
- Exclude private session data and anonymous collaborative internals from indexing.
- Implement metadata, semantic structure, and crawl-friendly content for acquisition pages.
- Use analytics-ready SEO instrumentation to measure discoverability improvements.

### Accessibility Level

- No formal WCAG level specified yet.
- Minimum recommended baseline for MVP:
  - Semantic structure and readable text contrast
  - Keyboard-operable primary actions
  - Screen-reader-friendly labels for key controls
  - Clear error and status messaging for sync/conflict states
- Formal target can be set later during architecture/UX phases.

### Implementation Considerations

- Design data contracts that separate:
  - Shared list item lifecycle (added, collected, deleted)
  - Optional price entry and correction history
  - Contributor attribution for digital receipt generation
- Build for conflict resilience in collaborative edits and predictable user feedback.
- Ensure polling cadence does not degrade battery/network usage excessively on mobile.
- Keep SEO/public layer decoupled from session collaboration layer to reduce leakage and complexity.

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Platform MVP

The first release should establish a durable product foundation: reliable anonymous collaboration, predictable shared state updates, mobile-only interaction boundaries, and receipt-grade output. The goal is to validate both usability and system behavior under real group-shopping conditions before expanding feature breadth.

**Resource Requirements:** Solo builder + AI-assisted development

- Delivery model is intentionally lean and execution-focused.
- Scope must stay strict to avoid overextension while still covering all critical workflows end-to-end.

### MVP Feature Set (Phase 1)

**Core User Journeys Supported:**

- Primary success path: create/join session, split shopping, avoid duplicates, track predicted total, finish with digital receipt.
- Edge path 1: simultaneous item edits resolved deterministically.
- Edge path 2: wrong price corrected before checkout with updated total.
- Troubleshooting path: compare app receipt and cashier receipt to explain mismatches.

**Must-Have Capabilities:**

- **Persistent personal lists** (named, multi-list, device-local via URL token)
- **List item management** (add, edit, soft-delete, rename list)
- **Session spawned from list** (all active items copied into session; list unchanged)
- **Quick Shop** (one-off session without a list)
- Session creation + anonymous join via QR/link
- Shared list collaboration
- Session item lifecycle states: active, collected, deleted
- Optional price input at collect-time
- Running total prediction
- Conflict handling for near-simultaneous edits
- Digital receipt page with contributor/item breakdown and uncollected-items section
- PDF export
- Post-session redirect to list (for list-linked sessions)
- Mobile-only app gate behavior on tablet/desktop
- Light/dark mode

### Post-MVP Features

**Phase 2 (Post-MVP):**

- Not yet specified (intentionally deferred until MVP learning is validated)

**Phase 3 (Expansion):**

- Not yet specified (reserved for future strategy once usage patterns are observed)

### Risk Mitigation Strategy

**Technical Risks:** Not specified yet

- Placeholder action: identify top 3 failure modes during architecture phase (sync conflicts, state drift, receipt accuracy).

**Market Risks:** Not specified yet

- Placeholder action: define early validation metrics from real usage (repeat sessions, completion rates, user trust in prediction).

**Resource Risks:** Solo delivery capacity constraints

- Contingency: preserve core flow by cutting non-critical polish before reducing core collaboration/prediction/receipt capabilities.

## Functional Requirements

### Personal List Management (new)

- FR0a: A user can create a named personal shopping list from the home screen.
- FR0b: A user can maintain multiple named lists on a single device.
- FR0c: The system can store a user's list registry in localStorage, keyed by list token.
- FR0d: A user can add items to a personal list with name and quantity.
- FR0e: A user can edit items on a personal list (name and quantity).
- FR0f: A user can soft-delete items from a personal list.
- FR0g: A user can rename a personal list.
- FR0h: The system can persist a personal list indefinitely (no expiry, or 1-year idle cleanup).
- FR0i: A user can copy the list URL to share or bookmark it for multi-device access.
- FR0j: The system can show an "Add to My Lists" prompt when a list URL is opened on a device without that list in localStorage.
- FR0k: A user can spawn a collaborative shopping session from a list.
- FR0l: The system shall copy all active list items into the spawned session at session creation time (items are not moved; the list is unchanged).
- FR0m: The system shall record the `list_id` on the session so the relationship is preserved.
- FR0n: After a session ends, the system shall redirect the user back to the originating list (for list-linked sessions).
- FR0o: The session receipt shall display uncollected items with a note that they remain on the list.

### Session & Access Management

- FR1: A shopper can create a new anonymous shopping session from a mobile device (Quick Shop — no list required).
- FR2: A shopper can join an existing session using a shared link.
- FR3: A shopper can join an existing session by scanning a QR code.
- FR4: The system can restrict full app usage to mobile screen contexts.
- FR5: The system can show a mobile-only access screen on non-mobile viewports.

### Collaborative List Management

- FR6: A shopper can add items to a shared shopping list in a session.
- FR7: A shopper can edit list items in a shared shopping session.
- FR8: A shopper can remove list items from a shared shopping session.
- FR9: A shopper can mark an item as collected.
- FR10: A shopper can return an item from collected to added.
- FR11: The system can represent session item lifecycle states as active, collected, and deleted.
- FR12: The system can show collected items with a distinct completed state indicator.
- FR13: The system can synchronize shared list state across session participants.

### Pricing & Budget Prediction

- FR14: A shopper can optionally enter an item price when marking an item as collected.
- FR15: A shopper can update a previously entered item price.
- FR16: The system can maintain a predicted total based on collected-item prices.
- FR17: The system can update predicted total values when item states or item prices change.
- FR18: The system can allow shopping flow to continue when item prices are unknown.

### Conflict Handling & Data Integrity

- FR19: The system can resolve near-simultaneous edits to the same item deterministically.
- FR20: The system can preserve a single authoritative item state after conflict resolution.
- FR21: The system can prevent duplicated item outcomes caused by conflicting state updates.
- FR22: The system can preserve session data consistency during periodic synchronization.
- FR23: The system can record enough change context to explain state corrections when disputes occur.

### Receipt & Shopping Completion

- FR24: A shopper can view a digital receipt summary for a completed shopping session.
- FR25: The system can show contributor attribution for collected items in the receipt view.
- FR26: The system can show item quantity, item name, and entered item price in the receipt view.
- FR27: The system can show a session total in the receipt view.
- FR28: A shopper can export session receipt data as a PDF.

### SEO & Discovery Surfaces

- FR29: The system can provide indexable public pages for product discovery.
- FR30: The system can provide crawlable metadata for SEO on public routes.
- FR31: The system can prevent private collaborative session data from being indexed by search engines.
- FR32: The system can expose non-sensitive marketing/value-proposition content for search discovery.

### Experience Preferences & Accessibility Baseline

- FR33: A shopper can switch between light and dark visual themes.
- FR34: The system can preserve user theme preference within the app experience.
- FR35: A shopper can complete core actions with keyboard-only input where supported.
- FR36: The system can expose accessible labels and status messaging for core controls and sync/conflict states.

### Cross-Browser & Platform Coverage

- FR37: The system can support core public and mobile-gated experiences across a broad set of modern browsers.
- FR38: The system can provide graceful degradation behavior in unsupported browser/device contexts.
- FR39: The system can provide consistent session join behavior (QR/link entry) across supported mobile browsers.

## Non-Functional Requirements

### Performance

- The system shall complete core user actions (create session, join session, add/edit/delete item, mark collected, price update) within 2 seconds under normal network conditions.
- The system shall reflect collaborator updates within 30 seconds based on the polling synchronization model.
- The system shall recalculate predicted totals within 1 second after synchronized data updates are applied.
- The system shall load the digital receipt view within 3 seconds for typical MVP session sizes.
- The system shall generate PDF receipt exports within 5 seconds for typical MVP session sizes.

### Security

- The system shall encrypt all client-server traffic in transit using HTTPS/TLS.
- The system shall issue unguessable session identifiers and join links resistant to enumeration.
- The system shall issue unguessable list identifiers resistant to enumeration.
- The system shall prevent indexing of private session and list data by search engines.
- The system shall validate all user-submitted input fields including item names, quantities, and prices.
- The system shall require a valid session join artifact (QR/link token) before granting session access.

### Scalability

- The system shall support at least 100 concurrent active sessions without functional degradation at MVP scale.
- The system shall support at least 10 participants per session for core collaboration flows.
- The system shall support 10x MVP traffic growth without requiring a full rewrite of core domain models.
- The polling infrastructure shall sustain expected concurrent refresh loads without request backlog under normal usage.

### Accessibility

- The system shall allow keyboard operation for core user flows on supported browsers.
- The system shall provide accessible labels for core controls and critical state indicators.
- The system shall maintain readable contrast in both light and dark themes for core interfaces.
- The system shall present sync and conflict states with clear, perceivable status messaging.

### Reliability

- The system shall target 99.5% monthly availability for core session operations.
- The system shall preserve committed list updates without silent data loss.
- The system shall apply deterministic and reproducible conflict resolution for simultaneous edits.
- The system shall automatically recover from temporary polling failures on subsequent intervals without requiring session restart.
