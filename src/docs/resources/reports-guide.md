# Guia de Relatórios e Métricas

Como interpretar cada um dos endpoints de relatório (`lionchat_reports_*`) e métricas correlatas. Use sempre que o usuário pedir métricas, KPIs, dashboards ou comparativos.

## ⚠️ Unidades de tempo

**TODOS os tempos médios são retornados em SEGUNDOS.** Sempre converta antes de exibir:

```
245 segundos → "4 min 5 seg" ou "4:05"
3600 segundos → "1 hora"
86400 segundos → "24 horas" ou "1 dia"
```

## Endpoints disponíveis (19 total)

### 1. `lionchat_reports_summary` — Resumo geral
**Use quando o usuário pedir:** "como tá o desempenho?", "resumo da semana", "visão geral"

**Retorna:**
```json
{
  "conversations_count": 142,
  "incoming_messages_count": 1250,
  "outgoing_messages_count": 980,
  "resolutions_count": 98,
  "avg_first_response_time": 245,       // segundos
  "avg_resolution_time": 7200,          // segundos
  "previous": { ...mesma estrutura para comparativo... }
}
```

**Parâmetros principais:**
- `type`: `account` (padrão), `agent`, `inbox`, `label`, `team`
- `since` / `until`: Unix timestamp (segundos) — período
- `business_hours`: `true` excluí horários fora do expediente

**Exemplo de uso:**
```
since = 7 dias atrás
until = agora
type = account
→ retorna resumo dos últimos 7 dias da conta toda
```

### 2. `lionchat_reports_list` — Por agente
**Use quando:** "produtividade por atendente", "ranking de agentes"

Retorna array de métricas, uma por agente. Cada item:
```json
{
  "id": 6,
  "name": "Elvis",
  "conversations_count": 23,
  "avg_first_response_time": 180,
  "avg_resolution_time": 5400,
  "csat_score_average": 4.3,
  "online_at_total": 28800   // segundos online no período
}
```

### 3. `lionchat_reports_list_1` — Por time
**Use quando:** "comparar times", "como está o time Premium vs Standard"

Mesma estrutura por team_id.

### 4. `lionchat_reports_list_2` — Por inbox
**Use quando:** "qual canal está com mais demanda", "comparar WhatsApp vs Email"

Mesma estrutura por inbox_id.

### 5. `lionchat_reports_list_3` — Por label
**Use quando:** "quantas conversas urgentes", "comparativo por label"

Mesma estrutura por label.

### 6. `lionchat_reports_list_4` — Por canal
**Use quando:** "WhatsApp vs Email vs Webchat"

Agrupa por `channel_type`.

### 7. `lionchat_reports_list_5` — Relatórios detalhados
**Use quando:** "dia a dia da última semana", "evolução temporal"

Retorna timeseries (data + valor) para um metric específico:
- `metric`: `conversations_count`, `incoming_messages_count`, `outgoing_messages_count`, `resolutions_count`, `avg_first_response_time`, `avg_resolution_time`, `reply_time`, `resolutions_count`
- `group_by`: `day`, `week`, `month`, `year`
- `since`/`until`: período

### 8. `lionchat_reports_list_6` — Resumo do Bot
**Use quando:** "como tá o bot resolvendo", "% de handoff pra humano"

```json
{
  "bot_resolutions_count": 45,
  "bot_handoffs_count": 12,
  "bot_resolution_rate": 0.79
}
```

### 9. `lionchat_reports_list_7` — Conversation Traffic (tráfego)
**Use quando:** "horário de pico", "quando tem mais demanda"

Retorna heatmap por hora do dia ou dia da semana:
```json
[
  { "hour": 9, "conversations_count": 18 },
  { "hour": 10, "conversations_count": 25 },
  ...
]
```

### 10. `lionchat_reports_list_8` — Agente em tempo real
**Use quando:** "quem tá online agora", "carga atual"

```json
[
  { "id": 6, "name": "Elvis", "status": "online", "open_count": 5, "unattended_count": 2 }
]
```

