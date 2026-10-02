import { DarkTheme, DefaultTheme, Stack, ThemeProvider } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useColorScheme } from 'react-native';

import { OX } from '@/constants/theme';
import { AppStateProvider } from '@/providers/app-state';

SplashScreen.preventAutoHideAsync();

const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: OX.orange,
    card: OX.orange,
    text: '#FFFFFF',
    background: '#FFFFFF',
    border: 'rgba(0,0,0,0.08)',
    notification: OX.badge,
  },
};

const darkTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: OX.orange,
    card: '#1C1C1E',
    text: '#FFFFFF',
    notification: OX.badge,
  },
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <ThemeProvider value={colorScheme === 'dark' ? darkTheme : lightTheme}>
      <StatusBar style="light" />
      <AppStateProvider>
        <Stack>
          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen name="onboarding" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="webview" options={{ headerShown: false }} />
          <Stack.Screen name="news" options={{ title: 'Nouvelles' }} />
          <Stack.Screen name="course-docs" options={{ title: 'Documents de cours' }} />
          <Stack.Screen name="downloads" options={{ title: 'Téléchargements' }} />
          <Stack.Screen name="viewer" options={{ title: 'Document' }} />
          <Stack.Screen name="notes" options={{ title: 'Notes' }} />
          <Stack.Screen name="settings" options={{ title: 'Réglages' }} />
        </Stack>
      </AppStateProvider>
    </ThemeProvider>
  );
}
