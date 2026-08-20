'use client';

import React, { useState } from 'react';
import { ListPlus, Plus, Trash2, Users } from 'lucide-react';
import { ExtractedPlayer } from '../../lib/types';
import { Button } from '../ui/Button';

interface ManualPlayerSetupProps {
  onConfirmPlayers: (tournamentName: string, players: ExtractedPlayer[]) => Promise<void>;
  isLoading?: boolean;
}

const playerId = () => `manual_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

export const ManualPlayerSetup: React.FC<ManualPlayerSetupProps> = ({
  onConfirmPlayers,
  isLoading = false,
}) => {
  const [tournamentName, setTournamentName] = useState('Chess Knockout Tournament');
  const [singleName, setSingleName] = useState('');
  const [bulkNames, setBulkNames] = useState('');
  const [players, setPlayers] = useState<ExtractedPlayer[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const addNames = (names: string[]) => {
    const cleanedNames = names.map((name) => name.trim()).filter(Boolean);
    if (!cleanedNames.length) return;

    const existingNames = new Set(players.map((player) => player.name.toLocaleLowerCase()));
    const uniqueNames = cleanedNames.filter((name) => {
      const key = name.toLocaleLowerCase();
      if (existingNames.has(key)) return false;
      existingNames.add(key);
      return true;
    });

    if (!uniqueNames.length) {
      setErrorMsg('Those player names are already in the list.');
      return;
    }

    setPlayers((current) => [
      ...current,
      ...uniqueNames.map((name) => ({ id: playerId(), name })),
    ]);
    setErrorMsg(
      uniqueNames.length === cleanedNames.length
        ? null
        : 'Duplicate names were skipped.'
    );
  };

  const handleAddOne = (event: React.FormEvent) => {
    event.preventDefault();
    addNames([singleName]);
    setSingleName('');
  };

  const handleAddBulk = () => {
    addNames(bulkNames.split(/[\n,;]+/));
    setBulkNames('');
  };

  const handleStart = async () => {
    if (!tournamentName.trim()) {
      setErrorMsg('Enter a tournament name.');
      return;
    }
    if (players.length < 2) {
      setErrorMsg('Add at least two players to start a knockout tournament.');
      return;
    }
    await onConfirmPlayers(tournamentName.trim(), players);
  };

  return (
    <div className="space-y-5">
      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-xl space-y-5">
        <div>
          <label htmlFor="tournament-name" className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-400">
            Tournament name
          </label>
          <input
            id="tournament-name"
            value={tournamentName}
            onChange={(event) => setTournamentName(event.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base font-semibold text-slate-100 outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <form onSubmit={handleAddOne} className="space-y-2">
          <label htmlFor="player-name" className="block text-xs font-bold uppercase tracking-wider text-amber-400">
            Add a player
          </label>
          <div className="flex gap-2">
            <input
              id="player-name"
              value={singleName}
              onChange={(event) => setSingleName(event.target.value)}
              placeholder="Player name"
              className="min-w-0 flex-1 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
            />
            <Button type="submit" size="lg" disabled={!singleName.trim()} className="min-h-12 shrink-0 px-4">
              <Plus className="mr-1 h-5 w-5" /> Add
            </Button>
          </div>
        </form>

        <div className="border-t border-slate-800 pt-5 space-y-2">
          <label htmlFor="bulk-player-names" className="block text-xs font-bold uppercase tracking-wider text-slate-400">
            Add several players at once
          </label>
          <textarea
            id="bulk-player-names"
            value={bulkNames}
            onChange={(event) => setBulkNames(event.target.value)}
            placeholder={'One name per line, or separate names with commas'}
            rows={3}
            className="w-full resize-y rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-base text-slate-100 outline-none placeholder:text-slate-500 focus:border-amber-500"
          />
          <Button type="button" variant="secondary" fullWidth onClick={handleAddBulk} disabled={!bulkNames.trim()} className="min-h-12">
            <ListPlus className="mr-2 h-5 w-5" /> Add names to list
          </Button>
        </div>
      </section>

      {errorMsg && (
        <div className="rounded-xl border border-rose-800/60 bg-rose-950/60 p-3 text-sm font-medium text-rose-200">
          {errorMsg}
        </div>
      )}

      <section className="rounded-2xl border border-slate-800 bg-slate-900 p-4 sm:p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-amber-400" />
            <h2 className="font-bold text-slate-100">Player list</h2>
          </div>
          <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-sm font-bold text-amber-300">
            {players.length}
          </span>
        </div>

        {players.length === 0 ? (
          <p className="rounded-xl bg-slate-950 p-5 text-center text-sm text-slate-500">Add players above to build the pairings.</p>
        ) : (
          <ol className="max-h-80 divide-y divide-slate-800 overflow-y-auto rounded-xl border border-slate-800 bg-slate-950">
            {players.map((player, index) => (
              <li key={player.id} className="flex min-h-12 items-center justify-between gap-3 px-3 py-2 text-base">
                <span className="min-w-0 truncate font-medium text-slate-200">
                  <span className="mr-3 text-sm font-bold text-slate-500">{index + 1}.</span>
                  {player.name}
                </span>
                <button
                  type="button"
                  onClick={() => setPlayers((current) => current.filter((item) => item.id !== player.id))}
                  className="flex min-h-10 min-w-10 items-center justify-center rounded-lg text-slate-400 hover:bg-rose-950/50 hover:text-rose-300"
                  aria-label={`Remove ${player.name}`}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </li>
            ))}
          </ol>
        )}

        <Button onClick={handleStart} isLoading={isLoading} fullWidth size="lg" className="mt-5 min-h-14">
          Start tournament with {players.length} players
        </Button>
      </section>
    </div>
  );
};
