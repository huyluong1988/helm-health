/// <reference types="jest" />

import { setToken } from "./apiAuth";
import { addExerciseToWorkout, addSet, createWorkout, getWorkouts } from "./apiWorkouts";

describe("apiWorkouts", () => {
  beforeEach(() => {
    localStorage.clear();
    setToken("test-token");

    (globalThis.fetch as unknown as jest.Mock) = jest.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({
        data: []
      })
    });
  });

  it("getWorkouts calls /workouts with auth header", async () => {
    await getWorkouts({ limit: 10, offset: 2 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as unknown as jest.Mock).mock.calls[0];

    expect(String(url)).toContain("/workouts");
    expect(String(url)).toContain("limit=10");
    expect(String(url)).toContain("offset=2");

    const headers = (init as RequestInit).headers as Headers;
    expect(headers.get("Authorization")).toBe("Bearer test-token");
  });

  it("createWorkout posts to /workouts", async () => {
    await createWorkout({ workout_date: "2026-01-01", notes: "test" });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as unknown as jest.Mock).mock.calls[0];

    expect(String(url)).toContain("/workouts");
    expect((init as RequestInit).method).toBe("POST");
  });

  it("addExerciseToWorkout posts to /workouts/:id/exercises", async () => {
    await addExerciseToWorkout({ workoutId: 1, exerciseId: 42, order: 0 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as unknown as jest.Mock).mock.calls[0];

    expect(String(url)).toContain("/workouts/1/exercises");
    expect((init as RequestInit).method).toBe("POST");
  });

  it("addSet posts to /workout_exercises/:id/sets", async () => {
    await addSet({ workoutExerciseId: 99, setIndex: 1, reps: 8, weight: 100 });

    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (globalThis.fetch as unknown as jest.Mock).mock.calls[0];

    expect(String(url)).toContain("/workout_exercises/99/sets");
    expect((init as RequestInit).method).toBe("POST");
  });
});

