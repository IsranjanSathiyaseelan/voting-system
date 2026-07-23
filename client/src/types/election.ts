import type { Organization } from "./organization";

export interface Election {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  active: boolean;
  organization?: Organization;
  organizationId?: number;
}

export interface ElectionRequest {
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  active?: boolean;
}
