'use client';

import React, { useState } from 'react';
import { Match } from '../../lib/types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { UserX, RefreshCw, MoveHorizontal, AlertCircle } from 'lucide-react';
import { markPlayerAbsentForfeit, swapMatchPlayers, swapBoardNumbers } from '../../lib/tournament/actions';

interface SwapPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetMatch: Match;
  allMatches: Match[];
  onSuccess: () => Promise<void>;
}

export const SwapPlayerModal: React.FC<SwapPlayerModalProps> = ({
  isOpen,
  onClose,
  targetMatch,
  allMatches,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'absent' | 'swap-player' | 'shift-board'>('absent');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

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

  // Filter other pending matches
  const otherPendingMatches = allMatches.filter(
    (m) => m.id !== targetMatch.id && m.status === 'pending' && !m.is_bye
  );

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

        {/* Tab 1: Absent Forfeit */}
        {activeTab === 'absent' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              If a player is not available or absent right now, you can grant an immediate forfeit victory to their opponent.
            </p>

            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                Select Absent Player:
              </label>
              <div className="grid grid-cols-2 gap-3">
                {p1 && (
                  <button
                    type="button"
                    onClick={() => setAbsentPlayerId(p1.id)}
                    className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                      absentPlayerId === p1.id
                        ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500">Player 1</div>
                    <div className="text-sm truncate mt-0.5">{p1.name}</div>
                  </button>
                )}
                {p2 && (
                  <button
                    type="button"
                    onClick={() => setAbsentPlayerId(p2.id)}
                    className={`p-3 rounded-xl border text-left font-bold text-xs transition-all ${
                      absentPlayerId === p2.id
                        ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                        : 'bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="text-[10px] text-slate-500">Player 2</div>
                    <div className="text-sm truncate mt-0.5">{p2.name}</div>
                  </button>
                )}
              </div>
            </div>

            {absentPlayerId && (
              <div className="rounded-xl bg-slate-950 p-3 border border-slate-800 text-xs text-amber-400">
                ⚡ Winner by forfeit will be:{' '}
                <strong>
                  {absentPlayerId === p1?.id ? p2?.name : p1?.name}
                </strong>
              </div>
            )}
          </div>
        )}

        {/* Tab 2: Swap Players */}
        {activeTab === 'swap-player' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Swap an unavailable player from this match with an available player from another pending match.
            </p>

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
                  <option value="">-- Select Pending Match --</option>
                  {otherPendingMatches.map((m) => (
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
          </div>
        )}

        {/* Tab 3: Shift Board Iteration */}
        {activeTab === 'shift-board' && (
          <div className="space-y-4">
            <p className="text-xs text-slate-300">
              Swap board numbers with another match so this match moves to another physical board iteration (e.g. move to Iteration 2).
            </p>

            <div>
              <label className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                Swap Board {targetMatch.board_number} With:
              </label>
              <select
                value={selectedBoardMatchId}
                onChange={(e) => setSelectedBoardMatchId(e.target.value)}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 p-2.5 text-xs text-slate-100 font-medium focus:border-amber-500 focus:outline-none"
              >
                <option value="">-- Select Target Match --</option>
                {otherPendingMatches.map((m) => (
                  <option key={m.id} value={m.id}>
                    Board {m.board_number}: {m.player1?.name || 'P1'} vs {m.player2?.name || 'P2'}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
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
    </Modal>
  );
};
