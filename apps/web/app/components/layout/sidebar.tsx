import { NavLink } from 'react-router';

const navItems = [
  { to: '/dashboard', label: 'Dashboard' },
  { to: '/settings', label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="flex w-56 flex-col border-r bg-gray-50">
      <div className="p-4">
        <h2 className="text-lg font-bold">Alta</h2>
      </div>
      <nav className="flex-1 space-y-1 px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `block rounded px-3 py-2 text-sm ${isActive ? 'bg-gray-200 font-medium' : 'text-gray-600 hover:bg-gray-100'}`
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
