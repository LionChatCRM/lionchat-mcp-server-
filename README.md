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

## O que o MCP pode fazer por voce

O MCP transforma o LionChat em uma plataforma controlavel por IA. Em vez de clicar em menus e preencher formularios, voce fala o que precisa e o agente faz.

### Gestao de Contatos e CRM

```
"Importa esses 50 leads que recebi hoje e adiciona a label 'Evento Marco 2026' em todos"

"Busca todos os contatos que tem 'advogado' no campo profissao e cria um segmento"

"Mescla o contato duplicado do Joao — o ID 45 e o ID 128 sao a mesma pessoa"

"Quais contatos novos entraram essa semana? Me da um resumo por canal de origem"
```

### Kanban e Funil de Vendas

```
"Cria um funil chamado 'Lancamento Produto X' com as etapas:
 Interesse, Qualificacao, Proposta Enviada, Negociacao, Fechado Ganho, Perdido"

"Pega todos os cards que estao na etapa 'Qualificacao' ha mais de 7 dias e move pra 'Perdido'"

"Cria um card no funil de Vendas pra cada contato que tem a label 'Lead Quente'"

"Qual o valor total dos cards na etapa 'Proposta Enviada'? E quantos tem?"

"Atribui o agente Maria a todos os cards do funil 'Suporte Tecnico'"
```

### Conversas e Atendimento

```
"Quantas conversas abertas eu tenho agora? Separa por time"

"Pega as 10 conversas mais antigas sem resposta e atribui ao time de Suporte"

"Envia 'Ola! Como posso ajudar?' na conversa 234"

"Fecha todas as conversas resolvidas que estao paradas ha mais de 48 horas"

"Agenda uma mensagem pra amanha as 9h na conversa 56: 'Bom dia! Tudo bem com o orcamento?'"
```

### Automacoes e Regras

```
"Cria uma automacao: quando uma conversa receber a label 'Urgente',
 atribuir ao time Premium e enviar notificacao"

"Lista todas as minhas regras de automacao ativas"

"Duplica a automacao 'Boas-vindas VIP' e muda o time de destino pra 'Vendas B2B'"
```

### Agenda e Tarefas

```
"Cria uma tarefa pra ligar pro Joao amanha as 14h"

"Quais tarefas estao pendentes pra hoje?"

"Cancela todas as tarefas de follow-up da semana passada que nao foram feitas"

"Agenda uma reuniao com o contato 45 pra quinta-feira as 10h"
```

### Mensagens e Templates WhatsApp

```
"Lista os templates WhatsApp aprovados"

"Agenda o envio do template 'Lembrete Pagamento' pra todos os contatos com label 'Inadimplente'"

"Envia uma imagem do produto novo na conversa 89 com a legenda 'Confira nossa novidade!'"
```

### Relatorios e Metricas

```
"Qual foi o tempo medio de primeira resposta essa semana?"

"Me da o relatorio de desempenho dos agentes do mes passado"

"Quantas conversas cada inbox recebeu nos ultimos 30 dias?"

"Qual a nota media do CSAT esse mes? Compara com o mes anterior"

"Quais agentes estao online agora e quantas conversas cada um tem?"
```

### Grupos WhatsApp

```
"Lista todos os grupos WhatsApp da inbox 5"

"Adiciona o numero 5511999887766 no grupo 'Clientes Premium'"

"Qual o link de convite do grupo 'Suporte Tecnico'?"

"Remove o participante 5511888776655 do grupo 'Equipe Interna'"
```

### IA e Assistentes

```
"Lista meus assistentes de IA configurados"

"Pede pro assistente 'Vendas' sugerir uma resposta pra conversa 123"

"Resume a conversa 456 em 3 pontos principais"

"Adiciona a URL https://empresa.com/faq na base de conhecimento do assistente"
```

### VoIP e Ligacoes

```
"Qual o saldo do meu VoIP?"

"Lista as ultimas 20 ligacoes recebidas"

"Transcreve a ligacao 78 e me da o resumo"

"Analisa a ligacao 92 — o cliente ficou satisfeito?"
```

### Operacoes em Massa

```
"Pega todos os contatos com label 'Inativo' e remove a label"

"Move todos os cards do agente Pedro pro agente Ana (ele saiu de ferias)"

"Adiciona a label 'Black Friday' em todos os contatos que compraram em novembro"

"Exporta todos os cards do funil 'Vendas Q1' pra eu analisar"
```

---

### Exemplos rapidos (comando e ferramenta usada)

| Voce diz | Ferramenta chamada |
|----------|-------------------|
| "Liste meus contatos" | `lionchat_contacts_list` |
| "Crie um funil com 4 etapas" | `lionchat_funnels_create` |
| "Mova o card 42 pra Proposta" | `lionchat_kanban_items_move_to_stage` |
| "Envie mensagem na conversa 15" | `lionchat_conversations_messages_create` |
| "Conversas abertas por time" | `lionchat_conversations_list` |
| "Crie regra de automacao" | `lionchat_automation_rules_create` |
| "Saldo do VoIP" | `lionchat_voip_calls_balance` |
| "Templates WhatsApp" | `lionchat_whatsapp_templates_list` |
| "Relatorio de agentes" | `lionchat_reports_agents` |
| "Grupos do WhatsApp" | `lionchat_waha_groups_list` |

### No n8n

O n8n suporta MCP de duas formas:

#### Opcao 1: MCP Client + AI Agent (recomendado para decisoes inteligentes)

1. Adicione um node **"AI Agent"** ao seu workflow (Claude, GPT, ou outro LLM)
2. Adicione um node **"MCP Client"** como ferramenta do agente
3. Configure o MCP Client:
   - **Transport:** stdio
   - **Command:** `npx`
   - **Arguments:** `@lionchat/mcp-server`
   - **Environment Variables:**
     - `LIONCHAT_API_TOKEN` = seu token
     - `LIONCHAT_ACCOUNT_ID` = seu account ID
     - `LIONCHAT_CATEGORIES` = categorias desejadas (opcional)
4. Conecte o MCP Client ao AI Agent
5. O agente de IA decide automaticamente quais ferramentas usar

**Exemplo de prompt no AI Agent:**
> "Analise os contatos criados ontem. Se algum tem empresa no nome, crie um card no funil 'Vendas B2B' na etapa 'Prospeccao'."

O agente vai chamar `lionchat_contacts_list`, analisar os resultados, e chamar `lionchat_kanban_items_create` para cada contato relevante.

#### Opcao 2: HTTP Request (para automacoes fixas)

Para automacoes tipo "se X entao Y" sem necessidade de IA, use o node **HTTP Request** do n8n chamando a API do LionChat diretamente:

- **URL:** `https://app.lionchat.com.br/api/v1/accounts/{account_id}/contacts`
- **Header:** `api_access_token: seu_token`
- **Method:** GET, POST, etc.

#### Quando usar cada opcao

| Abordagem | Quando usar |
|-----------|-------------|
| **MCP + AI Agent** | O fluxo precisa de decisao inteligente ("analise e decida") |
| **HTTP Request** | Automacao fixa ("quando receber webhook, criar contato") |

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
