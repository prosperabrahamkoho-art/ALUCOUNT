/**
 * ALUCOUNT — Service de synchronisation Supabase
 * Gère la lecture et l'écriture des données entre le store local et Supabase.
 * Architecture : localStorage = cache immédiat, Supabase = source de vérité permanente.
 */

import { supabase, isSupabaseConfigured } from './supabase';
import type {
  SupabaseUser,
  SupabaseShop,
  SupabaseCatalogItem,
  SupabaseInventory,
  SupabaseInventoryLine,
  SupabaseAuditLog,
  SupabaseNotification,
  SupabaseInvitation,
} from './supabase';
import type {
  User,
  Shop,
  CatalogItem,
  Inventory,
  InventoryLine,
  AuditLog,
  AppNotification,
  ShopInvitation,
} from '../types';

// ── Mappers Supabase → Types métier ──────────────────────────────────────────

function mapUser(r: SupabaseUser): User {
  return {
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role as any,
    shopId: r.shop_id ?? undefined,
    phone: r.phone ?? undefined,
    isDesignatedByPDG: r.is_designated_by_pdg,
    status: r.status,
    uniqueIdentifier: r.unique_identifier ?? undefined,
    isEmailConfirmed: r.is_email_confirmed,
    twoFactorEnabled: r.two_factor_enabled,
    themePreference: (r.theme_preference as any) ?? 'light',
    notifyWhatsApp: r.notify_whatsapp,
    createdAt: r.created_at,
  };
}

function mapShop(r: SupabaseShop): Shop {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    address: r.address,
    phone: r.phone,
    managerId: r.manager_id ?? undefined,
    managerName: r.manager_name ?? undefined,
    status: r.status as any,
    type: r.type as any,
    activeInventoriesCount: r.active_inventories_count,
    validatedInventoriesCount: r.validated_inventories_count,
    lastValidationDate: r.last_validation_date ?? undefined,
    createdAt: r.created_at,
  };
}

function mapCatalogItem(r: SupabaseCatalogItem): CatalogItem {
  return {
    id: r.id,
    code: r.code,
    category: r.category as any,
    color: r.color as any,
    designation: r.designation,
    officialPrice: Number(r.official_price),
    unit: r.unit,
    isActive: r.is_active,
    lastPriceUpdate: r.last_price_update,
  };
}

function mapInventoryLine(r: SupabaseInventoryLine): InventoryLine {
  return {
    id: r.id,
    inventoryId: r.inventory_id,
    productId: r.product_id,
    designation: r.designation,
    category: r.category as any,
    color: r.color as any,
    unit: r.unit,
    officialPriceSnapshot: Number(r.official_price_snapshot),
    qtyGood: r.qty_good,
    qtyDamaged: r.qty_damaged,
    damageReason: r.damage_reason as any,
    amountGood: Number(r.amount_good),
    amountDamaged: Number(r.amount_damaged),
    totalAmount: Number(r.total_amount),
    observation: r.observation ?? undefined,
    lastModifiedBy: r.last_modified_by ?? undefined,
    lastModifiedAt: r.last_modified_at ?? undefined,
    wasCorrected: r.was_corrected,
  };
}

function mapInventory(r: SupabaseInventory, lines: InventoryLine[]): Inventory {
  return {
    id: r.id,
    code: r.code,
    shopId: r.shop_id,
    shopName: r.shop_name,
    locationType: r.location_type as any,
    siteName: r.site_name ?? undefined,
    category: r.category as any,
    status: r.status as any,
    campaignName: r.campaign_name,
    version: r.version,
    assignedCounterId: r.assigned_counter_id ?? undefined,
    assignedCounterName: r.assigned_counter_name ?? undefined,
    assignedControllerId: r.assigned_controller_id ?? undefined,
    assignedControllerName: r.assigned_controller_name ?? undefined,
    validatedById: r.validated_by_id ?? undefined,
    validatedByName: r.validated_by_name ?? undefined,
    createdAt: r.created_at,
    closedAt: r.closed_at ?? undefined,
    lines,
    versionsHistory: [],
    messages: [],
    attachments: [],
  };
}

