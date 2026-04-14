---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
  - step-04-implementation-sync
inputDocuments:
  - prd.md
lastSyncedWithCode: 2026-04-14
---

# the-shopping-list-bmad — Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the-shopping-list-bmad, decomposing the requirements from the PRD and implemented codebase into epics and stories. This document was last synced with the live codebase on 2026-04-13; sections marked ✅ reflect what is built.

---

## Requirements Inventory

### Functional Requirements

FR1: A shopper can create a new anonymous shopping session from a mobile device, providing a session title and their nickname.
FR2: A shopper can join an existing session using a shared link.
FR3: A shopper can join an existing session by scanning a QR code.
FR4: The system can restrict full app usage to mobile screen contexts (< 768px viewport width).
FR5: The system can show a mobile-only access screen on non-mobile viewports.
FR6: The system assigns the session creator the `host` role and all joiners the `participant` role.
FR7: Each participant is assigned a unique display color and can set a nickname.
FR8: The session title can be updated by the host after creation.
FR9: The system displays live participant join notifications via an animated toast.
FR10: A shopper can add items to a shared shopping list in a session, with an optional description.
FR11: A shopper can edit item quantity directly from the list view.
FR12: A shopper can soft-delete list items; deleted items appear in a collapsed section and can be restored.
FR13: A shopper can mark an item as collected, specifying quantity and optional unit price.
FR14: A shopper can return a collected item to `active` state.
FR15: A shopper can restore a deleted item to `active` state.
FR16: The system represents item lifecycle states as `active`, `collected`, `restored`, and `deleted`.
FR17: The system shows collected items with distinct styling.
FR18: The system shows deleted items in a collapsible section with a restore action.
FR19: The system synchronizes shared list state across session participants via 30-second polling.
FR20: Each item shows the color of the participant who created it.
FR21: The system resolves near-simultaneous edits to the same item deterministically using last-write-wins with server-side `updated_at` timestamps.
FR22: Clients may send `client_edit_at` to detect conflicts; the server returns a `409` with the authoritative item state when a newer write already exists.
FR23: The system preserves a single authoritative item state after conflict resolution.
FR24: The system prevents duplicated item outcomes caused by conflicting state updates.
FR25: The system preserves session data consistency during periodic synchronization.
FR26: The system records item activity (created, updated, deleted, restored, collected) in an activity log.
FR27: A shopper can optionally enter a per-unit item price when marking an item as collected.
FR28: A shopper can update a previously entered item price.
FR29: The system maintains a predicted total calculated as the sum of `quantity × price` for all collected items with a known price.
FR30: The system updates predicted total values when item states or item prices change.
FR31: The system allows shopping flow to continue when item prices are unknown.
FR32: The host can view a digital receipt summary for the active session.
FR33: The system shows contributor attribution (participant name + items collected count) in the receipt view.
FR34: The system shows item quantity, name, optional description, and entered price in the receipt view.
FR35: The system shows a session total in the receipt view.
FR36: The host can end the session, triggering PDF export and session archival.
FR37: The receipt PDF includes a QR code linking to a session template for reuse on the next trip.
FR38: When a session is deleted (ended), the system archives non-deleted items as a named template with a 30-day expiry.
FR39: A shopper can scan the receipt QR code to create a new session pre-populated with the previous session's items.
FR40: The system validates template expiry and shows a clear expired state if the 30-day window has passed.
FR41: The system provides indexable public pages for product discovery.
FR42: The system provides crawlable metadata for SEO on public routes.
FR43: The system prevents private collaborative session data from being indexed (`noindex` on `/session/*` routes).
FR44: The system exposes non-sensitive marketing/value-proposition content for search discovery.
FR45: A shopper can switch between light and dark visual themes.
FR46: The system preserves user theme preference in `localStorage`.
FR47: A shopper can complete core actions with keyboard-only input where supported.
FR48: The system exposes accessible labels and status messaging for core controls and sync/conflict states.
FR49: The system supports core public and mobile-gated experiences across a broad set of modern browsers.
FR50: The system provides graceful degradation behavior in unsupported browser/device contexts.
FR51: The system provides consistent session join behavior (QR/link entry) across supported mobile browsers.

