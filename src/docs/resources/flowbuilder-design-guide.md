# FlowBuilder — Guia de Design

Como criar fluxos do LionChat (FlowBuilder) que abrem certinhos no canvas, sem nodes empilhados, sem edges quebradas, sem campos inventados. Consulte sempre que for chamar `flows_create` ou `flows_update`.

---

## 1. Decisão de node — qual usar pra cada caso

| Cliente quer | Use o node | NÃO use |
|---|---|---|
| Mandar mensagem (texto, template WhatsApp, áudio, imagem, lista de botões) | `send_message` | `action` pra mandar mensagem |
| Esperar resposta com opções fixas (1, 2, 3) | `wait_response` com `validation: 'options'` | `condition` depois — o próprio wait_response roteia pelas opções |
| Esperar resposta livre | `wait_response` com `validation: 'any'` | - |
| Validar CPF/email/telefone | `wait_response` com `validation: 'regex'` | `condition` com regex |
| Ramificar por valor de variável/atributo | `condition` | `wait_response` |
| Atribuir agente, time, label, status, prioridade, kanban, captain | `action` com `key` específica | - |
| Chamar API externa | `api` | `action` (não tem chamada HTTP genérica) |
| Esperar X tempo | `wait` | - |
| Esperar "segunda-feira às 9h" | `wait` com `waitUnit: 'weekday'` | `condition` por horário |
| Salvar valor calculado em variável | `set_variable` | `action` |
| Gerar resposta com IA | `ai` mode `generate` | - |
| Extrair info da mensagem (ex: pegar valor numérico) | `ai` mode `extract` | regex no wait_response |
| Classificar intenção da mensagem | `ai` mode `intent` | - |
| Analisar sentimento | `ai` mode `sentiment` | - |
| Encerrar fluxo no meio | `action` com `key: 'deactivate_flow'` OU `exit_conditions` no nível do flow | - |
| Distribuir aleatório entre branches | `randomizer` | - |
| Atualizar info de grupo WhatsApp (WAHA) | `update_group` | - |
| Iniciar outro fluxo | `action` com `key: 'start_flow'` OU node `activate_flow` | - |

---

## 2. Schema válido por tipo de node

Todo node tem essa estrutura base:

```json
{
  "id": "uuid-ou-string-unica",
  "type": "<tipo do node>",
  "position": { "x": 0, "y": 0 },
  "data": { "...": "campos específicos do tipo" }
}
```

### 2.1 `start`

```json
{
  "id": "node-start",
  "type": "start",
  "position": { "x": 50, "y": 300 },
  "data": {
    "label": "Início",
    "triggers": [
      { "type": "message_received", "keywords": ["oi", "ola"], "match_mode": "contains" }
    ]
  }
}
```

**Triggers válidos:** `message_received`, `conversation_created`, `conversation_resolved`, `label_added`, `label_removed`, `cron`, `webhook`.

**Handles que SAEM:** `success`.

### 2.2 `send_message`

```json
{
  "id": "node-send-1",
  "type": "send_message",
  "position": { "x": 370, "y": 300 },
  "data": {
    "label": "Boas-vindas",
    "messageItems": [
      { "id": "m1", "type": "text", "content": "Oi {{contact.name}}! Como posso ajudar?" },
      { "id": "m2", "type": "delay", "seconds": 2 },
      { "id": "m3", "type": "whatsapp_template", "templateId": 123, "params": ["valor1"] }
    ]
  }
}
```

**Tipos de item válidos:** `text`, `whatsapp_template` (ou `template`), `canned_response`, `user_input` (lista de botões interativos), `delay`, `attachment`, `audio`.

**ATENÇÃO:** usa `messageItems` (NÃO `items`).

**Handles que SAEM:** `success`, `no_response` (quando tem `user_input` com timeout), `error`.

### 2.3 `wait_response`

```json
{
  "id": "node-wait-1",
  "type": "wait_response",
  "position": { "x": 690, "y": 300 },
  "data": {
    "label": "Pergunta menu",
    "waitTime": 60,
    "waitUnit": "minutes",
    "validation": "options",
    "acceptedOptions": ["1", "2", "3"],
    "invalidMessage": "Por favor responda com 1, 2 ou 3",
    "maxRetries": 3,
    "saveTo": "attribute",
    "saveAttrKey": "escolha_menu"
  }
}
```

**`validation` válidos:** `any`, `options`, `regex`.

