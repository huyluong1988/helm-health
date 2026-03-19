-- Initial schema for the interview scaffold.
-- Uses plain `pg` with generic CRUD routes.

-- Workout-log core tables (5)
-- Note: the scaffold API currently expects generic columns: `name`, `description`, `created_at`
-- for every table. The relationship-specific columns are added but kept nullable so the scaffold
-- can insert placeholder rows.

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Compatibility for existing dummy auth code (it still selects from `app_users`)
CREATE OR REPLACE VIEW app_users AS
SELECT id, name FROM users;

CREATE TABLE IF NOT EXISTS workouts (
  id SERIAL PRIMARY KEY,
  user_id INT NULL REFERENCES users(id) ON DELETE CASCADE,
  workout_date DATE NULL,
  notes TEXT NULL,
  -- generic columns for the scaffold CRUD endpoints
  name TEXT NOT NULL DEFAULT 'Workout',
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS exercises (
  id SERIAL PRIMARY KEY,
  -- generic columns for the scaffold CRUD endpoints
  name TEXT NOT NULL UNIQUE,
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercises (
  id SERIAL PRIMARY KEY,
  workout_id INT NULL REFERENCES workouts(id) ON DELETE CASCADE,
  exercise_id INT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  -- generic columns for the scaffold CRUD endpoints
  name TEXT NOT NULL DEFAULT 'Workout Exercise',
  description TEXT NULL,
  exercise_order INT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS workout_exercise_sets (
  id SERIAL PRIMARY KEY,
  workout_exercise_id INT NULL REFERENCES workout_exercises(id) ON DELETE CASCADE,
  set_index INT NULL,
  reps INT NULL,
  weight NUMERIC NULL,
  -- generic columns for the scaffold CRUD endpoints
  name TEXT NOT NULL DEFAULT 'Set',
  description TEXT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- If tables already exist, ensure the column exists too.
ALTER TABLE workout_exercises ADD COLUMN IF NOT EXISTS exercise_order INT NULL;

