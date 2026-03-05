import { type RouteConfig, route, layout } from '@react-router/dev/routes';

export default [
  route('/', './routes/_index.tsx'),

  layout('./routes/auth/_layout.tsx', [
    route('login', './routes/auth/login.tsx'),
    route('signup', './routes/auth/signup.tsx'),
    route('forgot-password', './routes/auth/forgot-password.tsx'),
    route('callback', './routes/auth/callback.tsx'),
  ]),

  layout('./routes/app/_layout.tsx', [
    route('dashboard', './routes/app/dashboard.tsx'),
    route('settings', './routes/app/settings.tsx'),
  ]),
] satisfies RouteConfig;