**`saveTo` válidos:** `variable` (variável temporária do flow), `attribute` (custom_attributes da CONVERSA), `contact_attribute` (custom_attributes do CONTATO), `""` (não salva).

**Handles que SAEM dependem da validation:**
- `validation: 'any'` → `success`, `timeout`
- `validation: 'options'` → `option_<valor>` para cada valor em `acceptedOptions` (ex: `option_1`, `option_2`, `option_sim`) + `timeout`
- `validation: 'regex'` → `success`, `timeout`

**REGRA:** depois de wait_response com options, NUNCA coloque node `condition` pra ramificar — ligue os edges direto nos handles `option_X`.

### 2.4 `condition`

```json
{
  "id": "node-cond-1",
  "type": "condition",
  "position": { "x": 1010, "y": 300 },
  "data": {
    "label": "Tipo de cliente",
    "conditions": [
      { "id": "c1", "label": "VIP", "field": "contact.custom_attributes.plano", "operator": "equal", "value": "premium" },
      { "id": "c2", "label": "Padrão", "field": "contact.custom_attributes.plano", "operator": "equal", "value": "standard" }
    ]
  }
}
```

**Operadores válidos:** `equal` (ou `field_equals`), `not_equal`, `contains`, `not_contains`, `starts_with`, `ends_with`, `greater_than`, `less_than`, `is_present`, `is_blank`, `regex`.

**Handles que SAEM:** `cond_0`, `cond_1`, `cond_2`, ... (UM POR CONDIÇÃO, pela ordem do array — NÃO use o `id` da condição) + `default` (quando nenhuma bate).

**ATENÇÃO:** o handle é `cond_INDEX` baseado na posição no array, NÃO o `id` da condição. Se você definir `conditions[0].id = "vip"`, mesmo assim o handle é `cond_0`.

### 2.5 `action`

```json
{
  "id": "node-action-1",
  "type": "action",
  "position": { "x": 1330, "y": 300 },
  "data": {
    "label": "Finalizar atendimento",
    "items": [
      { "key": "assign_team", "config": { "team_id": 5 } },
      { "key": "add_label", "config": { "labels": ["lead-qualificado"] } },
      { "key": "create_kanban_item", "config": { "funnel_id": 3, "funnel_stage": "novo_lead" } }
    ]
  }
}
```

**ATENÇÃO:** items usa `config` (NÃO `params`).

**Keys de action válidas:**

| Key | config esperado | Efeito |
|---|---|---|
| `assign_agent` | `{ agent_id }` | Atribui agente humano à conversa |
| `assign_team` | `{ team_id }` | Atribui time |
| `change_status` | `{ status: 'open' \| 'resolved' \| 'pending' \| 'snoozed' }` | Muda status da conversa |
| `change_priority` | `{ priority: 'urgent' \| 'high' \| 'medium' \| 'low' }` | Muda prioridade |
| `add_label` | `{ labels: ['slug1', 'slug2'] }` | Adiciona labels |
| `remove_label` | `{ labels: ['slug'] }` | Remove labels |
| `mute_conversation` | `{}` | Silencia notificações |
| `add_private_note` | `{ content: 'texto' }` | Adiciona nota interna |
| `create_kanban_item` | `{ funnel_id, funnel_stage, item_details? }` | Cria card no Kanban |
| `move_kanban_item_to_stage` | `{ funnel_stage }` | Move card (precisa ter card vinculado) |
| `move_kanban_stage` | `{ funnel_id, funnel_stage }` | Idem |
| `set_kanban_item_status` | `{ status: 'won' \| 'lost' \| 'active' }` | Marca status do card |
| `set_won` | `{}` | Atalho pra ganho |
| `set_lost` | `{ reason? }` | Atalho pra perdido |
| `assign_agent_card` | `{ agent_id }` | Atribui agente ao card |
| `add_card_note` | `{ content }` | Nota no card |
| `send_webhook` | `{ url, headers?, body? }` | Dispara webhook externo |
| `start_flow` | `{ flow_id }` | Inicia outro fluxo |
| `deactivate_flow` ou `disable_flow` | `{}` | Encerra fluxo atual |
| `update_attribute` | `{ entity: 'contact'\|'conversation'\|'card', key, value }` | Seta custom_attribute |
| `assign_captain` (ou `assign_captain_assistant`) | `{ assistant_id }` | Atribui IA Captain |
| `deactivate_captain` | `{}` | Tira a IA da conversa |

