import assert from 'node:assert';
import test, { describe } from 'node:test';
import { Match } from '../src/lib/types';
import {
  getIterationForBoard,
  groupMatchesByIteration,
  filterMatchesBySearch,
} from '../src/lib/tournament/iteration';

describe('Board Iteration & Search Filtering', () => {
  describe('getIterationForBoard', () => {
    test('correctly calculates iteration indices for 4 boards capacity', () => {
      assert.strictEqual(getIterationForBoard(1, 4).iterationIndex, 1);
      assert.strictEqual(getIterationForBoard(4, 4).iterationIndex, 1);
      assert.strictEqual(getIterationForBoard(5, 4).iterationIndex, 2);
      assert.strictEqual(getIterationForBoard(8, 4).iterationIndex, 2);
      assert.strictEqual(getIterationForBoard(9, 4).iterationIndex, 3);
    });

    test('correctly calculates iteration indices for 6 boards capacity', () => {
      assert.strictEqual(getIterationForBoard(1, 6).iterationIndex, 1);
      assert.strictEqual(getIterationForBoard(6, 6).iterationIndex, 1);
      assert.strictEqual(getIterationForBoard(7, 6).iterationIndex, 2);
      assert.strictEqual(getIterationForBoard(12, 6).iterationIndex, 2);
      assert.strictEqual(getIterationForBoard(13, 6).iterationIndex, 3);
    });

    test('handles "all" capacity', () => {
      const iter = getIterationForBoard(10, 'all');
      assert.strictEqual(iter.iterationIndex, 1);
      assert.strictEqual(iter.label, 'All Boards');
    });
  });

  describe('groupMatchesByIteration', () => {
    const mockMatches: Match[] = [
      { id: 'm1', round_id: 'r1', board_number: 1, player1_id: 'p1', player2_id: 'p2', winner_id: 'p1', is_bye: false, status: 'complete', created_at: '' },
      { id: 'm2', round_id: 'r1', board_number: 2, player1_id: 'p3', player2_id: 'p4', winner_id: null, is_bye: false, status: 'pending', created_at: '' },
      { id: 'm3', round_id: 'r1', board_number: 3, player1_id: 'p5', player2_id: 'p6', winner_id: null, is_bye: false, status: 'pending', created_at: '' },
      { id: 'm4', round_id: 'r1', board_number: 4, player1_id: 'p7', player2_id: 'p8', winner_id: null, is_bye: false, status: 'pending', created_at: '' },
      { id: 'm5', round_id: 'r1', board_number: 5, player1_id: 'p9', player2_id: 'p10', winner_id: null, is_bye: false, status: 'pending', created_at: '' },
      { id: 'm6', round_id: 'r1', board_number: 6, player1_id: 'p11', player2_id: 'p12', winner_id: null, is_bye: false, status: 'pending', created_at: '' },
    ];

    test('groups 6 matches into 2 iterations when capacity is 4', () => {
      const groups = groupMatchesByIteration(mockMatches, 4);
      assert.strictEqual(groups.length, 2);
      assert.strictEqual(groups[0].iterationIndex, 1);
      assert.strictEqual(groups[0].matches.length, 4);
      assert.strictEqual(groups[0].completedCount, 1);

      assert.strictEqual(groups[1].iterationIndex, 2);
      assert.strictEqual(groups[1].matches.length, 2);
    });

    test('groups 6 matches into 1 iteration when capacity is 6', () => {
      const groups = groupMatchesByIteration(mockMatches, 6);
      assert.strictEqual(groups.length, 1);
      assert.strictEqual(groups[0].iterationIndex, 1);
      assert.strictEqual(groups[0].matches.length, 6);
    });
  });

  describe('filterMatchesBySearch', () => {
    const mockMatchesWithNames: Match[] = [
      {
        id: 'm1',
        round_id: 'r1',
        board_number: 1,
        player1_id: 'p1',
        player2_id: 'p2',
        winner_id: null,
        is_bye: false,
        status: 'pending',
        created_at: '',
        player1: { id: 'p1', tournament_id: 't1', name: 'Rishabh Sharma', status: 'active', created_at: '' },
        player2: { id: 'p2', tournament_id: 't1', name: 'Aarav Patel', status: 'active', created_at: '' },
      },
      {
        id: 'm2',
        round_id: 'r1',
        board_number: 2,
        player1_id: 'p3',
        player2_id: 'p4',
        winner_id: null,
        is_bye: false,
        status: 'pending',
        created_at: '',
        player1: { id: 'p3', tournament_id: 't1', name: 'Vikram Singh', status: 'active', created_at: '' },
        player2: { id: 'p4', tournament_id: 't1', name: 'Siddharth Rao', status: 'active', created_at: '' },
      },
    ];

    test('filters by player name (case insensitive)', () => {
      const results = filterMatchesBySearch(mockMatchesWithNames, 'rishabh');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].board_number, 1);
    });

    test('filters by board number', () => {
      const results = filterMatchesBySearch(mockMatchesWithNames, '2');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0].player1?.name, 'Vikram Singh');
    });

    test('returns all matches when search query is empty', () => {
      const results = filterMatchesBySearch(mockMatchesWithNames, '');
      assert.strictEqual(results.length, 2);
    });
  });
});
