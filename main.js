const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

canvas.width = 540;
canvas.height = 1040;

const GRID_COLS = 12;
const GRID_ROWS = 13;
const TILE = 40;
const RIVER_ROWS = 2;
const BASE_TOP_UI_OFFSET = 36;

const LAYOUT = {
  padding: 16,
  gap: 10,
  auraH: 58,
  statsH: 48,
  controlH: 156
};

const NICK_STORAGE_KEY = "td_random_nick";
const BEST_WAVE_STORAGE_KEY = "td_random_best_wave";
const LEADERBOARD_STORAGE_KEY = "td_random_leaderboard";

let TOP_UI_OFFSET = BASE_TOP_UI_OFFSET;
let STACK_TOP = 0;
let GAME_H = 0;
let BOARD_W = 0;
let BOARD_H = 0;
let MAP_VISUAL_H = 0;
let BOARD_X = 0;
let BOARD_Y = 0;
let TOP_HUD_X = 0;
let TOP_HUD_Y = 0;
let TOP_HUD_W = 0;
let AURA_X = 0;
let AURA_Y = 0;
let AURA_W = 0;
let STATS_X = 0;
let STATS_Y = 0;
let STATS_W = 0;
let CONTROL_X = 0;
let CONTROL_Y = 0;
let CONTROL_W = 0;
let CONTROL_H = 0;
let INFO_W = 0;
let BUTTONS_X = 0;
let BUTTONS_W = 0;
let BUTTON_GAP = 10;
let ACTION_BUTTON_W = 0;
let ACTION_BUTTON_H = 0;
let SHOP_W = 0;
let SHOP_H = 112;
let SHOP_X = 0;
let SHOP_Y = 0;

function recalculateLayout() {
  STACK_TOP = LAYOUT.padding + TOP_UI_OFFSET;
  BOARD_W = GRID_COLS * TILE;
  BOARD_H = GRID_ROWS * TILE;
  MAP_VISUAL_H = BOARD_H + TILE * RIVER_ROWS;
  TOP_HUD_X = LAYOUT.padding;
  TOP_HUD_Y = STACK_TOP;
  TOP_HUD_W = canvas.width - LAYOUT.padding * 2;
  BOARD_X = Math.floor((canvas.width - BOARD_W) / 2);
  BOARD_Y = TOP_HUD_Y + LAYOUT.statsH + LAYOUT.gap;
  GAME_H = BOARD_Y + MAP_VISUAL_H - STACK_TOP;
  AURA_X = LAYOUT.padding;
  AURA_Y = BOARD_Y + MAP_VISUAL_H + LAYOUT.gap;
  AURA_W = canvas.width - LAYOUT.padding * 2;
  STATS_X = LAYOUT.padding;
  STATS_Y = AURA_Y + LAYOUT.auraH + LAYOUT.gap;
  STATS_W = canvas.width - LAYOUT.padding * 2;
  CONTROL_X = LAYOUT.padding;
  CONTROL_Y = STATS_Y + LAYOUT.statsH + LAYOUT.gap;
  CONTROL_W = canvas.width - LAYOUT.padding * 2;
  CONTROL_H = LAYOUT.controlH;
  INFO_W = Math.min(308, CONTROL_W - 120);
  BUTTONS_X = CONTROL_X + INFO_W + 12;
  BUTTONS_W = CONTROL_W - INFO_W - 12;
  ACTION_BUTTON_W = Math.floor((BUTTONS_W - BUTTON_GAP) / 2);
  ACTION_BUTTON_H = Math.floor((CONTROL_H - BUTTON_GAP) / 2);
  SHOP_W = BUTTONS_W;
  SHOP_X = BUTTONS_X;
  SHOP_Y = CONTROL_Y - SHOP_H - 10;
}

function getTelegramInsetTopCanvasPx() {
  const tg = window.Telegram?.WebApp;
  if (!tg) return BASE_TOP_UI_OFFSET;
  const insetTop = tg.safeAreaInset?.top ?? tg.contentSafeAreaInset?.top ?? 0;
  const rect = canvas.getBoundingClientRect();
  const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;
  return Math.max(BASE_TOP_UI_OFFSET, Math.round(insetTop * scaleY) + 10);
}

function applyTelegramViewportLayout() {
  const tg = window.Telegram?.WebApp;
  if (tg) {
    try {
      tg.ready?.();
      tg.expand?.();
    } catch {}
    TOP_UI_OFFSET = getTelegramInsetTopCanvasPx();
  } else {
    TOP_UI_OFFSET = BASE_TOP_UI_OFFSET;
  }
  recalculateLayout();
}

recalculateLayout();

const COLORS = {
  pageTop: "#0e1925",
  pageBottom: "#13253a",
  boardFrame: "#18222d",
  boardShadow: "rgba(0, 0, 0, 0.28)",
  boardInset: "#0d131a",
  road: "#ececec",
  roadStroke: "#c9c9c9",
  build: "#72eb48",
  buildStroke: "#409829",
  grid: "rgba(36, 112, 22, 0.45)",
  towerSlot: "rgba(0, 0, 0, 0.16)",
  turn: "#ff5d3a",
  cross: "#d93b30",
  gate: "#13202d",
  panel: "#1d3042",
  panelStroke: "rgba(255, 255, 255, 0.12)",
  infoPanel: "#98dff2",
  infoStroke: "#d8f3fa",
  statsPanel: "#5d7d42",
  statsText: "#f5ffea",
  text: "#eef4f8",
  subtext: "#c1cbd3",
  darkText: "#103041",
  mutedText: "#2c5566",
  simpleBtn: "#f44e4e",
  simpleBtnActive: "#ff6d6d",
  masterBtn: "#e8dc45",
  masterBtnActive: "#fff06d",
  shopBtn: "#76cc5d",
  shopBtnActive: "#91e678",
  disabled: "#4d5b68",
  disabledText: "#bec7ce",
  upgradeBtn: "#f0f7ff",
  upgradeActive: "#56a8ff",
  upgradeText: "#10273a",
  mineShell: "#515d69",
  mineCore: "#ffc74c",
  range: "rgba(45, 95, 133, 0.11)",
  select: "#ffe37d",
  enemy: "#d7263d",
  bonusEnemy: "#ffb000",
  enemyArmor: "#445b6e",
  hp: "#47c26d",
  shot: "#ffcf56",
  crit: "#ffd1dc"
};

const GRID_MAP = [
  "GGGGGGGGGGGG",
  "GRGGRGGRRRRG",
  "GRGGRGGRGGRG",
  "GRGGRGGRGGRG",
  "GRRRRRRRRRRG",
  "GGGGRGGRGGGG",
  "GGGGRGGRGGGG",
  "GRRRRRRRRRRG",
  "GRGGRGGRGGRG",
  "GRGGRGGRGGRG",
  "GRRRRGGRRRRG",
  "GGGGGGGGGGGG",
  "GGGGGGGGGGGG"
];

const START_CELL = { c: 1, r: 1 };
const EXIT_CELL = { c: 4, r: 1 };

const PATH_TURNS = [
  { c: 1, r: 1 },
  { c: 1, r: 4 },
  { c: 7, r: 4 },
  { c: 7, r: 1 },
  { c: 10, r: 1 },
  { c: 10, r: 4 },
  { c: 7, r: 4 },
  { c: 7, r: 7 },
  { c: 10, r: 7 },
  { c: 10, r: 10 },
  { c: 7, r: 10 },
  { c: 7, r: 7 },
  { c: 4, r: 7 },
  { c: 4, r: 10 },
  { c: 1, r: 10 },
  { c: 1, r: 7 },
  { c: 4, r: 7 },
  { c: 4, r: 1 }
];

const CROSS_MARKERS = [
  { c: 4, r: 4 },
  { c: 7, r: 4 },
  { c: 4, r: 7 },
  { c: 7, r: 7 }
];

const TURN_MARKERS = [
  { c: 1, r: 4, ax: 0.18, ay: 0.18, bx: 0.18, by: 0.82, cx: 0.82, cy: 0.82 },
  { c: 7, r: 1, ax: 0.18, ay: 0.82, bx: 0.18, by: 0.18, cx: 0.82, cy: 0.18 },
  { c: 10, r: 1, ax: 0.18, ay: 0.18, bx: 0.82, by: 0.18, cx: 0.82, cy: 0.82 },
  { c: 10, r: 4, ax: 0.82, ay: 0.18, bx: 0.82, by: 0.82, cx: 0.18, cy: 0.82 },
  { c: 10, r: 7, ax: 0.18, ay: 0.18, bx: 0.82, by: 0.18, cx: 0.82, cy: 0.82 },
  { c: 10, r: 10, ax: 0.82, ay: 0.18, bx: 0.82, by: 0.82, cx: 0.18, cy: 0.82 },
  { c: 7, r: 10, ax: 0.82, ay: 0.82, bx: 0.18, by: 0.82, cx: 0.18, cy: 0.18 },
  { c: 4, r: 10, ax: 0.82, ay: 0.18, bx: 0.82, by: 0.82, cx: 0.18, cy: 0.82 },
  { c: 1, r: 10, ax: 0.18, ay: 0.18, bx: 0.18, by: 0.82, cx: 0.82, cy: 0.82 },
  { c: 1, r: 7, ax: 0.18, ay: 0.18, bx: 0.18, by: 0.82, cx: 0.82, cy: 0.82 }
];

const SIMPLE_TOWER_COST = 170;
const MASTER_TOWER_COST = 1500;
function makeTower(spec) {
  return {
    cost: 0,
    attributeType: "Сила",
    attributeLevel: 1,
    critChance: 0,
    critMultiplier: 2,
    multiTargets: 1,
    chainFalloff: 0,
    splashRadiusCells: 0,
    auraDamageBoost: 0,
    auraFlatDamage: 0,
    auraAttackSpeedBoost: 0,
    auraCritChanceBoost: 0,
    slowFactor: 1,
    slowDuration: 0,
    poisonDamage: 0,
    poisonDuration: 0,
    poisonSpreadCount: 0,
    armorPenPercent: 0,
    armorBreakFlat: 0,
    armorBreakDuration: 0,
    percentCurrentHpDamage: 0,
    percentMaxHpDamage: 0,
    stunChance: 0,
    stunDuration: 0,
    freezeChance: 0,
    freezeDuration: 0,
    magicShredPercent: 0,
    percentCurrentHpChance: 0,
    percentMaxHpChance: 0,
    allTargetsChance: 0,
    pulseStunChance: 0,
    pulseStunRadiusCells: 0,
    pulseStunDuration: 0,
    executeChance: 0,
    executeThreshold: 0,
    executeNonBossOnly: false,
    beamChance: 0,
    beamMultiplier: 1,
    globalStunChance: 0,
    globalStunDuration: 0,
    speedBurstChance: 0,
    speedBurstBoost: 0,
    speedBurstDuration: 0,
    specialShotEvery: 0,
    specialShotMultiplier: 1,
    specialShotStunDuration: 0,
    mapProcChance: 0,
    mapProcDamage: 0,
    mapProcPercentMaxHp: 0,
    mapBlastEvery: 0,
    mapBlastDamage: 0,
    mapBlastBossMultiplier: 1,
    cannotKill: false,
    silverSplashChance: 0,
    silverSplashAttrBonus: 0,
    silverSplashSilverPerTarget: 0,
    splashTargetsMin: 1,
    splashTargetsMax: 1,
    tripleShotEvery: 0,
    killGainDamage: 0,
    killGainAuraShare: 0,
    stackingBurnDamage: 0,
    rangeCellsAura: 0,
    attackType: "Физическая",
    pattern: "single",
    visual: "spike",
    shotWidth: 2.2,
    ...spec
  };
}

const SIMPLE_TOWERS = [
  makeTower({ id: "peasant", family: "peasant", level: 1, tier: "Уровень 1", name: "Крестьянин", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 3, cooldown: 1.1, baseDamage: 22, cost: SIMPLE_TOWER_COST, shotColor: "#b68d5e", bodyColor: "#7a5a38", trimColor: "#e8d3b0", visual: "spike", talent: "Простой силовой урон без эффектов.", description: "Надежная стартовая башня ближнего радиуса." }),
  makeTower({ id: "archer", family: "archer", level: 1, tier: "Уровень 1", name: "Лучник", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 4.5, cooldown: 0.3, baseDamage: 15, cost: SIMPLE_TOWER_COST, shotColor: "#d7c092", bodyColor: "#6d5844", trimColor: "#f4e7c4", visual: "ballista", talent: "Очень частые выстрелы.", description: "Быстрый ранний снайпер по одиночной цели." }),
  makeTower({ id: "stonethrower", family: "stonethrower", level: 1, tier: "Уровень 1", name: "Камнемёт", attributeType: "Сила", attackType: "Физическая", pattern: "splash", rangeCells: 3, cooldown: 1.2, baseDamage: 20, splashRadiusCells: 1, cost: SIMPLE_TOWER_COST, shotColor: "#8d8d8d", bodyColor: "#5f6570", trimColor: "#d0d4da", visual: "mortar", talent: "Бьет по области радиусом 1 клетка.", description: "Стартовый физический сплэш." }),
  makeTower({ id: "frost_turret", family: "frost_turret", level: 1, tier: "Уровень 1", name: "Морозная башенка", attributeType: "Интеллект", attackType: "Магическая", pattern: "slow", rangeCells: 3.5, cooldown: 1.0, baseDamage: 12, slowFactor: 0.9, slowDuration: 2, cost: SIMPLE_TOWER_COST, shotColor: "#9fe8ff", bodyColor: "#2c6d8b", trimColor: "#dff8ff", visual: "frost", talent: "Замедляет цель на 10% на 2 сек.", description: "Ранний магический контроль." }),
  makeTower({ id: "cactus", family: "cactus", level: 1, tier: "Уровень 1", name: "Кактус", attributeType: "Ловкость", attackType: "Физическая", pattern: "multi", rangeCells: 3.5, cooldown: 0.5, baseDamage: 10, multiTargets: 4, cost: SIMPLE_TOWER_COST, shotColor: "#a4d06d", bodyColor: "#4f7b2b", trimColor: "#d7f9a6", visual: "spike", talent: "Стреляет сразу по 4 целям.", description: "Широкий залп для пачек." }),
  makeTower({ id: "spark", family: "spark", level: 1, tier: "Уровень 1", name: "Искра", attributeType: "Интеллект", attackType: "Магическая цепная", pattern: "chain", rangeCells: 4, cooldown: 0.4, baseDamage: 14, multiTargets: 2, chainFalloff: 0.25, cost: SIMPLE_TOWER_COST, shotColor: "#ffe477", bodyColor: "#7b6416", trimColor: "#fff2a8", visual: "flare", talent: "2 цели, -25% урона за прыжок.", description: "Быстрая ранняя цепная магия." }),
  makeTower({ id: "banner", family: "banner", level: 1, tier: "Уровень 1", name: "Башня Знамя", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 3, cooldown: 0.3, baseDamage: 10, auraAttackSpeedBoost: 0.05, cost: SIMPLE_TOWER_COST, shotColor: "#f6d56c", bodyColor: "#7e2f2f", trimColor: "#ffd86f", visual: "banner", talent: "Дает союзникам +5% к скорости атаки.", description: "Стартовая поддержка с собственной атакой." })
];

const ADVANCED_TOWERS = [
  makeTower({ id: "hunter", family: "hunter", level: 2, tier: "Уровень 2", name: "Охотник", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 5, cooldown: 0.3, baseDamage: 18, critChance: 0.15, critMultiplier: 2, shotColor: "#d2bc90", bodyColor: "#705844", trimColor: "#faebc7", visual: "ballista", talent: "15% шанс крита x2.", description: "Быстрый критовый стрелок." }),
  makeTower({ id: "crossbowman", family: "crossbowman", level: 2, tier: "Уровень 2", name: "Арбалетчик", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 5, cooldown: 1.5, baseDamage: 50, shotColor: "#c8a16d", bodyColor: "#5e4b3f", trimColor: "#f0d0a6", visual: "ballista", talent: "Тяжелый одиночный выстрел.", description: "Медленная силовая башня второго уровня." }),
  makeTower({ id: "bombardier", family: "bombardier", level: 2, tier: "Уровень 2", name: "Бомбардир", attributeType: "Сила", attackType: "Физическая по области", pattern: "splash", rangeCells: 4.5, cooldown: 0.8, baseDamage: 35, splashRadiusCells: 1.3, shotColor: "#9aa0a9", bodyColor: "#676f7c", trimColor: "#e3e7ed", visual: "mortar", talent: "Сплэш радиусом 1.3 клетки.", description: "Средний физический сплэш." }),
  makeTower({ id: "ice_pillar", family: "ice_pillar", level: 2, tier: "Уровень 2", name: "Ледяной столб", attributeType: "Интеллект", attackType: "Магическая", pattern: "slow", rangeCells: 3.5, cooldown: 0.9, baseDamage: 30, slowFactor: 0.85, slowDuration: 2, shotColor: "#b9f1ff", bodyColor: "#377ea0", trimColor: "#edfeff", visual: "frost", talent: "Замедление 15% на 2 сек.", description: "Усиленный ледяной контроль." }),
  makeTower({ id: "poison_vine", family: "poison_vine", level: 2, tier: "Уровень 2", name: "Башня Ядовитая лоза", attributeType: "Интеллект", attackType: "Магическая", pattern: "poison", rangeCells: 3.0, cooldown: 0.8, baseDamage: 30, poisonDamage: 10, poisonDuration: 4, shotColor: "#b6ff87", bodyColor: "#4a8d37", trimColor: "#efffc4", visual: "toxin", talent: "Яд 10/сек на 4 сек.", description: "Стабильный дот и магический урон." }),
  makeTower({ id: "discharger", family: "discharger", level: 2, tier: "Уровень 2", name: "Разрядник", attributeType: "Интеллект", attackType: "Магическая цепная", pattern: "chain", rangeCells: 5, cooldown: 0.6, baseDamage: 40, multiTargets: 3, chainFalloff: 0.25, shotColor: "#fff08f", bodyColor: "#8a761c", trimColor: "#fff8bf", visual: "flare", talent: "3 цели, -25% за прыжок.", description: "Средняя цепная магия." }),
  makeTower({ id: "war_drum", family: "war_drum", level: 2, tier: "Уровень 2", name: "Боевой барабан", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 3.5, cooldown: 0.3, baseDamage: 15, auraAttackSpeedBoost: 0.10, shotColor: "#d7c77b", bodyColor: "#6e3d2e", trimColor: "#f4dd84", visual: "banner", talent: "Дает союзникам +10% к скорости атаки.", description: "Средняя саппорт-башня на темп." })
];

const MASTER_TOWERS = [
  makeTower({ id: "sniper", family: "sniper", level: 3, tier: "Уровень 3", name: "Снайпер", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 6, cooldown: 0.8, baseDamage: 60, critChance: 0.10, critMultiplier: 2.2, cost: MASTER_TOWER_COST, shotColor: "#ead8ae", bodyColor: "#80634a", trimColor: "#fff0d0", visual: "ballista", talent: "10% шанс крита x2.2.", description: "Дальняя силовая одиночная башня." }),
  makeTower({ id: "executioner", family: "executioner", level: 3, tier: "Уровень 3", name: "Палач", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 3.5, cooldown: 1.0, baseDamage: 75, percentCurrentHpDamage: 0.10, percentCurrentHpChance: 0.25, cost: MASTER_TOWER_COST, shotColor: "#d79e6a", bodyColor: "#6c4434", trimColor: "#f7cf92", visual: "spike", talent: "25% шанс нанести 10% текущего HP.", description: "Силовой добивающий удар." }),
  makeTower({ id: "multicannon", family: "multicannon", level: 3, tier: "Уровень 3", name: "Многоствольная пушка", attributeType: "Ловкость", attackType: "Физическая", pattern: "multi", rangeCells: 3.5, cooldown: 0.85, baseDamage: 70, multiTargets: 5, cost: MASTER_TOWER_COST, shotColor: "#c8cfd8", bodyColor: "#6f7786", trimColor: "#eef2f7", visual: "mortar", talent: "Стреляет по 5 целям.", description: "Ловкий залп по пачкам." }),
  makeTower({ id: "snow_storm", family: "snow_storm", level: 3, tier: "Уровень 3", name: "Снежная буря", attributeType: "Интеллект", attackType: "Магическая", pattern: "splash", rangeCells: 5, cooldown: 0.9, baseDamage: 50, splashRadiusCells: 1.5, slowFactor: 0.85, slowDuration: 3, cost: MASTER_TOWER_COST, shotColor: "#d8fbff", bodyColor: "#4b8db0", trimColor: "#ffffff", visual: "frost", talent: "Замедление 15% на 3 сек.", description: "Магический сплэш с контролем." }),
  makeTower({ id: "plague_flower", family: "plague_flower", level: 3, tier: "Уровень 3", name: "Чумной цветок", attributeType: "Интеллект", attackType: "Магическая", pattern: "poison", rangeCells: 5, cooldown: 1.2, baseDamage: 60, poisonDamage: 20, poisonDuration: 5, cost: MASTER_TOWER_COST, shotColor: "#d5ffa0", bodyColor: "#4d9c44", trimColor: "#f7ffd7", visual: "toxin", talent: "Яд 20/сек на 5 сек.", description: "Сильный магический дот." }),
  makeTower({ id: "storm_pillar", family: "storm_pillar", level: 3, tier: "Уровень 3", name: "Грозовой столп", attributeType: "Интеллект", attackType: "Магическая цепная", pattern: "chain", rangeCells: 5.5, cooldown: 0.5, baseDamage: 75, multiTargets: 4, chainFalloff: 0.25, cost: MASTER_TOWER_COST, shotColor: "#fff5a6", bodyColor: "#9a8524", trimColor: "#fffbd8", visual: "flare", talent: "4 цели, -25% за прыжок.", description: "Среднепоздняя цепная магия." }),
  makeTower({ id: "power_totem", family: "power_totem", level: 3, tier: "Уровень 3", name: "Тотем силы", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 4, cooldown: 0.3, baseDamage: 25, auraDamageBoost: 0.15, cost: MASTER_TOWER_COST, shotColor: "#f4d983", bodyColor: "#823f36", trimColor: "#ffe7a3", visual: "banner", talent: "Дает союзникам +15% урона.", description: "Поддержка урона с собственной атакой." })
];

