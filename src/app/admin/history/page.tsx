'use client';

import React, { useEffect, useState } from 'react';
import { fetchActiveTournament } from '../../../lib/tournament/actions';
import { Tournament, Round } from '../../../lib/types';
import { MatchCard } from '../../../components/admin/MatchCard';
import { History, Trophy } from 'lucide-react';

export default function AdminHistoryPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [allRounds, setAllRounds] = useState<Round[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await fetchActiveTournament();
        setTournament(data.tournament);
        setAllRounds(data.allRounds);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20 text-slate-400 font-medium">
        Loading Tournament History...
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="text-center py-16 text-slate-400">
        No active tournament found.
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="border-b border-slate-800 pb-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-400">
          <History className="w-4 h-4" /> TOURNAMENT ARCHIVE
        </div>
        <h1 className="text-3xl font-black text-slate-100 mt-1">
          {tournament.name} — Full History
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          All rounds and match board results from start to final.
        </p>
      </div>

      {allRounds.length === 0 ? (
        <div className="text-center py-12 text-slate-500">
          No rounds created yet.
        </div>
      ) : (
        <div className="space-y-8">
          {allRounds.map((round) => (
            <div
              key={round.id}
              className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 space-y-6 shadow-xl"
            >
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 font-mono font-bold text-sm border border-amber-500/20">
                    R{round.round_number}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-100">
                      {round.round_name}
                    </h2>
                    <p className="text-xs text-slate-400 font-medium">
                      Status: {round.status === 'complete' ? '✓ Complete' : '🔴 In Progress'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(round.matches || []).map((m) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    onSelectWinner={() => {}}
                    isReadOnly
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
