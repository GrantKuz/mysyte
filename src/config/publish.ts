type ImportMetaWithEnv = ImportMeta & { env?: Record<string, string | undefined> };

const env = (import.meta as ImportMetaWithEnv).env ?? {};

function readEnv(name: string) {
  return (env[name] || '').trim();
}

export const REMOTE_CATALOG_FLAG = readEnv('VITE_ENABLE_REMOTE_CATALOG') === 'true';
export const SUPABASE_URL = readEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = readEnv('VITE_SUPABASE_ANON_KEY');
export const SUPABASE_BUCKET = readEnv('VITE_SUPABASE_BUCKET') || 'works';
export const SUPABASE_WORKS_TABLE = readEnv('VITE_SUPABASE_WORKS_TABLE') || 'works';

export const REMOTE_CATALOG_ENABLED =
  REMOTE_CATALOG_FLAG &&
  SUPABASE_URL.length > 0 &&
  SUPABASE_ANON_KEY.length > 0 &&
  SUPABASE_BUCKET.length > 0 &&
  SUPABASE_WORKS_TABLE.length > 0;
