import type {
  WorkoutExerciseRow,
  WorkoutExerciseSetRow,
  WorkoutRow
} from "./workoutsDb";
import {
  addExerciseToWorkoutForUser,
  addSetToWorkoutExerciseForUser,
  createWorkoutForUser,
  getWorkoutsByUserId
} from "./workoutsDb";

export type GetWorkoutsOptions = { limit: number; offset: number };

export async function getWorkouts(
  userId: number,
  opts: GetWorkoutsOptions
): Promise<WorkoutRow[]> {
  return getWorkoutsByUserId(userId, opts);
}

export async function createWorkout(
  userId: number,
  payload: { workout_date?: string; notes?: string }
): Promise<WorkoutRow> {
  return createWorkoutForUser(userId, payload);
}

export async function addExerciseToWorkout(params: {
  userId: number;
  workoutId: number;
  exerciseId: number;
  order?: number;
}): Promise<WorkoutExerciseRow> {
  return addExerciseToWorkoutForUser(params);
}

export async function addSetToWorkoutExercise(params: {
  userId: number;
  workoutExerciseId: number;
  setIndex?: number;
  reps: number;
  weight: number;
}): Promise<WorkoutExerciseSetRow> {
  return addSetToWorkoutExerciseForUser(params);
}

