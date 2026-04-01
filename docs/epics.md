---
stepsCompleted:
  - step-01-validate-prerequisites
  - step-02-design-epics
  - step-03-create-stories
inputDocuments:
  - prd.md
---

# the-shopping-list-bmad - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for the-shopping-list-bmad, decomposing the requirements from the PRD, UX Design if it exists, and Architecture requirements into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: A shopper can create a new anonymous shopping session from a mobile device.
FR2: A shopper can join an existing session using a shared link.
FR3: A shopper can join an existing session by scanning a QR code.
FR4: The system can restrict full app usage to mobile screen contexts.
FR5: The system can show a mobile-only access screen on non-mobile viewports.
FR6: A shopper can add items to a shared shopping list in a session.
FR7: A shopper can edit list items in a shared shopping session.
FR8: A shopper can remove list items from a shared shopping session.
FR9: A shopper can mark an item as collected.
FR10: A shopper can return an item from collected to added.
FR11: The system can represent item lifecycle states as added, collected, and deleted.
FR12: The system can show collected items with a distinct completed state indicator.
FR13: The system can synchronize shared list state across session participants.
FR14: A shopper can optionally enter an item price when marking an item as collected.
FR15: A shopper can update a previously entered item price.
FR16: The system can maintain a predicted total based on collected-item prices.
FR17: The system can update predicted total values when item states or item prices change.
FR18: The system can allow shopping flow to continue when item prices are unknown.
FR19: The system can resolve near-simultaneous edits to the same item deterministically.
FR20: The system can preserve a single authoritative item state after conflict resolution.
FR21: The system can prevent duplicated item outcomes caused by conflicting state updates.
FR22: The system can preserve session data consistency during periodic synchronization.
FR23: The system can record enough change context to explain state corrections when disputes occur.
FR24: A shopper can view a digital receipt summary for a completed shopping session.
FR25: The system can show contributor attribution for collected items in the receipt view.
FR26: The system can show item quantity, item name, and entered item price in the receipt view.
FR27: The system can show a session total in the receipt view.
FR28: A shopper can export session receipt data as a PDF.
FR29: The system can provide indexable public pages for product discovery.
FR30: The system can provide crawlable metadata for SEO on public routes.
FR31: The system can prevent private collaborative session data from being indexed by search engines.
FR32: The system can expose non-sensitive marketing/value-proposition content for search discovery.
FR33: A shopper can switch between light and dark visual themes.
FR34: The system can preserve user theme preference within the app experience.
FR35: A shopper can complete core actions with keyboard-only input where supported.
FR36: The system can expose accessible labels and status messaging for core controls and sync/conflict states.
FR37: The system can support core public and mobile-gated experiences across a broad set of modern browsers.
FR38: The system can provide graceful degradation behavior in unsupported browser/device contexts.
FR39: The system can provide consistent session join behavior (QR/link entry) across supported mobile browsers.

### NonFunctional Requirements

NFR1: The system shall complete core user actions (create session, join session, add/edit/delete item, mark collected, price update) within 2 seconds under normal network conditions.
NFR2: The system shall reflect collaborator updates within 30 seconds based on the polling synchronization model.
NFR3: The system shall recalculate predicted totals within 1 second after synchronized data updates are applied.
NFR4: The system shall load the digital receipt view within 3 seconds for typical MVP session sizes.
NFR5: The system shall generate PDF receipt exports within 5 seconds for typical MVP session sizes.
NFR6: The system shall encrypt all client-server traffic in transit using HTTPS/TLS.
NFR7: The system shall issue unguessable session identifiers and join links resistant to enumeration.
NFR8: The system shall prevent indexing of private session data by search engines.
NFR9: The system shall validate all user-submitted input fields including item names, quantities, and prices.
NFR10: The system shall require a valid session join artifact (QR/link token) before granting session access.
NFR11: The system shall support at least 100 concurrent active sessions without functional degradation at MVP scale.
NFR12: The system shall support at least 10 participants per session for core collaboration flows.
NFR13: The system shall support 10x MVP traffic growth without requiring a full rewrite of core domain models.
NFR14: The polling infrastructure shall sustain expected concurrent refresh loads without request backlog under normal usage.
NFR15: The system shall allow keyboard operation for core user flows on supported browsers.
NFR16: The system shall provide accessible labels for core controls and critical state indicators.
NFR17: The system shall maintain readable contrast in both light and dark themes for core interfaces.
NFR18: The system shall present sync and conflict states with clear, perceivable status messaging.
NFR19: The system shall target 99.5% monthly availability for core session operations.
NFR20: The system shall preserve committed list updates without silent data loss.
NFR21: The system shall apply deterministic and reproducible conflict resolution for simultaneous edits.
NFR22: The system shall automatically recover from temporary polling failures on subsequent intervals without requiring session restart.

