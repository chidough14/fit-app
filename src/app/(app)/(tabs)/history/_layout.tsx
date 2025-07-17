import {Stack} from "expo-router";

function Layout(props) {
  return (
      <Stack>
        <Stack.Screen name={"index"} options={{headerShown: false}}/>

        <Stack.Screen
            name={"workout-record"}
            options={{headerShown: true, headerTitle: "Workout Record", headerBackTitle: "Workouts"}}
        />
      </Stack>
  );
}

export default Layout;