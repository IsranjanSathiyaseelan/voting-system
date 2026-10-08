# VoteSecure

A full-stack, **multi-tenant** election and polling platform built with Spring Boot, React, PostgreSQL, Docker and **WSO2 API Manager**.

Organizations (clubs, colleges, societies) run their own elections. Voters browse elections, cast one vote per election and view live results. Admins manage elections, candidates, polls and members, all strictly scoped to their own organization.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Vite, React Router, Axios, Recharts |
| Backend | Spring Boot (Java 17), Spring Data JPA, Spring Security (JWT), PostgreSQL |
| Reports | Apache POI (Excel), OpenPDF (PDF) |
| Gateway | WSO2 API Manager 4.x (optional) |
| Infra | Docker, Docker Compose |

---

## Features

- **Multi-tenant isolation:** every election, candidate, poll, vote and member belongs to one organization. The `organizationId` always comes from the JWT, never from the frontend.
- **JWT authentication:** one `POST /api/auth/login` endpoint for voters and admins.
- **Role-based access:** `ORGANIZATION_ADMIN`, `ELECTION_MANAGER`, `VOTER`.
- **One vote per election:** enforced by a database unique constraint on `(user_id, election_id)`.
- **Election lifecycle:** create, activate/deactivate, update and delete elections and candidates.
- **Polls:** lightweight survey questions per organization.
- **Live results:** progress bars and a donut chart.
- **Reports:** export results as Excel or PDF.
- **Member management:** view members and set status (`ACTIVE` / `PENDING` / `BLOCKED`).
- **WSO2 gateway support:** rate limiting and OAuth2/API Key security in front of the backend.

---

## Architecture

### Gateway mode (React → WSO2 → Spring Boot)

```
┌─────────────────────────────┐
│     React SPA  :5173        │
│  calls /votesecureapi/...   │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│   Vite dev proxy (dev only) │
│   /votesecureapi → :8243    │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  WSO2 API Manager  :8243    │
│  /votesecureapi/1.0.0       │
│  ✔ checks app token         │
│  ✔ rate limits / quotas     │
└──────────────┬──────────────┘
               │  /api/**
               ▼
┌─────────────────────────────┐
│  Spring Boot  :8080         │
│  ✔ checks user JWT          │
│  ✔ checks role              │
│  ✔ scopes data to org       │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│  PostgreSQL  :5432          │
└─────────────────────────────┘
```

### Direct mode (no WSO2)

```
React SPA :5173 → Vite proxy (/api → :8080) → Spring Boot :8080 → PostgreSQL
```

**The backend never calls WSO2.** WSO2 sits in front and forwards requests to Spring Boot, so the backend needs no WSO2 token or WSO2 code.

---

## Project Structure

```
voting-system/
├── client/                      # React + TypeScript (Vite)
│   ├── src/
│   │   ├── common/              # Button, Loader, Modal, Navbar
│   │   ├── components/          # admin/, layouts/, user/ (guards + layouts)
│   │   ├── context/             # AuthContext
│   │   ├── hooks/               # useAuth
│   │   ├── pages/               # Admin, Login, Register, Elections, Vote, Results
│   │   ├── routes/              # AppRoutes.tsx
│   │   ├── services/            # api.ts + per-feature services
│   │   └── types/
│   ├── .env                     # VITE_API_BASE_URL, VITE_WSO2_TOKEN
│   ├── vite.config.ts           # dev proxy
│   ├── Dockerfile
│   └── nginx.conf
├── backend/
│   └── src/main/java/com/cloudnative/voting/
│       ├── config/              # Security, CORS, JWT filter, tenant user details
│       ├── controller/
│       ├── dto/
│       ├── jwt/                 # JwtService
│       ├── model/
│       ├── repository/
│       └── service/             # business logic (org ownership enforced here)
├── docker-compose.yml
└── README.md
```

---

## Getting Started

### Prerequisites

- Java 17+, Node.js 18+, PostgreSQL 16 (or Docker Compose), Maven (or `./mvnw`)
- *(Optional)* WSO2 API Manager 4.x for gateway mode

### 1. Backend

Create the database:

```sql
CREATE DATABASE "Voting";
```

Run:

```bash
cd backend
./mvnw spring-boot:run
```

| URL | Description |
|---|---|
| `http://localhost:8080` | REST API |
| `http://localhost:8080/swagger-ui.html` | API docs |
| `http://localhost:8080/actuator/health` | Health check |

Override settings with environment variables:

```bash
JWT_SECRET=your-256bit-secret \
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/Voting \
SPRING_DATASOURCE_USERNAME=postgres \
SPRING_DATASOURCE_PASSWORD=yourpassword \
./mvnw spring-boot:run
```

### 2. Frontend

Pick **one** mode in `client/.env`.

### Through WSO2**

```env
VITE_API_BASE_URL=/votesecureapi/1.0.0/api
VITE_WSO2_TOKEN=your_wso2_access_token
```

Then:

```bash
cd client
npm install
npm run dev     # http://localhost:5173
```

> **Restart Vite after every `.env` or `vite.config.ts` change.** Values are read only at startup.

### 3. Docker Compose

```bash
docker-compose up --build
```

| Service | URL |
|---|---|
| Frontend | `http://localhost:3000` |
| Backend | `http://localhost:8080` |
| PostgreSQL | `localhost:5432` |

> Gateway mode in Docker needs a `/votesecureapi` location in `nginx.conf` that proxies to WSO2 (use `proxy_ssl_verify off;` for the self-signed certificate). The Vite proxy only exists in `npm run dev`.

---

## User Roles

| Role | Access |
|---|---|
| `VOTER` | Browse elections, vote once per election, view results |
| `ELECTION_MANAGER` | Voter actions + manage elections, candidates, polls, reports |
| `ORGANIZATION_ADMIN` | Manager actions + manage members and dashboard analytics |

---

## API Overview

| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/auth/login` | Login, returns JWT + profile | Public |
| POST | `/api/users/register` | Register | Public |
| POST | `/api/users/forgot-password` | Request reset token | Public |
| POST | `/api/users/reset-password` | Reset with token | Public |
| PUT | `/api/users/change-password` | Change password | Authenticated |
| GET / PUT | `/api/users/profile` | View / update profile | Authenticated |
| GET | `/api/users/members` | List org members | Admin / Manager |
| PATCH | `/api/users/members/{id}/status` | Update member status | Org Admin |
| GET | `/api/organizations` | List organizations | Authenticated |
| GET | `/api/organizations/public` | Public org list | Public |
| GET | `/api/organizations/dashboard/stats` | Dashboard KPIs | Authenticated |
| GET | `/api/elections`, `/api/elections/active` | Elections for caller's org | Authenticated |
| POST / PUT / DELETE | `/api/elections/{id}` | Manage an election | Admin / Manager |
| GET | `/api/candidates/election/{id}` | Candidates of an election | Authenticated |
| GET | `/api/candidates/election/{id}/results` | Results by vote count | Authenticated |
| POST | `/api/candidates` | Add candidate | Admin / Manager |
| PUT | `/api/candidates/{id}/assign/{electionId}` | Assign to election | Admin / Manager |
| GET | `/api/polls`, `/api/polls/active` | Polls for caller's org | Authenticated |
| POST / PUT / DELETE | `/api/polls/{id}` | Manage a poll | Admin / Manager |
| POST | `/api/votes` | Cast a vote | Authenticated |
| GET | `/api/votes/status/election` | Has the user voted? | Authenticated |
| GET | `/api/votes/daily` | Daily vote counts | Authenticated |
| GET | `/api/reports/elections/{id}/export/excel` | Excel report | Admin / Manager |
| GET | `/api/reports/elections/{id}/export/pdf` | PDF report | Admin / Manager |

Non-public endpoints need `Authorization: Bearer <user JWT>`.

> `forgot-password`, `reset-password` and `change-password` are implemented in the backend but not yet wired into the frontend.

---

## WSO2 API Manager Integration

WSO2 adds a gateway between the React app and Spring Boot for rate limiting, quotas and OAuth2/API Key security.

### Two tokens, two jobs

| Token | Checked by | Purpose |
|---|---|---|
| **WSO2 application token** (`VITE_WSO2_TOKEN`) | WSO2 gateway | Is this app allowed to call the API? Rate limits |
| **User JWT** (from login) | Spring Boot | Who is the user, their role and organization |

`client/src/services/api.ts` adds the headers automatically:

**Before login** (login, register and other public calls; the user JWT is never sent here):

```http
Authorization: Bearer <WSO2 token>
X-APIM-Authorization: Bearer <WSO2 token>
ApiKey: <WSO2 token>
```

**After login:**

```http
Authorization: Bearer <user JWT>                 ← Spring Boot reads this
X-User-Token: Bearer <user JWT>
X-APIM-Authorization: Bearer <WSO2 token>        ← WSO2 reads this
ApiKey: <WSO2 token>
```

### Step 1: Create the API in WSO2 Publisher

Open `https://localhost:9443/publisher` and create **VoteSecureAPI**:

| Field | Value |
|---|---|
| Name | `VoteSecureAPI` |
| Context | `/votesecureapi` |
| Version | `1.0.0` |
| Backend endpoint | `http://localhost:8080` (**no `/api` suffix**) |
| Security | OAuth2 + API Key |
| **Authorization Header** | **`X-APIM-Authorization`** (Runtime configuration) |

Why the Authorization Header setting matters: WSO2 validates the header named here. Setting it to `X-APIM-Authorization` lets the user JWT in `Authorization` pass through to Spring Boot untouched. If it is left as `Authorization`, WSO2 tries to validate the user JWT and rejects it with `900901`.

**Resources:** the gateway path `/votesecureapi/1.0.0/api/auth/login` must map to Spring Boot's `/api/auth/login`, so resources must include the `/api` prefix. For development, one wildcard resource `/*` (all methods) is simplest. Without a wildcard, add every endpoint from the API table above, including `PATCH /api/users/members/{id}/status`.

**CORS** (Runtime → CORS Configuration):

| Setting | Value |
|---|---|
| Allow origin | `http://localhost:5173` |
| Allow methods | `GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD` |
| Allow headers | `Authorization, X-APIM-Authorization, ApiKey, Content-Type, Accept, Origin, X-Requested-With, X-User-Token` |
| Allow credentials | Enabled |

Finally, **Deploy** the API to the Default gateway and **Publish** it. An undeployed API returns `900906`.

### Step 2: Get an access token (Developer Portal)

1. Open `https://localhost:9443/devportal`.
2. Subscribe your application to **VoteSecureAPI** (the **Unlimited** tier avoids throttling in development).
3. Go to **Applications → your app → Production Keys**.
4. Keep **Client Credentials** ticked and set **Application access token expiry time** to a long value, for example `86400`.
5. Click **Generate Keys**, then **Generate Access Token**.
6. Paste the token into `client/.env` as `VITE_WSO2_TOKEN` and restart Vite.

> **Tokens expire.** The default lifetime is 1 hour. When login suddenly fails with a WSO2 error (`900901`), generate a new token. Never commit tokens: keep `.env` in `.gitignore`.

### Step 3: Vite proxy (local SSL bypass)

WSO2 runs on `https://localhost:8243` with a self-signed certificate, so the browser can't call it directly. The Vite proxy forwards the call through Node, which accepts the certificate:

```typescript
// client/vite.config.ts
server: {
  proxy: {
    "/votesecureapi": {            // Gateway mode
      target: "https://localhost:8243",
      changeOrigin: true,
      secure: false,               // accept self-signed certificate
    },
  },
},
```

`VITE_API_BASE_URL` only chooses the path the browser calls. The proxy is what delivers it.

### Testing the gateway

1. **Backend alone:** `curl http://localhost:8080/actuator/health`
2. **Get a token:**
   ```bash
   curl -k -u <consumerKey>:<consumerSecret> \
     -d "grant_type=client_credentials" https://localhost:8243/token
   ```
3. **Login through WSO2:**
   ```bash
   curl -k -X POST https://localhost:8243/votesecureapi/1.0.0/api/auth/login \
     -H "Authorization: Bearer $WSO2_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{ "email": "...", "password": "..." }'
   ```
