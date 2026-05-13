# Changelog

## 0.2.1 — 2026-05-13

### Adicionado

- Nova meta-tool `lionchat_flows_schema_reference`: retorna referencia completa do schema do FlowBuilder (tipos de nodes, keys de action, source handles, formato de edges, erros comuns e um exemplo minimo funcional). LLMs devem chamar antes de montar `flow_data` em `lionchat_flows_create` / `lionchat_flows_update`.

### Mudado

- Description dos tools `lionchat_flows_create` e `lionchat_flows_update` enriquecida com cheatsheet inline do schema dos nodes e dos erros comuns (action.items[].config nao params; send_message.messageItems nao items; wait_response validation='options' dispensa condition node; sourceHandle deve casar com handle real do node source).

### Corrigido

- `lionchat_custom_attributes_create` agora aceita `attribute_key`, `attribute_description`, `attribute_values`, `regex_pattern`, `regex_cue` e `default_value`. Antes so passava 3 params (`display_name`, `display_type`, `model`), o que fazia a API rejeitar com "Attribute key nao pode ficar vazio". Pra criar atributos via MCP agora e obrigatorio passar `attribute_key` (slug snake_case, ex: `cpf`, `data_nascimento`).

### Nota

- 0.1.2 e 0.1.3 foram publicadas como branches de fix sem as features de 0.2.0; 0.2.1 unifica tudo (features 0.2.0 + fixes 0.1.2/0.1.3).

## 0.2.0 — 2026-05-05

### Adicionado
- Multi-conta: parametro `account_id` opcional em todas as tools sobrepoe `LIONCHAT_ACCOUNT_ID`
- Captain Assistants: 18 campos novos no create/update (temperature, instructions, follow_up_*, disabled_tools, offer_ids, media_asset_ids, booking_event_type_ids, etc)
- Captain Scenarios: campos `description` (obrigatorio) e `enabled`
- Captain FAQs: campo `assistant_id` (obrigatorio) e `status`
- Reports: parametros `type`, `id`, `business_hours`, `timezone_offset` documentados
- 2 endpoints novos: `captain/assistants/tools` (GET) e `captain/assistants/{id}/playground` (POST)

### Corrigido
- separateParams agora suporta nested params via dot-notation (config.temperature, config.feature_faq, etc) — antes campos eram silenciosamente descartados pelo strong_params do Rails
- Typo: `instructions` (plural) → `instruction` (singular) nos schemas de scenarios

### Notas
- Funciona contra LionChat backend a partir de 2026-05-05 (depende de fix backend pra reports/summary 500 e captain/assistants/create 500)

## 0.1.1

Versão inicial publicada.
