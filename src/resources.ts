// AIDEV-NOTE: Registra MCP Resources no McpServer (high-level SDK).
// 4 docs Markdown sincronizados de docs-lionchat/mcp/resources/.

import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface ResourceDef {
  name: string;
  uri: string;
  description: string;
  filename: string;
}

export const RESOURCES: ResourceDef[] = [
  {
    name: 'Glossario LionChat',
    uri: 'lionchat://docs/glossary',
    description:
      'Glossario completo de termos, status codes, enums e conceitos. Consulte sempre que encontrar campo numerico ou enum desconhecido.',
    filename: 'glossary.md',
  },
  {
    name: 'Modelo de Dados',
    uri: 'lionchat://docs/data-model',
    description:
      'Mapa completo de entidades, relacionamentos e FKs. Use quando precisar entender como dados conectam.',
    filename: 'data-model.md',
  },
  {
    name: 'Guia de Relatorios',
    uri: 'lionchat://docs/reports-guide',
    description:
      'Como interpretar cada um dos 19 endpoints de relatorio. Unidades, comparativos, business hours, CSAT, SLA.',
    filename: 'reports-guide.md',
  },
  {
    name: 'Convencoes da API',
    uri: 'lionchat://docs/api-conventions',
    description:
      'Auth, paginacao, filtros, datas, codigos HTTP, rate limits. Use quando tiver duvida sobre como chamar endpoint.',
    filename: 'api-conventions.md',
  },
];

function findDocsPath(filename: string): string | null {
  const candidates = [
    join(__dirname, '../docs/resources', filename),
    join(__dirname, '../../src/docs/resources', filename),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

export function registerResources(server: McpServer): void {
  for (const res of RESOURCES) {
    server.registerResource(
      res.name,
      res.uri,
      {
        description: res.description,
        mimeType: 'text/markdown',
      },
      async (uri) => {
        const filepath = findDocsPath(res.filename);
        if (!filepath) {
          throw new Error(`Resource file missing: ${res.filename}`);
        }
        return {
          contents: [
            {
              uri: uri.href,
              mimeType: 'text/markdown',
              text: readFileSync(filepath, 'utf-8'),
            },
          ],
        };
      },
    );
  }
}
