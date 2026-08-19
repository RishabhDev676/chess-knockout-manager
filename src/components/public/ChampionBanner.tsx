'use client';

import React from 'react';
import { Player } from '../../lib/types';
import { Trophy, Award, Sparkles } from 'lucide-react';

interface ChampionBannerProps {
  champion: Player | null;
  runnerUp: Player | null;
  tournamentName: string;
}

export const ChampionBanner: React.FC<ChampionBannerProps> = ({
  champion,
  runnerUp,
  tournamentName,
}) => {
  if (!champion) return null;

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-950 via-slate-900 to-amber-950/80 border-2 border-amber-500/50 p-8 sm:p-12 text-center shadow-2xl shadow-amber-500/10 my-8">
      {/* Background Glow Effects */}
      <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Trophy Header */}
      <div className="relative z-10 space-y-4">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-500 to-amber-300 text-slate-950 shadow-xl shadow-amber-500/30 animate-bounce">
          <Trophy className="w-10 h-10 stroke-[2.5]" />
        </div>

        <div className="space-y-1">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-black uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5" /> TOURNAMENT CHAMPION
          </span>
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {tournamentName}
          </h2>
        </div>

        {/* Champion Name */}
        <div className="py-2">
          <h1 className="text-3xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100 tracking-tight">
            {champion.name}
          </h1>
          <p className="text-xs sm:text-sm text-emerald-400 font-bold mt-1">
            🏆 1st Place — Undefeated Knockout Champion
          </p>
        </div>

        {/* Runner Up */}
        {runnerUp && (
          <div className="pt-6 border-t border-slate-800/80 max-w-sm mx-auto flex items-center justify-center gap-3">
            <Award className="w-5 h-5 text-slate-400" />
            <div className="text-left">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                RUNNER-UP (2nd Place)
              </span>
              <div className="text-base font-extrabold text-slate-200">
                {runnerUp.name}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
