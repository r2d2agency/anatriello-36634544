-- ================================================
-- Schema: Feriados e Regiões de Atendimento
-- ================================================

-- ================================================
-- Feriados (Nacionais, Estaduais, Municipais)
-- ================================================
CREATE TABLE IF NOT EXISTS holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  holiday_date DATE NOT NULL,
  type VARCHAR(20) DEFAULT 'nacional', -- nacional, estadual, municipal
  state VARCHAR(2), -- UF (para estaduais)
  city VARCHAR(100), -- cidade (para municipais)
  recurring BOOLEAN DEFAULT true, -- repete todo ano
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_holidays_org ON holidays(organization_id);
CREATE INDEX IF NOT EXISTS idx_holidays_date ON holidays(holiday_date);

-- ================================================
-- Regiões de Atendimento
-- ================================================
CREATE TABLE IF NOT EXISTS service_regions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  color VARCHAR(7) DEFAULT '#3b82f6', -- cor hex para o mapa
  polygon JSONB, -- array de [lat, lng] para desenho no mapa
  cities JSONB DEFAULT '[]', -- cidades incluídas
  states JSONB DEFAULT '[]', -- UFs incluídas
  supervisor_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  active BOOLEAN DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_service_regions_org ON service_regions(organization_id);

-- ================================================
-- Vínculo PDV ↔ Região
-- ================================================
CREATE TABLE IF NOT EXISTS region_pdvs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id UUID NOT NULL REFERENCES service_regions(id) ON DELETE CASCADE,
  pdv_id UUID NOT NULL REFERENCES pdvs(id) ON DELETE CASCADE,
  auto_assigned BOOLEAN DEFAULT false, -- true = atribuído por geolocalização
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(region_id, pdv_id)
);
CREATE INDEX IF NOT EXISTS idx_region_pdvs_region ON region_pdvs(region_id);

-- ================================================
-- Coordenadas do Colaborador (endereço residencial)
-- ================================================
ALTER TABLE employees ADD COLUMN IF NOT EXISTS home_latitude NUMERIC(10,7);
ALTER TABLE employees ADD COLUMN IF NOT EXISTS home_longitude NUMERIC(10,7);
