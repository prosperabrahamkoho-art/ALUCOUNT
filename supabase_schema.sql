-- ══════════════════════════════════════════════════════════════════════════════
-- ALUCOUNT — Script SQL de création des tables Supabase
-- ALUTRACO SARL — Bénin (Porto-Novo / Cotonou)
-- Exécutez ce script dans : Supabase → SQL Editor → New Query
-- ══════════════════════════════════════════════════════════════════════════════

-- ── Extensions ────────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ── 1. TABLE : users ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id                    TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name                  TEXT NOT NULL,
  email                 TEXT UNIQUE NOT NULL,
  role                  TEXT NOT NULL CHECK (role IN (
    'ADMIN','PDG','DG','ADJOINT_PDG','MAGASINIER',
    'SECRETAIRE_DIRECTION','RESPONSABLE_INVENTAIRE',
    'CONTROLEUR','INVENTORISTE','RESPONSABLE_BOUTIQUE'
  )),
  shop_id               TEXT,
  phone                 TEXT,
  is_designated_by_pdg  BOOLEAN DEFAULT FALSE,
  status                TEXT NOT NULL DEFAULT 'ACTIF' CHECK (status IN ('ACTIF','SUSPENDU','EN_ATTENTE_ACTIVATION')),
  unique_identifier     TEXT UNIQUE,
  is_email_confirmed    BOOLEAN DEFAULT FALSE,
  two_factor_enabled    BOOLEAN DEFAULT FALSE,
  theme_preference      TEXT DEFAULT 'light',
  notify_whatsapp       BOOLEAN DEFAULT FALSE,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ── 2. TABLE : shops ──────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.shops (
  id                          TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  code                        TEXT UNIQUE NOT NULL,
  name                        TEXT NOT NULL,
  address                     TEXT NOT NULL,
  phone                       TEXT NOT NULL,
  manager_id                  TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  manager_name                TEXT,
  status                      TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','SUSPENDUE','INACTIVE','ARCHIVEE')),
  type                        TEXT NOT NULL DEFAULT 'BOUTIQUE' CHECK (type IN ('BOUTIQUE','CHANTIER','DEPOT_CENTRAL')),
  active_inventories_count    INTEGER DEFAULT 0,
  validated_inventories_count INTEGER DEFAULT 0,
  last_validation_date        TEXT,
  created_at                  TIMESTAMPTZ DEFAULT NOW()
);

-- ── 3. TABLE : catalog ────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.catalog (
  id                TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  code              TEXT UNIQUE NOT NULL,
  category          TEXT NOT NULL CHECK (category IN ('Aluminium','Accessoires')),
  color             TEXT,
  designation       TEXT NOT NULL,
  official_price    NUMERIC(15,2) NOT NULL DEFAULT 0,
  unit              TEXT NOT NULL,
  is_active         BOOLEAN DEFAULT TRUE,
  last_price_update TEXT NOT NULL
);

-- ── 4. TABLE : inventories ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventories (
  id                        TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  code                      TEXT UNIQUE NOT NULL,
  shop_id                   TEXT NOT NULL REFERENCES public.shops(id),
  shop_name                 TEXT NOT NULL,
  location_type             TEXT NOT NULL DEFAULT 'BOUTIQUE',
  site_name                 TEXT,
  category                  TEXT NOT NULL,
  status                    TEXT NOT NULL DEFAULT 'Brouillon' CHECK (status IN (
    'Brouillon','En cours de comptage','Comptage terminé',
    'En contrôle','Prêt pour validation','Validé et clôturé'
  )),
  campaign_name             TEXT NOT NULL,
  version                   INTEGER NOT NULL DEFAULT 1,
  assigned_counter_id       TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_counter_name     TEXT,
  assigned_controller_id    TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_controller_name  TEXT,
  validated_by_id           TEXT REFERENCES public.users(id) ON DELETE SET NULL,
  validated_by_name         TEXT,
  created_at                TIMESTAMPTZ DEFAULT NOW(),
  count_started_at          TIMESTAMPTZ,
  count_submitted_at        TIMESTAMPTZ,
  control_started_at        TIMESTAMPTZ,
  validated_at              TIMESTAMPTZ,
  closed_at                 TEXT
);

