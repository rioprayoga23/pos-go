import { GluestackUIProvider } from '@gluestack-ui/themed';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';
import { Stack } from 'expo-router';
import { useFonts } from 'expo-font';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { posGluestackConfig, colors } from '../theme';

export default function RootLayout() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, PlusJakartaSans_700Bold });

  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={posGluestackConfig}>
        <StatusBar style="dark" />
        <Stack
          screenOptions={{
            headerShown: false,
            animation: 'fade',
            contentStyle: { backgroundColor: colors.canvas },
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="order" />
          <Stack.Screen name="payment" />
          <Stack.Screen name="queue" />
          <Stack.Screen name="products" />
          <Stack.Screen name="stock" />
          <Stack.Screen name="cash" />
          <Stack.Screen name="history" />
        </Stack>
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
