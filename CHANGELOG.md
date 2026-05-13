# Changelog

## 0.1.3 — 2026-05-13

### Added

- Nova meta-tool `lionchat_flows_schema_reference`: retorna referencia completa do schema do FlowBuilder (tipos de nodes, keys de action, source handles, formato de edges, erros comuns e um exemplo minimo funcional). LLMs devem chamar antes de montar `flow_data` em `lionchat_flows_create` / `lionchat_flows_update`.

### Changed

- Description dos tools `lionchat_flows_create` e `lionchat_flows_update` enriquecida com cheatsheet inline do schema dos nodes e dos erros comuns (action.items[].config nao params; send_message.messageItems nao items; wait_response validation='options' dispensa condition node; sourceHandle deve casar com handle real do node source).

## 0.1.2 — 2026-05-13

### Fixed

- `lionchat_custom_attributes_create` agora envia `attribute_key`, `attribute_description`, `attribute_values`, `regex_pattern`, `regex_cue` e `default_value`. Antes só passava 3 params (`display_name`, `display_type`, `model`), o que fazia a API rejeitar com `Attribute key nao pode ficar vazio`. Pra criar atributos via MCP agora é obrigatório passar `attribute_key` (slug snake_case, ex: `cpf`, `data_nascimento`).

## 0.1.1

Versão inicial publicada.
