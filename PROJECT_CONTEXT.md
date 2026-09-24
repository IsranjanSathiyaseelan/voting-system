# Project Context

## Project Overview

**Project Name:** VoteSecure

A full-stack, multi-tenant organization-based election and polling platform. The frontend is a React SPA communicating with a live Spring Boot backend over a secured REST API using JWT authentication. Both `client/` and `backend/` are separately buildable projects.

**Primary goals:**
- Clean, maintainable architecture
- Reusable components
- Multi-tenant organization isolation
- Docker + Kubernetes support
- Production-ready security

---

# Technology Stack

### Frontend (from `package.json`)

- React 19 + TypeScript ~6.0
- Vite 8.1
- React Router DOM 7.18
- Axios 1.18 — shared instance in `services/api.ts` with a JWT `Authorization: Bearer` request interceptor
- Recharts 3.9 — daily voting chart (admin dashboard) and live results pie chart
- React Icons 5.6 (`react-icons/hi`, `react-icons/hi2`, `react-icons/fa`)
- ESLint 10 + typescript-eslint 8

### Backend (Spring Boot, built and running)

- Spring Boot 4.1 (package `com.cloudnative.voting`)
- Spring Web MVC, Spring Data JPA, Spring Security, Spring Validation, Actuator
- PostgreSQL (via `spring-boot-starter-data-jpa` + `postgresql` driver)
- JWT: `jjwt` 0.11.5 (`jjwt-api`/`jjwt-impl`/`jjwt-jackson`) — **fully wired end-to-end**
- BCrypt password hashing (`BCryptPasswordEncoder`)
- Apache POI (Excel), OpenPDF (PDF)
- Lombok
- Maven (`mvnw`)

### Infrastructure

- Docker (`client/Dockerfile`, `backend/Dockerfile`)
- Docker Compose (`docker-compose.yml` at repo root — Postgres + backend + frontend/nginx)
- Kubernetes (`k8s/` — backend and Postgres manifests)
- Prometheus + Grafana (`prometheus.yml`, `grafana/provisioning/`)

---

# Project Structure (current, verified)

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

backend/
  src/main/java/com/cloudnative/voting/
    BackendApplication.java
    config/
      CorsConfig.java             # CORS (allows frontend dev origin + Docker origins)
      SecurityConfig.java         # Spring Security — stateless JWT, role-based routes
      JwtAuthenticationFilter.java
      SecurityUtils.java          # Extracts username + organizationId from SecurityContext
      TenantUserDetails.java      # UserDetails with organizationId
      DatabaseInitializer.java    # Startup migration: back-fills candidate org IDs,
                                  # drops legacy uq_vote_user_org constraint
    controller/
      AuthController.java         # POST /api/auth/login — issues JWT
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

k8s/
  backend-deployment.yaml
  postgres-deployment.yaml

grafana/provisioning/             # dashboards/, datasources/
prometheus.yml
docker-compose.yml
PROJECT_CONTEXT.md
README.md
```

---

# Current Implementation Status

## Authentication & Security (COMPLETE)

- **Unified login** — `POST /api/auth/login` via `AuthController` issues a JWT for all user roles. No separate admin login page. No hardcoded credentials.
- **JWT filter** — `JwtAuthenticationFilter` validates every request's token before it reaches a controller.
- **Role extraction** — `TenantUserDetails` carries the user's `organizationId`. `SecurityUtils.getCurrentOrganizationId()` extracts it from the `SecurityContext` on any request.
- **Frontend token handling** — `api.ts` has a request interceptor that attaches `Authorization: Bearer <token>` from `localStorage` on every request.
- **BCrypt passwords** — `BCryptPasswordEncoder` is used for hashing at registration and comparison at login throughout.

## Multi-Tenant Isolation (COMPLETE)

- Every service method validates that the resource (election, candidate, member, vote, poll) belongs to the caller's `organizationId` from the JWT — never from a frontend-supplied value.
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

- `/results/:electionId` — reads `electionId` from the URL param (was broken before, fixed).
- Fetches all elections via `electionService.getAll()` (backend scopes to user's org automatically).
- Shows election title, candidate breakdown with progress bars, donut chart, and export buttons.

## Data Migration (COMPLETE)

- `DatabaseInitializer` runs at startup and:
  1. Drops the legacy `uq_vote_user_org` constraint (superseded by `uq_vote_user_election`).
  2. Back-fills `organization_id` for any candidate rows where it was NULL but a linked election has an organization.

---

# Known Gaps (not yet implemented)

1. **Forgot/reset/change password frontend** — backend endpoints exist and work (`/api/users/forgot-password`, `/api/users/reset-password`, `/api/users/change-password`) but there are no corresponding frontend pages yet.
2. **`VITE_API_BASE_URL` environment variable** — the Axios base URL defaults to `/api`; a `.env` file with `VITE_API_BASE_URL` should be introduced for non-Docker deployments.

---

# Architecture

```
Presentation:  React Pages + Components
               ↕ (Axios, JWT-authenticated)
