export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: "SUPER_ADMIN" | "ORGANIZATION_ADMIN" | "ELECTION_MANAGER" | "VOTER";
  organizationId?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  role: "SUPER_ADMIN" | "ORGANIZATION_ADMIN" | "ELECTION_MANAGER" | "VOTER";
  organizationId?: number;
  firstName?: string;
  lastName?: string;
  phone?: string;
  password?: string;
}