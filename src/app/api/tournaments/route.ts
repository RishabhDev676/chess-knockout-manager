import { NextResponse } from 'next/server';
import { createTournament } from '../../../lib/tournament/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, players } = body;

    if (!name || !players || !Array.isArray(players) || players.length < 2) {
      return NextResponse.json(
        { error: 'Valid tournament name and at least 2 players required.' },
        { status: 400 }
      );
    }

    const tournament = await createTournament(name, players);
    return NextResponse.json({ tournament }, { status: 201 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
