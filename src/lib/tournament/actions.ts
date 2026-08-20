import { createClient } from '../supabase/client';
import { generateInitialPairings, generateNextRoundPairings } from './pairing';
import { Tournament, Player, Round, Match, ExtractedPlayer } from '../types';

export async function fetchActiveTournament(): Promise<{
  tournament: Tournament | null;
  currentRound: Round | null;
  allRounds: Round[];
  players: Player[];
}> {
  const supabase = createClient();

  // Fetch active tournament (or most recent)
  const { data: tournaments } = await supabase
    .from('tournaments')
    .select('*, winner:winner_id(*), runner_up:runner_up_id(*)')
    .order('created_at', { ascending: false })
    .limit(1);

  if (!tournaments || tournaments.length === 0) {
    return { tournament: null, currentRound: null, allRounds: [], players: [] };
  }

  const tournament = tournaments[0] as Tournament;

  // Fetch all players for tournament
  const { data: players } = await supabase
    .from('players')
    .select('*')
    .eq('tournament_id', tournament.id)
    .order('name');

  // Fetch all rounds with matches and player details
  const { data: rounds } = await supabase
    .from('rounds')
    .select(`
      *,
      matches (
        *,
        player1:player1_id(*),
        player2:player2_id(*),
        winner:winner_id(*)
      )
    `)
    .eq('tournament_id', tournament.id)
    .order('round_number', { ascending: true });

  const sortedRounds = (rounds || []).map((r) => ({
    ...r,
    matches: (r.matches || []).sort((a: Match, b: Match) => a.board_number - b.board_number),
  })) as Round[];

  const currentRound = sortedRounds.find((r) => r.status === 'active') || sortedRounds[sortedRounds.length - 1] || null;

  return {
    tournament,
    currentRound,
    allRounds: sortedRounds,
    players: (players || []) as Player[],
  };
}

export async function createTournament(
  name: string,
  extractedPlayers: ExtractedPlayer[]
): Promise<Tournament> {
  const supabase = createClient();

  // 1. Create Tournament row
  const { data: tournament, error: tErr } = await supabase
    .from('tournaments')
    .insert({ name, status: 'active' })
    .select()
    .single();

  if (tErr || !tournament) {
    throw new Error(`Failed to create tournament: ${tErr?.message}`);
  }

  // 2. Insert Players
  const playerInserts = extractedPlayers.map((p) => ({
    tournament_id: tournament.id,
    name: p.name,
    status: 'active',
  }));

  const { data: insertedPlayers, error: pErr } = await supabase
    .from('players')
    .insert(playerInserts)
    .select();

  if (pErr || !insertedPlayers) {
    throw new Error(`Failed to insert players: ${pErr?.message}`);
  }

  const playerIds = insertedPlayers.map((p) => p.id);

  // 3. Generate Round 1 Pairings
  const { roundName, pairings } = generateInitialPairings(playerIds);

  // 4. Create Round 1 row
  const { data: round1, error: rErr } = await supabase
    .from('rounds')
    .insert({
      tournament_id: tournament.id,
      round_number: 1,
      round_name: roundName,
      status: 'active',
    })
    .select()
    .single();

  if (rErr || !round1) {
    throw new Error(`Failed to create initial round: ${rErr?.message}`);
  }

  // 5. Insert Matches for Round 1
  const matchInserts = pairings.map((p) => ({
    round_id: round1.id,
    board_number: p.board_number,
    player1_id: p.player1_id,
    player2_id: p.player2_id,
    winner_id: p.winner_id,
    is_bye: p.is_bye,
    status: p.status,
  }));

  const { error: mErr } = await supabase.from('matches').insert(matchInserts);

  if (mErr) {
    throw new Error(`Failed to create match pairings: ${mErr.message}`);
  }

  return tournament as Tournament;
}

export async function setMatchWinner(
  matchId: string,
  winnerId: string,
  loserId: string | null
): Promise<void> {
  const supabase = createClient();

  // 1. Update Match record
  const { data: match, error: mErr } = await supabase
    .from('matches')
    .update({
      winner_id: winnerId,
      status: 'complete',
    })
    .eq('id', matchId)
    .select('*, round:round_id(*)')
    .single();

  if (mErr || !match) {
    throw new Error(`Failed to update match result: ${mErr?.message}`);
  }

  // 2. Mark loser as eliminated (if not bye)
  if (loserId) {
    await supabase
      .from('players')
      .update({ status: 'eliminated' })
      .eq('id', loserId);
  }

  // 3. Check if this was the Final Match
  const round = match.round;
  if (round && round.round_name === 'Final') {
    // Final complete! Set Champion and Runner-up on tournament
    await supabase
      .from('players')
      .update({ status: 'champion' })
      .eq('id', winnerId);

    await supabase
      .from('tournaments')
      .update({
        status: 'complete',
        winner_id: winnerId,
        runner_up_id: loserId,
      })
      .eq('id', round.tournament_id);

    await supabase
      .from('rounds')
      .update({ status: 'complete' })
      .eq('id', round.id);
  }
}