Services:      services/ (one file per domain, no API calls in components)
               ↕ (HTTP REST, Spring MVC)
Backend:       Controllers → Services → Repositories
               ↕ (Spring Data JPA)
Database:      PostgreSQL
```

**Security layers:**
1. `JwtAuthenticationFilter` — validates JWT on every request
2. `SecurityConfig` — enforces role-based access per route
3. Service methods — validate org ownership via `SecurityUtils.getCurrentOrganizationId()`

---

# Coding Standards

## Always prefer
- Functional React components
- TypeScript (strict types, no `any`)
- Hooks (`useState`, `useEffect`, `useMemo`, `useCallback`)
- Small, single-responsibility components
- DRY — all API calls go through `services/`, never inline in components

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
- **Theme:** dark civic/ballot aesthetic — deep navy, indigo/violet accents, glassmorphism cards, smooth animations
- **Typography:** Inter / system-ui
- Responsive, accessible, mobile-friendly
- Consistent spacing and card layouts across voter and admin views

---

# Security Rules

**Never:**
- Hardcode secrets or credentials in source
- Trust `organizationId` from the frontend — always derive from the JWT via `SecurityUtils`
- Store or compare passwords in plaintext

**Always:**
- Use environment variables for `JWT_SECRET`, database credentials
- Validate org ownership in the service layer, not just at the controller
- Sanitize and validate all user input

---

# Docker

- `docker-compose.yml` at repo root orchestrates all three services: Postgres, backend, and frontend (nginx).
- Backend `Dockerfile`: `eclipse-temurin:17-jre`, copies the built jar.
- Frontend `Dockerfile`: multi-stage — Vite build, then nginx to serve.

---

# Environment Variables

| Variable | Where | Purpose |
|---|---|---|
| `JWT_SECRET` | Backend | Signs and validates JWT tokens |
| `SPRING_DATASOURCE_URL` | Backend | PostgreSQL JDBC URL |
| `SPRING_DATASOURCE_USERNAME` | Backend | DB username |
| `SPRING_DATASOURCE_PASSWORD` | Backend | DB password |
| `VITE_API_BASE_URL` | Frontend | Overrides default `/api` base URL |

---

# AI Agent Instructions

Before changing code:
1. Read "Current Implementation Status" above — auth, multi-tenancy, and voting are fully working.
2. The `organizationId` always comes from `SecurityUtils.getCurrentOrganizationId()` on the backend — never from a frontend-supplied parameter.
3. All API calls go through `services/` — never place API calls directly in components.
4. Search for existing service methods, repository queries, and components before creating new ones.
5. Keep changes minimal and scoped — do not rewrite working features.

When fixing bugs:
- Identify the root cause before touching code.
- Fix only what is necessary.
- The `CandidateService.addCandidate`, `VoteService.castVote`, and `DatabaseInitializer` have multi-step validation/migration logic — read them carefully before modifying.

When refactoring:
- Preserve functionality.
- Improve readability.
- Keep sub-components focused (see Admin dashboard pattern).

---

# Goal

Produce clean, maintainable, production-ready code that follows the existing architecture and minimizes unnecessary changes.
