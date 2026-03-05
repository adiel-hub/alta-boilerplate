import { Navigate, Outlet } from 'react-router';
import { useAuth } from '~/providers/auth-provider';
import { AppLayout } from '~/components/layout/app-layout';

export default function AppLayoutRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
}