### Non-Functional Requirements

NFR1: Core user actions complete within 2 seconds under normal network conditions.
NFR2: Collaborator updates are visible within 30 seconds (polling SLA).
NFR3: Predicted totals recalculate within 1 second after synced data updates are applied.
NFR4: Digital receipt view loads within 3 seconds for typical MVP session sizes.
NFR5: PDF receipt exports generate within 5 seconds for typical MVP session sizes.
NFR6: All client-server traffic is encrypted via HTTPS/TLS.
NFR7: Session identifiers are CUID2 — unguessable and resistant to enumeration.
NFR8: Private session data is excluded from search engine indexing.
NFR9: All user-submitted fields are validated server-side (names, quantities, prices, titles).
NFR10: A valid session token is required before granting session access.
NFR11: At least 100 concurrent active sessions supported without degradation.
NFR12: At least 10 participants per session for core collaboration flows.
NFR13: Architecture supports 10x traffic growth without rewrite of core domain models.
NFR14: Polling infrastructure sustains concurrent refresh loads without backlog.
NFR15: Keyboard operation supported for core user flows.
NFR16: Accessible labels provided for core controls and state indicators.
NFR17: Readable contrast maintained in both light and dark themes.
NFR18: Sync and conflict states presented with clear, perceivable messaging.
NFR19: 99.5% monthly availability target for core session operations.
NFR20: Committed list updates preserved without silent data loss.
NFR21: Deterministic and reproducible conflict resolution for simultaneous edits.
NFR22: Automatic recovery from temporary polling failures on subsequent intervals.
NFR23: Expired sessions (> 2 days) and templates (> 30 days) auto-cleaned via DB functions.

### FR Coverage Map

FR1–FR9: Epic 1 — Session Access, Identity, and Shopping Kickoff
FR10–FR20: Epic 2 — Collaborative List Execution
FR21–FR26: Epic 2 — Conflict Handling & Activity Logging
FR27–FR31: Epic 3 — Price Prediction and Budget Control
FR32–FR37: Epic 4 — Receipt Completion and Export
FR38–FR40: Epic 6 — Session Templates
FR41–FR44: Epic 5 — SEO & Discoverability
FR45–FR48: Epic 5 — Experience Preferences & Accessibility
FR49–FR51: Epic 5 — Cross-Browser & Platform Coverage

---

## Epic List

### Epic 1: Session Access, Identity, and Shopping Kickoff ✅
Users can create or join an anonymous shopping session quickly, establish their identity, and begin collaborating.
**FRs covered:** FR1, FR2, FR3, FR4, FR5, FR6, FR7, FR8, FR9

### Epic 2: Collaborative List Execution ✅
Users can manage shopping items together in real store conditions, including item state tracking, conflict-safe collaboration, and activity logging.
**FRs covered:** FR10, FR11, FR12, FR13, FR14, FR15, FR16, FR17, FR18, FR19, FR20, FR21, FR22, FR23, FR24, FR25, FR26

### Epic 3: Price Prediction and Budget Control ✅
Users can optionally enter/edit prices on collected items and use predicted totals to stay on budget before checkout.
**FRs covered:** FR27, FR28, FR29, FR30, FR31

### Epic 4: Receipt Completion and Export ✅
Users can complete a shopping session with a transparent digital receipt, exportable summary, and a template QR code for future reuse.
**FRs covered:** FR32, FR33, FR34, FR35, FR36, FR37

### Epic 5: Product Experience, Discoverability, and Compatibility ✅
Users get a polished experience (theme + accessibility baseline), while the product supports SEO discovery and broad browser/device behavior.
**FRs covered:** FR41, FR42, FR43, FR44, FR45, FR46, FR47, FR48, FR49, FR50, FR51

### Epic 6: Session Templates ✅
Completed sessions are archived as reusable templates, enabling returning shoppers to reload their previous list via a QR code scan.
**FRs covered:** FR38, FR39, FR40

---

## Epic 1: Session Access, Identity, and Shopping Kickoff

