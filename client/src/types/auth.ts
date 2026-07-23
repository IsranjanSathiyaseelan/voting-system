export type UserRole =
  | "ORGANIZATION_ADMIN"
  | "ELECTION_MANAGER"
  | "VOTER"
  | "SUPER_ADMIN"
  | "ADMIN";

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role?: UserRole;
  organizationId?: number;
  newOrganizationName?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  organizationId?: number | null;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  status?: string | null;
  createdAt?: string | null;
  password?: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}