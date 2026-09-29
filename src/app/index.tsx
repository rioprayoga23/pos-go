import { Redirect } from 'expo-router';
import { useAuth } from '../auth/AuthProvider';

export default function IndexRoute() {
  const { user } = useAuth();
  return <Redirect href={user ? '/order' : '/login'} />;
}
