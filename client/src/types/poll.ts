import type { Organization } from "./organization";

export interface Poll {
  id: number;
  question: string;
  options: string[];
  active: boolean;
  endDate?: string;
  organization?: Organization;
}

export interface PollRequest {
  question: string;
  options: string[];
  active?: boolean;
  endDate?: string;
}
