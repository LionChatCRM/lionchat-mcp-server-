// AIDEV-NOTE: Registra MCP Prompts no McpServer (high-level SDK).
// Templates JSON sincronizados de docs-lionchat/mcp/prompts/.
// Cada prompt declara argumentos opcionais e um template Mustache-style ({{var|default}}).

import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
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

export function registerPrompts(server: McpServer): void {
  const prompts = loadPrompts();

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
