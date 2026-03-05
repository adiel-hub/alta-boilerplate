import { NavLink } from 'react-router';
import { Text } from '@altahq/design-system/components/ui/text';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/settings', label: 'Settings' },
];

export function AppSidebar() {
  return (
    <aside className="flex h-screen w-64 flex-col border-r bg-background">
      <div className="p-4">
        <Text variant="large">Alta</Text>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                isActive ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:bg-accent/50'
              }`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
