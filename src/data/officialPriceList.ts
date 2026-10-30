import { CatalogItem, AluminiumColor } from '../types';

export interface RawAluProfile {
  idSuffix: string;
  codeBase: string;
  designation: string;
  categoryName: string;
  unit?: string;
  prices: {
    satineBronzeChampagne: number; // Colonne 1: SATINE/BRONZE CHAMPAGNE
    beigeBlancGris: number;        // Colonne 2: BEIGE/BLANC GRIS
    noirBois?: number;             // Colonne 3: NOIR/BOIS (si omis, égale beigeBlancGris)
  };
  supportedColors?: AluminiumColor[];
}

export const OFFICIAL_PROFILES: RawAluProfile[] = [
  // 1. COULISSANT
  {
    idSuffix: 'rail3v',
    codeBase: 'RAIL-3V',
    designation: 'RAIL 3V',
    categoryName: 'Coulissant',
    prices: { satineBronzeChampagne: 23000, beigeBlancGris: 23500, noirBois: 23500 },
  },
  {
    idSuffix: 'rail_couvre',
    codeBase: 'RAIL-COUVRE',
    designation: 'RAIL À COUVRE',
    categoryName: 'Coulissant',
    prices: { satineBronzeChampagne: 17500, beigeBlancGris: 18000, noirBois: 18000 },
  },
  {
    idSuffix: 'rail_simple',
    codeBase: 'RAIL-SIMPLE',
    designation: 'RAIL SIMPLE',
    categoryName: 'Coulissant',
    prices: { satineBronzeChampagne: 15000, beigeBlancGris: 15500, noirBois: 15500 },
  },
  {
    idSuffix: 'leaf_rond',
    codeBase: 'LEAF-ROND',
    designation: 'LEAF ROND',
    categoryName: 'Coulissant',
    prices: { satineBronzeChampagne: 13500, beigeBlancGris: 14500, noirBois: 14500 },
  },
  {
    idSuffix: 'leaf_plat',
    codeBase: 'LEAF-PLAT',
    designation: 'LEAF PLAT',
    categoryName: 'Coulissant',
    prices: { satineBronzeChampagne: 13500, beigeBlancGris: 14500, noirBois: 14500 },
  },
  {
    idSuffix: 'crochet',
    codeBase: 'CROCHET',
    designation: 'CROCHET',
    categoryName: 'Coulissant',
    prices: { satineBronzeChampagne: 7000, beigeBlancGris: 7200, noirBois: 7200 },
  },
  {
    idSuffix: 'net_petit',
    codeBase: 'NET-PETIT',
    designation: 'NET PETIT',
    categoryName: 'Coulissant',
    prices: { satineBronzeChampagne: 7000, beigeBlancGris: 7200, noirBois: 7200 },
  },
  {
    idSuffix: 'separation',
    codeBase: 'SEPARATION',
    designation: 'SEPARATION',
    categoryName: 'Coulissant',
    prices: { satineBronzeChampagne: 6500, beigeBlancGris: 7000, noirBois: 7000 },
  },

  // 2. PORTE A LA FRANÇAISE
  {
    idSuffix: 'l_petit',
    codeBase: 'L-PETIT',
    designation: 'L PETIT',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 9500, beigeBlancGris: 10000, noirBois: 10000 },
  },
  {
    idSuffix: 'l_grand',
    codeBase: 'L-GRAND',
    designation: 'L GRAND',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 11500, beigeBlancGris: 12000, noirBois: 12000 },
  },
  {
    idSuffix: 'l_couvre',
    codeBase: 'L-COUVRE',
    designation: 'L à COUVRE',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 13500, beigeBlancGris: 14000, noirBois: 14000 },
  },
  {
    idSuffix: 't_petit',
    codeBase: 'T-PETIT',
    designation: 'T PETIT',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 11500, beigeBlancGris: 12000, noirBois: 12000 },
  },
  {
    idSuffix: 't_grand',
    codeBase: 'T-GRAND',
    designation: 'T GRAND',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 14000, beigeBlancGris: 14500, noirBois: 14500 },
  },
  {
    idSuffix: 'socle_moyen',
    codeBase: 'SOCLE-MOYEN',
    designation: 'SOCLE MOYEN',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 22500, beigeBlancGris: 23000, noirBois: 23000 },
  },
  {
    idSuffix: 'socle_grand',
    codeBase: 'SOCLE-GRAND',
    designation: 'SOCLE GRAND',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 27000, beigeBlancGris: 28000, noirBois: 28000 },
  },
  {
    idSuffix: 'z',
    codeBase: 'PROFIL-Z',
    designation: 'Z',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 14000, beigeBlancGris: 14500, noirBois: 14500 },
  },
  {
    idSuffix: 'parclose',
    codeBase: 'PARCLOSE',
    designation: 'PARCLOSE',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 6000, beigeBlancGris: 6500, noirBois: 6500 },
  },
  {
    idSuffix: 'plaquette',
    codeBase: 'PLAQUETTE',
    designation: 'PLAQUETTE',
    categoryName: 'Porte à la Française',
    prices: { satineBronzeChampagne: 11000, beigeBlancGris: 11500, noirBois: 11500 },
  },

  // 3. ÉTAGÈRE
  {
    idSuffix: 'lateral',
    codeBase: 'LATERAL',
    designation: 'LATERAL',
    categoryName: 'Étagère',
    prices: { satineBronzeChampagne: 9500, beigeBlancGris: 10000, noirBois: 10000 },
  },
  {
    idSuffix: 'poteau_angle',
    codeBase: 'POTEAU-ANGLE',
    designation: "POTEAU D'ANGLE",
    categoryName: 'Étagère',
    prices: { satineBronzeChampagne: 9000, beigeBlancGris: 9500, noirBois: 9500 },
  },
  {
    idSuffix: 'fglass',
    codeBase: 'FGLASS',
    designation: 'FGLASS',
    categoryName: 'Étagère',
    prices: { satineBronzeChampagne: 5000, beigeBlancGris: 5500, noirBois: 5500 },
  },
  {
    idSuffix: 'rail_moustiquaire',
    codeBase: 'RAIL-MOUST',
    designation: 'RAIL MOUSTIQUAIRE',
    categoryName: 'Étagère',
    prices: { satineBronzeChampagne: 8000, beigeBlancGris: 8500, noirBois: 8500 },
  },

  // 4. ÉTAGÈRE & GRILLE ANTIVOL
  {
    idSuffix: '40x20_ouvert',
    codeBase: 'TUBE-40X20-OUV',
    designation: '40X20 OUVERT',
    categoryName: 'Étagère & Grille Antivol',
    prices: { satineBronzeChampagne: 6500, beigeBlancGris: 7000, noirBois: 7000 },
  },
  {
    idSuffix: '40x20_ferme',
    codeBase: 'TUBE-40X20-FERM',
    designation: '40X20 FERMÉ',
    categoryName: 'Étagère & Grille Antivol',
    prices: { satineBronzeChampagne: 7200, beigeBlancGris: 8000, noirBois: 8000 },
  },
  {
    idSuffix: '40x40',
    codeBase: 'TUBE-40X40',
    designation: '40X40',
    categoryName: 'Étagère & Grille Antivol',
    prices: { satineBronzeChampagne: 9500, beigeBlancGris: 10000, noirBois: 10000 },
  },
  {
    idSuffix: '40x80',
    codeBase: 'TUBE-40X80',
    designation: '40X80',
    categoryName: 'Étagère & Grille Antivol',
    prices: { satineBronzeChampagne: 15000, beigeBlancGris: 15500, noirBois: 15500 },
  },
  {
    idSuffix: '40x120',
    codeBase: 'TUBE-40X120',
    designation: '40X120',
    categoryName: 'Étagère & Grille Antivol',
    prices: { satineBronzeChampagne: 20000, beigeBlancGris: 21000, noirBois: 21000 },
  },
  {
    idSuffix: 'barreau',
    codeBase: 'BARREAU',
    designation: 'BARREAU',
    categoryName: 'Étagère & Grille Antivol',
    prices: { satineBronzeChampagne: 7000, beigeBlancGris: 7500, noirBois: 7500 },
  },

  // 5. BALCON & ESCALIER
  {
    idSuffix: 'main_courante',
    codeBase: 'MAIN-COURANTE',
    designation: 'MAIN COURANTE',
    categoryName: 'Balcon & Escalier',
    prices: { satineBronzeChampagne: 10000, beigeBlancGris: 10500, noirBois: 10500 },
  },
  {
    idSuffix: 'lisse',
    codeBase: 'LISSE',
    designation: 'LISSE',
    categoryName: 'Balcon & Escalier',
    prices: { satineBronzeChampagne: 8000, beigeBlancGris: 8500, noirBois: 8500 },
  },

  // 6. MUR RIDEAU
  {
    idSuffix: 'poteau_mur_rideau',
    codeBase: 'POTEAU-MUR-RID',
    designation: 'POTEAU MUR RIDEAU',
    categoryName: 'Mur Rideau',
    prices: { satineBronzeChampagne: 26000, beigeBlancGris: 27000, noirBois: 27000 },
  },
  {
    idSuffix: 'ouvrant_mur_rideau',
    codeBase: 'OUVR-MUR-RID',
    designation: 'OUVRANT MUR RIDEAU',
    categoryName: 'Mur Rideau',
    prices: { satineBronzeChampagne: 14000, beigeBlancGris: 15000, noirBois: 15000 },
  },
  {
    idSuffix: 'poteau_double_vitrage',
    codeBase: 'POT-DBL-VITR',
    designation: 'POTEAU Double Vitrage',
    categoryName: 'Mur Rideau',
    prices: { satineBronzeChampagne: 36500, beigeBlancGris: 37000, noirBois: 37000 },
  },
  {
    idSuffix: 'ouvrant_double_vitrage',
    codeBase: 'OUVR-DBL-VITR',
    designation: 'OUVRANT Double Vitrage',
    categoryName: 'Mur Rideau',
    prices: { satineBronzeChampagne: 17000, beigeBlancGris: 17500, noirBois: 17500 },
  },

  // 7. PERSIENNES
  {
    idSuffix: 'lame_persienne',
    codeBase: 'LAME-PERSIENNE',
    designation: 'LAME PERSIENNE',
    categoryName: 'Persiennes',
    prices: { satineBronzeChampagne: 10500, beigeBlancGris: 11000, noirBois: 11000 },
  },
  {
    idSuffix: 'couvre_persienne',
    codeBase: 'COUVRE-PERSIENNE',
    designation: 'COUVRE PERSIENNE',
    categoryName: 'Persiennes',
    prices: { satineBronzeChampagne: 5500, beigeBlancGris: 6000, noirBois: 6000 },
  },

  // 8. GAMME FDT (Prix différenciés en 3 colonnes)
  {
    idSuffix: 'l_small_fdt',
    codeBase: 'L-SMALL-FDT',
    designation: 'L SMALL FDT',
    categoryName: 'Gamme FDT',
    prices: { satineBronzeChampagne: 15000, beigeBlancGris: 16000, noirBois: 17000 },
  },
  {
    idSuffix: 'l_big_fdt',
    codeBase: 'L-BIG-FDT',
    designation: 'L BIG FDT',
    categoryName: 'Gamme FDT',
    prices: { satineBronzeChampagne: 19000, beigeBlancGris: 19500, noirBois: 20000 },
  },
  {
    idSuffix: 't_small_fdt',
    codeBase: 'T-SMALL-FDT',
    designation: 'T SMALL FDT',
    categoryName: 'Gamme FDT',
    prices: { satineBronzeChampagne: 16000, beigeBlancGris: 16500, noirBois: 16500 },
  },
  {
    idSuffix: 't_big_fdt',
    codeBase: 'T-BIG-FDT',
    designation: 'T BIG FDT',
    categoryName: 'Gamme FDT',
    prices: { satineBronzeChampagne: 20000, beigeBlancGris: 20500, noirBois: 21000 },
  },
  {
    idSuffix: 'socle_fdt',
    codeBase: 'SOCLE-FDT',
    designation: 'SOCLE FDT',
    categoryName: 'Gamme FDT',
    prices: { satineBronzeChampagne: 31000, beigeBlancGris: 31500, noirBois: 32500 },
  },
  {
    idSuffix: 'z_fdt',
    codeBase: 'Z-FDT',
    designation: 'Z FDT',
    categoryName: 'Gamme FDT',
    prices: { satineBronzeChampagne: 20500, beigeBlancGris: 21000, noirBois: 22000 },
  },
  {
    idSuffix: 'parclose_fdt',
    codeBase: 'PARCLOSE-FDT',
    designation: 'PARCLOSE FDT',
    categoryName: 'Gamme FDT',
    prices: { satineBronzeChampagne: 8500, beigeBlancGris: 9000, noirBois: 9500 },
  },

  // 9. GAMME TRIALCO
  {
    idSuffix: 'rail_3v_trialco_net',
    codeBase: 'RAIL-3V-TRIALCO-NET',
    designation: 'RAIL 3V TRIALCO [NET]',
    categoryName: 'Gamme Trialco',
    prices: { satineBronzeChampagne: 42000, beigeBlancGris: 42000, noirBois: 43000 },
  },
  {
    idSuffix: 'rail_3v_trialco',
    codeBase: 'RAIL-3V-TRIALCO',
    designation: 'RAIL 3V TRIALCO',
    categoryName: 'Gamme Trialco',
    prices: { satineBronzeChampagne: 40000, beigeBlancGris: 40000, noirBois: 42000 },
  },
  {
    idSuffix: 'rail_trialco',
    codeBase: 'RAIL-TRIALCO',
    designation: 'RAIL TRIALCO',
    categoryName: 'Gamme Trialco',
    prices: { satineBronzeChampagne: 29500, beigeBlancGris: 30000, noirBois: 30500 },
  },
  {
    idSuffix: 'leaf_trialco',
    codeBase: 'LEAF-TRIALCO',
    designation: 'LEAF TRIALCO',
    categoryName: 'Gamme Trialco',
    prices: { satineBronzeChampagne: 20000, beigeBlancGris: 20500, noirBois: 21000 },
  },
  {
    idSuffix: 'leaf_trialco_ouvert',
    codeBase: 'LEAF-TRIALCO-OUV',
    designation: 'LEAF TRIALCO OUVERT',
    categoryName: 'Gamme Trialco',
    prices: { satineBronzeChampagne: 20000, beigeBlancGris: 20500, noirBois: 21000 },
  },
  {
    idSuffix: 'crochet_trialco',
    codeBase: 'CROCHET-TRIALCO',
    designation: 'CROCHET TRIALCO',
    categoryName: 'Gamme Trialco',
    prices: { satineBronzeChampagne: 10000, beigeBlancGris: 10500, noirBois: 11000 },
  },
  {
    idSuffix: 'net_trialco_grand',
    codeBase: 'NET-TRIALCO-GRAND',
    designation: 'NET TRIALCO / GRAND',
    categoryName: 'Gamme Trialco',
    prices: { satineBronzeChampagne: 8500, beigeBlancGris: 9000, noirBois: 9500 },
  },
];

