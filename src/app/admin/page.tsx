'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchActiveTournament, deleteAllTournamentData } from '../../lib/tournament/actions';
import { Tournament, Round, Player } from '../../lib/types';
import { Users, PlayCircle, History, Trophy, PlusCircle, ShieldAlert, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';

export default function AdminDashboardPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    try {
      const data = await fetchActiveTournament();
      setTournament(data.tournament);
      setCurrentRound(data.currentRound);
      setPlayers(data.players);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleDeleteAll = async () => {
    setDeleting(true);
    try {
      await deleteAllTournamentData();
      setDeleteModalOpen(false);
      await load();
    } catch (err) {
      console.error('Failed to delete data:', err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400 font-medium">
        Loading Admin Dashboard...
      </div>
    );
  }

  const completedMatches = currentRound?.matches?.filter((m) => m.status === 'complete').length || 0;
  const totalMatches = currentRound?.matches?.length || 0;
  const isComplete = tournament?.status === 'complete';

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
            ADMIN CONTROL CENTER
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100 mt-1">
            {tournament ? tournament.name : 'No Active Tournament'}
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Fast, simple tournament management for live events.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {tournament && (
            <Button
              variant="danger"
              size="lg"
              onClick={() => setDeleteModalOpen(true)}
              className="font-bold"
            >
              <Trash2 className="w-4 h-4 mr-2" /> Reset Data
            </Button>
          )}
          <Link href="/admin/players">
            <Button variant="primary" size="lg" className="font-extrabold shadow-lg shadow-amber-600/20">
              <PlusCircle className="w-5 h-5 mr-2" /> Start New Tournament
            </Button>
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      {tournament && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Total Players</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-slate-100">
              {players.length}
            </div>
            <p className="text-[11px] text-slate-500">Loaded from Excel</p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Current Round</span>
              <PlayCircle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-amber-400 truncate">
              {currentRound?.round_name || 'Setup'}
            </div>
            <p className="text-[11px] text-slate-500">
              Round {currentRound?.round_number || 1}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Matches Done</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-3xl font-black font-mono text-slate-100">
              {completedMatches} <span className="text-slate-500 text-base font-normal">/ {totalMatches}</span>
            </div>
            <p className="text-[11px] text-slate-500">In current round</p>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 space-y-1">
            <div className="flex items-center justify-between text-slate-400 text-xs font-semibold uppercase">
              <span>Status</span>
              <ShieldAlert className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-xl font-bold text-slate-100 capitalize">
              {isComplete ? '🏁 Complete' : '🔴 Active'}
            </div>
            <p className="text-[11px] text-slate-500">
              {isComplete ? 'Champion Crowned' : 'In Progress'}
            </p>
          </div>
        </div>
      )}

      {/* Main Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/players"
          className="group rounded-3xl bg-slate-900 border border-slate-800 p-6 hover:border-amber-500/50 hover:bg-slate-850 transition-all shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-110 transition-transform">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500">STEP 1</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-amber-400 transition-colors">
              Manage Players & Excel Upload
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Upload player .xlsx file, confirm player list, and randomize Round 1.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/rounds"
          className="group rounded-3xl bg-slate-900 border border-slate-800 p-6 hover:border-amber-500/50 hover:bg-slate-850 transition-all shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 group-hover:scale-110 transition-transform">
              <PlayCircle className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500">STEP 2</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-emerald-400 transition-colors">
              Enter Match Results & Next Round
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Click winners board-by-board and generate the next round pairings.
            </p>
          </div>
        </Link>

        <Link
          href="/admin/history"
          className="group rounded-3xl bg-slate-900 border border-slate-800 p-6 hover:border-amber-500/50 hover:bg-slate-850 transition-all shadow-xl flex flex-col justify-between space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 group-hover:scale-110 transition-transform">
              <History className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-slate-500">VIEW</span>
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-100 group-hover:text-blue-400 transition-colors">
              Tournament History
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Review all past rounds, match boards, and historical results.
            </p>
          </div>
        </Link>
      </div>

      {/* Confirmation Modal for Resetting All Data */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete All Tournament Data?"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-xl bg-rose-950/40 border border-rose-800/50 p-4 text-rose-200 text-xs leading-relaxed">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              This will permanently delete all existing tournament data, player lists, rounds, and match results from the database. This action cannot be undone.
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setDeleteModalOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleDeleteAll}
              isLoading={deleting}
            >
              Delete All Data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
