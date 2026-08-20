'use client';

import React from 'react';
import { ViewOrientation } from '../../lib/orientation';
import { LayoutList, GitFork, Grid3X3, Smartphone, Monitor } from 'lucide-react';

interface OrientationToggleProps {
  currentView: ViewOrientation;
  onChangeView: (view: ViewOrientation) => void;
  isLandscape?: boolean;
  matchCount?: number;
}

export const OrientationToggle: React.FC<OrientationToggleProps> = ({
  currentView,
  onChangeView,
  isLandscape = false,
  matchCount = 0,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3 backdrop-blur-md">
      {/* Label and Screen Orientation indicator */}
      <div className="flex items-center gap-2.5 px-2">
        {isLandscape ? (
          <Monitor className="w-4 h-4 text-emerald-400 shrink-0" />
        ) : (
          <Smartphone className="w-4 h-4 text-amber-400 shrink-0" />
        )}
        <div className="text-xs">
          <span className="text-slate-400 font-semibold">View Orientation: </span>
          <span className="text-slate-200 font-bold uppercase tracking-wide">
            {isLandscape ? 'Landscape Mode' : 'Portrait Mode'}
          </span>
          {matchCount > 0 && (
            <span className="text-slate-500 font-normal ml-2">
              ({matchCount} match{matchCount === 1 ? '' : 'es'})
            </span>
          )}
        </div>
      </div>

      {/* View Mode Buttons */}
      <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800/60 self-start sm:self-auto">
        <button
          onClick={() => onChangeView('vertical')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'vertical'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Vertical List / Grid View (Best for Portrait)"
        >
          <LayoutList className="w-3.5 h-3.5" />
          <span>Vertical Cards</span>
        </button>

        <button
          onClick={() => onChangeView('horizontal-tree')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'horizontal-tree'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Horizontal Bracket Tree (Best for Landscape)"
        >
          <GitFork className="w-3.5 h-3.5" />
          <span>Bracket Tree</span>
        </button>

        <button
          onClick={() => onChangeView('compact-grid')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            currentView === 'compact-grid'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
          }`}
          title="Compact Dense Grid"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>Compact Grid</span>
        </button>
      </div>
    </div>
  );
};