const EXPERT_TOWERS = [
  makeTower({ id: "sharpshooter", family: "sharpshooter", level: 4, tier: "Уровень 4", name: "Башня Меткий стрелок", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 6.5, cooldown: 1.4, baseDamage: 220, critChance: 0.25, critMultiplier: 2.5, shotColor: "#f0dfbc", bodyColor: "#8a694d", trimColor: "#fff5db", visual: "ballista", talent: "25% шанс крита x2.5.", description: "Сильный дальний крит." }),
  makeTower({ id: "punisher", family: "punisher", level: 4, tier: "Уровень 4", name: "Каратель", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 5.5, cooldown: 1.1, baseDamage: 260, percentCurrentHpDamage: 0.10, percentCurrentHpChance: 0.25, shotColor: "#e0a368", bodyColor: "#7a4a38", trimColor: "#ffd49a", visual: "spike", talent: "25% шанс нанести 10% текущего HP.", description: "Тяжелый силовой палач." }),
  makeTower({ id: "stardrop", family: "stardrop", level: 4, tier: "Уровень 4", name: "Звездопад", attributeType: "Интеллект", attackType: "Магическая", pattern: "nova", rangeCells: 5.5, cooldown: 0.4, baseDamage: 80, allTargetsChance: 0.40, shotColor: "#ffe9aa", bodyColor: "#7a6dbe", trimColor: "#fff6d0", visual: "flare", talent: "40% шанс задеть всех в радиусе.", description: "Вспышка массовой магии." }),
  makeTower({ id: "absolute_cold", family: "absolute_cold", level: 4, tier: "Уровень 4", name: "Башня Абсолютный холод", attributeType: "Интеллект", attackType: "Магическая по области", pattern: "splash", rangeCells: 5.5, cooldown: 1.0, baseDamage: 100, splashRadiusCells: 1.8, slowFactor: 0.8, slowDuration: 3, freezeChance: 0.10, freezeDuration: 1.0, shotColor: "#ecffff", bodyColor: "#5a9dc0", trimColor: "#ffffff", visual: "frost", talent: "Замедление 20%, заморозка 10%.", description: "Глубокий холод по области." }),
  makeTower({ id: "black_ivy", family: "black_ivy", level: 4, tier: "Уровень 4", name: "Чёрный плющ", attributeType: "Интеллект", attackType: "Магическая", pattern: "poison", rangeCells: 5.5, cooldown: 1.3, baseDamage: 95, poisonDamage: 45, poisonDuration: 5, shotColor: "#dbff9f", bodyColor: "#538e3a", trimColor: "#fbffe3", visual: "toxin", talent: "Яд 45/сек на 5 сек.", description: "Тяжелый одиночный яд." }),
  makeTower({ id: "lightning_lord", family: "lightning_lord", level: 4, tier: "Уровень 4", name: "Молниеносец", attributeType: "Интеллект", attackType: "Магическая цепная", pattern: "chain", rangeCells: 6, cooldown: 0.8, baseDamage: 140, multiTargets: 5, chainFalloff: 0.25, shotColor: "#fff8b9", bodyColor: "#a5912c", trimColor: "#fffde8", visual: "flare", talent: "5 целей, -25% за прыжок.", description: "Мощная цепная магия." }),
  makeTower({ id: "war_banner", family: "war_banner", level: 4, tier: "Уровень 4", name: "Знамя войны", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 4.5, cooldown: 0.3, baseDamage: 30, auraDamageBoost: 0.10, auraAttackSpeedBoost: 0.15, shotColor: "#ffe184", bodyColor: "#8b3232", trimColor: "#ffef9b", visual: "banner", talent: "Урон +10%, скорость +15%.", description: "Сильная комбинированная аура." })
];

const LEGEND_TOWERS = [
  makeTower({ id: "ghost_archer", family: "ghost_archer", level: 5, tier: "Уровень 5", name: "Призрачный стрелок", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 5, cooldown: 0.8, baseDamage: 220, critChance: 0.30, critMultiplier: 3, shotColor: "#f7ecd0", bodyColor: "#8e7152", trimColor: "#ffffff", visual: "ballista", talent: "30% шанс крита x3.", description: "Элитный быстрый стрелок." }),
  makeTower({ id: "titan_slayer", family: "titan_slayer", level: 5, tier: "Уровень 5", name: "Истребитель титанов", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 6, cooldown: 1.2, baseDamage: 380, percentMaxHpDamage: 0.10, percentMaxHpChance: 0.25, shotColor: "#f0b16d", bodyColor: "#7d4c38", trimColor: "#ffd7a5", visual: "spike", talent: "25% шанс нанести 10% макс HP.", description: "Охотник на жирных врагов." }),
  makeTower({ id: "cataclysm", family: "cataclysm", level: 5, tier: "Уровень 5", name: "Катаклизм", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 5, cooldown: 1.0, baseDamage: 360, pulseStunChance: 0.20, pulseStunRadiusCells: 2.5, pulseStunDuration: 0.8, shotColor: "#dbe2ea", bodyColor: "#88919f", trimColor: "#ffffff", visual: "mortar", talent: "20% шанс оглушить вокруг себя.", description: "Тяжелый удар с волной контроля." }),
  makeTower({ id: "ice_throne", family: "ice_throne", level: 5, tier: "Уровень 5", name: "Ледяной трон", attributeType: "Интеллект", attackType: "Магическая по области", pattern: "splash", rangeCells: 4, cooldown: 1.1, baseDamage: 190, splashRadiusCells: 1.5, slowFactor: 0.75, slowDuration: 3, freezeChance: 0.15, freezeDuration: 0.8, shotColor: "#f2ffff", bodyColor: "#62a8cb", trimColor: "#ffffff", visual: "frost", talent: "Замедление 25%, заморозка 15%.", description: "Поздний ледяной сплэш." }),
  makeTower({ id: "plague_lord", family: "plague_lord", level: 5, tier: "Уровень 5", name: "Чумной владыка", attributeType: "Интеллект", attackType: "Магическая", pattern: "poison", rangeCells: 4, cooldown: 1.3, baseDamage: 150, poisonDamage: 60, poisonDuration: 6, poisonSpreadCount: 2, shotColor: "#e6ffad", bodyColor: "#5ea144", trimColor: "#ffffff", visual: "toxin", talent: "Яд 60/сек, 2 доп. цели.", description: "Поздний заразный яд." }),
  makeTower({ id: "sky_storm", family: "sky_storm", level: 5, tier: "Уровень 5", name: "Башня Небесный шторм", attributeType: "Интеллект", attackType: "Магическая цепная", pattern: "chain", rangeCells: 6.5, cooldown: 0.5, baseDamage: 220, multiTargets: 6, chainFalloff: 0.20, magicShredPercent: 0.10, critChance: 0.05, critMultiplier: 2, shotColor: "#fff9cc", bodyColor: "#b29d34", trimColor: "#ffffff", visual: "flare", talent: "6 целей, каждая цель с шансом на двойной урон.", description: "Пиковая цепная молния." }),
  makeTower({ id: "ancient_totem", family: "ancient_totem", level: 5, tier: "Уровень 5", name: "Древний тотем", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 5, cooldown: 0.3, baseDamage: 50, auraDamageBoost: 0.15, auraAttackSpeedBoost: 0.25, shotColor: "#ffeb9a", bodyColor: "#953c3c", trimColor: "#fff3b0", visual: "banner", talent: "Урон +15%, скорость +25%.", description: "Сильнейшая поддержка пятого уровня." })
];

const MYTHIC_TOWERS = [
  makeTower({ id: "soul_reaper", family: "soul_reaper", level: 6, tier: "Уровень 6", name: "ЖНЕЦ ДУШ", attributeType: "Интеллект", attackType: "Магическая", pattern: "single", rangeCells: 6, cooldown: 0.7, baseDamage: 400, executeChance: 0.20, executeThreshold: 0.20, executeNonBossOnly: true, shotColor: "#c7e1ff", bodyColor: "#22364f", trimColor: "#f0f7ff", visual: "flare", talent: "20% шанс добить обычного врага ниже 20% HP.", description: "Точечная магия с казнью ослабленных целей." }),
  makeTower({ id: "heaven_archon", family: "heaven_archon", level: 6, tier: "Уровень 6", name: "НЕБЕСНЫЙ АРХОНТ", attributeType: "Интеллект", attackType: "Магическая по области", pattern: "splash", rangeCells: 6, cooldown: 0.8, baseDamage: 250, splashRadiusCells: 2, beamChance: 0.25, beamMultiplier: 1.5, shotColor: "#fff2b8", bodyColor: "#675d1f", trimColor: "#fff8de", visual: "flare", talent: "25% шанс выпустить световой залп на 1.5x урона всем в радиусе.", description: "Сильный световой сплэш." }),
  makeTower({ id: "time_keeper", family: "time_keeper", level: 6, tier: "Уровень 6", name: "ХРАНИТЕЛЬ ВРЕМЕНИ", attributeType: "Интеллект", attackType: "Магическая", pattern: "single", rangeCells: 5.5, cooldown: 1.5, baseDamage: 850, globalStunChance: 0.20, globalStunDuration: 1.5, shotColor: "#d8f4ff", bodyColor: "#2c6f7d", trimColor: "#ffffff", visual: "frost", talent: "20% шанс оглушить всех врагов в своем радиусе на 1.5 сек.", description: "Редкие, но чудовищно сильные выстрелы." }),
  makeTower({ id: "plague_master", family: "plague_master", level: 6, tier: "Уровень 6", name: "ПОВЕЛИТЕЛЬ ЧУМЫ", attributeType: "Интеллект", attackType: "Магическая", pattern: "poison", rangeCells: 4.5, cooldown: 0.6, baseDamage: 450, poisonDamage: 80, poisonDuration: 4, speedBurstChance: 0.30, speedBurstBoost: 0.80, speedBurstDuration: 3, shotColor: "#d7ff96", bodyColor: "#417d31", trimColor: "#fbffd8", visual: "toxin", talent: "30% шанс ускориться на 80% на 3 сек. Эффект стакается по времени.", description: "Ядовитый бешеный DPS." }),
  makeTower({ id: "thunderer", family: "thunderer", level: 6, tier: "Уровень 6", name: "ГРОМОВЕРЖЕЦ", attributeType: "Интеллект", attackType: "Магическая цепная", pattern: "chain", rangeCells: 6.5, cooldown: 0.6, baseDamage: 440, multiTargets: 7, chainFalloff: 0.20, specialShotEvery: 5, specialShotMultiplier: 2, specialShotStunDuration: 0.6, shotColor: "#fff4a0", bodyColor: "#8f7a16", trimColor: "#fffbd5", visual: "flare", talent: "Каждый 5-й выстрел: двойной урон и стан 0.6 сек.", description: "Стабильная цепь с сильным ритмом проков." }),
  makeTower({ id: "small_but_strong", family: "small_but_strong", level: 6, tier: "Уровень 6", name: "Маленькая, но сильная", attributeType: "Интеллект", attackType: "Магическая", pattern: "single", rangeCells: 5, cooldown: 0.5, baseDamage: 420, mapProcChance: 0.10, mapProcPercentMaxHp: 0.045, shotColor: "#ffd5ef", bodyColor: "#7b3c66", trimColor: "#fff0fb", visual: "flare", talent: "10% шанс задеть всех врагов в радиусе на 4.5% от их макс HP.", description: "Компактная башня с редким массовым взрывом." }),
  makeTower({ id: "archiarcher", family: "archiarcher", level: 6, tier: "Уровень 6", name: "АРХИСТРЕЛОК", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 7, cooldown: 0.5, baseDamage: 190, critChance: 0.25, critMultiplier: 10, shotColor: "#f5e7c8", bodyColor: "#6e553d", trimColor: "#ffffff", visual: "ballista", talent: "25% шанс крита x10.", description: "Запредельные криты на дальнем радиусе." }),
  makeTower({ id: "anglosax", family: "anglosax", level: 6, tier: "Уровень 6", name: "Англосакс", attributeType: "Сила", attackType: "Физическая", pattern: "single", rangeCells: 6, cooldown: 1.2, baseDamage: 1200, cannotKill: true, shotColor: "#ffd08a", bodyColor: "#75411c", trimColor: "#fff1cb", visual: "spike", talent: "Не может убить: оставляет врага на 1 HP.", description: "Колоссальный удар для подготовки добивания." }),
  makeTower({ id: "money_doctor", family: "money_doctor", level: 6, tier: "Уровень 6", name: "Денежный доктор", attributeType: "Ловкость", attackType: "Физическая", pattern: "single", rangeCells: 4.5, cooldown: 0.4, baseDamage: 210, silverSplashChance: 0.30, silverSplashAttrBonus: 10, silverSplashSilverPerTarget: 5, splashTargetsMin: 1, splashTargetsMax: 10, shotColor: "#ffd36b", bodyColor: "#6b5b1f", trimColor: "#fff4bd", visual: "ballista", talent: "30% шанс задеть 1-10 целей и принести серебро.", description: "Экономический стрелок высокого тира." }),
  makeTower({ id: "flame_of_fate", family: "flame_of_fate", level: 6, tier: "Уровень 6", name: "ПЛАМЯ СУДЬБЫ", attributeType: "Интеллект", attackType: "Магическая", pattern: "all", rangeCells: 3.5, cooldown: 0.25, baseDamage: 120, stackingBurnDamage: 40, shotColor: "#ff9d5c", bodyColor: "#8a3f1d", trimColor: "#ffe2b8", visual: "flare", talent: "Бьет всех в радиусе и стакает горение по 40/сек за попадание.", description: "Частый массовый магический обжиг." }),
  makeTower({ id: "shadow_altar", family: "shadow_altar", level: 6, tier: "Уровень 6", name: "ТЕНЕВОЙ АЛТАРЬ", attributeType: "Интеллект", attackType: "Магическая", pattern: "single", rangeCells: 5, cooldown: 0.25, baseDamage: 100, mapProcChance: 0.05, mapProcDamage: 2500, shotColor: "#d9c6ff", bodyColor: "#452d72", trimColor: "#f4eeff", visual: "toxin", talent: "5% шанс нанести 2500 урона дополнительно.", description: "Очень частые удары с редким огромным проком." }),
  makeTower({ id: "colossus", family: "colossus", level: 6, tier: "Уровень 6", name: "КОЛОСС", attributeType: "Сила", attackType: "Физическая по области", pattern: "splash", rangeCells: 4.5, cooldown: 1.6, baseDamage: 600, splashRadiusCells: 3, stunChance: 0.25, stunDuration: 1, shotColor: "#d9d9d9", bodyColor: "#5f5f68", trimColor: "#ffffff", visual: "mortar", talent: "25% шанс оглушить на 1 сек.", description: "Гигантский сплэш с мощным контролем." }),
  makeTower({ id: "heaven_oracle", family: "heaven_oracle", level: 6, tier: "Уровень 6", name: "НЕБЕСНЫЙ ОРАКУЛ", attributeType: "Интеллект", attackType: "Магическая", pattern: "single", rangeCells: 6, cooldown: 0.6, baseDamage: 160, auraCritChanceBoost: 0.15, tripleShotEvery: 3, shotColor: "#fff6bf", bodyColor: "#6f6427", trimColor: "#ffffff", visual: "flare", talent: "Союзникам +15% к шансу крита, каждая 3-я атака x3.", description: "Поддержка критов и ритмичный burst." }),
  makeTower({ id: "devourer", family: "devourer", level: 6, tier: "Уровень 6", name: "ПОГЛОТИТЕЛЬ", attributeType: "Интеллект", attackType: "Магическая", pattern: "single", rangeCells: 5, cooldown: 0.9, baseDamage: 240, killGainDamage: 5, killGainAuraShare: 0.5, auraFlatDamage: 0, auraDamageBoost: 0, rangeCellsAura: 5, shotColor: "#d1fffb", bodyColor: "#2b5c58", trimColor: "#f3ffff", visual: "toxin", talent: "За убийства постоянно растит свой урон и раздает половину прироста аурой.", description: "Снежный ком урона с поддержкой команды." }),
  makeTower({ id: "star_judgment", family: "star_judgment", level: 6, tier: "Уровень 6", name: "ЗВЁЗДНЫЙ СУД", attributeType: "Интеллект", attackType: "Магическая по области", pattern: "splash", rangeCells: 6, cooldown: 0.7, baseDamage: 300, splashRadiusCells: 2.5, mapBlastEvery: 8, mapBlastDamage: 400, mapBlastBossMultiplier: 1.5, shotColor: "#ffdcae", bodyColor: "#6a5772", trimColor: "#fff4dd", visual: "flare", talent: "Каждая 8-я атака наносит 400 урона всем врагам на карте, по боссам +50%.", description: "Поздний глобальный массовый burst." })
];

const TOWER_POOLS = {
  1: SIMPLE_TOWERS,
  2: ADVANCED_TOWERS,
  3: MASTER_TOWERS,
  4: EXPERT_TOWERS,
  5: LEGEND_TOWERS,
  6: MYTHIC_TOWERS
};

const ALL_TOWERS = [...SIMPLE_TOWERS, ...ADVANCED_TOWERS, ...MASTER_TOWERS, ...EXPERT_TOWERS, ...LEGEND_TOWERS, ...MYTHIC_TOWERS];
const TOWER_BY_ID = Object.fromEntries(ALL_TOWERS.map((tower) => [tower.id, tower]));
const START_SILVER = SIMPLE_TOWERS[0].cost * 4;

const MINE_DEF = {
  name: "Шахта",
  yieldNuggets: 1,
  durabilityTurns: 2,
  description: "Каждый раунд приносит 1 золотой самородок. Самородки можно продать через магазин.",
  talent: "Живет 2 раунда, затем рушится."
};

const ENEMIES_PER_WAVE = 20;
const ENEMY_SPEED_CELLS = 1.35;
const SPAWN_INTERVAL = 0.7;
const WAVE_BREAK = 2.0;
const START_LIVES = 20;
const TILE_SPEED = ENEMY_SPEED_CELLS * TILE;
const TOOL_RE_ROLL_COST = 950;
const TOOL_MOVE_COST = 100;
const BOSS_DEFS = [
  { id: "boss1", name: "Босс 1", hp: 5000, armor: 10, magicResist: 0.25, cost: 100, cooldown: 240, maxBuys: 4, rewardMines: 2, castleDamage: 5, color: "#7f1d1d" },
  { id: "boss2", name: "Босс 2", hp: 15000, armor: 15, magicResist: 0.35, cost: 150, cooldown: 240, maxBuys: 4, rewardMines: 4, castleDamage: 5, color: "#7c2d12" },
  { id: "boss3", name: "Босс 3", hp: 25000, armor: 20, magicResist: 0.45, cost: 220, cooldown: 240, maxBuys: 4, rewardMines: 8, castleDamage: 5, color: "#4c1d95" }
];
const TOWER_SELL_VALUES = { 1: 75, 2: 170, 3: 340, 4: 680, 5: 1360, 6: 2720 };
const INVENTORY_SLOT_COUNT = 9;
const ITEM_DEFS = {
  mystery_bag: {
    id: "mystery_bag",
    name: "Таинственный мешок",
    short: "Мш",
    description: "Редкий мешок с одной из трех наград на выбор."
  }
};

