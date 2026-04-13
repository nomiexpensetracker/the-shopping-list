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
  - step-13-implementation-sync
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
lastSyncedWithCode: 2026-04-13
---

# Product Requirements Document - the-shopping-list-bmad

**Author:** Dian  
**Date:** 2026-04-01  
**Last Updated:** 2026-04-13 *(synced with implemented code)*

---

## Executive Summary

Build a mobile-screen-only web app for anonymous group shopping that prevents two common in-store failures: (1) duplicated items when people split up and coordinate via screenshots, and (2) budget surprises at checkout. The product enables a group to share a shopping list, collaborate while physically separated in the store, and stay aligned on both what to buy and what it will cost before reaching the cashier.

### What Makes This Special

- Total price prediction: users enter item prices while shopping to maintain a running estimated total, giving the group a tactical budget radar to adjust in real time (before checkout).
- Anonymous collaboration: no accounts required; the core workflow is optimized for quick, situational group use (e.g., friends/household shopping trips).
- Lightweight sync: semi real-time updates (auto-refresh ~every 30 seconds) keep collaborators aligned without requiring live real-time infrastructure.
- Session continuity via templates: when a session ends, its items are archived as a reusable template. A QR code on the receipt lets the group re-load all items into a fresh session on the next trip.

---

## Project Classification

- Project Type: Web app (mobile-screen-only; tablet/desktop shows a "mobile only app" screen)
- Domain: General consumer utility (shopping list)
- Complexity: Medium (shared collaboration + sync; otherwise simple)
- Project Context: Greenfield

---

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
- Integrity requirement: prevent duplicate item picked up outcomes via UX + state rules.

### Measurable Outcomes

- Budget prediction accuracy: predicted total within ±10% of the final paid total.
- Duplicate purchases: 0 duplicate items picked up in-session.
- Time-to-coordinate:
  - Median time-to-start-shopping ≤ 60 seconds
  - P90 time-to-start-shopping ≤ 90 seconds

---

## Product Scope

### MVP - Minimum Viable Product

