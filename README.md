# VoteSecure

A full-stack, **multi-tenant** organization-based election and polling platform built with Spring Boot, React, PostgreSQL, Docker, Kubernetes, Prometheus, and Grafana.

Organizations (clubs, colleges, societies, etc.) run their own independent elections. Voters browse elections, cast one vote per election, and view live results. Organization admins manage elections, candidates, polls, members, and view live voting analytics from a dedicated dashboard — all strictly scoped to their own organization.

---

## Tech Stack

### Frontend
- **React 19** + TypeScript
- **Vite**
- **React Router DOM**
- **Axios** — shared instance with JWT `Authorization` header interceptor
- **Recharts** — admin voting analytics chart and live results pie chart
- **React Icons**

### Backend
- **Spring Boot** (Java, package `com.cloudnative.voting`)
- **Spring Data JPA** + Hibernate
- **Spring Security** — stateless JWT authentication, role-based access control
- **PostgreSQL**
- **Apache POI** (Excel reports) / **OpenPDF** (PDF reports)
- **Maven** (`mvnw` wrapper included)

### Infrastructure & API Management
- **WSO2 API Manager** — API Gateway, traffic management, rate limiting, and gateway security
- **Docker** + **Docker Compose** — orchestrates Postgres, backend, and frontend
- **Kubernetes** manifests (`k8s/`)
- **Prometheus** + **Grafana** — observability stack

---

## Features

- **Multi-tenant isolation** — every election, candidate, poll, vote, and member is strictly scoped to one organization. A valid JWT for one organization cannot read or modify another organization's data, enforced at both the route level (Spring Security) and in every service method via `organizationId` from the JWT.
- **Real JWT authentication** — a single `POST /api/auth/login` endpoint issues a JWT for both voters and admins. The frontend attaches it via an Axios request interceptor. `JwtAuthenticationFilter` validates it on every request. No hardcoded admin credentials.
- **Role-based access control** — three roles: `ORGANIZATION_ADMIN`, `ELECTION_MANAGER`, `VOTER`. Role is embedded in the JWT and enforced by `SecurityConfig`.
- **Election-scoped voting** — one vote per election per user, enforced by a database-level unique constraint on `(user_id, election_id)`.
- **Automatic organization binding** — candidates are always auto-assigned to the creating admin's organization from the JWT; the frontend cannot override this.
- **Full election lifecycle** — admins create, activate/deactivate, update, and delete elections and candidates, all scoped to their organization.
- **Polls** — lightweight survey questions scoped to an organization, independent of elections.
- **Live results** — election results page shows a real-time candidate breakdown with progress bars and a donut chart (Recharts), scoped to the logged-in user's organization.
- **Report generation** — export any election's results as **Excel (.xlsx)** or **PDF** directly from the admin dashboard.
- **Member management** — admins can view org members (excluding themselves) and update member status (`ACTIVE` / `PENDING` / `BLOCKED`).
- **Modular admin dashboard** — sidebar-navigated dashboard, split into focused components:
  - `DashboardHero` — welcome header
  - `DashboardStats` — KPI cards (members, elections, votes, polls)
  - `DailyVotingChart` — daily vote activity (Recharts)
  - `MembersTable` — member list with search and filter
  - `ElectionsTable` — election list with search and filter
- **Startup data migration** — `DatabaseInitializer` runs on every boot to back-fill legacy `organization_id` on candidate rows and drop the superseded `uq_vote_user_org` constraint.
- **Observability-ready** — Prometheus scrape config and Grafana provisioning included.

---

## Project Structure

