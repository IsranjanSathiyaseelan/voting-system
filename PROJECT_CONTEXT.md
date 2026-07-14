# Project Context

## Project Overview

Project Name: Voting System (VoteSecure)

This project is a modern web application for managing elections and allowing authenticated users to vote securely.

The frontend is a React SPA that now talks to a **live Spring Boot backend** over REST — there is no more localStorage mocking. Both `client/` and `backend/` exist as real, separately buildable projects (backend already produces `backend-0.0.1-SNAPSHOT.jar` via Maven). See "Current Implementation Status" below for what's wired up vs. still rough.

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
- Axios 1.18 — **now in active use** via a shared instance in `services/api.ts`
- Recharts 3.9 (used in `Results.tsx` for the live vote breakdown pie chart)
- React Icons 5.6 (`react-icons/hi`, `react-icons/hi2`, `react-icons/fa`)
- ESLint 10 + typescript-eslint 8 (flat config, `eslint.config.js`)

Backend (confirmed — built and running)

- Spring Boot 4.1 (package `com.cloudnative.voting`)
- Spring Web MVC, Spring Data JPA, Spring Security, Spring Validation, Actuator
- PostgreSQL (via `spring-boot-starter-data-jpa` + `postgresql` driver)
- JWT support present via `jjwt` 0.11.5 (`jjwt-api`/`jjwt-impl`/`jjwt-jackson`) — **implemented but not yet used by the frontend** (see Known Issues)
- Lombok
- Maven (`mvnw`)

Infrastructure

- Docker (backend `Dockerfile`, base `eclipse-temurin:17-jre`)
- Docker Compose (`backend/docker-compose.yml` — `postgres:16-alpine` + backend service)
- Git
- GitHub

---

# Project Structure (actual, verified)

```
client/
  src/
    assets/            # hero.png, SignUp.jpg, vite.svg
    common/            # shared UI: Button, Loader, Modal, Navbar (each with .module.css)
    components/
      admin/           # AdminGuard.tsx
      user/            # UserGuard.tsx
      layouts/         # MainLayout.tsx, AdminLayout.tsx
    context/           # AuthContext.tsx
    hooks/             # useAuth.ts
    pages/
      Home/            # Home.tsx + Home.css
      Login/           # Login.tsx + Login.module.css        (voter login)
      AdminLogin/       # AdminLogin.tsx + AdminLogin.module.css  (separate admin login)
      Register/        # Register.tsx + Register.module.css
      Vote/            # Vote.tsx + Vote.css
      Results/         # Results.tsx + Results.css
      Admin/           # Admin.tsx
    routes/            # AppRoutes.tsx
    services/          # api.ts, authService.ts, userService.ts, candidateService.ts, voteService.ts
    types/             # auth.ts, candidate.ts, vote.ts
    App.tsx
    main.tsx
    index.css
  public/
    favicon.svg
    icons.svg
  vite.config.ts
  eslint.config.js
  tsconfig.json / tsconfig.app.json / tsconfig.node.json

backend/
  src/
    main/
      java/com/cloudnative/voting/
        BackendApplication.java
        config/
          CorsConfig.java          # allows http://localhost:5173 (Vite)
          SecurityConfig.java      # see Known Issues — currently very permissive
        controller/
          AuthController.java      # /api/auth/login — JWT-issuing, currently unused by frontend
          AdminController.java     # /api/admin/login — hardcoded admin credentials
          UserController.java      # /api/users/register, /api/users/login — used by frontend
          CandidateController.java # /api/candidates, /api/candidates/results
          VoteController.java      # /api/votes
        dto/
          LoginRequest.java, LoginResponse.java, UserResponse.java, VoteRequest.java
        jwt/
          JwtService.java          # generate/validate JWT — not yet applied as a filter
        model/
          User.java (no role column yet), Candidate.java, Vote.java
        repository/
          UserRepository.java, CandidateRepository.java, VoteRepository.java
        service/
          UserService.java, CandidateService.java, VoteService.java
      resources/
        application.properties     # local Postgres connection, ddl-auto=update
  Dockerfile
  docker-compose.yml
  pom.xml

.github/
  copilot-instructions.md

PROJECT_CONTEXT.md
```

---

# Current Implementation Status (read this before making changes)

- **Auth is real, but split across two flows:**
  - Voters: `Login.tsx` → `authService.login()` → `POST /api/users/login` → `UserController`/`UserService` do a raw string comparison against the stored (plaintext) password and return a `UserResponse` — no token.
  - Admin: `AdminLogin.tsx` (separate page, route `/admin/login`) → `authService.adminLogin()` → `POST /api/admin/login` → `AdminController` checks against **hardcoded** credentials (`admin` / `admin123`, not stored in the DB) and returns a `UserResponse` with `role: "ADMIN"`.
  - `AuthController` (`/api/auth/login`) issues a real JWT via `JwtService` but is **not called by the frontend at all** — dead code right now.
