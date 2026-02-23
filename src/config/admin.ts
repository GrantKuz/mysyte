type ImportMetaWithEnv = ImportMeta & { env?: Record<string, string | undefined> };

const env = (import.meta as ImportMetaWithEnv).env ?? {};
const fallbackAdminPath = '/studio-ops-7f3b9c4d2a';

function normalizeAdminPath(pathValue: string | undefined): string {
  const rawValue = (pathValue || fallbackAdminPath).trim();
  const cleaned = rawValue.replace(/[^a-zA-Z0-9/_-]/g, '');
  const withoutLeadingSlashes = cleaned.replace(/^\/+/, '');
  return `/${withoutLeadingSlashes || fallbackAdminPath.slice(1)}`;
}

export const ADMIN_ENABLED = env.VITE_ENABLE_ADMIN === 'true';
export const ADMIN_PATH = normalizeAdminPath(env.VITE_ADMIN_PATH);
export const ADMIN_ROUTE_PATH = ADMIN_PATH.slice(1);
