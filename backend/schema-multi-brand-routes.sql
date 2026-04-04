-- ================================================
-- Schema: Multi-Brand Routes
-- Allows a single route to contain multiple brands
-- ================================================

-- Junction table: brands per route
CREATE TABLE IF NOT EXISTS route_brands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  route_id UUID NOT NULL REFERENCES merch_routes(id) ON DELETE CASCADE,
  brand_id UUID NOT NULL REFERENCES merch_brands(id) ON DELETE CASCADE,
  checklist_id UUID REFERENCES brand_checklists(id) ON DELETE SET NULL,
  status VARCHAR(30) DEFAULT 'pending', -- pending, in_progress, completed
  progress_pct NUMERIC(5,2) DEFAULT 0,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(route_id, brand_id)
);
CREATE INDEX IF NOT EXISTS idx_route_brands_route ON route_brands(route_id);
CREATE INDEX IF NOT EXISTS idx_route_brands_brand ON route_brands(brand_id);

-- Link product executions to a specific route_brand
ALTER TABLE route_product_executions ADD COLUMN IF NOT EXISTS route_brand_id UUID REFERENCES route_brands(id) ON DELETE SET NULL;
CREATE INDEX IF NOT EXISTS idx_rpe_route_brand ON route_product_executions(route_brand_id);

-- Link execution categories to a specific route_brand
ALTER TABLE merch_execution_categories ADD COLUMN IF NOT EXISTS route_brand_id UUID REFERENCES route_brands(id) ON DELETE SET NULL;

-- Link photos to a specific route_brand
ALTER TABLE route_photos ADD COLUMN IF NOT EXISTS route_brand_id UUID REFERENCES route_brands(id) ON DELETE SET NULL;

-- Make brand_id on merch_routes nullable for multi-brand routes
-- (backward compat: existing single-brand routes keep brand_id populated)
ALTER TABLE merch_routes ALTER COLUMN brand_id DROP NOT NULL;
