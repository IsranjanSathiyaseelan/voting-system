export interface VoteRequest {
  userId?: number;
  candidateId: number;
  electionId?: number;
}

export interface DailyVoteCount {
  date: string;
  votes: number;
}

export interface VoteStatusResponse {
  hasVoted: boolean;
}
