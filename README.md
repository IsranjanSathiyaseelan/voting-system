# voting-system
Cloud Native Online Voting System built with Spring Boot, React, PostgreSQL, Docker, Kubernetes, Prometheus, and Grafana.

# VoteSecure

VoteSecure is a full-stack organization-based voting platform. Organizations (clubs, colleges, societies, etc.) can run their own independent elections — voters browse organizations, cast one vote per organization for a candidate of their choice, and admins manage organizations, candidates, and view live voting analytics from a dedicated dashboard.

## Tech Stack

**Frontend**
- React 19 + TypeScript
- Vite
- React Router DOM
- Axios
- Recharts (admin analytics)

**Backend**
- Spring Boot 4.1 (Java)
- Spring Data JPA + Hibernate
- Spring Security
- PostgreSQL
- Maven

**Infrastructure**
- Docker + Docker Compose

## Features

- **Organization-scoped voting** — each organization runs its own election. A voter can cast one vote per organization, enforced at the database level with a unique constraint (not just application logic).
- **Separate voter and admin login flows** — voters register/log in normally; admin access is a dedicated login path.
- **Admin dashboard** — sidebar-navigated dashboard with:
  - Live stats (total organizations, candidates, ballots cast, leading candidate)
  - Daily voting activity chart (Recharts)
  - Organization management (create/edit/delete)
  - Candidate management, scoped to an organization
- **Layered backend architecture** — clean separation across controller, service, repository, and DTO layers.

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
│   │   │   ├── Admin/       # AdminLogin, AdminDashboard, AdminCandidates, AdminOrganizations
│   │   │   ├── Login/
│   │   │   ├── Organizations/  # organization card grid
│   │   │   ├── Register/
│   │   │   ├── Results/
│   │   │   └── Vote/
│   │   ├── routes/          # AppRoutes.tsx
│   │   ├── services/        # api.ts + authService, candidateService, organizationService, userService, voteService
│   │   └── types/           # auth, candidate, organization, vote
│   ├── Dockerfile
│   └── README.md
├── backend/                 # Spring Boot backend
│   ├── src/main/java/com/cloudnative/voting/
│   │   ├── config/          # CorsConfig, SecurityConfig, JwtAuthenticationFilter
│   │   ├── controller/      # Admin, Auth, Candidate, Organization, User, Vote + ApiExceptionHandler
│   │   ├── dto/             # LoginRequest/Response, UserResponse, VoteRequest, VoteStatusResponse, DailyVoteCountResponse
│   │   ├── jwt/              # JwtService
│   │   ├── model/           # Candidate, Organization, User, Vote
│   │   ├── repository/      # Spring Data repositories
│   │   └── service/          # Business logic layer
│   ├── src/test/java/...    # VoteControllerTest, BackendApplicationTests
│   └── Dockerfile
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

2. Configure `backend/src/main/resources/application.properties` with your database connection details.

3. Run the backend:
   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   The API will be available at `http://localhost:8080`.

### Frontend Setup

```bash
cd client
npm install
npm run dev
```

The app will be available at `http://localhost:5173`.

### Running with Docker Compose

A root-level `docker-compose.yml` orchestrates Postgres, the backend, and the client together:

```bash
docker-compose up --build
```

This builds and starts Postgres, the Spring Boot backend, and the Vite frontend using their respective `Dockerfile`s. Check `docker-compose.yml` at the repo root for exact ports and environment variables.

## API Overview

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/users/register` | Voter registration |
| POST | `/api/users/login` | Voter login |
| POST | `/api/admin/login` | Admin login |
| GET | `/api/organizations` | List organizations |
| POST | `/api/organizations` | Create organization (admin) |
| GET | `/api/organizations/{id}/candidates` | Candidates for an organization |
| GET | `/api/organizations/{id}/results` | Vote results for an organization |
| POST | `/api/votes` | Cast a vote |
| GET | `/api/votes/status` | Check whether a user has voted in an organization |
| GET | `/api/votes/daily-stats` | Daily vote counts (admin dashboard) |

## Known Limitations

This project is under active development. A few things to double-check before relying on this in any real context:

- **Admin credentials are hardcoded** in `AdminController` for simplicity — not backed by the database. Fine for a demo/local project, not production-ready as-is.
- **Password hashing** — verify `UserService` uses a `PasswordEncoder` (BCrypt) rather than comparing raw strings; this was a known gap earlier in development.
- **JWT authentication** — `JwtAuthenticationFilter` and `JwtService` are present, which suggests token validation is now wired into the request pipeline. Double-check `SecurityConfig` actually requires a valid token on protected routes (organizations, votes, candidates) rather than leaving them open.
- **Error handling** — `ApiExceptionHandler` suggests centralized error responses are now in place; confirm vote failures (e.g. duplicate votes) return a proper 4xx status rather than a 200 OK.

## License

This project is currently unlicensed / for educational purposes. Add a license of your choice before using it beyond personal/academic work.