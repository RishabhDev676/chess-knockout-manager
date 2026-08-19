'use client';

import React, { useEffect, useState } from 'react';
import { fetchActiveTournament } from '../../lib/tournament/actions';
import { Tournament, Round, Player } from '../../lib/types';
import { LiveRound } from '../../components/public/LiveRound';
import { ChampionBanner } from '../../components/public/ChampionBanner';
import { createClient } from '../../lib/supabase/client';
import { Trophy, RefreshCw, Layers } from 'lucide-react';
import { MatchCard } from '../../components/admin/MatchCard';

export default function PublicTournamentPage() {
  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [currentRound, setCurrentRound] = useState<Round | null>(null);
  const [allRounds, setAllRounds] = useState<Round[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = async () => {
    try {
      const data = await fetchActiveTournament();
      setTournament(data.tournament);
      setCurrentRound(data.currentRound);
      setAllRounds(data.allRounds);
      setPlayers(data.players);
      setLastRefreshed(new Date().toLocaleTimeString());
    } catch (err) {
      console.error('Failed to load tournament data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Set up 30s fallback polling interval
    const interval = setInterval(() => {
      loadData();
    }, 30000);

    // Set up Supabase Realtime Subscription
    const supabase = createClient();
    const channel = supabase
      .channel('public_tournament_realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'matches' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rounds' },
        () => loadData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tournaments' },
        () => loadData()
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center space-y-4">
        <div className="h-12 w-12 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-medium text-sm">Loading Live Tournament Bracket...</p>
      </div>
    );
  }

  if (!tournament) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center space-y-4">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 mb-2">
          <Trophy className="h-8 w-8" />
        </div>
        <h1 className="text-2xl font-black text-slate-100">No Active Tournament Found</h1>
        <p className="text-sm text-slate-400 max-w-md mx-auto">
          The tournament organizer has not started a tournament yet. Check back soon for live pairings!
        </p>
      </div>
    );
  }

  const isComplete = tournament.status === 'complete';
  const champion = tournament.winner || players.find((p) => p.id === tournament.winner_id) || null;
  const runnerUp = tournament.runner_up || players.find((p) => p.id === tournament.runner_up_id) || null;

  const previousRounds = allRounds.filter(
    (r) => r.id !== currentRound?.id
  );

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 space-y-8">
      {/* Tournament Header Bar */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-amber-500/10 text-amber-400 border border-amber-500/20">
                {isComplete ? '🏁 TOURNAMENT CONCLUDED' : '🔴 LIVE TOURNAMENT'}
              </span>
              {lastRefreshed && (
                <span className="text-[10px] text-slate-500">
                  Updated: {lastRefreshed}
                </span>
              )}
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-slate-100 tracking-tight">
              {tournament.name}
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-medium">
              Single-Elimination Knockout Bracket &bull; Total Registered Players:{' '}
              <strong className="text-amber-400">{players.length}</strong>
            </p>
          </div>

          <button
            onClick={loadData}
            className="self-start md:self-auto inline-flex items-center gap-2 rounded-xl bg-slate-950 border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <RefreshCw className="w-4 h-4 text-amber-400" /> Refresh Live Data
          </button>
        </div>
      </div>

      {/* Champion Banner (If complete) */}
      {isComplete && champion && (
        <ChampionBanner
          champion={champion}
          runnerUp={runnerUp}
          tournamentName={tournament.name}
        />
      )}

      {/* Current Active Round */}
      {currentRound && (
        <LiveRound round={currentRound} />
      )}

      {/* Tournament History (Previous Rounds) */}
      {previousRounds.length > 0 && (
        <div className="pt-8 border-t border-slate-900 space-y-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-slate-200">
              Completed Tournament Rounds
            </h3>
          </div>

          <div className="space-y-6">
            {previousRounds.map((pastRound) => (
              <details
                key={pastRound.id}
                className="group rounded-2xl bg-slate-900/60 border border-slate-800/80 overflow-hidden transition-all"
                open
              >
                <summary className="flex items-center justify-between cursor-pointer px-6 py-4 bg-slate-900 hover:bg-slate-850 select-none font-bold text-slate-200">
                  <div className="flex items-center gap-3">
                    <span className="text-amber-400 font-mono text-xs">
                      R{pastRound.round_number}
                    </span>
                    <span>{pastRound.round_name}</span>
                    <span className="text-xs font-normal text-slate-400">
                      ({pastRound.matches?.length || 0} matches)
                    </span>
                  </div>
                  <span className="text-xs text-amber-400 group-open:rotate-180 transition-transform">
                    ▼
                  </span>
                </summary>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(pastRound.matches || []).map((m) => (
                    <MatchCard
                      key={m.id}
                      match={m}
                      onSelectWinner={() => {}}
                      isReadOnly
                    />
                  ))}
                </div>
              </details>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
