# Kanban — Guia Profundo

Tudo sobre o módulo Kanban/CRM do LionChat: funis, etapas, cards, valor, automações, integrações com conversação.

## Estrutura

### Funnel (Funil)
Container de etapas. Conta pode ter vários funis (ex: "Vendas", "Pós-venda", "Renovação").

| Campo | Descrição |
|---|---|
| `id` | Identificador |
| `name` | Nome do funil (ex: "Vendas B2B") |
| `description` | Descrição livre |
| `stages` | jsonb com etapas (ver abaixo) |
| `archived` | Boolean — funis arquivados não aparecem na UI ativa |
| `active` | Boolean — controla se aceita movimentação |
| `settings` | jsonb — config customizada (ex: cores, automações) |

### Stages (Etapas) — dentro de `funnel.stages`

Stages NÃO são tabela separada. São armazenadas como jsonb dentro do Funnel:

```json
{
  "novo_lead": {
    "name": "Novo Lead",
    "color": "#3B82F6",
    "position": 1,
    "description": "Lead ainda não qualificado"
  },
  "qualificado": {
    "name": "Qualificado",
    "color": "#10B981",
    "position": 2,
    "description": "Lead com interesse confirmado"
  },
  "ganho": {
    "name": "Ganho",
    "color": "#22C55E",
    "position": 99
  },
  "perdido": {
    "name": "Perdido",
    "color": "#EF4444",
    "position": 100
  }
}
```

### KanbanItem (Card)
Um card individual dentro de uma etapa.

| Campo | Descrição |
|---|---|
| `id` | Identificador |
| `funnel_id` | Funil ao qual pertence |
| `funnel_stage` | Chave da etapa (ex: `"novo_lead"`) |
| `position` | Ordem dentro da etapa |
| `stage_entered_at` | Quando entrou na etapa atual (pra métrica de tempo) |
| `conversation_display_id` | Conversa principal vinculada |
| `linked_conversations` | jsonb array `[{display_id: 123}, {display_id: 456}]` — múltiplas conversas |
| `item_details` | jsonb (ver abaixo) |
| `custom_attributes` | jsonb — campos custom (igual contatos) |
| `assigned_agents` | jsonb array de agentes responsáveis |
| `activities` | jsonb array — log de atividades |
| `checklist` | jsonb array de tarefas dentro do card |
| `timer_started_at`, `timer_duration` | Timer interno do card |

### item_details (detalhes do card)

```json
{
  "title": "Cliente XYZ - Plano Pro",
  "value": 5000.0,
  "priority": "high",
  "description": "Cliente interessado em upgrade",
  "notes": [
    {"text": "Ligou pedindo proposta", "created_at": "2026-05-15T10:00:00Z"}
  ],
  "offers": [
    {"id": 12, "title": "Pro 12 meses", "value": 4800}
  ],
  "custom_attributes": {
    "origem_lead": "Facebook Ads"
  }
}
```

**`value`** é onde fica o valor monetário do negócio (usado em pipelines).

### assigned_agents

```json
[
  {
    "id": 5,
    "name": "Maria Souza",
    "email": "maria@empresa.com",
    "avatar_url": "https://...",
    "assigned_at": "2026-05-14T09:00:00Z",
    "assigned_by": 1,
    "source": "manual"
  }
]
```

Múltiplos agentes podem ter o mesmo card. `source` pode ser `manual`, `automation`, `inherited_from_conversation`.

### linked_conversations — IMPORTANTE

```json
[{"display_id": 123}, {"display_id": 456}]
```

**NUNCA gravar inteiros direto** — sempre objetos com `{display_id: ...}`. Inteiros diretos causam TypeError no `as_json`.

## Posição (ordering)

Cada KanbanItem tem `position` (integer). Cards ordenados ASC dentro da etapa.

Reordenação:
- API endpoint: `POST /api/v2/kanban/items/reorder`
- Recebe array com nova ordem `[{id: 5, position: 1}, {id: 8, position: 2}]`
- Recalcula `position` em todas as etapas afetadas

Mover entre etapas:
- API endpoint: `POST /api/v2/kanban/items/{id}/move`
- Body: `{funnel_stage: "qualificado", position: 1}`
- Atualiza `funnel_stage`, `stage_entered_at`, e `position`

## Atividades (activities)

Log automático de eventos do card:

```json
[
  {
    "type": "stage_changed",
    "from": "novo_lead",
    "to": "qualificado",
    "by_user_id": 1,
    "at": "2026-05-15T10:00:00Z"
  },
  {
    "type": "agent_assigned",
    "agent_id": 5,
    "by_user_id": 1,
    "at": "2026-05-15T10:01:00Z"
  },
  {
    "type": "note_added",
    "note_id": 42,
    "by_user_id": 5,
    "at": "2026-05-15T10:05:00Z"
  }
]
```

