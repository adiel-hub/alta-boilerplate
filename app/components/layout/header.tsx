import { Button } from '@altahq/design-system/components/ui/button';
import { Separator } from '@altahq/design-system/components/ui/separator';
import { Avatar, AvatarFallback } from '@altahq/design-system/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@altahq/design-system/components/ui/dropdown-menu';
import { useAuth } from '~/providers/auth-provider';

export function Header() {
  const { user, signOut } = useAuth();

  const initials = user?.email
    ? user.email
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <header className="flex h-14 items-center gap-2 border-b px-4">
      <Separator orientation="vertical" className="h-4" />
      <div className="ml-auto flex items-center gap-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar size="sm">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">Account</p>
                <p className="text-xs text-muted-foreground">{user?.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={signOut}>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
