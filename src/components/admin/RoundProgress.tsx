'use client';

import React from 'react';
import { Button } from '../ui/Button';
import { PlayCircle, CheckCircle2 } from 'lucide-react';

interface RoundProgressProps {
  completedMatches: number;
  totalMatches: number;
  onGenerateNextRound: () => Promise<void>;
  isLoading?: boolean;
  roundName: string;
  isFinalRound?: boolean;
  hasWinner?: boolean;
}

export const RoundProgress: React.FC<RoundProgressProps> = ({
  completedMatches,
  totalMatches,
  onGenerateNextRound,
  isLoading = false,
  roundName,
  isFinalRound = false,
  hasWinner = false,
}) => {
  const isAllComplete = totalMatches > 0 && completedMatches === totalMatches;
  const percentage = totalMatches > 0 ? Math.round((completedMatches / totalMatches) * 100) : 0;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            CURRENT ROUND STATUS
          </div>
          <h2 className="text-xl font-extrabold text-slate-100 mt-0.5 flex items-center gap-2">
            {roundName}
            {isAllComplete && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs px-2.5 py-0.5 font-bold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Round Complete
              </span>
            )}
          </h2>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-black font-mono text-amber-400">
            {completedMatches} <span className="text-slate-500 font-normal text-lg">/ {totalMatches}</span>
          </div>
          <p className="text-xs text-slate-400 font-medium">Matches Completed</p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
        <div
          className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Next Round Action Area */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800/80">
        <div className="text-xs text-slate-400">
          {!isAllComplete ? (
            <span>
              Complete all remaining <strong className="text-amber-400">{totalMatches - completedMatches}</strong> match(es) to generate the next round.
            </span>
          ) : isFinalRound ? (
            <span className="text-emerald-400 font-semibold">
              🏆 Final match completed! The tournament champion has been crowned!
            </span>
          ) : (
            <span className="text-emerald-400 font-semibold">
              ✓ All matches finished. Ready to generate pairings for the next round.
            </span>
          )}
        </div>

        {!isFinalRound && (
          <Button
            onClick={onGenerateNextRound}
            disabled={!isAllComplete}
            isLoading={isLoading}
            variant={isAllComplete ? 'primary' : 'outline'}
            size="lg"
            className="w-full sm:w-auto font-extrabold shadow-lg shadow-amber-600/20 shrink-0"
          >
            <PlayCircle className="w-5 h-5 mr-2" />
            Generate Next Round
          </Button>
        )}
      </div>
    </div>
  );
};
