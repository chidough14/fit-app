import React, {useEffect, useState} from 'react';
import {View, Text, Modal, StatusBar, TouchableOpacity, TextInput, FlatList, RefreshControl} from "react-native";
import {useRouter} from "expo-router";
import {useWorkoutStore} from "../../../store/workout-store";
import {SafeAreaView} from "react-native-safe-area-context";
import {Ionicons} from "@expo/vector-icons";
import ExerciseCard from "@/app/components/ExerciseCard";
import {Exercise} from "@/lib/sanity/types";
import {client} from "@/lib/sanity/client";
import {exercisesQuery} from "@/app/(app)/(tabs)/exercises";

interface ExerciseSelectionModalProps {
  visible: boolean
  onClose: () => void
}

export default function ExerciseSelectionModal({visible, onClose}: ExerciseSelectionModalProps) {
  const router = useRouter()
  const {addExerciseToWorkout} = useWorkoutStore()
  const [showExerciseSelection, setShowExerciseSelection] = useState(false)
  const [exercises, setExercises] = useState<any[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [filteredExercises, setFilteredExercises] = useState<any[]>([])
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (visible) {
      fetchExercises()
    }
  }, [visible])

  useEffect(() => {
    const filtered = exercises.filter((e) => e.name.toLowerCase().includes(searchQuery.toLowerCase()))
    setFilteredExercises(filtered)
  }, [searchQuery, exercises])

  const fetchExercises = async () => {
    try {
      const exercises = await client.fetch(exercisesQuery)
      setExercises(exercises)
      setFilteredExercises(exercises)
    } catch (error) {
      console.log(error)
    }
  }

  const handleExercisePress = (exercise: Exercise) => {
    addExerciseToWorkout({name: exercise.name, sanityId: exercise._id})
    onClose()
  }


  const onRefresh = async () => {
    setRefreshing(true)
    await fetchExercises()
    setRefreshing(false)
  }

  return (
      <Modal
          visible={visible}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={onClose}
      >
        <SafeAreaView className="flex-1 bg-white">
          <StatusBar barStyle="dark-content"/>

          <View className="bg-white px-4 pt-4 pb-6 shadow-sm border-b border-gray-100">
            <View className="flex-row items-center justify-between mb-4">
              <Text className="text2x font-bold text-gray-800">Add Exercise</Text>
              <TouchableOpacity onPress={onClose} className="w-8 h-8 items-center justify-center">
                <Ionicons name="close" size={24} color={"#6b7280"}/>
              </TouchableOpacity>
            </View>
            <Text className="mb-4 text-gray-600">
              Tap any exercise to add it to your workout
            </Text>

            <View className="flex-row items-center bg-gray-100 rounded-xl px-4 py-3">
              <Ionicons name="search" size={20} color={"#6b7280"}/>
              <TextInput
                  className="flex-1 ml-3 text-gray-800"
                  placeholder={"Search..."}
                  placeholderTextColor={"#9ca3af"}
                  value={searchQuery}
                  onChangeText={setSearchQuery}
              />

              {
                  searchQuery.length > 0 && (
                      <TouchableOpacity onPress={() => setSearchQuery("")}>
                        <Ionicons name="close-circle" size={20} color={"#6b7280"}/>
                      </TouchableOpacity>
                  )
              }
            </View>
          </View>

          <FlatList
              data={filteredExercises}
              keyExtractor={(item) => item._id}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{paddingTop: 16, paddingBottom: 32, paddingHorizontal: 16}}
              renderItem={({item}) => (
                  <ExerciseCard
                      item={item}
                      onPress={() => handleExercisePress(item)}
                      showChevron={false}
                  />
              )}
              refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={onRefresh}
                    colors={["#3b82f6"]}
                    tintColor="#3b82f6"
                    title='Pull to refresh exercises'
                    titleColor="#6b7280"
                />
              }
              ListEmptyComponent={
                <View className='flex-1 itc justify-center py-20'>
                  <Ionicons name='fitness-outline' size={64} color="#d1d5db"/>
                  <Text
                      className='text-gray-400 text-lg mt-4'>{searchQuery ? "No exercise found" : "Loading exercises....."}</Text>
                  <Text className='text-gray-400 mt-2 text-sm'>
                    {searchQuery ? "Try searching with different keywords" : "We are fetching the latest exercises for you"}
                  </Text>
                </View>
              }
          />
        </SafeAreaView>
      </Modal>
  );
};