-- =====================================================
-- Schema: Promoter Conformity & Facial Comparison
-- =====================================================

-- Conformity status per promoter per network
CREATE TABLE IF NOT EXISTS promoter_conformity (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agency_promoter_id UUID REFERENCES agency_promoters(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  network_id UUID REFERENCES supermarket_networks(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- conforme, pendente, nao_conforme
  reason TEXT, -- motivo da não conformidade
  photo_quality_score NUMERIC(5,2), -- 0-100
  photo_resolution_ok BOOLEAN DEFAULT false,
  photo_frontal_ok BOOLEAN DEFAULT false,
  photo_illumination_ok BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ DEFAULT NOW(),
  notified_at TIMESTAMPTZ, -- quando a agência foi notificada
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT chk_conformity_promoter CHECK (agency_promoter_id IS NOT NULL OR employee_id IS NOT NULL),
  CONSTRAINT promoter_conformity_unique UNIQUE (agency_promoter_id, employee_id, network_id)
);

CREATE INDEX IF NOT EXISTS idx_conformity_org ON promoter_conformity(organization_id, status);

-- Facial comparison results
CREATE TABLE IF NOT EXISTS facial_comparison_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  supermarket_unit_id UUID REFERENCES supermarket_units(id) ON DELETE SET NULL,
  agency_promoter_id UUID REFERENCES agency_promoters(id) ON DELETE SET NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE SET NULL,
  entry_log_id UUID REFERENCES pdv_entry_logs(id) ON DELETE SET NULL,
  comparison_type VARCHAR(30) NOT NULL DEFAULT 'entry_vs_base', -- entry_vs_base, entry_vs_exit
  base_image_url TEXT,
  captured_image_url TEXT,
  confidence_score NUMERIC(5,2), -- 0-100
  result VARCHAR(20) NOT NULL DEFAULT 'pending', -- ok, suspect, divergent, error
  processing_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_facial_logs_org ON facial_comparison_logs(organization_id, created_at);

-- Agency conformity notifications
CREATE TABLE IF NOT EXISTS conformity_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  agency_id UUID REFERENCES agencies(id) ON DELETE CASCADE,
  agency_promoter_id UUID REFERENCES agency_promoters(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  network_id UUID NOT NULL REFERENCES supermarket_networks(id) ON DELETE CASCADE,
  notification_type VARCHAR(30) NOT NULL DEFAULT 'photo_non_conform', -- photo_non_conform, photo_missing, photo_low_quality
  message TEXT,
  channel VARCHAR(20) DEFAULT 'system', -- system, email, whatsapp
  sent_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_conformity_notif_agency ON conformity_notifications(agency_id, read_at);
