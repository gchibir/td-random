const LIMIT = 10;
const DEFAULT_TABLE = "leaderboard";

function getMemoryStore() {
  const memory = (globalThis.__tdRandomLeaderboardStore = globalThis.__tdRandomLeaderboardStore || new Map());
  return {
    async load() {
      const raw = memory.get("entries");
      return raw ? JSON.parse(raw) : [];
    },
    async save(entries) {
      memory.set("entries", JSON.stringify(entries));
      return entries;
    }
  };
}

function getSupabaseConfig() {
  const url = process.env.SUPABASE_URL || "";
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const table = process.env.SUPABASE_LEADERBOARD_TABLE || DEFAULT_TABLE;
  if (!url || !key) return null;
  return { url: url.replace(/\/+$/, ""), key, table };
}

function normalizeEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) return [];
  const deduped = new Map();
  for (const entry of rawEntries) {
    const playerKey =
      typeof entry.playerKey === "string" && entry.playerKey
        ? entry.playerKey
        : typeof entry.player_key === "string" && entry.player_key
          ? entry.player_key
          : "";
    const name = typeof entry.name === "string" ? entry.name : "";
    if (!playerKey || !name) continue;

    const normalized = {
      playerKey: String(playerKey).slice(0, 80),
      name: String(name).slice(0, 20),
      bestWave: Math.max(1, Number(entry.bestWave ?? entry.best_wave) || 1),
      bestExtraKills: Math.max(0, Number(entry.bestExtraKills ?? entry.best_extra_kills) || 0),
      updatedAt: Number(entry.updatedAt ?? new Date(entry.updated_at || 0).getTime()) || 0
    };

    const existing = deduped.get(normalized.playerKey);
    if (!existing) {
      deduped.set(normalized.playerKey, normalized);
      continue;
    }
    existing.name = normalized.name;
    existing.bestWave = Math.max(existing.bestWave, normalized.bestWave);
    existing.bestExtraKills = Math.max(existing.bestExtraKills, normalized.bestExtraKills);
    existing.updatedAt = Math.max(existing.updatedAt, normalized.updatedAt);
  }

  return [...deduped.values()]
    .sort((a, b) => b.bestExtraKills - a.bestExtraKills || b.bestWave - a.bestWave || b.updatedAt - a.updatedAt)
    .slice(0, LIMIT);
}

async function supabaseRequest(config, path, options = {}) {
  const response = await fetch(`${config.url}/rest/v1/${path}`, {
    method: options.method || "GET",
    headers: {
      apikey: config.key,
      Authorization: `Bearer ${config.key}`,
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Supabase ${response.status}: ${text}`);
  }

  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

async function loadEntries() {
  const config = getSupabaseConfig();
  if (!config) {
    return getMemoryStore().load();
  }

  const rows = await supabaseRequest(
    config,
    `${encodeURIComponent(config.table)}?select=player_key,name,best_wave,best_extra_kills,updated_at&order=best_extra_kills.desc,best_wave.desc,updated_at.desc&limit=${LIMIT}`
  );
  return normalizeEntries(rows);
}

async function saveEntry(entry) {
  const config = getSupabaseConfig();
  if (!config) {
    const memoryStore = getMemoryStore();
    const entries = normalizeEntries(await memoryStore.load());
    const existing = entries.find((item) => item.playerKey === entry.playerKey);
    if (existing) {
      existing.name = entry.name;
      existing.bestWave = Math.max(existing.bestWave, entry.bestWave);
      existing.bestExtraKills = Math.max(existing.bestExtraKills, entry.bestExtraKills);
      existing.updatedAt = Date.now();
    } else {
      entries.push({ ...entry, updatedAt: Date.now() });
    }
    return memoryStore.save(normalizeEntries(entries));
  }

  await supabaseRequest(config, `${encodeURIComponent(config.table)}?on_conflict=player_key`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates"
    },
    body: [
      {
        player_key: entry.playerKey,
        name: entry.name,
        best_wave: entry.bestWave,
        best_extra_kills: entry.bestExtraKills,
        updated_at: new Date().toISOString()
      }
    ]
  });

  return loadEntries();
}

module.exports = async (req, res) => {
  try {
    if (req.method === "GET") {
      const entries = await loadEntries();
      res.setHeader("Cache-Control", "no-store");
      return res.status(200).json({ entries });
    }

    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const body = req.body && typeof req.body === "object" ? req.body : {};
    const playerKey = typeof body.playerKey === "string" ? body.playerKey.trim().slice(0, 80) : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 20) : "";
    const bestWave = Math.max(1, Number(body.bestWave) || 1);
    const bestExtraKills = Math.max(0, Number(body.bestExtraKills) || 0);

    if (!playerKey || !name) {
      return res.status(400).json({ error: "Missing playerKey or name" });
    }

    const entries = await saveEntry({
      playerKey,
      name,
      bestWave,
      bestExtraKills
    });

    res.setHeader("Cache-Control", "no-store");
    return res.status(200).json({ entries });
  } catch (error) {
    return res.status(500).json({
      error: "Leaderboard function failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
