# Project Context

## Project Overview

**Project Name:** VoteSecure

A full-stack, multi-tenant organization-based election and polling platform. The frontend is a React SPA communicating with a Spring Boot backend over a secured REST API using JWT authentication. Requests can go directly to the backend or through a **WSO2 API Manager** gateway. Both `client/` and `backend/` are separately buildable projects.

**Primary goals:**
- Clean, maintainable architecture
- Reusable components
- Multi-tenant organization isolation
- Docker support
- Optional WSO2 API gateway (rate limiting, OAuth2/API Key security)
- Production-ready security

---

# Technology Stack

### Frontend (from `package.json`)

- React 19 + TypeScript ~6.0
- Vite 8.1 (dev proxy with direct and WSO2 modes)
- React Router DOM 7.18
- Axios 1.18: shared instance in `services/api.ts` with a dual-token request interceptor and a WSO2 fault-parsing response interceptor
- Recharts 3.9: daily voting chart (admin dashboard) and live results pie chart
- React Icons 5.6 (`react-icons/hi`, `react-icons/hi2`, `react-icons/fa`)
- ESLint 10 + typescript-eslint 8

### Backend (Spring Boot, built and running)

- Spring Boot 4.1 (package `com.cloudnative.voting`)
- Spring Web MVC, Spring Data JPA, Spring Security, Spring Validation, Actuator
- PostgreSQL (via `spring-boot-starter-data-jpa` + `postgresql` driver)
- JWT: `jjwt` 0.11.5 (`jjwt-api`/`jjwt-impl`/`jjwt-jackson`), fully wired end-to-end
- BCrypt password hashing (`BCryptPasswordEncoder`)
- Apache POI (Excel), OpenPDF (PDF)
- Lombok
- Maven (`mvnw`)

### Infrastructure

- Docker (`client/Dockerfile`, `backend/Dockerfile`)
- Docker Compose (`docker-compose.yml` at repo root: Postgres + backend + frontend/nginx)
- WSO2 API Manager 4.x (optional gateway in front of the backend)

---

# Project Structure (current)

```
client/
  src/
    common/              # Button, Loader, Modal, Navbar (each with .module.css or .css)
    components/
      admin/             # AdminGuard.tsx
      user/              # UserGuard.tsx
      layouts/           # MainLayout.tsx, AdminLayout.tsx (sidebar nav)
    context/             # AuthContext.tsx
    hooks/               # useAuth.ts
    pages/
      Login/             # Login.tsx + Login.module.css  (unified voter+admin login)
      Register/          # Register.tsx + Register.module.css
      Elections/         # voter-facing election list
      Vote/              # multi-step ballot UI (Vote.tsx + Vote.css)
      Results/           # live results page (Results.tsx + Results.css)
      Admin/             # AdminDashboard.tsx + sub-components:
                         #   DashboardHero.tsx, DashboardStats.tsx
                         #   DailyVotingChart.tsx, CustomChartTooltip.tsx
                         #   MembersTable.tsx, ElectionsTable.tsx
                         #   AdminElections.tsx, AdminCandidates.tsx
    routes/              # AppRoutes.tsx
    services/            # api.ts, authService.ts, userService.ts, candidateService.ts,
                         # electionService.ts, organizationService.ts, pollService.ts,
                         # reportService.ts, voteService.ts
    types/               # auth.ts, candidate.ts, dashboard.ts, election.ts,
                         # organization.ts, poll.ts, vote.ts
    App.tsx, main.tsx, index.css
  .env                   # VITE_API_BASE_URL, VITE_WSO2_TOKEN
  vite.config.ts         # dev proxy: /api -> :8080, /votesecureapi -> WSO2 :8243
  nginx.conf
  Dockerfile

backend/
  src/main/java/com/cloudnative/voting/
    BackendApplication.java
    config/
      CorsConfig.java             # CORS (allows frontend dev origin, Docker origins,
                                  # and the X-APIM-Authorization header from WSO2)
      SecurityConfig.java         # Spring Security: stateless JWT, role-based routes
      JwtAuthenticationFilter.java
      SecurityUtils.java          # Extracts username + organizationId from SecurityContext
      TenantUserDetails.java      # UserDetails with organizationId
      DatabaseInitializer.java    # Startup migration: back-fills candidate org IDs,
                                  # drops legacy uq_vote_user_org constraint
    controller/
      AuthController.java         # POST /api/auth/login, issues JWT
      UserController.java         # registration, profile, password, members
      OrganizationController.java
      ElectionController.java
      CandidateController.java
      PollController.java
      VoteController.java
      ReportController.java
      ApiExceptionHandler.java    # global @ControllerAdvice error handler
    dto/                          # LoginRequest/Response, RegisterRequest, UserResponse,
                                  # password DTOs, ElectionRequest, PollRequest,
                                  # VoteRequest, DashboardStats, DailyVoteCountResponse,
                                  # VoteStatusResponse
    jwt/
      JwtService.java             # generates + validates JWT tokens
    model/
      User.java, Role.java (enum), UserStatus.java (enum)
      Organization.java, Election.java, Candidate.java, Poll.java, Vote.java
    repository/                   # Spring Data JPA repositories for all entities
    service/                      # UserService, OrganizationService, ElectionService,
                                  # CandidateService, PollService, VoteService, ReportService
  src/test/java/...               # VoteControllerTest, BackendApplicationTests
  Dockerfile
  pom.xml

docker-compose.yml
PROJECT_CONTEXT.md
README.md
```