Users can create or join an anonymous shopping session quickly, establish their identity, and begin collaborating on a shared list.

### Story 1.1: Create Anonymous Session ✅

As a shopper,
I want to create a new anonymous shopping session on mobile with a title and my nickname,
So that I can start a collaborative shopping activity quickly and be identified by others.

**Acceptance Criteria:**

**Given** I am on a supported mobile viewport
**When** I enter a session title and my nickname and submit
**Then** a unique session is created and I enter the session workspace as the host
**And** the session identifier is a non-guessable CUID2 token
**And** my participant record (id, name, color) is stored in localStorage keyed by session token

### Story 1.2: Join Session via Link ✅

As a shopper,
I want to join an existing session using a share link,
So that I can collaborate without creating an account.

**Acceptance Criteria:**

**Given** I have a valid session link
**When** I open the link on a supported mobile viewport and enter my nickname
**Then** I am joined to the target session as a participant
**And** I am assigned a unique color
**And** my participant data is stored in localStorage
**And** invalid or expired tokens show a clear error state

### Story 1.3: Join Session via QR ✅

As a shopper,
I want to join a session by scanning a QR code,
So that I can enter the shared list quickly in-store without typing a URL.

**Acceptance Criteria:**

**Given** a valid session QR code exists
**When** I scan it with a supported camera/browser flow
**Then** I am routed to the join page for the corresponding session
**And** after entering my nickname, I am joined as a participant

### Story 1.4: Enforce Mobile-Only Access Gate ✅

As a shopper,
I want clear access behavior on non-mobile screens,
So that the app experience stays consistent with mobile-first constraints.

**Acceptance Criteria:**

**Given** I access from a tablet or desktop viewport (≥ 768px width)
**When** any app route is loaded
**Then** I see a "mobile only app" screen instead of interactive app UI
**And** the gate is enforced both at Next.js middleware level (UA detection) and at client level (viewport width check)
**And** mobile viewports proceed to full session flows

### Story 1.5: Host/Participant Role Model ✅

As a session creator (host),
I want to have distinct capabilities from other participants,
So that session management is controlled and predictable.

**Acceptance Criteria:**

**Given** I created the session
**When** I am in the session workspace
**Then** I have access to the receipt/end-session action (cart FAB button)
**And** other participants do not see the end-session control
**And** my role is stored server-side as `host`

### Story 1.6: Participant Identity — Nickname and Color ✅

As a shopper,
I want to be identified by a nickname and color in the shared session,
So that my contributions (items, collections) are visually attributable.

**Acceptance Criteria:**

**Given** I have joined a session
**When** the session list is visible
**Then** my items show a color strip matching my assigned participant color
**And** my avatar (initial + color) appears in the session header
**And** up to 3 avatars are shown; additional participants show an overflow count (+N)

### Story 1.7: Live Participant Join Toast ✅

As a shopper already in the session,
I want to see when collaborators join,
So that I know who is shopping with me in real time.

**Acceptance Criteria:**

**Given** I am active in a session
**When** another participant joins
**Then** an animated toast displays their name with a typewriter effect
**And** the toast cycles through all other participants (excluding me)
**And** the toast includes a LIVE indicator

### Story 1.8: Update Session Title and Nickname ✅

As a host,
I want to be able to update the session title and my nickname after creation,
So that I can correct mistakes or adapt the session context.

**Acceptance Criteria:**

**Given** I opened the session via a template QR (or need to edit)
**When** the update modal appears (or I trigger it)
**Then** I can change the session title (max 26 chars)
**And** I can change my nickname (max 26 chars)
**And** changes are persisted server-side and reflected in the session view

---

## Epic 2: Collaborative List Execution

Users can manage shopping items together in real store conditions, including item state tracking, conflict-safe collaboration, and activity logging.

### Story 2.1: Add Items to Shared List ✅

As a shopper,
I want to add shopping items with a name, optional description, and quantity,
So that the list reflects what the group needs to buy.

**Acceptance Criteria:**

**Given** I am in a session
**When** I tap the add (FAB) button and fill in the item name
**Then** the item is added to the list in `active` state
**And** collaborators receive the updated state on the next sync
**And** item name is required (max 200 chars); description is optional (max 500 chars); quantity defaults to 1

