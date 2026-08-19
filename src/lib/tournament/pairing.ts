import { Player } from '../types';

/**
 * True random Fisher-Yates shuffle using Web Crypto API when available,
 * falling back to Math.random()
 */
export function fisherYatesShuffle<T>(array: T[]): T[] {
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
 * Returns the nearest power of 2 <= n (e.g. 10 -> 8, 14 -> 8, 18 -> 16, 25 -> 16, 16 -> 16)
 */
export function getNearestLowerPowerOf2(n: number): number {
  if (n < 2) return 1;
  let p = 1;
  while (p * 2 <= n) {
    p *= 2;
  }
  return p;
}

/**
 * Calculates appropriate round name based on player count and round context
 */
export function getRoundName(playerCount: number, isPrelim: boolean = false): string {
  if (isPrelim) {
    return 'Preliminary Round';
  }
  if (playerCount === 2) return 'Final';
  if (playerCount === 4) return 'Semifinals';
  if (playerCount === 8) return 'Quarterfinals';
  if (playerCount === 16) return 'Round of 16';
  if (playerCount === 32) return 'Round of 32';
  if (playerCount === 64) return 'Round of 64';
  return `Round of ${playerCount}`;
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
 * Generates initial round match pairings given a list of player IDs.
 * Handles non-power-of-2 by creating a Preliminary Round with automatic byes.
 */
export function generateInitialPairings(playerIds: string[]): {
  roundName: string;
  pairings: MatchPairing[];
  isPrelim: boolean;
} {
  const shuffled = fisherYatesShuffle(playerIds);
  const n = shuffled.length;
  const targetLower = getNearestLowerPowerOf2(n);

  if (n === targetLower) {
    // Exact power of 2
    const roundName = getRoundName(n, false);
    const pairings: MatchPairing[] = [];
    let board = 1;

    for (let i = 0; i < n; i += 2) {
      pairings.push({
        board_number: board++,
        player1_id: shuffled[i],
        player2_id: shuffled[i + 1],
        winner_id: null,
        is_bye: false,
        status: 'pending',
      });
    }

    return { roundName, pairings, isPrelim: false };
  }

  // Non-power of 2: Create Preliminary Round
  const prelimMatches = n - targetLower; // Number of active matches
  const prelimPlayersCount = prelimMatches * 2; // Players playing in prelim
  const byePlayersCount = n - prelimPlayersCount; // Players getting byes

  const prelimPlayers = shuffled.slice(0, prelimPlayersCount);
  const byePlayers = shuffled.slice(prelimPlayersCount);

  const pairings: MatchPairing[] = [];
  let board = 1;

  // Active preliminary matches
  for (let i = 0; i < prelimPlayers.length; i += 2) {
    pairings.push({
      board_number: board++,
      player1_id: prelimPlayers[i],
      player2_id: prelimPlayers[i + 1],
      winner_id: null,
      is_bye: false,
      status: 'pending',
    });
  }

  // Bye matches (auto-completed)
  for (const byePlayerId of byePlayers) {
    pairings.push({
      board_number: board++,
      player1_id: byePlayerId,
      player2_id: null,
      winner_id: byePlayerId,
      is_bye: true,
      status: 'complete',
    });
  }

  return {
    roundName: 'Preliminary Round',
    pairings,
    isPrelim: true,
  };
}

/**
 * Generates next round pairings from winners of previous round
 */
export function generateNextRoundPairings(winnerIds: string[]): {
  roundName: string;
  pairings: MatchPairing[];
} {
  const shuffled = fisherYatesShuffle(winnerIds);
  const n = shuffled.length;
  const roundName = getRoundName(n, false);

  const pairings: MatchPairing[] = [];
  let board = 1;

  for (let i = 0; i < n; i += 2) {
    pairings.push({
      board_number: board++,
      player1_id: shuffled[i],
      player2_id: shuffled[i + 1] || null,
      winner_id: shuffled[i + 1] ? null : shuffled[i],
      is_bye: !shuffled[i + 1],
      status: shuffled[i + 1] ? 'pending' : 'complete',
    });
  }

  return { roundName, pairings };
}
