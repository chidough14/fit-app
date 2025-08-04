import {View, Text, StatusBar, TouchableOpacity, ScrollView, Image, Linking, ActivityIndicator} from 'react-native'
import React, {useEffect, useState} from 'react'
import {SafeAreaView} from 'react-native-safe-area-context'
import {useRouter, useLocalSearchParams} from 'expo-router'
import {Ionicons} from '@expo/vector-icons'
import {Exercise} from '@/lib/sanity/types'
import {client, urlFor} from '@/lib/sanity/client'
import {defineQuery} from 'groq'
import {getDifficultyColor, getDifficultyText} from '../components/ExerciseCard'
import Markdown from "react-native-markdown-display";
import {clampRGBA} from "react-native-reanimated/lib/typescript/Colors";

const singleExerciseQuery = defineQuery(`*[_type == "exercise" && _id == $id][0]`)


export default function ExerciseDetail() {
  const {id} = useLocalSearchParams<{ id: string }>()
  const router = useRouter()
  const [exercise, setExercise] = useState(null)
  const [loading, setLoading] = useState(true)
  const [aiGuidance, setAiGuidance] = useState<string>("")
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    const fetchExercise = async () => {
      if (!id) return

      try {
        const exerciseData = await client.fetch(singleExerciseQuery, {id})
        // console.log("exerciseData", exerciseData)

        setExercise(exerciseData)
      } catch (error) {
        console.error("Error fetching exercise:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchExercise()
  }, [id])

  const getAiGuidance = async () => {
    if (!exercise) return
    try {
      setAiLoading(true)
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({exerciseName: exercise.name})
      });


      if (!response.ok) {
        throw new Error("Failed to fetch AI Guidance")
      }

      const data = await response.json()
      console.log("RESPONSE:", data);
      setAiGuidance(data.message)
    } catch (error) {
      console.error("❌ Network fetch failed:", error.message);
      setAiGuidance("Sorry, there was an error fetching AI Guidance")
    } finally {
      setAiLoading(false)
    }
  }


  if (loading) {
    return (
        <SafeAreaView className='flex-1 bg-white'>
          <View className='flex-1 items-center justify-center'>
            <ActivityIndicator size="large" color="#0000ff"/>
            <Text className='text-gray-500'>Loading exercise....</Text>
          </View>
        </SafeAreaView>
    )
  }

  if (!exercise) {
    return (
        <SafeAreaView className='flex-1 bg-white'>
          <View className='flex-1 items-center justify-center'>
            <Text className='text-gray-500'>Exercise not found: {id}</Text>
            <TouchableOpacity className='mt-4 bg-blue-500 px-6 py-3 rounded-lg' onPress={() => router.back()}>
              <Text className='text-white font-semibold'>Go Back</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
    )
  }

  return (
      <SafeAreaView className='flex-1 bg-white'>
        <StatusBar barStyle='light-content' backgroundColor="#000"/>

        <View className='absolute top-12 left-0 right-0 z-10 px-4'>
          <TouchableOpacity
              onPress={() => router.back()}
              className='bg-black/20 rounded-full w-10 h-10 items-center justify-center backdrop-blur-sm'
          >
            <Ionicons name="close" size={24} color="white"/>
          </TouchableOpacity>
        </View>

        <ScrollView
            className='flex-1'
            showsVerticalScrollIndicator={false}
        >
          <View className='h-80 bg-white relative'>
            {exercise?.image ? (
                <Image
                    source={{uri: urlFor(exercise?.image?.asset?._ref).url()}}
                    className='w-full h-full'
                    resizeMode='contain'
                />
            ) : (
                <View
                    className='w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 items-center justify-center'>
                  <Ionicons name="fitness" size={80} color="white"/>
                </View>
            )}
          </View>

          <View className='px-6 py-4'>
            <View className='flex-row items-start justify-between mb-4'>
              <View className='flex-1 mr-4'>
                <Text className='text-3xl font-bold text-gray-900 mb-2'>{exercise?.name}</Text>
                <View
                    className={`px-4 self-start py-2 rounded-full ${getDifficultyColor(exercise?.difficulty)}`}>
                  <Text className='text-sm font-semibold text-white'>
                    {getDifficultyText(exercise?.difficulty)}
                  </Text>
                </View>
              </View>
            </View>

            <View className='mb-6'>
              <Text className='text-gray-800 text-xl font-semibold mb-3'>Description</Text>
              <Text className='text-gray-600 text-base leading-6'>
                {exercise?.description || "No description available"}
              </Text>
            </View>

            {
                exercise?.videoUrl && (
                    <View className='mb-6'>
                      <Text className='text-gray-800 text-xl font-semibold mb-3'>Video Guide</Text>
                      <TouchableOpacity
                          onPress={() => {
                            // Handle video URL navigation
                            if (exercise.videoUrl) {
                              Linking.openURL(exercise.videoUrl)
                            }
                          }}
                          className='bg-red-500 rounded-xl p-4 flex-row items-center'
                      >
                        <View className='w-12 h-12 bg-white rounded-full items-center justify-center mr-4'>
                          <Ionicons name='play' size={20} color="#ef4444"/>
                        </View>

                        <View>
                          <Text className='text-white text-lg font-semibold'>Watch Video</Text>
                          <Text className='text-red-100 text-sm'>Learn proper form and technique</Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                )
            }
            {/*AI Guidance*/}
            {
                (aiGuidance || aiLoading) && (
                    <View className="mb-6">
                      <View className="flex-row items-center mb-3">
                        <Ionicons name='fitness' size={24} color="#3b882f6"/>
                        <Text className="texxl font-semibold text-gray-800 ml-2">
                          AI Coach says.....
                        </Text>
                      </View>

                      {
                        aiLoading ? (
                            <View className='bg-gray-50 rounded-xl items-center py-4'>
                              <ActivityIndicator size="small" color="#3b82f6"/>
                              <Text className='text-gray-600 mt-2'>Getting Personalzed guidance....</Text>
                            </View>
                        ) : (
                            <View className='bg-blue-50 rounded-xl p-4 border-l-4 border-blue-500'>
                              <Markdown
                                  style={{
                                    body: {
                                      paddingBottom: 20
                                    },
                                    heading2: {
                                      fontSize: 18,
                                      fontWeight: 'bold',
                                      color: '#1f2937',
                                      marginTop: 12,
                                      marginBottom: 6
                                    },
                                    heading3: {
                                      fontSize: 16,
                                      fontWeight: '600',
                                      color: '#374151',
                                      marginTop: 8,
                                      marginBottom: 4
                                    },
                                  }}
                              >
                                {aiGuidance}

                              </Markdown>
                            </View>
                        )
                      }
                    </View>
                )
            }

            <View className='mt-8 gap-2'>
              <TouchableOpacity
                  className={`rounded-xl py-4 items-center ${aiLoading ? "bg-gray-400" : aiGuidance ? "bg-green-500" : "bg-blue-500"}`}
                  onPress={getAiGuidance}
                  disabled={aiLoading}
              >
                {
                  aiLoading ? (
                      <View className="flex-row items-center">
                        <ActivityIndicator size="small" color="white"/>
                        <Text className='text-lg font-bold text-white ml-2'>Loading....</Text>
                      </View>
                  ) : (
                      <Text className="text-lg font-bold text-white">
                        {
                          aiGuidance ? "Refresh AI Guidance" : "Get AI Guidance on Form and Technique"
                        }
                      </Text>
                  )
                }
              </TouchableOpacity>

              <TouchableOpacity
                  className="bg-gray-200 rounded-xl py-4 items-center"
                  onPress={() => router.back()}
              >
                <Text className="text-gray-800 font-bold text-lg">Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
  )
}