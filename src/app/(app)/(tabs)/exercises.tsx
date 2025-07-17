import { Text, View, TextInput, TouchableOpacity, RefreshControl, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Ionicons } from '@expo/vector-icons'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { defineQuery } from 'groq'
import { client } from '@/lib/sanity/client'
import { Exercise } from '@/lib/sanity/types'
import ExerciseCard from '@/app/components/ExerciseCard'


export const exercisesQuery = defineQuery(`*[_type == "exercise"] {
  _id,
  name,
  description,
  difficulty,
  image,
  videoUrl,
  isActive
 }`)

export default function Exercises() {
  const [searchQuery, setSearchQuery] = useState("")
  const [refreshing, setRefreshing] = useState(false)
  const [exercises, setExercises] = useState([])
  const [filteredExercises, setFilteredExercises] = useState([])
  const router = useRouter()

  const fetchExercises = async () => {
    try {
      const exercises = await client.fetch(exercisesQuery)
      setExercises(exercises)
      setFilteredExercises(exercises)
    } catch (error) {
      console.error("Error fetching exercises:", error)

    }
  }

  useEffect(() => {
    fetchExercises()
  }, [])

  useEffect(() => {
    const filtered = exercises.filter((exercise: any) => exercise.name.toLowerCase().includes(searchQuery.toLowerCase()))

    setFilteredExercises(filtered)
  }, [searchQuery, exercises])


  const onRefresh = async () => {
    setRefreshing(true)
    await fetchExercises()
    setRefreshing(false)
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <View className="px-6 py-4 bg-white border-b border-gray-200">
        <Text className="text-2xl font-bold text-gray-900">Exercise Library</Text>
        <Text className="text-gray-600 mt-1">Discover and master new exercises</Text>

        <View className='flex-row items-center bg-gray-100 mt-4 rounded-xl px-4 py-3'>
          <Ionicons name='search' size={20} color="#687280" />
          <TextInput
            placeholder="Search exercises"
            placeholderTextColor="#9ca3af"
            className='flex-1 ml-3 text-gray-900'
            value={searchQuery}
            onChangeText={setSearchQuery}
          />

          {
            searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name='close-circle' size={20} color="#687280" />
              </TouchableOpacity>
            )
          }
        </View>
      </View>

      <FlatList
        data={filteredExercises}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ padding: 24 }}
        renderItem={({ item }) => (
          <ExerciseCard
            item={item}
            onPress={() => router.push(`exercise-detail?id=${item._id}`)}
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
          <View className='bg-white rounded-2xl p-8 items-center'>
            <Ionicons name='fitness-outline' size={64} color="#9ca3af" />
            <Text className='text-gray-900 text-xl mt-4'>{searchQuery ? "No exercise found" : "Loading exercises....."}</Text>
            <Text className='text-gray-600 mt-2 text-center'>
              {searchQuery ? "Try searching with different keywords" : "We are fetching the latest exercises for you"}
            </Text>
          </View>
        }
      />
    </SafeAreaView>
  )
}
