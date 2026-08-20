import assert from 'node:assert';
import test, { describe } from 'node:test';
import {
  generatePairingsForPlayers,
  generateInitialPairings,
  generateNextRoundPairings,
  getRoundName,
  fisherYatesShuffle,
} from '../src/lib/tournament/pairing';

describe('Tournament Pairing & Algorithmic Orientations', () => {

  describe('Round Name Calculation (getRoundName)', () => {
    test('returns correct round names for standard power-of-2 orientations', () => {
      assert.strictEqual(getRoundName(2, 1), 'Final');
      assert.strictEqual(getRoundName(4, 1), 'Semifinals');
      assert.strictEqual(getRoundName(8, 1), 'Quarterfinals');
      assert.strictEqual(getRoundName(16, 1), 'Round of 16');
      assert.strictEqual(getRoundName(32, 1), 'Round of 32');
      assert.strictEqual(getRoundName(64, 1), 'Round of 64');
      assert.strictEqual(getRoundName(128, 1), 'Round of 128');
    });

    test('returns custom round name for odd or non-power-of-2 player counts', () => {
      assert.strictEqual(getRoundName(3, 1), 'Round 1 (3 Players)');
      assert.strictEqual(getRoundName(5, 1), 'Round 1 (5 Players)');
      assert.strictEqual(getRoundName(15, 1), 'Round 1 (15 Players)');
      assert.strictEqual(getRoundName(15, 2), 'Round 2 (15 Players)');
    });

    test('handles 1 player edge case orientation', () => {
      assert.strictEqual(getRoundName(1, 1), 'Winner Declared');
      assert.strictEqual(getRoundName(0, 1), 'Winner Declared');
    });
  });

  describe('Fisher-Yates Shuffle', () => {
    test('preserves all items and length', () => {
      const items = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6', 'p7', 'p8'];
      const shuffled = fisherYatesShuffle(items);
      assert.strictEqual(shuffled.length, items.length);
      items.forEach((item) => {
        assert.ok(shuffled.includes(item));
      });
    });

    test('handles empty and single-element arrays', () => {
      assert.deepStrictEqual(fisherYatesShuffle([]), []);
      assert.deepStrictEqual(fisherYatesShuffle(['p1']), ['p1']);
    });
  });

  describe('Player Count Orientations: EVEN Player Counts', () => {
    test('2 Players (Final)', () => {
      const playerIds = ['p1', 'p2'];
      const { roundName, pairings } = generateInitialPairings(playerIds);
      assert.strictEqual(roundName, 'Final');
      assert.strictEqual(pairings.length, 1);
      assert.strictEqual(pairings[0].is_bye, false);
      assert.strictEqual(pairings[0].status, 'pending');
      assert.ok(pairings[0].player1_id && pairings[0].player2_id);
    });

    test('4 Players (Semifinals)', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4'];
      const { roundName, pairings } = generateInitialPairings(playerIds);
      assert.strictEqual(roundName, 'Semifinals');
      assert.strictEqual(pairings.length, 2);
      pairings.forEach((p) => {
        assert.strictEqual(p.is_bye, false);
        assert.strictEqual(p.status, 'pending');
      });
    });

    test('8 Players (Quarterfinals)', () => {
      const playerIds = Array.from({ length: 8 }, (_, i) => `player-${i + 1}`);
      const { roundName, pairings } = generateInitialPairings(playerIds);
      assert.strictEqual(roundName, 'Quarterfinals');
      assert.strictEqual(pairings.length, 4);
    });

    test('16 Players (Round of 16)', () => {
      const playerIds = Array.from({ length: 16 }, (_, i) => `player-${i + 1}`);
      const { roundName, pairings } = generateInitialPairings(playerIds);
      assert.strictEqual(roundName, 'Round of 16');
      assert.strictEqual(pairings.length, 8);
    });

    test('32 Players (Round of 32)', () => {
      const playerIds = Array.from({ length: 32 }, (_, i) => `player-${i + 1}`);
      const { roundName, pairings } = generateInitialPairings(playerIds);
      assert.strictEqual(roundName, 'Round of 32');
      assert.strictEqual(pairings.length, 16);
    });

    test('64 Players (Round of 64)', () => {
      const playerIds = Array.from({ length: 64 }, (_, i) => `player-${i + 1}`);
      const { roundName, pairings } = generateInitialPairings(playerIds);
      assert.strictEqual(roundName, 'Round of 64');
      assert.strictEqual(pairings.length, 32);
    });

    test('128 Players (Round of 128)', () => {
      const playerIds = Array.from({ length: 128 }, (_, i) => `player-${i + 1}`);
      const { roundName, pairings } = generateInitialPairings(playerIds);
      assert.strictEqual(roundName, 'Round of 128');
      assert.strictEqual(pairings.length, 64);
    });
  });

  describe('Player Count Orientations: ODD Player Counts (Automatic Bye Handling)', () => {
    test('3 Players', () => {
      const playerIds = ['p1', 'p2', 'p3'];
      const { roundName, pairings } = generatePairingsForPlayers(playerIds, 1);
      assert.strictEqual(roundName, 'Round 1 (3 Players)');
      assert.strictEqual(pairings.length, 2); // 1 active match + 1 bye

      const byeMatches = pairings.filter((p) => p.is_bye);
      const activeMatches = pairings.filter((p) => !p.is_bye);

      assert.strictEqual(byeMatches.length, 1);
      assert.strictEqual(activeMatches.length, 1);
      assert.strictEqual(byeMatches[0].status, 'complete');
      assert.strictEqual(byeMatches[0].winner_id, byeMatches[0].player1_id);
    });

    test('5 Players', () => {
      const playerIds = ['p1', 'p2', 'p3', 'p4', 'p5'];
      const { pairings } = generatePairingsForPlayers(playerIds, 1);
      assert.strictEqual(pairings.length, 3); // 2 active matches + 1 bye
      assert.strictEqual(pairings.filter((p) => p.is_bye).length, 1);
    });

    test('15 Players', () => {
      const playerIds = Array.from({ length: 15 }, (_, i) => `p-${i + 1}`);
      const { pairings } = generatePairingsForPlayers(playerIds, 1);
      assert.strictEqual(pairings.length, 8); // 7 active + 1 bye
      assert.strictEqual(pairings.filter((p) => p.is_bye).length, 1);
    });

    test('31 Players', () => {
      const playerIds = Array.from({ length: 31 }, (_, i) => `p-${i + 1}`);
      const { pairings } = generatePairingsForPlayers(playerIds, 1);
      assert.strictEqual(pairings.length, 16); // 15 active + 1 bye
      assert.strictEqual(pairings.filter((p) => p.is_bye).length, 1);
    });

    test('63 Players', () => {
      const playerIds = Array.from({ length: 63 }, (_, i) => `p-${i + 1}`);
      const { pairings } = generatePairingsForPlayers(playerIds, 1);
      assert.strictEqual(pairings.length, 32); // 31 active + 1 bye
      assert.strictEqual(pairings.filter((p) => p.is_bye).length, 1);
    });
  });

  describe('Knockout Tournament Progression across Rounds', () => {
    test('Simulates complete 5-player tournament progression down to final winner', () => {
      const round1Ids = ['A', 'B', 'C', 'D', 'E'];
      const r1 = generatePairingsForPlayers(round1Ids, 1);
      assert.strictEqual(r1.pairings.length, 3);

      const byeWinner = r1.pairings.find((p) => p.is_bye)!.winner_id!;
      const winnersR1 = [byeWinner, 'A', 'C'];

      const r2 = generateNextRoundPairings(winnersR1, 2);
      assert.strictEqual(r2.pairings.length, 2);

      const r2ByeWinner = r2.pairings.find((p) => p.is_bye)!.winner_id!;
      const winnersR2 = [r2ByeWinner, 'A'];

      const r3 = generateNextRoundPairings(winnersR2, 3);
      assert.strictEqual(r3.roundName, 'Final');
      assert.strictEqual(r3.pairings.length, 1);
      assert.strictEqual(r3.pairings[0].is_bye, false);
    });
  });
});
