import { Navigate } from 'react-router';
import { useAuth } from '~/providers/auth-provider';

export default function IndexRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) return null;
  return <Navigate to={user ? '/dashboard' : '/login'} replace />;
}
