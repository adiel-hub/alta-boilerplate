import { type RouteConfig, route, layout } from '@react-router/dev/routes';

export default [
  route('/', './routes/_index.tsx'),

  layout('./routes/app/_layout.tsx', [
    route('dashboard', './routes/app/dashboard.tsx'),
    route('settings', './routes/app/settings.tsx'),
  ]),
] satisfies RouteConfig;
