export type ModelName =
  | "users"
  | "workouts"
  | "exercises"
  | "workout_exercises"
  | "workout_exercise_sets";

export type ModelDef = {
  modelName: ModelName;
  tableName: string;
  label: string;
};

export const modelDefs: ModelDef[] = [
  { modelName: "users", tableName: "users", label: "Users" },
  { modelName: "workouts", tableName: "workouts", label: "Workouts" },
  { modelName: "exercises", tableName: "exercises", label: "Exercises" },
  {
    modelName: "workout_exercises",
    tableName: "workout_exercises",
    label: "Workout Exercises"
  },
  {
    modelName: "workout_exercise_sets",
    tableName: "workout_exercise_sets",
    label: "Workout Exercise Sets"
  }
];

export function getModelDef(modelName: string): ModelDef | undefined {
  return modelDefs.find((m) => m.modelName === modelName);
}