### Story 2.2: Edit Item Quantity Inline ✅

As a shopper,
I want to increase or decrease an item's quantity directly from the list,
So that I don't need to open a full edit modal for simple quantity changes.

**Acceptance Criteria:**

**Given** an item is in `active` state
**When** I tap the − or + buttons next to the item quantity
**Then** the quantity updates (debounced 500ms) and syncs to the server
**And** tapping − on a quantity-1 item shows a trash icon and deletes the item

### Story 2.3: Soft Delete and Restore Items ✅

As a shopper,
I want to remove items I no longer need, with the ability to undo,
So that the list stays clean without permanently losing data.

**Acceptance Criteria:**

**Given** an item is in `active` state
**When** I delete it (via quantity-to-zero or explicit delete)
**Then** the item moves to `deleted` state and disappears from the main list
**And** a collapsed "Deleted" section shows deleted items with a restore action
**When** I restore a deleted item
**Then** it returns to `active` state and appears in the main list

### Story 2.4: Mark Item as Collected ✅

As a shopper,
I want to mark an item as collected when I pick it up in store,
So that the group knows it's been handled and gets an optional price for the total.

**Acceptance Criteria:**

**Given** an item is in `active` state
**When** I tap the collect checkbox
**Then** a modal opens showing item name, description, quantity editor, and optional price input
**When** I confirm
**Then** the item moves to `collected` state with the entered qty and price (or no price if skipped)
**And** the item displays with distinct collected styling

### Story 2.5: Revert Collected Item to Active ✅

As a shopper,
I want to un-collect an item if I put it back or made a mistake,
So that the list remains accurate during shopping.

**Acceptance Criteria:**

**Given** an item is in `collected` state
**When** I revert it (via the applicable action)
**Then** the item returns to `active` state
**And** any price previously entered is cleared

### Story 2.6: Item Contributor Color Indicator ✅

As a shopper,
I want to see which participant created each item,
So that I can understand who added what to the list.

**Acceptance Criteria:**

**Given** a session has multiple participants
**When** the item list is rendered
**Then** each item shows a colored left-border strip matching the creator's participant color
**And** items created by participants who have left show a default color

### Story 2.7: Polling-Based State Sync ✅

As a shopper,
I want shared list updates to propagate on the expected polling cadence,
So that all participants stay aligned while split in-store.

**Acceptance Criteria:**

**Given** multiple users are active in one session
**When** one user changes item data
**Then** other users receive the updated state within 30 seconds (polling SLA)
**And** a sync indicator in the header shows "Syncing" during in-flight requests
**And** stale states recover on the next successful poll without requiring a session restart

### Story 2.8: Deterministic Conflict Resolution ✅

As a shopper,
I want simultaneous edits resolved predictably using last-write-wins,
So that the shared list never ends in an ambiguous state.

**Acceptance Criteria:**

**Given** two users edit the same item near-simultaneously
**When** both updates reach the server
**Then** the server uses its own `updated_at` timestamp as the authority
**And** a client sending a stale `client_edit_at` receives a `409` response with the current authoritative item
**And** one deterministic final state is produced

### Story 2.9: Item Activity Log ✅

As a shopper or support user,
I want item changes to be logged with participant attribution,
So that the history of edits can be reviewed for troubleshooting or dispute resolution.

**Acceptance Criteria:**

**Given** any item action occurs (created, updated, deleted, restored, collected)
**When** the action is committed to the database
**Then** an entry is added to `item_activities` with the item id, participant id, action, and timestamp
**And** the activity log is accessible via `GET /api/sessions/[token]/activities`

---

## Epic 3: Price Prediction and Budget Control

Users can optionally enter/edit prices on collected items and use predicted totals to stay on budget before checkout.

### Story 3.1: Optional Price Entry on Collect ✅

As a shopper,
I want price input to be optional when collecting an item,
So that I can keep shopping flow fast when price tags are unavailable.

**Acceptance Criteria:**

