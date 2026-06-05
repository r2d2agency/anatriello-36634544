
# Validação automática de documentos do promotor com IA

## Objetivo
Quando o promotor envia documentos (CNH, contrato, comprovante de endereço, CTPS, selfie), uma IA cruza os dados, compara com o cadastro da agência e com os PDVs/marcas vinculados, e pré/auto-aprova o acesso. Cada PDV/Rede configura quais documentos exigir e se exige biometria facial.

## 1. Configuração global do provedor de IA (Superadmin)

Nova tela `AyratechAIConfig` em `/admin/ayratech-ai` para o superadmin (`tnicodemos@gmail.com`):
- Provedor: OpenAI / Gemini / OpenRouter
- Modelo (com presets: `gpt-4o`, `gpt-4o-mini`, `gemini-2.5-pro`, etc.)
- API Key (mascarada, criptografada)
- Botão "Testar conexão" (chama backend que faz uma chamada mínima)

Armazenamento: tabela `system_settings` já existente, chave `doc_validation_ai` (JSONB com provider, model, api_key). Apenas superadmin pode ler/gravar.

Backend: `backend/src/routes/ayratech-ai.js` com:
- `GET /api/ayratech-ai/config` — retorna config (chave mascarada)
- `PUT /api/ayratech-ai/config` — atualiza
- `POST /api/ayratech-ai/test` — testa chamada

## 2. Configuração de exigências por Rede/PDV

Adicionar em `merch_redes`:
- `doc_validation_enabled BOOLEAN DEFAULT false`
- `required_documents JSONB DEFAULT '[]'` — array com `cnh`, `contrato_trabalho`, `comprovante_endereco`, `ctps`, `cadastro_agencia`
- `facial_required BOOLEAN DEFAULT false`
- `auto_approve_on_match BOOLEAN DEFAULT true` (auto-aprovar se 100% OK)

PDV (`merch_rede_pdvs`) herda da rede com possibilidade de override (mesmas colunas opcionais, `NULL` = herda).

UI: aba "Validação Automática" em `MerchRedes.tsx` (e detalhe do PDV) com checkboxes dos documentos exigidos, toggle de facial e toggle de auto-aprovação.

## 3. Coleta de documentos do promotor

Reaproveitar tabela `promotor_documents` existente. Adicionar campo `category` padronizado (já existe). Adicionar nova tabela:

`promoter_document_validations`:
- `id`, `promoter_id`, `rede_id`, `pdv_id` (nullable)
- `status` — `pending`, `analyzing`, `approved`, `pre_approved`, `divergent`, `rejected`, `failed`
- `score` — 0-100
- `divergences JSONB` — lista de campos com problema (ex: `[{field: "cpf", source_a: "cnh", source_b: "contrato", value_a, value_b}]`)
- `ai_raw_response TEXT`
- `documents_analyzed JSONB` — lista dos doc_ids analisados
- `validated_at`, `created_at`, `updated_at`
- `reviewed_by`, `reviewed_at`, `override_status`

## 4. Edge function / rota backend de validação

`POST /api/promoter-validations/run` body: `{ promoter_id, rede_id, pdv_id? }`
1. Carrega config global de IA do `system_settings`
2. Carrega requisitos da rede/PDV
3. Carrega documentos do promotor por categoria (URLs)
4. Carrega cadastro do promotor (`promoters` / `agency_promoters`) e cadastro da agência
5. Monta prompt multimodal: envia imagens/PDFs + dados textuais e pede JSON estruturado contendo:
   - Dados extraídos de cada documento (nome, CPF, RG, datas)
   - Comparação cruzada
   - Lista de divergências
   - Score 0-100
   - Recomendação (`approve`, `review`, `reject`)
6. Se facial_required: chama validação facial já existente (selfie vs foto CNH) e mescla resultado
7. Valida PDVs/marcas: confere se as marcas/redes listadas no contrato batem com a lista informada pela agência
8. Salva em `promoter_document_validations`
9. Se `auto_approve_on_match` e `score >= 95` e sem divergências críticas: atualiza `agency_visit_requests` para `approved` automaticamente
10. Notifica agência (push + registro) se houver divergência

## 5. UI de revisão (Rede e Agência)

- Em `AgencyVisitRequests` adicionar coluna "Validação IA" mostrando badge (Aprovado/Pré-aprovado/Divergente) + botão "Ver análise"
- Modal `ValidationDetailDialog` mostrando:
  - Score visual
  - Documentos analisados com previews
  - Tabela de divergências (campo, valor A vs valor B, fonte)
  - Recomendação da IA
  - Ações: Aprovar / Recusar / Reanalisar
- Em painel da Rede: lista de promotores aguardando análise + ações em massa

## 6. Gatilhos automáticos

- Quando promotor envia novo documento numa categoria exigida → enfileirar validação (debounce 30s)
- Quando agência cria solicitação de acesso ao PDV → roda validação
- Endpoint manual "Reanalisar" no detalhe

## Detalhes técnicos

- Backend novo: `backend/src/routes/ayratech-ai.js`, `backend/src/routes/promoter-validations.js`
- Backend lib reusada: `backend/src/lib/ai-caller.js` (já suporta OpenAI/Gemini/OpenRouter com tool-calling)
- Frontend novo:
  - `src/pages/admin/AyratechAIConfig.tsx`
  - `src/components/merchandising/RedeDocValidationConfig.tsx`
  - `src/components/access-control/ValidationDetailDialog.tsx`
  - `src/components/access-control/ValidationBadge.tsx`
  - Hook `src/hooks/use-promoter-validations.ts`
  - Hook `src/hooks/use-ayratech-ai.ts`
- Migração ensureTables no backend (padrão Just-in-Time já adotado no projeto)
- Timezone `America/Sao_Paulo` em todos os campos de data
- API key armazenada criptografada (AES com `ENCRYPTION_KEY` já existente) na `system_settings`
- Acesso à tela de config restrito a `tnicodemos@gmail.com` (master admin)

## Entregáveis
1. Migração + ensureTables das novas tabelas/colunas
2. Backend: rotas de config global + rotas de validação + worker de validação
3. Frontend: tela superadmin + config por rede + modal de revisão + badges nas listagens
4. Gatilho automático no envio de documento e na criação de solicitação de acesso
