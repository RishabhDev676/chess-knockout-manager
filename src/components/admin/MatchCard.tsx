'use client';

import React from 'react';
import { Match } from '../../lib/types';
import { Trophy, Edit2, AlertCircle } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface MatchCardProps {
  match: Match;
  onSelectWinner: (match: Match, winnerId: string, winnerName: string, loserId: string | null, loserName: string | null) => void;
  onEditResult?: (match: Match) => void;
  isReadOnly?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onSelectWinner,
  onEditResult,
  isReadOnly = false,
}) => {
  const p1 = match.player1;
  const p2 = match.player2;
  const isComplete = match.status === 'complete';
  const isBye = match.is_bye;

  const winner = match.winner;
  const p1IsWinner = winner && p1 && winner.id === p1.id;
  const p2IsWinner = winner && p2 && winner.id === p2.id;

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all ${
        isComplete
          ? 'border-slate-800 bg-slate-900/90 shadow-md'
          : 'border-slate-800 bg-slate-900 shadow-xl hover:border-amber-500/40'
      }`}
    >
      {/* Header Bar */}
      <div className="flex items-center justify-between border-b border-slate-800/80 bg-slate-950/60 px-4 py-2.5">
        <span className="font-extrabold text-xs tracking-wider uppercase text-amber-400">
          BOARD {match.board_number}
        </span>
        <div>
          {isBye ? (
            <Badge variant="bye">BYE MATCH</Badge>
          ) : isComplete ? (
            <Badge variant="complete">✓ COMPLETED</Badge>
          ) : (
            <Badge variant="pending">PENDING RESULT</Badge>
          )}
        </div>
      </div>

      {/* Match Content */}
      <div className="p-4 sm:p-5 space-y-4">
        {isBye ? (
          /* Bye Match Display */
          <div className="flex items-center justify-between rounded-xl bg-blue-950/30 border border-blue-900/40 p-4">
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-blue-400">
                AUTOMATIC BYE
              </div>
              <div className="text-base font-bold text-slate-100 mt-0.5">
                {p1?.name || 'Player'}
              </div>
            </div>
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/60 px-3 py-1 rounded-lg">
              Auto-Advanced →
            </span>
          </div>
        ) : (
          /* Standard Match Players */
          <div className="grid grid-cols-1 gap-3">
            {/* Player 1 Slot */}
            <div
              className={`flex items-center justify-between rounded-xl p-3.5 border transition-all ${
                p1IsWinner
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : p2IsWinner
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {p1IsWinner && <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />}
                <div>
                  <div className={`font-bold text-sm sm:text-base ${p1IsWinner ? 'text-emerald-300 font-extrabold' : p2IsWinner ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                    {p1?.name || 'Player 1'}
                  </div>
                  {p2IsWinner && (
                    <span className="text-[10px] text-rose-400 font-medium">
                      Eliminated
                    </span>
                  )}
                </div>
              </div>

              {!isComplete && !isReadOnly && p1 && p2 && (
                <button
                  onClick={() => onSelectWinner(match, p1.id, p1.name, p2.id, p2.name)}
                  className="rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-3.5 py-2 transition-all active:scale-95 shadow-md shadow-amber-600/20"
                >
                  {p1.name} WON
                </button>
              )}
              {p1IsWinner && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  ✓ Winner
                </span>
              )}
            </div>

            {/* VS Divider */}
            <div className="relative text-center my-0.5">
              <span className="bg-slate-900 text-slate-500 px-3 text-[11px] font-black tracking-widest uppercase">
                VS
              </span>
            </div>

            {/* Player 2 Slot */}
            <div
              className={`flex items-center justify-between rounded-xl p-3.5 border transition-all ${
                p2IsWinner
                  ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                  : p1IsWinner
                  ? 'bg-slate-950/40 border-slate-800 opacity-60'
                  : 'bg-slate-950 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-3">
                {p2IsWinner && <Trophy className="w-5 h-5 text-emerald-400 shrink-0" />}
                <div>
                  <div className={`font-bold text-sm sm:text-base ${p2IsWinner ? 'text-emerald-300 font-extrabold' : p1IsWinner ? 'text-slate-400 line-through' : 'text-slate-100'}`}>
                    {p2?.name || 'Player 2'}
                  </div>
                  {p1IsWinner && (
                    <span className="text-[10px] text-rose-400 font-medium">
                      Eliminated
                    </span>
                  )}
                </div>
              </div>

              {!isComplete && !isReadOnly && p1 && p2 && (
                <button
                  onClick={() => onSelectWinner(match, p2.id, p2.name, p1.id, p1.name)}
                  className="rounded-lg bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs px-3.5 py-2 transition-all active:scale-95 shadow-md shadow-amber-600/20"
                >
                  {p2.name} WON
                </button>
              )}
              {p2IsWinner && (
                <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
                  ✓ Winner
                </span>
              )}
            </div>
          </div>
        )}

        {/* Footer: Edit Button if Complete and Admin */}
        {isComplete && !isBye && !isReadOnly && onEditResult && (
          <div className="pt-2 flex justify-end">
            <button
              onClick={() => onEditResult(match)}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 hover:text-amber-400 transition-colors"
            >
              <Edit2 className="w-3 h-3" /> Edit Result
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
