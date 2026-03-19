import cors from "cors";
import express from "express";
import { getOrCreateUserByName, issueToken, requireAuth } from "./auth";
import {
  addExerciseToWorkoutController,
  addSetToWorkoutExerciseController,
  createWorkoutController,
  getWorkoutsController
} from "./workouts/workoutsController";

export const app = express();

app.use(cors({ origin: true }));
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/auth/login", async (req, res) => {
  try {
    const name = String(req.body?.name ?? "");
    const user = await getOrCreateUserByName(name);
    const token = issueToken(user);
    res.json({ token, user });
  } catch (err) {
    res.status(400).json({ error: err instanceof Error ? err.message : "Bad request" });
  }
});

app.get("/api/auth/me", requireAuth, (req, res) => {
  res.json({ user: res.locals.user });
});

// Core workouts endpoint (protected)
app.get("/workouts", requireAuth, getWorkoutsController);

// Create workout (protected)
app.post("/workouts", requireAuth, createWorkoutController);

// Add exercise to a workout (protected)
app.post(
  "/workouts/:workoutId/exercises",
  requireAuth,
  addExerciseToWorkoutController
);

// Add set to a workout exercise (protected)
app.post(
  "/workout_exercises/:workoutExerciseId/sets",
  requireAuth,
  addSetToWorkoutExerciseController
);

