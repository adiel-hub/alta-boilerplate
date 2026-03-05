import { useAuth } from '~/providers/auth-provider';

export default function SettingsRoute() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Settings</h1>
      <div className="rounded-lg border p-4">
        <p className="text-sm text-gray-500">Email</p>
        <p>{user?.email}</p>
      </div>
    </div>
  );
}
