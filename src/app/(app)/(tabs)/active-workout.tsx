import {
  View,
  Text,
  StatusBar,
  Platform,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  ScrollView,
  TextInput, ActivityIndicator
} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from "react-native-safe-area-context";
import {useStopwatch} from "react-timer-hook";
import {useWorkoutStore, WorkoutSet} from "../../../../store/workout-store";
import {router, useFocusEffect} from "expo-router";
import {Ionicons} from "@expo/vector-icons";
import ExerciseSelectionModal from "@/app/components/ExerciseSelectionModal";
import exercise from "../../../../sanity/schemaTypes/exercise";
import {client} from "@/lib/sanity/client";
import {defineQuery} from "groq";
import {WorkoutData} from "@/app/api/save-workout+api";
import {useUser} from "@clerk/clerk-expo";


export const findExerciseQuery = defineQuery(`*[_type == "exercise" && name == $name][0] {
  _id,
  name
}`)

export default function ActiveWorkout() {
  const {user} = useUser()
  const [showExerciseSelection, setShowExerciseSelection] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const {workoutExercises, setWorkoutExercise, setWeightUnit, weightUnit, resetWorkout} = useWorkoutStore()
  const {seconds, minutes, hours, totalSeconds, reset} = useStopwatch({autoStart: true})

  useFocusEffect(
      React.useCallback(() => {
        if (workoutExercises.length === 0) {
          reset()
        }
      }, [workoutExercises.length, reset])
  )


  const getWorkoutDuration = () => {
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`
  }

  // import {nanoid} from 'nanoid'

  const saveWorkoutToDatabase = async () => {
    if (isSaving) return false
    setIsSaving(true)

    try {
      const durationInSeconds = totalSeconds

      // Transform exercises data to match Sanity schema
      const exercisesForSanity = await Promise.all(
          workoutExercises.map(async (exercise) => {
            const exerciseDoc = await client.fetch(findExerciseQuery, {name: exercise.name})

            if (!exerciseDoc) {
              throw new Error(`Exercise "${exercise.name}" not found in database`)
            }

            // Transform and filter sets
            // const setsForSanity = exercise.sets
            //     .filter((set) => set.isCompleted && set.reps !== null && set.weight !== null)
            //     .map((set) => ({
            //       _type: "set",
            //       _key: Math.random().toString(36).substr(2, 9),
            //       reps: isNaN(parseInt(set.reps, 10)) ? 0 : parseInt(set.reps, 10),
            //       weight: isNaN(parseFloat(set.weight)) ? 0 : parseFloat(set.weight),
            //       weightUnit: set.weightUnit,
            //     }));
            const setsForSanity = exercise.sets
                .filter((set) => set.isCompleted && set.reps !== null && set.weight !== null)
                .map((set) => {
                  // Add console logs here

                  return {
                    _type: "object", // or "object" if your schema expects "object"
                    _key: Math.random().toString(36).substr(2, 9),
                    reps: isNaN(parseInt(set.reps, 10)) ? null : parseInt(set.reps, 10),
                    weight: isNaN(parseFloat(set.weight)) ? null : parseFloat(set.weight),
                    weightUnit: set.weightUnit,
                  };
                });


            if (setsForSanity.length === 0) {
              return null // Skip this exercise entirely
            }

            return {
              _type: 'object', // Use explicit type instead of "object"
              _key: Math.random().toString(36).substr(2, 9),
              exercise: {
                _type: 'reference',
                _ref: exerciseDoc._id
              },
              sets: setsForSanity
            }
          })
      )

      const validExercises = exercisesForSanity.filter(Boolean)

      if (validExercises.length === 0) {
        Alert.alert('Save failed', 'Please complete at least one set before saving.')
        return false
      }

      const workoutData: WorkoutData = {
        _type: 'workout',
        userId: user.id,
        date: new Date().toISOString(),
        duration: durationInSeconds,
        exercises: validExercises
      }

      const result = await fetch('/api/save-workout', {
        method: 'POST',
        body: JSON.stringify({workoutData})
      })

      console.log(JSON.stringify({workoutData}, null, 2))
      console.log('Saved successfully', result)

      return true
    } catch (error) {
      console.error(error)
      Alert.alert('Save failed', error.message || 'An error occurred')
      return false
    } finally {
      setIsSaving(false)
    }
  }


  // const saveWorkoutToDatabase = async () => {
  //   if (isSaving) return false
  //   setIsSaving(true)
  //
  //   try {
  //     // Use stopwatch total seconds for duration
  //     const durationInSeconds = totalSeconds
  //
  //     //Transform exercises data to match sanity schema
  //     const exercisesForSanity = await Promise.all(
  //         workoutExercises.map(async (exercise) => {
  //           const exerciseDoc = await client.fetch(findExerciseQuery, {name: exercise.name})
  //
  //           if (!exerciseDoc) {
  //             throw new Error(`Exercise "${exercise.name}" not found in database`)
  //           }
  //
  //           //Transform sets to match schema (only completed sets, convert to numbers
  //           const setsForSanity = exercise.sets.filter((set) => set.isCompleted && set.reps && set.weight)
  //               .map((set) => ({
  //                 _type: "object",
  //                 _key: Math.random().toString(36).substr(2, 9),
  //                 reps: parseInt(set.reps, 10) || 0,
  //                 weight: parseFloat(set.weight) || 0,
  //                 weightUnit: set.weightUnit
  //               }))
  //
  //           return {
  //             _type: "object",
  //             _key: Math.random().toString(36).substr(2, 9),
  //             exercise: {
  //               _type: "reference",
  //               _ref: exerciseDoc._id
  //             },
  //             sets: setsForSanity
  //           }
  //         })
  //     )
  //
  //     const validExercises = exercisesForSanity.filter((exercise) => exercise.sets.length > 0)
  //     if (validExercises.length === 0) {
  //       Alert.alert("Save failed", "Failed to save workout")
  //       return false
  //     }
  //
  //     const workoutData: WorkoutData = {
  //       _type: "workout",
  //       userId: user.id,
  //       date: new Date().toString(),
  //       duration: durationInSeconds,
  //       exercises: validExercises
  //     }
  //
  //     const result = await fetch("/api/save-workout", {
  //       method: "POST",
  //       body: JSON.stringify({workoutData}),
  //     })
  //
  //     console.log(JSON.stringify({workoutData}))
  //
  //     console.log("Saved successfully", result)
  //     return true
  //   } catch (error) {
  //     console.log(error)
  //     Alert.alert("No completed sets", "Please complete a set before saving")
  //     return false
  //   }
  // }

  const endWorkout = async () => {
    const saved = await saveWorkoutToDatabase()

    if (saved) {
      Alert.alert("Workout saved", "Your workout has been saved successfully!")
      resetWorkout()

      router.replace("/(app)/(tabs)/history?refresh=true")
    }
  }

  const saveWorkout = () => {
    Alert.alert(
        "Complete Workout",
        "Are you sure you want to complete the workout?",
        [{text: "Cancel", style: "cancel"}, {text: "Complete", onPress: async () => await endWorkout()}],
    )
  }

  const cancelWorkout = () => {
    Alert.alert(
        "Cancel Workout",
        "Are you sure you want to cancel the workout?",
        [
          {text: "Cancel", style: "cancel"},
          {
            text: "End Workout",
            onPress: () => {
              resetWorkout()
              router.back()
            }
          }
        ]
    )
  }

  const addExercise = () => {
    setShowExerciseSelection(true)
  }


  const deleteExercise = (id: string) => {
    setWorkoutExercise((exercises) =>
        exercises.filter((exercise) => exercise.id !== id)
    )
  }

  const addNewSet = (exerciseId: string) => {
    const newSet: WorkoutSet = {
      id: Math.random().toString(),
      reps: "",
      weight: "",
      weightUnit: weightUnit,
      isCompleted: false
    }

    setWorkoutExercise((exercises) =>
        exercises.map((exercise) =>
            exercise.id === exerciseId
                ? {...exercise, sets: [...exercise.sets, newSet]}
                : exercise
        )
    )
  }

  const updateSet = (exerciseId: string, setId: string, field: "reps" | "weight", value: string) => {
    setWorkoutExercise((exercises) => exercises.map((exercise) =>
        exercise.id === exerciseId ?
            {
              ...exercise,
              sets: exercise.sets.map((set) => set.id === setId ? {...set, [field]: value} : set)
            } : exercise
    ))
  }

  const deleteSet = (exerciseId: string, setId: string) => {
    setWorkoutExercise((exercises) => exercises.map((exercise) =>
        exercise.id === exerciseId ?
            {
              ...exercise,
              sets: exercise.sets.filter((set) => set.id !== setId)
            } : exercise
    ))
  }

  const toggleSetCompletion = (exerciseId: string, setId: string) => {
    setWorkoutExercise((exercises) => exercises.map((exercise) =>
        exercise.id === exerciseId ?
            {
              ...exercise,
              sets: exercise.sets.map((set) => set.id === setId ? {...set, isCompleted: !set.isCompleted} : set)
            } : exercise
    ))
  }


  return (
      <View className="flex-1">
        <StatusBar barStyle="light-content" backgroundColor={"#1f2937"}/>
        <View className="bg-gray-800" style={{paddingTop: Platform.OS === 'ios' ? 55 : StatusBar.currentHeight || 0}}/>
        <View className="bg-gray-800 px-6 py-4">
          <View className="flex-row items-center justify-between">
            <View>
              <Text className="text-white text-xl font-semibold">Active Workout</Text>

              <Text className="text-gray-300">{getWorkoutDuration()}</Text>
            </View>
            <View className="flex-row items-center space-x-3 gap-2">
              <View className="flex-row bg-gray-700 rounded-lg py-1">
                <TouchableOpacity
                    onPress={() => setWeightUnit("lbs")}
                    className={`px-3 py-1 rounded ${weightUnit === "lbs" ? "bg-blue-600" : ""}`}
                >
                  <Text
                      className={`text-sm font-medium ${weightUnit === "lbs" ? "text-white" : "text-gray-300"}`}>
                    lbs
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => setWeightUnit("kg")}
                    className={`px-3 py-1 rounded ${weightUnit === "kg" ? "bg-blue-600" : ""}`}
                >
                  <Text
                      className={`text-sm font-medium ${weightUnit === "kg" ? "text-white" : "text-gray-300"}`}>
                    kg
                  </Text>
                </TouchableOpacity>
              </View>

              <TouchableOpacity
                  onPress={cancelWorkout}
                  className="bg-red-600 px-4 py-2 rounded-lg"
              >
                <Text className="text-white font-medium">End Workout</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View className="flex-1 bg-white">
          <View className="px-6 mt-4">
            <Text className="text-center text-gray-600 mb-2">
              {workoutExercises.length} exercises
            </Text>
          </View>
          {
              workoutExercises.length === 0 && (
                  <View className="bg-gray-50 rounded-2xl p-8 items-center mx-6">
                    <Ionicons name="barbell-outline" size={48} color={"#9ca3af"}/>
                    <Text className="text-lg text-gray-600 text-center mt-4">
                      No exercises yet
                    </Text>
                    <Text className="text-gray-500 text-center mt-2">
                      Get started by adding your first exercise below
                    </Text>
                  </View>
              )
          }

          <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? "padding" : "height"}
              className="flex-1"
          >
            <ScrollView className="flex-1 px-6 mt-4">
              {
                workoutExercises.map((exercise, index) => (
                    <View key={exercise.id} className="mb-8">
                      <TouchableOpacity
                          onPress={() => router.push({pathname: "/exercise-detail", params: {id: exercise.sanityId}})}
                          className="bg-blue-50 rounded-2xl p-4 mb-3"
                      >
                        <View className="flex-row items-center justify-between">
                          <View className="flex-1">
                            <Text className="text-xl font-bold text-gray-900 mb-2">
                              {exercise.name}
                            </Text>
                            <Text className="text-gray-600">
                              {exercise.sets.length} sets {" "}
                              {exercise.sets.filter((set) => set.isCompleted).length} {" "} completed
                            </Text>
                          </View>

                          <TouchableOpacity
                              onPress={() => deleteExercise(exercise.id)}
                              className="w-10 h-10 rounded-xl items-center justify-center bg-red-500 ml-3"
                              activeOpacity={0.8}
                          >
                            <Ionicons name="trash" size={16} color={"white"}/>
                          </TouchableOpacity>
                        </View>
                      </TouchableOpacity>

                      <View className="bg-white rounded-2xl p-4 shadow-sm border-gray-100border mb-3">
                        <Text className="text-lg font-semibold text-gray-900 mb-3">
                          Sets
                        </Text>
                        {
                          exercise.sets.length === 0 ? (
                              <Text className="text-gray-500 text-center py-4">
                                No sets yet. Add your first set below.
                              </Text>
                          ) : (
                              exercise.sets.map((set, index) => (
                                  <View
                                      key={set.id}
                                      className={`px-3 py-3 mb-2 rounded-lg border 
                                      ${set.isCompleted ? "bg-green-100 border-green-300" : "bg-gray-50 border-gray-200"}`}
                                  >
                                    <View className="flex-row items-center justify-between">
                                      <Text className="text-gray-700">
                                        {index + 1}
                                      </Text>

                                      <View className="flex-1 mx-2">
                                        <Text className="text-gray-500 text-xs mb-1">
                                          Reps
                                        </Text>
                                        <TextInput
                                            value={set.reps}
                                            onChangeText={(value: any) => updateSet(exercise.id, set.id, "reps", value)}
                                            placeholder="0"
                                            keyboardType={"numeric"}
                                            className={`border rounded-lg px-3 py-2 text-center ${
                                                set.isCompleted ? "bg-gray-100 border-gray-300 text-gray-500" : "bg-white border-gray-300 text-black"}`
                                            }
                                            editable={!set.isCompleted}
                                        />
                                      </View>

                                      <View className="flex-1 mx-2">
                                        <Text className="text-gray-500 text-xs mb-1">
                                          Weight({weightUnit})
                                        </Text>
                                        <TextInput
                                            value={set.weight}
                                            onChangeText={(value) => updateSet(exercise.id, set.id, "weight", value)}
                                            placeholder="0"
                                            keyboardType={"numeric"}
                                            className={`border rounded-lg px-3 py-2 text-center ${
                                                set.isCompleted ? "bg-gray-100 border-gray-300 text-gray-500" : "bg-white border-gray-300 text-black"}`
                                            }
                                            editable={!set.isCompleted}
                                        />
                                      </View>
                                      <TouchableOpacity
                                          onPress={() => toggleSetCompletion(exercise.id, set.id)}
                                          className={`w-12 h-12 rounded-xl items-center justify-center mx-1 ${
                                              set.isCompleted ? "bg-green-500" : "bg-gray-200"}`
                                          }
                                      >
                                        <Ionicons
                                            name={set.isCompleted ? "checkmark" : "checkmark-outline"}
                                            size={20}
                                            color={set.isCompleted ? "white" : "#9ca3af"}
                                        />
                                      </TouchableOpacity>

                                      <TouchableOpacity
                                          onPress={() => deleteSet(exercise.id, set.id)}
                                          className="w-12 h-12 rounded-xl items-center justify-center mx-1 bg-red-500"
                                      >
                                        <Ionicons
                                            name="trash"
                                            size={16}
                                            color="white"
                                        />
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                              ))
                          )
                        }

                        {/*Sets Button*/}
                        <TouchableOpacity
                            onPress={() => addNewSet(exercise.id)}
                            className="bg-blue-100 border-2 border-dashed border-blue-300 rounded-lg py-3 items-center mt-2"
                        >
                          <View className="flex-row items-center">
                            <Ionicons name="add" size={16} color={"#3b82f6"} style={{marginRight: 6}}/>
                            <Text className="text-blue-600 font-medium">
                              Add Set
                            </Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                ))
              }
              <TouchableOpacity
                  onPress={addExercise}
                  className="bg-blue-600 py-4 items-center mb-8 active:bg-blue-700 rounded-xl"
                  activeOpacity={0.8}
              >
                <View className="flex-row items-center">
                  <Ionicons name="add" size={20} color={"white"} style={{marginRight: 8}}/>
                  <Text className="text-white font-semibold">
                    Add Exercise
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                  onPress={saveWorkout}
                  className={`rounded-2xl py-4 items-center mb-8 ${
                      isSaving ||
                      workoutExercises.length === 0 ||
                      workoutExercises.some((exercise) =>
                          exercise.sets.some((set) => !set.isCompleted)) ? "bg-gray-400" : "bg-green-600 active:bg-green-700"
                  }`}
                  disabled={
                      isSaving ||
                      workoutExercises.length === 0 ||
                      workoutExercises.some((exercise) =>
                          exercise.sets.some((set) => !set.isCompleted)
                      )
                  }
              >
                {
                  isSaving ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size={"small"} color={"white"}/>
                        <Text className="text-white font-semibold text-lg ml-2">
                          Saving...
                        </Text>
                      </View>
                  ) : (
                      <Text className="text-white font-semibold text-lg">
                        Complete Workout
                      </Text>
                  )
                }
              </TouchableOpacity>
            </ScrollView>
          </KeyboardAvoidingView>
        </View>

        <ExerciseSelectionModal
            visible={showExerciseSelection}
            onClose={() => setShowExerciseSelection(false)}
        />
      </View>
  )
}