### Additional Requirements

- Architecture document not available yet; no architecture-specific requirements extracted in this pass.

### UX Design Requirements

- UX design document not available yet; no UX-specific requirements extracted in this pass.

### FR Coverage Map

FR1: Epic 1 - Session creation for anonymous shopping groups
FR2: Epic 1 - Shared-link join flow
FR3: Epic 1 - QR code join flow
FR4: Epic 1 - Mobile-only usage gating
FR5: Epic 1 - Mobile-only fallback screen on non-mobile devices
FR6: Epic 2 - Add items collaboratively
FR7: Epic 2 - Edit items collaboratively
FR8: Epic 2 - Remove/delete items collaboratively
FR9: Epic 2 - Mark items collected
FR10: Epic 2 - Revert collected items to added
FR11: Epic 2 - Enforce item lifecycle states
FR12: Epic 2 - Display collected state clearly
FR13: Epic 2 - Synchronize shared list state
FR14: Epic 3 - Optional price capture on collect action
FR15: Epic 3 - Price correction/edit workflow
FR16: Epic 3 - Predicted total computation
FR17: Epic 3 - Predicted total updates on data/state changes
FR18: Epic 3 - Continue workflow without known prices
FR19: Epic 2 - Deterministic conflict resolution for simultaneous edits
FR20: Epic 2 - Authoritative final state preservation
FR21: Epic 2 - Prevent duplicated outcomes from conflicting updates
FR22: Epic 2 - Shared-session data consistency over polling sync
FR23: Epic 2 - Change context capture for dispute/trace explanation
FR24: Epic 4 - Digital receipt summary view
FR25: Epic 4 - Contributor attribution in receipt
FR26: Epic 4 - Receipt item detail fields (qty/name/price)
FR27: Epic 4 - Session total display in receipt
FR28: Epic 4 - PDF export of receipt/session summary
FR29: Epic 5 - Indexable discovery pages
FR30: Epic 5 - Crawlable metadata on public routes
FR31: Epic 5 - Prevent indexing of private collaborative session data
FR32: Epic 5 - Public non-sensitive value/marketing content exposure
FR33: Epic 5 - Light/dark theme switching
FR34: Epic 5 - Persist theme preference
FR35: Epic 5 - Keyboard-operable core actions
FR36: Epic 5 - Accessible labels and status messaging
FR37: Epic 5 - Broad modern browser support for key experiences
FR38: Epic 5 - Graceful degradation for unsupported contexts
FR39: Epic 5 - Consistent QR/link join behavior across supported mobile browsers

## Epic List

### Epic 1: Session Access and Shopping Kickoff
Users can create or join an anonymous shopping session quickly and begin collaborating on a shared list.
**FRs covered:** FR1, FR2, FR3, FR4, FR5

### Epic 2: Collaborative List Execution
Users can manage shopping items together in real store conditions, including item state tracking and conflict-safe collaboration.
**FRs covered:** FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13, FR19, FR20, FR21, FR22, FR23

