import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { AuthProvider } from '~/providers/auth-provider';
import { QueryProvider } from '~/providers/query-provider';
import './styles/tailwind.css';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="bg-background text-foreground antialiased">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex h-screen items-center justify-center">
      <p className="text-muted-foreground">Loading...</p>
    </div>
  );
}

export default function Root() {
  return (
    <QueryProvider>
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    </QueryProvider>
  );
}
