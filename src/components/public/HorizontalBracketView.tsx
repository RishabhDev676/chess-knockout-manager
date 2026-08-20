'use client';

import React from 'react';
import { Round, Match } from '../../lib/types';
import { Trophy, CheckCircle2, ChevronRight } from 'lucide-react';

interface HorizontalBracketViewProps {
  allRounds: Round[];
  championName?: string | null;
  runnerUpName?: string | null;
}

export const HorizontalBracketView: React.FC<HorizontalBracketViewProps> = ({
  allRounds,
  championName,
  runnerUpName,
}) => {
  if (!allRounds || allRounds.length === 0) {
    return (
      <div className="text-center py-12 text-slate-500 text-sm">
        No round data available to render visual bracket.
      </div>
    );
  }

  // Sort rounds by round_number ascending
  const sortedRounds = [...allRounds].sort((a, b) => a.round_number - b.round_number);

  return (
    <div className="w-full overflow-x-auto pb-6 pt-2 scrollbar-thin scrollbar-thumb-amber-500/20 scrollbar-track-slate-900">
      <div className="inline-flex min-w-full items-stretch gap-6 sm:gap-8 px-2">
        {sortedRounds.map((round, rIndex) => {
          const matches = round.matches || [];
          const isLastRound = rIndex === sortedRounds.length - 1;

          return (
            <div
              key={round.id}
              className="flex flex-col min-w-[280px] max-w-[320px] shrink-0 bg-slate-900/60 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-2xl relative"
            >
              {/* Round Header */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-400">
                    ROUND {round.round_number}
                  </span>
                  <h3 className="text-base font-black text-slate-100 mt-0.5">
                    {round.round_name}
                  </h3>
                </div>
                <span className="text-[11px] font-bold text-slate-400 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                  {matches.length} Match{matches.length === 1 ? '' : 'es'}
                </span>
              </div>

              {/* Match Cards Column */}
              <div className="flex-1 flex flex-col justify-around space-y-4">
                {matches.length === 0 ? (
                  <div className="text-center py-8 text-slate-500 text-xs italic">
                    Awaiting previous round outcomes...
                  </div>
                ) : (
                  matches.map((match) => (
                    <BracketMatchNode key={match.id} match={match} />
                  ))
                )}
              </div>

              {/* Connector Arrow (unless last round) */}
              {!isLastRound && (
                <div className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-slate-950 border border-slate-800 text-amber-400 shadow-md">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}

        {/* Winner Showcase Node (If champion exists or tournament concluded) */}
        {championName && (
          <div className="flex flex-col min-w-[240px] shrink-0 bg-gradient-to-b from-amber-500/10 to-slate-900/90 border border-amber-500/30 rounded-3xl p-5 shadow-2xl justify-center items-center text-center space-y-4 relative">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500 text-slate-950 font-black shadow-xl shadow-amber-500/30">
              <Trophy className="w-8 h-8" />
            </div>

            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-400">
                TOURNAMENT CHAMPION
              </span>
              <h4 className="text-xl font-black text-white mt-1">
                {championName}
              </h4>
              {runnerUpName && (
                <p className="text-xs text-slate-400 mt-1 font-medium">
                  Runner-up: <strong className="text-slate-300">{runnerUpName}</strong>
                </p>
              )}
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-extrabold">
              <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" /> VICTORY
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface BracketMatchNodeProps {
  match: Match;
}

const BracketMatchNode: React.FC<BracketMatchNodeProps> = ({ match }) => {
  const p1 = match.player1;
  const p2 = match.player2;
  const winner = match.winner;

  const p1Winner = winner && p1 && winner.id === p1.id;
  const p2Winner = winner && p2 && winner.id === p2.id;
  const isBye = match.is_bye;
  const isComplete = match.status === 'complete';

  return (
    <div
      className={`rounded-2xl border transition-all p-3 text-xs space-y-1.5 relative ${
        isComplete
          ? 'bg-slate-950/80 border-slate-800'
          : 'bg-slate-950 border-slate-800/80 hover:border-amber-500/40'
      }`}
    >
      <div className="flex items-center justify-between text-[10px] text-slate-500 font-bold tracking-wider uppercase mb-1">
        <span>BOARD {match.board_number}</span>
        {isBye && <span className="text-blue-400 font-extrabold">BYE</span>}
      </div>

      {isBye ? (
        <div className="flex items-center justify-between bg-blue-950/30 border border-blue-900/40 rounded-xl p-2 font-bold text-slate-200">
          <span>{p1?.name || 'Player'}</span>
          <span className="text-[10px] text-emerald-400 font-semibold">Bye →</span>
        </div>
      ) : (
        <>
          {/* Player 1 Slot */}
          <div
            className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 font-bold transition-colors ${
              p1Winner
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : p2Winner
                ? 'text-slate-500 line-through opacity-60'
                : 'text-slate-200'
            }`}
          >
            <span className="truncate max-w-[170px]">{p1?.name || 'TBD'}</span>
            {p1Winner && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
          </div>

          {/* Player 2 Slot */}
          <div
            className={`flex items-center justify-between rounded-xl px-2.5 py-1.5 font-bold transition-colors ${
              p2Winner
                ? 'bg-emerald-950/60 border border-emerald-500/40 text-emerald-300'
                : p1Winner
                ? 'text-slate-500 line-through opacity-60'
                : 'text-slate-200'
            }`}
          >
            <span className="truncate max-w-[170px]">{p2?.name || 'TBD'}</span>
            {p2Winner && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
          </div>
        </>
      )}
    </div>
  );
};
