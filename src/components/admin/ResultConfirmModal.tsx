'use client';

import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Trophy, AlertTriangle } from 'lucide-react';

interface ResultConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  winnerName: string;
  loserName: string;
  boardNumber: number;
  isLoading?: boolean;
}

export const ResultConfirmModal: React.FC<ResultConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  winnerName,
  loserName,
  boardNumber,
  isLoading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Confirm Match Result">
      <div className="space-y-5">
        <div className="flex items-center gap-3 rounded-xl bg-amber-950/40 border border-amber-800/40 p-4">
          <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
          <div>
            <div className="text-xs font-semibold uppercase text-amber-400">
              BOARD {boardNumber}
            </div>
            <div className="text-sm font-bold text-slate-100 mt-0.5">
              Record <span className="text-amber-300 font-extrabold">{winnerName}</span> as the Winner?
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
          <p>
            ✓ <strong className="text-emerald-400">{winnerName}</strong> will advance to the next round.
          </p>
          <p>
            ✗ <strong className="text-rose-400 line-through">{loserName}</strong> will be eliminated from the tournament.
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-amber-400/80 bg-amber-500/5 p-3 rounded-lg border border-amber-500/10">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>You can modify this result later from the board card if entered by mistake.</span>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={onConfirm}
            isLoading={isLoading}
            size="md"
          >
            Confirm Winner
          </Button>
        </div>
      </div>
    </Modal>
  );
};