const state = {
  mode: "running",
  wave: 1,
  endlessMode: false,
  extraWave: 0,
  extraKills: 0,
  waveActive: false,
  intermission: 0,
  waveSpawned: 0,
  waveKilled: 0,
  waveEscaped: 0,
  spawnTimer: 0,
  enemies: [],
  towers: [],
  shots: [],
  lives: START_LIVES,
  silver: START_SILVER,
  goldNuggets: 0,
  currentNuggetPrice: randInt(52, 102),
  mineStock: 2,
  buildMode: "simple",
  towerBuildMode: "simple",
  buildPickerOpen: false,
  shopOpen: false,
  toolsOpen: false,
  paused: false,
  pausePanel: "settings",
  started: false,
  startCountdown: 0,
  globalDamageBoost: 0,
  nuggetSaleBonus: 0,
  moveMode: false,
  selectedCell: null,
  selectedEnemyId: null,
  selectedAuraSourceId: null,
  selectedShopItem: "boss1",
  selectedToolAction: null,
  damagePanelOpen: false,
  inventory: Array.from({ length: INVENTORY_SLOT_COUNT }, () => null),
  selectedItemSlot: null,
  itemMenuOpen: false,
  pendingBagTowerDef: null,
  bagPlacementHint: "",
  towerAnnouncement: null,
  infoScroll: 0,
  infoScrollMax: 0,
  bossShop: Object.fromEntries(BOSS_DEFS.map((boss) => [boss.id, { bought: 0, nextReadyAt: 0 }])),
  lastMineIncome: 0,
  lastMineYield: 0,
  lastNuggetValues: [],
  lastRoll: null,
  lastWaveTopDamage: [],
  lastWaveRecorded: 0,
  totalKills: 0,
  nickname: "",
  bestWave: 1,
  leaderboard: [],
  nextEnemyId: 1,
  time: 0,
  hoveredSlot: null,
  camera: { zoom: 1, panX: 0, panY: 0 }
};

const pointerState = {
  pointers: new Map(),
  panPointerId: null,
  tapPointerId: null,
  infoPointerId: null,
  lastInfoY: 0,
  infoMoved: false,
  pinchDistance: 0,
  lastX: 0,
  lastY: 0,
  moved: false,
  board: false
};

function isRoad(c, r) {
  return GRID_MAP[r]?.[c] === "R";
}

function isBuildCell(c, r) {
  return GRID_MAP[r]?.[c] === "G";
}

function cellToPixel(c, r) {
  return {
    x: BOARD_X + c * TILE,
    y: BOARD_Y + r * TILE
  };
}

function cellCenter(c, r) {
  const p = cellToPixel(c, r);
  return { x: p.x + TILE / 2, y: p.y + TILE / 2 };
}

function buildExpandedPath(turns) {
  const cells = [];
  for (let i = 0; i < turns.length - 1; i += 1) {
    const a = turns[i];
    const b = turns[i + 1];
    const dc = Math.sign(b.c - a.c);
    const dr = Math.sign(b.r - a.r);
    let c = a.c;
    let r = a.r;
    if (!cells.length) cells.push({ c, r });
    while (c !== b.c || r !== b.r) {
      c += dc;
      r += dr;
      cells.push({ c, r });
    }
  }
  return cells;
}

const PATH_CELLS = buildExpandedPath(PATH_TURNS);
const PATH_POINTS = PATH_CELLS.map((cell) => cellCenter(cell.c, cell.r));

function getWaveStats(wave) {
  if (wave <= 5) {
    return {
      hp: 90 + (wave - 1) * 32,
      armor: 4 + Math.floor((wave - 1) * 1.6)
    };
  }
  return {
    hp: 90 + 4 * 32 + (wave - 5) * 56,
    armor: 4 + Math.floor(4 * 1.6) + Math.floor((wave - 5) * 2.6)
  };
}

function getWaveMagicResist(wave) {
  if (wave >= 25) return 0.45;
  if (wave >= 20) return 0.40;
  if (wave >= 15) return 0.35;
  if (wave >= 10) return 0.30;
  if (wave >= 5) return 0.25;
  return 0.20;
}

function getNuggetPriceRange(wave) {
  const min = Math.min(160, 50 + wave * 2);
  const max = Math.min(160, 100 + wave * 2);
  return {
    min,
    max: Math.max(min, max)
  };
}

function ensureNickname(force = false) {
  const existing = state.nickname || loadStoredNickname();
  if (existing && !force) {
    state.nickname = existing;
    return existing;
  }
  const next = window.prompt("Введите никнейм для игры", existing || "Player");
  const trimmed = (next || "").trim().slice(0, 20);
  if (!trimmed) {
    if (existing && force) {
      state.nickname = existing;
      return existing;
    }
    return "";
  }
  state.nickname = trimmed;
  storeNickname(trimmed);
  syncLeaderboardEntry();
  return trimmed;
}

function rollCurrentNuggetPrice() {
  const range = getNuggetPriceRange(state.wave);
  state.currentNuggetPrice = randInt(range.min, range.max);
}

