import { Card, CardContent, CardHeader, CardTitle } from '@altahq/design-system/components/ui/card';
import { Label } from '@altahq/design-system/components/ui/label';
import { Input } from '@altahq/design-system/components/ui/input';
import { Text } from '@altahq/design-system/components/ui/text';
import { Separator } from '@altahq/design-system/components/ui/separator';
import { Avatar, AvatarFallback } from '@altahq/design-system/components/ui/avatar';
import { Badge } from '@altahq/design-system/components/ui/badge';
import { useAuth } from '~/providers/auth-provider';

export default function SettingsRoute() {
  const { user } = useAuth();

  const initials = user?.email
    ? user.email
        .split('@')[0]
        .slice(0, 2)
        .toUpperCase()
    : '?';

  return (
    <div className="space-y-6">
      <div>
        <Text variant="heading3">Settings</Text>
        <Text variant="muted" className="mt-1">
          Manage your account and preferences
        </Text>
      </div>

      <Separator />

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar size="lg">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div>
              <Text variant="paragraph" className="font-medium">
                {user?.email?.split('@')[0]}
              </Text>
              <Text variant="small" className="text-muted-foreground">
                {user?.email}
              </Text>
            </div>
          </div>
          <Separator />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user?.email ?? ''} disabled />
            </div>
            <div className="space-y-2">
              <Label>User ID</Label>
              <Input value={user?.id ?? ''} disabled />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Text variant="paragraph" className="font-medium">
                Authentication Provider
              </Text>
              <Text variant="small" className="text-muted-foreground">
                How you sign in to your account
              </Text>
            </div>
            <Badge variant="secondary">{user?.app_metadata?.provider ?? 'email'}</Badge>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Text variant="paragraph" className="font-medium">
                Account Created
              </Text>
              <Text variant="small" className="text-muted-foreground">
                When your account was first created
              </Text>
            </div>
            <Text variant="small" className="text-muted-foreground">
              {user?.created_at ? new Date(user.created_at).toLocaleDateString() : '—'}
            </Text>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <Text variant="paragraph" className="font-medium">
                Last Sign In
              </Text>
              <Text variant="small" className="text-muted-foreground">
                Your most recent sign in
              </Text>
            </div>
            <Text variant="small" className="text-muted-foreground">
              {user?.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleDateString() : '—'}
            </Text>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
