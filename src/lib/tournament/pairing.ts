import { Player } from '../types';

/**
 * True random Fisher-Yates shuffle using Web Crypto API when available,
 * falling back to Math.random()
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
  if (!array || array.length === 0) return [];
  const result = [...array];
  for (let i = result.length - 1; i > 0; i--) {
    let j: number;
    if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
      const randomBuf = new Uint32Array(1);
      window.crypto.getRandomValues(randomBuf);
      j = randomBuf[0] % (i + 1);
    } else if (typeof globalThis !== 'undefined' && globalThis.crypto && globalThis.crypto.getRandomValues) {
      const randomBuf = new Uint32Array(1);
      globalThis.crypto.getRandomValues(randomBuf);
      j = randomBuf[0] % (i + 1);
    } else {
      j = Math.floor(Math.random() * (i + 1));
    }
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Calculates appropriate round name based on player count and round number
 */
export function getRoundName(playerCount: number, roundNumber: number = 1): string {
  if (playerCount <= 1) return 'Winner Declared';
  if (playerCount === 2) return 'Final';
  if (playerCount === 4) return 'Semifinals';
  if (playerCount === 8) return 'Quarterfinals';
  if (playerCount === 16) return 'Round of 16';
  if (playerCount === 32) return 'Round of 32';
  if (playerCount === 64) return 'Round of 64';
  if (playerCount === 128) return 'Round of 128';

  if (roundNumber === 1) {
    return `Round 1 (${playerCount} Players)`;
  }
  return `Round ${roundNumber} (${playerCount} Players)`;
}

export interface MatchPairing {
  board_number: number;
  player1_id: string;
  player2_id: string | null;
  winner_id: string | null;
  is_bye: boolean;
  status: 'pending' | 'complete';
}

/**
 * Generates match pairings for any round using unbiased Fisher-Yates random shuffle.
 * Supports all player count orientations (odd, even, 1 player, powers of 2, non-powers of 2 up to 128+).
 */
export function generatePairingsForPlayers(
  playerIds: string[],
  roundNumber: number = 1
): {
  roundName: string;
  pairings: MatchPairing[];
} {
  if (!playerIds || playerIds.length === 0) {
    return {
      roundName: 'No Players',
      pairings: [],
    };
  }

  const shuffled = fisherYatesShuffle(playerIds);
  const n = shuffled.length;
  const roundName = getRoundName(n, roundNumber);

  const pairings: MatchPairing[] = [];
  let board = 1;

  for (let i = 0; i < n; i += 2) {
    const p1 = shuffled[i];
    const p2 = shuffled[i + 1] || null;

    if (p2) {
      // Standard match: 2 players paired randomly
      pairings.push({
        board_number: board++,
        player1_id: p1,
        player2_id: p2,
        winner_id: null,
        is_bye: false,
        status: 'pending',
      });
    } else {
      // Odd player count: single remaining player gets a Bye
      pairings.push({
        board_number: board++,
        player1_id: p1,
        player2_id: null,
        winner_id: p1,
        is_bye: true,
        status: 'complete',
      });
    }
  }

  return { roundName, pairings };
}

/**
 * Generates initial round match pairings given a list of player IDs.
 */
export function generateInitialPairings(playerIds: string[]): {
  roundName: string;
  pairings: MatchPairing[];
  isPrelim: boolean;
} {
  const { roundName, pairings } = generatePairingsForPlayers(playerIds, 1);
  return { roundName, pairings, isPrelim: false };
}

/**
 * Generates next round pairings from winners of previous round.
 */
export function generateNextRoundPairings(
  winnerIds: string[],
  nextRoundNumber: number = 2
): {
  roundName: string;
  pairings: MatchPairing[];
} {
  return generatePairingsForPlayers(winnerIds, nextRoundNumber);
}
