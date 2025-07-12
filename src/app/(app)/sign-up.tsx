import * as React from 'react'
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { useSignUp } from '@clerk/clerk-expo'
import { Link, useRouter } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp()
  const router = useRouter()

  const [emailAddress, setEmailAddress] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [pendingVerification, setPendingVerification] = React.useState(false)
  const [code, setCode] = React.useState('')
  const [isLoading, setIsLoading] = React.useState(false)

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return


    if (!emailAddress || !password) {
      Alert.alert("Error", "Plesase fill in all fields")
    }
    setIsLoading(true)

    console.log(emailAddress, password)

    // Start sign-up process using email and password provided
    try {
      await signUp.create({
        emailAddress,
        password,
      })

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' })

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true)
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    } finally {
      setIsLoading(false)
    }
  }

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return

    if (!code) {
      Alert.alert("Error", "Plesase fill in all fields")
    }
    setIsLoading(true)

    try {
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      })

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === 'complete') {
        await setActive({ session: signUpAttempt.createdSessionId })
        router.replace('/')
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2))
      }
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2))
    }
  }

  if (pendingVerification) {
    return (
      <SafeAreaView className='flex-1'>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className='flex-1'>
          <View className='flex-1 px-6'>
            <View className='flex-1 justify-center'>
              <View className='items-center mb-8'>
                <View className='w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg'>
                  <Ionicons name='mail' size={40} color="white" />
                </View>

                <Text className='text-3xl font-bold text-gray-900 mb-2'>Check your email</Text>

                <Text className='text-lg text-gray-600 text-center'>
                  We've sent a verification code to{"\n"}
                  {emailAddress}
                </Text>
              </View>

              <View className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6'>
                <Text className='text-2xl font-bold text-gray-900 mb-6 text-center'>Enter verification code</Text>

                <View className='mb-4'>
                  <Text className='text-sm font-medium mb-2 text-gray-700'>
                    Verification code
                  </Text>
                  <View className='flex-row bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 items-center'>
                    <Ionicons name='key-outline' size={20} color="#6b7280" />
                    <TextInput
                      value={code}
                      placeholder="Enter 6 digit code"
                      placeholderTextColor="#9ca3af"
                      onChangeText={setCode}
                      className='flex-1 ml-3 text-gray-900 text-center text-lg tracking-widest'
                      editable={!isLoading}
                      maxLength={6}
                      keyboardType='number-pad'
                    />
                  </View>
                </View>

                <TouchableOpacity
                  onPress={onVerifyPress}
                  disabled={isLoading}
                  className={`rounded-xl py-4 shadow-sm mb-4 ${isLoading ? "bg-gray-400" : "bg-green-600"}`}
                  activeOpacity={0.8}
                >
                  <View className='flex-row items-center justify-center'>
                    {
                      isLoading ? (
                        <Ionicons name='refresh' size={20} color="white" />
                      ) : (
                        <Ionicons name='checkmark-circle-outline' size={20} color="white" />
                      )
                    }

                    <Text className='text-white font-semibold text-lg ml-2'>
                      {isLoading ? "Verifying....." : "Verify Email"}
                    </Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity className='py-2'>
                  <Text className='text-blue-600 font-medium text-center'>Didn't receive the code? Resend</Text>
                </TouchableOpacity>
              </View>
            </View>
            <View className='pb-5'>
              <Text className='text-center text-gray-500 text-sm'>Almost there? One more step</Text>
            </View>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView className='flex-1 bg-gray-50'>
      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className='flex-1'>

        <View className='flex-1 px-6'>
          <View className='flex-1 justify-center'>
            <View className='items-center mb-8'>
              <View className='w-20 h-20 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl items-center justify-center mb-4 shadow-lg'>
                <Ionicons name='fitness' size={40} color="white" />
              </View>

              <Text className='text-3xl font-bold mb-2 text-gray-900'>
                FitTracker
              </Text>

              <Text className='text-lg text-gray-600 text-center'>
                Track your fitness goals{"\n"}and reach your goals
              </Text>
            </View>


            <View className='bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6'>
              <Text className='text-2xl font-bold mb-6 text-gray-900 text-center'>
                Create your account
              </Text>

              <View className='mb-4'>
                <Text className='text-sm font-medium mb-2 text-gray-700'>
                  Email
                </Text>
                <View className='flex-row bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 items-center'>
                  <Ionicons name='mail-outline' size={20} color="#687280" />
                  <TextInput
                    autoCapitalize='none'
                    value={emailAddress}
                    placeholder="Enter email"
                    placeholderTextColor="#9ca3af"
                    onChangeText={setEmailAddress}
                    className='flex-1 ml-3 text-gray-900'
                    editable={!isLoading}
                  />
                </View>
              </View>

              <View className='mb-6'>
                <Text className='text-sm font-medium mb-2 text-gray-700'>
                  Password
                </Text>

                <View className='flex-row bg-gray-50 rounded-xl px-4 py-4 border border-gray-200 items-center'>
                  <Ionicons name='lock-closed-outline' size={20} color="#6b7280" />
                  <TextInput
                    value={password}
                    placeholder="Enter your password"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={true}
                    onChangeText={setPassword}
                    className='flex-1 ml-3 text-gray-900'
                    editable={!isLoading}
                  />
                </View>
              </View>

              <Text className='text-xs text-gray-500 mt-1'>Must be at least 8 characters</Text>
            </View>

            <TouchableOpacity
              onPress={onSignUpPress}
              disabled={isLoading}
              className={`rounded-xl py-4 shadow-sm mb-4 ${isLoading ? "bg-gray-400" : "bg-blue-600"}`}
              activeOpacity={0.8}
            >
              <View className='flex-row items-center justify-center'>
                {
                  isLoading ? (
                    <Ionicons name='refresh' size={20} color="white" />
                  ) : (
                    <Ionicons name='person-add-outline' size={20} color="white" />
                  )
                }

                <Text className='text-white font-semibold text-lg ml-2'>
                  {isLoading ? "Creating Account....." : "Create Account"}
                </Text>
              </View>
            </TouchableOpacity>

            <Text className='text-xs text-gray-500 text-center mb-4'>
              By signing up, you agree to our terms and conditins
            </Text>
          </View>
          <View className='flex-row justify-center items-center mt-4'>
            <Text className='text-gray-600'>Don't have an account?</Text>
            <Link href="/sign-in" asChild>
              <TouchableOpacity>
                <Text className='text-blue-600 font-semibold'>Sign in</Text>
              </TouchableOpacity>
            </Link>
          </View>
        </View>

        <View className='pb-6'>
          <Text className='text-center text-gray-500 text-sm'>Ready to transform your fitness</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}