- Group shopping session with host/participant roles
- QR code generator (join/share session)
- Shopping list CRUD with item descriptions
- Participant identity (nickname + color assignment)
- Live participant join toast
- PDF generator (digital receipt export)
- Session templates (re-use previous trip's item list via QR code)
- Light & dark mode

### Growth Features (Post-MVP)

- Locale-aware currency display based on network/IP detection *(next focus)*
- TBD based on MVP learnings

### Vision (Future)

- TBD

---

## User Journeys

### Journey 1 - Primary User Success Path: Fast Tactical Group Shop

Persona: Maya, 27, shopping with two friends before a weekend gathering.

Opening scene: The group usually shares screenshots and ends up with duplicate items and budget surprises.

Rising action:
1. Maya creates a shopping session on mobile, entering a session title and her nickname.
2. She shares access via QR code and shared link.
3. Teammates join anonymously by entering their nicknames; each gets a unique color for identification.
4. They split across aisles. Items begin in `active` state.
5. When someone picks an item, they mark it collected — entering quantity and optional price.
6. Price is optionally entered at collection time (or skipped if tag not visible).

Climax: The group sees collected progress and running totals from entered prices, preventing duplicated pickups and late budget shocks.

Resolution: They finish with a digital receipt view containing who contributed what, item qty/name/price, and total. On ending the session, a QR code is generated to reload the same list next time.

### Journey 2 - Primary User Edge Case: Conflicting Edits on the Same Item

Persona: Arif, 31, moving quickly through a crowded store with weak attention and urgency.

Opening scene: Two members reach for the same item around the same time.

Rising action:
1. Arif toggles item to `collected` while another member is also editing.
2. The app receives near-simultaneous updates in a polling model (~30s).
3. System applies deterministic conflict handling (last-write-wins + server-side `updated_at` timestamp) and preserves one final item state.

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
3. They correct historical understanding for next trip behavior.

Climax: Mismatch cause is understandable, not mysterious.

Resolution: Users keep trust in the workflow even with optional pricing.

### Journey 5 - Returning Shopper: Reuse Previous Trip via Template QR

Persona: Maya, returning to the store the following week.

Opening scene: The group wants to shop the same items as last time without re-entering the list.

Rising action:
1. Maya scans the QR code from the previous session's receipt PDF.
2. The app validates the template (30-day expiry window).
3. A new session is created, pre-populated with all non-deleted items from the previous trip.
4. Maya is prompted to set a new session title and nickname.

Climax: The group starts shopping immediately without manual re-entry.

Resolution: Template QR codes provide a repeatable shopping routine with minimal friction.

### Journey Requirements Summary

- Anonymous session collaboration
  - Session creation and join via QR code and shared link
  - Multi-user shared list without login
  - Host/participant role distinction
  - Nickname + color-based participant identity
- List state model
  - Item states: `active`, `collected`, `restored`, `deleted`
  - Visual collected indication (strikethrough / distinct styling)
  - Soft delete with restore capability
- Collection + pricing workflow
  - Optional price entry (per unit) when marking collected
  - Quantity editable at collect time
  - Smooth path when price is unknown
- Conflict handling
  - Deterministic last-write-wins edit resolution using server-side timestamps
  - 409 conflict response with authoritative state returned
  - Clear state consistency behavior for users
- Correction workflow
  - Edit collected item price with recalculated predicted total
- Digital receipt output
  - Contributor-based item attribution
  - Item fields: qty, name, description, price
  - Session total (sum of `quantity × price` for collected items)
  - QR code on receipt linking to reusable template
- Session templates
  - Auto-created on session end
  - 30-day expiry
  - Pre-populates a new session from QR scan
- Sync model
  - Polling-based refresh around 30s with predictable consistency semantics

---

## Web App Specific Requirements

### Project-Type Overview

This product is a Single Page Application (SPA) optimized for mobile-screen usage, with anonymous collaborative shopping sessions. The app prioritizes fast in-session interactions, predictable shared state updates via 30-second polling, and lightweight onboarding through QR/link join flows. Although session-centric, SEO is required for discovery and product visibility.

### Technical Architecture Considerations

- Application model: Next.js 14+ App Router; CSR for session routes, SSG for public/SEO routes.
- Real-time strategy: polling-based synchronization every 30 seconds (SWR) for shared list state and predicted totals.
- Cross-browser support: broad modern browser compatibility, with graceful degradation where needed.
- Mobile-only gating behavior: non-mobile viewports must render a clear mobile-only app screen and prevent normal app interaction. Enforced at both middleware (UA detection) and client (`MobileGate` component with viewport width check).
- State consistency: deterministic last-write-wins conflict resolution using server-side `updated_at` timestamps. Clients may send `client_edit_at` to opt into 409 conflict detection.
- Performance baseline: interaction-first UX (fast session create/join, low-latency item state toggles, non-blocking optional price input).
- SEO enablement: SSG public pages with metadata; `noindex` on all `/session/*` routes via layout metadata.
- Database: Neon serverless PostgreSQL. Session identifiers are CUID2 (unguessable, non-sequential).
- Participant identity: stored in `localStorage` keyed by session token; no server-side auth.

### Currency & Locale

- **Current state (implemented):** currency is hard-coded to Indonesian Rupiah (`IDR`) using `Intl.NumberFormat('id-ID', ...)`.
- **Next planned feature:** detect the user's locale/currency from their network request (IP-based or `Accept-Language` header) and format prices accordingly. This should be transparent — the stored price value remains a plain `NUMERIC` in the database; formatting is a display-only concern.

### Item Lifecycle States

The implemented item state machine uses four states (not three as originally specced):

| State | Description |
|---|---|
| `active` | Item is on the list, not yet collected. Default on creation. |
| `collected` | Item has been picked up. Optional price captured. |
| `restored` | Item was previously deleted and has been un-deleted. Behaves like `active`. |
| `deleted` | Soft-deleted. Not shown in main list; visible in a collapsed "Deleted" section with restore option. Terminal for standard flow. |

Valid server-enforced transitions: `active → collected`, `active → deleted`, `collected → active`, `collected → deleted`, `restored → active`, `restored → collected`, `restored → deleted`.

### Participant System

- Each participant has: `id` (CUID2), `name` (nickname), `color` (random hex), `role` (`host` | `participant`), `joined_at`.
- The session creator is assigned the `host` role. All others joining via link/QR are `participant`.
- Participant data is stored server-side and referenced via `localStorage` on the client.
- Participant avatars are shown in the session header (up to 3, with overflow count).
- A live "join toast" animates participant names as they join the session.
- Hosts have access to the receipt/end-session flow (cart button in FAB area).

### Session Lifecycle

1. **Create** — POST `/api/sessions` with title + host nickname. Returns session token + participant record. Stored in `localStorage`.
2. **Join** — POST `/api/sessions/[token]/participants` with nickname. Stored in `localStorage`.
3. **Active shopping** — items managed via PATCH/DELETE; state polled every 30s via SWR.
4. **Receipt** — GET `/api/sessions/[token]/receipt` returns collected items + contributor breakdown + total.
5. **End session** — DELETE `/api/sessions/[token]` archives items as a template, deletes session. Returns `templateId`. Client auto-downloads PDF receipt with template QR, then redirects to home.
6. **Template reuse** — GET `/api/templates/[token]` validates expiry; if valid, new session is created and pre-populated with template items.

### Browser Matrix

- Support a broad set of modern browsers across mobile and desktop engines.
- Primary targets: iOS Safari-class, Android Chromium-class.
- Desktop: Chromium-class, Safari-class, Firefox-class (for landing page + mobile-only gate only).
- Ensure core non-app pages and join-entry surfaces fail gracefully in unsupported environments.

### Responsive Design

- Primary UX target is mobile screens (viewport width < 768px).
- App interaction screens are optimized for mobile only.
- Tablet/desktop behavior: show mobile-only gate screen; do not expose in-session UI.
- Consistent visual treatment for light/dark mode in both app and gate screen.

### Performance Targets

- Session creation and first actionable state available in under 60 seconds end-to-end.
- Shared-state freshness target: updates visible within 30 seconds under normal conditions.
- Critical interactions kept lightweight: add item, mark collected, optional price input, price correction.
- Budget total recalculation should feel immediate after synced updates.

### SEO Strategy

- SEO is required for public discovery surfaces.
- Focus SEO on public, indexable routes (home, value proposition).
- Exclude private session data and collaborative internals from indexing (`noindex` on `/session/*`).
- Implement metadata, semantic structure, and crawl-friendly content for acquisition pages.
- Google Analytics instrumented via GTM (`G-EG3HB87D9P`), Vercel Analytics and Speed Insights active.

### Accessibility Level

- No formal WCAG level specified yet.
- Minimum recommended baseline for MVP:
  - Semantic structure and readable text contrast
  - Keyboard-operable primary actions
  - Screen-reader-friendly labels for key controls (`aria-label`, `aria-live`, `role` attributes)
  - Clear error and status messaging for sync/conflict states
- Formal target can be set later.

### Implementation Considerations

- Data contracts separate:
  - Shared list item lifecycle (`active`, `collected`, `restored`, `deleted`)
  - Optional price entry (per-unit, stored as `NUMERIC(10,2)`)
  - Contributor attribution (created_by, updated_by, collected_by — composite FK to session_participants)
  - Item activity log (`item_activities` table: created, updated, deleted, restored, collected)
- Session auto-cleanup: `delete_expired_sessions()` DB function removes sessions older than 2 days.
- Template auto-cleanup: `delete_expired_template()` DB function removes templates older than 30 days.

---

## Project Scoping & Phased Development

### MVP Strategy & Philosophy

**MVP Approach:** Platform MVP

The first release should establish a durable product foundation: reliable anonymous collaboration, predictable shared state updates, mobile-only interaction boundaries, and receipt-grade output. The goal is to validate both usability and system behavior under real group-shopping conditions before expanding feature breadth.

**Resource Requirements:** Solo builder + AI-assisted development

### MVP Feature Set (Phase 1) — ✅ Implemented

- Session creation + anonymous join via QR/link
- Host/participant role model
- Shared list collaboration with item CRUD
- Item descriptions (optional per item)
- Four-state item lifecycle: `active`, `collected`, `restored`, `deleted`
- Soft delete with restore
- Optional price input (per unit) at collect-time, with quantity editable
- Running total prediction (sum of `quantity × price` for collected items)
- Conflict handling: last-write-wins with optional 409 detection via `client_edit_at`
- Item activity log
- Digital receipt page with contributor/item breakdown
- PDF export (html2canvas + jsPDF, client-side)
- Session templates — archive on end, reuse via QR
- Participant nicknames with color-coded avatars and live join toast
- Session title editing (host)
- Participant name/color editing
- Mobile-only app gate (middleware + client)
- Light/dark mode (localStorage-persisted)
- Analytics: Google Analytics, Vercel Analytics, Vercel Speed Insights

### Phase 2 — Planned / Next Focus

- **Locale-aware currency** — detect user locale from network request; format prices using `Intl.NumberFormat` with the detected locale/currency. Database value stays as plain numeric.

### Phase 3 (Expansion)

- TBD based on usage patterns observed post-MVP.

### Risk Mitigation Strategy

**Technical Risks (identified)**

- Sync conflicts: mitigated by last-write-wins with server-side timestamp authority.
- State drift: mitigated by 30s SWR polling with revalidation on focus.
- Receipt accuracy: mitigated by optional price model — users are aware totals are estimates.

**Market Risks:** Not yet specified — define early validation metrics from real usage.

**Resource Risks:** Solo delivery capacity constraints — preserve core flow by cutting non-critical polish first.

---

## Functional Requirements

### Session & Access Management

- FR1: A shopper can create a new anonymous shopping session from a mobile device, providing a session title and their nickname.
- FR2: A shopper can join an existing session using a shared link.
- FR3: A shopper can join an existing session by scanning a QR code.
- FR4: The system can restrict full app usage to mobile screen contexts (< 768px viewport width).
- FR5: The system can show a mobile-only access screen on non-mobile viewports.
- FR6: The system assigns the session creator the `host` role and all joiners the `participant` role.
- FR7: Each participant is assigned a unique display color and can set a nickname.
- FR8: The session title can be updated by the host after creation.
- FR9: The system displays live participant join notifications via an animated toast.

### Collaborative List Management

- FR10: A shopper can add items to a shared shopping list in a session, with an optional description.
- FR11: A shopper can edit item quantity directly from the list view.
- FR12: A shopper can soft-delete list items; deleted items appear in a collapsed section and can be restored.
- FR13: A shopper can mark an item as collected, specifying quantity and optional unit price.
- FR14: A shopper can return a collected item to `active` state.
- FR15: A shopper can restore a deleted item to `active` state.
- FR16: The system represents item lifecycle states as `active`, `collected`, `restored`, and `deleted`.
- FR17: The system shows collected items with distinct styling.
- FR18: The system shows deleted items in a collapsible section with a restore action.
- FR19: The system synchronizes shared list state across session participants via 30-second polling.
- FR20: Each item shows the color of the participant who created it.

### Conflict Handling & Data Integrity

- FR21: The system resolves near-simultaneous edits to the same item deterministically using last-write-wins with server-side `updated_at` timestamps.
- FR22: Clients may send `client_edit_at` to detect conflicts; the server returns a `409` with the authoritative item state when a newer write already exists.
- FR23: The system preserves a single authoritative item state after conflict resolution.
- FR24: The system prevents duplicated item outcomes caused by conflicting state updates.
- FR25: The system preserves session data consistency during periodic synchronization.
- FR26: The system records item activity (created, updated, deleted, restored, collected) in an activity log for audit and troubleshooting.

### Pricing & Budget Prediction

- FR27: A shopper can optionally enter a per-unit item price when marking an item as collected.
- FR28: A shopper can update a previously entered item price.
- FR29: The system maintains a predicted total calculated as the sum of `quantity × price` for all collected items with a known price.
- FR30: The system updates predicted total values when item states or item prices change.
- FR31: The system allows shopping flow to continue when item prices are unknown (price is optional).

### Receipt & Shopping Completion

- FR32: The host can view a digital receipt summary for the active session.
- FR33: The system shows contributor attribution (participant name + items collected count) in the receipt view.
- FR34: The system shows item quantity, item name, optional description, and entered price in the receipt view.
- FR35: The system shows a session total in the receipt view.
- FR36: The host can end the session, triggering PDF export and session archival.
- FR37: The receipt PDF includes a QR code linking to a session template for reuse on the next trip.

### Session Templates

- FR38: When a session is deleted (ended), the system archives non-deleted items as a named template with a 30-day expiry.
- FR39: A shopper can scan the receipt QR code to create a new session pre-populated with the previous session's items.
- FR40: The system validates template expiry and shows a clear expired state if the 30-day window has passed.

### SEO & Discovery Surfaces

- FR41: The system provides indexable public pages for product discovery.
- FR42: The system provides crawlable metadata for SEO on public routes.
- FR43: The system prevents private collaborative session data from being indexed by search engines (`noindex` on `/session/*` routes).
- FR44: The system exposes non-sensitive marketing/value-proposition content for search discovery.

### Experience Preferences & Accessibility Baseline

- FR45: A shopper can switch between light and dark visual themes.
- FR46: The system preserves user theme preference in `localStorage`.
- FR47: A shopper can complete core actions with keyboard-only input where supported.
- FR48: The system exposes accessible labels and status messaging for core controls and sync/conflict states.

### Cross-Browser & Platform Coverage

- FR49: The system supports core public and mobile-gated experiences across a broad set of modern browsers.
- FR50: The system provides graceful degradation behavior in unsupported browser/device contexts.
- FR51: The system provides consistent session join behavior (QR/link entry) across supported mobile browsers.

---

## Non-Functional Requirements

### Performance

- NFR1: The system shall complete core user actions (create session, join session, add/edit/delete item, mark collected, price update) within 2 seconds under normal network conditions.
- NFR2: The system shall reflect collaborator updates within 30 seconds based on the polling synchronization model.
- NFR3: The system shall recalculate predicted totals within 1 second after synchronized data updates are applied.
- NFR4: The system shall load the digital receipt view within 3 seconds for typical MVP session sizes.
- NFR5: The system shall generate PDF receipt exports within 5 seconds for typical MVP session sizes.

### Security

- NFR6: The system shall encrypt all client-server traffic in transit using HTTPS/TLS.
- NFR7: The system shall issue unguessable session identifiers (CUID2) and join links resistant to enumeration.
- NFR8: The system shall prevent indexing of private session data by search engines.
- NFR9: The system shall validate all user-submitted input fields including item names (max 200 chars), quantities (1–999), prices (non-negative, max 2 decimal places), session titles (max 26 chars), and participant names (max 26 chars).
- NFR10: The system shall require a valid session token before granting session access.

### Scalability

- NFR11: The system shall support at least 100 concurrent active sessions without functional degradation at MVP scale.
- NFR12: The system shall support at least 10 participants per session for core collaboration flows.
- NFR13: The system shall support 10x MVP traffic growth without requiring a full rewrite of core domain models.
- NFR14: The polling infrastructure shall sustain expected concurrent refresh loads without request backlog under normal usage.

### Accessibility

- NFR15: The system shall allow keyboard operation for core user flows on supported browsers.
- NFR16: The system shall provide accessible labels for core controls and critical state indicators.
- NFR17: The system shall maintain readable contrast in both light and dark themes for core interfaces.
- NFR18: The system shall present sync and conflict states with clear, perceivable status messaging.

### Reliability

- NFR19: The system shall target 99.5% monthly availability for core session operations.
- NFR20: The system shall preserve committed list updates without silent data loss.
- NFR21: The system shall apply deterministic and reproducible conflict resolution for simultaneous edits.
- NFR22: The system shall automatically recover from temporary polling failures on subsequent intervals without requiring session restart.
- NFR23: The system shall auto-clean expired sessions (> 2 days old) and expired templates (> 30 days old) via database functions.

---

## Implementation Status

This section tracks which requirements are implemented vs. pending. It is updated alongside code changes.

### ✅ Implemented

| Area | Status |
|---|---|
| Session creation + join (link + QR) | ✅ |
| Host / participant role model | ✅ |
| Participant nickname + color + avatars | ✅ |
| Live participant join toast | ✅ |
| Session title editing | ✅ |
| Item CRUD (add, edit qty, soft delete, restore) | ✅ |
| Item description field | ✅ |
| Four-state item lifecycle (active, collected, restored, deleted) | ✅ |
| Collect modal (qty + optional price) | ✅ |
| Predicted total (qty × price, collected only) | ✅ |
| Last-write-wins conflict resolution | ✅ |
| 409 conflict detection via client_edit_at | ✅ |
| Item activity log | ✅ |
| 30s polling via SWR | ✅ |
| Digital receipt page | ✅ |
| PDF export (client-side, html2canvas + jsPDF) | ✅ |
| Session end → template archive | ✅ |
| Template QR on receipt | ✅ |
| Template reuse (scan → new session pre-filled) | ✅ |
| Template 30-day expiry + 410 response | ✅ |
| Mobile-only gate (middleware + client) | ✅ |
| Light / dark mode (localStorage-persisted) | ✅ |
| noindex on session routes | ✅ |
| Input validation (server-side) | ✅ |
| Session auto-delete (2-day TTL function) | ✅ |
| Analytics (GA, Vercel Analytics, Speed Insights) | ✅ |

### 🔲 Planned / In Progress

| Area | Notes |
|---|---|
| Locale-aware currency display | Next focus. Currently hard-coded to IDR. Detect locale from network request; format display only. |
| Formal WCAG compliance audit | Baseline a11y in place; formal target not yet set. |
| Browser compatibility matrix (documented) | Implemented in code; not yet formally documented as a matrix. |