- **`services/api.ts`** is a real shared Axios instance (`baseURL: http://localhost:8080/api`) with a response interceptor that unwraps `error.response.data` into a thrown `Error`. It does **not** attach any Authorization header — no token is sent on any request currently.
- **`AuthContext` + `useAuth`** are implemented and working, and now delegate persistence to `authService` (`getStoredUser`/`setStoredUser`/`clearStoredUser`) rather than touching `localStorage` directly. `AuthProvider` wraps the app in `main.tsx`.
- **Routing** (`AppRoutes.tsx`) is fully wired: `UserGuard` and `AdminGuard`, `MainLayout` and `AdminLayout`, redirects (`/admin` → `/admin/dashboard`, unauthenticated → `/`, non-admin hitting admin routes → `/Home`). `/admin/login` is a public route, separate from `/login`.
- **Candidate data is unified** — `Vote.tsx`, `Results.tsx`, and `Admin.tsx` all now pull from `candidateService` (real API calls), not three separate hardcoded arrays. This was previously a known issue and is resolved.
- **Backend security is currently a stopgap, not real protection.** `SecurityConfig` permits `/api/users/register`, `/api/users/login`, `/api/auth/login`, `/api/admin/login`, `/api/candidates/**`, and `/api/votes/**` — i.e. effectively everything the frontend calls. This was done to unblock 401s (there is no token-attaching interceptor and no JWT filter yet), but it means there is no real authorization on any endpoint today.
- **No environment variables wired up on the frontend** — no `.env`, no `VITE_API_URL`; the API base URL is hardcoded in `services/api.ts`.

## Known Issues (not yet fixed — see conversation history for full detail)

1. **Dead JWT infrastructure.** `AuthController` + `JwtService` are fully implemented but unused. Either wire them in end-to-end (frontend stores + attaches the token, backend validates it in a filter, `SecurityConfig` locks endpoints back down) or remove them.
2. **`User` entity has no `role` column.** `UserService` can only ever return `"USER"`. Real per-user admin roles (as opposed to the separate hardcoded admin login) aren't possible yet.
3. **`VoteController.castVote` swallows errors into 200 OK responses.** Duplicate votes, missing users/candidates, etc. all currently look like "success" to the frontend because the exception message is returned as a normal 200 body instead of an error status.
4. **Passwords are stored and compared in plaintext** (`User.password`, `.equals()` checks in `UserService` and `AuthController`). No `PasswordEncoder`/BCrypt anywhere yet.
5. **Client/server DTO mismatch:** `types/auth.ts` declares `User.email` as required, but `UserResponse.java` never includes an `email` field — `user.email` is `undefined` at runtime despite the type.

---

# Architecture

Presentation Layer

- React Components
- Pages

Business Layer

- Custom Hooks (`useAuth`)
- Services: `authService`, `userService`, `candidateService`, `voteService` (all real, Axios-backed)

Communication Layer

- Shared Axios instance (`services/api.ts`) — no auth header attached yet

Backend

- Spring Boot REST API — real and running, but with permissive security as a stopgap (see Known Issues)

Database

- PostgreSQL, via Spring Data JPA (`ddl-auto=update`)

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

