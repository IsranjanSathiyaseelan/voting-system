# Project Context

## Project Overview

Project Name: Voting System (VoteSecure)

This project is a modern web application for managing elections and allowing authenticated users to vote securely.

The frontend is a standalone React SPA. It is architected to eventually communicate with a REST API backend (Spring Boot), but **as of this update, all data (auth, candidates, votes) is mocked/stored in `localStorage`** — there is no live backend integration yet. See "Current Implementation Status" below before assuming any endpoint exists.

The primary goals are:

- Clean architecture
- Maintainable code
- Reusable components
- Docker support
- Easy deployment
- Production-ready code

---

# Technology Stack

Frontend (confirmed from package.json)

- React 19.2
- TypeScript ~6.0
- Vite 8.1
- React Router DOM 7.18
- Axios 1.18 (installed, **not yet used anywhere in `src`** — no HTTP calls exist yet)
- Recharts 3.9 (used in `Results.tsx` for the vote breakdown pie chart)
- React Icons 5.6 (`react-icons/hi`, `react-icons/hi2`, `react-icons/fa`)
- ESLint 10 + typescript-eslint 8 (flat config, `eslint.config.js`)

Backend (planned — not yet integrated with the frontend)

- Spring Boot
- REST API
- JWT Authentication
- PostgreSQL

Infrastructure

- Docker
- Docker Compose
- Git
- GitHub

---

# Project Structure (actual, verified)

```
client/
  src/
    assets/            # hero.png, vite.svg
    common/             # shared UI: Button, Loader, Modal, Navbar (each with .module.css)
    components/
      admin/            # AdminGuard.tsx
      user/              # UserGuard.tsx
      layouts/           # MainLayout.tsx, AdminLayout.tsx
    context/            # AuthContext.tsx
    hooks/              # useAuth.ts
    pages/
      Home/              # Home.tsx + Home.css
      Login/             # Login.tsx + Login.module.css
      Register/          # Register.tsx + Register.module.css
      Vote/              # Vote.tsx + Vote.css
      Results/           # Results.tsx + Results.css
      Admin/             # Admin.tsx
    routes/             # AppRoutes.tsx
    services/           # authService.ts (only service that exists so far)
    types/              # auth.ts
    App.tsx
    main.tsx
    index.css
  public/
    favicon.svg
    icons.svg
  vite.config.ts        # minimal — just @vitejs/plugin-react, no env/proxy config yet
  eslint.config.js
  tsconfig.json / tsconfig.app.json / tsconfig.node.json

.github/
  copilot-instructions.md

PROJECT_CONTEXT.md
```

Note: `candidateService.ts` and `voteService.ts` (referenced as the target structure below) **do not exist yet**. Only `authService.ts` exists, and it is a localStorage mock, not an Axios/API client.

---

# Current Implementation Status (read this before making changes)

