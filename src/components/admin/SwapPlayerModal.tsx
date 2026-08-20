'use client';

import React, { useState } from 'react';
import { Match } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserX, RefreshCw, MoveHorizontal, AlertCircle, RotateCcw, Search, X } from 'lucide-react';
import { markPlayerAbsentForfeit, swapMatchPlayers, swapBoardNumbers } from '../../lib/tournament/actions';

interface SwapPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMatch: Match;
  allMatches: Match[];
  onSuccess: () => Promise<void>;
  livePlayerIds?: Set<string>;
}

export const SwapPlayerModal: React.FC<SwapPlayerModalProps> = ({
  isOpen,
  onClose,
  targetMatch,
  allMatches,
  onSuccess,
  livePlayerIds,
}) => {
  const [activeTab, setActiveTab] = useState<'swap-player' | 'absent' | 'shift-board'>('swap-player');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search query for swap modal
  const [swapSearchQuery, setSwapSearchQuery] = useState('');

  // Tab 1: Absent Forfeit State
  const [absentPlayerId, setAbsentPlayerId] = useState<string>(
    targetMatch.player1?.id || ''
  );

  // Tab 2: Swap Player State
  const [selectedSlot, setSelectedSlot] = useState<'player1' | 'player2'>('player1');
  const [selectedOtherMatchId, setSelectedOtherMatchId] = useState<string>('');
  const [selectedOtherSlot, setSelectedOtherSlot] = useState<'player1' | 'player2'>('player1');

  // Tab 3: Shift Board State
  const [selectedBoardMatchId, setSelectedBoardMatchId] = useState<string>('');

  const p1 = targetMatch.player1;
  const p2 = targetMatch.player2;

  // Strictly filter pending matches (excluding matches that are completed, BYEs, have winners, or players actively playing)
  const otherPendingMatches = allMatches.filter((m) => {
    if (m.id === targetMatch.id || m.status !== 'pending' || m.is_bye || m.winner_id) return false;
    if (livePlayerIds && livePlayerIds.size > 0) {
      if (m.player1_id && livePlayerIds.has(m.player1_id)) return false;
      if (m.player2_id && livePlayerIds.has(m.player2_id)) return false;
    }
    return true;
  });

  // Search filtered matches for swap
  const filteredSwapMatches = otherPendingMatches.filter((m) => {
    if (!swapSearchQuery.trim()) return true;
    const q = swapSearchQuery.trim().toLowerCase();
    const p1Name = m.player1?.name?.toLowerCase() || '';
    const p2Name = m.player2?.name?.toLowerCase() || '';
    const boardStr = `board ${m.board_number}`.toLowerCase();
    return p1Name.includes(q) || p2Name.includes(q) || boardStr.includes(q) || m.board_number.toString() === q;
  });

  const handleResetSelections = () => {
    setAbsentPlayerId(targetMatch.player1?.id || '');
    setSelectedSlot('player1');
    setSelectedOtherMatchId('');
    setSelectedOtherSlot('player1');
    setSelectedBoardMatchId('');
    setSwapSearchQuery('');
    setErrorMsg(null);
  };

  // Compute selected player details for live swap preview
  const selectedOtherMatch = otherPendingMatches.find((m) => m.id === selectedOtherMatchId);
  const playerA = selectedSlot === 'player1' ? p1 : p2;
  const playerB = selectedOtherMatch
    ? selectedOtherSlot === 'player1'
      ? selectedOtherMatch.player1
      : selectedOtherMatch.player2
    : null;

  // Handle Action Submit
  const handleConfirmAction = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      if (activeTab === 'absent') {
        if (!absentPlayerId) throw new Error('Please select which player is absent.');
        const presentId = absentPlayerId === p1?.id ? p2?.id : p1?.id;
        if (!presentId) throw new Error('Opponent player is missing.');

        await markPlayerAbsentForfeit(targetMatch.id, absentPlayerId, presentId);
      } else if (activeTab === 'swap-player') {
        if (!selectedOtherMatchId) throw new Error('Please select a target match to swap player with.');
        await swapMatchPlayers(targetMatch.id, selectedSlot, selectedOtherMatchId, selectedOtherSlot);
      } else if (activeTab === 'shift-board') {
        if (!selectedBoardMatchId) throw new Error('Please select a board match to swap positions with.');
        await swapBoardNumbers(targetMatch.id, selectedBoardMatchId);
      }

      await onSuccess();
      onClose();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Action failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Manage Board ${targetMatch.board_number}: ${p1?.name || 'P1'} vs ${p2?.name || 'P2'}`}
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="flex rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold gap-1">
          <button
            onClick={() => setActiveTab('swap-player')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'swap-player'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Swap Players
          </button>
          <button
            onClick={() => setActiveTab('absent')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'absent'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserX className="w-3.5 h-3.5" />
            Player Absent
          </button>
          <button
            onClick={() => setActiveTab('shift-board')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'shift-board'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            Shift Board
          </button>
        </div>

        {errorMsg && (
          <div className="rounded-xl bg-rose-950/60 border border-rose-800/60 p-3 text-xs font-medium text-rose-200 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>{errorMsg}</div>
          </div>
        )}

        {/* Tab Header with Clear Selection Button */}
        <div className="flex items-center justify-between pt-1">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
            {activeTab === 'swap-player'
              ? 'Swap Player Pairings'
              : activeTab === 'absent'
              ? 'Mark Forfeit'
              : 'Rearrange Board Order'}
          </span>
          <button
            type="button"
            onClick={handleResetSelections}
            className="flex items-center gap-1 text-[11px] font-bold text-slate-400 hover:text-amber-400 transition-colors"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" /> Clear Selection
          </button>
        </div>

        {/* Tab 2: Swap Players (Default Tab) */}
        {activeTab === 'swap-player' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Swap an unavailable player from this match with an available pending player from another match.
            </p>

            {/* Search Input in Swap Modal */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Search Pending Players / Boards to Swap With:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={swapSearchQuery}
                  onChange={(e) => setSwapSearchQuery(e.target.value)}
                  placeholder="Type player name or board number (e.g. Board 3)..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
                {swapSearchQuery && (
                  <button
                    onClick={() => setSwapSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Which Player from Board {targetMatch.board_number}?
                </label>
                <select
                  value={selectedSlot}
                  onChange={(e) => setSelectedSlot(e.target.value as 'player1' | 'player2')}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="player1">P1: {p1?.name || 'Player 1'}</option>
                  <option value="player2">P2: {p2?.name || 'Player 2'}</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Swap With Match:
                </label>
                <select
                  value={selectedOtherMatchId}
                  onChange={(e) => setSelectedOtherMatchId(e.target.value)}
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 font-medium focus:border-amber-500 focus:outline-none"
                >
                  <option value="">-- Select Pending Match ({filteredSwapMatches.length}) --</option>
                  {filteredSwapMatches.map((m) => (
                    <option key={m.id} value={m.id}>
                      Board {m.board_number}: {m.player1?.name || 'P1'} vs {m.player2?.name || 'P2'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedOtherMatchId && (
              <div>
                <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Which Player from the other match?
                </label>
                {(() => {
                  const otherMatch = otherPendingMatches.find((m) => m.id === selectedOtherMatchId);
                  return (
                    <select
                      value={selectedOtherSlot}
                      onChange={(e) => setSelectedOtherSlot(e.target.value as 'player1' | 'player2')}
                      className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 font-medium focus:border-amber-500 focus:outline-none"
                    >
                      <option value="player1">
                        P1: {otherMatch?.player1?.name || 'Player 1'}
                      </option>
                      <option value="player2">
                        P2: {otherMatch?.player2?.name || 'Player 2'}
                      </option>
                    </select>
                  );
                })()}
              </div>
            )}

            {/* LIVE SWAP PREVIEW BANNER */}
            {selectedOtherMatch && playerA && playerB && (
              <div className="rounded-xl bg-amber-950/40 border border-amber-500/40 p-3.5 space-y-2">
                <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> LIVE SWAP PREVIEW
                </div>
                <div className="grid grid-cols-2 gap-2 text-slate-100 font-bold text-xs">
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block uppercase">
                      Board {targetMatch.board_number}
                    </span>
                    <div className="text-amber-300 truncate">{playerA.name}</div>
                    <span className="text-slate-400 text-[10px] block font-normal">
                      ➔ Moves to Board {selectedOtherMatch.board_number}
                    </span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 space-y-0.5">
                    <span className="text-[10px] text-slate-500 block uppercase">
                      Board {selectedOtherMatch.board_number}
                    </span>
                    <div className="text-amber-300 truncate">{playerB.name}</div>
                    <span className="text-slate-400 text-[10px] block font-normal">
                      ➔ Moves to Board {targetMatch.board_number}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Shift Board Iteration */}
        {activeTab === 'shift-board' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Swap board numbers with another pending match so this match moves to another physical board iteration.
            </p>

            {/* Search Input in Shift Board Modal */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Search Target Board / Player:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={swapSearchQuery}
                  onChange={(e) => setSwapSearchQuery(e.target.value)}
                  placeholder="Type player name or board number..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-8 py-2 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
                {swapSearchQuery && (
                  <button
                    onClick={() => setSwapSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Swap Board {targetMatch.board_number} With:
              </label>
              <select
                value={selectedBoardMatchId}
                onChange={(e) => setSelectedBoardMatchId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 font-medium focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Select Target Match ({filteredSwapMatches.length}) --</option>
                {filteredSwapMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    Board {m.board_number}: {m.player1?.name || 'P1'} vs {m.player2?.name || 'P2'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <Button variant="ghost" onClick={handleResetSelections} size="sm" className="text-slate-400 hover:text-white">
            <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset Choices
          </Button>

          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button
              variant={activeTab === 'absent' ? 'danger' : 'primary'}
              onClick={handleConfirmAction}
              isLoading={loading}
            >
              {activeTab === 'absent'
                ? 'Confirm Absence Forfeit'
                : activeTab === 'swap-player'
                ? 'Confirm Player Swap'
                : 'Confirm Board Shift'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
