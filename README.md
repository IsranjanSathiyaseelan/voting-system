# voting-system

Cloud Native Online Voting System built with Spring Boot, React, PostgreSQL, Docker, Kubernetes, Prometheus, and Grafana.

# VoteSecure

VoteSecure is a full-stack, **multi-tenant** organization-based election and polling platform. Organizations (clubs, colleges, societies, etc.) run their own independent elections and polls — voters browse organizations, cast one vote per election, and organization admins/election managers manage elections, candidates, polls, members, and view live voting analytics and exportable reports from a dedicated dashboard.

## Tech Stack

**Frontend**

- React 19 + TypeScript
- Vite
- React Router DOM
- Axios (with a JWT-attaching request interceptor)
- Recharts (admin analytics)

**Backend**

- Spring Boot 4.1 (Java)
- Spring Data JPA + Hibernate
- Spring Security + stateless JWT authentication
- PostgreSQL
- Apache POI (Excel reports) / OpenPDF (PDF reports)
- Maven

**Infrastructure**

- Docker + Docker Compose
- Kubernetes manifests
- Prometheus + Grafana

## Features

- **Organization-scoped, multi-tenant model** — every Election and Poll belongs to exactly one Organization; every User belongs to at most one Organization with a role (`ORGANIZATION_ADMIN`, `ELECTION_MANAGER`, or `VOTER`). There is no global super-admin — each organization manages itself.
- **Election-scoped voting, enforced at the database level** — a voter can cast one vote per election, backed by a unique constraint on `(user_id, election_id)`, not just application-layer logic.
- **Unified authentication** — a single `POST /api/auth/login` endpoint issues a JWT for both voters and admins; privilege comes from the user's role, not from a separate hardcoded login path. Passwords are BCrypt-hashed end-to-end.
- **Full election lifecycle** — admins/election managers create, update, activate/deactivate, and delete elections and their candidates, all scoped to their own organization.
- **Polls** — lightweight, election-independent survey questions scoped to an organization, for quick feedback without the formality of a full election.
- **Report generation** — export any election's results as an **Excel (.xlsx)** or **PDF** file directly from the admin dashboard.
- **Member management** — admins can view org members and update their status (`ACTIVE` / `PENDING` / `BLOCKED`).
- **Admin dashboard** — sidebar-navigated dashboard with:
  - Live stats (members, elections, active elections, votes, polls)
  - Daily voting activity chart (Recharts)
  - Election, candidate, and poll management
- **Layered backend architecture** — clean separation across controller, service, repository, and DTO layers, with tenant-ownership checks enforced in the service layer in addition to route-level role checks.
- **Observability-ready** — Prometheus scrape config and Grafana provisioning included; Kubernetes manifests for the backend and Postgres.

## Project Structure

```
voting-system/
├── client/                  # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── common/          # Button, Loader, Modal, Navbar
│   │   ├── components/
│   │   │   ├── admin/       # AdminGuard
│   │   │   ├── layouts/     # AdminLayout (sidebar), MainLayout
│   │   │   └── user/        # UserGuard
│   │   ├── context/         # AuthContext
│   │   ├── hooks/           # useAuth
│   │   ├── pages/
│   │   │   ├── Admin/       # AdminLogin, AdminDashboard, AdminElections, AdminCandidates, AdminOrganizations
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Organizations/  # organization card grid
│   │   │   ├── Elections/      # voter-facing election list
│   │   │   ├── Vote/
│   │   │   └── Results/
│   │   ├── routes/          # AppRoutes.tsx
│   │   ├── services/        # api.ts + auth/user/candidate/election/organization/poll/report/vote services
│   │   └── types/           # auth, candidate, dashboard, election, organization, poll, vote
│   ├── Dockerfile
│   ├── nginx.conf
│   └── README.md
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/cloudnative/voting/
│   │   ├── config/          # CorsConfig, SecurityConfig, JwtAuthenticationFilter, SecurityUtils,
│   │   │                    # TenantUserDetails, SwaggerConfig
│   │   ├── controller/      # Auth, User, Organization, Election, Candidate, Poll, Vote, Report
│   │   │                    # + ApiExceptionHandler
│   │   ├── dto/             # Login, Register, UserResponse, forgot/reset/change-password,
│   │   │                    # Election/Poll/Vote requests, dashboard + daily-count responses
│   │   ├── jwt/              # JwtService
│   │   ├── model/           # User, Role, UserStatus, Organization, Election, Candidate, Poll, Vote
│   │   ├── repository/      # Spring Data repositories
│   │   └── service/          # Business logic layer (org-ownership enforced here too)
│   ├── src/test/java/...    # VoteControllerTest, BackendApplicationTests
│   └── Dockerfile
├── k8s/                     # backend-deployment.yaml, postgres-deployment.yaml
├── grafana/provisioning/    # dashboards + datasources
├── prometheus.yml
├── PROJECT_CONTEXT.md
├── README.md
└── docker-compose.yml       # orchestrates postgres + backend + client
```

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 16 (or use Docker Compose below)
- Maven (or use the included `mvnw`)

### Backend Setup

1. Create a PostgreSQL database (adjust name/credentials as needed):

   ```sql
   CREATE DATABASE "Voting";
   ```

