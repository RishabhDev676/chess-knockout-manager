import { Match } from '../types';

export type BoardCapacity = 4 | 6 | 'all';

export interface IterationGroup {
  iterationIndex: number;
  label: string;
  startBoard: number;
  endBoard: number;
  matches: Match[];
  completedCount: number;
  totalCount: number;
  isStarted: boolean;
  status: 'unstarted' | 'live' | 'complete';
}

export function getIterationForBoard(boardNumber: number, capacity: BoardCapacity): {
  iterationIndex: number;
  label: string;
  shortLabel: string;
  startBoard: number;
  endBoard: number;
} {
  if (capacity === 'all') {
    return {
      iterationIndex: 1,
      label: 'All Boards',
      shortLabel: 'All',
      startBoard: 1,
      endBoard: 999,
    };
  }

  const cap = capacity;
  const iterationIndex = Math.ceil(boardNumber / cap);
  const startBoard = (iterationIndex - 1) * cap + 1;
  const endBoard = iterationIndex * cap;
  const label = `Iteration ${iterationIndex} (Boards ${startBoard}–${endBoard})`;
  const shortLabel = `Iter ${iterationIndex} (B${startBoard}-${endBoard})`;

  return {
    iterationIndex,
    label,
    shortLabel,
    startBoard,
    endBoard,
  };
}

export function groupMatchesByIteration(
  matches: Match[],
  capacity: BoardCapacity,
  startedIterations: number[] = [1]
): IterationGroup[] {
  if (!matches || matches.length === 0) return [];

  if (capacity === 'all') {
    const completedCount = matches.filter((m) => m.status === 'complete').length;
    const totalCount = matches.length;
    const isDone = completedCount === totalCount;
    return [
      {
        iterationIndex: 1,
        label: 'All Boards',
        startBoard: 1,
        endBoard: matches.length,
        matches,
        completedCount,
        totalCount,
        isStarted: true,
        status: isDone ? 'complete' : 'live',
      },
    ];
  }

  const map = new Map<number, Match[]>();
  for (const match of matches) {
    const iterIdx = Math.ceil(match.board_number / capacity);
    if (!map.has(iterIdx)) {
      map.set(iterIdx, []);
    }
    map.get(iterIdx)!.push(match);
  }

  const result: IterationGroup[] = [];
  const sortedIterKeys = Array.from(map.keys()).sort((a, b) => a - b);

  for (const iterIdx of sortedIterKeys) {
    const iterMatches = map.get(iterIdx) || [];
    const startBoard = (iterIdx - 1) * capacity + 1;
    const endBoard = iterIdx * capacity;
    const completedCount = iterMatches.filter((m) => m.status === 'complete').length;
    const totalCount = iterMatches.length;
    const isDone = completedCount === totalCount && totalCount > 0;
    const isStarted = startedIterations.includes(iterIdx) || isDone;

    const status: 'unstarted' | 'live' | 'complete' = isDone
      ? 'complete'
      : isStarted
      ? 'live'
      : 'unstarted';

    result.push({
      iterationIndex: iterIdx,
      label: `Iteration ${iterIdx} (Boards ${startBoard}–${endBoard})`,
      startBoard,
      endBoard,
      matches: iterMatches,
      completedCount,
      totalCount,
      isStarted,
      status,
    });
  }

  return result;
}

export function filterMatchesBySearch(matches: Match[], query: string): Match[] {
  if (!query || !query.trim()) return matches;
  const clean = query.trim().toLowerCase();

  return matches.filter((m) => {
    const p1Name = m.player1?.name?.toLowerCase() || '';
    const p2Name = m.player2?.name?.toLowerCase() || '';
    const boardStr = `board ${m.board_number}`.toLowerCase();
    const boardNumStr = m.board_number.toString();
    const statusStr = m.status.toLowerCase();

    return (
      p1Name.includes(clean) ||
      p2Name.includes(clean) ||
      boardStr.includes(clean) ||
      boardNumStr === clean ||
      statusStr.includes(clean)
    );
  });
}

/**
  * Returns set of player IDs currently playing in any active/started iteration (pending matches)
  */
export function getLivePlayerIdsFromMatches(
  matches: Match[],
  capacity: BoardCapacity,
  startedIterations: number[]
): Set<string> {
  const livePlayerIds = new Set<string>();
  if (capacity === 'all') return livePlayerIds;

  for (const m of matches) {
    if (m.status === 'pending') {
      const iterIdx = Math.ceil(m.board_number / capacity);
      if (startedIterations.includes(iterIdx)) {
        if (m.player1_id) livePlayerIds.add(m.player1_id);
        if (m.player2_id) livePlayerIds.add(m.player2_id);
      }
    }
  }

  return livePlayerIds;
}
