import { createClient } from '@supabase/supabase-js';

// ── Configuration Supabase ALUCOUNT ──────────────────────────────────────────
// Renseignez vos credentials dans le fichier .env à la racine du projet :
//   VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
//   VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
// ─────────────────────────────────────────────────────────────────────────────

const rawUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const rawKey = (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

// Normaliser l'URL si seul le refId a été fourni
const formattedUrl = rawUrl.startsWith('http')
  ? rawUrl
  : (rawUrl ? `https://${rawUrl}.supabase.co` : '');

// Détection pour savoir si l'utilisateur a configuré son vrai projet Supabase
export const isSupabaseConfigured = Boolean(
  formattedUrl &&
  rawKey &&
  formattedUrl.startsWith('https://') &&
  !formattedUrl.includes('votre-projet') &&
  !formattedUrl.includes('xxxxxxxxxxxx')
);

// URL et clé factices sécurisées pour éviter que createClient ne lève une exception fatale au chargement
const safeUrl = isSupabaseConfigured ? formattedUrl : 'https://placeholder-alucount.supabase.co';
const safeKey = isSupabaseConfigured ? rawKey : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: false,
  },
  db: {
    schema: 'public',
  },
});

// ── Types des tables Supabase (miroir des types métier) ───────────────────────

export type SupabaseUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  shop_id: string | null;
  phone: string | null;
  is_designated_by_pdg: boolean;
  status: 'ACTIF' | 'SUSPENDU' | 'EN_ATTENTE_ACTIVATION';
  unique_identifier: string | null;
  is_email_confirmed: boolean;
  two_factor_enabled: boolean;
  theme_preference: string | null;
  notify_whatsapp: boolean;
  created_at: string;
};

export type SupabaseShop = {
  id: string;
  code: string;
  name: string;
  address: string;
  phone: string;
  manager_id: string | null;
  manager_name: string | null;
  status: string;
  type: string;
  active_inventories_count: number;
  validated_inventories_count: number;
  created_at: string;
  last_validation_date: string | null;
};

export type SupabaseCatalogItem = {
  id: string;
  code: string;
  category: string;
  color: string | null;
  designation: string;
  official_price: number;
  unit: string;
  is_active: boolean;
  last_price_update: string;
};

export type SupabaseInventory = {
  id: string;
  code: string;
  shop_id: string;
  shop_name: string;
  location_type: string;
  site_name: string | null;
  category: string;
  status: string;
  campaign_name: string;
  version: number;
  assigned_counter_id: string | null;
  assigned_counter_name: string | null;
  assigned_controller_id: string | null;
  assigned_controller_name: string | null;
  validated_by_id: string | null;
  validated_by_name: string | null;
  created_at: string;
  closed_at: string | null;
};

export type SupabaseInventoryLine = {
  id: string;
  inventory_id: string;
  product_id: string;
  designation: string;
  category: string;
  color: string | null;
  unit: string;
  official_price_snapshot: number;
  qty_good: number;
  qty_damaged: number;
  damage_reason: string | null;
  amount_good: number;
  amount_damaged: number;
  total_amount: number;
  observation: string | null;
  last_modified_by: string | null;
  last_modified_at: string | null;
  was_corrected: boolean;
};

export type SupabaseAuditLog = {
  id: string;
  timestamp: string;
  user_id: string;
  user_name: string;
  user_role: string;
  action: string;
  target_object: string | null;
  old_value: string | null;
  new_value: string | null;
  reason: string | null;
  authorized_by: string | null;
  shop_id: string | null;
  shop_name: string | null;
  inventory_id: string | null;
  status: 'SUCCESS' | 'BLOCKED';
  ip_address: string | null;
};

export type SupabaseNotification = {
  id: string;
  user_id: string | null;
  role_target: string | null;
  type: string;
  title: string;
  message: string;
  read: boolean;
  link_module: string | null;
  shop_id: string | null;
  inventory_id: string | null;
  created_at: string;
};

export type SupabaseInvitation = {
  id: string;
  unique_id: string;
  invited_name: string;
  invited_email: string;
  role: string;
  shop_id: string | null;
  created_by_id: string;
  created_by_name: string;
  status: string;
  confirmation_code: string | null;
  sent_via: string[];
  created_at: string;
  expires_at: string;
};

// ── Helpers de vérification de connexion ─────────────────────────────────────

export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Erreur Supabase : ${error.message}` };
    }
    return { ok: true, message: 'Connexion Supabase établie avec succès.' };
  } catch (e: any) {
    return { ok: false, message: `Échec de connexion : ${e.message}` };
  }
}

export default supabase;
