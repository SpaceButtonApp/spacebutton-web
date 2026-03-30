import { Stack } from 'expo-router';
import { useTheme } from '@/context/ThemeContext';

export default function TabsLayout() {
  const { colors } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="home" />
      <Stack.Screen name="search" />
      <Stack.Screen name="messages" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="profile" />
      <Stack.Screen name="saved" />
      <Stack.Screen name="notifications" />
      <Stack.Screen name="wallet" />
      <Stack.Screen name="premium" />
      <Stack.Screen name="help" />
      <Stack.Screen name="add-post" />
    </Stack>
  );
}