// Couleurs gérées avec leurs préfixes de code et libellés
const COLOR_MAPPINGS: { color: AluminiumColor; group: 'satine' | 'blanc' | 'noir'; codePrefix: string }[] = [
  { color: 'Blanche', group: 'blanc', codePrefix: 'BLA' },
  { color: 'Grise', group: 'blanc', codePrefix: 'GRI' },
  { color: 'Beige', group: 'blanc', codePrefix: 'BEI' },
  { color: 'Satinée', group: 'satine', codePrefix: 'SAT' },
  { color: 'Bronze', group: 'satine', codePrefix: 'BRO' },
  { color: 'Champagne', group: 'satine', codePrefix: 'CHA' },
  { color: 'Noire', group: 'noir', codePrefix: 'NOI' },
  { color: 'Bois', group: 'noir', codePrefix: 'BOI' },
];

/**
 * Génère l'ensemble exhaustif des articles aluminium déclinés fidèlement
 * par couleur avec le prix exact du document officiel ALUTRACO du 17 août 2026.
 */
export function generateOfficialAluminiumCatalog(): CatalogItem[] {
  const items: CatalogItem[] = [];

  // 1. Profils Aluminium déclinés par couleur
  for (const prof of OFFICIAL_PROFILES) {
    for (const cm of COLOR_MAPPINGS) {
      if (prof.supportedColors && !prof.supportedColors.includes(cm.color)) {
        continue;
      }

      let price = prof.prices.beigeBlancGris;
      if (cm.group === 'satine') {
        price = prof.prices.satineBronzeChampagne;
      } else if (cm.group === 'noir') {
        price = prof.prices.noirBois ?? prof.prices.beigeBlancGris;
      }

      const id = `cat_alu_${prof.idSuffix}_${cm.codePrefix.toLowerCase()}`;
      const code = `ALU-${cm.codePrefix}-${prof.codeBase}`;
      const designation = `${prof.designation} (${cm.color.toUpperCase()})`;

      items.push({
        id,
        code,
        category: 'Aluminium',
        color: cm.color,
        designation,
        officialPrice: price,
        unit: prof.unit || 'Barre de 6.00m',
        isActive: true,
        lastPriceUpdate: '2026-08-17',
      });
    }
  }

  // 2. Équerres (au mètre et en barre)
  const equerres = [
    { id: 'cat_equerre_2x2_barre', code: 'EQU-2X2-BAR', designation: 'EQUERRE 2X2 (Barre de 6m)', officialPrice: 6500, unit: 'Barre de 6.00m' },
    { id: 'cat_equerre_2x2_m', code: 'EQU-2X2-MET', designation: 'EQUERRE 2X2 (au mètre)', officialPrice: 1200, unit: 'Mètre' },
    { id: 'cat_equerre_4x4_leg_barre', code: 'EQU-4X4-LEG-BAR', designation: 'EQUERRE 4X4 LEGER (Barre de 6m)', officialPrice: 13000, unit: 'Barre de 6.00m' },
    { id: 'cat_equerre_4x4_leg_m', code: 'EQU-4X4-LEG-MET', designation: 'EQUERRE 4X4 LEGER (au mètre)', officialPrice: 2700, unit: 'Mètre' },
    { id: 'cat_equerre_4x4_dur_barre', code: 'EQU-4X4-DUR-BAR', designation: 'EQUERRE 4X4 DUR (Barre de 6m)', officialPrice: 15500, unit: 'Barre de 6.00m' },
    { id: 'cat_equerre_4x4_dur_m', code: 'EQU-4X4-DUR-MET', designation: 'EQUERRE 4X4 DUR (au mètre)', officialPrice: 3300, unit: 'Mètre' },
  ];
  for (const eq of equerres) {
    items.push({
      ...eq,
      category: 'Aluminium',
      isActive: true,
      lastPriceUpdate: '2026-08-17',
    });
  }

  // 3. Volets Roulants
  const volets = [
    { id: 'cat_vr_gd_lame_pleine', code: 'VR-GD-LAME-PLEINE', designation: 'VOLET ROULANT GRAND — LAME PLEINE', officialPrice: 17000, unit: 'Barre de 6.00m' },
    { id: 'cat_vr_gd_coulisse_couvre', code: 'VR-GD-COULISSE', designation: 'VOLET ROULANT GRAND — COULISSE + COUVRE', officialPrice: 27000, unit: 'Barre de 6.00m' },
    { id: 'cat_vr_gd_lame_finale', code: 'VR-GD-LAME-FINALE', designation: 'VOLET ROULANT GRAND — LAME FINALE', officialPrice: 17000, unit: 'Barre de 6.00m' },
    { id: 'cat_vr_pt_lame_pleine', code: 'VR-PT-LAME-PLEINE', designation: 'VOLET ROULANT PETIT — LAME PLEINE', officialPrice: 14000, unit: 'Barre de 6.00m' },
    { id: 'cat_vr_pt_lame_finale', code: 'VR-PT-LAME-FINALE', designation: 'VOLET ROULANT PETIT — LAME FINALE', officialPrice: 17000, unit: 'Barre de 6.00m' },
    { id: 'cat_vr_pt_coulisse', code: 'VR-PT-COULISSE', designation: 'VOLET ROULANT PETIT — COULISSE', officialPrice: 28500, unit: 'Barre de 6.00m' },
  ];
  for (const vr of volets) {
    items.push({
      ...vr,
      category: 'Aluminium',
      isActive: true,
      lastPriceUpdate: '2026-08-17',
    });
  }

  // 4. Balcon, Escalier & INOX
  const inoxItems = [
    { id: 'cat_acc_accroche_murale', code: 'BAL-ACC-MURALE', designation: 'ACCROCHE MURALE BALCON', officialPrice: 21000, unit: 'Pièce', category: 'Aluminium' as const },
    { id: 'cat_inox_tube_50', code: 'INOX-TUBE-50', designation: 'TUBE DE 50 INOX', officialPrice: 21000, unit: 'Barre de 6.00m', category: 'Aluminium' as const },
    { id: 'cat_inox_tube_14', code: 'INOX-TUBE-14', designation: 'TUBE DE 14 INOX', officialPrice: 7000, unit: 'Barre de 6.00m', category: 'Aluminium' as const },
    { id: 'cat_inox_tube_40_parclose', code: 'INOX-TUBE-40-PARC', designation: 'TUBE POTEAU DE 40 INOX (avec Parclose U)', officialPrice: 29500, unit: 'Barre de 6.00m', category: 'Aluminium' as const },
  ];
  for (const inx of inoxItems) {
    items.push({
      ...inx,
      isActive: true,
      lastPriceUpdate: '2026-08-17',
    });
  }

  // 5. Accessoires et Quincaillerie
  const accessoires: CatalogItem[] = [
    { id: 'cat_acc_01', code: 'ACC-ROU-001', category: 'Accessoires', designation: 'ROULETTES DOUBLES REGLABLES CHARIOT INOX', officialPrice: 3500, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_02', code: 'ACC-SER-002', category: 'Accessoires', designation: 'SERRURE MULTIPOINT A CLE REVERSIBLE', officialPrice: 14500, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_03', code: 'ACC-SER-003', category: 'Accessoires', designation: 'SERRURE A CLE SIMPLE', officialPrice: 8000, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_04', code: 'ACC-JOI-004', category: 'Accessoires', designation: 'JOINTS NEOPRENE EPDM COUPE-VENT 100M', officialPrice: 22000, unit: 'Rouleau 100m', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_05', code: 'ACC-JOI-005', category: 'Accessoires', designation: 'JOINTS SILICONE TRANSPARENT 300ML', officialPrice: 4500, unit: 'Cartouche', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_06', code: 'ACC-EQU-006', category: 'Accessoires', designation: 'EQUERRES A PION RENFORCEES 35MM', officialPrice: 450, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_07', code: 'ACC-EQU-007', category: 'Accessoires', designation: 'EQUERRES RENFORCEES 50MM', officialPrice: 650, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_08', code: 'ACC-POI-008', category: 'Accessoires', designation: 'POIGNEE DE TIRAGE ALU DESIGN LUXE', officialPrice: 8500, unit: 'Paire', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_09', code: 'ACC-POI-009', category: 'Accessoires', designation: 'POIGNEE ENCASTREE RONDE INOX', officialPrice: 5500, unit: 'Paire', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_10', code: 'ACC-VIS-010', category: 'Accessoires', designation: 'VIS INOX AUTOFORANTES 4.2x25 (Boite 500)', officialPrice: 6000, unit: 'Boite', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_11', code: 'ACC-VIS-011', category: 'Accessoires', designation: 'VIS INOX AUTOFORANTES 4.8x38 (Boite 200)', officialPrice: 5500, unit: 'Boite', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_12', code: 'ACC-FER-012', category: 'Accessoires', designation: 'FERRURE DE VOLET ALUMINIUM', officialPrice: 12000, unit: 'Jeu', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_13', code: 'ACC-FER-013', category: 'Accessoires', designation: 'CHARNIERE REGLABLE 3D ALUMINIUM', officialPrice: 7500, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_14', code: 'ACC-ROD-014', category: 'Accessoires', designation: 'TIGE DE VITRAGE 6mm x 200mm', officialPrice: 350, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_15', code: 'ACC-CAP-015', category: 'Accessoires', designation: 'CAPUCHON DE FIN DE RAIL (lot 10)', officialPrice: 2500, unit: 'Lot de 10', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_16', code: 'ACC-VER-016', category: 'Accessoires', designation: 'VERROU CREMONE ALUMINIUM', officialPrice: 9000, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_17', code: 'ACC-ANT-017', category: 'Accessoires', designation: 'ANTI-SOULEVEMENT RAIL COULISSANT', officialPrice: 1200, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
    { id: 'cat_acc_18', code: 'ACC-ARC-018', category: 'Accessoires', designation: 'ARCEAU ANTI-SOULEVEMENT RENFORCE', officialPrice: 1800, unit: 'Piece', isActive: true, lastPriceUpdate: '2026-08-17' },
  ];
  for (const acc of accessoires) {
    items.push(acc);
  }

  return items;
}

export const OFFICIAL_ALUTRACO_CATALOG: CatalogItem[] = generateOfficialAluminiumCatalog();