- **Auth is fully mocked.** `authService.ts` stores a `users` array and the current `user` in `localStorage` (keys `voting-system-user`, `voting-system-users`). Login/register are synchronous-looking `async` functions with no network calls. A default seeded admin exists: `admin` / `admin123`.
- **`AuthContext` + `useAuth`** are implemented and working. `AuthProvider` wraps the app in `main.tsx` (inside `BrowserRouter`). `Navbar` correctly consumes `useAuth()` (this was previously a known gap — it's now fixed).
- **Routing** (`AppRoutes.tsx`) is fully wired with `UserGuard` and `AdminGuard`, `MainLayout` and `AdminLayout`, and redirects: `/admin` → `/admin/dashboard`, unauthenticated → `/`, non-admin hitting admin routes → `/Home`.
- **Pages are functionally complete but data is hardcoded/duplicated:**
  - `Vote.tsx` has its own local `candidates` array (id/name/party), lets the user pick one, shows a submitted state — nothing persisted or sent anywhere.
  - `Results.tsx` has a **separate, independently hardcoded** `results` array (name/votes/color) rendered via Recharts `PieChart`. It is not derived from `Vote.tsx`'s data or any shared source.
  - `Admin.tsx` has yet another **separate, independently hardcoded** `initialCandidates` array with local add-candidate form state.
  - This means candidate data is defined in three places and out of sync by design — a real `candidateService`/shared state (Context, or eventually RTK Query hitting the backend) is needed before this is production-ready.
  - `Home.tsx` (component name internally is still `Dashboard`) is a marketing/dashboard-style landing page with a hero section referencing "🗳 National Election 2026" and using `pravatar.cc` placeholder avatar images.
- **Styling**: civic/ballot theme is present in copy and badges (e.g. "🗳 Ballot Paper", "📊 Election Results", "VoteSecure" brand in Navbar with `FaVoteYea` icon), but `index.css` has a bug — `background-color` and `color` are both set to a `linear-gradient(...)` value, which is invalid CSS for those properties (gradients need `background-image`/`background`, not `background-color`, and `color` can't take a gradient at all without a text-clip trick). This should be fixed.
- **No environment variables are wired up yet** — no `.env` file, no `VITE_API_URL` usage anywhere in `src`, and `vite.config.ts` is the default scaffold (just the React plugin, no proxy/env config).
- **No `axios` usage anywhere in `src`** despite being a dependency — it's there for future backend integration but unused today.

---

# Architecture

Presentation Layer

- React Components
- Pages

Business Layer

- Custom Hooks (`useAuth`)
- Services (`authService` today; `candidateService`/`voteService` planned)

Communication Layer

- Axios (installed, not yet wired to any real endpoint)

Backend

- REST API (not yet integrated — frontend currently self-contained via localStorage)

Database

- PostgreSQL (backend-side, not touched by frontend yet)

---

# Coding Standards

Always prefer:

- Functional Components
- TypeScript
- Hooks
- Small reusable components
- Single Responsibility Principle
- DRY (Don't Repeat Yourself)
- Clean Code

Avoid:

- Duplicate logic (note: the three separate candidate arrays across Vote/Results/Admin are an existing violation of this — flag when touching that area)
- Large components
- Hardcoded URLs
- Inline business logic
- Unused code

---

# React Guidelines

Use:

- Functional Components
- useState
- useEffect
- useMemo
- useCallback (only when beneficial)

Avoid:

- Class Components
- Unnecessary re-renders
- Deep prop drilling

---

# API Guidelines

Use Axios once real backend integration begins.

All API requests should be centralized in `services/`.

Target structure (not fully realized yet):

```
services/
  authService.ts       # exists today, but is a localStorage mock — will need
                        # to be rewritten to call a real backend + store a JWT
  candidateService.ts  # does not exist yet
  voteService.ts       # does not exist yet
```

Do not place API calls inside UI components unless necessary.

When wiring real backend calls, introduce a shared Axios instance (e.g. `services/api.ts`) with a base URL from `import.meta.env.VITE_API_URL` and a request interceptor to attach the JWT once auth is real — none of this exists yet.

---

# Error Handling

Always

- Catch API errors
- Display user-friendly messages
- Handle loading states
- Handle empty states

Never

- Ignore exceptions
- Show raw server errors

---

# Folder Responsibilities

components/

Reusable UI (guards and layouts currently live here: `admin/`, `user/`, `layouts/`)

common/

Shared, generic UI primitives (Button, Loader, Modal, Navbar) — each with a co-located `.module.css`

pages/

Application pages (each with its own `.css` or `.module.css`)

services/

API communication (currently just `authService.ts`, which is mock-only)

hooks/

Reusable logic (`useAuth`)

context/

React Context providers (`AuthContext`)

utils/

Helper functions (folder not created yet)

types/

TypeScript interfaces (`auth.ts` only so far)

assets/

Images and static files

---

# Naming Convention

Components

PascalCase

Example

LoginForm.tsx

Dashboard.tsx

Hooks

useAuth.ts

useVoting.ts (planned)

Services

authService.ts

candidateService.ts / voteService.ts (planned)

Types

auth.ts (lowercase file, PascalCase interfaces inside: `User`, `LoginRequest`, `RegisterRequest`)

Functions

camelCase

Variables

camelCase

Constants

UPPER_CASE

---

# UI Guidelines

The UI should be

- Responsive
- Accessible
- Mobile friendly
- Consistent
- Clean

Keep spacing and layout consistent.

Theme direction: civic/ballot aesthetic (navy + gold-leaning, serif-flavored headings, stamp/tally-board motifs, badge pills like "🗳 Ballot Paper"). Brand name in UI is **VoteSecure**.

---

# Performance

Prefer

- Lazy loading
- Memoization when necessary
- Component reuse
- Efficient rendering

Avoid premature optimization.

---

# Security

Never

- Hardcode secrets
- Hardcode API keys
- Commit credentials

Always

- Use environment variables
- Validate inputs
- Sanitize user input

Current gap: the mock `authService` stores plaintext passwords in `localStorage` (fine for a local prototype, **not** acceptable once real backend/auth work begins — flag this loudly if asked to "productionize" auth).

---

# Docker

Development should support Docker.

Containers should be independent.

Never hardcode container names unless required.

(Docker Compose setup for the backend/Postgres was previously resolved — Windows Docker Hub pull issues fixed via `mirror.gcr.io`, `pg_isready` healthcheck added, `depends_on: condition: service_healthy`. The frontend container/Dockerfile itself is not present in this `client/` folder.)

---

# Environment Variables

Use `.env` files (not yet created in `client/`).

Planned examples

VITE_API_URL

JWT_SECRET (backend)

DATABASE_URL (backend)

---

# AI Agent Instructions

Before changing code:

1. Understand the existing architecture — and check "Current Implementation Status" above, since parts of this doc describe the target architecture, not always what's built yet.
2. Reuse existing code.
3. Follow naming conventions.
4. Keep changes minimal.
5. Explain important decisions.
6. Preserve project consistency.

Never rewrite the entire project unless requested.

When implementing new features:

- Search for existing components first.
- Extend existing code where appropriate.
- Keep files focused on a single responsibility.
- Be aware that "candidate" data currently lives independently in `Vote.tsx`, `Results.tsx`, and `Admin.tsx` — if a task touches candidates/votes, ask whether it should also unify this into a shared service/state, rather than adding a fourth copy.

When fixing bugs:

- Identify the root cause first.
- Fix only the necessary code.
- Avoid introducing regressions.
- Known bug to be aware of: `src/index.css` sets `background-color` and `color` on `body` to a `linear-gradient(...)` value, which does not render as intended.

When refactoring:

- Preserve functionality.
- Improve readability.
- Remove duplication.
- Keep commits small.

---

# Immediate Known TODOs (for whoever/whatever picks this up next)

1. Fix `body` styles in `src/index.css` (gradient misused on `background-color`/`color`).
2. Decide on and implement a single source of truth for candidates/votes instead of three hardcoded arrays.
3. Create `services/candidateService.ts` and `services/voteService.ts`.
4. Introduce a shared Axios instance (`services/api.ts`) once the Spring Boot backend endpoints are ready to consume, including a `VITE_API_URL` env var and JWT-attaching interceptor.
5. Replace the localStorage-mock `authService` with real backend calls + JWT storage, while deciding how to migrate/retire the current mock seed user (`admin` / `admin123`).

---

# Goal

Produce clean, maintainable, production-ready code that follows the existing architecture and minimizes unnecessary changes.