function randInt(min, max) {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function loadStoredNickname() {
  try {
    return window.localStorage.getItem(NICK_STORAGE_KEY) || "";
  } catch {
    return "";
  }
}

function storeNickname(nickname) {
  try {
    window.localStorage.setItem(NICK_STORAGE_KEY, nickname);
  } catch {}
}

function loadBestWave() {
  try {
    const raw = Number(window.localStorage.getItem(BEST_WAVE_STORAGE_KEY) || "1");
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  } catch {
    return 1;
  }
}

function storeBestWave(bestWave) {
  try {
    window.localStorage.setItem(BEST_WAVE_STORAGE_KEY, String(bestWave));
  } catch {}
}

function loadLeaderboard() {
  try {
    const raw = window.localStorage.getItem(LEADERBOARD_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((entry) => entry && typeof entry.name === "string" && Number.isFinite(Number(entry.bestWave)))
      .map((entry) => ({
        name: String(entry.name).slice(0, 20),
        bestWave: Math.max(1, Number(entry.bestWave) || 1),
        bestExtraKills: Math.max(0, Number(entry.bestExtraKills) || 0),
        updatedAt: Number(entry.updatedAt) || 0
      }))
      .sort((a, b) => b.bestExtraKills - a.bestExtraKills || b.bestWave - a.bestWave || b.updatedAt - a.updatedAt)
      .slice(0, 10);
  } catch {
    return [];
  }
}

function storeLeaderboard(entries) {
  try {
    window.localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(entries.slice(0, 10)));
  } catch {}
}

function syncLeaderboardEntry() {
  const name = (state.nickname || "").trim();
  if (!name) return;
  const entries = loadLeaderboard();
  const existing = entries.find((entry) => entry.name === name);
  if (existing) {
    existing.bestWave = Math.max(existing.bestWave, state.bestWave);
    existing.bestExtraKills = Math.max(existing.bestExtraKills || 0, state.extraKills || 0);
    existing.updatedAt = Date.now();
  } else {
    entries.push({
      name,
      bestWave: state.bestWave,
      bestExtraKills: state.extraKills || 0,
      updatedAt: Date.now()
    });
  }
  entries.sort((a, b) => b.bestExtraKills - a.bestExtraKills || b.bestWave - a.bestWave || b.updatedAt - a.updatedAt);
  state.leaderboard = entries.slice(0, 10);
  storeLeaderboard(state.leaderboard);
}

function rollRandomFrom(list) {
  return list[randInt(0, list.length - 1)];
}

function rollRandomDifferent(list, excludeId) {
  if (list.length <= 1) return list[0];
  let picked = rollRandomFrom(list);
  for (let i = 0; i < 6 && picked.id === excludeId; i += 1) {
    picked = rollRandomFrom(list);
  }
  return picked.id === excludeId ? list.find((item) => item.id !== excludeId) || picked : picked;
}

function getPoolForBuildMode(mode) {
  if (mode === "simple") return SIMPLE_TOWERS;
  if (mode === "master") return EXPERT_TOWERS;
  return null;
}

function getPoolForLevel(level) {
  return TOWER_POOLS[level] || null;
}

function getNextTierPool(level) {
  return TOWER_POOLS[level + 1] || null;
}

function clampCamera() {
  const scaledW = BOARD_W * state.camera.zoom;
  const scaledH = BOARD_H * state.camera.zoom;
  const minPanX = Math.min(0, BOARD_W - scaledW);
  const minPanY = Math.min(0, BOARD_H - scaledH);
  state.camera.panX = Math.min(0, Math.max(minPanX, state.camera.panX));
  state.camera.panY = Math.min(0, Math.max(minPanY, state.camera.panY));
}

function zoomCamera(multiplier) {
  zoomCameraAt(multiplier, { x: BOARD_X + BOARD_W / 2, y: BOARD_Y + BOARD_H / 2 });
}

function zoomCameraAt(multiplier, focusPoint) {
  const prevZoom = state.camera.zoom;
  const nextZoom = Math.min(2.4, Math.max(1, prevZoom * multiplier));
  if (Math.abs(nextZoom - prevZoom) < 0.001) return;
  const centerX = focusPoint?.x ?? BOARD_X + BOARD_W / 2;
  const centerY = focusPoint?.y ?? BOARD_Y + BOARD_H / 2;
  const worldX = BOARD_X + (centerX - BOARD_X - state.camera.panX) / prevZoom;
  const worldY = BOARD_Y + (centerY - BOARD_Y - state.camera.panY) / prevZoom;
  state.camera.zoom = nextZoom;
  state.camera.panX = centerX - BOARD_X - (worldX - BOARD_X) * nextZoom;
  state.camera.panY = centerY - BOARD_Y - (worldY - BOARD_Y) * nextZoom;
  clampCamera();
}

function applyBoardCamera() {
  ctx.translate(BOARD_X + state.camera.panX, BOARD_Y + state.camera.panY);
  ctx.scale(state.camera.zoom, state.camera.zoom);
  ctx.translate(-BOARD_X, -BOARD_Y);
}

function screenToWorld(point) {
  return {
    x: BOARD_X + (point.x - BOARD_X - state.camera.panX) / state.camera.zoom,
    y: BOARD_Y + (point.y - BOARD_Y - state.camera.panY) / state.camera.zoom
  };
}

function worldToScreen(x, y) {
  return {
    x: BOARD_X + state.camera.panX + (x - BOARD_X) * state.camera.zoom,
    y: BOARD_Y + state.camera.panY + (y - BOARD_Y) * state.camera.zoom
  };
}

function createTower(cellC, cellR, towerDef) {
  const base = cellToPixel(cellC, cellR);
  const x = base.x + TILE * 0.5;
  const y = base.y + TILE * 0.5;
  return {
    kind: "tower",
    cellC,
    cellR,
    x,
    y,
    towerId: towerDef.id,
    family: towerDef.family,
    level: towerDef.level,
    tier: towerDef.tier,
    name: towerDef.name,
    attributeType: towerDef.attributeType,
    attributeLevel: towerDef.attributeLevel || 1,
    attackType: towerDef.attackType,
    pattern: towerDef.pattern,
    cost: towerDef.cost,
    range: towerDef.rangeCells * TILE,
    rangeCells: towerDef.rangeCells,
    auraRange: (towerDef.rangeCellsAura || towerDef.rangeCells) * TILE,
    rangeCellsAura: towerDef.rangeCellsAura || towerDef.rangeCells,
    cooldown: towerDef.cooldown,
    nextShotAt: 0,
    damage: towerDef.baseDamage,
    critChance: towerDef.critChance,
    critMultiplier: towerDef.critMultiplier || 2,
    multiTargets: towerDef.multiTargets || 1,
    chainFalloff: towerDef.chainFalloff || 0,
    splashRadius: (towerDef.splashRadiusCells || 0) * TILE,
    auraDamageBoost: towerDef.auraDamageBoost || 0,
    auraFlatDamage: towerDef.auraFlatDamage || 0,
    auraAttackSpeedBoost: towerDef.auraAttackSpeedBoost || 0,
    auraCritChanceBoost: towerDef.auraCritChanceBoost || 0,
    burnDamage: towerDef.burnDamage || 0,
    burnDuration: towerDef.burnDuration || 0,
    poisonDamage: towerDef.poisonDamage || 0,
    poisonDuration: towerDef.poisonDuration || 0,
    poisonSpreadCount: towerDef.poisonSpreadCount || 0,
    slowFactor: towerDef.slowFactor || 1,
    slowDuration: towerDef.slowDuration || 0,
    armorPenPercent: towerDef.armorPenPercent || 0,
    armorBreakFlat: towerDef.armorBreakFlat || 0,
    armorBreakDuration: towerDef.armorBreakDuration || 0,
    percentCurrentHpDamage: towerDef.percentCurrentHpDamage || 0,
    percentMaxHpDamage: towerDef.percentMaxHpDamage || 0,
    percentCurrentHpChance: towerDef.percentCurrentHpChance || 0,
    percentMaxHpChance: towerDef.percentMaxHpChance || 0,
    stunChance: towerDef.stunChance || 0,
    stunDuration: towerDef.stunDuration || 0,
    freezeChance: towerDef.freezeChance || 0,
    freezeDuration: towerDef.freezeDuration || 0,
    magicShredPercent: towerDef.magicShredPercent || 0,
    allTargetsChance: towerDef.allTargetsChance || 0,
    pulseStunChance: towerDef.pulseStunChance || 0,
    pulseStunRadiusCells: towerDef.pulseStunRadiusCells || 0,
    pulseStunDuration: towerDef.pulseStunDuration || 0,
    executeChance: towerDef.executeChance || 0,
    executeThreshold: towerDef.executeThreshold || 0,
    executeNonBossOnly: !!towerDef.executeNonBossOnly,
    beamChance: towerDef.beamChance || 0,
    beamMultiplier: towerDef.beamMultiplier || 1,
    globalStunChance: towerDef.globalStunChance || 0,
    globalStunDuration: towerDef.globalStunDuration || 0,
    speedBurstChance: towerDef.speedBurstChance || 0,
    speedBurstBoost: towerDef.speedBurstBoost || 0,
    speedBurstDuration: towerDef.speedBurstDuration || 0,
    speedBurstUntil: 0,
    specialShotEvery: towerDef.specialShotEvery || 0,
    specialShotMultiplier: towerDef.specialShotMultiplier || 1,
    specialShotStunDuration: towerDef.specialShotStunDuration || 0,
    mapProcChance: towerDef.mapProcChance || 0,
    mapProcDamage: towerDef.mapProcDamage || 0,
    mapProcPercentMaxHp: towerDef.mapProcPercentMaxHp || 0,
    mapBlastEvery: towerDef.mapBlastEvery || 0,
    mapBlastDamage: towerDef.mapBlastDamage || 0,
    mapBlastBossMultiplier: towerDef.mapBlastBossMultiplier || 1,
    cannotKill: !!towerDef.canKill ? false : !!towerDef.cannotKill,
    silverSplashChance: towerDef.silverSplashChance || 0,
    silverSplashAttrBonus: towerDef.silverSplashAttrBonus || 0,
    silverSplashSilverPerTarget: towerDef.silverSplashSilverPerTarget || 0,
    splashTargetsMin: towerDef.splashTargetsMin || 1,
    splashTargetsMax: towerDef.splashTargetsMax || 1,
    tripleShotEvery: towerDef.tripleShotEvery || 0,
    killGainDamage: towerDef.killGainDamage || 0,
    killGainAuraShare: towerDef.killGainAuraShare || 0,
    stackingBurnDamage: towerDef.stackingBurnDamage || 0,
    permanentBonusDamage: 0,
    attackCounter: 0,
    shotColor: towerDef.shotColor,
    shotWidth: towerDef.shotWidth,
    bodyColor: towerDef.bodyColor,
    trimColor: towerDef.trimColor,
    visual: towerDef.visual,
    talent: towerDef.talent,
    description: towerDef.description,
    waveDamage: 0
  };
}

function createMine(cellC, cellR) {
  const base = cellToPixel(cellC, cellR);
  return {
    kind: "mine",
    cellC,
    cellR,
    x: base.x + TILE * 0.5,
    y: base.y + TILE * 0.5,
    name: MINE_DEF.name,
    yieldNuggets: MINE_DEF.yieldNuggets,
    remainingTurns: MINE_DEF.durabilityTurns,
    description: MINE_DEF.description,
    talent: MINE_DEF.talent
  };
}

function syncStructurePosition(structure) {
  const base = cellToPixel(structure.cellC, structure.cellR);
  structure.x = base.x + TILE * 0.5;
  structure.y = base.y + TILE * 0.5;
}

function getStructureAt(cellC, cellR) {
  return state.towers.find((tower) => tower.cellC === cellC && tower.cellR === cellR) || null;
}

function getSelectedStructure() {
  if (!state.selectedCell) return null;
  const selected = getStructureAt(state.selectedCell.c, state.selectedCell.r);
  if (!selected) state.selectedAuraSourceId = null;
  return selected;
}

function getSelectedEnemy() {
  if (!state.selectedEnemyId) return null;
  return state.enemies.find((enemy) => enemy.id === state.selectedEnemyId) || null;
}

function isMagicTower(tower) {
  return tower.attackType.includes("Магическая");
}

function getAttributeExtra(tower, attributeType) {
  if (!tower || tower.attributeType !== attributeType) return 0;
  return Math.max(0, (tower.attributeLevel || 1) - 1);
}

function getTowerStrengthBonus(tower) {
  return getAttributeExtra(tower, "Сила") * 0.02;
}

function getTowerAgilityBonus(tower) {
  return getAttributeExtra(tower, "Ловкость") * 0.02;
}

function getTowerIntellectBonus(tower) {
  return getAttributeExtra(tower, "Интеллект") * 0.02;
}

function auraTouchesTowerCell(sourceTower, targetTower) {
  if (!sourceTower || !targetTower || sourceTower === targetTower) return false;
  const base = cellToPixel(targetTower.cellC, targetTower.cellR);
  const rectLeft = base.x;
  const rectTop = base.y;
  const rectRight = base.x + TILE;
  const rectBottom = base.y + TILE;
  const radius = sourceTower.auraRange || sourceTower.range || 0;

  const closestX = Math.max(rectLeft, Math.min(sourceTower.x, rectRight));
  const closestY = Math.max(rectTop, Math.min(sourceTower.y, rectBottom));
  const dx = sourceTower.x - closestX;
  const dy = sourceTower.y - closestY;
  return dx * dx + dy * dy <= radius * radius;
}

function getAppliedAuras(tower) {
  if (!tower || tower.kind !== "tower") return [];
  const applied = [];
  for (const ally of state.towers) {
    if (
      ally === tower ||
      ally.kind !== "tower" ||
      (!ally.auraDamageBoost && !ally.auraAttackSpeedBoost && !ally.auraFlatDamage && !ally.auraCritChanceBoost)
    ) {
      continue;
    }
    if (!auraTouchesTowerCell(ally, tower)) continue;
    const parts = [];
    if (ally.auraDamageBoost) parts.push(`Урон +${Math.round(ally.auraDamageBoost * 100)}%`);
    if (ally.auraFlatDamage) parts.push(`Урон +${Math.round(ally.auraFlatDamage)}`);
    if (ally.auraAttackSpeedBoost) parts.push(`Скорость +${Math.round(ally.auraAttackSpeedBoost * 100)}%`);
    if (ally.auraCritChanceBoost) parts.push(`Крит +${Math.round(ally.auraCritChanceBoost * 100)}%`);
    applied.push({
      sourceId: ally.towerId,
      sourceName: ally.name,
      sourceTier: ally.tier,
      damageBoost: ally.auraDamageBoost,
      flatDamage: ally.auraFlatDamage,
      speedBoost: ally.auraAttackSpeedBoost,
      critChanceBoost: ally.auraCritChanceBoost,
      summary: parts.join(", ") || "Аура поддержки"
    });
  }
  return applied;
}

function clearMenus() {
  state.buildPickerOpen = false;
  state.shopOpen = false;
  state.toolsOpen = false;
  state.itemMenuOpen = false;
}

function spawnEnemy() {
  const progressionWave = state.endlessMode ? 30 + state.extraWave + 1 : state.wave;
  const stats = getWaveStats(progressionWave);
  const spawnIndex = state.waveSpawned + 1;
  const isBonus = !state.endlessMode && spawnIndex === 3;
  state.enemies.push(
    createEnemy({
      hp: stats.hp,
      armor: stats.armor,
      magicResist: getWaveMagicResist(progressionWave),
      isBonus,
      rewardSilver: isBonus ? 75 + Math.min(30, progressionWave) * 2 : Math.min(30, progressionWave)
    })
  );
  state.waveSpawned += 1;
  if (state.endlessMode) {
    state.extraWave += 1;
  }
}

function pointLerp(a, b, t) {
  return { x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t };
}

function segLength(a, b) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function enemyPixel(enemy) {
  const a = PATH_POINTS[Math.min(enemy.segment, PATH_POINTS.length - 1)];
  const b = PATH_POINTS[Math.min(enemy.segment + 1, PATH_POINTS.length - 1)];
  return pointLerp(a, b, enemy.t);
}

function removeEnemyById(id) {
  const idx = state.enemies.findIndex((enemy) => enemy.id === id);
  if (idx >= 0) state.enemies.splice(idx, 1);
}

function createEnemy(spec) {
  return {
    id: state.nextEnemyId++,
    hp: spec.hp,
    maxHp: spec.hp,
    armor: spec.armor,
    magicResist: spec.magicResist,
    isBonus: !!spec.isBonus,
    isBoss: !!spec.isBoss,
    bossId: spec.bossId || null,
    rewardSilver: spec.rewardSilver || 0,
    rewardMines: spec.rewardMines || 0,
    castleDamage: spec.castleDamage || 1,
    color: spec.color || null,
    name: spec.name || null,
    segment: 0,
    t: 0,
    slowFactor: 1,
    slowUntil: 0,
    stunUntil: 0,
    armorBreakFlat: 0,
    armorBreakUntil: 0,
    armorDebuffPercent: 0,
    armorDebuffUntil: 0,
    magicResistDebuffPercent: 0,
    magicResistDebuffUntil: 0,
    burnTickTimer: 0.5,
    burnDamage: 0,
    burnUntil: 0,
    poisonTickTimer: 0.5,
    poisonDamage: 0,
    poisonUntil: 0,
    dead: false
  };
}

function killEnemy(enemy, killer = null) {
  if (!enemy || enemy.dead) return;
  enemy.dead = true;
  if (state.selectedEnemyId === enemy.id) state.selectedEnemyId = null;
  removeEnemyById(enemy.id);
  if (!enemy.isBoss) {
    state.waveKilled += 1;
    if (state.endlessMode) {
      state.extraKills += 1;
      syncLeaderboardEntry();
    }
  }
  state.totalKills += 1;
  state.silver += enemy.rewardSilver;
  state.mineStock += enemy.rewardMines || 0;
  if (killer && killer.killGainDamage) {
    killer.permanentBonusDamage += killer.killGainDamage;
    killer.auraFlatDamage = killer.permanentBonusDamage * killer.killGainAuraShare;
  }
}

function processMinesForWaveStart() {
  let nuggets = 0;
  const nuggetValues = [];

  for (let i = state.towers.length - 1; i >= 0; i -= 1) {
    const structure = state.towers[i];
    if (structure.kind !== "mine") continue;

    for (let j = 0; j < structure.yieldNuggets; j += 1) {
      nuggets += 1;
      nuggetValues.push(state.currentNuggetPrice);
    }

    structure.remainingTurns -= 1;
    if (structure.remainingTurns <= 0) {
      state.towers.splice(i, 1);
      if (state.selectedCell && state.selectedCell.c === structure.cellC && state.selectedCell.r === structure.cellR) {
        state.selectedCell = null;
      }
    }
  }

  state.lastMineYield = nuggets;
  state.lastMineIncome = 0;
  state.lastNuggetValues = nuggetValues;
  state.goldNuggets += nuggets;
}

function sellNuggets() {
  if (state.goldNuggets <= 0) return 0;
  const sold = Math.min(5, state.goldNuggets);
  const salePrice = getAdjustedNuggetPrice();
  const income = sold * salePrice;
  state.goldNuggets -= sold;
  state.silver += income;
  state.lastMineIncome = income;
  state.lastNuggetValues = Array.from({ length: sold }, () => salePrice);
  return sold;
}

function getAdjustedNuggetPrice() {
  return Math.round(state.currentNuggetPrice * (1 + state.nuggetSaleBonus));
}

function addItemToInventory(itemId) {
  const slotIndex = state.inventory.findIndex((slot) => slot === null);
  if (slotIndex < 0) return false;
  state.inventory[slotIndex] = { itemId };
  return true;
}

function maybeAwardMysteryBag(nextWave) {
  if (nextWave <= 0 || nextWave % 5 !== 0) return;
  addItemToInventory("mystery_bag");
}

function getEmptyBuildCells() {
  const cells = [];
  for (let r = 0; r < GRID_ROWS; r += 1) {
    for (let c = 0; c < GRID_COLS; c += 1) {
      if (isBuildCell(c, r) && !getStructureAt(c, r)) cells.push({ c, r });
    }
  }
  return cells;
}

function rollMysteryBagTowerLevel() {
  const entries = [
    { level: 4, weight: 85 },
    { level: 3, weight: 15 },
    { level: 5, weight: 8 },
    { level: 6, weight: 2 }
  ];
  const total = entries.reduce((sum, item) => sum + item.weight, 0);
  let roll = Math.random() * total;
  for (const entry of entries) {
    if (roll < entry.weight) return entry.level;
    roll -= entry.weight;
  }
  return 4;
}

function getTowerAnnouncementColor(level) {
  if (level === 3) return "#75d9ff";
  if (level === 4) return "#b97dff";
  if (level === 5) return "#ffd86b";
  if (level === 6) return "#5aa6ff";
  return "#ffffff";
}

function showTowerAnnouncement(level) {
  state.towerAnnouncement = {
    text: `Появилась башня ${level} уровня`,
    color: getTowerAnnouncementColor(level),
    until: state.time + 3
  };
}

function grantRandomTowerFromBag() {
  const openCells = getEmptyBuildCells();
  if (!openCells.length) return false;
  const level = rollMysteryBagTowerLevel();
  const pool = getPoolForLevel(level);
  if (!pool?.length) return false;
  state.pendingBagTowerDef = rollRandomFrom(pool);
  state.bagPlacementHint = "Установите башню";
  return true;
}

function placePendingBagTower(slot) {
  if (!state.pendingBagTowerDef) return false;
  const tower = createTower(slot.c, slot.r, state.pendingBagTowerDef);
  state.towers.push(tower);
  state.lastRoll = `${tower.name} (${tower.tier}) • мешок`;
  state.selectedCell = { c: tower.cellC, r: tower.cellR };
  state.selectedEnemyId = null;
  state.selectedAuraSourceId = null;
  state.infoScroll = 0;
  showTowerAnnouncement(tower.level);
  state.pendingBagTowerDef = null;
  state.bagPlacementHint = "";
  return true;
}

function consumeInventoryItem(slotIndex) {
  if (slotIndex < 0 || slotIndex >= state.inventory.length) return;
  state.inventory[slotIndex] = null;
  state.selectedItemSlot = null;
  state.itemMenuOpen = false;
}

function activateMysteryBagChoice(choiceId) {
  const slotIndex = state.selectedItemSlot;
  if (slotIndex == null || state.inventory[slotIndex]?.itemId !== "mystery_bag") return false;

  let consumed = false;
  if (choiceId === "bag_tower") {
    consumed = grantRandomTowerFromBag();
  } else if (choiceId === "bag_damage") {
    state.globalDamageBoost += 0.2;
    consumed = true;
  } else if (choiceId === "bag_nuggets") {
    state.nuggetSaleBonus += 0.3;
    consumed = true;
  }

  if (consumed) consumeInventoryItem(slotIndex);
  return consumed;
}

function removeStructure(structure) {
  const idx = state.towers.findIndex(
    (tower) => tower.cellC === structure.cellC && tower.cellR === structure.cellR && tower.kind === structure.kind
  );
  if (idx >= 0) state.towers.splice(idx, 1);
}

function getTowerSellValue(level) {
  return TOWER_SELL_VALUES[level] || 0;
}

function sellTower(tower) {
  if (!tower || tower.kind !== "tower") return false;
  state.silver += getTowerSellValue(tower.level);
  removeStructure(tower);
  state.selectedCell = null;
  state.moveMode = false;
  state.selectedToolAction = null;
  return true;
}

function getBossShopStatus(bossId) {
  return state.bossShop[bossId] || null;
}

function getBossCooldownLeft(bossId) {
  const status = getBossShopStatus(bossId);
  if (!status) return 0;
  return Math.max(0, status.nextReadyAt - state.time);
}

function canBuyBoss(def) {
  const status = getBossShopStatus(def.id);
  if (!status) return false;
  if (status.bought >= def.maxBuys) return false;
  if (getBossCooldownLeft(def.id) > 0) return false;
  if (state.silver < def.cost) return false;
  return true;
}

function buyBoss(def) {
  if (!canBuyBoss(def)) return false;
  const status = getBossShopStatus(def.id);
  state.silver -= def.cost;
  status.bought += 1;
  status.nextReadyAt = state.time + def.cooldown;
  state.enemies.push(
    createEnemy({
      hp: def.hp,
      armor: def.armor,
      magicResist: def.magicResist,
      isBoss: true,
      bossId: def.id,
      rewardMines: def.rewardMines,
      castleDamage: def.castleDamage,
      color: def.color,
      name: def.name
    })
  );
  return true;
}

function addTowerDamage(tower, damage) {
  if (!tower || tower.kind !== "tower" || !Number.isFinite(damage)) return;
  tower.waveDamage = (tower.waveDamage || 0) + damage;
}

function resetWaveDamage() {
  for (const tower of state.towers) {
    if (tower.kind === "tower") tower.waveDamage = 0;
  }
}

function getTopDamageEntries(limit = 5) {
  return state.towers
    .filter((tower) => tower.kind === "tower")
    .map((tower) => ({
      name: tower.name,
      tier: tower.tier,
      damage: Math.round(tower.waveDamage || 0)
    }))
    .sort((a, b) => b.damage - a.damage)
    .slice(0, limit);
}

function getDisplayedTopDamageEntries() {
  return state.waveActive ? getTopDamageEntries(5) : state.lastWaveTopDamage;
}

function getSortedTargetsInRange(tower) {
  return state.enemies
    .filter((enemy) => !enemy.dead)
    .map((enemy) => {
      const pos = enemyPixel(enemy);
      const dist = Math.hypot(pos.x - tower.x, pos.y - tower.y);
      return { enemy, pos, dist };
    })
    .filter((entry) => entry.dist <= tower.range)
    .sort((a, b) => a.dist - b.dist);
}

function addShot(fromX, fromY, toX, toY, color, width, crit) {
  state.shots.push({
    fromX,
    fromY,
    toX,
    toY,
    ttl: 0.12,
    crit,
    color,
    width
  });
}

function dealTowerHit(enemy, tower, baseDamageOverride, options = {}) {
  if (!enemy || enemy.dead) return false;
  const critChance = Math.max(0, Math.min(1, (tower.critChance || 0) + (options.critChanceBonus || 0)));
  const crit = Math.random() < critChance;
  const baseDamage = baseDamageOverride ?? tower.damage;
  const currentHpBonus =
    tower.percentCurrentHpDamage > 0 &&
    (!tower.percentCurrentHpChance || Math.random() < tower.percentCurrentHpChance)
      ? enemy.hp * tower.percentCurrentHpDamage
      : 0;
  const maxHpBonus =
    tower.percentMaxHpDamage > 0 &&
    (!tower.percentMaxHpChance || Math.random() < tower.percentMaxHpChance)
      ? enemy.maxHp * tower.percentMaxHpDamage
      : 0;
  const hpBonus = currentHpBonus + maxHpBonus;
  const raw = (baseDamage + hpBonus) * (crit ? tower.critMultiplier : 1);
  const magical =
    tower.attackType.includes("Магическая") ||
    tower.pattern === "chain" ||
    tower.pattern === "slow" ||
    tower.pattern === "poison" ||
    tower.pattern === "nova";
  let dealt = 0;
  if (magical) {
    const effectiveMagicResist = Math.max(0, enemy.magicResist - enemy.magicResistDebuffPercent);
    dealt = Math.max(1, raw * (1 - effectiveMagicResist));
  } else {
    const effectiveArmor =
      enemy.armor * (1 - tower.armorPenPercent) * (1 - enemy.armorDebuffPercent) - enemy.armorBreakFlat;
    const armorMultiplier = 1 - (0.06 * effectiveArmor) / (1 + 0.06 * Math.abs(effectiveArmor));
    dealt = Math.max(1, raw * armorMultiplier);
  }
  if (tower.executeChance && Math.random() < tower.executeChance) {
    const thresholdHp = enemy.maxHp * tower.executeThreshold;
    if (enemy.hp <= thresholdHp && (!tower.executeNonBossOnly || !enemy.isBoss)) {
      dealt = enemy.hp;
    }
  }
  if (tower.cannotKill && dealt >= enemy.hp) {
    dealt = Math.max(0, enemy.hp - 1);
  }
  enemy.hp -= dealt;
  addTowerDamage(tower, dealt);
  applyArmorBreak(enemy, tower);
  applyMagicShred(enemy, tower);
  if (tower.stunChance && Math.random() < tower.stunChance) applyStun(enemy, tower.stunDuration);
  if (tower.freezeChance && Math.random() < tower.freezeChance) applyStun(enemy, tower.freezeDuration);
  if (enemy.hp <= 0) {
    killEnemy(enemy, tower);
  }
  return crit;
}

function applyBurn(enemy, tower) {
  if ((!tower.burnDamage && !tower.stackingBurnDamage) || enemy.dead) return;
  const burnValue = (tower.burnDamage || 0) + (tower.stackingBurnDamage || 0);
  const scaledBurn = burnValue * getTowerAbilityMultiplier(tower);
  if (tower.stackingBurnDamage) {
    enemy.burnDamage += scaledBurn;
  } else {
    enemy.burnDamage = Math.max(enemy.burnDamage, scaledBurn);
  }
  enemy.burnUntil = Math.max(enemy.burnUntil, state.time + tower.burnDuration);
  enemy.burnTickTimer = Math.min(enemy.burnTickTimer, 0.5);
}

function applyPoison(enemy, tower) {
  if (!tower.poisonDamage || enemy.dead) return;
  const scaledPoison = tower.poisonDamage * getTowerAbilityMultiplier(tower);
  enemy.poisonDamage = Math.max(enemy.poisonDamage, scaledPoison);
  enemy.poisonUntil = Math.max(enemy.poisonUntil, state.time + tower.poisonDuration);
  enemy.poisonTickTimer = Math.min(enemy.poisonTickTimer, 0.5);
}

function applySlow(enemy, tower) {
  if (!tower.slowDuration || enemy.dead) return;
  enemy.slowFactor = Math.min(enemy.slowFactor, tower.slowFactor);
  enemy.slowUntil = Math.max(enemy.slowUntil, state.time + tower.slowDuration);
}

function applyArmorBreak(enemy, tower) {
  if (!tower.armorBreakFlat || enemy.dead) return;
  enemy.armorBreakFlat = Math.max(enemy.armorBreakFlat, tower.armorBreakFlat);
  enemy.armorBreakUntil = Math.max(enemy.armorBreakUntil, state.time + tower.armorBreakDuration);
}

function applyMagicShred(enemy, tower) {
  if (!tower.magicShredPercent || enemy.dead) return;
  enemy.magicResistDebuffPercent = Math.max(enemy.magicResistDebuffPercent, tower.magicShredPercent);
  enemy.magicResistDebuffUntil = Math.max(enemy.magicResistDebuffUntil, state.time + 4);
}

function applyStun(enemy, duration) {
  if (!duration || enemy.dead) return;
  enemy.stunUntil = Math.max(enemy.stunUntil, state.time + duration);
  enemy.slowFactor = Math.min(enemy.slowFactor, 0);
}

function getAuraBonuses(tower) {
  let damageBoost = 0;
  let flatDamage = 0;
  let speedBoost = 0;
  let critChanceBoost = 0;
  for (const aura of getAppliedAuras(tower)) {
    damageBoost += aura.damageBoost;
    flatDamage += aura.flatDamage;
    speedBoost += aura.speedBoost;
    critChanceBoost += aura.critChanceBoost;
  }
  return { damageBoost, flatDamage, speedBoost, critChanceBoost };
}

function getTowerAttackDamage(tower, aura = getAuraBonuses(tower)) {
  let damage = tower.damage + (tower.permanentBonusDamage || 0) + (aura.flatDamage || 0);
  if (tower.attributeType === "Сила") {
    damage *= 1 + getTowerStrengthBonus(tower);
  }
  if (tower.attributeType === "Интеллект" && isMagicTower(tower)) {
    damage *= 1 + getTowerIntellectBonus(tower);
  }
  damage *= 1 + state.globalDamageBoost;
  damage *= 1 + (aura.damageBoost || 0);
  return damage;
}

function getTowerAbilityMultiplier(tower) {
  return 1 + (tower.attributeType === "Интеллект" ? getTowerIntellectBonus(tower) : 0);
}

function getTowerEffectiveCooldown(tower, aura = getAuraBonuses(tower)) {
  const hasteBoost = state.time < (tower.speedBurstUntil || 0) ? tower.speedBurstBoost || 0 : 0;
  const totalSpeedBonus = getTowerAgilityBonus(tower) + (aura.speedBoost || 0) + hasteBoost;
  return tower.cooldown / (1 + totalSpeedBonus);
}

function getTowerCritChance(tower, aura = getAuraBonuses(tower)) {
  return (tower.critChance || 0) + (aura.critChanceBoost || 0);
}

function getMatchingUpgradeMate(tower) {
  return (
    state.towers.find(
      (candidate) =>
        candidate !== tower &&
        candidate.kind === "tower" &&
        candidate.towerId === tower.towerId &&
        candidate.level === tower.level
    ) || null
  );
}

function canUpgradeTower(tower) {
  return !!(tower && tower.kind === "tower" && getMatchingUpgradeMate(tower) && getNextTierPool(tower.level));
}

function upgradeTower(tower) {
  if (!canUpgradeTower(tower)) return false;
  const mate = getMatchingUpgradeMate(tower);
  const nextPool = getNextTierPool(tower.level);
  if (!mate || !nextPool) return false;

  removeStructure(tower);
  removeStructure(mate);

  const nextDef = rollRandomFrom(nextPool);
  const upgraded = createTower(tower.cellC, tower.cellR, nextDef);
  state.towers.push(upgraded);
  state.selectedCell = { c: upgraded.cellC, r: upgraded.cellR };
  state.lastRoll = `${upgraded.name} (${upgraded.tier})`;
  return true;
}

function rerollTower(tower) {
  if (!tower || tower.kind !== "tower" || state.silver < TOOL_RE_ROLL_COST) return false;
  const pool = getPoolForLevel(tower.level);
  if (!pool) return false;
  const nextDef = rollRandomDifferent(pool, tower.towerId);
  state.silver -= TOOL_RE_ROLL_COST;
  const replacement = createTower(tower.cellC, tower.cellR, nextDef);
  replacement.nextShotAt = tower.nextShotAt;
  removeStructure(tower);
  state.towers.push(replacement);
  state.selectedCell = { c: replacement.cellC, r: replacement.cellR };
  state.lastRoll = `${replacement.name} (${replacement.tier})`;
  return true;
}

function startMoveMode() {
  const selected = getSelectedStructure();
  if (!selected || selected.kind !== "tower") return false;
  state.moveMode = true;
  state.toolsOpen = false;
  return true;
}

function executeMove(targetCell) {
  const selected = getSelectedStructure();
  if (!selected || selected.kind !== "tower" || state.silver < TOOL_MOVE_COST) return false;
  const target = getStructureAt(targetCell.c, targetCell.r);
  if (target && target.kind !== "tower") return false;
  if (targetCell.c === selected.cellC && targetCell.r === selected.cellR) {
    state.moveMode = false;
    return false;
  }

  state.silver -= TOOL_MOVE_COST;
  const fromCell = { c: selected.cellC, r: selected.cellR };
  if (target && target !== selected) {
    target.cellC = fromCell.c;
    target.cellR = fromCell.r;
    syncStructurePosition(target);
  }
  selected.cellC = targetCell.c;
  selected.cellR = targetCell.r;
  syncStructurePosition(selected);

  state.selectedCell = { c: selected.cellC, r: selected.cellR };
  state.moveMode = false;
  return true;
}

function updateEnemyEffects(dt) {
  for (const enemy of [...state.enemies]) {
    if (enemy.dead) continue;

    if (state.time >= enemy.slowUntil) {
      enemy.slowFactor = 1;
    }
    if (state.time >= enemy.armorBreakUntil) {
      enemy.armorBreakFlat = 0;
    }
    if (state.time >= enemy.armorDebuffUntil) {
      enemy.armorDebuffPercent = 0;
    }
    if (state.time >= enemy.magicResistDebuffUntil) {
      enemy.magicResistDebuffPercent = 0;
    }

    if (state.time < enemy.burnUntil && enemy.burnDamage > 0) {
      enemy.burnTickTimer -= dt;
      while (enemy.burnTickTimer <= 0 && !enemy.dead) {
        enemy.burnTickTimer += 0.5;
        enemy.hp -= enemy.burnDamage;
        if (enemy.hp <= 0) {
          killEnemy(enemy);
        }
      }
    } else {
      enemy.burnDamage = 0;
      enemy.burnTickTimer = 0.5;
    }

    if (state.time < enemy.poisonUntil && enemy.poisonDamage > 0) {
      enemy.poisonTickTimer -= dt;
      while (enemy.poisonTickTimer <= 0 && !enemy.dead) {
        enemy.poisonTickTimer += 0.5;
        enemy.hp -= Math.max(1, enemy.poisonDamage - Math.floor(enemy.armor / 2));
        if (enemy.hp <= 0) {
          killEnemy(enemy);
        }
      }
    } else {
      enemy.poisonDamage = 0;
      enemy.poisonTickTimer = 0.5;
    }
  }
}

function updateWave(dt) {
  if (!state.started) return;
  if (state.endlessMode) {
    state.waveActive = true;
    state.spawnTimer -= dt;
    while (state.spawnTimer <= 0) {
      spawnEnemy();
      state.spawnTimer += SPAWN_INTERVAL;
    }
    return;
  }
  if (!state.waveActive) {
    state.intermission -= dt;
    if (state.intermission <= 0) {
      state.waveActive = true;
      state.waveSpawned = 0;
      state.waveKilled = 0;
      state.waveEscaped = 0;
      state.spawnTimer = 0;
      rollCurrentNuggetPrice();
      processMinesForWaveStart();
      resetWaveDamage();
    }
    return;
  }

  state.spawnTimer -= dt;
  while (state.waveSpawned < ENEMIES_PER_WAVE && state.spawnTimer <= 0) {
    spawnEnemy();
    state.spawnTimer += SPAWN_INTERVAL;
  }

  if (state.waveSpawned >= ENEMIES_PER_WAVE && state.enemies.length === 0) {
    state.lastWaveTopDamage = getTopDamageEntries(5);
    state.lastWaveRecorded = state.wave;
    state.bestWave = Math.max(state.bestWave, state.wave);
    storeBestWave(state.bestWave);
    syncLeaderboardEntry();
    if (state.wave >= 30) {
      state.endlessMode = true;
      state.waveActive = true;
      state.waveSpawned = 0;
      state.waveKilled = 0;
      state.waveEscaped = 0;
      state.spawnTimer = SPAWN_INTERVAL;
      resetWaveDamage();
      return;
    }
    state.wave += 1;
    maybeAwardMysteryBag(state.wave);
    state.waveActive = false;
    state.intermission = WAVE_BREAK;
    if (state.wave <= 30) {
      state.mineStock += 2;
    }
  }
}

function updateEnemies(dt) {
  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    if (enemy.dead) continue;
    if (state.time < enemy.stunUntil) continue;
    let distance = TILE_SPEED * enemy.slowFactor * dt;

    while (distance > 0 && enemy.segment < PATH_POINTS.length - 1) {
      const a = PATH_POINTS[enemy.segment];
      const b = PATH_POINTS[enemy.segment + 1];
      const length = segLength(a, b);
      if (length < 0.0001) {
        enemy.segment += 1;
        enemy.t = 0;
        continue;
      }
      const remaining = (1 - enemy.t) * length;
      if (distance < remaining) {
        enemy.t += distance / length;
        distance = 0;
      } else {
        distance -= remaining;
        enemy.segment += 1;
        enemy.t = 0;
      }
    }

    if (enemy.segment >= PATH_POINTS.length - 1) {
      if (state.selectedEnemyId === enemy.id) state.selectedEnemyId = null;
      state.enemies.splice(i, 1);
      if (!enemy.isBoss) state.waveEscaped += 1;
      state.lives = Math.max(0, state.lives - (enemy.castleDamage || 1));
      if (state.lives === 0) {
        state.mode = "defeat";
      }
    }
  }
}

