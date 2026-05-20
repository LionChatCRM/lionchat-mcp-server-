// AIDEV-NOTE: Registra MCP Prompts no McpServer (high-level SDK).
// Templates JSON sincronizados de docs-lionchat/mcp/prompts/.
// Cada prompt declara argumentos opcionais e um template Mustache-style ({{var|default}}).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { CompleteRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { z } from 'zod';

const __dirname = dirname(fileURLToPath(import.meta.url));

interface PromptArgument {
  name: string;
  description: string;
  required: boolean;
}

interface PromptDefinition {
  name: string;
  title: string;
  description: string;
  arguments: PromptArgument[];
  template: string;
}

function findPromptsDir(): string | null {
  const candidates = [
    join(__dirname, '../docs/prompts'),
    join(__dirname, '../../src/docs/prompts'),
  ];
  for (const p of candidates) {
    if (existsSync(p)) return p;
  }
  return null;
}

function loadPrompts(): PromptDefinition[] {
  const dir = findPromptsDir();
  if (!dir) {
    console.error('[mcp] prompts directory not found');
    return [];
  }
  const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
  const prompts: PromptDefinition[] = [];
  for (const file of files) {
    try {
      const parsed = JSON.parse(readFileSync(join(dir, file), 'utf-8')) as PromptDefinition;
      if (parsed.name && parsed.template) prompts.push(parsed);
    } catch (err) {
      console.error(`[mcp] failed to parse ${file}: ${(err as Error).message}`);
    }
  }
  return prompts;
}

function renderTemplate(template: string, args: Record<string, string | undefined>): string {
  return template.replace(/\{\{(\w+)(?:\|([^}]*))?\}\}/g, (_m, name: string, fallback?: string) => {
    const value = args[name];
    if (value !== undefined && value !== '') return String(value);
    return fallback ?? '';
  });
}

// AIDEV-NOTE: Sugestoes hardcoded por argumento de prompt — mesmo conjunto do MCP Remote.
// Argumentos id-like (team_id, agent_id, etc) ficam vazios — usuario descobre via tools.
const ARG_COMPLETIONS: Record<string, string[]> = {
  period: ['today', 'week', 'month', 'quarter', 'year'],
  period_days: ['1', '7', '14', '30', '60', '90', '180', '365'],
  days_inactive: ['7', '14', '30', '60', '90', '180'],
  days_stuck: ['3', '7', '14', '30'],
  sample_size: ['10', '20', '50', '100'],
  min_past_conversations: ['1', '3', '5', '10'],
  goal_hint: [
    'saudacao com triagem',
    'captura de lead',
    'qualificacao BANT',
    'pesquisa CSAT pos-atendimento',
    'roteamento por horario comercial',
    'triagem com IA',
    're-engajamento de lead frio',
    'suporte com escalation',
    'agendamento via API',
    'notificacao por webhook',
  ],
};

export function registerPrompts(server: McpServer): void {
  const prompts = loadPrompts();

  // AIDEV-NOTE: Registra handler completion/complete diretamente no Server low-level.
  // McpServer.server expoe o Server pra esses casos. Tambem anuncia capability completions
  // automaticamente quando handler eh registrado.
  server.server.setRequestHandler(CompleteRequestSchema, async (request) => {
    const { ref, argument } = request.params;
    if (ref.type !== 'ref/prompt') {
      return { completion: { values: [], total: 0, hasMore: false } };
    }
    const prompt = prompts.find((p) => p.name === ref.name);
    if (!prompt) {
      return { completion: { values: [], total: 0, hasMore: false } };
    }
    const hasArg = prompt.arguments.some((a) => a.name === argument.name);
    if (!hasArg) {
      return { completion: { values: [], total: 0, hasMore: false } };
    }
    const all = ARG_COMPLETIONS[argument.name] ?? [];
    const prefix = (argument.value ?? '').toLowerCase();
    const matches = prefix ? all.filter((v) => v.toLowerCase().startsWith(prefix)) : all;
    const trimmed = matches.slice(0, 100);
    return {
      completion: {
        values: trimmed,
        total: matches.length,
        hasMore: matches.length > 100,
      },
    };
  });

  for (const prompt of prompts) {
    // Build Zod schema from argument list (all optional)
    const argsSchema: Record<string, z.ZodOptional<z.ZodString>> = {};
    for (const arg of prompt.arguments) {
      argsSchema[arg.name] = z.string().optional().describe(arg.description);
    }

    server.prompt(
      prompt.name,
      prompt.description,
      argsSchema,
      async (args) => {
        const rendered = renderTemplate(prompt.template, args as Record<string, string | undefined>);
        return {
          description: prompt.title,
          messages: [
            {
              role: 'user',
              content: { type: 'text', text: rendered },
            },
          ],
        };
      },
    );
  }
}
