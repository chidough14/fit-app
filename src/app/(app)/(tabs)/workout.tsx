import React from 'react'
import {SafeAreaView, StatusBar, Text, TouchableOpacity, View} from 'react-native'
import {useRouter} from "expo-router";
import {Ionicons} from "@expo/vector-icons";


const Workout = () => {
  const router = useRouter()

  const startWorkout = () => {
    router.push('/active-workout')
  }
  return (
      <SafeAreaView className={"flex-1 bg-gray-50"}>
        <StatusBar barStyle={"dark-content"}/>
        <View className={"flex-1 p-6"}>
          <View className={"p-8 pb-6"}>
            <Text className="text-3xl font-bold text-gray-900 mb-2">Ready to Train</Text>

            <Text className="text-lg text-gray-600">Start your workout session</Text>
          </View>
        </View>

        <View className="bg-white rounded-3xl pb-6 shadow-sm border border-gray-100 mx-6 mb-8">
          <View className="flex-row items-center justify-between mb-6 p-4">
            <View className="items-center flex-row">
              <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                <Ionicons name="fitness" size={24} color="#3b82f6"/>
              </View>
              <View>
                <Text className="text-xl font-semibold text-gray-900">Start Workout</Text>
                <Text className=" text-gray-500">Begin your training session</Text>
              </View>
            </View>

            <View className="bg-green-100 px-3 py-1 rounded-full">
              <Text className="text-sm font-medium text-green-700">Ready</Text>
            </View>
          </View>

          <TouchableOpacity
              onPress={startWorkout}
              className="items-center bg-blue-600 rounded-2xl ml-2 mr-2 py-4 active:bg-blue-700"
              activeOpacity={0.8}
          >
            <View className="flex-row items-center">
              <Ionicons name="play" size={20} color="white" style={{marginRight: 8}}/>
              <Text className="text-white font-semibold">Start Workout</Text>
            </View>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
  )
}

export default Workout