2. Configure `backend/src/main/resources/application.properties` with your database connection details, and set a `JWT_SECRET` (via environment variable in any non-local environment — see "Environment Variables" below).

3. Run the backend:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   The API will be available at `http://localhost:8080`. Swagger UI is available at `http://localhost:8080/swagger-ui.html`.

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`. Optionally set `VITE_API_BASE_URL` in a `.env` file to point at a non-default backend URL (defaults to `/api`).

### Running with Docker Compose

A root-level `docker-compose.yml` orchestrates Postgres, the backend, and the client together:

```bash
docker-compose up --build
```

This builds and starts Postgres, the Spring Boot backend, and the Vite frontend (served via nginx) using their respective `Dockerfile`s. Check `docker-compose.yml` at the repo root for exact ports and environment variables.

### Kubernetes

Manifests for the backend and Postgres are in `k8s/`. Apply them to a cluster with:

```bash
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
```

## API Overview

| Method              | Endpoint                                           | Description                                                                   | Access                                   |
| ------------------- | -------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------- |
| POST                | `/api/auth/login`                                  | Login (voters and admins alike) — returns a JWT + user profile                | Public                                   |
| POST                | `/api/users/register`                              | Register (optionally creating a new organization, or joining an existing one) | Public                                   |
| POST                | `/api/users/forgot-password`                       | Request a password reset token                                                | Public                                   |
| POST                | `/api/users/reset-password`                        | Reset password using a token                                                  | Public                                   |
| PUT                 | `/api/users/change-password`                       | Change password while authenticated                                           | Authenticated                            |
| GET / PUT           | `/api/users/profile`                               | View / update own profile                                                     | Authenticated                            |
| GET                 | `/api/users/members`                               | List members of caller's organization                                         | Admin / Manager                          |
| PATCH               | `/api/users/members/{id}/status`                   | Update a member's status                                                      | Org Admin                                |
| GET                 | `/api/organizations`                               | List organizations                                                            | Authenticated                            |
| GET                 | `/api/organizations/{id}`                          | Get an organization                                                           | Authenticated                            |
| POST / PUT / DELETE | `/api/organizations/{id}`                          | Manage an organization                                                        | Admin / Manager (delete: Org Admin only) |
| GET                 | `/api/organizations/{id}/members`                  | Members of a given organization                                               | Authenticated                            |
| GET                 | `/api/organizations/{id}/elections`                | Elections for a given organization                                            | Authenticated                            |
| GET                 | `/api/organizations/dashboard/stats`               | Dashboard stats for caller's organization                                     | Authenticated                            |
| GET                 | `/api/elections` / `/api/elections/active`         | List elections (all / active) for caller's org                                | Authenticated                            |
| POST / PUT / DELETE | `/api/elections/{id}`                              | Manage an election                                                            | Admin / Manager                          |
| GET                 | `/api/candidates/election/{id}`                    | Candidates for an election                                                    | Authenticated                            |
| GET                 | `/api/candidates/election/{id}/results`            | Results for an election, sorted by votes                                      | Authenticated                            |
| POST                | `/api/candidates`                                  | Add a candidate to an election                                                | Admin / Manager                          |
| GET                 | `/api/polls` / `/api/polls/active`                 | List polls for caller's org                                                   | Authenticated                            |
| POST / PUT / DELETE | `/api/polls/{id}`                                  | Manage a poll                                                                 | Admin / Manager                          |
| POST                | `/api/votes`                                       | Cast a vote                                                                   | Authenticated                            |
| GET                 | `/api/votes/status` / `/api/votes/status/election` | Check whether a user has voted                                                | Authenticated                            |
| GET                 | `/api/votes/daily`                                 | Daily vote counts for caller's org                                            | Authenticated                            |
| GET                 | `/api/reports/elections/{id}/export/excel`         | Download election results as Excel                                            | Admin / Manager                          |
| GET                 | `/api/reports/elections/{id}/export/pdf`           | Download election results as PDF                                              | Admin / Manager                          |

All non-public endpoints require a `Authorization: Bearer <token>` header. Every organization-scoped read/write is additionally validated in the service layer against the caller's own `organizationId`, so a valid token for one org can never read or modify another org's data.

> **Note:** `forgot-password`, `reset-password`, and `change-password` are implemented on the backend but **not yet wired into the frontend UI** — there's no corresponding page under `client/src/pages/`. A user who forgets their password currently has no way to recover it through the app itself; the API exists but isn't reachable from the UI yet.

## Security Notes

- **Passwords** are hashed with BCrypt everywhere (registration, login, reset, change) — no plaintext storage or comparison.
- **JWT authentication** is fully enforced: `JwtAuthenticationFilter` validates every request's token, and `SecurityConfig` requires authentication (plus specific roles for writes) on all routes except login, registration, password reset, Swagger, and health checks.
- **Tenant isolation** is checked twice — once via route-level role rules, once again in each service method against the caller's `organizationId` extracted from the JWT.
- **Password reset tokens** are random UUIDs with a 15-minute expiry.
- Before deploying beyond local Docker Compose, confirm `JWT_SECRET` and database credentials are supplied via environment variables rather than left as literal values in `application.properties`, and that CORS is scoped to your real production origin(s).

## License

This project is currently unlicensed / for educational purposes. Add a license of your choice before using it beyond personal/academic work.
