import {useAuth, useUser} from "@clerk/clerk-expo";
import {Ionicons} from "@expo/vector-icons";
import React, {useCallback, useState} from "react";
import {ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View} from "react-native";
import {SafeAreaView} from "react-native-safe-area-context";
import {GetWorkoutsQueryResult} from "@/lib/sanity/types";
import {defineQuery} from "groq";
import {client} from "@/lib/sanity/client";
import {useFocusEffect} from "@react-navigation/native";
import {formatDuration} from "../../../../../lib/utils/utils";
import {getWorkoutsQuery} from "@/app/(app)/(tabs)/history";


export default function ProfilePage() {
  const {signOut} = useAuth()
  const [workouts, setWorkouts] = useState<GetWorkoutsQueryResult>([])
  const [loading, setLoading] = useState(true)
  const {user} = useUser()

  const fetchWorkouts = async () => {
    if (!user?.id) return

    try {
      const results = await client.fetch(getWorkoutsQuery, {userId: user.id})
      setWorkouts(results)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useFocusEffect(
      useCallback(() => {
        fetchWorkouts();
      }, [user?.id])
  );

  // Caklculate stats
  const totalWorkouts = workouts.length
  const totalDuration = workouts.reduce(
      (sum, workout) => sum + (workout.duration || 0), 0)
  const averageDuration = totalWorkouts > 0 ? Math.round(totalDuration / totalWorkouts) : 0


  // calculate days since joining (using createdAt from clerk"
  const joinDate = user?.createdAt ? new Date(user.createdAt) : new Date()
  const daysSinceJoining = Math.floor((new Date().getTime() - joinDate.getTime()) / (1000 * 60 * 60 * 24))

  const formatJoinDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    })
  }

  const handleSignOut = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      {
        text: "Cancel",
        style: "cancel"
      },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: () => signOut()
      }

    ])
  }

  if (loading) {
    return (
        <SafeAreaView className="bg-gray-50 flex-1">

          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={"#3b82f6"}/>
            <Text className="text-gray-600 mt-4">Loading Profile....</Text>
          </View>
        </SafeAreaView>
    )
  }

  return (
      <SafeAreaView className="flex flex-1">
        <ScrollView className={"flex-1"}>

          <View className="px-6 pt-8 pb-6">
            <Text className="text-3xl font-bold text-gray-900">Profile</Text>
            <Text className="text-lg text-gray-600 mt-1">Manage your account and stats</Text>
          </View>

          {/*User info card*/}
          <View className="px-6 mb-6">
            <View className="bg-white rounded-2xl pb-6 shadow-sm border border-gray-100">
              <View className="flex-row items-center p-4">
                <View className="w-16 h-16 bg-blue-600 rounded-full items-center justify-center mr-4">
                  <Image
                      source={{
                        uri: user?.externalAccounts[0]?.imageUrl ?? user?.imageUrl
                      }}
                      className={"rounded-full"}
                      style={{width: 64, height: 64}}
                  />
                </View>
                <View className="flex-1">
                  <Text className="text-xl font-semibold text-gray-900">
                    {
                      user?.firstName && user?.lastName ? `${user?.firstName} ${user?.lastName}` : user?.firstName || "User"
                    }
                  </Text>

                  <Text className="text-gray-600">
                    {
                      user?.emailAddresses[0]?.emailAddress
                    }
                  </Text>

                  <Text className="text-sm text-gray-500 mt-1">
                    Member since {formatJoinDate(joinDate)}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/*Stats*/}

          <View className="px-6 mb-6">
            <View className="bg-white rounded-2xl pb-6 shadow-sm border border-gray-100 p-4">
              <Text className="font-semibold text-gray-900 text-lg mb-4">Your Fitness Stats</Text>

              <View className={"flex-row justify-between"}>
                <View className={"items-center flex-1"}>
                  <Text className="text-2xl text-blue-600 font-bold">
                    {totalWorkouts}
                  </Text>
                  <Text className="text-sm text-gray-600 text-center">
                    Total{"\n"}Workouts
                  </Text>
                </View>
                <View className={"items-center flex-1"}>
                  <Text className="text-2xl text-green-600 font-bold">
                    {formatDuration(totalDuration)}
                  </Text>
                  <Text className="text-sm text-gray-600 text-center">
                    Total{"\n"}Time
                  </Text>
                </View>
                <View className={"items-center flex-1"}>
                  <Text className="text-2xl text-purple-600 font-bold">
                    {daysSinceJoining}
                  </Text>
                  <Text className="text-sm text-gray-600 text-center">
                    Days{"\n"}Active
                  </Text>
                </View>
              </View>

              {
                  totalWorkouts > 0 && (
                      <View className={"mt-4 pt-4 border-t border-gray-400"}>
                        <View className={"items-center flex-row justify-between"}>
                          <Text className="text-gray-600">
                            Average workout duration
                          </Text>
                          <Text className="font-semibold text-gray-900">
                            {formatDuration(averageDuration)}
                          </Text>
                        </View>
                      </View>
                  )
              }

            </View>
          </View>


          <View className={"px-6 mb-6"}>
            <Text className="font-semibold text-gray-900 text-lg mb-4">Account Settings</Text>
            <View className={"bg-white rounded-2xl shadow-sm border border-gray-100"}>
              <TouchableOpacity
                  className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className={"flex-row items-center"}>
                  <View className={"w-10 h-10 bg-blue-100 rounded-full items-center justify-center mr-3"}>
                    <Ionicons name="person-outline" size={20} color="#3b82f6"/>
                  </View>
                  <Text className="text-gray-900 font-medium">Edit Profile</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                  className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className={"flex-row items-center"}>
                  <View className={"w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3"}>
                    <Ionicons name="notifications-outline" size={20} color="#10b981"/>
                  </View>
                  <Text className="text-gray-900 font-medium">Notifications</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                  className="flex-row items-center justify-between p-4 border-b border-gray-100"
              >
                <View className={"flex-row items-center"}>
                  <View className={"w-10 h-10 bg-purple-100 rounded-full items-center justify-center mr-3"}>
                    <Ionicons name="settings-outline" size={20} color="#8b5cf6"/>
                  </View>
                  <Text className="text-gray-900 font-medium">Preferences</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                  className="flex-row items-center justify-between p-4"
              >
                <View className={"flex-row items-center"}>
                  <View className={"w-10 h-10 bg-green-100 rounded-full items-center justify-center mr-3"}>
                    <Ionicons name="help-circle-outline" size={20} color="#f59e0b"/>
                  </View>
                  <Text className="text-gray-900 font-medium">Help & Support</Text>
                </View>
              </TouchableOpacity>

            </View>
          </View>

          <View className="px-6 mb-8">
            <TouchableOpacity
                onPress={handleSignOut}
                className="bg-red-600 rounded-2xl p-4 shadow-sm"
            >
              <View className={"flex-row items-center justify-center"}>
                <Ionicons name="log-out-outline" size={20} color="white"/>
                <Text className="font-semibold text-white text-lg ml-2">Sign out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
  );
}
