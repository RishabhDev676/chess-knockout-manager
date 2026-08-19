import { NextResponse } from 'next/server';
import { generateNextRoundForTournament } from '../../../../lib/tournament/actions';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { tournamentId } = body;

    if (!tournamentId) {
      return NextResponse.json({ error: 'tournamentId is required.' }, { status: 400 });
    }

    const round = await generateNextRoundForTournament(tournamentId);
    return NextResponse.json({ round }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
