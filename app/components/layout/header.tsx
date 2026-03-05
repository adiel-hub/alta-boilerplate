import { Button } from '@altahq/design-system/components/ui/button';
import { Separator } from '@altahq/design-system/components/ui/separator';
import { Text } from '@altahq/design-system/components/ui/text';
import { useAuth } from '~/providers/auth-provider';

export function Header() {
  const { user, signOut } = useAuth();

  return (
    <header className="flex items-center gap-2 border-b px-4 py-2">
      <Separator orientation="vertical" className="h-4" />
      <div className="ml-auto flex items-center gap-4">
        <Text variant="muted">{user?.email}</Text>
        <Button variant="ghost" size="sm" onClick={signOut}>
          Sign Out
        </Button>
      </div>
    </header>
  );
}
