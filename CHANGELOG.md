# Changelog

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
