export type TournamentStatus = 'setup' | 'active' | 'complete';
export type PlayerStatus = 'active' | 'eliminated' | 'champion';
export type RoundStatus = 'active' | 'complete';
export type MatchStatus = 'pending' | 'complete';

export interface Tournament {
  id: string;
  name: string;
  status: TournamentStatus;
  winner_id?: string | null;
  runner_up_id?: string | null;
  created_at: string;
  // Optional populated fields
  winner?: Player | null;
  runner_up?: Player | null;
}

export interface Player {
  id: string;
  tournament_id: string;
  name: string;
  status: PlayerStatus;
  created_at: string;
}

export interface Round {
  id: string;
  tournament_id: string;
  round_number: number;
  round_name: string;
  status: RoundStatus;
  created_at: string;
  matches?: Match[];
}

export interface Match {
  id: string;
  round_id: string;
  board_number: number;
  player1_id: string | null;
  player2_id: string | null;
  winner_id: string | null;
  is_bye: boolean;
  status: MatchStatus;
  created_at: string;
  player1?: Player | null;
  player2?: Player | null;
  winner?: Player | null;
}

export interface ExtractedPlayer {
  id: string;
  name: string;
  isDuplicate?: boolean;
}
