// AIDEV-NOTE: Carrega instructions.md de src/docs (dev) ou dist/docs (prod).
// Sincronizado de docs-lionchat/mcp/instructions.md via sync-to-mcps.sh.
// Conteudo enviado pra IA conectada via McpServer instructions option.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));

let cachedInstructions: string | null = null;

export function getServerInstructions(): string {
  if (cachedInstructions !== null) return cachedInstructions;

  const candidates = [
    join(__dirname, '../docs/instructions.md'),
    join(__dirname, '../../src/docs/instructions.md'),
  ];

  for (const filepath of candidates) {
    if (existsSync(filepath)) {
      cachedInstructions = readFileSync(filepath, 'utf-8');
      return cachedInstructions;
    }
  }

  cachedInstructions =
    'LionChat MCP Server — Plataforma brasileira de atendimento. Consulte resources/list pra mais info.';
  return cachedInstructions;
}
