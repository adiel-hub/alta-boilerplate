import { useAuth } from '~/providers/auth-provider';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex items-center justify-between border-b px-6 py-3">
      <div />
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user?.email}</span>
        <button onClick={signOut} className="text-sm text-gray-500 hover:text-gray-800">
          Sign Out
        </button>
      </div>
    </header>
  );
}
