import { Card, CardContent, CardHeader, CardTitle } from '@altahq/design-system/components/ui/card';
import { Text } from '@altahq/design-system/components/ui/text';
import { Badge } from '@altahq/design-system/components/ui/badge';
import { Separator } from '@altahq/design-system/components/ui/separator';
import { useAuth } from '~/providers/auth-provider';

export default function DashboardRoute() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <Text variant="heading3">Dashboard</Text>
        <Text variant="muted" className="mt-1">
          Welcome back, {user?.email?.split('@')[0]}
        </Text>
      </div>

      <Separator />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Status</CardTitle>
            <Badge variant="default">Active</Badge>
          </CardHeader>
          <CardContent>
            <Text variant="heading3">All systems go</Text>
            <Text variant="small" className="mt-1 text-muted-foreground">
              Your app is running smoothly
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Environment</CardTitle>
          </CardHeader>
          <CardContent>
            <Text variant="heading3">Development</Text>
            <Text variant="small" className="mt-1 text-muted-foreground">
              Local dev server
            </Text>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Account</CardTitle>
          </CardHeader>
          <CardContent>
            <Text variant="heading3" className="truncate">
              {user?.email?.split('@')[0]}
            </Text>
            <Text variant="small" className="mt-1 text-muted-foreground">
              {user?.email}
            </Text>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Getting Started</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                1
              </div>
              <div>
                <Text variant="paragraph" className="font-medium">
                  Build your pages
                </Text>
                <Text variant="small" className="text-muted-foreground">
                  Add new routes in <code className="rounded bg-muted px-1 py-0.5 text-xs">app/routes/</code>
                </Text>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                2
              </div>
              <div>
                <Text variant="paragraph" className="font-medium">
                  Set up your database
                </Text>
                <Text variant="small" className="text-muted-foreground">
                  Create migrations with <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm db:new-migration</code>
                </Text>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-xs font-medium text-primary-foreground">
                3
              </div>
              <div>
                <Text variant="paragraph" className="font-medium">
                  Deploy to production
                </Text>
                <Text variant="small" className="text-muted-foreground">
                  Push to GitHub and run <code className="rounded bg-muted px-1 py-0.5 text-xs">pnpm deploy:prod</code>
                </Text>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
