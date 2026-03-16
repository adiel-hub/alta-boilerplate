import { createBrowserClient } from '@supabase/ssr';
import type { Database } from './types/database.types';
import altaConfig from '../../../alta.config.json';

let client: ReturnType<typeof createBrowserClient<Database>> | null = null;

export function getSupabaseClient() {
  if (!client) {
    client = createBrowserClient<Database>(
      altaConfig.supabaseUrl,
      altaConfig.supabaseAnonKey
    );
  }
  return client;
}
