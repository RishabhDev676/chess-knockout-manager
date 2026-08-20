'use client';

import React from 'react';
import { Match } from '../../lib/types';
import { Trophy, RotateCcw, RefreshCw } from 'lucide-react';
import { Badge } from '../ui/Badge';

interface MatchCardProps {
  match: Match;
  onSelectWinner: (match: Match, winnerId: string, winnerName: string, loserId: string | null, loserName: string | null) => void;
  onEditResult?: (match: Match) => void;
  onManageMatch?: (match: Match, targetSlot?: 'player1' | 'player2') => void;
  iterationTag?: string;
  isReadOnly?: boolean;
  compact?: boolean;
}

export const MatchCard: React.FC<MatchCardProps> = ({
  match,
  onSelectWinner,
  onEditResult,
  onManageMatch,
  iterationTag,
  isReadOnly = false,
  compact = false,
}) => {
  const p1 = match.player1;
  const p2 = match.player2;
  const isComplete = match.status === 'complete';
  const isBye = match.is_bye;

  const winner = match.winner;
  const p1IsWinner = winner && p1 && winner.id === p1.id;
  const p2IsWinner = winner && p2 && winner.id === p2.id;

  if (compact) {
    return (
      <div
        className={`rounded-xl border p-3 transition-all space-y-2 text-xs ${
          isComplete
            ? 'border-slate-800 bg-slate-900/80 shadow-sm'
            : 'border-slate-800 bg-slate-900 shadow-md hover:border-amber-500/40'
        }`}
      >
        <div className="flex items-center justify-between font-extrabold text-[10px] text-amber-400 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span>BOARD {match.board_number}</span>
            {iterationTag && (
              <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-1.5 py-0.5 rounded text-[9px] font-semibold">
                {iterationTag}
              </span>
            )}
          </div>
          {isBye ? (
            <span className="text-blue-400 font-bold">BYE</span>
          ) : isComplete ? (
            <span className="text-emerald-400 font-bold">✓ DONE</span>
          ) : (
            <span className="text-amber-400/80">PENDING</span>
          )}
        </div>

        {isBye ? (
          <div className="flex items-center justify-between rounded-lg bg-blue-950/40 p-2 font-bold text-slate-200">
            <span className="truncate">{p1?.name || 'Player'}</span>
            <span className="text-[10px] text-emerald-400">Bye →</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div
              className={`flex items-center justify-between rounded-lg p-2 font-bold transition-all ${
                p1IsWinner
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : p2IsWinner
                  ? 'text-slate-500 line-through'
                  : 'bg-slate-950 text-slate-100'
              }`}
            >
              <span className="truncate max-w-[110px] sm:max-w-[140px]">{p1?.name || 'P1'}</span>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {!isComplete && !isReadOnly && onManageMatch && (
                  <button
                    onClick={() => onManageMatch(match, 'player1')}
                    title="Switch Player 1"
                    className="rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[9px] px-1.5 py-0.5"
                  >
                    Switch
                  </button>
                )}
                {!isComplete && !isReadOnly && p1 && p2 && (
                  <button
                    onClick={() => onSelectWinner(match, p1.id, p1.name, p2.id, p2.name)}
                    className="rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-1"
                  >
                    WIN
                  </button>
                )}
              </div>
              {p1IsWinner && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
            </div>

            <div
              className={`flex items-center justify-between rounded-lg p-2 font-bold transition-all ${
                p2IsWinner
                  ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-500/30'
                  : p1IsWinner
                  ? 'text-slate-500 line-through'
                  : 'bg-slate-950 text-slate-100'
              }`}
            >
              <span className="truncate max-w-[110px] sm:max-w-[140px]">{p2?.name || 'P2'}</span>
              <div className="flex items-center gap-1 shrink-0 ml-1">
                {!isComplete && !isReadOnly && onManageMatch && (
                  <button
                    onClick={() => onManageMatch(match, 'player2')}
                    title="Switch Player 2"
                    className="rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-bold text-[9px] px-1.5 py-0.5"
                  >
                    Switch
                  </button>
                )}
                {!isComplete && !isReadOnly && p1 && p2 && (
                  <button
                    onClick={() => onSelectWinner(match, p2.id, p2.name, p1.id, p1.name)}
                    className="rounded bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-[10px] px-2 py-1"
                  >
                    WIN
                  </button>
                )}
              </div>
              {p2IsWinner && <Trophy className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-1" />}
            </div>

            {!isReadOnly && !isBye && (
              <div className="pt-1">
                {!isComplete && onManageMatch && (
                  <button
                    onClick={() => onManageMatch(match)}
                    className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 px-2 py-1 rounded-md transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3" /> Board Options
                  </button>
                )}
                {isComplete && onEditResult && (
                  <button
                    onClick={() => onEditResult(match)}
                    className="w-full flex items-center justify-center gap-1 text-[10px] font-bold text-rose-300 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/50 px-2 py-1 rounded-md transition-all active:scale-95"
                  >
                    <RotateCcw className="w-3 h-3 text-rose-400" /> Clear Result
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

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
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs tracking-wider uppercase text-amber-400">
            BOARD {match.board_number}
          </span>
          {iterationTag && (
            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-full text-[10px] font-bold">
              {iterationTag}
            </span>
          )}
        </div>
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

              <div className="flex items-center gap-2">
                {!isComplete && !isReadOnly && onManageMatch && (
                  <button
                    onClick={() => onManageMatch(match, 'player1')}
                    title="Switch Player 1 with another player"
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" /> Switch
                  </button>
                )}

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

              <div className="flex items-center gap-2">
                {!isComplete && !isReadOnly && onManageMatch && (
                  <button
                    onClick={() => onManageMatch(match, 'player2')}
                    title="Switch Player 2 with another player"
                    className="flex items-center gap-1 text-[11px] font-bold text-amber-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 px-2.5 py-1.5 rounded-lg transition-all active:scale-95"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" /> Switch
                  </button>
                )}

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
          </div>
        )}

        {/* Footer Actions */}
        {!isReadOnly && (
          <div className="pt-3 flex items-center justify-between gap-3 border-t border-slate-850">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
              {isComplete ? 'Result Recorded' : 'Board Actions'}
            </span>
            <div className="flex items-center gap-2">
              {!isComplete && !isBye && onManageMatch && (
                <button
                  onClick={() => onManageMatch(match)}
                  className="flex items-center gap-1.5 text-xs font-bold text-amber-300 bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-400" /> Board Options
                </button>
              )}
              {isComplete && !isBye && onEditResult && (
                <button
                  onClick={() => onEditResult(match)}
                  className="flex items-center gap-1.5 text-xs font-bold text-rose-300 bg-rose-950/50 hover:bg-rose-900/60 border border-rose-800/60 px-3 py-1.5 rounded-xl shadow-sm transition-all active:scale-95"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-400" /> Clear / Reset Result
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
