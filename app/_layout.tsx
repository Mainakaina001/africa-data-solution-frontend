import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as ScreenCapture from 'expo-screen-capture';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import Toast from 'react-native-toast-message';
import { Provider } from 'react-redux';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { useEffect } from 'react';
import { store } from '../store';

import { checkDeviceIntegrity, handleCompromisedDevice } from '@/utils/security';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <Provider store={store}>
      <RootLayoutNav />
    </Provider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  useEffect(() => {
    (async () => {
      try {
        await ScreenCapture.allowScreenCaptureAsync();
      } catch {
        // Ignore if unsupported
      }
      const isCompromised = await checkDeviceIntegrity();
      if (isCompromised) {
        handleCompromisedDevice();
        return;
      }
      await SplashScreen.hideAsync();
    })();
  }, [])

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name='notification' options={{ headerShown: false }} />
        <Stack.Screen name='forgot-password' options={{ headerShown: false }} />
        <Stack.Screen name='fundingwallet' options={{ headerShown: false }} />
        <Stack.Screen name='services' options={{ headerShown: false }} />
        <Stack.Screen name='virtualAccount' options={{ headerShown: false }} />
        <Stack.Screen name='information' options={{ headerShown: false }} />
        <Stack.Screen name='legal' options={{ headerShown: false }} />
        <Stack.Screen name='privacy' options={{ headerShown: false }} />
        <Stack.Screen name='terms' options={{ headerShown: false }} />
        <Stack.Screen name='accountLimits' options={{ headerShown: false }} />
        <Stack.Screen name='create-pin' options={{ headerShown: false }} />
        <Stack.Screen name='change-pin' options={{ headerShown: false }} />
        <Stack.Screen name='change-password' options={{ headerShown: false }} />
        <Stack.Screen name='settings' options={{ headerShown: false }} />
        <Stack.Screen name='security' options={{ headerShown: false }} />
        <Stack.Screen name='notify' options={{ headerShown: false }} />
        <Stack.Screen name='transactionDetail' options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <Toast />
    </ThemeProvider>
  );
}