function updateTowers() {
  for (const tower of state.towers) {
    if (tower.kind === "mine") continue;
    const aura = getAuraBonuses(tower);
    const effectiveCooldown = getTowerEffectiveCooldown(tower, aura);
    if (state.time < tower.nextShotAt) continue;
    const targets = getSortedTargetsInRange(tower);
    if (!targets.length) continue;

    tower.nextShotAt = state.time + effectiveCooldown;
    tower.attackCounter = (tower.attackCounter || 0) + 1;

    if (tower.speedBurstChance && Math.random() < tower.speedBurstChance) {
      tower.speedBurstUntil = Math.max(tower.speedBurstUntil || 0, state.time + tower.speedBurstDuration);
    }

    const critChanceBonus = aura.critChanceBoost || 0;
    let damageMultiplier = 1;
    let specialStunDuration = 0;
    if (tower.specialShotEvery && tower.attackCounter % tower.specialShotEvery === 0) {
      damageMultiplier *= tower.specialShotMultiplier || 1;
      specialStunDuration = Math.max(specialStunDuration, tower.specialShotStunDuration || 0);
    }
    if (tower.tripleShotEvery && tower.attackCounter % tower.tripleShotEvery === 0) {
      damageMultiplier *= 3;
    }

    const baseDamage = getTowerAttackDamage(tower, aura) * damageMultiplier;
    const beamTriggered = tower.beamChance && Math.random() < tower.beamChance;
    const globalStunTriggered = tower.globalStunChance && Math.random() < tower.globalStunChance;
    const mapProcTriggered = tower.mapProcChance && Math.random() < tower.mapProcChance;
    const mapBlastTriggered = tower.mapBlastEvery && tower.attackCounter % tower.mapBlastEvery === 0;

    if (globalStunTriggered) {
      for (const entry of targets) {
        applyStun(entry.enemy, tower.globalStunDuration);
      }
    }

    if (tower.pattern === "multi" || tower.pattern === "beam") {
      for (const entry of targets.slice(0, tower.multiTargets)) {
        const crit = dealTowerHit(entry.enemy, tower, baseDamage, { critChanceBonus });
        if (specialStunDuration) applyStun(entry.enemy, specialStunDuration);
        addShot(tower.x, tower.y, entry.pos.x, entry.pos.y, tower.shotColor, tower.shotWidth, crit);
      }
    } else if (tower.pattern === "chain") {
      const chainTargets = targets.slice(0, tower.multiTargets);
      for (let idx = 0; idx < chainTargets.length; idx += 1) {
        const entry = chainTargets[idx];
        const scaledDamage = baseDamage * Math.pow(1 - tower.chainFalloff, idx);
        const crit = dealTowerHit(entry.enemy, tower, scaledDamage, { critChanceBonus });
        if (specialStunDuration) applyStun(entry.enemy, specialStunDuration);
        const from = idx === 0 ? { x: tower.x, y: tower.y } : chainTargets[idx - 1].pos;
        addShot(from.x, from.y, entry.pos.x, entry.pos.y, tower.shotColor, tower.shotWidth, crit);
        if (tower.poisonSpreadCount > 0 && idx <= tower.poisonSpreadCount) {
          applyPoison(entry.enemy, tower);
        }
      }
    } else if (tower.pattern === "nova") {
      const hitAll = Math.random() < tower.allTargetsChance;
      const novaTargets = hitAll ? targets : targets.slice(0, 1);
      for (const entry of novaTargets) {
        const crit = dealTowerHit(entry.enemy, tower, baseDamage, { critChanceBonus });
        addShot(tower.x, tower.y, entry.pos.x, entry.pos.y, tower.shotColor, tower.shotWidth, crit);
      }
    } else if (tower.pattern === "splash") {
      const primary = targets[0];
      for (const entry of targets) {
        if (Math.hypot(entry.pos.x - primary.pos.x, entry.pos.y - primary.pos.y) <= tower.splashRadius) {
          const crit = dealTowerHit(
            entry.enemy,
            tower,
            entry.enemy.id === primary.enemy.id ? baseDamage : Math.max(1, Math.floor(baseDamage * 0.65)),
            { critChanceBonus }
          );
          if (tower.slowDuration) applySlow(entry.enemy, tower);
          if (specialStunDuration) applyStun(entry.enemy, specialStunDuration);
          addShot(tower.x, tower.y, primary.pos.x, primary.pos.y, tower.shotColor, tower.shotWidth, crit);
        }
      }
    } else if (tower.pattern === "all") {
      for (const entry of targets) {
        const crit = dealTowerHit(entry.enemy, tower, baseDamage, { critChanceBonus });
        applyBurn(entry.enemy, tower);
        if (specialStunDuration) applyStun(entry.enemy, specialStunDuration);
        addShot(tower.x, tower.y, entry.pos.x, entry.pos.y, tower.shotColor, tower.shotWidth, crit);
      }
    } else {
      const primary = targets[0];
      const crit = dealTowerHit(primary.enemy, tower, baseDamage, { critChanceBonus });
      if (tower.pattern === "burn") applyBurn(primary.enemy, tower);
      if (tower.pattern === "poison") applyPoison(primary.enemy, tower);
      if (tower.pattern === "slow") applySlow(primary.enemy, tower);
      if (tower.poisonSpreadCount > 0) {
        for (const extra of targets.slice(1, 1 + tower.poisonSpreadCount)) {
          applyPoison(extra.enemy, tower);
        }
      }
      if (specialStunDuration) applyStun(primary.enemy, specialStunDuration);
      if (tower.pulseStunChance && Math.random() < tower.pulseStunChance) {
        for (const entry of targets) {
          if (entry.dist <= tower.pulseStunRadiusCells * TILE) {
            applyStun(entry.enemy, tower.pulseStunDuration);
          }
        }
      }
      addShot(tower.x, tower.y, primary.pos.x, primary.pos.y, tower.shotColor, tower.shotWidth, crit);
    }

    if (tower.beamChance && beamTriggered) {
      for (const entry of targets) {
        const crit = dealTowerHit(entry.enemy, tower, baseDamage * (tower.beamMultiplier || 1), { critChanceBonus: 0 });
        addShot(tower.x, tower.y, entry.pos.x, entry.pos.y, "#fff7cf", tower.shotWidth + 0.6, crit);
      }
    }

    if (tower.mapProcChance && mapProcTriggered) {
      const procDamage = (tower.mapProcDamage || 0) * getTowerAbilityMultiplier(tower);
      const pctDamage = tower.mapProcPercentMaxHp || 0;
      for (const entry of targets) {
        let extraDamage = procDamage;
        if (pctDamage > 0) {
          extraDamage += entry.enemy.maxHp * pctDamage * getTowerAbilityMultiplier(tower);
        }
        if (extraDamage > 0) {
          dealTowerHit(entry.enemy, tower, extraDamage, { critChanceBonus: 0 });
          addShot(tower.x, tower.y, entry.pos.x, entry.pos.y, "#fff3c9", tower.shotWidth + 0.2, false);
        }
      }
    }

    if (tower.mapBlastEvery && mapBlastTriggered) {
      for (const enemy of [...state.enemies]) {
        if (enemy.dead) continue;
        const blastDamage =
          tower.mapBlastDamage *
          (enemy.isBoss ? tower.mapBlastBossMultiplier || 1 : 1) *
          getTowerAbilityMultiplier(tower);
        dealTowerHit(enemy, tower, blastDamage, { critChanceBonus: 0 });
      }
    }

    if (tower.silverSplashChance && Math.random() < tower.silverSplashChance) {
      const randomCount =
        tower.splashTargetsMin +
        Math.floor(Math.random() * (tower.splashTargetsMax - tower.splashTargetsMin + 1));
      const splashTargets = targets.slice(0, Math.min(targets.length, randomCount));
      const splashDamage =
        getTowerAttackDamage(tower, aura) + (tower.attributeLevel || 1) * (tower.silverSplashAttrBonus || 0);
      for (const entry of splashTargets) {
        dealTowerHit(entry.enemy, tower, splashDamage, { critChanceBonus });
        addShot(tower.x, tower.y, entry.pos.x, entry.pos.y, "#ffd66d", tower.shotWidth, false);
      }
      state.silver += splashTargets.length * (tower.silverSplashSilverPerTarget || 0);
    }
  }
}

function updateShots(dt) {
  for (let i = state.shots.length - 1; i >= 0; i -= 1) {
    state.shots[i].ttl -= dt;
    if (state.shots[i].ttl <= 0) state.shots.splice(i, 1);
  }
}

function update(dt) {
  if (state.mode !== "running" || state.paused) return;
  state.time += dt;
  if (!state.started) return;
  if (state.startCountdown > 0) {
    state.startCountdown = Math.max(0, state.startCountdown - dt);
    return;
  }
  updateWave(dt);
  updateEnemyEffects(dt);
  updateEnemies(dt);
  updateTowers();
  updateShots(dt);
}

function roundedRectPath(x, y, w, h, radius) {
  const r = Math.min(radius, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}

function fillRoundedRect(x, y, w, h, radius, fill, stroke) {
  roundedRectPath(x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.stroke();
  }
}

function drawWrappedText(text, x, y, maxWidth, lineHeight, color, font, maxLines) {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  const words = String(text).split(/\s+/).filter(Boolean);
  let line = "";
  let lineIndex = 0;

  for (let i = 0; i < words.length; i += 1) {
    const test = line ? `${line} ${words[i]}` : words[i];
    if (ctx.measureText(test).width <= maxWidth || !line) {
      line = test;
      continue;
    }

    ctx.fillText(line, x, y + lineIndex * lineHeight);
    lineIndex += 1;
    if (lineIndex >= maxLines) return lineIndex;
    line = words[i];
  }

  if (line && lineIndex < maxLines) {
    ctx.fillText(line, x, y + lineIndex * lineHeight);
    lineIndex += 1;
  }

  return lineIndex;
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
  gradient.addColorStop(0, COLORS.pageTop);
  gradient.addColorStop(1, COLORS.pageBottom);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.03)";
  ctx.beginPath();
  ctx.arc(canvas.width * 0.18, canvas.height * 0.16, 96, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(canvas.width * 0.78, canvas.height * 0.78, 112, 0, Math.PI * 2);
  ctx.fill();

  ctx.shadowColor = COLORS.boardShadow;
  ctx.shadowBlur = 20;
  fillRoundedRect(BOARD_X - 10, BOARD_Y - 10, BOARD_W + 20, MAP_VISUAL_H + 20, 18, COLORS.boardFrame, null);
  ctx.shadowBlur = 0;
  fillRoundedRect(BOARD_X - 4, BOARD_Y - 4, BOARD_W + 8, MAP_VISUAL_H + 8, 14, COLORS.boardInset, null);
}

function drawBoard() {
  for (let r = 0; r < GRID_ROWS; r += 1) {
    for (let c = 0; c < GRID_COLS; c += 1) {
      const x = BOARD_X + c * TILE;
      const y = BOARD_Y + r * TILE;
      const road = isRoad(c, r);
      ctx.fillStyle = road ? COLORS.road : COLORS.build;
      ctx.fillRect(x, y, TILE, TILE);
      ctx.strokeStyle = road ? COLORS.roadStroke : COLORS.buildStroke;
      ctx.lineWidth = 1;
      ctx.strokeRect(x + 0.5, y + 0.5, TILE - 1, TILE - 1);

      if (!road) {
        ctx.strokeStyle = COLORS.grid;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x + TILE / 2, y + 4);
        ctx.lineTo(x + TILE / 2, y + TILE - 4);
        ctx.moveTo(x + 4, y + TILE / 2);
        ctx.lineTo(x + TILE - 4, y + TILE / 2);
        ctx.stroke();

        ctx.fillStyle = COLORS.towerSlot;
        ctx.beginPath();
        ctx.arc(x + TILE / 2, y + TILE / 2, 4.5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  if (state.hoveredSlot) {
    const p = cellToPixel(state.hoveredSlot.c, state.hoveredSlot.r);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.7)";
    ctx.lineWidth = 2;
    ctx.strokeRect(p.x + 2, p.y + 2, TILE - 4, TILE - 4);
  }
}

function drawMapLabels() {
  const start = cellCenter(START_CELL.c, START_CELL.r);
  const exit = cellCenter(EXIT_CELL.c, EXIT_CELL.r);

  ctx.fillStyle = COLORS.gate;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 10px Avenir Next";
  ctx.fillText("Вход", start.x, start.y - 9);
  ctx.fillText("монстров", start.x, start.y + 2);
  ctx.fillText("Выход", exit.x, exit.y - 9);
  ctx.fillText("монстров", exit.x, exit.y + 2);
}

function drawTurnMarkers() {
  ctx.strokeStyle = COLORS.turn;
  ctx.lineWidth = 2.2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  for (const marker of TURN_MARKERS) {
    const base = cellToPixel(marker.c, marker.r);
    ctx.beginPath();
    ctx.moveTo(base.x + marker.ax * TILE, base.y + marker.ay * TILE);
    ctx.lineTo(base.x + marker.bx * TILE, base.y + marker.by * TILE);
    ctx.lineTo(base.x + marker.cx * TILE, base.y + marker.cy * TILE);
    ctx.stroke();
  }

  for (const cross of CROSS_MARKERS) {
    const base = cellToPixel(cross.c, cross.r);
    const cx = base.x + TILE / 2;
    const cy = base.y + TILE / 2;
    ctx.strokeStyle = COLORS.cross;
    ctx.lineWidth = 2.1;
    ctx.beginPath();
    ctx.moveTo(cx - 5, cy - 5);
    ctx.lineTo(cx + 5, cy + 5);
    ctx.moveTo(cx + 5, cy - 5);
    ctx.lineTo(cx - 5, cy + 5);
    ctx.stroke();
  }
}

function drawPolygon(cx, cy, radius, sides, rotation, fill, stroke) {
  ctx.beginPath();
  for (let i = 0; i < sides; i += 1) {
    const angle = rotation + (Math.PI * 2 * i) / sides;
    const x = cx + Math.cos(angle) * radius;
    const y = cy + Math.sin(angle) * radius;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawTowerSprite(tower) {
  const size = tower.level >= 3 ? 13 : tower.level === 2 ? 11 : 9;
  const x = tower.x;
  const y = tower.y;

  switch (tower.visual) {
    case "spike":
      for (let i = 0; i < 6; i += 1) {
        const angle = (Math.PI * 2 * i) / 6;
        ctx.strokeStyle = tower.trimColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x + Math.cos(angle) * 3, y + Math.sin(angle) * 3);
        ctx.lineTo(x + Math.cos(angle) * (size + 2), y + Math.sin(angle) * (size + 2));
        ctx.stroke();
      }
      ctx.fillStyle = tower.bodyColor;
      ctx.beginPath();
      ctx.arc(x, y, size - 3, 0, Math.PI * 2);
      ctx.fill();
      break;
    case "ballista":
      ctx.fillStyle = tower.bodyColor;
      ctx.fillRect(x - size, y - 4, size * 2, 8);
      ctx.strokeStyle = tower.trimColor;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x - size - 4, y - size + 2);
      ctx.lineTo(x - size, y);
      ctx.lineTo(x - size - 4, y + size - 2);
      ctx.moveTo(x + size + 4, y - size + 2);
      ctx.lineTo(x + size, y);
      ctx.lineTo(x + size + 4, y + size - 2);
      ctx.stroke();
      break;
    case "ember":
      drawPolygon(x, y, size, 3, -Math.PI / 2, tower.bodyColor, tower.trimColor);
      break;
    case "frost":
      drawPolygon(x, y, size, 4, Math.PI / 4, tower.bodyColor, tower.trimColor);
      break;
    case "toxin":
      drawPolygon(x, y, size, 6, Math.PI / 6, tower.bodyColor, tower.trimColor);
      break;
    case "mortar":
      ctx.fillStyle = tower.bodyColor;
      ctx.fillRect(x - size, y - size, size * 2, size * 2);
      ctx.strokeStyle = tower.trimColor;
      ctx.lineWidth = 2;
      ctx.strokeRect(x - size, y - size, size * 2, size * 2);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(4, size - 5), 0, Math.PI * 2);
      ctx.fillStyle = tower.trimColor;
      ctx.fill();
      break;
    case "flare":
      ctx.strokeStyle = tower.trimColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - size, y);
      ctx.lineTo(x + size, y);
      ctx.moveTo(x, y - size);
      ctx.lineTo(x, y + size);
      ctx.moveTo(x - size * 0.7, y - size * 0.7);
      ctx.lineTo(x + size * 0.7, y + size * 0.7);
      ctx.moveTo(x + size * 0.7, y - size * 0.7);
      ctx.lineTo(x - size * 0.7, y + size * 0.7);
      ctx.stroke();
      ctx.fillStyle = tower.bodyColor;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(3, size - 6), 0, Math.PI * 2);
      ctx.fill();
      break;
    case "banner":
      ctx.strokeStyle = tower.trimColor;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(x - 8, y + size);
      ctx.lineTo(x - 8, y - size);
      ctx.stroke();
      ctx.fillStyle = tower.bodyColor;
      ctx.beginPath();
      ctx.moveTo(x - 8, y - size);
      ctx.lineTo(x + size, y - size + 4);
      ctx.lineTo(x - 2, y - 1);
      ctx.lineTo(x + size, y + size - 2);
      ctx.lineTo(x - 8, y + size - 6);
      ctx.closePath();
      ctx.fill();
      break;
    default:
      ctx.fillStyle = tower.bodyColor || "#29404f";
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();
  }
}

function drawSelection() {
  const selected = getSelectedStructure();
  if (!selected) return;
  const p = cellToPixel(selected.cellC, selected.cellR);
  ctx.strokeStyle = state.moveMode ? "#ff5d5d" : COLORS.select;
  ctx.lineWidth = 3;
  ctx.strokeRect(p.x + 1.5, p.y + 1.5, TILE - 3, TILE - 3);
}

function drawMoveTargetHint() {
  if (!state.moveMode || !state.hoveredSlot) return;
  const p = cellToPixel(state.hoveredSlot.c, state.hoveredSlot.r);
  ctx.strokeStyle = "#ff8a8a";
  ctx.lineWidth = 3;
  ctx.strokeRect(p.x + 3, p.y + 3, TILE - 6, TILE - 6);
}

function drawTowers() {
  const selected = getSelectedStructure();
  if (selected && selected.kind === "tower") {
    ctx.fillStyle = COLORS.range;
    ctx.beginPath();
    ctx.arc(selected.x, selected.y, selected.range, 0, Math.PI * 2);
    ctx.fill();
  }

  for (const tower of state.towers) {
    if (tower.kind === "mine") {
      ctx.fillStyle = COLORS.mineShell;
      ctx.fillRect(tower.x - 9, tower.y - 9, 18, 18);
      ctx.strokeStyle = "#ffcf56";
      ctx.lineWidth = 2;
      ctx.strokeRect(tower.x - 9, tower.y - 9, 18, 18);
      ctx.fillStyle = COLORS.mineCore;
      ctx.beginPath();
      ctx.arc(tower.x, tower.y, 4.5, 0, Math.PI * 2);
      ctx.fill();
      continue;
    }
    drawTowerSprite(tower);
  }
}

