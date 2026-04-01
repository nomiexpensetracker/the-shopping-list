
# the-shopping-list

Anonymous, mobile-only group shopping web app. Create or join sessions without accounts, collaborate on a shared list in-store, track budget, and export a digital receipt.

## Quick Start

> **Note:** Tech stack and build tooling to be confirmed.

1. Clone the repository
2. Install dependencies
3. Run the development server
4. Open on a mobile device

## Features

- **Anonymous sessions** – No login required. Share session tokens to collaborate.
- **Mobile-first** – Optimized for iOS Safari and Android Chromium browsers.
- **Real-time sync** – Polling-based state synchronization (~30 s interval).
- **Item tracking** – Three states: `added`, `collected` (with optional price), `deleted`.
- **Budget prediction** – Running total from collected items only.
- **Digital receipt** – Export your shopping session.

## Architecture

- **Type:** Single Page Application (SPA) with client-side routing.
- **Sync model:** Polling-based (~30 s). No WebSocket/SSE in MVP.
- **State conflicts:** Deterministic last-write-wins using edit timestamps.
- **Mobile gate:** Non-mobile viewports blocked at router level.

## Documentation

- [Product Requirements](docs/prd.md)
- [Epics & Stories](docs/epics.md)

## Development Guidelines

- Mobile-first design and testing
- Semantic HTML with accessible contrast and keyboard navigation
- No authentication or user accounts
- Polling for state freshness ≤ 30 s