**Handles que SAEM:** `success`. Não tem handle `error` — falhas viram warning silencioso e o flow continua.

### 2.6 `api`

```json
{
  "id": "node-api-1",
  "type": "api",
  "position": { "x": 1330, "y": 480 },
  "data": {
    "label": "Consulta CRM externo",
    "method": "POST",
    "url": "https://api.example.com/leads",
    "headers": [
      { "key": "Authorization", "value": "Bearer {{env.CRM_TOKEN}}" },
      { "key": "Content-Type", "value": "application/json" }
    ],
    "body": "{\"name\":\"{{contact.name}}\",\"email\":\"{{contact.email}}\"}",
    "apiResponseVar": "crm_response"
  }
}
```

**Handles que SAEM:** `success`, `error`.

### 2.7 `ai`

```json
{
  "id": "node-ai-1",
  "type": "ai",
  "position": { "x": 1010, "y": 300 },
  "data": {
    "label": "Classifica intenção",
    "aiMode": "intent",
    "aiPrompt": "Classifique a intenção da última mensagem como: compra, suporte, reclamacao ou outro",
    "aiIntentOptions": ["compra", "suporte", "reclamacao", "outro"],
    "aiResponseVar": "intent_result"
  }
}
```

**`aiMode` válidos:** `generate`, `intent`, `sentiment`, `extract`.

**Handles que SAEM dependem do mode:**
- `generate` → `success`, `error`
- `intent` → uma saída por opção em `aiIntentOptions` (ex: `intent_compra`, `intent_suporte`) + `error`
- `sentiment` → `positive`, `negative`, `neutral` + `error`
- `extract` → `success`, `error` (resultado salvo em `aiResponseVar`)

### 2.8 `wait`

```json
{
  "id": "node-wait-time-1",
  "type": "wait",
  "position": { "x": 690, "y": 300 },
  "data": {
    "label": "Espera 10 min",
    "waitTime": 10,
    "waitUnit": "minutes"
  }
}
```

**`waitUnit` válidos:** `seconds`, `minutes`, `hours`, `days`, `weekday` (espera próximo dia da semana).

Pra `weekday`, use também `targetWeekday` (0=domingo, 1=segunda... 6=sábado) e `targetHour` (0-23).

**Handles que SAEM:** `success`.

### 2.9 `set_variable`

```json
{
  "id": "node-setvar-1",
  "type": "set_variable",
  "position": { "x": 370, "y": 300 },
  "data": {
    "label": "Define contexto",
    "variables": [
      { "name": "origem_lead", "value": "Facebook Ads" },
      { "name": "score", "value": "{{contact.custom_attributes.lead_score}}" }
    ]
  }
}
```

**Handles que SAEM:** `success`.

### 2.10 `randomizer`

```json
{
  "id": "node-rand-1",
  "type": "randomizer",
  "position": { "x": 690, "y": 300 },
  "data": {
    "label": "A/B test mensagem",
    "mode": "branches",
    "branches": [
      { "id": "A", "label": "Variante A", "weight": 50 },
      { "id": "B", "label": "Variante B", "weight": 50 }
    ]
  }
}
```

**Handles que SAEM:** o `id` de cada branch (`A`, `B`, ...). Em `mode: 'distribute_agents'` é `success`.

### 2.11 `update_group` (WAHA apenas)

Atualiza nome/descrição/foto de grupo WhatsApp. Use só quando flow roda em inbox WAHA e a conversa for de grupo.

**Handles que SAEM:** `success`, `error`.

### 2.12 `activate_flow`

```json
{
  "id": "node-act-1",
  "type": "activate_flow",
  "position": { "x": 1010, "y": 300 },
  "data": { "label": "Inicia flow B", "flow_id": 42 }
}
```

**Handles que SAEM:** `success`, `error`.

---

## 3. Edges

```json
{
  "id": "edge-1",
  "source": "node-start",
  "target": "node-send-1",
  "sourceHandle": "success",
  "type": "deletable",
  "animated": true
}
```

**REGRAS:**
- `sourceHandle` é OBRIGATÓRIO em todo edge
- Tem que casar com um handle que o node `source` EFETIVAMENTE EXPÕE (ver tabelas acima)
- `id`: usar formato `edge-N` ou `e<source>-<target>`
- `type: 'deletable'` e `animated: true` são os defaults visuais

