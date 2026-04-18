# @lionchat/mcp-server

MCP server que conecta agentes de IA a plataforma LionChat. Expoe mais de 540 ferramentas para gerenciar contatos, conversas, kanban, funis, mensagens, automacoes e muito mais.

## O que e MCP?

MCP (Model Context Protocol) e um protocolo aberto que permite agentes de IA interagirem com servicos externos. Com este servidor, qualquer agente compativel (Claude Code, n8n, agentes customizados) pode executar acoes no LionChat por linguagem natural.

**Sem MCP:** Voce le a documentacao, copia endpoints, configura manualmente.
**Com MCP:** Voce diz "crie um funil com 4 etapas" e o agente faz tudo.

---

## Inicio Rapido

### 1. Obtenha seu token

1. Faca login no LionChat
2. Va em **Configuracoes > Perfil**
3. Copie o **Access Token**

### 2. Descubra seu Account ID

O account_id aparece na URL quando voce esta logado:

```
app.lionchat.com.br/app/accounts/ACCOUNT_ID/dashboard
```

### 3. Conecte ao Claude Code

```bash
claude mcp add lionchat \
  -e LIONCHAT_API_TOKEN=seu_token \
  -e LIONCHAT_ACCOUNT_ID=123 \
  -- npx @lionchat/mcp-server
```

Pronto. Agora voce pode pedir ao Claude Code para fazer qualquer coisa no LionChat.

### Instalacao alternativa (variaveis de ambiente)

```bash
export LIONCHAT_API_TOKEN=seu_token
export LIONCHAT_ACCOUNT_ID=123
npx @lionchat/mcp-server
```

### Instancia self-hosted / white-label

```bash
export LIONCHAT_BASE_URL=https://sua-instancia.com
npx @lionchat/mcp-server
```

---

## Configuracao

| Variavel | CLI | Obrigatorio | Padrao |
|----------|-----|-------------|--------|
| `LIONCHAT_API_TOKEN` | `--token` | Sim | -- |
| `LIONCHAT_ACCOUNT_ID` | `--account` | Sim | -- |
| `LIONCHAT_BASE_URL` | `--base-url` | Nao | `https://app.lionchat.com.br` |
| `LIONCHAT_CATEGORIES` | `--categories` | Nao | todas |
| `LIONCHAT_INCLUDE_PUBLIC_API` | `--include-public-api` | Nao | false |

**Prioridade:** argumentos CLI > variaveis de ambiente > valores padrao.

---

## Filtro por Categoria

Para melhor performance do agente, carregue apenas as ferramentas que precisa:

```bash
npx @lionchat/mcp-server --categories=contacts,conversations,kanban_items
```

### Perfis Sugeridos

| Perfil | Categorias | Uso |
|--------|-----------|-----|
| **Vendas** | `contacts,conversations,messages,kanban_items,funnels,offers` | CRM e automacao de vendas |
| **Suporte** | `contacts,conversations,messages,canned_responses,teams,labels` | Atendimento ao cliente |
| **Marketing** | `contacts,automation_rules,labels,scheduled_messages` | Campanhas e automacao |
| **Completo** | _(sem filtro)_ | Cobertura total da API (541 ferramentas) |

### Categorias Disponiveis

| Slug | Descricao | Tools |
|------|-----------|-------|
| `account` | Detalhes da conta | 3 |
| `agents` | Agentes/operadores | 2 |
| `agent_availability` | Disponibilidade dos agentes | 4 |
| `announcements` | Anuncios internos | 4 |
| `assignment_policies` | Politicas de atribuicao | 11 |
| `automation_rules` | Regras de automacao | 7 |
| `booking_event_types` | Tipos de evento (agenda) | 8 |
| `canned_responses` | Respostas rapidas | 6 |
| `capacity_policies` | Politicas de capacidade | 11 |
| `captain_assistants` | Assistentes IA | 33 |
| `captain_documents` | Base de conhecimento IA | 4 |
| `contacts` | Contatos | 25 |
| `conversations` | Conversas | 30 |
| `copilot_prompts` | Prompts salvos do Copilot | 4 |
| `csat` | Pesquisas de satisfacao | 3 |
| `csat_template` | Template CSAT por inbox | 2 |
| `custom_attributes` | Atributos personalizados | 5 |
| `custom_filters` | Filtros personalizados | 5 |
| `custom_roles` | Roles personalizados | 5 |
| `dashboard_apps` | Apps no dashboard | 5 |
| `ecommerce_webhooks` | Integracoes e-commerce (Guru, Hotmart, Kiwify, Ticto, Eduzz, Monetizze) | 55 |
| `flows` | FlowBuilder (automacoes visuais) | 10 |
| `flow_sessions` | Sessoes do FlowBuilder | 3 |
| `funnels` | Funis de vendas | 10 |
| `google_calendar` | Google Calendar | 13 |
| `inbox_members` | Membros das inboxes | 4 |
| `inbox_migration` | Migracao entre inboxes | 3 |
| `inboxes` | Caixas de entrada | 4 |
| `kanban_agents` | Agentes do Kanban | 3 |
| `kanban_bulk` | Operacoes em massa (Kanban) | 4 |
| `kanban_checklist` | Checklist dos cards | 5 |
| `kanban_config` | Configuracao do Kanban | 5 |
| `kanban_items` | Cards do Kanban | 21 |
| `kanban_notes` | Notas dos cards | 4 |
| `kanban_v2` | Kanban V2 (items, funis, etapas, automacoes) | 25 |
| `labels` | Labels/etiquetas | 5 |
| `macros` | Macros | 6 |
| `messages` | Mensagens | 8 |
| `meta_lead` | Meta Lead Ads (Facebook/Instagram) | 10 |
| `notification_settings` | Config de notificacoes | 2 |
| `notifications` | Notificacoes | 8 |
| `offers` | Ofertas | 6 |
| `portals` | Portais e base de conhecimento | 20 |
| `public_booking` | Agendamento publico | 5 |
| `public_contacts` | API publica: contatos | 3 |
| `public_conversations` | API publica: conversas | 5 |
| `public_csat` | API publica: CSAT | 1 |
| `public_messages` | API publica: mensagens | 3 |
| `reports` | Relatorios V2 | 19 |
| `scheduled_messages` | Mensagens agendadas | 8 |
| `search` | Busca global | 4 |
| `sla` | SLA (Service Level Agreement) | 8 |
| `support_access` | Acesso de suporte | 3 |
| `tasks` | Agenda / Tarefas | 14 |
| `teams` | Times | 7 |
| `upload` | Upload de arquivos | 1 |
| `voip_calls` | Ligacoes VoIP (Zenvia) | 20 |
| `waha_groups` | Grupos WhatsApp | 14 |
| `webhooks` | Webhooks | 4 |
| `whatsapp_templates` | Templates WhatsApp | 5 |
| `account_variables` | Variaveis da conta | 4 |