4. **Authenticated call:**
   ```bash
   curl -k https://localhost:8243/votesecureapi/1.0.0/api/elections \
     -H "Authorization: Bearer $USER_JWT" \
     -H "X-APIM-Authorization: Bearer $WSO2_TOKEN"
   ```

You can also use **Try Out → API Console** in the Developer Portal. In DevTools → Network, a request to `/votesecureapi/1.0.0/api/...` confirms gateway mode, while `/api/...` means direct mode.

### Error reference

| Code / Status | Meaning | Fix |
|---|---|---|
| `900901` (401) | WSO2 token invalid or expired | Generate a new token, update `VITE_WSO2_TOKEN`, restart Vite |
| `900902` (401) | WSO2 token missing | Set `VITE_WSO2_TOKEN`, restart Vite |
| `900906` (404) | No matching resource, or API not deployed | Base URL must end in `/api`; check resources; deploy and publish the API |
| `900800` (429) | Throttled | Use the Unlimited subscription tier in development |
| 401 (no WSO2 code) | Spring Boot rejected the JWT or credentials | Log in again |
| 403 | Role not allowed | Check the user's role |
| 502 / 503 | Gateway can't reach the backend | Check that Spring Boot is running; in Docker use the container name or `host.docker.internal` instead of `localhost` |

### Checklist

```
□ WSO2 running at https://localhost:9443
□ VoteSecureAPI: context /votesecureapi, version 1.0.0
□ Backend endpoint http://localhost:8080 (no /api suffix)
□ Resources include the /api prefix (or wildcard)
□ Authorization Header = X-APIM-Authorization
□ CORS allows http://localhost:5173
□ API deployed AND published
□ App subscribed (Unlimited tier) and Production keys generated
□ client/.env: VITE_API_BASE_URL=/votesecureapi/1.0.0/api + VITE_WSO2_TOKEN
□ Vite restarted after .env changes
□ Spring Boot running on :8080
```

---

## Backend Security

### JWT flow

1. `JwtAuthenticationFilter` reads `Authorization: Bearer <token>`.
2. `JwtService` verifies the HMAC-SHA256 signature using `jwt.secret`.
3. Claims are read: `sub` (username), `role`, `organizationId`, `email`.
4. A `TenantUserDetails` is placed in the security context.
5. A missing or invalid token gets a `401` JSON response.

Tokens expire after **24 hours**.

### Access rules

```
Public:
  POST /api/auth/**, POST /api/users/register,
  POST /api/users/forgot-password, POST /api/users/reset-password,
  GET  /api/organizations/public, OPTIONS /**,
  Swagger, /actuator/health, /actuator/info

Any logged-in user:
  profile, GET elections / candidates / votes / polls / organizations

Admin or Manager:
  POST/PUT/DELETE elections, candidates, polls; /api/reports/**

Admin only:
  PATCH /api/users/members/**
```

---

## Environment Variables

### `client/.env`

| Variable | Direct mode | Gateway mode |
|---|---|---|
| `VITE_API_BASE_URL` | `/votesecureapi/1.0.0/api` |
| `VITE_WSO2_TOKEN` | not needed | WSO2 application access token |

### Backend

| Variable | Default | Description |
|---|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://localhost:5432/Voting` | Database URL |
| `SPRING_DATASOURCE_USERNAME` | `postgres` | Database user |
| `SPRING_DATASOURCE_PASSWORD` | local dev default | Database password. **Change for any shared environment** |
| `JWT_SECRET` | local dev default | HMAC-SHA256 signing key (at least 256 bits). **Change in production** |

> The backend needs **no WSO2 variables**. WSO2 calls Spring Boot, not the other way around.

---

## Security Summary

- Passwords are BCrypt-hashed.
- Every request is checked by `JwtAuthenticationFilter`; writes also require a role.
- Tenant isolation is enforced twice: at route level and in each service using the JWT's `organizationId`.
- Password reset tokens are random UUIDs that expire in 15 minutes.
- WSO2 adds a third layer: application token validation, rate limiting and quotas.
- Before deploying beyond local use: set strong `JWT_SECRET` and database credentials through environment variables, restrict CORS to your real origin(s), use real certificates on WSO2, and keep all tokens out of git.

---

## License

Currently unlicensed / for educational purposes. Add a license before using it beyond personal or academic work.