---

# Current Implementation Status

## Authentication & Security (COMPLETE)

- **Unified login:** `POST /api/auth/login` via `AuthController` issues a JWT for all user roles. No separate admin login page. No hardcoded credentials.
- **JWT filter:** `JwtAuthenticationFilter` validates every request's token before it reaches a controller.
- **Role extraction:** `TenantUserDetails` carries the user's `organizationId`. `SecurityUtils.getCurrentOrganizationId()` extracts it from the `SecurityContext` on any request.
- **Frontend token handling:** the `api.ts` request interceptor attaches the user JWT (from `localStorage`) as `Authorization: Bearer <token>` on authenticated requests. It never sends the user JWT on public endpoints (login, register, forgot/reset password, public organizations).
- **BCrypt passwords:** `BCryptPasswordEncoder` is used for hashing at registration and comparison at login throughout.

## WSO2 API Gateway Integration (COMPLETE, OPTIONAL)

- **Request flow (gateway mode):** React → Vite dev proxy (`/votesecureapi` → `https://localhost:8243`) → WSO2 API Manager → Spring Boot (`:8080`, `/api/**`).
- **Request flow (direct mode):** React → Vite dev proxy (`/api` → `http://localhost:8080`) → Spring Boot.
- **The backend never calls WSO2.** It contains no WSO2 client code and needs no WSO2 environment variables. WSO2 only forwards requests to it.
- **Dual-token strategy:**
  - WSO2 application token (`VITE_WSO2_TOKEN`): validated by the WSO2 gateway (subscription, rate limits). Sent as `X-APIM-Authorization` and `ApiKey` on every request, and as `Authorization` before login.
  - User JWT (from login): validated by Spring Boot. Sent as `Authorization` (plus `X-User-Token`) after login.
- **Publisher setting that matters:** the API's **Authorization Header** (Runtime configuration) must be `X-APIM-Authorization`, so WSO2 validates the application token there and the user JWT in `Authorization` reaches Spring Boot untouched.
- **API setup:** context `/votesecureapi`, version `1.0.0`, backend endpoint `http://localhost:8080` (no `/api` suffix), resources include the `/api` prefix (or a wildcard), API deployed and published, application subscribed.
- **Tokens expire:** WSO2 access tokens last 1 hour by default. Raise the application's token expiry in the Developer Portal (Production Keys) for development, and regenerate `VITE_WSO2_TOKEN` when WSO2 errors (`900901`) appear.
- **Fault handling:** the `api.ts` response interceptor turns WSO2 fault codes into readable messages: `900901`/`900902` (token invalid or missing), `900906` (no matching resource or API not deployed), `900800` (throttled). A failed login shows the server's message instead of "session expired".
- **Local SSL:** WSO2 uses a self-signed certificate on `:8243`, so the Vite proxy uses `secure: false`. The proxy exists only in `npm run dev`; Docker/nginx needs its own `/votesecureapi` location block (with `proxy_ssl_verify off;`) for gateway mode.