---

## Exemplos de Uso

### No Claude Code

Depois de conectar, basta pedir em linguagem natural:

```
"Liste meus ultimos 10 contatos"
→ lionchat_contacts_list

"Crie um funil chamado 'Vendas Q2' com etapas Prospeccao, Qualificacao, Proposta, Fechado"
→ lionchat_funnels_create

"Mova o card 42 para a etapa 'Proposta'"
→ lionchat_kanban_items_move_to_stage

"Envie 'Ola!' na conversa 15"
→ lionchat_conversations_messages_create

"Quais conversas estao abertas no time de suporte?"
→ lionchat_conversations_list (com filtro por time)

"Crie uma regra de automacao: quando criar conversa com label VIP, atribuir ao time Premium"
→ lionchat_automation_rules_create

"Qual o saldo do meu VoIP?"
→ lionchat_voip_calls_balance
```

### Em scripts ou agentes customizados

O MCP server funciona com qualquer cliente MCP via transporte stdio. Execute como subprocesso e comunique via stdin/stdout (JSON-RPC).

---

## Ferramentas Meta

Sempre disponiveis, independente do filtro de categorias:

| Ferramenta | Descricao |
|------------|-----------|
| `lionchat_ping` | Testa conectividade e valida o token |
| `lionchat_list_categories` | Lista categorias disponiveis com contagem de ferramentas |

Use `lionchat_ping` para verificar se a conexao esta funcionando antes de executar outras acoes.

---

## API Publica

Os 12 endpoints da API publica (widget, contatos publicos, CSAT) sao **ocultos por padrao** por seguranca. Para habilitar:

```bash
npx @lionchat/mcp-server --include-public-api
```

Esses endpoints usam `inbox_identifier` e `contact_identifier` em vez de token. Habilite apenas se seu agente precisa criar contatos ou conversas em nome de usuarios finais.

---

## Upload de Arquivos

Endpoints que requerem upload de arquivo (importacao CSV, avatar, anexos) estao incluidos mas retornam uma mensagem orientando a usar a interface web ou chamadas API diretas. Upload via MCP sera suportado em versoes futuras.

---

## Seguranca

- Token armazenado em variavel de ambiente, nunca logado ou incluido em respostas
- Transporte stdio -- comunicacao local entre processos, sem porta de rede aberta
- Stateless -- nada salvo em disco
- Timeout de 30 segundos por requisicao
- Retry automatico com backoff exponencial para rate limiting (429)
- Cada requisicao usa o token do cliente -- permissoes do LionChat sao respeitadas no servidor

**Recomendacao:** Use um token com permissoes minimas para seu caso de uso. Evite tokens de administrador em agentes automatizados.

---

## Requisitos

- Node.js 18 ou superior
- Conta no LionChat com access token

---

## Desenvolvimento

```bash
# Clonar o repositorio
git clone https://github.com/LionChatCRM/lionchat-mcp-server-.git
cd lionchat-mcp-server-

# Instalar dependencias
npm install

# Build
npm run build

# Testar localmente
LIONCHAT_API_TOKEN=seu_token LIONCHAT_ACCOUNT_ID=123 node dist/index.js
```

### Atualizar endpoints

Quando a API do LionChat mudar:

1. Atualize o HTML de documentacao da API
2. Execute `npm run extract -- caminho/para/api-docs.html`
3. Verifique o `endpoints.json` gerado
4. Incremente a versao no `package.json`
5. `npm publish`

---

## Licenca

MIT
