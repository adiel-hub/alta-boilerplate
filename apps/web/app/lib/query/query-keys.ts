export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
    user: ['auth', 'user'] as const,
  },
  profiles: {
    all: ['profiles'] as const,
    detail: (id: string) => ['profiles', id] as const,
  },
} as const;