### 11-15. CSAT
- `lionchat_csat_metrics`: agregação (média, distribuição)
- `lionchat_csat_list`: respostas individuais
- `lionchat_csat_download`: CSV pra download

### 16-18. SLA
- `lionchat_sla_metrics`: hits / breaches por período
- `lionchat_sla_list`: SLAs aplicadas a conversas
- `lionchat_sla_download`: CSV

### 19. `lionchat_reports_list_9` — Aggregated agent overview
**Use quando:** combinação de tudo: produtividade + CSAT + SLA por agente

## Padrões de interpretação

### Comparando períodos
Quando passa `since/until`, a maioria dos endpoints retorna `previous` com o período anterior de mesmo tamanho:

```
Esta semana: 142 conversas
Semana anterior: 120 conversas
→ Crescimento de 18%
```

**Dica:** sempre apresente comparativos pra dar contexto.

### Business hours
- Sem `business_hours: true`: tempos médios incluem madrugada/feriado (puxa pra cima)
- Com `business_hours: true`: só conta período de atendimento configurado (mais preciso pra SLA)

**Use business_hours: true** quando o usuário perguntar de "produtividade real" ou comparar com SLA.

### CSAT
- Score: 1-5 estrelas
- Médias típicas: 4.0+ é bom, 3.5-4.0 é OK, abaixo de 3.5 é alerta
- `csat_response_rate`: % de conversas resolvidas que ganharam resposta CSAT (taxa baixa = pouco feedback)

### SLA
- `breach_count` alto = problema sério, agentes não cumprindo prazos
- Sempre olhar `hit_rate` (hits / (hits + breaches)) — meta 95%+

## Workflows comuns

### "Relatório semanal completo"
```
1. reports_summary com since=7d, type=account → visão geral
2. reports_list (por agente) → ranking
3. reports_list_3 (por label) → tipos de demanda
4. csat_metrics → satisfação
5. sla_metrics → cumprimento
6. Compilar resumo em markdown
```

### "Quem tá com gargalo"
```
1. reports_list_8 (real-time) → quem tá com muita conversa aberta
2. reports_list (por agente, últimos 7d) → quem tá com avg_first_response alto
3. Cruzar: agente sobrecarregado E com tempo médio alto
```

### "Mês a mês evolução"
```
reports_list_5 com group_by=month, metric=conversations_count, since=12 meses atrás
```

## Pegadinhas comuns

### ⚠️ Comparar agente "online_at_total"
Tempo online inclui breaks, almoço, etc. Pra produtividade real, prefira:
- `conversations_count / online_at_total` = conversas por hora online

### ⚠️ Avg time pode ser enganador
Mediana é mais representativa que média (1 conversa que durou 5 dias puxa tudo).
**Mas o LionChat hoje só retorna média.** Reporte com ressalva: "Tempo MÉDIO de X — pode ter outliers."

### ⚠️ Reports não pegam conversas em tempo real
A maioria dos endpoints é eventually consistent (cache 5min). Pra info real-time use `conversations_meta`.

### ⚠️ Comparativos de período
`previous` tem o MESMO tamanho do período atual. Se since-until = 7d, previous = 7d antes.
NÃO compare manualmente "esse mês vs mês passado" — passe `since/until` com mês inteiro e use o `previous` retornado.

## Quando o usuário pede algo MUITO específico que não existe num endpoint

Se a pergunta requer cálculos custom (ex: "conversas por agente que duraram mais de X minutos"):
1. Liste as conversations com filtros
2. Filtre no client-side
3. Agrege e apresente

Mas avise: "essa métrica não existe pronta — vou compor a partir de dados crus"

## Custos de chamadas (importante!)

Endpoints de relatório podem retornar **MUITOS** dados:
- `reports_list_5` com `group_by=day, since=1 ano` → 365 datapoints
- `csat_list` sem filtro → milhares

**Sempre limite período** quando o usuário não foi específico. Se pediu "esta semana", use 7d. Se pediu "vamos ver tudo", confirme antes (ano inteiro pode ser muito).
