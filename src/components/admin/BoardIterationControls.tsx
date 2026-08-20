'use client';

import React from 'react';
import { BoardCapacity, IterationGroup } from '../../lib/tournament/iteration';
import { Search, Layers, X, LayoutGrid, Play, CheckCircle2, UserCheck, ShieldAlert } from 'lucide-react';

interface BoardIterationControlsProps {
  capacity: BoardCapacity;
  onCapacityChange: (cap: BoardCapacity) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedIteration: number | 'all';
  onSelectIteration: (iter: number | 'all') => void;
  iterationGroups: IterationGroup[];
  totalMatches: number;
  filteredMatchesCount: number;
  onConfirmStartIteration?: (iterIndex: number) => void;
  hideActivePlayers?: boolean;
  onToggleHideActivePlayers?: (hide: boolean) => void;
}

export const BoardIterationControls: React.FC<BoardIterationControlsProps> = ({
  capacity,
  onCapacityChange,
  searchQuery,
  onSearchChange,
  selectedIteration,
  onSelectIteration,
  iterationGroups,
  totalMatches,
  filteredMatchesCount,
  onConfirmStartIteration,
  hideActivePlayers = true,
  onToggleHideActivePlayers,
}) => {
  const currentGroup = typeof selectedIteration === 'number' 
    ? iterationGroups.find((g) => g.iterationIndex === selectedIteration)
    : iterationGroups.find((g) => g.status === 'live' || g.status === 'unstarted');

  return (
    <div className="rounded-2xl bg-slate-900/90 border border-slate-800 p-4 sm:p-5 space-y-4 shadow-lg">
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
            <Search className="h-4 w-4 text-amber-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search player name, board number (e.g. Board 2)..."
            className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500 transition-all font-medium"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Board Capacity Selector */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <LayoutGrid className="w-3.5 h-3.5 text-amber-400" />
            Physical Boards:
          </span>
          <div className="flex bg-slate-950 border border-slate-800 rounded-xl p-1 gap-1">
            <button
              onClick={() => onCapacityChange(4)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                capacity === 4
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              4 Boards
            </button>
            <button
              onClick={() => onCapacityChange(6)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                capacity === 6
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              6 Boards
            </button>
            <button
              onClick={() => onCapacityChange('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                capacity === 'all'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              All
            </button>
          </div>
        </div>
      </div>

      {/* Iteration Filter Tabs & Confirmation Action */}
      {capacity !== 'all' && iterationGroups.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Round Iterations ({iterationGroups.length} Batches)
            </span>
            <div className="flex items-center gap-3 flex-wrap">
              {onToggleHideActivePlayers && (
                <button
                  type="button"
                  onClick={() => onToggleHideActivePlayers(!hideActivePlayers)}
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-lg border transition-all flex items-center gap-1.5 ${
                    hideActivePlayers
                      ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <UserCheck className="w-3 h-3" />
                  {hideActivePlayers ? '✓ Filter Live Players from Next Lists' : 'Show All Player Names'}
                </button>
              )}

              {(selectedIteration !== 'all' || searchQuery) && (
                <button
                  onClick={() => {
                    onSearchChange('');
                    onSelectIteration('all');
                  }}
                  className="text-[10px] font-bold text-amber-400 hover:text-amber-300 flex items-center gap-1 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md transition-all"
                >
                  <X className="w-3 h-3" /> Clear All Filters
                </button>
              )}
              <span className="text-[11px] text-slate-400 font-medium">
                Showing {filteredMatchesCount} of {totalMatches} matches
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onSelectIteration('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 border ${
                selectedIteration === 'all'
                  ? 'bg-slate-800 border-amber-500 text-amber-300 font-bold'
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <span>All Iterations</span>
              <span className="bg-slate-900 border border-slate-700 px-1.5 py-0.5 rounded text-[10px]">
                {totalMatches}
              </span>
            </button>

            {iterationGroups.map((group) => {
              const isSelected = selectedIteration === group.iterationIndex;
              const isGroupDone = group.status === 'complete';
              const isLive = group.status === 'live';

              return (
                <button
                  key={group.iterationIndex}
                  onClick={() => onSelectIteration(group.iterationIndex)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : isLive
                      ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                      : isGroupDone
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  {isLive && <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />}
                  <span>
                    Iter {group.iterationIndex} (B{group.startBoard}–{group.endBoard})
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isGroupDone
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : isLive
                        ? 'bg-amber-950 text-amber-300 border border-amber-800'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {group.completedCount}/{group.totalCount}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Confirm Iteration Action Banner */}
          {currentGroup && onConfirmStartIteration && (
            <div className="mt-2 rounded-xl bg-slate-950 border border-slate-800 p-3.5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-inner">
              <div className="flex items-center gap-2.5">
                {currentGroup.status === 'live' ? (
                  <span className="flex h-3 w-3 relative shrink-0">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
                  </span>
                ) : currentGroup.status === 'complete' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                ) : (
                  <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold text-slate-200">
                    {currentGroup.label}{' '}
                    <span className="font-semibold text-slate-400">
                      ({currentGroup.completedCount} / {currentGroup.totalCount} Done)
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400">
                    {currentGroup.status === 'live'
                      ? '⚡ Iteration in progress. You can still edit any unfinished pairing if needed.'
                      : currentGroup.status === 'complete'
                      ? '✓ All boards in this iteration are completed.'
                      : 'Pending start. Confirm when players take their seats at the boards.'}
                  </div>
                </div>
              </div>

              {currentGroup.status === 'unstarted' && (
                <button
                  type="button"
                  onClick={() => onConfirmStartIteration(currentGroup.iterationIndex)}
                  className="shrink-0 flex items-center gap-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-2 shadow-lg shadow-amber-500/20 active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-slate-950" />
                  Confirm Iteration {currentGroup.iterationIndex} Started
                </button>
              )}
              {currentGroup.status === 'live' && (
                <span className="shrink-0 font-extrabold text-xs text-amber-400 bg-amber-500/10 border border-amber-500/30 px-3 py-1.5 rounded-xl">
                  ⚡ Iteration {currentGroup.iterationIndex} Started & Active
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
