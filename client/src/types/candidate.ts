export interface Candidate {
  id: number;
  name: string;
  voteCount: number;
  electionId?: number | null;
  organizationId?: number | null;
  party?: string;
}
