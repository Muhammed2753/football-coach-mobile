import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: "Home" }} />
      <Stack.Screen name="ProfileForm" options={{ title: "Player Profile" }} />
      <Stack.Screen name="TrainingPlanScreen" options={{ title: "Training Plan" }} />
      <Stack.Screen name="ProgressScreen" options={{ title: "Training Progress" }} />
      <Stack.Screen name="WeaknessScreen" options={{ title: "Weaknesses" }} />
      <Stack.Screen name="VIPChat" options={{ title: "VIP Chat" }} />
    </Stack>
  );
}