import { Card, CardContent, CardHeader, CardTitle } from '@altahq/design-system/components/ui/card';
import { Label } from '@altahq/design-system/components/ui/label';
import { Text } from '@altahq/design-system/components/ui/text';
import { useAuth } from '~/providers/auth-provider';

export default function SettingsRoute() {
  const { user } = useAuth();

  return (
    <div>
      <Text variant="heading3" className="mb-4">
        Settings
      </Text>
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Email</Label>
          <Text variant="paragraph">{user?.email}</Text>
        </CardContent>
      </Card>
    </div>
  );
}
