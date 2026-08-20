'use client';

import React, { useState } from 'react';
import { Match } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserX, RefreshCw, MoveHorizontal, AlertCircle, RotateCcw, Search, X, UserPlus, Plus, Gift } from 'lucide-react';
import { markPlayerAbsentForfeit, swapMatchPlayers, swapBoardNumbers, addNewPlayerToMatch, transferBye } from '../../lib/tournament/actions';

interface SwapPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMatch: Match;
  allMatches: Match[];
  onSuccess: () => Promise<void>;
  initialSlot?: 'player1' | 'player2';
  tournamentId?: string;
}

export const SwapPlayerModal: React.FC<SwapPlayerModalProps> = ({
  isOpen,
  onClose,
  targetMatch,
  allMatches,
  onSuccess,
  initialSlot = 'player1',
  tournamentId,
}) => {
  const [activeTab, setActiveTab] = useState<'swap-player' | 'add-player' | 'absent' | 'shift-board' | 'transfer-bye'>('swap-player');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search query for swap modal
  const [swapSearchQuery, setSwapSearchQuery] = useState('');

  // Add new player state
  const [newPlayerName, setNewPlayerName] = useState('');

  // Tab 1: Absent Forfeit State
  const [absentPlayerId, setAbsentPlayerId] = useState<string>(
    targetMatch.player1?.id || ''
  );

  // Tab 2: Swap Player State
  const [selectedSlot, setSelectedSlot] = useState<'player1' | 'player2'>(initialSlot);
  const [selectedOtherMatchId, setSelectedOtherMatchId] = useState<string>('');
  const [selectedOtherSlot, setSelectedOtherSlot] = useState<'player1' | 'player2'>('player1');

  // Tab 3: Shift Board State
  const [selectedBoardMatchId, setSelectedBoardMatchId] = useState<string>('');

  const p1 = targetMatch.player1;
  const p2 = targetMatch.player2;
  const byeMatch = allMatches.find((match) => match.is_bye && match.player1_id && match.status === 'complete');

  // The event head can rearrange every unfinished board. Completed games remain
  // protected so their result history is never changed by a pairing edit.
  const otherPendingMatches = allMatches.filter((m) => {
    if (m.id === targetMatch.id || m.status !== 'pending' || m.is_bye || m.winner_id) return false;
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
    setSelectedSlot(initialSlot);
    setSelectedOtherMatchId('');
    setSelectedOtherSlot('player1');
    setSelectedBoardMatchId('');
    setSwapSearchQuery('');
    setNewPlayerName('');
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
        if (!selectedOtherMatchId) throw new Error('Please select a target player to switch with.');
        await swapMatchPlayers(targetMatch.id, selectedSlot, selectedOtherMatchId, selectedOtherSlot);
      } else if (activeTab === 'add-player') {
        if (!newPlayerName.trim()) throw new Error('Please enter the name of the new player.');
        if (!tournamentId) throw new Error('Tournament ID is required to add a new player.');
        await addNewPlayerToMatch(tournamentId, targetMatch.id, selectedSlot, newPlayerName.trim());
      } else if (activeTab === 'shift-board') {
        if (!selectedBoardMatchId) throw new Error('Please select a board match to swap positions with.');
        await swapBoardNumbers(targetMatch.id, selectedBoardMatchId);
      } else if (activeTab === 'transfer-bye') {
        if (!byeMatch) throw new Error('There is no bye in this round to transfer.');
        await transferBye(byeMatch.id, targetMatch.id, selectedSlot);
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
      title={`Switch Player on Board ${targetMatch.board_number}: ${p1?.name || 'P1'} vs ${p2?.name || 'P2'}`}
    >
      <div className="space-y-5">
        {/* Navigation Tabs */}
        <div className="grid grid-cols-2 gap-1 rounded-xl bg-slate-950 p-1 border border-slate-800 text-xs font-bold sm:grid-cols-5">
          <button
            onClick={() => setActiveTab('swap-player')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'swap-player'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Switch Player
          </button>
          <button
            onClick={() => setActiveTab('add-player')}
            className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'add-player'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            Add Player
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
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'shift-board'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MoveHorizontal className="w-3.5 h-3.5" />
            Shift Board
          </button>
          <button
            onClick={() => setActiveTab('transfer-bye')}
            className={`py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
              activeTab === 'transfer-bye'
                ? 'bg-violet-500/20 text-violet-200 border border-violet-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Gift className="w-3.5 h-3.5" />
            Give Bye
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
              ? 'Direct Player Switch'
              : activeTab === 'add-player'
              ? 'Add New Player to Board'
              : activeTab === 'absent'
              ? 'Mark Forfeit'
              : activeTab === 'transfer-bye'
              ? 'Give Bye'
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

        {/* Tab 2: Switch Player (Default Tab) */}
        {activeTab === 'swap-player' && (
          <div className="space-y-4">
            {/* Slot Selector Banner */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Which Player on Board {targetMatch.board_number} to Switch:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot('player1')}
                  className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all ${
                    selectedSlot === 'player1'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] text-slate-500">Player 1</div>
                  <div className="truncate text-sm">{p1?.name || 'P1'}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlot('player2')}
                  className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all ${
                    selectedSlot === 'player2'
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] text-slate-500">Player 2</div>
                  <div className="truncate text-sm">{p2?.name || 'P2'}</div>
                </button>
              </div>
            </div>

            {/* Search Input in Swap Modal */}
            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Search Player to Switch With:
              </label>
              <div className="relative">
                <Search className="w-4 h-4 text-amber-400 absolute left-3 top-2.5 pointer-events-none" />
                <input
                  type="text"
                  value={swapSearchQuery}
                  onChange={(e) => setSwapSearchQuery(e.target.value)}
                  placeholder="Type player name or board number (e.g. Board 3)..."
                  className="w-full rounded-xl bg-slate-950 border border-slate-800 pl-9 pr-8 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-amber-500 focus:outline-none"
                />
                {swapSearchQuery && (
                  <button
                    onClick={() => setSwapSearchQuery('')}
                    className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-200"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Candidate Players Cards (1-Click Switch Selector) */}
            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                Click a Candidate Player to Switch ({filteredSwapMatches.length * 2} Players Available):
              </label>
              <p className="mb-2 text-[11px] text-slate-500">
                Every unfinished board is available, including boards already in the current iteration.
              </p>
              <div className="max-h-48 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950 p-2 space-y-1.5">
                {filteredSwapMatches.length === 0 ? (
                  <div className="text-center py-6 text-slate-500 text-xs">
                    No pending candidate players found.
                  </div>
                ) : (
                  filteredSwapMatches.map((m) => {
                    const isP1Selected = selectedOtherMatchId === m.id && selectedOtherSlot === 'player1';
                    const isP2Selected = selectedOtherMatchId === m.id && selectedOtherSlot === 'player2';

                    return (
                      <div
                        key={m.id}
                        className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-2 text-xs flex items-center justify-between gap-2"
                      >
                        <span className="font-extrabold text-amber-400 text-[10px] w-14 shrink-0">
                          BOARD {m.board_number}
                        </span>

                        <div className="flex-1 grid grid-cols-2 gap-2">
                          {m.player1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOtherMatchId(m.id);
                                setSelectedOtherSlot('player1');
                              }}
                              className={`px-2.5 py-1.5 rounded-md border text-left font-bold transition-all truncate flex items-center justify-between ${
                                isP1Selected
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-850'
                              }`}
                            >
                              <span className="truncate">{m.player1.name}</span>
                              {isP1Selected && <span className="text-[9px] font-black uppercase ml-1">✓</span>}
                            </button>
                          )}

                          {m.player2 && (
                            <button
                              type="button"
                              onClick={() => {
                                setSelectedOtherMatchId(m.id);
                                setSelectedOtherSlot('player2');
                              }}
                              className={`px-2.5 py-1.5 rounded-md border text-left font-bold transition-all truncate flex items-center justify-between ${
                                isP2Selected
                                  ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md'
                                  : 'bg-slate-950 border-slate-800 text-slate-200 hover:border-amber-500/50 hover:bg-slate-850'
                              }`}
                            >
                              <span className="truncate">{m.player2.name}</span>
                              {isP2Selected && <span className="text-[9px] font-black uppercase ml-1">✓</span>}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* LIVE SWAP PREVIEW BANNER */}
            {selectedOtherMatch && playerA && playerB && (
              <div className="rounded-xl bg-amber-950/40 border border-amber-500/40 p-3.5 space-y-2">
                <div className="text-[11px] font-extrabold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                  <RefreshCw className="w-3.5 h-3.5" /> LIVE SWITCH PREVIEW
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

        {/* Tab 4: Add New Player directly to Board */}
        {activeTab === 'add-player' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Create a new player in the tournament and place them directly onto Board {targetMatch.board_number}.
            </p>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Select Slot to Replace / Fill:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedSlot('player1')}
                  className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all ${
                    selectedSlot === 'player1'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] text-slate-500">Player 1 Slot</div>
                  <div className="truncate text-sm">{p1?.name || 'P1'}</div>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedSlot('player2')}
                  className={`p-2.5 rounded-xl border text-left font-bold text-xs transition-all ${
                    selectedSlot === 'player2'
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="text-[10px] text-slate-500">Player 2 Slot</div>
                  <div className="truncate text-sm">{p2?.name || 'P2'}</div>
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                New Player Name:
              </label>
              <input
                type="text"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                placeholder="Enter full name (e.g. Charlie Brown)..."
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3.5 py-2.5 text-xs text-slate-100 placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {newPlayerName.trim() && (
              <div className="rounded-xl bg-emerald-950/40 border border-emerald-500/40 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <Plus className="w-4 h-4 shrink-0 text-emerald-400" />
                <div>
                  Will create <strong>&quot;{newPlayerName.trim()}&quot;</strong> and place them on Board {targetMatch.board_number} ({selectedSlot === 'player1' ? 'P1' : 'P2'}).
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'transfer-bye' && (
          <div className="space-y-4">
            {byeMatch?.player1 ? (
              <>
                <p className="text-xs leading-relaxed text-slate-300">
                  Give the automatic bye to either player on this unfinished board. <strong className="text-violet-300">{byeMatch.player1.name}</strong> will take their place, so every player stays paired exactly once.
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {(['player1', 'player2'] as const).map((slot) => {
                    const player = slot === 'player1' ? p1 : p2;
                    return (
                      <button
                        key={slot}
                        type="button"
                        disabled={!player}
                        onClick={() => setSelectedSlot(slot)}
                        className={`rounded-xl border p-3 text-left text-xs font-bold transition-all ${
                          selectedSlot === slot
                            ? 'border-violet-400 bg-violet-500/20 text-violet-200'
                            : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-violet-500/50'
                        }`}
                      >
                        <span className="block text-[10px] text-slate-500">Give bye to</span>
                        <span className="block truncate text-sm">{player?.name || 'Empty slot'}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-xl border border-slate-800 bg-slate-950 p-4 text-center text-xs text-slate-400">
                This round has no automatic bye to transfer.
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
                : activeTab === 'add-player'
                ? 'Add & Assign Player'
                : activeTab === 'transfer-bye'
                ? 'Confirm Bye Assignment'
                : 'Confirm Board Shift'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