### Epic 3: Price Prediction and Budget Control
Users can optionally enter/edit prices on collected items and use predicted totals to stay on budget before checkout.
**FRs covered:** FR14, FR15, FR16, FR17, FR18

### Epic 4: Receipt Completion and Export
Users can complete a shopping session with a transparent digital receipt and exportable summary.
**FRs covered:** FR24, FR25, FR26, FR27, FR28

### Epic 5: Product Experience, Discoverability, and Compatibility
Users get a polished experience (theme + accessibility baseline), while the product supports SEO discovery and broad browser/device behavior.
**FRs covered:** FR29, FR30, FR31, FR32, FR33, FR34, FR35, FR36, FR37, FR38, FR39

## Epic 1: Session Access and Shopping Kickoff

Users can create or join an anonymous shopping session quickly and begin collaborating on a shared list.

### Story 1.1: Create Anonymous Session

As a shopper,
I want to create a new anonymous shopping session on mobile,
So that I can start a collaborative shopping activity quickly.

**Acceptance Criteria:**

**Given** I am on a supported mobile viewport
**When** I start a new session
**Then** a unique session is created and I enter the session workspace
**And** the session identifier is non-guessable and stored for current use

### Story 1.2: Join Session via Link

As a shopper,
I want to join an existing session using a share link,
So that I can collaborate without creating an account.

**Acceptance Criteria:**

**Given** I have a valid session link
**When** I open the link on a supported mobile viewport
**Then** I am joined to the target session
**And** invalid or expired links show a clear error state

### Story 1.3: Join Session via QR

As a shopper,
I want to join a session by scanning a QR code,
So that I can enter the shared list quickly in-store.

**Acceptance Criteria:**

**Given** a valid session QR exists
**When** I scan it with a supported flow
**Then** I am routed into the corresponding session
**And** QR decode failures return actionable guidance

### Story 1.4: Enforce Mobile-Only Access Gate

As a shopper,
I want clear access behavior on non-mobile screens,
So that the app experience stays consistent with mobile-first constraints.

**Acceptance Criteria:**

**Given** I access from tablet/desktop viewport
**When** app routes are loaded
**Then** I see a "mobile only app" screen instead of interactive app UI
**And** mobile viewports can continue to full session flows

## Epic 2: Collaborative List Execution

Users can manage shopping items together in real store conditions, including item state tracking and conflict-safe collaboration.

### Story 2.1: Add/Edit/Delete Shared Items

As a shopper,
I want to add, edit, and delete shopping items in a shared session,
So that the list reflects what the group needs.

**Acceptance Criteria:**

**Given** I am in a session
**When** I add, update, or delete an item
**Then** the list reflects my change
**And** collaborators receive the updated state on sync

### Story 2.2: Item State Lifecycle

As a shopper,
I want to mark items collected and revert when needed,
So that shopping progress is visible and correctable.

**Acceptance Criteria:**

**Given** an item is in `added` state
**When** I mark it collected
**Then** it changes to `collected` and displays collected styling
**And** I can move it back to `added` if correction is needed

### Story 2.3: Polling-Based State Sync

As a shopper,
I want shared list updates to propagate on the expected polling cadence,
So that all participants stay aligned while split in-store.

**Acceptance Criteria:**

**Given** multiple users are active in one session
**When** one user changes item data
**Then** other users receive updated state within polling SLA
**And** stale states recover on the next successful poll

### Story 2.4: Deterministic Conflict Resolution

As a shopper,
I want simultaneous edits resolved predictably,
So that the shared list never ends in ambiguous state.

**Acceptance Criteria:**

**Given** two users edit the same item near-simultaneously
**When** both updates reach the system
**Then** one deterministic authoritative state is produced
**And** state history/context is preserved for troubleshooting

### Story 2.5: Duplicate Outcome Protection

As a shopper,
I want collaboration safeguards against duplicate pickup outcomes,
So that split shopping remains tactical and efficient.

**Acceptance Criteria:**

