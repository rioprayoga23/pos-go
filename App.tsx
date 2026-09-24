import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GluestackUIProvider } from '@gluestack-ui/themed';
import { AppNavigator } from './src/navigation/AppNavigator';
import { posGluestackConfig } from './src/theme';
import { useFonts } from 'expo-font';
import { Inter_400Regular } from '@expo-google-fonts/inter/400Regular';
import { PlusJakartaSans_700Bold } from '@expo-google-fonts/plus-jakarta-sans/700Bold';

export default function App() {
  const [fontsLoaded] = useFonts({ Inter_400Regular, PlusJakartaSans_700Bold });
  if (!fontsLoaded) return null;

  return (
    <SafeAreaProvider>
      <GluestackUIProvider config={posGluestackConfig}>
        <StatusBar style="dark" />
        <AppNavigator />
      </GluestackUIProvider>
    </SafeAreaProvider>
  );
}
