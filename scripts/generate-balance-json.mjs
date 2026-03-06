import fs from "node:fs";
import path from "node:path";

const projectRoot = process.cwd();
const sourcePath = path.join(projectRoot, "main.js");
const outDir = path.join(projectRoot, "data");

const src = fs.readFileSync(sourcePath, "utf8");

function isSpace(ch) {
  return ch === " " || ch === "\n" || ch === "\r" || ch === "\t";
}

function skipString(text, start, quote) {
  let i = start + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === quote) return i + 1;
    i += 1;
  }
  return i;
}

function skipTemplate(text, start) {
  let i = start + 1;
  while (i < text.length) {
    const ch = text[i];
    if (ch === "\\") {
      i += 2;
      continue;
    }
    if (ch === "`") return i + 1;
    if (ch === "$") {
      if (text[i + 1] === "{") {
        i = skipBalanced(text, i + 1, "{", "}");
        continue;
      }
    }
    i += 1;
  }
  return i;
}

function skipLineComment(text, start) {
  let i = start + 2;
  while (i < text.length && text[i] !== "\n") i += 1;
  return i;
}

function skipBlockComment(text, start) {
  let i = start + 2;
  while (i + 1 < text.length) {
    if (text[i] === "*" && text[i + 1] === "/") return i + 2;
    i += 1;
  }
  return i;
}

function skipBalanced(text, start, open, close) {
  let i = start;
  let depth = 0;
  while (i < text.length) {
    const ch = text[i];
    const next = text[i + 1];

    if (ch === "\"" || ch === "'") {
      i = skipString(text, i, ch);
      continue;
    }
    if (ch === "`") {
      i = skipTemplate(text, i);
      continue;
    }
    if (ch === "/" && next === "/") {
      i = skipLineComment(text, i);
      continue;
    }
    if (ch === "/" && next === "*") {
      i = skipBlockComment(text, i);
      continue;
    }

    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) return i + 1;
    }
    i += 1;
  }
  return i;
}

function extractConstExpression(name) {
  const token = `const ${name}`;
  const pos = src.indexOf(token);
  if (pos < 0) throw new Error(`Const not found: ${name}`);
  const eq = src.indexOf("=", pos);
  if (eq < 0) throw new Error(`Equals not found: ${name}`);

  let i = eq + 1;
  while (i < src.length && isSpace(src[i])) i += 1;

  const first = src[i];
  if (first === "[" || first === "{" || first === "(") {
    const close = first === "[" ? "]" : first === "{" ? "}" : ")";
    const end = skipBalanced(src, i, first, close);
    return src.slice(i, end).trim();
  }

  let end = i;
  while (end < src.length && src[end] !== ";") end += 1;
  return src.slice(i, end).trim();
}

function evalExpr(expr, scope = {}) {
  const keys = Object.keys(scope);
  const vals = Object.values(scope);
  // eslint-disable-next-line no-new-func
  const fn = new Function(...keys, `return (${expr});`);
  return fn(...vals);
}

const evalScopeCommon = {
  readNumber: (value, fallback) => (Number.isFinite(value) ? value : fallback),
  readObject: (value, fallback) =>
    value && typeof value === "object" && !Array.isArray(value) ? value : fallback,
  WAVE_CONSTANTS: {},
  WAVE_BALANCE_CONFIG: {}
};

const simpleCost = Number(evalExpr(extractConstExpression("SIMPLE_TOWER_COST"), evalScopeCommon));
const masterCost = Number(evalExpr(extractConstExpression("MASTER_TOWER_COST"), evalScopeCommon));

const makeTower = (spec) => ({ ...spec });

const levelConstNames = [
  "SIMPLE_TOWERS",
  "ADVANCED_TOWERS",
  "MASTER_TOWERS",
  "EXPERT_TOWERS",
  "LEGEND_TOWERS",
  "MYTHIC_TOWERS"
];

const levelByConst = {
  SIMPLE_TOWERS: 1,
  ADVANCED_TOWERS: 2,
  MASTER_TOWERS: 3,
  EXPERT_TOWERS: 4,
  LEGEND_TOWERS: 5,
  MYTHIC_TOWERS: 6
};

const towersById = {};
const orderByLevel = { 1: [], 2: [], 3: [], 4: [], 5: [], 6: [] };

for (const name of levelConstNames) {
  const expr = extractConstExpression(name);
  const towers = evalExpr(expr, {
    makeTower,
    SIMPLE_TOWER_COST: simpleCost,
    MASTER_TOWER_COST: masterCost
  });
  const level = levelByConst[name];
  for (const tower of towers) {
    towersById[tower.id] = tower;
    orderByLevel[level].push(tower.id);
  }
}

const shopGroups = evalExpr(extractConstExpression("SHOP_ITEM_GROUPS"));
const bosses = evalExpr(extractConstExpression("DEFAULT_BOSS_DEFS"));
const towerSellValues = evalExpr(extractConstExpression("TOWER_SELL_VALUES"), evalScopeCommon);

