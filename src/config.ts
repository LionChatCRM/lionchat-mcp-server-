// AIDEV-NOTE: Config module for LionChat MCP server
// Reads configuration from CLI args (--key=value) and env vars, CLI takes priority

export interface Config {
  apiToken: string;
  accountId: string;
  baseUrl: string;
  categories: string[] | null; // null = all categories
  includePublicApi: boolean;
}

// AIDEV-NOTE: Parse CLI args from process.argv looking for --key=value and --flag patterns
function getCliArg(name: string): string | undefined {
  const prefix = `--${name}=`;
  for (const arg of process.argv) {
    if (arg.startsWith(prefix)) {
      return arg.slice(prefix.length);
    }
    // AIDEV-NOTE: Boolean flag support (--flag without =value)
    if (arg === `--${name}`) {
      return 'true';
    }
  }
  return undefined;
}

// AIDEV-NOTE: Categories come as comma-separated string, parse into array or null
function parseCategories(raw: string | undefined): string[] | null {
  if (!raw || raw.trim() === '') {
    return null;
  }
  return raw
    .split(',')
    .map((c) => c.trim())
    .filter((c) => c.length > 0);
}

// AIDEV-NOTE: Priority: CLI args > env vars > defaults
export function loadConfig(): Config {
  const apiToken =
    getCliArg('token') ?? process.env.LIONCHAT_API_TOKEN ?? undefined;

  const accountId =
    getCliArg('account') ?? process.env.LIONCHAT_ACCOUNT_ID ?? undefined;

  const baseUrl =
    getCliArg('base-url') ??
    process.env.LIONCHAT_BASE_URL ??
    'https://app.lionchat.com.br';

  const categoriesRaw =
    getCliArg('categories') ?? process.env.LIONCHAT_CATEGORIES ?? undefined;

  const includePublicApiRaw =
    getCliArg('include-public-api') ??
    process.env.LIONCHAT_INCLUDE_PUBLIC_API ??
    undefined;

  // AIDEV-NOTE: Validate required fields with actionable error messages
  if (!apiToken) {
    throw new Error(
      'Error: LIONCHAT_API_TOKEN is required.\n' +
        'Set it as an environment variable or pass --token=YOUR_TOKEN\n' +
        'Get your token at: Login > Profile Settings'
    );
  }

  if (!accountId) {
    throw new Error(
      'Error: LIONCHAT_ACCOUNT_ID is required.\n' +
        'Set it as an environment variable or pass --account=YOUR_ACCOUNT_ID\n' +
        'Find your account ID at: Login > Settings > Account'
    );
  }

  return {
    apiToken,
    accountId,
    baseUrl,
    categories: parseCategories(categoriesRaw),
    includePublicApi:
      includePublicApiRaw === 'true' || includePublicApiRaw === '1',
  };
}