Tipos comuns: `created`, `stage_changed`, `agent_assigned`, `agent_removed`, `note_added`, `value_changed`, `priority_changed`, `archived`.

## Checklist (tarefas dentro do card)

```json
[
  {
    "id": "abc-123",
    "title": "Enviar proposta por email",
    "checked": true,
    "completed_at": "2026-05-15T10:00:00Z",
    "completed_by": 5
  },
  {
    "id": "abc-124",
    "title": "Agendar follow-up",
    "checked": false
  }
]
```

Útil pra workflows internos. Não confundir com `tasks` (que é módulo separado de tarefas globais).

## Pipeline (visão por valor)

Pipeline = soma de `item_details.value` agrupado por etapa.

Exemplo:
```
Funil "Vendas"
├── Novo Lead: 12 cards | R$ 47.000
├── Qualificado: 8 cards | R$ 38.000
├── Negociação: 3 cards | R$ 22.000
├── Ganho: 5 cards | R$ 28.000 (fechados no mês)
└── Perdido: 2 cards | R$ 4.000
```

Endpoint: `GET /api/v2/kanban/items/counts` retorna contagem + soma por etapa.

## Funil arquivado vs ativo

- `archived = true`: funil escondido da UI principal. Cards ainda existem mas não aparecem nas listas
- `active = false`: bloqueia movimentação (modo "somente leitura")

Use cases:
- Arquivar funis antigos no fim do ano
- Pausar funil em manutenção sem deletar cards

## Integração com Conversation

### Quando uma conversa vincula a um card
- Manual via UI ("vincular ao Kanban")
- Automação via `automation_rule.actions` com action `add_to_kanban`
- API call em `POST /api/v2/kanban/items` com `conversation_display_id`

### Como o card "sabe" sobre o cliente

```
KanbanItem
  └─ conversation_display_id → Conversation
                                  └─ contact → Contact (nome, telefone, email)
```

NÃO existe `contact_id` direto no KanbanItem. Sempre via conversation_display_id.

### Múltiplas conversas no mesmo card

`linked_conversations` permite agrupar várias conversas (ex: cliente que falou em WhatsApp e Email):

```json
[
  {"display_id": 100},
  {"display_id": 101},
  {"display_id": 105}
]
```

A `conversation_display_id` (singular) ainda é a "principal" — mas todas as `linked_conversations` aparecem na sidebar do card.

## Automações relacionadas a Kanban

AutomationRule com evento `kanban_item_created`, `kanban_item_moved`, `kanban_item_stage_changed`:

```json
{
  "event_name": "kanban_item_moved",
  "conditions": [
    {"attribute_key": "funnel_stage", "operator": "equal_to", "value": "ganho"}
  ],
  "actions": [
    {"action_name": "send_message", "params": ["Parabéns pelo fechamento!"]},
    {"action_name": "add_label", "params": ["cliente-pagante"]}
  ]
}
```

## Bulk operations

- `POST /api/v2/kanban/items/bulk_actions` — operações em massa (mover, atribuir, arquivar)
- `POST /api/v2/kanban/items/import` — importar CSV de cards
- `GET /api/v2/kanban/items/export` — exportar funil completo

## Custom attributes em cards

Igual contatos, cards têm `custom_attributes` (jsonb):

```json
{
  "origem_lead": "Google Ads",
  "campanha": "Black Friday 2026",
  "score": 85,
  "produto_interesse": "Plano Pro"
}
```

Configurar atributos no Super Admin ou via API `/api/v1/custom_attribute_definitions`.

## Métricas úteis (via GET /api/v2/kanban/items)

- Tempo médio em cada etapa: `stage_entered_at` vs agora
- Taxa de conversão: cards em "ganho" vs total criado no período
- Pipeline ativo: soma de `value` em etapas != ganho/perdido
- Velocity: cards movidos pra "ganho" por mês

## Diagnóstico: "Card sumiu do funil"

1. Está arquivado? `archived = true` em algum nível?
2. Etapa atual existe ainda? (etapa removida do funil deixa card "órfão")
3. `position` está faltando? (cards sem position vão pro fim)
4. Está em outro funil? (mover entre funis muda `funnel_id`)

## Diagnóstico: "Valor do pipeline errado"

1. Algum card sem `item_details.value`?
2. Cards arquivados estão sendo contados?
3. Etapas "ganho"/"perdido" estão incluídas no cálculo?