const constants = {
  simpleTowerCost: Number(evalExpr(extractConstExpression("SIMPLE_TOWER_COST"), evalScopeCommon)),
  masterTowerCost: Number(evalExpr(extractConstExpression("MASTER_TOWER_COST"), evalScopeCommon)),
  startSilver: Number(evalExpr(extractConstExpression("SIMPLE_TOWER_COST"), evalScopeCommon)) * 4,
  maxTowerAttackRangeCells: Number(evalExpr(extractConstExpression("MAX_TOWER_ATTACK_RANGE_CELLS"), evalScopeCommon)),
  enemiesPerWave: Number(evalExpr(extractConstExpression("ENEMIES_PER_WAVE"), evalScopeCommon)),
  enemySpeedCells: Number(evalExpr(extractConstExpression("ENEMY_SPEED_CELLS"), evalScopeCommon)),
  spawnInterval: Number(evalExpr(extractConstExpression("SPAWN_INTERVAL"), evalScopeCommon)),
  waveBreak: Number(evalExpr(extractConstExpression("WAVE_BREAK"), evalScopeCommon)),
  roundDuration: Number(evalExpr(extractConstExpression("ROUND_DURATION"), evalScopeCommon)),
  endlessStartDelay: Number(evalExpr(extractConstExpression("ENDLESS_START_DELAY"), evalScopeCommon)),
  startLives: Number(evalExpr(extractConstExpression("START_LIVES"), evalScopeCommon)),
  toolRerollCost: Number(evalExpr(extractConstExpression("TOOL_RE_ROLL_COST"), evalScopeCommon)),
  toolMoveCost: Number(evalExpr(extractConstExpression("TOOL_MOVE_COST"), evalScopeCommon)),
  itemPurchaseCost: Number(evalExpr(extractConstExpression("ITEM_PURCHASE_COST"), evalScopeCommon)),
  mysteryBagCost: Number(evalExpr(extractConstExpression("MYSTERY_BAG_COST"), evalScopeCommon)),
  mysteryBagShopLimit: Number(evalExpr(extractConstExpression("MYSTERY_BAG_SHOP_LIMIT"), evalScopeCommon)),
  attributeUpgradeCost: Number(evalExpr(extractConstExpression("ATTRIBUTE_UPGRADE_COST"), evalScopeCommon)),
  inventorySlotCount: Number(evalExpr(extractConstExpression("INVENTORY_SLOT_COUNT"), evalScopeCommon))
};

const towersPayload = {
  orderByLevel,
  byId: towersById
};

const itemsPayload = {
  itemGroups: shopGroups,
  byId: Object.fromEntries(
    shopGroups.flat().map((item) => [item.id, item])
  )
};

const wavesPayload = {
  constants,
  towerSellValues,
  bosses,
  formulas: {
    waveStats: {
      earlyCapWave: 5,
      baseHp: 90,
      earlyHpPerWave: 32,
      baseArmor: 4,
      earlyArmorPerWave: 1.6,
      lateHpPerWave: 56,
      lateArmorPerWave: 2.6
    },
    magicResistBrackets: [
      { fromWave: 1, resist: 0.2 },
      { fromWave: 5, resist: 0.25 },
      { fromWave: 10, resist: 0.3 },
      { fromWave: 15, resist: 0.35 },
      { fromWave: 20, resist: 0.4 },
      { fromWave: 25, resist: 0.45 }
    ],
    nuggetPrice: {
      minBase: 50,
      maxBase: 100,
      perWave: 2,
      maxCap: 160
    },
    rewardSilver: {
      regularCap: 30,
      bonusBase: 75,
      bonusPerWave: 35
    },
    endless: {
      speedBoostFromExtraWave: 850,
      speedBoostMultiplier: 1.25,
      magicResistFromExtraWave: 250,
      magicResistValue: 0.9,
      physicalResistFromExtraWave: 500,
      physicalResistValue: 0.9,
      baseWaveForExtra: 30,
      minesStopWave: 30
    },
    randomRolls: {
      shopItemTier2Chance: 0.2,
      bagTowerLevelWeights: [
        { level: 4, weight: 97 },
        { level: 3, weight: 1.5 },
        { level: 5, weight: 1 },
        { level: 6, weight: 0.5 }
      ],
      buildSimple: {
        level4Chance: 0.001,
        level3Chance: 0.005,
        level2Chance: 0.01
      },
      buildMaster: {
        level6Chance: 0.0001,
        level5Chance: 0.005
      }
    }
  }
};

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(path.join(outDir, "towers.balance.json"), `${JSON.stringify(towersPayload, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, "items.balance.json"), `${JSON.stringify(itemsPayload, null, 2)}\n`);
fs.writeFileSync(path.join(outDir, "waves.balance.json"), `${JSON.stringify(wavesPayload, null, 2)}\n`);

console.log("Generated:", path.join("data", "towers.balance.json"));
console.log("Generated:", path.join("data", "items.balance.json"));
console.log("Generated:", path.join("data", "waves.balance.json"));
