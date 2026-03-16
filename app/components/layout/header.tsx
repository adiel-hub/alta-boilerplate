import { Button } from '@alta/design-system/components/ui/button';
import { useAuth } from '~/providers/auth-provider';

export function Header() {
  const { signOut } = useAuth();

  return (
    <header className="flex h-14 items-center justify-end border-b px-4">
      <Button variant="ghost" size="sm" onClick={signOut}>
        Sign out
      </Button>
    </header>
  );
}