**Given** concurrent interaction on the same item
**When** collection state changes occur
**Then** session state prevents contradictory duplicate outcomes
**And** users see clear latest state messaging

## Epic 3: Price Prediction and Budget Control

Users can optionally enter/edit prices on collected items and use predicted totals to stay on budget before checkout.

### Story 3.1: Optional Price Entry on Collect

As a shopper,
I want price input to be optional when collecting an item,
So that I can keep shopping flow fast when price tags are unavailable.

**Acceptance Criteria:**

**Given** I mark an item as collected
**When** I provide price or skip price
**Then** the item remains valid in collected workflow
**And** skip behavior does not block completion

### Story 3.2: Edit Collected Item Price

As a shopper,
I want to correct previously entered prices,
So that prediction accuracy improves before checkout.

**Acceptance Criteria:**

**Given** a collected item has a saved price
**When** I edit that price
**Then** the updated value is stored
**And** predicted totals refresh using the corrected value

### Story 3.3: Predicted Total Calculation

As a shopper,
I want a running predicted total from collected-item prices,
So that the group can manage spend before checkout.

**Acceptance Criteria:**

**Given** collected items include price values
**When** item prices or collected states change
**Then** predicted total recalculates correctly
**And** total presentation remains available in session context

## Epic 4: Receipt Completion and Export

Users can complete a shopping session with a transparent digital receipt and exportable summary.

### Story 4.1: Session Digital Receipt View

As a shopper,
I want a digital receipt summary at completion,
So that the group can review what was picked and paid.

**Acceptance Criteria:**

**Given** a session has collected items
**When** I open receipt summary
**Then** I can view contributor attribution and itemized lines
**And** session total is displayed clearly

### Story 4.2: Receipt Data Fidelity

As a shopper,
I want receipt line items to include quantity, name, and price,
So that I can compare app output with cashier receipt.

**Acceptance Criteria:**

**Given** collected items are stored in session
**When** receipt is rendered
**Then** each line includes item quantity, name, and entered price
**And** missing optional prices are represented clearly

### Story 4.3: Export Receipt to PDF

As a shopper,
I want to export receipt summary as PDF,
So that I can retain or share shopping records.

**Acceptance Criteria:**

**Given** receipt summary is available
**When** I trigger export
**Then** a PDF is generated with receipt content
**And** export result can be saved or shared via standard device flow

## Epic 5: Product Experience, Discoverability, and Compatibility

Users get a polished experience (theme + accessibility baseline), while the product supports SEO discovery and broad browser/device behavior.

### Story 5.1: Theme Preferences

As a shopper,
I want to switch between light and dark themes,
So that the app remains comfortable in different environments.

**Acceptance Criteria:**

**Given** theme controls are available
**When** I change theme
**Then** the UI applies selected theme
**And** the preference persists for subsequent app use

### Story 5.2: Accessibility Baseline

As a shopper,
I want core flows to be accessible with keyboard and assistive labels,
So that key actions are operable for broader users.

**Acceptance Criteria:**

**Given** core flows are rendered
**When** using keyboard-only interaction
**Then** primary actions are reachable and actionable
**And** controls/status messages expose accessible labeling semantics

### Story 5.3: SEO Public Surface

As a product owner,
I want public routes to be discoverable by search engines while private sessions remain protected,
So that acquisition content is indexable without leaking collaborative data.

**Acceptance Criteria:**

**Given** public marketing/value pages
**When** crawlers access these routes
**Then** metadata and indexability are present as intended
**And** private collaborative session routes are excluded from indexing

### Story 5.4: Cross-Browser Compatibility and Graceful Degradation

As a shopper,
I want reliable behavior across supported browsers,
So that join and core flows work consistently in real-world device diversity.

**Acceptance Criteria:**

**Given** supported modern browser contexts
**When** users execute join and core interactions
**Then** behavior is functionally consistent
**And** unsupported contexts show graceful fallback states