```
voting-system/
├── client/                         # React + TypeScript frontend (Vite)
│   ├── src/
│   │   ├── common/                 # Button, Loader, Modal, Navbar
│   │   ├── components/
│   │   │   ├── admin/              # AdminGuard
│   │   │   ├── layouts/            # AdminLayout (sidebar), MainLayout
│   │   │   └── user/               # UserGuard
│   │   ├── context/                # AuthContext
│   │   ├── hooks/                  # useAuth
│   │   ├── pages/
│   │   │   ├── Admin/              # AdminDashboard + sub-components:
│   │   │   │   ├── DashboardHero.tsx
│   │   │   │   ├── DashboardStats.tsx
│   │   │   │   ├── DailyVotingChart.tsx
│   │   │   │   ├── CustomChartTooltip.tsx
│   │   │   │   ├── MembersTable.tsx
│   │   │   │   ├── ElectionsTable.tsx
│   │   │   │   ├── AdminElections.tsx
│   │   │   │   └── AdminCandidates.tsx
│   │   │   ├── Login/
│   │   │   ├── Register/
│   │   │   ├── Elections/          # voter-facing election list
│   │   │   ├── Vote/               # multi-step ballot UI
│   │   │   └── Results/            # live results with pie chart
│   │   ├── routes/                 # AppRoutes.tsx
│   │   ├── services/               # api.ts + auth/user/candidate/election/
│   │   │                           # organization/poll/report/vote services
│   │   └── types/                  # auth, candidate, dashboard, election,
│   │                               # organization, poll, vote
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   └── src/main/java/com/cloudnative/voting/
│       ├── config/                 # CorsConfig, SecurityConfig,
│       │                           # JwtAuthenticationFilter, SecurityUtils,
│       │                           # TenantUserDetails, DatabaseInitializer
│       ├── controller/             # Auth, User, Organization, Election,
│       │                           # Candidate, Poll, Vote, Report,
│       │                           # ApiExceptionHandler
│       ├── dto/                    # Login/Register, UserResponse, password DTOs,
│       │                           # Election/Poll/Vote requests,
│       │                           # dashboard + daily-count responses
│       ├── jwt/                    # JwtService
│       ├── model/                  # User, Role, UserStatus, Organization,
│       │                           # Election, Candidate, Poll, Vote
│       ├── repository/             # Spring Data JPA repositories
│       └── service/                # Business logic (org-ownership enforced here)
├── k8s/                            # backend-deployment.yaml, postgres-deployment.yaml
├── grafana/provisioning/           # dashboards + datasources
├── prometheus.yml
├── docker-compose.yml
├── PROJECT_CONTEXT.md
└── README.md
```

---

## Getting Started

### Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 16 (or use Docker Compose)
- Maven (or use the included `mvnw`)

### Backend Setup

1. Create a PostgreSQL database:

   ```sql
   CREATE DATABASE "Voting";
   ```

2. Configure `backend/src/main/resources/application.properties` with your database connection details. Set `JWT_SECRET` via an environment variable for any non-local environment.

3. Run the backend:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   API base: `http://localhost:8080`  
   Swagger UI: `http://localhost:8080/swagger-ui.html`

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

Configure environment variables in `client/.env`:

```env
# Point to WSO2 API Manager Gateway (via Vite proxy for local dev)
VITE_API_BASE_URL=/votesecureapi/1.0.0/api

# WSO2 API Manager Gateway token (from WSO2 Developer Portal / Try Out)
VITE_WSO2_TOKEN=your_wso2_access_token_here
```

Start the Vite development server:

```bash
npm run dev
```

App: `http://localhost:5173`

### Docker Compose

```bash
docker-compose up --build
```

Builds and starts PostgreSQL, the Spring Boot backend, and the Vite/nginx frontend together. See `docker-compose.yml` for exact ports and environment variable overrides.

### Kubernetes

```bash
kubectl apply -f k8s/postgres-deployment.yaml
kubectl apply -f k8s/backend-deployment.yaml
```

---

## User Roles & Access

| Role | Access |
|---|---|
| `VOTER` | Browse elections, cast one vote per election, view live results |
| `ELECTION_MANAGER` | All voter actions + create/manage elections and candidates for their org |
| `ORGANIZATION_ADMIN` | All manager actions + manage members, view dashboard analytics, export reports |

Roles are embedded in the JWT and enforced at the route level (Spring Security) and again in each service method.

---

