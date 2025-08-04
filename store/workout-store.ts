import {create} from "zustand/react";
import {createJSONStorage, persist} from "zustand/middleware";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface WorkoutSet {
  id: string
  reps: string
  weight: string
  weightUnit: "kg" | "lbs"
  isCompleted: boolean
}

interface WorkoutExercise {
  id: string
  sanityId: string
  name: string
  sets: WorkoutSet[]
}

interface WorkoutStore {
  workoutExercises: WorkoutExercise[];
  weightUnit: "kg" | "lbs"

  addExerciseToWorkout: (exercise: { name: string; sanityId: string }) => void
  setWorkoutExercise: (exercises: | WorkoutExercise[] | ((prev: WorkoutExercise[]) => WorkoutExercise[])) => void
  setWeightUnit: (unit: "kg" | "lbs") => void
  resetWorkout: () => void
}

export const useWorkoutStore = create<WorkoutStore>()(
    persist((set) => ({
          workoutExercises: [],
          weightUnit: "lbs",

          addExerciseToWorkout: (exercise) =>
              set((state) => {
                const newExercise: WorkoutExercise = {
                  id: Math.random().toString(),
                  sanityId: exercise.sanityId,
                  name: exercise.name,
                  sets: []
                }
                return {
                  workoutExercises: [...state.workoutExercises, newExercise],
                }
              }),
          setWorkoutExercise: (exercises) =>
              set((state) => ({
                workoutExercises: typeof exercises === "function" ? exercises(state.workoutExercises) : exercises
              })),
          setWeightUnit: (unit) =>
              set({
                weightUnit: unit,
              }),
          resetWorkout: () =>
              set({
                workoutExercises: [],
              })
        }),
        {
          name: "workout-store",
          storage: createJSONStorage(() => AsyncStorage),
          partialize: (state) => ({
            weightUnit: state.weightUnit,
          })
        }
    ))