## Multi-Tenant Isolation (COMPLETE)

- Every service method validates that the resource (election, candidate, member, vote, poll) belongs to the caller's `organizationId` from the JWT, never from a frontend-supplied value.
- Admins cannot see or modify another organization's data. Voters can only vote in their own organization's elections.
- Candidates are auto-assigned to the creating admin's organization.

## Admin Dashboard (COMPLETE, MODULAR)

- `AdminDashboard.tsx` is the data-fetching orchestrator; each visual section is a focused sub-component.
- Sidebar navigation switches between Dashboard, Elections, and Candidates views without page reloads.
- The "Switch Organization" feature has been removed.

## Voting Flow (COMPLETE)

- Multi-step ballot UI (Select → Review → Receipt).
- Backend validates: user exists, election is active, election belongs to user's org, candidate belongs to election and user's org, user has not already voted.
- Vote uniqueness enforced at DB level: `UNIQUE(user_id, election_id)`.
- Success receipt shown with a cryptographic audit token after voting.

## Live Results (COMPLETE)

- `/results/:electionId` reads `electionId` from the URL param.
- Fetches all elections via `electionService.getAll()` (backend scopes to user's org automatically).
- Shows election title, candidate breakdown with progress bars, donut chart, and export buttons.

## Data Migration (COMPLETE)

- `DatabaseInitializer` runs at startup and:
  1. Drops the legacy `uq_vote_user_org` constraint (superseded by `uq_vote_user_election`).
  2. Back-fills `organization_id` for any candidate rows where it was NULL but a linked election has an organization.

---

# Known Gaps (not yet implemented)

1. **Forgot/reset/change password frontend:** backend endpoints exist and work (`/api/users/forgot-password`, `/api/users/reset-password`, `/api/users/change-password`) but there are no corresponding frontend pages yet.
2. **Gateway mode in Docker:** `client/nginx.conf` has no `/votesecureapi` proxy block yet, so WSO2 mode currently works only with the Vite dev server.
3. **WSO2 token refresh:** `VITE_WSO2_TOKEN` is a static value baked in at build/start time. There is no automatic renewal, so it must be regenerated when it expires.

---

# Architecture

```
Presentation:  React Pages + Components
               ↕ (Axios; user JWT + optional WSO2 token)
Services:      services/ (one file per domain, no API calls in components)
               ↕ (HTTP REST)
Gateway:       WSO2 API Manager (optional, gateway mode only)
               ↕
Backend:       Controllers → Services → Repositories (Spring MVC)
               ↕ (Spring Data JPA)
Database:      PostgreSQL
```

**Security layers:**
1. WSO2 gateway (optional): application token validation, rate limits, quotas
2. `JwtAuthenticationFilter`: validates the user JWT on every request
3. `SecurityConfig`: enforces role-based access per route
4. Service methods: validate org ownership via `SecurityUtils.getCurrentOrganizationId()`

---

# Coding Standards

## Always prefer
- Functional React components
- TypeScript (strict types, no `any`)
- Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- Small, single-responsibility components
- DRY: all API calls go through `services/`, never inline in components

## Avoid
- Class components
- Duplicate API call logic
- Large monolithic components
- Hardcoded URLs or secrets

---

# Naming Conventions

| Element | Convention | Example |
|---|---|---|
| Components | PascalCase | `MembersTable.tsx` |
| Hooks | `use` prefix, camelCase | `useAuth.ts` |
| Services | camelCase + `Service` suffix | `candidateService.ts` |
| Type files | lowercase | `candidate.ts` |
| Interfaces | PascalCase inside | `Candidate`, `Election` |
| Functions | camelCase | `handleElectionSelect` |
| Constants | UPPER_CASE | `CHART_COLORS` |

---

# UI Guidelines

- **Brand name:** VoteSecure
- **Theme:** dark civic/ballot aesthetic: deep navy, indigo/violet accents, glassmorphism cards, smooth animations
- **Typography:** Inter / system-ui
- Responsive, accessible, mobile-friendly
- Consistent spacing and card layouts across voter and admin views

---

# Security Rules

**Never:**
- Hardcode secrets or credentials in source
- Commit tokens or `.env` files to git (keep `.env` in `.gitignore`)
- Trust `organizationId` from the frontend; always derive it from the JWT via `SecurityUtils`
- Store or compare passwords in plaintext
- Send the user JWT on public endpoints (login, register, password reset)

**Always:**
- Use environment variables for `JWT_SECRET` and database credentials
- Validate org ownership in the service layer, not just at the controller
- Sanitize and validate all user input

---

# Docker

- `docker-compose.yml` at repo root orchestrates all three services: Postgres, backend, and frontend (nginx).
- Backend `Dockerfile`: `eclipse-temurin:17-jre`, copies the built jar.
- Frontend `Dockerfile`: multi-stage: Vite build, then nginx to serve.
- If the backend runs in Docker and WSO2 runs on the host (or the reverse), `localhost` in the WSO2 endpoint will not resolve; use `host.docker.internal` or the container name.

---

# Environment Variables

### Frontend (`client/.env`)

| Variable | Direct mode | Gateway mode | Purpose |
|---|---|---|---|
| `VITE_API_BASE_URL` | `/api` | `/votesecureapi/1.0.0/api` | Axios base path; decides which Vite proxy rule is used |
| `VITE_WSO2_TOKEN` | not needed | WSO2 application access token | Injected by `api.ts` as `X-APIM-Authorization`, `ApiKey`, and pre-login `Authorization` |

Restart Vite after any `.env` or `vite.config.ts` change.

### Backend

| Variable | Purpose |
|---|---|
| `JWT_SECRET` | Signs and validates user JWTs (at least 256 bits) |
| `SPRING_DATASOURCE_URL` | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | DB username |
| `SPRING_DATASOURCE_PASSWORD` | DB password |

The backend has no WSO2 variables (`WSO2_BASE_URL` / `WSO2_TOKEN` were removed along with the unused WSO2 client code).

---

# AI Agent Instructions

Before changing code:
1. Read "Current Implementation Status" above: auth, multi-tenancy, voting, and the optional WSO2 gateway flow are fully working.
2. The `organizationId` always comes from `SecurityUtils.getCurrentOrganizationId()` on the backend, never from a frontend-supplied parameter.
3. All API calls go through `services/`, never directly in components. Header and token logic lives only in `services/api.ts`.
4. Search for existing service methods, repository queries, and components before creating new ones.
5. Keep changes minimal and scoped; do not rewrite working features.
6. Do not add WSO2 client code to the backend. WSO2 is a gateway in front of Spring Boot, not a service the backend calls.

When fixing bugs:
- Identify the root cause before touching code.
- Fix only what is necessary.
- For login or 401 problems, check first whether the request went through WSO2 (`/votesecureapi/1.0.0/api/...`) or directly (`/api/...`), and read the response body: a WSO2 fault has a `code` (`900901`, `900902`, `900906`, `900800`), a Spring Boot error does not.
- The `CandidateService.addCandidate`, `VoteService.castVote`, and `DatabaseInitializer` have multi-step validation/migration logic; read them carefully before modifying.

When refactoring:
- Preserve functionality.
- Improve readability.
- Keep sub-components focused (see Admin dashboard pattern).

---

# Goal

Produce clean, maintainable, production-ready code that follows the existing architecture and minimizes unnecessary changes.