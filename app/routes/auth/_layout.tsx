import { Outlet } from 'react-router';
import { Card, CardContent } from '@altahq/design-system/components/ui/card';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          <Outlet />
        </CardContent>
      </Card>
    </div>
  );
}
