export interface Candidate {
  id: number;
  name: string;
  voteCount: number;
  organizationId: number;
  party?: string;
}
