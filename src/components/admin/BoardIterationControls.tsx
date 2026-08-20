'use client';

import React from 'react';
import { BoardCapacity, IterationGroup } from '../../lib/tournament/iteration';
import { Search, Layers, X, LayoutGrid } from 'lucide-react';

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
}) => {
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

      {/* Iteration Filter Tabs (if capacity is 4 or 6) */}
      {capacity !== 'all' && iterationGroups.length > 0 && (
        <div className="pt-2 border-t border-slate-800/80 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" />
              Round Iterations ({iterationGroups.length} Batches)
            </span>
            <span className="text-[11px] text-slate-400 font-medium">
              Showing {filteredMatchesCount} of {totalMatches} matches
            </span>
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
              const isGroupDone = group.completedCount === group.totalCount;

              return (
                <button
                  key={group.iterationIndex}
                  onClick={() => onSelectIteration(group.iterationIndex)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-2 border ${
                    isSelected
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                      : isGroupDone
                      ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-900'
                  }`}
                >
                  <span>
                    Iter {group.iterationIndex} (B{group.startBoard}–{group.endBoard})
                  </span>
                  <span
                    className={`px-1.5 py-0.5 rounded text-[10px] font-mono ${
                      isGroupDone
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                        : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}
                  >
                    {group.completedCount}/{group.totalCount}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
