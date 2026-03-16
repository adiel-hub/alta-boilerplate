import { Outlet } from 'react-router';
import { Card, CardContent } from '@alta/design-system/components/ui/card';
import { Text } from '@alta/design-system/components/ui/text';

export default function AuthLayout() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/30 px-4">
      <div className="mb-6 flex flex-col items-center gap-3">
        <img src="/alta-icon.png" alt="Alta" className="h-12 w-12" />
        <Text variant="heading4" className="font-semibold">
          Alta
        </Text>
      </div>
      <Card className="w-full max-w-sm shadow-sm">
        <CardContent className="p-6">
          <Outlet />
        </CardContent>
      </Card>
      <img src="/powered_by_Alta.png" alt="Powered by Alta" className="mt-6 h-5" />
    </div>
  );
}
