import {SafeAreaView} from "react-native-safe-area-context";
import {ActivityIndicator, Alert, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {useLocalSearchParams, useRouter} from "expo-router";
import {defineQuery} from "groq";
import React, {useEffect, useState} from "react";
import {client} from "@/lib/sanity/client";
import {GetWorkoutRecordQueryResult} from "@/lib/sanity/types";
import {formatDate, formatDuration, formatTime, formatWorkoutDuration} from "../../../../../lib/utils/utils";
import {Ionicons} from "@expo/vector-icons";

const getWorkoutRecordQuery = defineQuery(`*[_type == "workout" && _id == $workoutId][0] {
  _id,
  _type,
  _ceatedAt,
  date,
  duration,
  exercises[] {
    exercise-> {
      _id,
      name,
      description
    },
    sets[] {
      reps,
      weight,
      weightUnit,
      _key,
      _type
    },
    _key,
    _type
  }
}`)

export default function WorkoutRecord() {
  const {workoutId} = useLocalSearchParams()
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)
  const [workout, setWorkout] = useState<GetWorkoutRecordQueryResult | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchWorkout = async () => {
      if (!workoutId) return

      try {
        const result = await client.fetch(getWorkoutRecordQuery, {workoutId})
        setWorkout(result)
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkout()
  }, [workoutId])

  const getTotalSets = () => {
    return (
        workout?.exercises.reduce((total, exercise) => {
          return total + (exercise.sets?.length || 0)
        }, 0) || 0
    )
  }


  const getTotalVolume = () => {
    let totalVolume = 0;
    let totalSets = 0;
    let unit = "lbs";

    workout?.exercises?.forEach(({sets}) => {
      sets?.forEach(({weight, reps, weightUnit}) => {
        if (weight && reps) {
          totalVolume += weight * reps;
          unit = weightUnit || unit;
        }
      });
      totalSets += sets?.length || 0;
    });

    return {totalVolume, totalSets, unit};
  };

  const handleDeleting = () => {
    Alert.alert(
        "Delete workout",
        "Are you sure you want to delete this workout? This action cannot be undone",
        [
          {
            text: "Cancel",
            style: "cancel",
          },
          {
            text: "Delete",
            style: "destructive",
            onPress: deleteWorkout
          }
        ]
    )
  }


  const deleteWorkout = async () => {
    if (!workoutId) return
    setDeleting(true)

    try {
      await fetch("/api/delete-workout", {
        method: "POST",
        body: JSON.stringify({workoutId})
      })

      router.replace("/(app)/(tabs)/history?refresh=true")
    } catch (error) {
      console.error(error)
      Alert.alert("Error", "Failed to delete workout. Please try again", [{text: "OK"}])
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
        <SafeAreaView className="flex-2 bg-gray-50">
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={"#3b82f6"}/>

            <Text className="text-gray-600 mt-4">Loading workout....</Text>
          </View>
        </SafeAreaView>
    )
  }

  if (!workout) {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="flex-1 items-center justify-center">
            <Ionicons name={"alert-circle-outline"} size={64} color={"#ef4444"}/>
            <Text className="text-xl font-semibold text-gray-900 mt-4">
              Workout not found
            </Text>

            <Text className="text-gray-600 mt-2 text-center">
              This workout record could not be found.
            </Text>

            <TouchableOpacity
                onPress={() => router.back()}
                className="bg-blue-600 px-6 py-3 rounded-lg mt-6"
            >
              <Text className="text-white font-medium">
                Go Back
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    )
  }

  const {totalVolume, unit} = getTotalVolume()

  return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <ScrollView className="flex-1">
          <View className="bg-white p-6 border-b border-gray-300">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text-lg font-semibold text-gray-900">
                Workout summary
              </Text>
              <TouchableOpacity
                  className="bg-red-600 px-4 py-2 rounded-lg flex-row items-center"
                  disabled={deleting}
                  onPress={handleDeleting}
              >
                {
                  deleting ? (
                      <ActivityIndicator size="small" color={"#ffffff"}/>
                  ) : (
                      <>
                        <Ionicons name={"trash-outline"} size={16} color={"#ffffff"}/>
                        <Text className="text-white font-medium ml-2">
                          Delete
                        </Text>
                      </>
                  )
                }
              </TouchableOpacity>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name={"calendar-outline"} size={20} color={"#6b7280"}/>

              <Text className="text-gray-700 ml-3 font-medium">
                {formatDate(workout.date)} at {formatTime(workout.date)}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name={"time-outline"} size={20} color={"#6b7280"}/>

              <Text className="text-gray-700 ml-3 font-medium">
                {formatWorkoutDuration(workout.duration)}
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name={"fitness-outline"} size={20} color={"#6b7280"}/>
              {}
              <Text className="text-gray-700 ml-3 font-medium">
                {workout.exercises?.length || 0} exercises
              </Text>
            </View>

            <View className="flex-row items-center mb-3">
              <Ionicons name={"calendar-outline"} size={20} color={"#6b7280"}/>

              <Text className="text-gray-700 ml-3 font-medium">
                {getTotalSets()} total sets
              </Text>
            </View>

            {
                totalVolume > 0 && (
                    <View className="flex-row items-center mb-3">
                      <Ionicons name={"calendar-outline"} size={20} color={"#6b7280"}/>

                      <Text className="text-gray-700 ml-3 font-medium">
                        {totalVolume.toLocaleString()} {unit} total volume
                      </Text>
                    </View>
                )
            }
          </View>

          <View className="spacey4 p-6 gap-4">
            {
              workout.exercises?.map((exerciseData, index) => (
                  <View
                      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
                      key={exerciseData._key}
                  >
                    <View className="flex-row items-center justify-between mb-4">
                      <View className="flex-1">
                        <Text className="text-lg text-gray-900 font-bold">
                          {exerciseData.exercise?.name || "Unknown Excercise"}
                        </Text>

                        <Text className="text-gray-700 ml-3 font-medium">
                          {exerciseData.sets?.length || 0} sets completed
                        </Text>
                      </View>

                      <View className="bg-blue-100 rounded-full w-10 h-10 items-center justify-center">
                        <Text className="text-blue-600 font-bold">
                          {index + 1}
                        </Text>
                      </View>
                    </View>

                    <View className="space-y-2">
                      <Text className="text-sm font-medium text-gray-700 mb-2">
                        Sets:
                      </Text>

                      {
                        exerciseData.sets?.map((set, index) => (
                            <View
                                key={index}
                                className="bg-gray-50 rounded-lg p-3 flex-row items-center justify-between"
                            >
                              <View className="flex-row items-center">
                                <View className="bg-gray-200 rounded-full w-6 h-6 items-center justify-center mr-3">
                                  <Text className="text-gray-700 text-xs font-medium">
                                    {index + 1}
                                  </Text>
                                </View>
                                <Text className="text-gray-900 font-medium">
                                  {set.reps} reps
                                </Text>
                              </View>

                              {
                                  set.weight && (
                                      <View className="items-center flex-row">
                                        <Ionicons name={"barbell-outline"} size={16} color={"#6b7280"}/>
                                        <Text className="text-gray-700 ml-2 font-medium">
                                          {set.weight} {set.weightUnit || "lbs"}
                                        </Text>
                                      </View>
                                  )
                              }
                            </View>
                        ))
                      }
                    </View>
                    {
                        exerciseData.sets && exerciseData.sets.length > 0 && (
                            <View className="mt-4 pt-4 border-t border-gray-100">
                              <View className="items-center flex-row justify-between">
                                <Text className="text-gray-600 text-sm">
                                  Exercise Volume
                                </Text>

                                <Text className="text-gray-900 font-medium text-sm">
                                  {
                                    exerciseData.sets?.reduce((total, set) => {
                                      return total + (set.weight || 0) * (set.reps || 0)
                                    }, 0).toLocaleString()
                                  }{" "}
                                  {exerciseData.sets[0]?.weightUnit || "lbs"}
                                </Text>
                              </View>
                            </View>
                        )
                    }
                  </View>
              ))
            }
          </View>
        </ScrollView>
      </SafeAreaView>
  )
}