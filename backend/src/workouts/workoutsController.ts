import type { Request, Response } from "express";
import {
  addExerciseToWorkout,
  addSetToWorkoutExercise,
  createWorkout,
  getWorkouts
} from "./workoutsService";

function parseIntOr(value: unknown, fallback: number): number {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export async function getWorkoutsController(req: Request, res: Response) {
  const user = res.locals.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const limit = Math.min(parseIntOr(req.query.limit, 20), 100);
  const offset = Math.max(parseIntOr(req.query.offset, 0), 0);

  try {
    const workouts = await getWorkouts(user.id, { limit, offset });
    res.json({ data: workouts });
  } catch (err) {
    res.status(500).json({
      error: err instanceof Error ? err.message : "Server error"
    });
  }
}

function parseStringOr(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function parseNumberOr(value: unknown): number | undefined {
  const n = Number(value);
  if (!Number.isFinite(n)) return undefined;
  return n;
}

function parseRequiredNumber(value: unknown, fieldName: string): number {
  const n = Number(value);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid ${fieldName}`);
  }
  return n;
}

export async function createWorkoutController(req: Request, res: Response) {
  const user = res.locals.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const workout_date = parseStringOr(req.body?.workout_date);
  const notes = parseStringOr(req.body?.notes);

  try {
    const workout = await createWorkout(user.id, { workout_date, notes });
    res.status(201).json({ data: workout });
  } catch (err) {
    res.status(400).json({
      error: err instanceof Error ? err.message : "Bad request"
    });
  }
}

export async function addExerciseToWorkoutController(req: Request, res: Response) {
  const user = res.locals.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const workoutId = parseIntOr(req.params.workoutId, NaN);
  if (!Number.isFinite(workoutId)) {
    res.status(400).json({ error: "Invalid workoutId" });
    return;
  }

  const exerciseId = parseRequiredNumber(req.body?.exercise_id, "exercise_id");
  const order = parseNumberOr(req.body?.order);

  try {
    const workoutExercise = await addExerciseToWorkout({
      userId: user.id,
      workoutId,
      exerciseId,
      order: order !== undefined ? Math.trunc(order) : undefined
    });
    res.status(201).json({ data: workoutExercise });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message.toLowerCase().includes("not found")) {
      res.status(404).json({ error: message });
      return;
    }
    res.status(400).json({ error: message });
  }
}

export async function addSetToWorkoutExerciseController(req: Request, res: Response) {
  const user = res.locals.user;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const workoutExerciseId = parseIntOr(req.params.workoutExerciseId, NaN);
  if (!Number.isFinite(workoutExerciseId)) {
    res.status(400).json({ error: "Invalid workoutExerciseId" });
    return;
  }

  const reps = parseRequiredNumber(req.body?.reps, "reps");
  const weight = parseRequiredNumber(req.body?.weight, "weight");
  const setIndex = parseNumberOr(req.body?.set_index);

  try {
    const set = await addSetToWorkoutExercise({
      userId: user.id,
      workoutExerciseId,
      setIndex: setIndex !== undefined ? Math.trunc(setIndex) : undefined,
      reps,
      weight
    });
    res.status(201).json({ data: set });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Server error";
    if (message.toLowerCase().includes("not found")) {
      res.status(404).json({ error: message });
      return;
    }
    res.status(400).json({ error: message });
  }
}