-- ── 5. TABLE : inventory_lines ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.inventory_lines (
  id                      TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  inventory_id            TEXT NOT NULL REFERENCES public.inventories(id) ON DELETE CASCADE,
  product_id              TEXT NOT NULL REFERENCES public.catalog(id),
  designation             TEXT NOT NULL,
  category                TEXT NOT NULL,
  color                   TEXT,
  unit                    TEXT NOT NULL,
  official_price_snapshot NUMERIC(15,2) NOT NULL DEFAULT 0,
  qty_good                INTEGER NOT NULL DEFAULT 0,
  qty_damaged             INTEGER NOT NULL DEFAULT 0,
  damage_reason           TEXT,
  amount_good             NUMERIC(15,2) GENERATED ALWAYS AS (qty_good * official_price_snapshot) STORED,
  amount_damaged          NUMERIC(15,2) GENERATED ALWAYS AS (qty_damaged * official_price_snapshot) STORED,
  total_amount            NUMERIC(15,2) GENERATED ALWAYS AS ((qty_good + qty_damaged) * official_price_snapshot) STORED,
  observation             TEXT,
  last_modified_by        TEXT,
  last_modified_at        TIMESTAMPTZ,
  was_corrected           BOOLEAN DEFAULT FALSE
);

-- ── 6. TABLE : audit_logs ─────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id            TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  timestamp     TEXT NOT NULL,
  user_id       TEXT,
  user_name     TEXT NOT NULL,
  user_role     TEXT NOT NULL,
  action        TEXT NOT NULL,
  target_object TEXT,
  old_value     TEXT,
  new_value     TEXT,
  reason        TEXT,
  authorized_by TEXT,
  shop_id       TEXT,
  shop_name     TEXT,
  inventory_id  TEXT,
  status        TEXT NOT NULL DEFAULT 'SUCCESS' CHECK (status IN ('SUCCESS','BLOCKED')),
  ip_address    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ── 7. TABLE : notifications ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.notifications (
  id           TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  user_id      TEXT REFERENCES public.users(id) ON DELETE CASCADE,
  role_target  TEXT,
  type         TEXT NOT NULL,
  title        TEXT NOT NULL,
  message      TEXT NOT NULL,
  read         BOOLEAN DEFAULT FALSE,
  link_module  TEXT,
  shop_id      TEXT,
  inventory_id TEXT,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

-- ── 8. TABLE : invitations ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.invitations (
  id                TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  unique_id         TEXT UNIQUE NOT NULL,
  invited_name      TEXT NOT NULL,
  invited_email     TEXT NOT NULL,
  role              TEXT NOT NULL,
  shop_id           TEXT,
  created_by_id     TEXT NOT NULL,
  created_by_name   TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'EN_ATTENTE' CHECK (status IN ('EN_ATTENTE','ACCEPTEE','EXPIREE','ANNULEE')),
  confirmation_code TEXT,
  sent_via          TEXT[] DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  expires_at        TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '7 days')
);

-- ── 9. TABLE : campaigns ──────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.campaigns (
  id              TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  name            TEXT NOT NULL,
  description     TEXT,
  status          TEXT NOT NULL DEFAULT 'PLANIFIE',
  target_shops    TEXT[] DEFAULT '{}',
  scheduled_date  TEXT,
  created_by_id   TEXT,
  created_by_name TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ── 10. TABLE : temporary_permissions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.temporary_permissions (
  id              TEXT PRIMARY KEY DEFAULT uuid_generate_v4()::TEXT,
  inventory_id    TEXT REFERENCES public.inventories(id) ON DELETE CASCADE,
  inventory_code  TEXT NOT NULL,
  shop_name       TEXT NOT NULL,
  granted_to_id   TEXT NOT NULL,
  granted_to_name TEXT NOT NULL,
  granted_by_id   TEXT NOT NULL,
  granted_by_name TEXT NOT NULL,
  permission_type TEXT NOT NULL,
  reason          TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE','EXPIRED','REVOKED')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  expires_at      TIMESTAMPTZ NOT NULL
);

-- ── Row Level Security (RLS) ──────────────────────────────────────────────────
-- Pour l'instant : accès libre authentifié (à affiner selon les rôles)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_lines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.temporary_permissions ENABLE ROW LEVEL SECURITY;

-- Politiques permissives pour l'anon key (à sécuriser en production avec auth)
CREATE POLICY "allow_all_users"               ON public.users               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_shops"               ON public.shops               FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_catalog"             ON public.catalog             FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inventories"         ON public.inventories         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_inventory_lines"     ON public.inventory_lines     FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_audit_logs"          ON public.audit_logs          FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_notifications"       ON public.notifications       FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_invitations"         ON public.invitations         FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_campaigns"           ON public.campaigns           FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "allow_all_temp_permissions"    ON public.temporary_permissions FOR ALL USING (true) WITH CHECK (true);

-- ── Index de performance ──────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_inventories_shop_id    ON public.inventories(shop_id);
CREATE INDEX IF NOT EXISTS idx_inventories_status     ON public.inventories(status);
CREATE INDEX IF NOT EXISTS idx_inventory_lines_inv_id ON public.inventory_lines(inventory_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id     ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id  ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_invitations_email      ON public.invitations(invited_email);

-- ══════════════════════════════════════════════════════════════════════════════
-- FIN DU SCRIPT — Exécutez dans SQL Editor de votre projet Supabase
-- ══════════════════════════════════════════════════════════════════════════════