function drawEnemies() {
  for (const enemy of state.enemies) {
    const pos = enemyPixel(enemy);
    ctx.fillStyle = enemy.isBonus ? COLORS.bonusEnemy : enemy.armor > 0 ? COLORS.enemyArmor : COLORS.enemy;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 7.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = enemy.color || COLORS.enemy;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 4.5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "rgba(0,0,0,0.22)";
    ctx.fillRect(pos.x - 10, pos.y - 14, 20, 3);
    ctx.fillStyle = COLORS.hp;
    ctx.fillRect(pos.x - 10, pos.y - 14, 20 * (enemy.hp / enemy.maxHp), 3);
  }
}

function drawShots() {
  for (const shot of state.shots) {
    ctx.strokeStyle = shot.crit ? COLORS.crit : shot.color || COLORS.shot;
    ctx.lineWidth = shot.crit ? Math.max(3.2, shot.width || 2) : shot.width || 2;
    ctx.beginPath();
    ctx.moveTo(shot.fromX, shot.fromY);
    ctx.lineTo(shot.toX, shot.toY);
    ctx.stroke();
  }
}

function drawBaseLives() {
  const x = TOP_HUD_X + TOP_HUD_W - 48;
  const y = TOP_HUD_Y + 6;
  fillRoundedRect(x, y, 40, LAYOUT.statsH - 12, 12, "rgba(15, 25, 38, 0.92)", "rgba(255,255,255,0.15)");
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 16px Avenir Next";
  ctx.fillText(String(state.lives), x + 20, y + (LAYOUT.statsH - 12) / 2);
}

function getPauseButtonRect() {
  return { x: TOP_HUD_X + 6, y: TOP_HUD_Y + 6, w: 40, h: LAYOUT.statsH - 12 };
}

function drawPauseButton() {
  const button = getPauseButtonRect();
  fillRoundedRect(button.x, button.y, button.w, button.h, 16, "rgba(15, 25, 38, 0.92)", "rgba(255,255,255,0.15)");
  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 15px Avenir Next";
  ctx.fillText(state.paused ? "▶" : "Ⅱ", button.x + button.w / 2, button.y + button.h / 2 + 0.5);
}

function drawRiverLanes() {
  const riverY = BOARD_Y + BOARD_H;
  const riverW = BOARD_W;
  const laneH = TILE;

  fillRoundedRect(BOARD_X, riverY, riverW, laneH, 6, "rgba(111, 209, 237, 0.72)", "rgba(201, 244, 255, 0.28)");
  fillRoundedRect(BOARD_X, riverY + TILE, riverW, laneH, 6, "rgba(82, 193, 226, 0.72)", "rgba(201, 244, 255, 0.24)");
}

function getStartButtonRect() {
  return {
    x: BOARD_X + (BOARD_W - 180) / 2,
    y: BOARD_Y + (MAP_VISUAL_H - 56) / 2,
    w: 180,
    h: 56
  };
}

function getDamageToggleRect() {
  return { x: AURA_X + AURA_W - 92, y: AURA_Y + 10, w: 80, h: 22 };
}

function getInfoBodyRect() {
  return {
    x: CONTROL_X + 10,
    y: CONTROL_Y + 48,
    w: INFO_W - 20,
    h: CONTROL_H - 58
  };
}

function drawStatsStrip() {
  fillRoundedRect(TOP_HUD_X, TOP_HUD_Y, TOP_HUD_W, LAYOUT.statsH, 16, COLORS.statsPanel, "rgba(255,255,255,0.12)");
  drawPauseButton();
  drawBaseLives();

  const items = [
    { type: "text", label: state.endlessMode ? `Экстра ${state.extraKills}` : `Волна ${state.wave}` },
    { type: "silver", value: state.silver },
    { type: "nuggets", value: state.goldNuggets },
    { type: "text", label: `Цена ${getAdjustedNuggetPrice()}` }
  ];

  const contentX = TOP_HUD_X + 56;
  const contentW = TOP_HUD_W - 112;
  const itemW = contentW / items.length;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < items.length; i += 1) {
    if (i > 0) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.beginPath();
      ctx.moveTo(contentX + itemW * i, TOP_HUD_Y + 8);
      ctx.lineTo(contentX + itemW * i, TOP_HUD_Y + LAYOUT.statsH - 8);
      ctx.stroke();
    }
    ctx.fillStyle = COLORS.statsText;
    const item = items[i];
    const cx = contentX + itemW * i + itemW / 2;
    const cy = TOP_HUD_Y + LAYOUT.statsH / 2 + 0.5;
    if (item.type === "silver") {
      ctx.fillStyle = "#d9dfe6";
      ctx.beginPath();
      ctx.arc(cx - 18, cy, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#f7fbff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = COLORS.statsText;
      ctx.font = "bold 13px Avenir Next";
      ctx.fillText(String(item.value), cx + 12, cy);
    } else if (item.type === "nuggets") {
      ctx.fillStyle = "#f0c24f";
      ctx.beginPath();
      ctx.moveTo(cx - 24, cy + 5);
      ctx.lineTo(cx - 16, cy - 7);
      ctx.lineTo(cx - 8, cy - 4);
      ctx.lineTo(cx - 5, cy + 6);
      ctx.lineTo(cx - 15, cy + 10);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = "#ffe59a";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = COLORS.statsText;
      ctx.font = "bold 13px Avenir Next";
      ctx.fillText(String(item.value), cx + 12, cy);
    } else {
      ctx.font = "bold 12px Avenir Next";
      ctx.fillText(item.label, cx, cy);
    }
  }
}

function getInventorySlotRects() {
  const gap = 6;
  const slotSize = 42;
  const totalW = slotSize * INVENTORY_SLOT_COUNT + gap * (INVENTORY_SLOT_COUNT - 1);
  const startX = STATS_X + Math.floor((STATS_W - totalW) / 2);
  const y = STATS_Y + Math.floor((LAYOUT.statsH - slotSize) / 2);
  return Array.from({ length: INVENTORY_SLOT_COUNT }, (_, index) => ({
    index,
    x: startX + index * (slotSize + gap),
    y,
    w: slotSize,
    h: slotSize
  }));
}

function drawInventoryStrip() {
  fillRoundedRect(STATS_X, STATS_Y, STATS_W, LAYOUT.statsH, 16, "#21435f", "rgba(255,255,255,0.12)");
  for (const slot of getInventorySlotRects()) {
    const item = state.inventory[slot.index];
    const selected = state.itemMenuOpen && state.selectedItemSlot === slot.index;
    fillRoundedRect(
      slot.x,
      slot.y,
      slot.w,
      slot.h,
      10,
      selected ? "#d4a93d" : "rgba(10, 21, 32, 0.38)",
      selected ? "#ffe7a2" : "rgba(255,255,255,0.1)"
    );
    if (!item) continue;
    const def = ITEM_DEFS[item.itemId];
    ctx.fillStyle = selected ? "#1f1702" : "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 12px Avenir Next";
    ctx.fillText(def?.short || "?", slot.x + slot.w / 2, slot.y + slot.h / 2 + 0.5);
  }
}

function getAuraPanelBadges() {
  const selected = getSelectedStructure();
  if (!selected || selected.kind !== "tower") return [];
  const auras = getAppliedAuras(selected);
  return auras.map((aura, index) => ({
    ...aura,
    x: AURA_X + 12 + index * 88,
    y: AURA_Y + 10,
    w: 80,
    h: 22
  }));
}

function drawAuraPanel() {
  fillRoundedRect(AURA_X, AURA_Y, AURA_W, LAYOUT.auraH, 16, "#21384b", "rgba(255,255,255,0.12)");
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 13px Avenir Next";
  ctx.fillStyle = "#e9f4fb";
  ctx.fillText("Ауры", AURA_X + 12, AURA_Y + 8);

  const toggle = getDamageToggleRect();
  fillRoundedRect(
    toggle.x,
    toggle.y,
    toggle.w,
    toggle.h,
    10,
    state.damagePanelOpen ? "#d4a93d" : "#36536a",
    state.damagePanelOpen ? "#ffe7a2" : "rgba(255,255,255,0.08)"
  );
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 11px Avenir Next";
  ctx.fillStyle = state.damagePanelOpen ? "#1f1702" : "#ffffff";
  ctx.fillText("Топ урона", toggle.x + toggle.w / 2, toggle.y + toggle.h / 2 + 0.5);

  const selected = getSelectedStructure();
  if (!selected || selected.kind !== "tower") {
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "13px Avenir Next";
    ctx.fillStyle = COLORS.subtext;
    ctx.fillText("Выбери башню, чтобы увидеть активные баффы.", AURA_X + 12, AURA_Y + 30);
    return;
  }

  const badges = getAuraPanelBadges();
  if (!badges.length) {
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "13px Avenir Next";
    ctx.fillStyle = COLORS.subtext;
    ctx.fillText("На выбранной башне нет активных аур.", AURA_X + 12, AURA_Y + 30);
    return;
  }

  for (const badge of badges) {
    const selectedBadge = state.selectedAuraSourceId === badge.sourceId;
    fillRoundedRect(
      badge.x,
      badge.y,
      badge.w,
      badge.h,
      10,
      selectedBadge ? "#d4a93d" : "#36536a",
      selectedBadge ? "#ffe7a2" : "rgba(255,255,255,0.08)"
    );
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 12px Avenir Next";
    ctx.fillStyle = selectedBadge ? "#1f1702" : "#ffffff";
    ctx.fillText(badge.sourceName, badge.x + badge.w / 2, badge.y + badge.h / 2 + 0.5);
  }

  const activeAura =
    badges.find((badge) => badge.sourceId === state.selectedAuraSourceId) || badges[0];
  if (activeAura && !state.selectedAuraSourceId) {
    state.selectedAuraSourceId = activeAura.sourceId;
  }

  if (activeAura) {
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "12px Avenir Next";
    ctx.fillStyle = COLORS.subtext;
    ctx.fillText(`${activeAura.sourceTier}: ${activeAura.summary}`, AURA_X + 12, AURA_Y + 36);
  }
}

function drawDamagePanel() {
  if (!state.damagePanelOpen) return;
  const panelW = 220;
  const entries = getDisplayedTopDamageEntries();
  const panelH = 56 + Math.max(1, entries.length) * 24;
  const panelX = canvas.width - panelW - 18;
  const panelY = BOARD_Y + 54;
  fillRoundedRect(panelX, panelY, panelW, panelH, 18, "rgba(16, 34, 48, 0.94)", "rgba(255,255,255,0.12)");
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px Avenir Next";
  const title = state.waveActive ? `Топ урона: волна ${state.wave}` : `Топ урона: волна ${state.lastWaveRecorded || state.wave}`;
  ctx.fillText(title, panelX + 12, panelY + 10);

  if (!entries.length) {
    ctx.font = "13px Avenir Next";
    ctx.fillStyle = COLORS.subtext;
    ctx.fillText("Пока нет нанесенного урона.", panelX + 12, panelY + 34);
    return;
  }

  let y = panelY + 34;
  for (let i = 0; i < entries.length; i += 1) {
    const entry = entries[i];
    ctx.fillStyle = "#dfeeff";
    ctx.font = "12px Avenir Next";
    ctx.fillText(`${i + 1}. ${entry.name}`, panelX + 12, y);
    ctx.textAlign = "right";
    ctx.fillText(String(entry.damage), panelX + panelW - 12, y);
    ctx.textAlign = "left";
    y += 24;
  }
}

function drawStartOverlay() {
  if (state.started && state.startCountdown <= 0) return;
  if (!state.started) {
    ctx.fillStyle = "rgba(6, 12, 19, 0.42)";
    ctx.fillRect(BOARD_X, BOARD_Y, BOARD_W, MAP_VISUAL_H);
    const button = getStartButtonRect();
    fillRoundedRect(button.x, button.y, button.w, button.h, 20, "#d4a93d", "#ffe7a2");
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffffff";
    ctx.textBaseline = "bottom";
    ctx.font = "bold 20px Avenir Next";
    ctx.fillText(
      state.nickname ? `Ник: ${state.nickname}` : "Сначала придумай ник игрока",
      BOARD_X + BOARD_W / 2,
      button.y - 14
    );
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#1f1702";
    ctx.font = "bold 22px Avenir Next";
    ctx.fillText(
      state.nickname ? "Начать играть" : "Придумать ник",
      button.x + button.w / 2,
      button.y + button.h / 2 + 0.5
    );
    return;
  }

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 28px Avenir Next";
  ctx.fillText(`Волна через ${Math.ceil(state.startCountdown)}`, BOARD_X + BOARD_W / 2, BOARD_Y + MAP_VISUAL_H / 2);
}

function drawPendingBagHint() {
  if (!state.pendingBagTowerDef) return;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 22px Avenir Next";
  ctx.fillStyle = "#8ee7ff";
  ctx.fillText(state.bagPlacementHint || "Установите башню", canvas.width / 2, BOARD_Y + 18);
}

function drawTowerAnnouncement() {
  if (!state.towerAnnouncement || state.time >= state.towerAnnouncement.until) return;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = "bold 24px Avenir Next";
  ctx.fillStyle = state.towerAnnouncement.color;
  ctx.fillText(state.towerAnnouncement.text, canvas.width / 2, BOARD_Y + 48);
}

function getBuildModeLabel() {
  if (state.moveMode) return "Перемещение";
  if (state.buildMode === "mine") return "Шахта";
  if (state.towerBuildMode === "master") return "Строить: Мастер";
  if (state.towerBuildMode === "simple") return "Строить: Простая";
  return "Не выбрано";
}

function drawInfoPanel() {
  fillRoundedRect(CONTROL_X, CONTROL_Y, INFO_W, CONTROL_H, 22, COLORS.infoPanel, COLORS.infoStroke);

  const selected = getSelectedStructure();
  const selectedEnemy = getSelectedEnemy();
  const innerX = CONTROL_X + 16;
  const headerY = CONTROL_Y + 14;
  const body = getInfoBodyRect();
  const bodyX = innerX;
  let y = body.y - state.infoScroll;

  ctx.textAlign = "left";
  ctx.textBaseline = "top";

  if (!selected && !selectedEnemy) {
    ctx.fillStyle = COLORS.darkText;
    ctx.font = "bold 20px Avenir Next";
    ctx.fillText("Информация", innerX, headerY);

    ctx.save();
    ctx.beginPath();
    ctx.rect(body.x, body.y, body.w, body.h);
    ctx.clip();

    ctx.font = "14px Avenir Next";
    ctx.fillStyle = COLORS.mutedText;
    ctx.fillText(`Игрок: ${state.nickname || "Player"}`, bodyX, y);
    y += 24;
    ctx.fillText(`Режим: ${getBuildModeLabel()}`, bodyX, y);
    y += 24;
    ctx.fillText(`Запас шахт: ${state.mineStock}`, bodyX, y);
    y += 24;
    ctx.fillText(`Цена самородка: ${getAdjustedNuggetPrice()}`, bodyX, y);
    y += 24;

    const rollText = state.lastRoll ? `Последний ролл: ${state.lastRoll}` : "Последний ролл: еще не было";
    y += drawWrappedText(rollText, bodyX, y, INFO_W - 32, 20, COLORS.mutedText, "14px Avenir Next", 4) * 20 + 8;
    drawWrappedText(
      "Тяни карту пальцем. Зум меняется жестом. Нажатие на врага показывает его статы, инструменты открывают действия башни.",
      bodyX,
      y,
      INFO_W - 32,
      20,
      COLORS.mutedText,
      "14px Avenir Next",
      8
    );
    y += 160;
    ctx.restore();
    state.infoScrollMax = Math.max(0, y - (body.y + body.h));
    state.infoScroll = Math.min(state.infoScroll, state.infoScrollMax);
    return;
  }

  if (selectedEnemy && !selected) {
    ctx.fillStyle = COLORS.darkText;
    ctx.font = "bold 20px Avenir Next";
    ctx.fillText(selectedEnemy.isBoss ? selectedEnemy.name || "Босс" : "Монстр", innerX, headerY);

    ctx.save();
    ctx.beginPath();
    ctx.rect(body.x, body.y, body.w, body.h);
    ctx.clip();
    ctx.fillStyle = COLORS.mutedText;
    ctx.font = "bold 13px Avenir Next";
    ctx.fillText(selectedEnemy.isBoss ? "Особый враг" : "Обычный враг", bodyX, y);
    y += 24;

    ctx.fillStyle = COLORS.darkText;
    ctx.font = "14px Avenir Next";
    ctx.fillText(`HP: ${Math.ceil(selectedEnemy.hp)} / ${selectedEnemy.maxHp}`, bodyX, y);
    y += 24;
    ctx.fillText(`Броня: ${selectedEnemy.armor}`, bodyX, y);
    y += 24;
    ctx.fillText(`Магрезист: ${Math.round(selectedEnemy.magicResist * 100)}%`, bodyX, y);
    y += 24;
    if (selectedEnemy.isBoss) {
      ctx.fillText(`Урон базе: ${selectedEnemy.castleDamage}`, bodyX, y);
      y += 24;
      ctx.fillText(`Награда: +${selectedEnemy.rewardMines} шахт`, bodyX, y);
      y += 24;
    }
    ctx.restore();
    state.infoScrollMax = Math.max(0, y - (body.y + body.h));
    state.infoScroll = Math.min(state.infoScroll, state.infoScrollMax);
    return;
  }

  ctx.fillStyle = COLORS.darkText;
  ctx.font = "bold 20px Avenir Next";
  ctx.fillText(selected.name, innerX, headerY);

  ctx.save();
  ctx.beginPath();
  ctx.rect(body.x, body.y, body.w, body.h);
  ctx.clip();
  ctx.fillStyle = COLORS.mutedText;
  ctx.font = "bold 13px Avenir Next";
  if (selected.kind === "mine") {
    ctx.fillText("Шахта", bodyX, y);
  } else {
    ctx.fillText(`${selected.tier} • ${selected.attackType}`, bodyX, y);
  }
  y += 24;

  ctx.font = "14px Avenir Next";
  if (selected.kind === "mine") {
    ctx.fillStyle = COLORS.darkText;
    ctx.fillText(`Добыча: ${selected.yieldNuggets} самородок / раунд`, bodyX, y);
    y += 24;
    ctx.fillText(`Цена самородка: ${getAdjustedNuggetPrice()} серебра`, bodyX, y);
    y += 24;
    ctx.fillText(`Осталось раундов: ${selected.remainingTurns}`, bodyX, y);
    y += 28;
    y += drawWrappedText(selected.talent, bodyX, y, INFO_W - 32, 20, COLORS.mutedText, "14px Avenir Next", 3) * 20 + 8;
    drawWrappedText(selected.description, bodyX, y, INFO_W - 32, 20, COLORS.mutedText, "14px Avenir Next", 10);
    y += 220;
    ctx.restore();
    state.infoScrollMax = Math.max(0, y - (body.y + body.h));
    state.infoScroll = Math.min(state.infoScroll, state.infoScrollMax);
    return;
  }

  ctx.fillStyle = COLORS.darkText;
  ctx.fillText(`Тип: ${selected.attackType}`, bodyX, y);
  y += 24;
  ctx.fillText(`Атрибут: ${selected.attributeType} ${selected.attributeLevel}`, bodyX, y);
  y += 24;
  const aura = getAuraBonuses(selected);
  const effectiveDamage = Math.round(getTowerAttackDamage(selected, aura));
  const effectiveCooldown = getTowerEffectiveCooldown(selected, aura);
  ctx.fillText(
    `Урон: ${effectiveDamage}${effectiveDamage !== Math.round(selected.damage) ? ` (база ${Math.round(selected.damage)})` : ""}`,
    bodyX,
    y
  );
  y += 24;
  const auraParts = [];
  if (selected.auraDamageBoost) auraParts.push(`урон +${Math.round(selected.auraDamageBoost * 100)}%`);
  if (selected.auraFlatDamage) auraParts.push(`урон +${Math.round(selected.auraFlatDamage)}`);
  if (selected.auraAttackSpeedBoost) auraParts.push(`скорость +${Math.round(selected.auraAttackSpeedBoost * 100)}%`);
  if (selected.auraCritChanceBoost) auraParts.push(`крит +${Math.round(selected.auraCritChanceBoost * 100)}%`);
  if (auraParts.length) {
    ctx.fillText(`Аура: ${auraParts.join(", ")}`, bodyX, y);
    y += 24;
  }
  if (selected.cooldown > 0) {
    ctx.fillText(
      `Скорость: ${effectiveCooldown.toFixed(2)} сек./выстр.${Math.abs(effectiveCooldown - selected.cooldown) > 0.001 ? ` (база ${selected.cooldown.toFixed(2)})` : ""}`,
      bodyX,
      y
    );
    y += 24;
    ctx.fillText(`Рэндж: ${selected.rangeCells.toFixed(1)} клетки`, bodyX, y);
    y += 24;
  } else if (auraParts.length) {
    ctx.fillText(`Радиус: ${(selected.rangeCellsAura || selected.rangeCells).toFixed(1)} клетки`, bodyX, y);
    y += 24;
  }

  ctx.fillStyle = COLORS.mutedText;
  y += drawWrappedText(`Талант: ${selected.talent}`, bodyX, y, INFO_W - 32, 20, COLORS.mutedText, "14px Avenir Next", 6) * 20 + 8;
  y += drawWrappedText(selected.description, bodyX, y, INFO_W - 32, 20, COLORS.mutedText, "14px Avenir Next", 12) * 20;
  ctx.restore();
  state.infoScrollMax = Math.max(0, y - (body.y + body.h));
  state.infoScroll = Math.min(state.infoScroll, state.infoScrollMax);
}

