import { query } from "../db";

export type WorkoutRow = {
  id: number;
  user_id: number | null;
  workout_date: string | null;
  notes: string | null;
  created_at: string;
};

export type GetWorkoutsOptions = { limit: number; offset: number };

export async function getWorkoutsByUserId(
  userId: number,
  opts: GetWorkoutsOptions
): Promise<WorkoutRow[]> {
  const rows = await query<WorkoutRow>(
    `
      SELECT
        id,
        user_id,
        workout_date,
        notes,
        created_at
      FROM workouts
      WHERE user_id = $1
      ORDER BY workout_date DESC NULLS LAST, created_at DESC
      LIMIT $2 OFFSET $3
    `,
    [userId, opts.limit, opts.offset]
  );

  return rows;
}

export type WorkoutExerciseRow = {
  id: number;
  workout_id: number | null;
  exercise_id: number | null;
  exercise_order: number | null;
  created_at: string;
};

export type WorkoutExerciseSetRow = {
  id: number;
  workout_exercise_id: number | null;
  set_index: number | null;
  reps: number | null;
  weight: string | number | null;
  created_at: string;
};

export async function createWorkoutForUser(
  userId: number,
  payload: { workout_date?: string; notes?: string }
): Promise<WorkoutRow> {
  const rows = await query<WorkoutRow>(
    `
      INSERT INTO workouts (user_id, workout_date, notes)
      VALUES ($1, $2, $3)
      RETURNING id, user_id, workout_date, notes, created_at
    `,
    [userId, payload.workout_date ?? null, payload.notes ?? null]
  );

  // Insert returns exactly one row.
  return rows[0];
}

export async function addExerciseToWorkoutForUser(params: {
  userId: number;
  workoutId: number;
  exerciseId: number;
  order?: number;
}): Promise<WorkoutExerciseRow> {
  // Ensure the workout belongs to the authenticated user.
  const ownership = await query<{ ok: boolean }>(
    `
      SELECT EXISTS(
        SELECT 1
        FROM workouts w
        WHERE w.id = $1 AND w.user_id = $2
      ) AS ok
    `,
    [params.workoutId, params.userId]
  );

  if (!ownership[0]?.ok) {
    throw new Error("Workout not found");
  }

  const rows = await query<WorkoutExerciseRow>(
    `
      INSERT INTO workout_exercises (workout_id, exercise_id, exercise_order)
      VALUES ($1, $2, $3)
      RETURNING id, workout_id, exercise_id, exercise_order, created_at
    `,
    [params.workoutId, params.exerciseId, params.order ?? null]
  );

  return rows[0];
}

export async function addSetToWorkoutExerciseForUser(params: {
  userId: number;
  workoutExerciseId: number;
  setIndex?: number;
  reps: number;
  weight: number;
}): Promise<WorkoutExerciseSetRow> {
  // Ensure the workout_exercise belongs to a workout owned by this user.
  const ownership = await query<{ ok: boolean }>(
    `
      SELECT EXISTS(
        SELECT 1
        FROM workout_exercises we
        JOIN workouts w ON w.id = we.workout_id
        WHERE we.id = $1 AND w.user_id = $2
      ) AS ok
    `,
    [params.workoutExerciseId, params.userId]
  );

  if (!ownership[0]?.ok) {
    throw new Error("Workout exercise not found");
  }

  const rows = await query<WorkoutExerciseSetRow>(
    `
      INSERT INTO workout_exercise_sets (workout_exercise_id, set_index, reps, weight)
      VALUES ($1, $2, $3, $4)
      RETURNING
        id,
        workout_exercise_id,
        set_index,
        reps,
        weight,
        created_at
    `,
    [
      params.workoutExerciseId,
      params.setIndex ?? null,
      params.reps,
      params.weight
    ]
  );

  return rows[0];
}

