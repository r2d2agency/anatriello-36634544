-- Brand Contracts: links CRM deals to merch brands with business rules
-- Tracks contract terms (hours, frequency, PDVs) and validates compliance with execution

CREATE TABLE IF NOT EXISTS merch_brand_contracts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL,
  brand_id UUID NOT NULL REFERENCES merch_brands(id) ON DELETE CASCADE,
  deal_id UUID,  -- optional link to CRM deal
  
  -- Contract metadata
  title VARCHAR(255) NOT NULL,
  status VARCHAR(20) DEFAULT 'draft', -- draft, active, expired, cancelled
  start_date DATE,
  end_date DATE,
  auto_renew BOOLEAN DEFAULT false,
  
  -- Business rules
  hours_per_visit NUMERIC(5,2),          -- horas por visita
  visits_per_week INTEGER,               -- vezes por semana
  total_monthly_hours NUMERIC(7,2),      -- total mensal de horas
  pdv_ids UUID[],                        -- PDVs cobertos pelo contrato
  
  -- Financial
  contract_value NUMERIC(12,2),          -- valor mensal
  payment_terms VARCHAR(100),            -- condições de pagamento
  
  -- Clauses stored as JSONB array
  clauses JSONB DEFAULT '[]',            -- [{order, title, content}]
  
  -- Letterhead / branding
  letterhead_url TEXT,                   -- timbrado personalizado (ou null = usa org)
  header_logo_url TEXT,
  footer_text TEXT,
  
  -- Signed document
  signed_document_url TEXT,
  signed_at TIMESTAMPTZ,
  signature_document_id UUID,            -- link to doc_signatures
  
  -- Compliance summary (cached, updated by scheduler)
  compliance_score NUMERIC(5,2),
  last_compliance_check TIMESTAMPTZ,
  
  notes TEXT,
  created_by UUID,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Compliance logs: periodic checks of contract vs execution
CREATE TABLE IF NOT EXISTS merch_contract_compliance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contract_id UUID NOT NULL REFERENCES merch_brand_contracts(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  
  expected_visits INTEGER,
  actual_visits INTEGER,
  expected_hours NUMERIC(7,2),
  actual_hours NUMERIC(7,2),
  
  compliance_pct NUMERIC(5,2),
  status VARCHAR(20) DEFAULT 'ok', -- ok, warning, breach
  details JSONB,                   -- per-PDV breakdown
  
  notified BOOLEAN DEFAULT false,
  notified_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Organization letterhead settings
CREATE TABLE IF NOT EXISTS merch_org_letterhead (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL UNIQUE,
  logo_url TEXT,
  header_text TEXT,
  footer_text TEXT,
  background_url TEXT,         -- timbrado background image
  primary_color VARCHAR(20),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brand_contracts_brand ON merch_brand_contracts(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_contracts_org ON merch_brand_contracts(organization_id);
CREATE INDEX IF NOT EXISTS idx_brand_contracts_deal ON merch_brand_contracts(deal_id);
CREATE INDEX IF NOT EXISTS idx_contract_compliance_contract ON merch_contract_compliance(contract_id);
