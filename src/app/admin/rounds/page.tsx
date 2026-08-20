'use client';

import React, { useEffect, useState, useMemo } from 'react';
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
import { BoardIterationControls } from '../../../components/admin/BoardIterationControls';
import { SwapPlayerModal } from '../../../components/admin/SwapPlayerModal';
import { ChampionBanner } from '../../../components/public/ChampionBanner';
import { Modal } from '../../../components/ui/Modal';
import { Button } from '../../../components/ui/Button';
import { OrientationToggle } from '../../../components/ui/OrientationToggle';
import { HorizontalBracketView } from '../../../components/public/HorizontalBracketView';
import { useScreenOrientation, ViewOrientation } from '../../../lib/orientation';
import {
  BoardCapacity,
  groupMatchesByIteration,
  filterMatchesBySearch,
  getIterationForBoard,
  getLivePlayerIdsFromMatches,
} from '../../../lib/tournament/iteration';
import { PlayCircle, AlertTriangle, RefreshCw } from 'lucide-react';
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
  const [allRounds, setAllRounds] = useState<Round[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { orientation } = useScreenOrientation();
  const [viewMode, setViewMode] = useState<ViewOrientation>('vertical');

  // Search & Iteration state
  const [capacity, setCapacity] = useState<BoardCapacity>(4);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIteration, setSelectedIteration] = useState<number | 'all'>('all');
  const [startedIterations, setStartedIterations] = useState<number[]>([1]);
  const [hideActivePlayersInNext, setHideActivePlayersInNext] = useState<boolean>(true);

  // Modal states
  const [selectedWinner, setSelectedWinner] = useState<SelectedWinnerState | null>(null);
  const [matchToReset, setMatchToReset] = useState<Match | null>(null);
  const [matchToManage, setMatchToManage] = useState<{ match: Match; slot?: 'player1' | 'player2' } | null>(null);

  const loadData = async () => {
    try {
      const data = await fetchActiveTournament();
      setTournament(data.tournament);
      setCurrentRound(data.currentRound);
      setAllRounds(data.allRounds);
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

  const handleConfirmStartIteration = (iterIndex: number) => {
    setStartedIterations((prev) => {
      if (prev.includes(iterIndex)) return prev;
      return [...prev, iterIndex];
    });
  };

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
      setStartedIterations([1]);
      await loadData();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to generate next round.');
    } finally {
      setActionLoading(false);
    }
  };

  const rawMatches = useMemo(() => currentRound?.matches || [], [currentRound?.matches]);

  // Primitive string key — useEffect only fires when match statuses actually change
  const matchStatusesKey = useMemo(
    () => rawMatches.map((m) => `${m.id}:${m.status}`).join(','),
    [rawMatches]
  );

  // Auto-start next iteration when current iteration matches complete (stable deps)
  useEffect(() => {
    if (capacity === 'all' || !rawMatches.length) return;

    setStartedIterations((prev) => {
      const groups = groupMatchesByIteration(rawMatches, capacity, prev);
      let updated = false;
      const nextStarted = [...prev];

      for (const group of groups) {
        if (group.completedCount === group.totalCount && group.totalCount > 0) {
          const nextIter = group.iterationIndex + 1;
          const maxIter = groups[groups.length - 1].iterationIndex;
          if (nextIter <= maxIter && !nextStarted.includes(nextIter)) {
            nextStarted.push(nextIter);
            updated = true;
          }
        }
      }

      return updated ? nextStarted : prev;
    });
  }, [matchStatusesKey, capacity]);

  // Keep all hooks above loading and empty-state returns. The first render has
  // no tournament yet, so returning before these hooks would change hook order
  // once the data loads and make React crash the page.
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

  const completedCount = rawMatches.filter((m) => m.status === 'complete').length;
  const totalCount = rawMatches.length;
  const isFinalRound = currentRound?.round_name === 'Final';
  const isTournamentComplete = tournament.status === 'complete';
  const champion = tournament.winner || players.find((p) => p.id === tournament.winner_id) || null;
  const runnerUp = tournament.runner_up || players.find((p) => p.id === tournament.runner_up_id) || null;

  // Compute live active player IDs currently playing in started iterations
  const livePlayerIds = getLivePlayerIdsFromMatches(rawMatches, capacity, startedIterations);

  // Filter matches by Search
  const searchedMatches = filterMatchesBySearch(rawMatches, searchQuery);

  // Group by Iteration
  const iterationGroups = groupMatchesByIteration(searchedMatches, capacity, startedIterations);

  // Filter by Selected Iteration
  const displayedMatches = searchedMatches.filter((m) => {
    if (selectedIteration === 'all' || capacity === 'all') return true;
    const iterIdx = Math.ceil(m.board_number / capacity);
    return iterIdx === selectedIteration;
  });

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

      {/* Search & Board Iterations Control Panel */}
      {currentRound && (
        <BoardIterationControls
          capacity={capacity}
          onCapacityChange={(cap) => {
            setCapacity(cap);
            setSelectedIteration('all');
          }}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedIteration={selectedIteration}
          onSelectIteration={setSelectedIteration}
          iterationGroups={iterationGroups}
          totalMatches={rawMatches.length}
          filteredMatchesCount={displayedMatches.length}
          onConfirmStartIteration={handleConfirmStartIteration}
          hideActivePlayers={hideActivePlayersInNext}
          onToggleHideActivePlayers={setHideActivePlayersInNext}
        />
      )}

      {/* View Mode & Orientation Controls */}
      <OrientationToggle
        currentView={viewMode}
        onChangeView={setViewMode}
        isLandscape={orientation === 'landscape'}
        matchCount={displayedMatches.length}
      />

      {/* Board Cards Grid or Visual Bracket View */}
      {viewMode === 'horizontal-tree' && allRounds.length > 0 ? (
        <HorizontalBracketView
          allRounds={allRounds}
          championName={champion?.name}
          runnerUpName={runnerUp?.name}
        />
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              MATCH BOARDS ({displayedMatches.length} Displayed)
            </h3>
            {searchQuery && (
              <span className="text-xs text-amber-400 font-semibold">
                Filtered by &quot;{searchQuery}&quot;
              </span>
            )}
          </div>

          {displayedMatches.length === 0 ? (
            <div className="rounded-2xl bg-slate-900 border border-slate-800 p-12 text-center text-slate-400 text-xs">
              No matches found matching your search query or iteration filter.
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === 'compact-grid'
                  ? 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
                  : 'grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6'
              }`}
            >
              {displayedMatches.map((match) => {
                const iterInfo = getIterationForBoard(match.board_number, capacity);

                return (
                  <MatchCard
                    key={match.id}
                    match={match}
                    iterationTag={capacity !== 'all' ? iterInfo.shortLabel : undefined}
                    onSelectWinner={(m, wId, wName, lId, lName) =>
                      handleOpenConfirmWinner(m, wId, wName, lId, lName)
                    }
                    onEditResult={(m) => setMatchToReset(m)}
                    onManageMatch={(m, slot) => setMatchToManage({ match: m, slot })}
                    compact={viewMode === 'compact-grid'}
                  />
                );
              })}
            </div>
          )}
        </div>
      )}

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
          title="Clear & Reset Match Result"
        >
          <div className="space-y-4">
            <p className="text-xs text-slate-300 leading-relaxed">
              Are you sure you want to clear the result for Board{' '}
              <strong className="text-amber-400">{matchToReset.board_number}</strong>?
              This will clear the recorded winner and set the match status back to pending.
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
                Clear & Reset Result
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Swap / Absent Player Management Dialog */}
      {matchToManage && (
        <SwapPlayerModal
          isOpen={Boolean(matchToManage)}
          onClose={() => setMatchToManage(null)}
          targetMatch={matchToManage.match}
          initialSlot={matchToManage.slot || 'player1'}
          tournamentId={tournament?.id}
          allMatches={rawMatches}
          livePlayerIds={livePlayerIds}
          onSuccess={async () => {
            await loadData();
          }}
        />
      )}
    </div>
  );
}
