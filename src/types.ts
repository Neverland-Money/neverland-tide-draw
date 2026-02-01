export interface LeaderboardEntry {
  address: string;
  pearls: string;
  rank: number;
  isBlacklisted: boolean;
}

export interface Bracket {
  name: string;
  minRank: number;
  maxRank: number;
  winnerCount: number;
}

export interface Winner {
  address: string;
  pearls: string;
  rank: number;
  bracket: string;
  probability: number;
}

export interface WinnerReport {
  timestamp: string;
  totalParticipants: number;
  totalWinners: number;
  brackets: BracketReport[];
  winners: Winner[];
}

export interface BracketReport {
  name: string;
  totalParticipants: number;
  totalPearls: string;
  winnersSelected: number;
}
