# Project Context

## Project Overview

Project Name: Voting System

This project is a modern web application for managing elections and allowing authenticated users to vote securely.

The project is built with a React frontend and communicates with a REST API backend.

The primary goals are:

- Clean architecture
- Maintainable code
- Reusable components
- Docker support
- Easy deployment
- Production-ready code

---

# Technology Stack

Frontend

- React
- TypeScript
- Vite
- React Router
- Axios
- Recharts
- React Icons

Backend

- Spring Boot (planned/integration ready)
- REST API
- JWT Authentication
- PostgreSQL

Infrastructure

- Docker
- Docker Compose
- Git
- GitHub

---

# Project Structure

client/
src/
assets/
components/
pages/
context/
common/
services/
hooks/
types/

.github/
copilot-instructions.md

PROJECT_CONTEXT.md

---

# Architecture

Presentation Layer

- React Components
- Pages

Business Layer

- Custom Hooks
- Services

Communication Layer

- Axios

Backend

- REST API

Database

- PostgreSQL

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

- Duplicate logic
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

Use Axios.

All API requests should be centralized.

Example

services/

authService.ts

candidateService.ts

voteService.ts

Do not place API calls inside UI components unless necessary.

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

Reusable UI

pages/

Application pages

services/

API communication

hooks/

Reusable logic

utils/

Helper functions

types/

TypeScript interfaces

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

useVoting.ts

Services

authService.ts

voteService.ts

Types

User.ts

Vote.ts

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

---

# Docker

Development should support Docker.

Containers should be independent.

Never hardcode container names unless required.

---

# Environment Variables

Use .env files.

Examples

VITE_API_URL

JWT_SECRET (backend)

DATABASE_URL

---

# AI Agent Instructions

Before changing code:

1. Understand the existing architecture.
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

When fixing bugs:

- Identify the root cause first.
- Fix only the necessary code.
- Avoid introducing regressions.

When refactoring:

- Preserve functionality.
- Improve readability.
- Remove duplication.
- Keep commits small.

---

# Goal

Produce clean, maintainable, production-ready code that follows the existing architecture and minimizes unnecessary changes.