**Given** I mark an item as collected
**When** I provide a price or skip price
**Then** the item remains valid in collected workflow either way
**And** the price input (labelled "per unit") shows the currency prefix
**And** skipping price does not block the collect action

### Story 3.2: Edit Collected Item Price ✅

As a shopper,
I want to correct previously entered prices,
So that the prediction accuracy improves before checkout.

**Acceptance Criteria:**

**Given** a collected item has a saved price
**When** I re-open the collect modal or edit the price
**Then** the updated value is stored server-side
**And** the predicted total refreshes using the corrected value on the next sync

### Story 3.3: Predicted Total Calculation ✅

As a shopper,
I want a running predicted total from collected-item prices,
So that the group can manage spend before checkout.

**Acceptance Criteria:**

**Given** collected items include price values
**When** item prices or collected states change
**Then** the predicted total recalculates as `SUM(quantity × price)` for all collected items with a price
**And** the total is displayed in the session stats bar
**And** items without a price contribute zero to the total (not an error)

### Story 3.4: Locale-Aware Currency Display ✅

As a shopper,
I want prices displayed in my local currency format,
So that the numbers are immediately readable in my context.

**Acceptance Criteria:**

**Given** I am using the app in any region
**When** a price value is displayed
**Then** the currency symbol and number format match my detected region (from Vercel `x-vercel-ip-country` IP geolocation, falling back to `Accept-Language` header, then USD)
**And** the stored price in the database remains a plain numeric value (formatting is display-only)
**And** the system falls back to USD if neither IP country nor locale can be resolved

**Implementation notes:**
- `src/lib/currency.ts` — `COUNTRY_CURRENCY_MAP` (ISO 3166-1 → ISO 4217, 30+ countries), `LOCALE_CURRENCY_MAP` (BCP 47 fallback), `formatAmount()`, `getCurrencySymbol()`
- `src/middleware.ts` — reads `x-vercel-ip-country` (IP-based, primary signal) then `Accept-Language`; sets `x-locale` + `x-currency` response headers
- `src/components/CurrencyProvider.tsx` — React context + `useCurrency()` hook; server-resolved values passed as props from layout
- `src/app/app/layout.tsx` — server component reads middleware headers, wraps children with `<CurrencyProvider>`
- Call sites updated: `CollectModal`, `ItemCard`, session stats bar, receipt page
- `parseInt` → `parseFloat` fix applied at total display sites (was silently truncating decimal cents)

---

## Epic 4: Receipt Completion and Export

Users can complete a shopping session with a transparent digital receipt, a downloadable PDF, and a template QR code for the next trip.

### Story 4.1: Session Digital Receipt View ✅

As a host,
I want a digital receipt summary for the active session,
So that the group can review what was picked up and what was paid.

**Acceptance Criteria:**

**Given** a session has collected items
**When** I navigate to the receipt page (via cart FAB)
**Then** I see a receipt card with: session title, session date, participant contribution breakdown, itemized list (qty / name / description / price), and session total
**And** items without a price show "—"
**And** the session total reflects `SUM(quantity × price)` for collected items

### Story 4.2: Contributor Attribution in Receipt ✅

As a shopper,
I want to see who collected how many items in the receipt,
So that contributions are transparent.

**Acceptance Criteria:**

**Given** multiple participants collected items
**When** the receipt is rendered
**Then** a "Shopper Contributions" section lists each participant and their item count
**And** participants are ordered alphabetically by name

### Story 4.3: Export Receipt to PDF ✅

As a host,
I want to export the receipt as a PDF,
So that I can retain or share a record of the shopping session.

**Acceptance Criteria:**

**Given** receipt summary is available
**When** I tap "Download Receipt & End Session"
**Then** the session is ended (archived as template)
**And** a PDF is auto-downloaded, including the full receipt card and the template QR code
**And** the PDF is generated client-side using html2canvas + jsPDF with no server cost
**And** I am redirected to the home screen after download

### Story 4.4: Template QR Code on Receipt ✅

As a returning shopper,
I want a QR code on the receipt that links to this session's item list,
So that I can reload the same shopping list on the next trip without re-entry.

