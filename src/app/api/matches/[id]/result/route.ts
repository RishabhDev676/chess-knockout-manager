import { NextResponse } from 'next/server';
import { setMatchWinner } from '../../../../../lib/tournament/actions';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { winnerId, loserId } = body;

    if (!winnerId) {
      return NextResponse.json({ error: 'winnerId is required.' }, { status: 400 });
    }

    await setMatchWinner(id, winnerId, loserId || null);
    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Internal Server Error' },
      { status: 500 }
    );
  }
}
