import { Outlet } from 'react-router';
import { AppSidebar } from '~/components/layout/sidebar';
import { Header } from '~/components/layout/header';

export default function AppLayoutRoute() {
  return (
    <div className="flex h-screen">
      <AppSidebar />
      <div className="flex flex-1 flex-col">
        <Header />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
