import React, {useEffect, useState} from "react";
import {ActivityIndicator, RefreshControl, ScrollView, StatusBar, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from 'react-native-safe-area-context'
import {client} from "@/lib/sanity/client";
import {defineQuery} from "groq";
import {useUser} from "@clerk/clerk-expo";
import {GetWorkoutsQueryResult} from "@/lib/sanity/types";
import {useLocalSearchParams, useRouter} from "expo-router";
import {formatDuration} from "../../../../../lib/utils/utils";
import {Ionicons} from "@expo/vector-icons";
import exercise from "../../../../../sanity/schemaTypes/exercise";
import {useFocusEffect} from "@react-navigation/native";
import {useCallback} from "react";

export const getWorkoutsQuery = defineQuery(`*[_type == "workout" && userId == $userId] | order(date desc){
  _id,
  date,
  duration,
  exercises[] {
    exercise-> {
      _id,
      name
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


export default function HistoryPage() {
  const {user} = useUser()
  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([])
  const [loading, setLoading] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const {refresh} = useLocalSearchParams()
  const router = useRouter()

  const fetchWorkouts = async () => {
    if (!user?.id) return

    try {
      const results = await client.fetch(getWorkoutsQuery, {userId: user.id})
      setWorkouts(results)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useFocusEffect(
      useCallback(() => {
        fetchWorkouts();
      }, [user?.id])
  );

  // useEffect(() => {
  //   fetchWorkouts()
  // }, [user?.id])
  //
  // useEffect(() => {
  //   if (refresh === "true") {
  //     fetchWorkouts()
  //
  //     // clear the refresh parameter from the rl
  //     router.replace("/(app)/(tabs)/history")
  //   }
  // }, [user?.id])

  const onRefresh = () => {
    setRefreshing(true)
    fetchWorkouts()
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Today"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Yesterday"
    } else {
      return date.toLocaleDateString("en", {weekday: "short", month: "short", day: "numeric"})
    }
  }

  const formatWorkoutDuration = (seconds?: number) => {
    if (!seconds) return "Duration not recorded"
    return formatDuration(seconds)

  }

  const getTotalSets = (workout: GetWorkoutsQueryResult[number]) => {
    return (
        workout.exercises?.reduce((total, exercise) => {
          return total + (exercise.sets?.length || 0)
        }, 0) || 0
    )
  }

  const getExerciseNames = (workout: GetWorkoutsQueryResult[number]) => {
    return (
        workout.exercises?.map(exercise => exercise.exercise?.name).filter(Boolean) || []
    )
  }

  if (loading) {
    return (
        <SafeAreaView className="flex-1 bg-gray-50">
          <View className="px-6 py-4 bg-white border-b border-gray-200">
            <Text className="text-2xl font-bold text-gray-900">Workout History</Text>
          </View>

          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={"#3b82f6"}/>
            <Text className="text-gray-600 mt-4">Loading your workouts.....</Text>
          </View>
        </SafeAreaView>
    )
  }
  return (
      <SafeAreaView className="flex-1 bg-gray-50">
        <StatusBar barStyle={"dark-content"}/>
        <View className="px-6 py-4 bg-white border-b border-gray-200">
          <Text className="text-2xl font-bold text-gray-900">Workout History</Text>
          <Text className="text-gray-600 mt-1">
            {workouts.length} workout{workouts.length !== 1 ? "s" : ""} completed
          </Text>
        </View>

        <ScrollView
            className="flex-1"
            contentContainerStyle={{padding: 2}}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh}/>
            }
        >
          {
            workouts.length === 0 ? (
                <View className="bg-white rounded-2xl p-8 items-center">
                  <Ionicons name="barbell-outline" size={64} color="#9ca3af"/>
                  <Text className="text-xl font-semibold text-gray-900 mt-4">
                    No workouts yet
                  </Text>

                  <Text className="text-gray-600 mt-2 text-center">
                    Your completed workouts will appear here
                  </Text>
                </View>
            ) : (
                <View className="space-y-4 gap-4">
                  {
                    workouts.map((workout) => (
                        <TouchableOpacity
                            onPress={() => {
                              router.push({pathname: "/history/workout-record", params: {workoutId: workout._id}})
                            }}
                            key={workout._id}
                            className="bg-white rounded-2xl p-6 shadow-sm border-gray-100 border"
                            activeOpacity={0.7}
                        >
                          <View className="flex-row items-center jusb mb-4">
                            <View className="flex-1">
                              <Text className="text-lg font-semibold text-gray-900">
                                {formatDate(workout.date || "")}
                              </Text>
                              <View className="flex-row items-center mt-1">
                                <Ionicons name="time-outline" size={16} color="#6b7280"/>
                                <Text className="text-gray-600 ml-2">
                                  {formatWorkoutDuration(workout.duration)}
                                </Text>
                              </View>
                            </View>

                            <View className="bg-blue-100 rounded-full w-12 h-12 items-center justify-center">
                              <Ionicons name="fitness-outline" size={24} color="#3b82f6"/>
                            </View>
                          </View>

                          <View className="flex-row items-center jusb mb-4">
                            <View className="flex-row items-center">
                              <View className="bg-gray-100 rounded-lg px-3 py-2 mr-3">
                                <Text className="text-sm font-medium text-gray-700">
                                  {workout.exercises?.length || 0} exercises
                                </Text>
                              </View>
                            </View>

                            <View className="bg-gray-100 rounded-lg px-3 py-2">
                              <Text className="text-sm font-medium text-gray-700">
                                {getTotalSets(workout)} sets
                              </Text>
                            </View>
                          </View>

                          {
                              workout.exercises && workout.exercises.length > 0 && (
                                  <View>
                                    <Text className="text-sm font-medium text-gray-700 mb-2">
                                      Exercises:
                                    </Text>

                                    <View className="flex-row flex-wrap">
                                      {
                                        getExerciseNames(workout).slice(0, 3).map((name, index) => (
                                            <View className="bg-blue-50 rounded-lg px-3 py-1 mr-2 mb-2" key={index}>
                                              <Text className="text-sm text-blue-700 font-medium">
                                                {name}
                                              </Text>
                                            </View>
                                        ))
                                      }

                                      {
                                          getExerciseNames(workout).length > 3 && (
                                              <View className="bg-gray-100 rounded-lg px-3 py-1 mr-2 mb-2">
                                                <Text className="text-sm text-gray-600 font-medium">
                                                  +{getExerciseNames(workout).length - 3} more
                                                </Text>
                                              </View>
                                          )
                                      }
                                    </View>
                                  </View>
                              )
                          }
                        </TouchableOpacity>
                    ))
                  }
                </View>
            )
          }
        </ScrollView>
      </SafeAreaView>
  );
}
