'use client';

import React, { useEffect, useState } from 'react';
import {
  fetchActiveTournament,
  setMatchWinner,
  resetMatch,
  generateNextRoundForTournament,
} from '../../../lib/tournament/actions';
import { Tournament, Round, Match, Player } from '../../../lib/types';
import { MatchCard } from '../../../components/admin/MatchCard';
import { RoundProgress } from '../../../components/admin/RoundProgress';
import { ResultConfirmModal } from '../../../components/admin/ResultConfirmModal';
import { ChampionBanner } from '../../../components/public/ChampionBanner';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { Trophy, PlayCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import Link from 'next/link';

interface SelectedWinnerState {
  match: Match;
  winnerId: string;
  winnerName: string;
  loserId: string | null;
  loserName: string | null;
}

export default function AdminRoundsPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Winner selection modal state
  const [selectedWinner, setSelectedWinner] = useState<SelectedWinnerState | null>(null);

  // Edit result modal state
  const [matchToReset, setMatchToReset] = useState<Match | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchActiveTournament();
      setTournament(data.tournament);
      setCurrentRound(data.currentRound);
      setPlayers(data.players);
    } catch (err: unknown) {
      console.error(err);
      setErrorMsg(err instanceof Error ? err.message : 'Failed to load round data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenConfirmWinner = (
    match: Match,
    winnerId: string,
    winnerName: string,
    loserId: string | null,
    loserName: string | null
  ) => {
    setSelectedWinner({
      match,
      winnerId,
      winnerName,
      loserId,
      loserName,
    });
  };

  const handleConfirmWinner = async () => {
    if (!selectedWinner) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      await setMatchWinner(
        selectedWinner.match.id,
        selectedWinner.winnerId,
        selectedWinner.loserId
      );
      setSelectedWinner(null);
      await loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to save winner.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleConfirmResetMatch = async () => {
    if (!matchToReset) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      await resetMatch(matchToReset.id);
      setMatchToReset(null);
      await loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to reset match result.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleGenerateNextRound = async () => {
    if (!tournament) return;
    setActionLoading(true);
    setErrorMsg(null);

    try {
      await generateNextRoundForTournament(tournament.id);
      await loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate next round.');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400 font-medium">
        Loading Round & Match Data...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
          <PlayCircle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-100">No Active Tournament</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Please upload an Excel file to start a tournament first.
        </p>
        <Link href="/admin/players">
          <Button variant="primary" size="md">
            Go to Player Setup
          </Button>
        </Link>
      </div>
    );
  }

  const matches = currentRound?.matches || [];
  const completedCount = matches.filter((m) => m.status === 'complete').length;
  const totalCount = matches.length;

  const isFinalRound = currentRound?.round_name === 'Final';
  const isTournamentComplete = tournament.status === 'complete';
  const champion = tournament.winner || players.find((p) => p.id === tournament.winner_id) || null;
  const runnerUp = tournament.runner_up || players.find((p) => p.id === tournament.runner_up_id) || null;

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
            MATCH MANAGEMENT
          </span>
          <h1 className="text-3xl font-black text-slate-100 mt-0.5">
            {currentRound?.round_name || 'Round Pairings'}
          </h1>
        </div>

        <button
          onClick={loadData}
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-slate-900 border border-slate-800 px-3.5 py-2 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <RefreshCw className="w-4 h-4 text-amber-400" /> Refresh Board State
        </button>
      </div>

      {/* Error Message Display */}
      {errorMsg && (
        <div className="rounded-xl bg-rose-950/60 border border-rose-800/60 p-4 text-xs font-medium text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {/* Champion Banner (if complete) */}
      {isTournamentComplete && champion && (
        <ChampionBanner
          champion={champion}
          runnerUp={runnerUp}
          tournamentName={tournament.name}
        />
      )}

      {/* Round Progress Tracker & Next Round Generator */}
      {currentRound && (
        <RoundProgress
          completedMatches={completedCount}
          totalMatches={totalCount}
          onGenerateNextRound={handleGenerateNextRound}
          isLoading={actionLoading}
          roundName={currentRound.round_name}
          isFinalRound={isFinalRound}
          hasWinner={isTournamentComplete}
        />
      )}

      {/* Board Cards Grid */}
      <div className="space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          MATCH BOARDS ({matches.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          {matches.map((match) => (
            <MatchCard
              key={match.id}
              match={match}
              onSelectWinner={(m, wId, wName, lId, lName) =>
                handleOpenConfirmWinner(m, wId, wName, lId, lName)
              }
              onEditResult={(m) => setMatchToReset(m)}
            />
          ))}
        </div>
      </div>

      {/* Confirm Winner Dialog */}
      {selectedWinner && (
        <ResultConfirmModal
          isOpen={Boolean(selectedWinner)}
          onClose={() => setSelectedWinner(null)}
          onConfirm={handleConfirmWinner}
          winnerName={selectedWinner.winnerName}
          loserName={selectedWinner.loserName || 'Opponent'}
          boardNumber={selectedWinner.match.board_number}
          isLoading={actionLoading}
        />
      )}

      {/* Edit / Reset Match Result Confirmation Dialog */}
      {matchToReset && (
        <Modal
          isOpen={Boolean(matchToReset)}
          onClose={() => setMatchToReset(null)}
          title="Edit Match Result"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to reset Board{' '}
              <strong className="text-amber-400">{matchToReset.board_number}</strong>?
              This will unlock the match and allow you to pick a different winner.
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setMatchToReset(null)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={handleConfirmResetMatch}
                isLoading={actionLoading}
              >
                Reset Match Result
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
