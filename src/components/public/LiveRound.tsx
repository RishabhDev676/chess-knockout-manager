'use client';

import React, { useState } from 'react';
import { Round } from '../../lib/types';
import { MatchCard } from '../admin/MatchCard';
import { BoardIterationControls } from '../admin/BoardIterationControls';
import { HorizontalBracketView } from './HorizontalBracketView';
import { ViewOrientation } from '../../lib/orientation';
import {
  BoardCapacity,
  groupMatchesByIteration,
  filterMatchesBySearch,
  getIterationForBoard,
} from '../../lib/tournament/iteration';

interface LiveRoundProps {
  round: Round;
  allRounds?: Round[];
  viewMode?: ViewOrientation;
  championName?: string | null;
  runnerUpName?: string | null;
}

export const LiveRound: React.FC<LiveRoundProps> = ({
  round,
  allRounds = [],
  viewMode = 'vertical',
  championName,
  runnerUpName,
}) => {
  const [capacity, setCapacity] = useState<BoardCapacity>(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIteration, setSelectedIteration] = useState<number | 'all'>('all');

  const rawMatches = round.matches || [];

  // Filter matches by Search
  const searchedMatches = filterMatchesBySearch(rawMatches, searchQuery);

  // Group by Iteration
  const iterationGroups = groupMatchesByIteration(searchedMatches, capacity);

  // Filter by Selected Iteration
  const displayedMatches = searchedMatches.filter((m) => {
    if (selectedIteration === 'all' || capacity === 'all') return true;
    const iterIdx = Math.ceil(m.board_number / capacity);
    return iterIdx === selectedIteration;
  });

  if (viewMode === 'horizontal-tree' && allRounds.length > 0) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              HORIZONTAL BRACKET TREE
            </span>
            <h2 className="text-xl font-black text-slate-100 mt-0.5">
              Visual Knockout Tournament Overview
            </h2>
          </div>
        </div>
        <HorizontalBracketView
          allRounds={allRounds}
          championName={championName}
          runnerUpName={runnerUpName}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            LIVE PAIRINGS & RESULTS
          </span>
          <h2 className="text-2xl font-black text-slate-100 mt-0.5">
            {round.round_name}
          </h2>
        </div>
        <div className="text-right">
          <span className="text-xs text-slate-400 font-medium">
            Round {round.round_number} &bull; Total {rawMatches.length} Matches
          </span>
        </div>
      </div>

      {/* Public Search & Iteration Bar */}
      <BoardIterationControls
        capacity={capacity}
        onCapacityChange={(cap) => {
          setCapacity(cap);
          setSelectedIteration('all');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        selectedIteration={selectedIteration}
        onSelectIteration={setSelectedIteration}
        iterationGroups={iterationGroups}
        totalMatches={rawMatches.length}
        filteredMatchesCount={displayedMatches.length}
      />

      {displayedMatches.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm rounded-2xl bg-slate-900 border border-slate-800">
          No matches found matching your search query or iteration filter.
        </div>
      ) : (
        <div
          className={`grid gap-4 ${
            viewMode === 'compact-grid'
              ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
              : 'grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'
          }`}
        >
          {displayedMatches.map((match) => {
            const iterInfo = getIterationForBoard(match.board_number, capacity);

            return (
              <MatchCard
                key={match.id}
                match={match}
                iterationTag={capacity !== 'all' ? iterInfo.shortLabel : undefined}
                onSelectWinner={() => {}}
                isReadOnly
                compact={viewMode === 'compact-grid'}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
