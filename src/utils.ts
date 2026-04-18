// AIDEV-NOTE: Utility module for LionChat MCP server
// Path substitution, query string building, param separation, and response formatting

// AIDEV-NOTE: Separates raw MCP tool input into path/query/body buckets based on endpoint param definitions
export interface SeparatedParams {
  pathParams: Record<string, unknown>;
  queryParams: Record<string, string>;
  bodyParams: Record<string, unknown>;
}

// AIDEV-NOTE: Replace {account_id} and other {param} placeholders in URL path templates
export function substitutePath(
  pathTemplate: string,
  accountId: string,
  params: Record<string, unknown>
): string {
  let result = pathTemplate.replace('{account_id}', accountId);

  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`{${key}}`, String(value));
  }

  // AIDEV-NOTE: Catch any unsubstituted placeholders — caller forgot a required param
  const missing = result.match(/\{(\w+)\}/);
  if (missing) {
    throw new Error(`Missing required path parameter: ${missing[0]}`);
  }

  return result;
}

// AIDEV-NOTE: Convert params object to URL query string, skipping nulls and handling arrays
export function buildQueryString(params: Record<string, unknown>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined) {
      continue;
    }

    if (Array.isArray(value)) {
      // AIDEV-NOTE: Arrays expand to repeated keys: key=val1&key=val2
      for (const item of value) {
        if (item !== null && item !== undefined) {
          parts.push(
            `${encodeURIComponent(key)}=${encodeURIComponent(String(item))}`
          );
        }
      }
    } else {
      parts.push(
        `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`
      );
    }
  }

  return parts.length > 0 ? `?${parts.join('&')}` : '';
}

// AIDEV-NOTE: Format API response data for MCP client consumption
// Truncates at 50k chars to avoid overwhelming the LLM context
const MAX_RESPONSE_LENGTH = 50000;

export function formatResponse(data: unknown): string {
  const text =
    typeof data === 'string' ? data : JSON.stringify(data, null, 2);

  if (text.length > MAX_RESPONSE_LENGTH) {
    return (
      text.slice(0, MAX_RESPONSE_LENGTH) +
      '\n\n[Response truncated at 50,000 characters. Use pagination parameters (page, limit) to fetch smaller result sets.]'
    );
  }

  return text;
}

// AIDEV-NOTE: Route each input param to path/query/body based on endpoint parameter definitions
export function separateParams(
  input: Record<string, unknown>,
  paramDefs: Array<{ name: string; location: string }>
): SeparatedParams {
  const pathParams: Record<string, unknown> = {};
  const queryParams: Record<string, string> = {};
  const bodyParams: Record<string, unknown> = {};

  // AIDEV-NOTE: Build a lookup map for O(1) location resolution per param
  const locationMap = new Map<string, string>();
  for (const def of paramDefs) {
    locationMap.set(def.name, def.location);
  }

  for (const [key, value] of Object.entries(input)) {
    const location = locationMap.get(key);

    switch (location) {
      case 'path':
        pathParams[key] = value;
        break;
      case 'query':
        if (value !== null && value !== undefined) {
          queryParams[key] = String(value);
        }
        break;
      case 'body':
        bodyParams[key] = value;
        break;
      default:
        // AIDEV-NOTE: Params not in definitions go to body (catch-all for nested/extra fields)
        bodyParams[key] = value;
        break;
    }
  }

  return { pathParams, queryParams, bodyParams };
}
