import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { colors } from '../theme';
import { HistoryScreen } from '../screens/history';
import { OrderScreen } from '../screens/order';
import { PaymentScreen } from '../screens/payment';
import { ProductsScreen } from '../screens/products';
import { QueueScreen } from '../screens/queue';
import { RootStackParamList } from './types';

const Stack = createNativeStackNavigator<RootStackParamList>();

const navigationTheme = {
  ...DefaultTheme,
  colors: { ...DefaultTheme.colors, background: colors.canvas, card: colors.white, text: colors.ink, primary: colors.primary, border: colors.line },
};

export function AppNavigator() {
  return (
    <NavigationContainer theme={navigationTheme}>
      <Stack.Navigator initialRouteName="Order" screenOptions={{ headerShown: false, animation: 'fade' }}>
        <Stack.Screen name="Order" component={OrderScreen} />
        <Stack.Screen name="Products" component={ProductsScreen} />
        <Stack.Screen name="Payment" component={PaymentScreen} />
        <Stack.Screen name="Queue" component={QueueScreen} />
        <Stack.Screen name="History" component={HistoryScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
