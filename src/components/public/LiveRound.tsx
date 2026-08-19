'use client';

import React from 'react';
import { Round, Match } from '../../lib/types';
import { MatchCard } from '../admin/MatchCard';

interface LiveRoundProps {
  round: Round;
  allRounds?: Round[];
}

export const LiveRound: React.FC<LiveRoundProps> = ({ round }) => {
  const matches = round.matches || [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
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
            Round {round.round_number}
          </span>
        </div>
      </div>

      {matches.length === 0 ? (
        <div className="text-center py-12 text-slate-500 text-sm">
          No matches found for this round.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onSelectWinner={() => {}}
              isReadOnly
            />
          ))}
        </div>
      )}
    </div>
  );
};