- Duplicate logic (resolved for candidates — don't reintroduce a fourth hardcoded array if you touch this area again)
- Large components
- Hardcoded URLs (note: `services/api.ts` currently hardcodes the base URL — flag if asked to productionize)
- Inline business logic
- Unused code (note: `AuthController`/`JwtService` currently qualify — see Known Issues #1)

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

All API requests are centralized in `services/`:

```
services/
  api.ts               # shared Axios instance, response error interceptor
  authService.ts       # voter login (/api/users/login) + admin login (/api/admin/login)
  userService.ts       # registration (/api/users/register)
  candidateService.ts  # list/results/add candidates
  voteService.ts       # cast vote
```

Do not place API calls inside UI components — this convention is being followed correctly across `Vote.tsx`, `Results.tsx`, and `Admin.tsx`.

Still missing: a request interceptor to attach a JWT once real token-based auth is wired in (see Known Issues #1), and a `VITE_API_URL` env var instead of the hardcoded base URL in `api.ts`.

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

Known gap: `VoteController` currently defeats this on the backend by returning failures as 200 OK — see Known Issues #3. Frontend error handling (loading/error state in `Vote.tsx`, `Results.tsx`, `Admin.tsx`) is otherwise implemented correctly and will work properly once the backend returns proper error statuses.

---

# Folder Responsibilities

client/components/

Reusable UI (guards and layouts: `admin/`, `user/`, `layouts/`)

client/common/

Shared, generic UI primitives (Button, Loader, Modal, Navbar) — each with a co-located `.module.css`

client/pages/

Application pages (each with its own `.css` or `.module.css`), including the separate `AdminLogin` page

client/services/

Real API communication — Axios-backed, no more mocking

client/hooks/

Reusable logic (`useAuth`)

client/context/

React Context providers (`AuthContext`)

client/types/

TypeScript interfaces: `auth.ts`, `candidate.ts`, `vote.ts`

backend/controller/

REST endpoints — note the split between `UserController` (used), `AuthController` (unused, JWT), `AdminController` (hardcoded admin)

backend/service/, backend/repository/, backend/model/, backend/dto/

Standard Spring layered architecture

---

# Naming Convention

Components

PascalCase — `LoginForm.tsx`, `AdminLogin.tsx`, `Dashboard.tsx`

Hooks

`useAuth.ts`

Services

`authService.ts`, `userService.ts`, `candidateService.ts`, `voteService.ts`

Types

Lowercase file, PascalCase interfaces inside: `auth.ts` (`User`, `LoginRequest`, `RegisterRequest`), `candidate.ts` (`Candidate`), `vote.ts` (`VoteRequest`)

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

Theme direction: civic/ballot aesthetic (navy + gold-leaning, serif-flavored headings, stamp/tally-board motifs, badge pills like "🗳 Ballot Paper"). Brand name in UI is **VoteSecure**. The admin login page (`AdminLogin.tsx`) intentionally uses a distinct dark theme to visually separate it from the voter-facing flow.

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

**Current gaps (flag loudly if asked to "productionize"):**

- `AdminController` hardcodes admin credentials directly in source (`admin` / `admin123`) — intentional for now, but must move to env vars / a real stored+hashed credential before deploying anywhere real.
- `User.password` is stored and compared in plaintext — no `PasswordEncoder` in use yet.
- `SecurityConfig` currently permits nearly every endpoint the frontend calls (`/api/candidates/**`, `/api/votes/**` included) as a stopgap to avoid 401s, since no JWT filter validates a token yet. This means there is effectively no authorization enforced on candidate/vote endpoints right now.
- `JwtService` exists and can mint/validate tokens, but nothing in the request path checks them.

---

# Docker

Development should support Docker.

Containers should be independent.

Never hardcode container names unless required.

Backend: `backend/Dockerfile` (base `eclipse-temurin:17-jre`, copies the built jar) + `backend/docker-compose.yml` (`postgres:16-alpine` + backend service, named volume for Postgres data). Previously resolved: Windows Docker Hub pull issues fixed via a public mirror + local retag.

Frontend: no Dockerfile present yet in `client/`.

---

# Environment Variables

Use `.env` files.

Frontend: none created yet — `VITE_API_URL` should be introduced to replace the hardcoded base URL in `services/api.ts`.

Backend: currently uses `application.properties` directly (`spring.datasource.url`, username `postgres`, password `1234` — hardcoded, should move to env vars before this goes anywhere beyond local dev). `docker-compose.yml` overrides these via environment variables for the containerized backend already.

Planned

- `VITE_API_URL` (frontend)
- `JWT_SECRET` (backend — currently hardcoded in `JwtService`, same concern)
- `DATABASE_URL` / individual `SPRING_DATASOURCE_*` vars (backend)

---

# AI Agent Instructions

Before changing code:

1. Understand the existing architecture — and check "Current Implementation Status" / "Known Issues" above, since this project has real, working backend integration now, not a mock.
2. Reuse existing code.
3. Follow naming conventions.
4. Keep changes minimal.
5. Explain important decisions.
6. Preserve project consistency.

Never rewrite the entire project unless requested.

When implementing new features:

- Search for existing components/services first — candidate/vote/auth data flows are already unified through `services/`, don't reintroduce parallel hardcoded copies.
- Extend existing code where appropriate.
- Keep files focused on a single responsibility.
- Be aware there are **two separate login flows by design** (voter via `UserController`, admin via `AdminController`) — don't merge them unless explicitly asked to.

When fixing bugs:

- Identify the root cause first.
- Fix only the necessary code.
- Avoid introducing regressions.
- See "Known Issues" above for the current, confirmed bug list before assuming something is already fixed.

When refactoring:

- Preserve functionality.
- Improve readability.
- Remove duplication.
- Keep commits small.

---

# Immediate Known TODOs (for whoever/whatever picks this up next)

1. Wire real JWT auth end-to-end (issue on login, attach via Axios interceptor, validate via a backend filter) — or deliberately remove `AuthController`/`JwtService` if JWT isn't going to be used.
2. Add a `role` column to `User` and stop hardcoding `"USER"` in `UserService` responses.
3. Fix `VoteController.castVote` to return proper HTTP error statuses instead of 200 OK for failures.
4. Hash passwords with `PasswordEncoder`/BCrypt instead of storing/comparing plaintext.
5. Add `email` to `UserResponse` (or make it optional on the client `User` type) to close the DTO mismatch.
6. Once JWT is real, tighten `SecurityConfig` back down — `/api/candidates/**` and `/api/votes/**` are currently wide open as a stopgap.
7. Move hardcoded secrets (admin credentials, JWT secret, DB password) to environment variables.
8. Introduce `VITE_API_URL` on the frontend instead of the hardcoded Axios base URL.

---

# Goal

Produce clean, maintainable, production-ready code that follows the existing architecture and minimizes unnecessary changes.