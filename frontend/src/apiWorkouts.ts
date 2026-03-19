import { apiFetch } from "./apiAuth";

export type WorkoutRow = {
  id: number;
  user_id: number | null;
  workout_date: string | null;
  notes: string | null;
  created_at: string;
};

export async function getWorkouts(opts?: { limit?: number; offset?: number }) {
  const params = new URLSearchParams();
  if (opts?.limit !== undefined) params.set("limit", String(opts.limit));
  if (opts?.offset !== undefined) params.set("offset", String(opts.offset));

  const qs = params.toString();
  const path = `/workouts${qs ? `?${qs}` : ""}`;
  const data = await apiFetch<{ data: WorkoutRow[] }>(path);
  return data.data;
}

export async function createWorkout(payload: {
  workout_date?: string;
  notes?: string;
}) {
  const data = await apiFetch<{ data: unknown }>("/workouts", {
    method: "POST",
    body: JSON.stringify(payload)
  });
  return data.data;
}

export async function addExerciseToWorkout(payload: {
  workoutId: number;
  exerciseId: number;
  order?: number;
}) {
  const data = await apiFetch<{ data: unknown }>(
    `/workouts/${payload.workoutId}/exercises`,
    {
      method: "POST",
      body: JSON.stringify({
        exercise_id: payload.exerciseId,
        order: payload.order ?? 0
      })
    }
  );
  return data.data;
}

export async function addSet(payload: {
  workoutExerciseId: number;
  setIndex?: number;
  reps: number;
  weight: number;
}) {
  const data = await apiFetch<{ data: unknown }>(
    `/workout_exercises/${payload.workoutExerciseId}/sets`,
    {
      method: "POST",
      body: JSON.stringify({
        set_index: payload.setIndex ?? 0,
        reps: payload.reps,
        weight: payload.weight
      })
    }
  );
  return data.data;
}