## API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Login — returns JWT + user profile | Public |
| POST | `/api/users/register` | Register (create or join an organization) | Public |
| POST | `/api/users/forgot-password` | Request a password reset token | Public |
| POST | `/api/users/reset-password` | Reset password using a token | Public |
| PUT | `/api/users/change-password` | Change password | Authenticated |
| GET / PUT | `/api/users/profile` | View / update own profile | Authenticated |
| GET | `/api/users/members` | List org members (excluding admin) | Admin / Manager |
| PATCH | `/api/users/members/{id}/status` | Update a member's status | Org Admin |
| GET | `/api/organizations` | List organizations | Authenticated |
| GET | `/api/organizations/{id}` | Get an organization | Authenticated |
| GET | `/api/organizations/dashboard/stats` | Dashboard KPIs for caller's org | Authenticated |
| GET | `/api/organizations/{id}/elections` | Elections for a given org | Authenticated |
| GET | `/api/elections` / `/api/elections/active` | Elections for caller's org | Authenticated |
| POST / PUT / DELETE | `/api/elections/{id}` | Manage an election | Admin / Manager |
| GET | `/api/candidates/election/{id}` | Candidates for a specific election | Authenticated |
| GET | `/api/candidates/election/{id}/results` | Results sorted by vote count | Authenticated |
| POST | `/api/candidates` | Add a candidate (auto-assigned to caller's org) | Admin / Manager |
| PUT | `/api/candidates/{id}/assign/{electionId}` | Assign candidate to an election | Admin / Manager |
| GET | `/api/polls` / `/api/polls/active` | Polls for caller's org | Authenticated |
| POST / PUT / DELETE | `/api/polls/{id}` | Manage a poll | Admin / Manager |
| POST | `/api/votes` | Cast a vote | Authenticated |
| GET | `/api/votes/status/election` | Check if user has voted in an election | Authenticated |
| GET | `/api/votes/daily` | Daily vote counts for caller's org | Authenticated |
| GET | `/api/reports/elections/{id}/export/excel` | Download election results as Excel | Admin / Manager |
| GET | `/api/reports/elections/{id}/export/pdf` | Download election results as PDF | Admin / Manager |

All non-public endpoints require an `Authorization: Bearer <token>` header. Every org-scoped operation is additionally validated in the service layer against the caller's `organizationId` from the JWT.

> **Note:** `forgot-password`, `reset-password`, and `change-password` are fully implemented on the backend but are not yet wired into the frontend UI — there are no corresponding pages in `client/src/pages/`. These API endpoints exist and work but are not currently reachable from the app.

---

## WSO2 API Manager Integration

VoteSecure integrates with **WSO2 API Manager** as an enterprise API Gateway to manage traffic, enforce rate limits/throttling, provide gateway-level access controls, and decouple frontend clients from backend microservices.

### Architecture Overview

```
┌─────────────────────────────────┐
│        React SPA (Client)       │
│      http://localhost:5173      │
└────────────────┬────────────────┘
                 │ (Vite Proxy: /votesecureapi → https://localhost:8243)
                 ▼
┌─────────────────────────────────┐
│     WSO2 API Manager Gateway    │
│      https://localhost:8243     │  (Context: /votesecureapi/1.0.0)
└────────────────┬────────────────┘
                 │ (Routes to backend endpoint)
                 ▼
┌─────────────────────────────────┐
│       Spring Boot Backend       │
│      http://localhost:8080      │  (Controllers: /api/**)
└─────────────────────────────────┘
```

### 1. WSO2 API Publisher Configuration

When creating/publishing the API in WSO2 API Manager Publisher:

| Setting | Value | Description |
|---|---|---|
| **API Name** | `VoteSecureAPI` | Display name of the API |
| **Context** | `/votesecureapi` | Base context path on the WSO2 Gateway |
| **Version** | `1.0.0` | API version |
| **Endpoint** | `http://localhost:8080` | Spring Boot backend URL |
| **Security** | `OAuth2`, `API Key` | Gateway authentication schemes |
| **Authorization Header** | `Authorization` / `X-APIM-Authorization` | Gateway credential header |

#### Resource Definitions
Because Spring Boot controllers are mapped to `/api/*` (`/api/auth`, `/api/users`, `/api/elections`, etc.), all resources in WSO2 API Manager **must be prefixed with `/api`**:
- `POST /api/auth/login`
- `POST /api/users/register`
- `GET /api/users/profile`
- `GET /api/elections`
- `POST /api/votes`
- `GET /api/organizations/dashboard/stats`
- *(or wildcard `/api/*`)*

#### CORS Configuration
In WSO2 Publisher (`API Configurations` → `Runtime` → `CORS Configuration`):
- **Enable CORS:** Checked
- **Access-Control-Allow-Origin:** `http://localhost:5173`
- **Access-Control-Allow-Headers:** `Authorization, X-APIM-Authorization, ApiKey, Content-Type, Accept, Origin, X-Requested-With, X-User-Token`
- **Access-Control-Allow-Methods:** `GET, POST, PUT, PATCH, DELETE, OPTIONS`

### 2. Dual-Token Authentication Strategy

VoteSecure operates on a dual-layer security model:
1. **WSO2 Gateway Layer:** Validates the application subscription token (`VITE_WSO2_TOKEN`) to permit requests through the gateway.
2. **Backend Application Layer:** Validates the user's role and multi-tenant `organizationId` from the application JWT issued at login.

The Axios interceptor in [`client/src/services/api.ts`](client/src/services/api.ts) automatically coordinates both tokens:
- **Pre-Login / Public Calls** (`/api/auth/login`, `/api/users/register`, `/api/organizations/public`): Injects the WSO2 token into `Authorization: Bearer <wso2Token>` so WSO2 Gateway allows the request through.
- **Post-Login / Authenticated Calls**: Passes the user's session JWT in `Authorization: Bearer <userToken>` (and `X-User-Token`), while sending the gateway token in `X-APIM-Authorization: Bearer <wso2Token>` and `ApiKey: <wso2Token>`.

### 3. Frontend Configuration (`client/.env`)

```env
# Route through Vite dev proxy (avoids browser self-signed SSL & CORS errors):
VITE_API_BASE_URL=/votesecureapi/1.0.0/api

# WSO2 Gateway token generated from WSO2 Developer Portal / Try Out:
VITE_WSO2_TOKEN=fRynKytwEvEM4RPy2fb_WjsJwwQa
```

### 4. Local Development & Vite Proxy

WSO2 API Manager runs on `https://localhost:8243` with a self-signed SSL certificate by default. Directly calling `https://localhost:8243` from a browser triggers `net::ERR_CERT_AUTHORITY_INVALID`.

To resolve this seamlessly in local development, [`client/vite.config.ts`](client/vite.config.ts) proxies `/votesecureapi`:

```typescript
server: {
  proxy: {
    "/votesecureapi": {
      target: "https://localhost:8243",
      changeOrigin: true,
      secure: false, // Accepts WSO2 self-signed certificate in development
    },
  },
}
```

### 5. Troubleshooting WSO2 Errors

| Error | Meaning | Solution |
|---|---|---|
| **`900906` / "No matching resource found"** | The requested URI doesn't match resources defined in WSO2 | Ensure `VITE_API_BASE_URL` ends with `/api` (e.g. `/votesecureapi/1.0.0/api`) so paths match `/api/auth/login`. |
| **`900901` / "Invalid Credentials"** | WSO2 token missing, invalid, or expired | Generate a fresh access token from the WSO2 Developer Portal and update `VITE_WSO2_TOKEN` in `client/.env`. |
| **`900800` / "Message throttled out"** | Request rate limit / quota exceeded | Check the tier subscription limits configured in WSO2 API Manager. |
| **"API Gateway or Backend unavailable"** | Connection refused or SSL certificate blocked | Verify WSO2 is running. If bypassing the Vite proxy to call `https://localhost:8243` directly, open `https://localhost:8243` in a new tab once and click *Advanced → Proceed to localhost (unsafe)*. |

---

## Security

- **Passwords** are BCrypt-hashed at registration and never stored or compared in plaintext.
- **JWT authentication** is fully enforced: `JwtAuthenticationFilter` validates every request's token, and `SecurityConfig` requires authentication (plus specific roles for writes) on all routes except login, registration, password reset, Swagger, and health checks.
- **Tenant isolation** is checked at two layers — route-level role rules and service-level `organizationId` validation derived from the JWT, never from frontend-supplied values.
- **Password reset tokens** are random UUIDs with a 15-minute expiry.
- Before deploying beyond local Docker Compose, ensure `JWT_SECRET` and database credentials are supplied via environment variables rather than hardcoded in `application.properties`, and that CORS is scoped to your actual production origin(s).

---

## License

This project is currently unlicensed / for educational purposes. Add a license of your choice before using it beyond personal or academic work.
