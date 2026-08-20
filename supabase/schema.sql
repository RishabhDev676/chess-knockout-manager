-- =============================================================
-- Monsoon Chess Knockout Manager — Supabase Database Schema
-- =============================================================
-- Run this entire file in:
--   Supabase Dashboard → SQL Editor → New Query → Run
-- =============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================================
-- TABLE: tournaments
-- =============================================================
CREATE TABLE IF NOT EXISTS tournaments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'setup'
                  CHECK (status IN ('setup', 'active', 'complete')),
  winner_id       UUID,          -- filled after final match; FK added below
  runner_up_id    UUID,          -- filled after final match; FK added below
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- TABLE: players
-- =============================================================
CREATE TABLE IF NOT EXISTS players (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'eliminated', 'champion')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- TABLE: rounds
-- =============================================================
CREATE TABLE IF NOT EXISTS rounds (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id) ON DELETE CASCADE,
  round_number    INTEGER NOT NULL,
  round_name      TEXT NOT NULL,        -- e.g. "Quarterfinals", "Round of 16"
  status          TEXT NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'complete')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (tournament_id, round_number)
);

-- =============================================================
-- TABLE: matches
-- =============================================================
CREATE TABLE IF NOT EXISTS matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  round_id        UUID NOT NULL REFERENCES rounds(id) ON DELETE CASCADE,
  board_number    INTEGER NOT NULL,
  player1_id      UUID REFERENCES players(id) ON DELETE SET NULL,
  player2_id      UUID REFERENCES players(id) ON DELETE SET NULL,  -- NULL if bye
  winner_id       UUID REFERENCES players(id) ON DELETE SET NULL,  -- NULL until result
  is_bye          BOOLEAN NOT NULL DEFAULT false,
  status          TEXT NOT NULL DEFAULT 'pending'
                  CHECK (status IN ('pending', 'complete')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =============================================================
-- DEFERRED FOREIGN KEY: tournaments ← players (winner/runner-up)
-- Added after both tables exist
-- =============================================================
ALTER TABLE tournaments
  ADD CONSTRAINT fk_tournaments_winner
    FOREIGN KEY (winner_id) REFERENCES players(id) ON DELETE SET NULL;

ALTER TABLE tournaments
  ADD CONSTRAINT fk_tournaments_runner_up
    FOREIGN KEY (runner_up_id) REFERENCES players(id) ON DELETE SET NULL;

-- =============================================================
-- INDEXES — for fast lookups
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_players_tournament     ON players(tournament_id);
CREATE INDEX IF NOT EXISTS idx_rounds_tournament      ON rounds(tournament_id);
CREATE INDEX IF NOT EXISTS idx_matches_round          ON matches(round_id);
CREATE INDEX IF NOT EXISTS idx_matches_player1        ON matches(player1_id);
CREATE INDEX IF NOT EXISTS idx_matches_player2        ON matches(player2_id);
CREATE INDEX IF NOT EXISTS idx_matches_winner         ON matches(winner_id);

-- =============================================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================================

-- Enable RLS on all tables
ALTER TABLE tournaments  ENABLE ROW LEVEL SECURITY;
ALTER TABLE players      ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounds       ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches      ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------
-- PUBLIC (anonymous): Read-only access to all tables
-- ---------------------------------------------------------------
CREATE POLICY "Public can view tournaments"
  ON tournaments FOR SELECT
  USING (true);

CREATE POLICY "Public can view players"
  ON players FOR SELECT
  USING (true);

CREATE POLICY "Public can view rounds"
  ON rounds FOR SELECT
  USING (true);

CREATE POLICY "Public can view matches"
  ON matches FOR SELECT
  USING (true);

-- ---------------------------------------------------------------
-- AUTHENTICATED (admin): Full access to all tables
-- ---------------------------------------------------------------
CREATE POLICY "Admin can insert tournaments"
  ON tournaments FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update tournaments"
  ON tournaments FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin can delete tournaments"
  ON tournaments FOR DELETE
  TO authenticated
  USING (true);

-- Players
CREATE POLICY "Admin can insert players"
  ON players FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update players"
  ON players FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin can delete players"
  ON players FOR DELETE
  TO authenticated
  USING (true);

-- Rounds
CREATE POLICY "Admin can insert rounds"
  ON rounds FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update rounds"
  ON rounds FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin can delete rounds"
  ON rounds FOR DELETE
  TO authenticated
  USING (true);

-- Matches
CREATE POLICY "Admin can insert matches"
  ON matches FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Admin can update matches"
  ON matches FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Admin can delete matches"
  ON matches FOR DELETE
  TO authenticated
  USING (true);

-- =============================================================
-- REALTIME — Enable publication for live public page updates
-- =============================================================
-- Run this to enable Supabase Realtime on these tables:
ALTER PUBLICATION supabase_realtime ADD TABLE tournaments;
ALTER PUBLICATION supabase_realtime ADD TABLE rounds;
ALTER PUBLICATION supabase_realtime ADD TABLE matches;
ALTER PUBLICATION supabase_realtime ADD TABLE players;

-- =============================================================
-- VERIFICATION QUERY
-- Run this after setup to confirm all tables were created:
-- =============================================================
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public'
-- ORDER BY table_name;
-- Expected output: matches, players, rounds, tournaments