function getActionButtons() {
  const topY = CONTROL_Y;
  const bottomY = CONTROL_Y + ACTION_BUTTON_H + BUTTON_GAP;

  return [
    {
      id: "build",
      label: "Строить",
      sublabel:
        state.buildMode === "mine"
          ? `Шахта x${state.mineStock}`
          : state.towerBuildMode === "master"
            ? "Башня 4 уровня"
            : "Башня 1 уровня",
      x: BUTTONS_X,
      y: topY,
      w: ACTION_BUTTON_W,
      h: ACTION_BUTTON_H
    },
    {
      id: "sell",
      label: "Продать",
      sublabel: `${Math.min(5, state.goldNuggets)} x ${getAdjustedNuggetPrice()}`,
      x: BUTTONS_X + ACTION_BUTTON_W + BUTTON_GAP,
      y: topY,
      w: ACTION_BUTTON_W,
      h: ACTION_BUTTON_H
    },
    {
      id: "shop",
      label: "Магазин",
      sublabel: "Товары",
      x: BUTTONS_X,
      y: bottomY,
      w: ACTION_BUTTON_W,
      h: ACTION_BUTTON_H
    },
    {
      id: "tools",
      label: "",
      sublabel: "",
      x: BUTTONS_X + ACTION_BUTTON_W + BUTTON_GAP,
      y: bottomY,
      w: ACTION_BUTTON_W,
      h: ACTION_BUTTON_H
    }
  ];
}

function getButtonColors(button) {
  if (button.id === "build") {
    const active = state.buildPickerOpen;
    return {
      fill: active ? COLORS.simpleBtnActive : COLORS.simpleBtn,
      stroke: "rgba(255,255,255,0.16)",
      text: "#ffffff"
    };
  }

  if (button.id === "shop") {
    return {
      fill: state.shopOpen ? COLORS.shopBtnActive : COLORS.shopBtn,
      stroke: "rgba(255,255,255,0.16)",
      text: "#11301b"
    };
  }

  if (button.id === "sell") {
    return {
      fill: state.goldNuggets > 0 ? "#d4a93d" : "#6a6f76",
      stroke: "rgba(255,255,255,0.16)",
      text: state.goldNuggets > 0 ? "#1f1702" : "rgba(255,255,255,0.55)"
    };
  }

  const active = !!(getSelectedStructure() && getSelectedStructure().kind === "tower");
  return {
    fill: active ? COLORS.upgradeActive : COLORS.disabled,
    stroke: active ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.08)",
    text: active ? "#ffffff" : COLORS.disabledText
  };
}

function drawToolsGlyph(button) {
  const cx = button.x + button.w / 2;
  const cy = button.y + button.h / 2 - 3;
  ctx.strokeStyle = getButtonColors(button).text;
  ctx.lineWidth = 4;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(cx - 18, cy + 10);
  ctx.lineTo(cx + 6, cy - 14);
  ctx.moveTo(cx - 4, cy - 14);
  ctx.lineTo(cx + 16, cy + 8);
  ctx.stroke();
  ctx.fillStyle = getButtonColors(button).text;
  ctx.beginPath();
  ctx.arc(cx + 19, cy + 11, 3, 0, Math.PI * 2);
  ctx.fill();
}

function drawActionButtons() {
  for (const button of getActionButtons()) {
    const colors = getButtonColors(button);
    fillRoundedRect(button.x, button.y, button.w, button.h, 18, colors.fill, colors.stroke);

    if (button.id === "tools") {
      drawToolsGlyph(button);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillStyle = colors.text;
      ctx.font = "12px Avenir Next";
      ctx.fillText("Действия", button.x + button.w / 2, button.y + button.h - 18);
      continue;
    }

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = colors.text;
    ctx.font = "bold 16px Avenir Next";
    ctx.fillText(button.label, button.x + button.w / 2, button.y + button.h / 2 - 10);
    ctx.font = "13px Avenir Next";
    ctx.fillText(button.sublabel, button.x + button.w / 2, button.y + button.h / 2 + 14);
  }
}

function getBuildPickerButtons() {
  if (!state.buildPickerOpen) return [];
  return [
    {
      id: "simple",
      label: "Башня 1 уровня",
      sublabel: `${SIMPLE_TOWER_COST}`,
      x: BUTTONS_X,
      y: CONTROL_Y - 102,
      w: BUTTONS_W,
      h: 42
    },
    {
      id: "master",
      label: "Башня 4 уровня",
      sublabel: `${MASTER_TOWER_COST}`,
      x: BUTTONS_X,
      y: CONTROL_Y - 54,
      w: BUTTONS_W,
      h: 42
    },
    {
      id: "mine",
      label: "Шахта",
      sublabel: `x${state.mineStock}`,
      x: BUTTONS_X,
      y: CONTROL_Y - 6,
      w: BUTTONS_W,
      h: 42
    }
  ];
}

function drawBuildPicker() {
  const buttons = getBuildPickerButtons();
  if (!buttons.length) return;
  fillRoundedRect(BUTTONS_X - 8, CONTROL_Y - 110, BUTTONS_W + 16, 154, 18, "#173246", "rgba(255,255,255,0.12)");
  for (const button of buttons) {
    const selected = button.id === "mine" ? state.buildMode === "mine" : state.towerBuildMode === button.id && state.buildMode !== "mine";
    const fill = selected ? "#d4a93d" : "#48515c";
    const stroke = selected ? "#ffe7a2" : "rgba(255,255,255,0.08)";
    const text = selected ? "#1f1702" : "rgba(255,255,255,0.7)";
    fillRoundedRect(button.x, button.y, button.w, button.h, 12, fill, stroke);
    ctx.fillStyle = text;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 14px Avenir Next";
    ctx.fillText(button.label, button.x + 10, button.y + button.h / 2);
    ctx.textAlign = "right";
    ctx.font = "13px Avenir Next";
    ctx.fillText(button.sublabel, button.x + button.w - 10, button.y + button.h / 2);
  }
}

function getItemMenuButtons() {
  const slotIndex = state.selectedItemSlot;
  if (!state.itemMenuOpen || slotIndex == null) return [];
  const item = state.inventory[slotIndex];
  if (!item || item.itemId !== "mystery_bag") return [];
  const popupX = CONTROL_X;
  const popupY = CONTROL_Y - 156;
  const popupW = CONTROL_W;
  return [
    { id: "bag_tower", label: "Случайная башня", sub: "4/3/5/6 ур.", x: popupX + 10, y: popupY + 42, w: popupW - 20, h: 32 },
    { id: "bag_damage", label: "Урон всех башен", sub: `+${Math.round((state.globalDamageBoost + 0.2) * 100)}%`, x: popupX + 10, y: popupY + 80, w: popupW - 20, h: 32 },
    { id: "bag_nuggets", label: "Цена слитков", sub: `+${Math.round((state.nuggetSaleBonus + 0.3) * 100)}%`, x: popupX + 10, y: popupY + 118, w: popupW - 20, h: 32 }
  ];
}

function drawItemMenu() {
  const buttons = getItemMenuButtons();
  if (!buttons.length) return;
  const popupX = CONTROL_X;
  const popupY = CONTROL_Y - 156;
  const popupW = CONTROL_W;
  fillRoundedRect(popupX, popupY, popupW, 154, 18, "#173246", "rgba(255,255,255,0.12)");
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 15px Avenir Next";
  ctx.fillText("Таинственный мешок", popupX + 12, popupY + 10);

  for (const button of buttons) {
    fillRoundedRect(button.x, button.y, button.w, button.h, 12, "#284a63", "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "13px Avenir Next";
    ctx.fillText(button.label, button.x + 10, button.y + button.h / 2);
    ctx.textAlign = "right";
    ctx.fillText(button.sub, button.x + button.w - 10, button.y + button.h / 2);
  }
}

function getShopButtons() {
  return BOSS_DEFS.map((boss, index) => {
    const status = getBossShopStatus(boss.id);
    const cooldownLeft = getBossCooldownLeft(boss.id);
    const ready = cooldownLeft <= 0 && status.bought < boss.maxBuys && state.silver >= boss.cost;
    return {
      id: boss.id,
      x: SHOP_X + 12,
      y: SHOP_Y + 40 + index * 40,
      w: SHOP_W - 24,
      h: 34,
      label: `${boss.name} ${boss.cost}`,
      sublabel:
        status.bought >= boss.maxBuys
          ? "лимит"
          : cooldownLeft > 0
            ? `${Math.ceil(cooldownLeft)}с`
            : `шахты +${boss.rewardMines}`,
      ready
    };
  });
}

function drawShopPopup() {
  if (!state.shopOpen) return;

  const buttons = getShopButtons();
  const popupH = 52 + buttons.length * 40;
  fillRoundedRect(SHOP_X, SHOP_Y, SHOP_W, popupH, 18, "#173246", "rgba(255,255,255,0.12)");
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = COLORS.text;
  ctx.font = "bold 15px Avenir Next";
  ctx.fillText("Магазин", SHOP_X + 12, SHOP_Y + 10);

  for (const button of buttons) {
    const selected = state.selectedShopItem === button.id;
    fillRoundedRect(
      button.x,
      button.y,
      button.w,
      button.h,
      12,
      selected ? "#d4a93d" : button.ready ? "#253f53" : "#364552",
      selected ? "#ffe7a2" : "rgba(255,255,255,0.1)"
    );
    ctx.fillStyle = selected ? "#1f1702" : button.ready ? "#ffffff" : COLORS.disabledText;
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "13px Avenir Next";
    ctx.fillText(button.label, button.x + 10, button.y + button.h / 2);
    ctx.textAlign = "right";
    ctx.fillText(button.sublabel, button.x + button.w - 10, button.y + button.h / 2);
  }
}

function getToolsMenuButtons() {
  const selected = getSelectedStructure();
  if (!state.toolsOpen || !selected || selected.kind !== "tower") return [];
  return [
    { id: "upgrade", label: "Апгрейд", sub: canUpgradeTower(selected) ? "готов" : "нет пары" },
    { id: "sell_tower", label: "Продать башню", sub: `${getTowerSellValue(selected.level)}` },
    { id: "reroll", label: "Реролл", sub: `${TOOL_RE_ROLL_COST}` },
    { id: "move", label: "Переместить", sub: `${TOOL_MOVE_COST}` }
  ].map((button, index) => ({
    ...button,
    x: BUTTONS_X - 8,
    y: CONTROL_Y - 178 + index * 42,
    w: BUTTONS_W + 8,
    h: 36
  }));
}

function drawToolsPopup() {
  const buttons = getToolsMenuButtons();
  if (!buttons.length) return;

  fillRoundedRect(BUTTONS_X - 12, CONTROL_Y - 184, BUTTONS_W + 16, 176, 18, "#173246", "rgba(255,255,255,0.12)");
  ctx.fillStyle = COLORS.text;
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 15px Avenir Next";
  ctx.fillText("Меню башни", BUTTONS_X, CONTROL_Y - 174);

  for (const button of buttons) {
    const active =
      (button.id === "upgrade" && canUpgradeTower(getSelectedStructure())) ||
      (button.id === "sell_tower") ||
      (button.id === "reroll" && state.silver >= TOOL_RE_ROLL_COST) ||
      (button.id === "move" && state.silver >= TOOL_MOVE_COST);
    const selected = state.selectedToolAction === button.id;
    fillRoundedRect(
      button.x,
      button.y,
      button.w,
      button.h,
      12,
      selected && active ? "#d4a93d" : active ? "#284a63" : "#32485a",
      selected && active ? "#ffe7a2" : "rgba(255,255,255,0.08)"
    );
    ctx.fillStyle = !active ? COLORS.disabledText : selected ? "#1f1702" : "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "13px Avenir Next";
    ctx.fillText(button.label, button.x + 10, button.y + button.h / 2);
    ctx.textAlign = "right";
    ctx.fillText(button.sub, button.x + button.w - 10, button.y + button.h / 2);
  }
}

function drawControlPanel() {
  drawInfoPanel();
  drawActionButtons();
  drawBuildPicker();
  drawItemMenu();
  drawShopPopup();
  drawToolsPopup();
}

function getPauseMenuButtons() {
  const menuX = 78;
  const menuY = 144;
  const menuW = canvas.width - 156;
  const buttonW = menuW - 32;
  const buttonH = 50;
  return [
    { id: "resume", label: "Продолжить", x: menuX + 16, y: menuY + 76, w: buttonW, h: buttonH },
    { id: "settings", label: "Настройки", x: menuX + 16, y: menuY + 134, w: buttonW, h: buttonH },
    { id: "nickname", label: "Сменить ник", x: menuX + 16, y: menuY + 192, w: buttonW, h: buttonH },
    { id: "leaders", label: "Таблица лидеров", x: menuX + 16, y: menuY + 250, w: buttonW, h: buttonH },
    { id: "payments", label: "Магазин транзакций", x: menuX + 16, y: menuY + 308, w: buttonW, h: buttonH }
  ];
}

function drawPauseMenu() {
  if (!state.paused) return;
  ctx.fillStyle = "rgba(6, 12, 19, 0.68)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const menuX = 78;
  const menuY = 144;
  const menuW = canvas.width - 156;
  const menuH = 560;
  fillRoundedRect(menuX, menuY, menuW, menuH, 22, "#1a2f44", "rgba(255,255,255,0.14)");

  ctx.fillStyle = "#ffffff";
  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.font = "bold 30px Avenir Next";
  ctx.fillText("Пауза", menuX + 16, menuY + 18);
  ctx.font = "16px Avenir Next";
  ctx.fillStyle = COLORS.subtext;
  ctx.fillText("Игра остановлена. Выбери действие ниже.", menuX + 16, menuY + 56);

  for (const button of getPauseMenuButtons()) {
    const active = state.pausePanel === button.id;
    const fill = button.id === "resume" ? "#284a63" : active ? "#365f7e" : "#243b4e";
    fillRoundedRect(button.x, button.y, button.w, button.h, 14, fill, "rgba(255,255,255,0.08)");
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    ctx.font = "bold 16px Avenir Next";
    ctx.fillText(button.label, button.x + 12, button.y + button.h / 2);
  }

  const infoY = menuY + 376;
  const infoH = menuH - (infoY - menuY) - 16;
  fillRoundedRect(menuX + 16, infoY, menuW - 32, infoH, 16, "#223a4f", "rgba(255,255,255,0.08)");

  ctx.textAlign = "left";
  ctx.textBaseline = "top";
  ctx.fillStyle = "#d6e6f4";
  if (state.pausePanel === "leaders") {
    ctx.font = "bold 18px Avenir Next";
    ctx.fillText("Таблица лидеров", menuX + 28, infoY + 14);
    const entries = state.leaderboard.length
      ? state.leaderboard
      : [{ name: state.nickname || "Player", bestWave: state.bestWave, bestExtraKills: state.extraKills }];
    let y = infoY + 46;
    for (let i = 0; i < Math.min(5, entries.length); i += 1) {
      const entry = entries[i];
      ctx.font = i === 0 ? "bold 16px Avenir Next" : "15px Avenir Next";
      ctx.fillStyle = i === 0 ? "#ffe8a3" : "#d6e6f4";
      ctx.fillText(`${i + 1}. ${entry.name}`, menuX + 28, y);
      ctx.textAlign = "right";
      ctx.fillText(
        entry.bestExtraKills > 0 ? `${entry.bestExtraKills} экстра` : `${entry.bestWave} волн`,
        menuX + menuW - 28,
        y
      );
      ctx.textAlign = "left";
      y += 28;
    }
  } else {
    ctx.font = "15px Avenir Next";
    const copy =
      state.pausePanel === "settings"
        ? "Настройки: звук, управление, графика и уведомления будут здесь."
        : state.pausePanel === "nickname"
          ? `Текущий ник: ${state.nickname}. Нажми «Сменить ник», чтобы изменить его.`
          : state.pausePanel === "payments"
            ? "Магазин транзакций: внутриигровые покупки, пропуски и пакеты валюты."
            : "Нажми «Продолжить», чтобы вернуться в игру.";
    drawWrappedText(copy, menuX + 28, infoY + 14, menuW - 56, 22, "#d6e6f4", "15px Avenir Next", 6);
  }
}

function drawDefeatOverlay() {
  if (state.mode !== "defeat") return;
  ctx.fillStyle = "rgba(7, 13, 20, 0.72)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  fillRoundedRect(84, 392, canvas.width - 168, 160, 22, "#1c2b39", "rgba(255,255,255,0.12)");
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 26px Avenir Next";
  ctx.fillText("Поражение", canvas.width / 2, 442);
  ctx.font = "14px Avenir Next";
  ctx.fillText(`Волна: ${state.wave} • Убито: ${state.totalKills}`, canvas.width / 2, 486);
  ctx.fillText("Обнови страницу, чтобы начать заново.", canvas.width / 2, 518);
}

function drawBoardViewport() {
  ctx.save();
  ctx.beginPath();
  ctx.rect(BOARD_X, BOARD_Y, BOARD_W, MAP_VISUAL_H);
  ctx.clip();
  ctx.save();
  applyBoardCamera();
  drawBoard();
  drawTurnMarkers();
  drawMapLabels();
  drawSelection();
  drawMoveTargetHint();
  drawTowers();
  drawShots();
  drawEnemies();
  drawRiverLanes();
  ctx.restore();
  ctx.restore();
}

function draw() {
  drawBackground();
  if (!state.started && state.startCountdown <= 0) {
    ctx.save();
    ctx.filter = "blur(3px)";
    drawBoardViewport();
    ctx.restore();
  } else {
    drawBoardViewport();
  }
  drawPendingBagHint();
  drawTowerAnnouncement();
  drawDamagePanel();
  drawStatsStrip();
  drawAuraPanel();
  drawInventoryStrip();
  drawControlPanel();
  drawDefeatOverlay();
  drawPauseMenu();
  drawStartOverlay();
}

function getCanvasPoint(clientX, clientY) {
  const rect = canvas.getBoundingClientRect();
  return {
    x: ((clientX - rect.left) * canvas.width) / rect.width,
    y: ((clientY - rect.top) * canvas.height) / rect.height
  };
}

function isPointInBoard(point) {
  return point.x >= BOARD_X && point.x <= BOARD_X + BOARD_W && point.y >= BOARD_Y && point.y <= BOARD_Y + MAP_VISUAL_H;
}

function findBoardCellAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  if (!isPointInBoard(point)) return null;
  const world = screenToWorld(point);
  if (world.x < BOARD_X || world.y < BOARD_Y || world.x >= BOARD_X + BOARD_W || world.y >= BOARD_Y + BOARD_H) {
    return null;
  }
  const c = Math.floor((world.x - BOARD_X) / TILE);
  const r = Math.floor((world.y - BOARD_Y) / TILE);
  return { c, r };
}

function findBuildSlotAt(clientX, clientY) {
  const cell = findBoardCellAt(clientX, clientY);
  if (!cell || !isBuildCell(cell.c, cell.r)) return null;
  return cell;
}

function findEnemyAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  if (!isPointInBoard(point)) return null;
  const world = screenToWorld(point);
  for (let i = state.enemies.length - 1; i >= 0; i -= 1) {
    const enemy = state.enemies[i];
    const pos = enemyPixel(enemy);
    const radius = enemy.isBoss ? 11 : 9;
    if (Math.hypot(world.x - pos.x, world.y - pos.y) <= radius) {
      return enemy;
    }
  }
  return null;
}

function findActionButtonAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  return (
    getActionButtons().find(
      (button) =>
        point.x >= button.x &&
        point.x <= button.x + button.w &&
        point.y >= button.y &&
        point.y <= button.y + button.h
    ) || null
  );
}

function findBuildPickerActionAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  return (
    getBuildPickerButtons().find(
      (button) =>
        point.x >= button.x &&
        point.x <= button.x + button.w &&
        point.y >= button.y &&
        point.y <= button.y + button.h
    ) || null
  );
}

function findAuraBadgeAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  for (const badge of getAuraPanelBadges()) {
    if (
      point.x >= badge.x &&
      point.x <= badge.x + badge.w &&
      point.y >= badge.y &&
      point.y <= badge.y + badge.h
    ) {
      return badge.sourceId;
    }
  }
  return null;
}

function findDamageToggleAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  const button = getDamageToggleRect();
  return (
    point.x >= button.x &&
    point.x <= button.x + button.w &&
    point.y >= button.y &&
    point.y <= button.y + button.h
  );
}

function findStartButtonAt(clientX, clientY) {
  if (state.started) return false;
  const point = getCanvasPoint(clientX, clientY);
  const button = getStartButtonRect();
  return (
    point.x >= button.x &&
    point.x <= button.x + button.w &&
    point.y >= button.y &&
    point.y <= button.y + button.h
  );
}

function isPointInTopHud(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  return (
    point.x >= TOP_HUD_X &&
    point.x <= TOP_HUD_X + TOP_HUD_W &&
    point.y >= TOP_HUD_Y &&
    point.y <= TOP_HUD_Y + LAYOUT.statsH
  );
}

function findInventorySlotAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  for (const slot of getInventorySlotRects()) {
    if (
      point.x >= slot.x &&
      point.x <= slot.x + slot.w &&
      point.y >= slot.y &&
      point.y <= slot.y + slot.h
    ) {
      return slot.index;
    }
  }
  return null;
}

function findItemMenuActionAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  for (const button of getItemMenuButtons()) {
    if (
      point.x >= button.x &&
      point.x <= button.x + button.w &&
      point.y >= button.y &&
      point.y <= button.y + button.h
    ) {
      return button.id;
    }
  }
  return null;
}

function isPointInInfoPanel(point) {
  return (
    point.x >= CONTROL_X &&
    point.x <= CONTROL_X + INFO_W &&
    point.y >= CONTROL_Y &&
    point.y <= CONTROL_Y + CONTROL_H
  );
}

function findPauseButtonAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  const button = getPauseButtonRect();
  return (
    point.x >= button.x &&
    point.x <= button.x + button.w &&
    point.y >= button.y &&
    point.y <= button.y + button.h
  );
}

function findShopActionAt(clientX, clientY) {
  if (!state.shopOpen) return null;
  const point = getCanvasPoint(clientX, clientY);
  for (const button of getShopButtons()) {
    if (
      point.x >= button.x &&
      point.x <= button.x + button.w &&
      point.y >= button.y &&
      point.y <= button.y + button.h
    ) {
      return button.id;
    }
  }
  return null;
}

function findToolsActionAt(clientX, clientY) {
  const point = getCanvasPoint(clientX, clientY);
  for (const button of getToolsMenuButtons()) {
    if (
      point.x >= button.x &&
      point.x <= button.x + button.w &&
      point.y >= button.y &&
      point.y <= button.y + button.h
    ) {
      return button.id;
    }
  }
  return null;
}

function findPauseMenuActionAt(clientX, clientY) {
  if (!state.paused) return null;
  const point = getCanvasPoint(clientX, clientY);
  for (const button of getPauseMenuButtons()) {
    if (
      point.x >= button.x &&
      point.x <= button.x + button.w &&
      point.y >= button.y &&
      point.y <= button.y + button.h
    ) {
      return button.id;
    }
  }
  return null;
}

function tryPlaceOnSlot(slot) {
  const existing = getStructureAt(slot.c, slot.r);
  if (state.moveMode) {
    executeMove(slot);
    return;
  }

  if (state.pendingBagTowerDef) {
    if (existing) {
      state.selectedCell = { c: slot.c, r: slot.r };
      state.selectedEnemyId = null;
      state.selectedAuraSourceId = null;
      state.infoScroll = 0;
      return;
    }
    placePendingBagTower(slot);
    return;
  }

  if (existing) {
    state.selectedCell = { c: slot.c, r: slot.r };
    state.selectedEnemyId = null;
    state.selectedAuraSourceId = null;
    state.infoScroll = 0;
    return;
  }

  const mode = state.buildMode === "mine" ? "mine" : state.towerBuildMode;
  const pool = getPoolForBuildMode(mode);
  state.buildMode = mode;

  if (mode === "mine") {
    if (state.mineStock <= 0) return;
    const mine = createMine(slot.c, slot.r);
    state.towers.push(mine);
    state.mineStock -= 1;
    state.selectedCell = { c: mine.cellC, r: mine.cellR };
    state.selectedEnemyId = null;
    state.selectedAuraSourceId = null;
    state.infoScroll = 0;
    return;
  }

  if (!pool) return;
  let towerDef;
  if (mode === "simple") {
    const roll = Math.random();
    if (roll < 0.01) {
      towerDef = rollRandomFrom(getPoolForLevel(4));
    } else if (roll < 0.04) {
      towerDef = rollRandomFrom(getPoolForLevel(3));
    } else if (roll < 0.09) {
      towerDef = rollRandomFrom(getPoolForLevel(2));
    } else {
      towerDef = rollRandomFrom(pool);
    }
  } else {
    towerDef = rollRandomFrom(pool);
  }
  const buildCost = mode === "master" ? MASTER_TOWER_COST : SIMPLE_TOWER_COST;
  if (state.silver < buildCost) return;

  state.silver -= buildCost;
  const tower = createTower(slot.c, slot.r, towerDef);
  state.towers.push(tower);
  state.lastRoll = `${tower.name} (${tower.tier})`;
  state.selectedCell = { c: tower.cellC, r: tower.cellR };
  state.selectedEnemyId = null;
  state.selectedAuraSourceId = null;
  state.infoScroll = 0;
}

function handleToolsAction(action) {
  const selected = getSelectedStructure();
  if (!selected || selected.kind !== "tower") return;
  state.selectedToolAction = action;

  if (action === "upgrade") {
    if (canUpgradeTower(selected)) upgradeTower(selected);
    return;
  }
  if (action === "sell_tower") return sellTower(selected);
  if (action === "reroll") {
    rerollTower(selected);
    return;
  }
  if (action === "move") {
    startMoveMode();
  }
}

function handleTap(event) {
  if (findStartButtonAt(event.clientX, event.clientY)) {
    if (!state.nickname) {
      const nickname = ensureNickname();
      if (!nickname) {
        draw();
        return;
      }
    } else {
      state.started = true;
      state.startCountdown = 5;
      state.selectedCell = null;
      state.selectedEnemyId = null;
    }
    draw();
    return;
  }

  if (findPauseButtonAt(event.clientX, event.clientY)) {
    state.paused = !state.paused;
    if (!state.paused) {
      state.pausePanel = "settings";
    }
    draw();
    return;
  }

  const pauseAction = findPauseMenuActionAt(event.clientX, event.clientY);
  if (pauseAction) {
    if (pauseAction === "resume") {
      state.paused = false;
      state.pausePanel = "settings";
    } else if (pauseAction === "nickname") {
      ensureNickname(true);
      state.pausePanel = "nickname";
    } else {
      state.pausePanel = pauseAction;
    }
    draw();
    return;
  }

  if (state.paused) {
    draw();
    return;
  }

  if (!state.started) {
    draw();
    return;
  }

  const itemMenuAction = findItemMenuActionAt(event.clientX, event.clientY);
  if (itemMenuAction) {
    activateMysteryBagChoice(itemMenuAction);
    draw();
    return;
  }

  const inventorySlot = findInventorySlotAt(event.clientX, event.clientY);
  if (inventorySlot != null) {
    if (!state.inventory[inventorySlot]) {
      if (state.selectedItemSlot === inventorySlot) {
        state.selectedItemSlot = null;
        state.itemMenuOpen = false;
      }
      draw();
      return;
    }
    if (state.selectedItemSlot === inventorySlot && state.itemMenuOpen) {
      state.selectedItemSlot = null;
      state.itemMenuOpen = false;
    } else {
      state.selectedItemSlot = inventorySlot;
      state.itemMenuOpen = true;
    }
    draw();
    return;
  }

  const shopAction = findShopActionAt(event.clientX, event.clientY);
  if (shopAction) {
    state.selectedShopItem = shopAction;
    const bossDef = BOSS_DEFS.find((boss) => boss.id === shopAction);
    if (bossDef) buyBoss(bossDef);
    draw();
    return;
  }

  const buildPickerAction = findBuildPickerActionAt(event.clientX, event.clientY);
  if (buildPickerAction) {
    if (buildPickerAction.id === "mine") {
      state.buildMode = "mine";
    } else {
      state.towerBuildMode = buildPickerAction.id;
      state.buildMode = buildPickerAction.id;
    }
    draw();
    return;
  }

  const auraBadge = findAuraBadgeAt(event.clientX, event.clientY);
  if (auraBadge) {
    state.selectedAuraSourceId = auraBadge;
    draw();
    return;
  }

  if (findDamageToggleAt(event.clientX, event.clientY)) {
    state.damagePanelOpen = !state.damagePanelOpen;
    draw();
    return;
  }

  const toolsAction = findToolsActionAt(event.clientX, event.clientY);
  if (toolsAction) {
    handleToolsAction(toolsAction);
    draw();
    return;
  }

  const actionButton = findActionButtonAt(event.clientX, event.clientY);
  if (actionButton) {
    if (actionButton.id === "build") {
      state.buildMode = state.towerBuildMode;
      state.buildPickerOpen = !state.buildPickerOpen;
      state.moveMode = false;
      state.shopOpen = false;
      state.toolsOpen = false;
      state.itemMenuOpen = false;
    } else if (actionButton.id === "sell") {
      sellNuggets();
    } else if (actionButton.id === "shop") {
      state.shopOpen = !state.shopOpen;
      state.buildPickerOpen = false;
      state.toolsOpen = false;
      state.itemMenuOpen = false;
    } else if (actionButton.id === "tools") {
      const selected = getSelectedStructure();
      if (selected && selected.kind === "tower") {
        state.toolsOpen = !state.toolsOpen;
        state.shopOpen = false;
        state.buildPickerOpen = false;
        state.itemMenuOpen = false;
      }
    }
    draw();
    return;
  }

  if (isPointInTopHud(event.clientX, event.clientY)) {
    draw();
    return;
  }

  const boardCell = findBoardCellAt(event.clientX, event.clientY);
  if (boardCell) {
    const hitEnemy = findEnemyAt(event.clientX, event.clientY);
    if (hitEnemy) {
      state.selectedEnemyId = hitEnemy.id;
      state.selectedCell = null;
      state.selectedAuraSourceId = null;
      state.infoScroll = 0;
      draw();
      return;
    }
    if (isBuildCell(boardCell.c, boardCell.r)) {
      tryPlaceOnSlot(boardCell);
    } else {
      state.selectedCell = null;
      state.selectedEnemyId = null;
      state.selectedAuraSourceId = null;
      state.infoScroll = 0;
      state.moveMode = false;
    }
    draw();
    return;
  }
  draw();
}

function getActiveBoardPointers() {
  return [...pointerState.pointers.values()].filter((entry) => entry.board);
}

canvas.addEventListener("pointerdown", (event) => {
  const point = getCanvasPoint(event.clientX, event.clientY);
  if (isPointInInfoPanel(point)) {
    pointerState.infoPointerId = event.pointerId;
    pointerState.lastInfoY = point.y;
    pointerState.infoMoved = false;
  }
  const board = isPointInBoard(point);
  pointerState.pointers.set(event.pointerId, {
    x: point.x,
    y: point.y,
    startX: point.x,
    startY: point.y,
    board
  });
  state.hoveredSlot = findBuildSlotAt(event.clientX, event.clientY);

  const activeBoardPointers = getActiveBoardPointers();
  if (activeBoardPointers.length >= 2) {
    const [a, b] = activeBoardPointers;
    pointerState.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
    pointerState.panPointerId = null;
    pointerState.tapPointerId = null;
    pointerState.moved = true;
    return;
  }

  pointerState.panPointerId = board ? event.pointerId : null;
  pointerState.tapPointerId = event.pointerId;
  pointerState.lastX = point.x;
  pointerState.lastY = point.y;
  pointerState.moved = false;
  pointerState.board = board;
});

canvas.addEventListener("pointermove", (event) => {
  const point = getCanvasPoint(event.clientX, event.clientY);
  state.hoveredSlot = findBuildSlotAt(event.clientX, event.clientY);
  const pointer = pointerState.pointers.get(event.pointerId);
  if (!pointer) return;

  pointer.x = point.x;
  pointer.y = point.y;

  if (pointerState.infoPointerId === event.pointerId) {
    const dy = point.y - pointerState.lastInfoY;
    if (Math.abs(dy) > 2) {
      pointerState.infoMoved = true;
      state.infoScroll = Math.max(0, Math.min(state.infoScrollMax, state.infoScroll - dy));
      draw();
    }
    pointerState.lastInfoY = point.y;
  }

  const activeBoardPointers = getActiveBoardPointers();
  if (activeBoardPointers.length >= 2) {
    const [a, b] = activeBoardPointers;
    const nextDistance = Math.hypot(a.x - b.x, a.y - b.y);
    if (pointerState.pinchDistance > 0 && nextDistance > 0) {
      const midpoint = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
      zoomCameraAt(nextDistance / pointerState.pinchDistance, midpoint);
      draw();
    }
    pointerState.pinchDistance = nextDistance;
    pointerState.panPointerId = null;
    pointerState.moved = true;
    return;
  }

  if (pointerState.panPointerId !== event.pointerId || !pointer.board) return;
  const dx = point.x - pointerState.lastX;
  const dy = point.y - pointerState.lastY;
  const totalDx = point.x - pointer.startX;
  const totalDy = point.y - pointer.startY;

  if (Math.hypot(totalDx, totalDy) > 6) {
    pointerState.moved = true;
  }

  if (pointerState.moved) {
    state.camera.panX += dx;
    state.camera.panY += dy;
    clampCamera();
    draw();
  }

  pointerState.lastX = point.x;
  pointerState.lastY = point.y;
});

function finishPointer(event) {
  const pointer = pointerState.pointers.get(event.pointerId);
  if (!pointer) return;
  const tapPointerId = pointerState.tapPointerId;
  const blockedByInfo = pointerState.infoPointerId === event.pointerId && pointerState.infoMoved;
  const shouldTap = tapPointerId === event.pointerId && !pointerState.moved;
  pointerState.pointers.delete(event.pointerId);

  if (pointerState.infoPointerId === event.pointerId) {
    pointerState.infoPointerId = null;
    pointerState.infoMoved = false;
  }

  const activeBoardPointers = getActiveBoardPointers();
  if (activeBoardPointers.length >= 2) {
    const [a, b] = activeBoardPointers;
    pointerState.pinchDistance = Math.hypot(a.x - b.x, a.y - b.y);
  } else {
    pointerState.pinchDistance = 0;
  }

  if (pointerState.panPointerId === event.pointerId) {
    pointerState.panPointerId = null;
  }
  if (pointerState.tapPointerId === event.pointerId) {
    pointerState.tapPointerId = null;
  }
  if (!pointerState.pointers.size) {
    pointerState.moved = false;
    pointerState.board = false;
  }

  if (shouldTap && !blockedByInfo) {
    handleTap(event);
  }
}

canvas.addEventListener("pointerup", finishPointer);
canvas.addEventListener("pointercancel", finishPointer);

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();
  if (key === "a") {
    state.towerBuildMode = "simple";
    state.buildMode = "simple";
    state.moveMode = false;
    clearMenus();
    draw();
    return;
  }
  if (key === "m") {
    state.towerBuildMode = "master";
    state.buildMode = "master";
    state.moveMode = false;
    clearMenus();
    draw();
    return;
  }
  if (key === "b") {
    state.buildMode = "mine";
    state.moveMode = false;
    clearMenus();
    draw();
    return;
  }
  if (key !== "f") return;
  if (document.fullscreenElement) {
    document.exitFullscreen();
  } else {
    canvas.requestFullscreen?.();
  }
});

function renderGameToText() {
  const selected = getSelectedStructure();
  const selectedEnemy = getSelectedEnemy();
  const remaining = Math.max(0, ENEMIES_PER_WAVE - state.waveKilled - state.waveEscaped);

  const payload = {
    mode: state.mode,
    note: {
      origin: { x: 0, y: 0 },
      axes: "+x right, +y down",
      gridOrigin: { x: BOARD_X, y: BOARD_Y },
      tile: TILE
    },
    wave: {
      current: state.wave,
      endlessMode: state.endlessMode,
      extraWave: state.extraWave,
      extraKills: state.extraKills,
      active: state.waveActive,
      spawned: state.waveSpawned,
      remaining,
      enemiesAlive: state.enemies.length,
      lives: state.lives,
      silver: state.silver,
      goldNuggets: state.goldNuggets,
      currentNuggetPrice: state.currentNuggetPrice,
      adjustedNuggetPrice: getAdjustedNuggetPrice(),
      lastMineYield: state.lastMineYield,
      lastNuggetValues: state.lastNuggetValues,
      lastMineIncome: state.lastMineIncome,
      mineStock: state.mineStock
    },
    build: {
      mode: state.buildMode,
      towerBuildMode: state.towerBuildMode,
      buildPickerOpen: state.buildPickerOpen,
      shopOpen: state.shopOpen,
      toolsOpen: state.toolsOpen,
      paused: state.paused,
      pausePanel: state.pausePanel,
      started: state.started,
      startCountdown: state.startCountdown,
      moveMode: state.moveMode,
      selectedEnemyId: state.selectedEnemyId,
      selectedAuraSourceId: state.selectedAuraSourceId,
      selectedShopItem: state.selectedShopItem,
      selectedToolAction: state.selectedToolAction,
      selectedItemSlot: state.selectedItemSlot,
      itemMenuOpen: state.itemMenuOpen,
      pendingBagTower: state.pendingBagTowerDef
        ? { id: state.pendingBagTowerDef.id, level: state.pendingBagTowerDef.level, name: state.pendingBagTowerDef.name }
        : null,
      damagePanelOpen: state.damagePanelOpen,
      infoScroll: state.infoScroll,
      bossShop: state.bossShop,
      lastRoll: state.lastRoll,
      selectedCell: state.selectedCell,
      upgradeAvailable: canUpgradeTower(selected),
      camera: state.camera
    },
    profile: {
      nickname: state.nickname,
      bestWave: state.bestWave
    },
    leaderboard: state.leaderboard,
    modifiers: {
      globalDamageBoost: state.globalDamageBoost,
      nuggetSaleBonus: state.nuggetSaleBonus
    },
    towerAnnouncement: state.towerAnnouncement,
    inventory: state.inventory,
    topDamage: getDisplayedTopDamageEntries(),
    selectedEnemy: selectedEnemy
      ? {
          id: selectedEnemy.id,
          boss: selectedEnemy.isBoss,
          name: selectedEnemy.name,
          hp: selectedEnemy.hp,
          maxHp: selectedEnemy.maxHp,
          armor: selectedEnemy.armor,
          magicResist: selectedEnemy.magicResist
        }
      : null,
    appliedAuras:
      selected && selected.kind === "tower"
        ? getAppliedAuras(selected).map((aura) => ({
            sourceId: aura.sourceId,
            sourceName: aura.sourceName,
            sourceTier: aura.sourceTier,
            damageBoost: aura.damageBoost,
            speedBoost: aura.speedBoost,
            summary: aura.summary
          }))
        : [],
    selected: selected
      ? selected.kind === "mine"
        ? {
            kind: "mine",
            cell: { c: selected.cellC, r: selected.cellR },
            remainingTurns: selected.remainingTurns,
            yieldNuggets: selected.yieldNuggets
          }
        : {
            kind: "tower",
            cell: { c: selected.cellC, r: selected.cellR },
            type: selected.name,
            tier: selected.tier,
            level: selected.level,
            attackType: selected.attackType,
            cooldown: selected.cooldown,
            rangeCells: selected.rangeCells,
            talent: selected.talent
          }
      : null,
    towers: state.towers.map((tower) => {
      if (tower.kind === "mine") {
        return {
          kind: "mine",
          cell: { c: tower.cellC, r: tower.cellR },
          remainingTurns: tower.remainingTurns,
          yieldNuggets: tower.yieldNuggets
        };
      }
      return {
        kind: "tower",
        cell: { c: tower.cellC, r: tower.cellR },
        type: tower.name,
        tier: tower.tier,
        level: tower.level,
        towerId: tower.towerId,
        damage: tower.damage,
        attackType: tower.attackType,
        rangeCells: tower.rangeCells,
        cooldownReadyIn: Math.max(0, tower.nextShotAt - state.time).toFixed(2)
      };
    }),
    enemies: state.enemies.slice(0, 8).map((enemy) => ({
      id: enemy.id,
      bonus: enemy.isBonus,
      boss: enemy.isBoss,
      bossId: enemy.bossId,
      name: enemy.name,
      rewardSilver: enemy.rewardSilver,
      rewardMines: enemy.rewardMines,
      hp: enemy.hp,
      armor: enemy.armor,
      magicResist: enemy.magicResist,
      magicResistDebuffPercent: enemy.magicResistDebuffPercent,
      segment: enemy.segment,
      pos: enemyPixel(enemy)
    }))
  };

  return JSON.stringify(payload, null, 2);
}

window.render_game_to_text = renderGameToText;

window.advanceTime = (ms) => {
  const steps = Math.max(1, Math.round(ms / (1000 / 60)));
  const dt = ms / 1000 / steps;
  for (let i = 0; i < steps; i += 1) {
    update(dt);
  }
  draw();
  return Promise.resolve();
};

function initTelegramWebApp() {
  const tg = window.Telegram?.WebApp;
  applyTelegramViewportLayout();
  if (!tg) {
    window.addEventListener("resize", applyTelegramViewportLayout);
    return;
  }
  if (typeof tg.onEvent === "function") {
    tg.onEvent("viewportChanged", applyTelegramViewportLayout);
  }
  window.addEventListener("resize", applyTelegramViewportLayout);
}

let lastFrame = performance.now();
function frame(now) {
  const dt = Math.min((now - lastFrame) / 1000, 0.05);
  lastFrame = now;
  update(dt);
  draw();
  requestAnimationFrame(frame);
}

state.nickname = loadStoredNickname();
state.bestWave = loadBestWave();
state.leaderboard = loadLeaderboard();
syncLeaderboardEntry();
initTelegramWebApp();

draw();
if (!navigator.webdriver) {
  requestAnimationFrame(frame);
}
