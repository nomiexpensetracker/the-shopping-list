# Plan: Architecture Decision Record — the-shopping-list

## Objective

Create `docs/architecture.md` — a single comprehensive Architecture Decision Record (ADR) document covering all key technical decisions for this greenfield project, grounded in the PRD and epics.

---

## Recommended Stack

| Layer | Choice | Rationale |
|---|---|---|
| Framework | **Next.js 14+ (App Router)** | SSG for public/SEO routes; CSR for anonymous session routes; API routes = serverless functions on Vercel out-of-the-box |
| Deployment | **Vercel** | First-class Next.js host; serverless functions; edge-ready; free tier fits MVP scale |
| Database | **Neon (serverless PostgreSQL)** | ACID transactions required for deterministic conflict resolution; serverless-compatible; scales with Vercel |
| Styling | **Tailwind CSS** | Mobile-first utility classes; dark mode (`dark:`) built-in; matches mobile-only constraint |
| Data fetching / polling | **SWR** | Polling interval, cache invalidation, revalidation on focus — maps exactly to 30 s sync model |
| Session tokens | **CUID2** | Unguessable, URL-safe, non-sequential (resistant to enumeration per NFR7) |
| QR code | **qrcode.js** | Client-side generation, no server cost |
| PDF export | **@react-pdf/renderer** | Client-side, React-native API, no Puppeteer/server cost |

---

## ADRs to Cover (11 decisions)

1. **Framework** — Next.js App Router over Vite+React, Nuxt, or SvelteKit
2. **Deployment** — Vercel serverless vs. Docker/container or other platforms
3. **Database** — Neon (serverless PostgreSQL) vs. Supabase, PlanetScale, or Redis
4. **Sync model** — Client polling at 30 s (SWR) vs. WebSocket/SSE
5. **Session identity** — Anonymous CUID2 tokens, no auth, token-gated access
6. **Item state machine** — Three-state lifecycle (`added` / `collected` / `deleted`), enforced server-side
7. **Conflict resolution** — Last-write-wins using server-side `edit_at` timestamps (no optimistic merge)
8. **Mobile-only gate** — Next.js middleware + CSS `@media` + JS `useMediaQuery`, checked at router level
9. **SEO / rendering split** — SSG public pages with metadata; `<meta name="robots" content="noindex">` on `/session/*` routes
10. **QR code generation** — Client-side library, generated from session join URL
11. **PDF export** — Client-side `@react-pdf/renderer`, invoked from receipt page

---

## Implementation Steps

1. Create `docs/architecture.md` with document header, overview, guiding principles, and data model
2. Write ADR-001 through ADR-011 in sequence — each section: Context → Decision → Alternatives Considered → Consequences → Linked FRs/NFRs
3. Update `.github/copilot-instructions.md` to point at `docs/architecture.md` (currently says "Architecture doc: Not yet written")
4. Optionally update `docs/epics.md` frontmatter to reference the architecture doc

---

## Relevant Files

- `docs/prd.md` — source of FRs, NFRs, journeys, scoping
- `docs/epics.md` — story breakdown; currently has placeholder "Architecture document not available yet"
- `.github/copilot-instructions.md` — needs update to reference the new doc
- `docs/architecture.md` — **new file to create**

---

## Verification Checklist

- [ ] Every ADR traces back to at least one FR or NFR from the PRD
- [ ] All 22 NFRs are addressed across the decisions
- [ ] `copilot-instructions.md` correctly points to the new architecture doc
- [ ] No decisions contradict constraints in `copilot-instructions.md` (polling, no auth, mobile-only)

---

## Key Decision Rationale

- **Neon over Supabase**: Neon is leaner (raw PostgreSQL + connection pooling); Supabase adds realtime/auth overhead that this project explicitly does not need
- **SWR over TanStack Query**: lighter bundle, simpler polling API — sufficient for this use case
- **Client-side PDF**: avoids Puppeteer/server cost, works within Vercel's serverless limits
- **No WebSockets**: explicitly excluded by architecture constraint (polling model is the deliberate choice)
- **No auth**: no login, registration, or session-cookie auth — sessions are token-gated by unguessable CUID2 identifiers only

---

## Scope Explicitly Excluded

- WebSockets / server-sent events
- Authentication or user accounts
- Real-time subscriptions
- Per-user personalization or preferences beyond theme
- Any backend beyond Next.js API routes on Vercel
