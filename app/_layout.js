import { Stack } from 'expo-router';

export default function RootLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="splash" />
      <Stack.Screen name="index" />
      <Stack.Screen name="AuthScreen" />
      <Stack.Screen name="OnboardingScreen" />
      <Stack.Screen name="ProfileForm" />
      <Stack.Screen name="PlayerCardScreen" />
      <Stack.Screen name="HallOfFame" />
      <Stack.Screen name="PaymentPlaceholder" />
      <Stack.Screen name="VIPSubscription" />
      <Stack.Screen name="TrainingPlanScreen" />
      <Stack.Screen name="ProgressScreen" />
      <Stack.Screen name="ProgressTracker" />
      <Stack.Screen name="WeaknessScreen" />
      <Stack.Screen name="VIPChat" />
      <Stack.Screen name="SecurityPrivacyScreen" />
      <Stack.Screen name="AnalyticsFeedbackScreen" />
      <Stack.Screen name="DrillLibrary" />
      <Stack.Screen name="PositionQuiz" />
      <Stack.Screen name="PositionAnalysisScreen" />
      <Stack.Screen name="NotificationScreen" />
      <Stack.Screen name="LeaderboardScreen" />
      <Stack.Screen name="ChallengesScreen" />
      <Stack.Screen name="PerformanceGraphsScreen" />
      <Stack.Screen name="SettingsScreen" />
      <Stack.Screen name="PrivacyPolicyScreen" />
      <Stack.Screen name="TermsOfServiceScreen" />
      <Stack.Screen name="AICoachScreen" />
      <Stack.Screen name="PaymentScreen" />
      <Stack.Screen name="VideoCallScreen" />
    </Stack>
  );
}