**Acceptance Criteria:**

**Given** the host ends the session
**When** the PDF is generated
**Then** a QR code is embedded in the receipt card pointing to `/template/[templateId]`
**And** scanning the QR code on the next trip initiates a new session pre-populated with the items

---

## Epic 5: Product Experience, Discoverability, and Compatibility

Users get a polished experience (theme + accessibility baseline), while the product supports SEO discovery and broad browser/device behavior.

### Story 5.1: Theme Preferences ✅

As a shopper,
I want to switch between light and dark themes,
So that the app remains comfortable in different lighting environments.

**Acceptance Criteria:**

**Given** theme controls are available (toggle in session header)
**When** I change theme
**Then** the UI applies the selected theme using CSS custom properties (`dark` class on `<html>`)
**And** the preference is persisted in `localStorage` (`the_shopping_list_app_theme`)
**And** the initial theme respects `prefers-color-scheme` if no stored preference exists

### Story 5.2: Accessibility Baseline ✅

As a shopper,
I want core flows to be accessible with keyboard and assistive labels,
So that key actions are operable for a broader range of users.

**Acceptance Criteria:**

**Given** core flows are rendered
**When** using keyboard-only interaction
**Then** primary actions (add item, collect, delete, restore) are reachable and activatable
**And** modals use `role="dialog"`, `aria-modal`, and `aria-label`
**And** status messages use `aria-live` for screen reader announcements
**And** form inputs have associated `<label>` elements or `aria-label` attributes

### Story 5.3: SEO Public Surface ✅

As a product owner,
I want public routes to be discoverable by search engines while private sessions remain protected,
So that acquisition content is indexable without leaking collaborative data.

**Acceptance Criteria:**

**Given** public marketing/landing pages
**When** crawlers access these routes
**Then** metadata (title, description, OpenGraph) is present and indexable
**And** all `/session/*` routes include `robots: { index: false, follow: false }` via layout metadata
**And** Google Analytics is active for discoverability measurement

### Story 5.4: Cross-Browser Compatibility and Graceful Degradation ✅

As a shopper,
I want reliable behavior across supported browsers,
So that join and core flows work consistently in real-world device diversity.

**Acceptance Criteria:**

**Given** supported modern browser contexts (iOS Safari-class, Android Chromium-class)
**When** users execute join and core interactions
**Then** behavior is functionally consistent
**And** unsupported or desktop contexts show a graceful "mobile only app" fallback screen

---

## Epic 6: Session Templates

Completed sessions are archived as reusable templates, enabling returning shoppers to reload their previous list via a QR code scan.

### Story 6.1: Auto-Archive Session as Template on End ✅

As a system,
I want to archive a session's items as a template when the session is ended,
So that the data is available for reuse without keeping the session alive.

**Acceptance Criteria:**

**Given** a host triggers "Download Receipt & End Session"
**When** DELETE `/api/sessions/[token]` is called
**Then** a new template record is created with: a unique CUID2 template id, the session title as template name, and an expiry of 30 days from now
**And** all non-deleted items (name + quantity) are copied to `template_items`
**And** the session and its items are deleted
**And** the `templateId` is returned to the client

### Story 6.2: Validate and Serve Template ✅

As a returning shopper,
I want the app to validate a template QR code before creating a new session,
So that I get a clear message if the template has expired.

**Acceptance Criteria:**

**Given** I scan a receipt QR code
**When** the app fetches `GET /api/templates/[templateId]`
**Then** if the template is valid (not expired), its name and items are returned
**And** if the template is expired, a `410 Gone` response is returned
**And** the template page shows a clear "QR Code Expired" state with a "Start a new list" option

### Story 6.3: Create New Session from Template ✅

As a returning shopper,
I want a new session to be pre-filled with items from my previous trip,
So that I can start shopping immediately without re-entering my list.

**Acceptance Criteria:**

**Given** a valid template is fetched
**When** the template page bootstraps
**Then** a new session is created with the template name as the title
**And** all template items are added to the new session via parallel POST requests
**And** I am prompted to set my session title and nickname via the update modal
**And** I am redirected to the new session workspace