**Handles INVENTADOS quebram o flow.** Exemplos do que NÃO usar:
- `c1`, `c2`, `c3` (use `cond_0`, `cond_1`)
- `branch1`, `branchA` (no condition; use `cond_X`)
- `out`, `output`, `next` (use o nome real do handle)
- `option1` sem underscore (use `option_1`)

---

## 4. Layout e positioning

Sem `position`, todos os nodes empilham no (0,0). Sempre informe.

### Regras de espaçamento

| Direção | Valor |
|---|---|
| Espaço horizontal entre nodes sequenciais | **+320** em X |
| Espaço vertical entre branches paralelos | **+150** em Y (2 ramos), **+180** (3 ramos), **+150** cada (4+) |
| Y do node start | **300** (ponto médio) |

### Exemplo de layout

Fluxo linear de 4 nodes:
```
(50, 300) → (370, 300) → (690, 300) → (1010, 300)
```

Fluxo com 1 wait_response 3 opções:
```
                                       (1330, 120)  -> option_1
                                              ↑
(50,300) → (370,300) → (690,300) → wait → (1330, 300)  -> option_2
                                              ↓
                                       (1330, 480)  -> option_3
```

Cada branch continua em seu próprio Y, X avança normal:
```
option_1 path: (1330, 120) → (1650, 120) → (1970, 120)
option_2 path: (1330, 300) → (1650, 300) → (1970, 300)
option_3 path: (1330, 480) → (1650, 480) → (1970, 480)
```

### Regra importante

Nodes nunca devem ficar com a mesma coordenada `(x, y)`. Se dois nodes têm posição idêntica, eles SOBREPÕEM visualmente no canvas.

---

## 5. Erros comuns (lista negra)

| Erro | Por que quebra | Forma certa |
|---|---|---|
| `items` no send_message | Schema usa `messageItems` | `messageItems: [...]` |
| `items[].params` no action | Schema usa `config` | `items: [{ key, config: {...} }]` |
| Falta `position` em algum node | Nodes empilham no canvas | Sempre `position: {x, y}` |
| `sourceHandle: "c1"` ou `"vip"` no condition | Não existem | `"cond_0"`, `"cond_1"`, etc |
| Node `condition` depois de `wait_response` com options | Redundante e atrapalha | Ligue `option_X` direto no próximo node |
| Edge sem `sourceHandle` | Frontend não consegue rotear | Sempre informe |
| Edge com `target` apontando pra ID que não existe | Quebra o grafo | Confira que `target` está em `nodes[]` |
| `channel_type: "WhatsApp"` | Precisa do nome de classe Rails | `"Channel::Whatsapp"`, `"Channel::Waha"`, `"Channel::WebWidget"` |
| `validation: "option"` (singular) | Não existe | `"options"` (plural) |
| `waitTime: "60"` (string) | Espera Integer | `waitTime: 60` |
| `inbox_ids` aninhado em `{flow:{...}}` | No MCP, achata-se sozinho | Passa `inbox_ids: [1, 2]` no nível raiz |
| Mais de 1 node `start` | Flow precisa ter exatamente 1 ponto de entrada | Só 1 |
| Node sem edge entrando (exceto start) | Node nunca executa | Confira que todo node não-start tem ao menos 1 edge target apontando pra ele |
| `flow_data` sem `nodes` ou sem `edges` | Estrutura inválida | Inclua sempre, mesmo que `edges: []` |

---

## 6. Checklist pre-submit

Antes de chamar `flows_create` ou `flows_update`, valide mentalmente:

- [ ] Existe exatamente 1 node `type: 'start'`
- [ ] Todo node tem `id` único
- [ ] Todo node tem `type` válido (lista da seção 1)
- [ ] Todo node tem `position: { x: <int>, y: <int> }`
- [ ] Nenhum par de nodes tem a mesma posição `(x, y)`
- [ ] Todo node tem `data` com campos do schema do tipo
- [ ] Todo node não-start tem pelo menos 1 edge chegando (`edge.target = node.id`)
- [ ] Todo edge tem `source`, `target` e `sourceHandle`
- [ ] Todo `sourceHandle` é um handle real exposto pelo node source (seção 2)
- [ ] `channel_type` é classe Rails (`Channel::Waha` etc)
- [ ] `inbox_ids` (se enviado) tem inboxes do mesmo `channel_type`
- [ ] Não tem `condition` redundante depois de `wait_response` com options
- [ ] Layout: nodes em ordem visual da esquerda pra direita, sem sobreposição
