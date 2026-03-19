import React, { useEffect, useMemo, useState } from "react";
import { type AuthUser, getMe, loginDummy, setToken } from "./apiAuth";
import {
  type WorkoutRow,
  addExerciseToWorkout,
  addSet,
  createWorkout,
  getWorkouts
} from "./apiWorkouts";

function todayISODate(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function ErrorBox({ message }: { message: string }) {
  return (
    <div
      style={{
        border: "1px solid #f2b8b5",
        background: "#fff3f3",
        padding: 12,
        borderRadius: 8,
        marginBottom: 12
      }}
    >
      <b>Error:</b> {message}
    </div>
  );
}

function Section({
  title,
  children
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div style={{ border: "1px solid #ddd", borderRadius: 8, padding: 16, marginBottom: 16 }}>
      <h2 style={{ marginTop: 0 }}>{title}</h2>
      {children}
    </div>
  );
}

export default function App() {
  const [tokenStatus, setTokenStatus] = useState<"unknown" | "authed" | "loggedOut">("unknown");
  const [meName, setMeName] = useState<string>("");
  const [loginName, setLoginName] = useState<string>("alice");

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // Core feature: view workout history
  const [workouts, setWorkouts] = useState<WorkoutRow[]>([]);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<number | undefined>(undefined);

  const selectedWorkoutLabel = useMemo(() => {
    const w = workouts.find((x) => x.id === selectedWorkoutId);
    if (!w) return "None selected";
    return `Workout #${w.id}${w.workout_date ? ` (${w.workout_date})` : ""}`;
  }, [selectedWorkoutId, workouts]);

  // Core feature 1: dummy login
  async function refreshAuth() {
    setError("");
    try {
      const me: AuthUser = await getMe();
      setMeName(me.name);
      setTokenStatus("authed");
    } catch {
      setTokenStatus("loggedOut");
    }
  }

  useEffect(() => {
    refreshAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadWorkouts() {
    setLoading(true);
    setError("");
    try {
      const data = await getWorkouts({ limit: 50, offset: 0 });
      setWorkouts(data);
      setSelectedWorkoutId((prev) => prev ?? data[0]?.id);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setWorkouts([]);
      setSelectedWorkoutId(undefined);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (tokenStatus === "authed") {
      loadWorkouts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokenStatus]);

  async function onLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await loginDummy(loginName);
      setMeName(res.name);
      setTokenStatus("authed");
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  function onLogout() {
    setTokenStatus("loggedOut");
    setMeName("");
    setToken(null);
    setWorkouts([]);
    setSelectedWorkoutId(undefined);
  }

  // Core feature 2: log a workout (scaffold; POST endpoint to be added later)
  const [workoutDate, setWorkoutDate] = useState<string>(todayISODate());
  const [workoutNotes, setWorkoutNotes] = useState<string>("");

  async function onLogWorkout() {
    setLoading(true);
    setError("");
    try {
      await createWorkout({
        workout_date: workoutDate || undefined,
        notes: workoutNotes || undefined
      });
      setWorkoutNotes("");
      await loadWorkouts();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  // Core feature 3: add exercises to a workout (scaffold; backend endpoint to be added later)
  const [exerciseId, setExerciseId] = useState<number>(1);
  const [exerciseOrder, setExerciseOrder] = useState<number>(0);
  const [workoutExerciseId, setWorkoutExerciseId] = useState<number | undefined>(undefined);

  async function onAddExercise() {
    if (!selectedWorkoutId) {
      setError("Pick a workout first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      const res = await addExerciseToWorkout({
        workoutId: selectedWorkoutId,
        exerciseId,
        order: exerciseOrder
      });
      const maybeId = (res as any)?.id;
      if (typeof maybeId === "number") setWorkoutExerciseId(maybeId);
      else setWorkoutExerciseId(undefined);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setWorkoutExerciseId(undefined);
    } finally {
      setLoading(false);
    }
  }

  // Core feature 4: track sets (scaffold; backend endpoint to be added later)
  const [setIndex, setSetIndex] = useState<number>(0);
  const [reps, setReps] = useState<number>(10);
  const [weight, setWeight] = useState<number>(100);

  async function onAddSet() {
    if (!workoutExerciseId) {
      setError("Add an exercise to the workout first.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await addSet({
        workoutExerciseId,
        setIndex,
        reps,
        weight
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 920, margin: "24px auto", padding: "0 16px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ marginBottom: 6 }}>Workout Log - Interview Scaffold</h1>
      <p style={{ marginTop: 0, color: "#444" }}>
        Core flow: dummy auth + <b>workout history</b> from Postgres. Other features are scaffolded and wired to expected endpoints.
      </p>

      {error ? <ErrorBox message={error} /> : null}
{/* login section */}
      {tokenStatus !== "authed" ? (
        <Section title="Dummy Login">
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              value={loginName}
              onChange={(e) => setLoginName(e.target.value)}
              placeholder="Your name"
              style={{ flex: 1, padding: 8 }}
            />
            <button onClick={onLogin} disabled={loading}>
              Login
            </button>
          </div>
          <div style={{ marginTop: 8, color: "#666" }}>
            Any name works; backend issues a demo token.
          </div>
        </Section>
      ) : (
        <Section title="Session">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
            <div style={{ color: "#444" }}>
              Logged in as <b>{meName}</b>
            </div>
            <button onClick={onLogout} disabled={loading}>
              Logout
            </button>
          </div>
        </Section>
      )}
{/* workout history section */}
      {tokenStatus === "authed" ? (
        <>
          <Section
            title="Workout History"
          >
            <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
              <button onClick={() => loadWorkouts()} disabled={loading}>
                Refresh
              </button>
              <div style={{ color: "#666" }}>{selectedWorkoutLabel}</div>
            </div>

            <div style={{ maxHeight: 260, overflow: "auto", border: "1px solid #eee", borderRadius: 8 }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ textAlign: "left" }}>
                    <th style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>ID</th>
                    <th style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>Date</th>
                    <th style={{ borderBottom: "1px solid #eee", padding: "8px 6px" }}>Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {workouts.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ padding: "10px 6px", color: "#666" }}>
                        No workouts yet.
                      </td>
                    </tr>
                  ) : (
                    workouts.map((w) => (
                      <tr
                        key={w.id}
                        onClick={() => {
                          setSelectedWorkoutId(w.id);
                          setWorkoutExerciseId(undefined);
                        }}
                        style={{
                          cursor: "pointer",
                          background: w.id === selectedWorkoutId ? "#fafafa" : "transparent"
                        }}
                      >
                        <td style={{ borderBottom: "1px solid #f5f5f5", padding: "8px 6px" }}>{w.id}</td>
                        <td style={{ borderBottom: "1px solid #f5f5f5", padding: "8px 6px" }}>
                          {w.workout_date ?? ""}
                        </td>
                        <td style={{ borderBottom: "1px solid #f5f5f5", padding: "8px 6px" }}>
                          {w.notes ?? ""}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Section>
{/* log a workout section */}
          <Section title="Log a Workout">
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <label>
                Date{" "}
                <input
                  type="date"
                  value={workoutDate}
                  onChange={(e) => setWorkoutDate(e.target.value)}
                  style={{ padding: 8 }}
                  disabled={loading}
                />
              </label>
              <label style={{ flex: 1, minWidth: 240 }}>
                Notes{" "}
                <input
                  value={workoutNotes}
                  onChange={(e) => setWorkoutNotes(e.target.value)}
                  placeholder="e.g. leg day"
                  style={{ padding: 8, width: "100%" }}
                  disabled={loading}
                />
              </label>
              <button onClick={onLogWorkout} disabled={loading}>
                Log workout
              </button>
            </div>
            <div style={{ marginTop: 8, color: "#666" }}>
              UI is wired to an expected <code>POST /workouts</code> endpoint (not added yet).
            </div>
          </Section>

          <Section title="Add Exercise to Workout">
            <div style={{ color: "#666", marginBottom: 8 }}>Selected workout ID: {selectedWorkoutId ?? "None"}</div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <label>
                Exercise ID{" "}
                <input
                  type="number"
                  value={exerciseId}
                  onChange={(e) => setExerciseId(Number(e.target.value))}
                  style={{ padding: 8, width: 120 }}
                  disabled={loading || selectedWorkoutId == null}
                />
              </label>
              <label>
                Order{" "}
                <input
                  type="number"
                  value={exerciseOrder}
                  onChange={(e) => setExerciseOrder(Number(e.target.value))}
                  style={{ padding: 8, width: 120 }}
                  disabled={loading || selectedWorkoutId == null}
                />
              </label>
              <button onClick={onAddExercise} disabled={loading || selectedWorkoutId == null}>
                Add exercise
              </button>
            </div>
            <div style={{ marginTop: 8, color: "#666" }}>
              Sets live under <code>workout_exercises</code> (expected <code>POST /workouts/:workoutId/exercises</code>).
            </div>
          </Section>

          <Section title="Track Sets (reps, weight)">
            <div style={{ color: "#666", marginBottom: 8 }}>
              Selected workout_exercise ID: {workoutExerciseId ?? "None (add exercise first)"}
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <label>
                Set Index{" "}
                <input
                  type="number"
                  value={setIndex}
                  onChange={(e) => setSetIndex(Number(e.target.value))}
                  style={{ padding: 8, width: 120 }}
                  disabled={loading || workoutExerciseId == null}
                />
              </label>
              <label>
                Reps{" "}
                <input
                  type="number"
                  value={reps}
                  onChange={(e) => setReps(Number(e.target.value))}
                  style={{ padding: 8, width: 120 }}
                  disabled={loading || workoutExerciseId == null}
                />
              </label>
              <label>
                Weight{" "}
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  style={{ padding: 8, width: 120 }}
                  disabled={loading || workoutExerciseId == null}
                />
              </label>
              <button onClick={onAddSet} disabled={loading || workoutExerciseId == null}>
                Add set
              </button>
            </div>
          </Section>
        </>
      ) : null}
    </div>
  );
}