export async function resetMatch(matchId: string): Promise<void> {
  const supabase = createClient();

  // Fetch match details before reset
  const { data: match } = await supabase
    .from('matches')
    .select('*, round:round_id(*)')
    .eq('id', matchId)
    .single();

  if (!match) return;

  const previousWinnerId = match.winner_id;
  const p1Id = match.player1_id;
  const p2Id = match.player2_id;
  const previousLoserId = previousWinnerId === p1Id ? p2Id : p1Id;

  // Reset match
  await supabase
    .from('matches')
    .update({
      winner_id: null,
      status: 'pending',
    })
    .eq('id', matchId);

  // Restore loser status to active
  if (previousLoserId) {
    await supabase
      .from('players')
      .update({ status: 'active' })
      .eq('id', previousLoserId);
  }

  // If tournament was marked complete, revert to active
  if (match.round && match.round.round_name === 'Final') {
    await supabase
      .from('tournaments')
      .update({
        status: 'active',
        winner_id: null,
        runner_up_id: null,
      })
      .eq('id', match.round.tournament_id);

    await supabase
      .from('rounds')
      .update({ status: 'active' })
      .eq('id', match.round.id);

    if (previousWinnerId) {
      await supabase
        .from('players')
        .update({ status: 'active' })
        .eq('id', previousWinnerId);
    }
  }
}

export async function swapMatchPlayers(
  match1Id: string,
  slot1: 'player1' | 'player2',
  match2Id: string,
  slot2: 'player1' | 'player2'
): Promise<void> {
  const supabase = createClient();

  const { data: match1 } = await supabase.from('matches').select('*').eq('id', match1Id).single();
  const { data: match2 } = await supabase.from('matches').select('*').eq('id', match2Id).single();

  if (!match1 || !match2) {
    throw new Error('One or both matches could not be found.');
  }

  const p1Field = slot1 === 'player1' ? 'player1_id' : 'player2_id';
  const p2Field = slot2 === 'player1' ? 'player1_id' : 'player2_id';

  const player1Id = match1[p1Field];
  const player2Id = match2[p2Field];

  await supabase.from('matches').update({ [p1Field]: player2Id }).eq('id', match1Id);
  await supabase.from('matches').update({ [p2Field]: player1Id }).eq('id', match2Id);
}

export async function swapBoardNumbers(match1Id: string, match2Id: string): Promise<void> {
  const supabase = createClient();

  const { data: match1 } = await supabase.from('matches').select('*').eq('id', match1Id).single();
  const { data: match2 } = await supabase.from('matches').select('*').eq('id', match2Id).single();

  if (!match1 || !match2) {
    throw new Error('One or both matches could not be found.');
  }

  const board1 = match1.board_number;
  const board2 = match2.board_number;

  await supabase.from('matches').update({ board_number: board2 }).eq('id', match1Id);
  await supabase.from('matches').update({ board_number: board1 }).eq('id', match2Id);
}

export async function markPlayerAbsentForfeit(
  matchId: string,
  absentPlayerId: string,
  presentPlayerId: string
): Promise<void> {
  await setMatchWinner(matchId, presentPlayerId, absentPlayerId);
}

export async function generateNextRoundForTournament(
  tournamentId: string
): Promise<Round> {
  const supabase = createClient();

  // 1. Get current active round
  const { data: currentRounds } = await supabase
    .from('rounds')
    .select('*, matches(*)')
    .eq('tournament_id', tournamentId)
    .eq('status', 'active')
    .order('round_number', { ascending: false })
    .limit(1);

  if (!currentRounds || currentRounds.length === 0) {
    throw new Error('No active round found for this tournament.');
  }

  const activeRound = currentRounds[0];
  const matches = activeRound.matches || [];

  // 2. Ensure all matches in active round are complete
  const incompleteMatches = matches.filter((m: Match) => m.status !== 'complete');
  if (incompleteMatches.length > 0) {
    throw new Error('Cannot generate next round until all matches in the current round are completed.');
  }

  // 3. Mark current round complete
  await supabase
    .from('rounds')
    .update({ status: 'complete' })
    .eq('id', activeRound.id);

  // 4. Collect winner IDs from all completed matches
  const winnerIds: string[] = matches
    .map((m: Match) => m.winner_id)
    .filter((id: string | null): id is string => Boolean(id));

  if (winnerIds.length < 2) {
    throw new Error('Tournament has fewer than 2 winners remaining.');
  }

  // 5. Generate next round pairings
  const nextRoundNumber = activeRound.round_number + 1;
  const { roundName, pairings } = generateNextRoundPairings(winnerIds, nextRoundNumber);

  // 6. Insert new Round row
  const { data: newRound, error: rErr } = await supabase
    .from('rounds')
    .insert({
      tournament_id: tournamentId,
      round_number: nextRoundNumber,
      round_name: roundName,
      status: 'active',
    })
    .select()
    .single();

  if (rErr || !newRound) {
    throw new Error(`Failed to create next round: ${rErr?.message}`);
  }

  // 7. Insert Next Round Matches
  const matchInserts = pairings.map((p) => ({
    round_id: newRound.id,
    board_number: p.board_number,
    player1_id: p.player1_id,
    player2_id: p.player2_id,
    winner_id: p.winner_id,
    is_bye: p.is_bye,
    status: p.status,
  }));

  const { error: mErr } = await supabase.from('matches').insert(matchInserts);

  if (mErr) {
    throw new Error(`Failed to insert pairings for next round: ${mErr.message}`);
  }

  return newRound as Round;
}

export async function deleteAllTournamentData(): Promise<void> {
  const supabase = createClient();
  await supabase.from('matches').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('rounds').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('players').delete().neq('id', '00000000-0000-0000-0000-000000000000');
  await supabase.from('tournaments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
}