function mapAuditLog(r: SupabaseAuditLog): AuditLog {
  return {
    id: r.id,
    timestamp: r.timestamp,
    userId: r.user_id,
    userName: r.user_name,
    userRole: r.user_role as any,
    action: r.action as any,
    targetObject: r.target_object ?? undefined,
    oldValue: r.old_value ?? undefined,
    newValue: r.new_value ?? undefined,
    reason: r.reason ?? undefined,
    authorizedBy: r.authorized_by ?? undefined,
    shopId: r.shop_id ?? undefined,
    shopName: r.shop_name ?? undefined,
    inventoryId: r.inventory_id ?? undefined,
    status: r.status,
    ipAddress: r.ip_address ?? undefined,
  };
}

function mapNotification(r: SupabaseNotification): AppNotification {
  return {
    id: r.id,
    targetRole: r.role_target as any,
    type: r.type as any,
    title: r.title,
    message: r.message,
    read: r.read,
    linkModule: r.link_module as any,
    shopId: r.shop_id ?? undefined,
    inventoryId: r.inventory_id ?? undefined,
    timestamp: r.created_at,
  };
}

// ── Service Supabase ──────────────────────────────────────────────────────────

export const SupabaseService = {

  // ── UTILISATEURS ─────────────────────────────────────────────────────────

  async getUsers(): Promise<User[]> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('name');
    if (error) throw new Error(`getUsers: ${error.message}`);
    return (data as SupabaseUser[]).map(mapUser);
  },

  async upsertUser(user: User): Promise<void> {
    const row: Omit<SupabaseUser, 'created_at'> = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      shop_id: user.shopId ?? null,
      phone: user.phone ?? null,
      is_designated_by_pdg: user.isDesignatedByPDG ?? false,
      status: user.status ?? 'ACTIF',
      unique_identifier: user.uniqueIdentifier ?? null,
      is_email_confirmed: user.isEmailConfirmed ?? false,
      two_factor_enabled: user.twoFactorEnabled ?? false,
      theme_preference: user.themePreference ?? 'light',
      notify_whatsapp: user.notifyWhatsApp ?? false,
    };
    const { error } = await supabase.from('users').upsert(row, { onConflict: 'id' });
    if (error) throw new Error(`upsertUser: ${error.message}`);
  },

  async deleteUser(userId: string): Promise<void> {
    const { error } = await supabase.from('users').delete().eq('id', userId);
    if (error) throw new Error(`deleteUser: ${error.message}`);
  },

  // ── BOUTIQUES ─────────────────────────────────────────────────────────────

  async getShops(): Promise<Shop[]> {
    const { data, error } = await supabase
      .from('shops')
      .select('*')
      .order('name');
    if (error) throw new Error(`getShops: ${error.message}`);
    return (data as SupabaseShop[]).map(mapShop);
  },

  async upsertShop(shop: Shop): Promise<void> {
    const row = {
      id: shop.id,
      code: shop.code,
      name: shop.name,
      address: shop.address,
      phone: shop.phone,
      manager_id: shop.managerId ?? null,
      manager_name: shop.managerName ?? null,
      status: shop.status,
      type: shop.type,
      active_inventories_count: shop.activeInventoriesCount,
      validated_inventories_count: shop.validatedInventoriesCount,
      last_validation_date: shop.lastValidationDate ?? null,
    };
    const { error } = await supabase.from('shops').upsert(row, { onConflict: 'id' });
    if (error) throw new Error(`upsertShop: ${error.message}`);
  },

  // ── CATALOGUE ─────────────────────────────────────────────────────────────

  async getCatalog(): Promise<CatalogItem[]> {
    const { data, error } = await supabase
      .from('catalog')
      .select('*')
      .order('designation');
    if (error) throw new Error(`getCatalog: ${error.message}`);
    return (data as SupabaseCatalogItem[]).map(mapCatalogItem);
  },

  async upsertCatalogItem(item: CatalogItem): Promise<void> {
    const row = {
      id: item.id,
      code: item.code,
      category: item.category,
      color: item.color ?? null,
      designation: item.designation,
      official_price: item.officialPrice,
      unit: item.unit,
      is_active: item.isActive,
      last_price_update: item.lastPriceUpdate,
    };
    const { error } = await supabase.from('catalog').upsert(row, { onConflict: 'id' });
    if (error) throw new Error(`upsertCatalogItem: ${error.message}`);
  },

  // ── INVENTAIRES ───────────────────────────────────────────────────────────

  async getInventories(): Promise<Inventory[]> {
    const { data: invData, error: invError } = await supabase
      .from('inventories')
      .select('*')
      .order('created_at', { ascending: false });
    if (invError) throw new Error(`getInventories: ${invError.message}`);

    const { data: lineData, error: lineError } = await supabase
      .from('inventory_lines')
      .select('*');
    if (lineError) throw new Error(`getInventoryLines: ${lineError.message}`);

    const linesByInv = new Map<string, InventoryLine[]>();
    (lineData as SupabaseInventoryLine[]).forEach(r => {
      const line = mapInventoryLine(r);
      if (!linesByInv.has(r.inventory_id)) linesByInv.set(r.inventory_id, []);
      linesByInv.get(r.inventory_id)!.push(line);
    });

    return (invData as SupabaseInventory[]).map(r =>
      mapInventory(r, linesByInv.get(r.id) ?? [])
    );
  },

  async upsertInventory(inv: Inventory): Promise<void> {
    const row = {
      id: inv.id,
      code: inv.code,
      shop_id: inv.shopId,
      shop_name: inv.shopName,
      location_type: inv.locationType,
      site_name: inv.siteName ?? null,
      category: inv.category,
      status: inv.status,
      campaign_name: inv.campaignName,
      version: inv.version,
      assigned_counter_id: inv.assignedCounterId ?? null,
      assigned_counter_name: inv.assignedCounterName ?? null,
      assigned_controller_id: inv.assignedControllerId ?? null,
      assigned_controller_name: inv.assignedControllerName ?? null,
      validated_by_id: inv.validatedById ?? null,
      validated_by_name: inv.validatedByName ?? null,
      closed_at: inv.closedAt ?? null,
    };
    const { error } = await supabase.from('inventories').upsert(row, { onConflict: 'id' });
    if (error) throw new Error(`upsertInventory: ${error.message}`);

    // Synchroniser les lignes
    await supabase.from('inventory_lines').delete().eq('inventory_id', inv.id);
    if (inv.lines.length > 0) {
      const lineRows = inv.lines.map(l => ({
        id: l.id,
        inventory_id: inv.id,
        product_id: l.productId,
        designation: l.designation,
        category: l.category,
        color: l.color ?? null,
        unit: l.unit,
        official_price_snapshot: l.officialPriceSnapshot,
        qty_good: l.qtyGood,
        qty_damaged: l.qtyDamaged,
        damage_reason: l.damageReason ?? null,
        observation: l.observation ?? null,
        last_modified_by: l.lastModifiedBy ?? null,
        last_modified_at: l.lastModifiedAt ?? null,
        was_corrected: l.wasCorrected ?? false,
      }));
      const { error: lErr } = await supabase.from('inventory_lines').insert(lineRows);
      if (lErr) throw new Error(`upsertInventoryLines: ${lErr.message}`);
    }
  },

  // ── JOURNAL D'AUDIT ───────────────────────────────────────────────────────

  async getAuditLogs(limit = 200): Promise<AuditLog[]> {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw new Error(`getAuditLogs: ${error.message}`);
    return (data as SupabaseAuditLog[]).map(mapAuditLog);
  },

  async insertAuditLog(log: AuditLog): Promise<void> {
    const row = {
      id: log.id,
      timestamp: log.timestamp,
      user_id: log.userId,
      user_name: log.userName,
      user_role: log.userRole,
      action: log.action,
      target_object: log.targetObject ?? null,
      old_value: log.oldValue ?? null,
      new_value: log.newValue ?? null,
      reason: log.reason ?? null,
      authorized_by: log.authorizedBy ?? null,
      shop_id: log.shopId ?? null,
      shop_name: log.shopName ?? null,
      inventory_id: log.inventoryId ?? null,
      status: log.status,
      ip_address: log.ipAddress ?? null,
    };
    const { error } = await supabase.from('audit_logs').insert(row);
    if (error) throw new Error(`insertAuditLog: ${error.message}`);
  },

  // ── NOTIFICATIONS ─────────────────────────────────────────────────────────

  async getNotifications(): Promise<AppNotification[]> {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw new Error(`getNotifications: ${error.message}`);
    return (data as SupabaseNotification[]).map(mapNotification);
  },

  async markNotificationRead(notifId: string): Promise<void> {
    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notifId);
    if (error) throw new Error(`markNotificationRead: ${error.message}`);
  },

  // ── SYNCHRONISATION INITIALE ─────────────────────────────────────────────
  // Charge toutes les données depuis Supabase au démarrage de l'application.

  async loadAll(): Promise<{
    users: User[];
    shops: Shop[];
    catalog: CatalogItem[];
    inventories: Inventory[];
    auditLogs: AuditLog[];
    notifications: AppNotification[];
  }> {
    const [users, shops, catalog, inventories, auditLogs, notifications] = await Promise.all([
      this.getUsers(),
      this.getShops(),
      this.getCatalog(),
      this.getInventories(),
      this.getAuditLogs(),
      this.getNotifications(),
    ]);
    return { users, shops, catalog, inventories, auditLogs, notifications };
  },

  // ── PUSH COMPLET : localStorage → Supabase ────────────────────────────────
  // Utile pour la migration initiale des données.

  async pushLocalDataToSupabase(data: {
    users: User[];
    shops: Shop[];
    catalog: CatalogItem[];
    inventories: Inventory[];
  }): Promise<{ success: boolean; details: string }> {
    if (!isSupabaseConfigured) {
      return {
        success: false,
        details: 'Configuration requise : veuillez renseigner vos variables VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env.'
      };
    }
    try {
      // Utilisateurs
      for (const u of data.users) await this.upsertUser(u);
      // Boutiques
      for (const s of data.shops) await this.upsertShop(s);
      // Catalogue
      for (const c of data.catalog) await this.upsertCatalogItem(c);
      // Inventaires
      for (const inv of data.inventories) await this.upsertInventory(inv);
      return {
        success: true,
        details: `Migration réussie : ${data.users.length} utilisateurs, ${data.shops.length} boutiques, ${data.catalog.length} articles, ${data.inventories.length} inventaires.`
      };
    } catch (e: any) {
      return { success: false, details: `Erreur migration : ${e.message}` };
    }
  }
};

export async function checkSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  if (!isSupabaseConfigured) {
    return {
      ok: false,
      message: 'Supabase n\'est pas encore configuré : renseignez VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY dans le fichier .env.'
    };
  }
  try {
    const { error } = await supabase.from('alucount_shops').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Connexion refusée : ${error.message}` };
    }
    return { ok: true, message: 'Connexion PostgreSQL établie avec succès. Tables ALUCOUNT opérationnelles.' };
  } catch (err: any) {
    return { ok: false, message: `Échec de connexion : ${err?.message || 'Erreur réseau inconnue'}` };
  }
}

export default SupabaseService;
