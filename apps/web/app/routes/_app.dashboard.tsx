import { useAuth } from '~/providers/auth-provider';

export default function DashboardRoute() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Dashboard</h1>
      <p className="text-gray-600">Welcome, {user?.email}</p>
    </div>
  );
}
