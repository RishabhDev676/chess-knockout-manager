'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ManualPlayerSetup } from '../../../components/admin/ManualPlayerSetup';
import { ExtractedPlayer } from '../../../lib/types';
import { createTournament } from '../../../lib/tournament/actions';
import { Users, AlertTriangle } from 'lucide-react';

export default function AdminPlayersPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleConfirmPlayers = async (
    tournamentName: string,
    players: ExtractedPlayer[]
  ) => {
    setLoading(true);
    setErrorMsg(null);

    try {
      await createTournament(tournamentName, players);
      router.push('/admin/rounds');
      router.refresh();
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Failed to create tournament.');
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <Users className="w-4 h-4" /> STEP 1: PLAYER SETUP
        </div>
        <h1 className="text-3xl font-black text-slate-100 mt-1">
          Create Player List
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Enter player names manually. You can add names one by one or paste a list from your phone.
        </p>
      </div>

      {errorMsg && (
        <div className="rounded-xl bg-rose-950/60 border border-rose-800/60 p-4 text-xs font-medium text-rose-200 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      <ManualPlayerSetup
        onConfirmPlayers={handleConfirmPlayers}
        isLoading={loading}
      />
    </div>
  );
}
