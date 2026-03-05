import { Card, CardContent, CardHeader, CardTitle } from '@altahq/design-system/components/ui/card';
import { Text } from '@altahq/design-system/components/ui/text';
import { useAuth } from '~/providers/auth-provider';

export default function DashboardRoute() {
  const { user } = useAuth();

  return (
    <div>
      <Text variant="heading3" className="mb-4">
        Dashboard
      </Text>
      <Card>
        <CardHeader>
          <CardTitle>Welcome</CardTitle>
        </CardHeader>
        <CardContent>
          <Text variant="muted">Signed in as {user?.email}</Text>
        </CardContent>
      </Card>
    </div>
  );
}
