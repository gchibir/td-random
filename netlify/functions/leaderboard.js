const LIMIT = 10;
const ADMIN_LIMIT = 50;
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

function normalizeEntries(rawEntries, limit = LIMIT) {
  if (!Array.isArray(rawEntries)) return [];
  const deduped = new Map();
  for (const entry of rawEntries) {
    const playerKey =
      typeof entry.playerKey === "string" && entry.playerKey
        ? entry.playerKey
        : typeof entry.player_key === "string" && entry.player_key
          ? entry.player_key
          : "";
    const name =
      typeof entry.name === "string"
        ? entry.name
        : "";
    if (!playerKey || !name) continue;

    const normalized = {
      playerKey: String(playerKey).slice(0, 80),
      name: String(name).slice(0, 20),
      bestWave: Math.max(1, Number(entry.bestWave ?? entry.best_wave) || 1),
      bestExtraKills: Math.max(0, Number(entry.bestExtraKills ?? entry.best_extra_kills) || 0),
      totalPlaySeconds: Math.max(0, Number(entry.totalPlaySeconds ?? entry.total_play_seconds) || 0),
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
    existing.totalPlaySeconds = Math.max(existing.totalPlaySeconds || 0, normalized.totalPlaySeconds || 0);
    existing.updatedAt = Math.max(existing.updatedAt, normalized.updatedAt);
  }

  return [...deduped.values()]
    .sort((a, b) => b.bestExtraKills - a.bestExtraKills || b.bestWave - a.bestWave || b.updatedAt - a.updatedAt)
    .slice(0, limit);
}

function getAdminToken(event) {
  const headerToken = event.headers?.["x-admin-token"] || event.headers?.["X-Admin-Token"];
  if (typeof headerToken === "string" && headerToken.trim()) return headerToken.trim();
  const queryToken = event.queryStringParameters?.token;
  if (typeof queryToken === "string" && queryToken.trim()) return queryToken.trim();
  return "";
}

function isAdminRequestAuthorized(event) {
  const configured = (process.env.ADMIN_STATS_TOKEN || "").trim();
  if (!configured) return true;
  const provided = getAdminToken(event);
  return provided === configured;
}

function buildAdminStats(entries) {
  const normalized = normalizeEntries(entries, Number.POSITIVE_INFINITY);
  const sortedByPlaytime = [...normalized].sort(
    (a, b) =>
      (b.totalPlaySeconds || 0) - (a.totalPlaySeconds || 0) ||
      b.bestExtraKills - a.bestExtraKills ||
      b.bestWave - a.bestWave ||
      b.updatedAt - a.updatedAt
  );
  return {
    totalPlaySeconds: sortedByPlaytime.reduce((sum, entry) => sum + (entry.totalPlaySeconds || 0), 0),
    totalPlayers: sortedByPlaytime.length,
    topActivePlayers: sortedByPlaytime.slice(0, ADMIN_LIMIT).map((entry) => ({
      playerKey: entry.playerKey,
      name: entry.name,
      totalPlaySeconds: entry.totalPlaySeconds || 0,
      bestWave: entry.bestWave,
      bestExtraKills: entry.bestExtraKills,
      updatedAt: entry.updatedAt
    }))
  };
}

function json(statusCode, payload) {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    },
    body: JSON.stringify(payload)
  };
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
    `${encodeURIComponent(config.table)}?select=player_key,name,best_wave,best_extra_kills,total_play_seconds,updated_at&order=best_extra_kills.desc,best_wave.desc,updated_at.desc&limit=${LIMIT}`
  );
  return normalizeEntries(rows);
}

async function loadEntriesForAdmin() {
  const config = getSupabaseConfig();
  if (!config) {
    return normalizeEntries(await getMemoryStore().load(), Number.POSITIVE_INFINITY);
  }
  const rows = await supabaseRequest(
    config,
    `${encodeURIComponent(config.table)}?select=player_key,name,best_wave,best_extra_kills,total_play_seconds,updated_at&order=total_play_seconds.desc,best_extra_kills.desc,best_wave.desc,updated_at.desc&limit=5000`
  );
  return normalizeEntries(rows, Number.POSITIVE_INFINITY);
}

async function loadEntriesByPlayerKeys(config, playerKeys) {
  const normalizedKeys = [...new Set(playerKeys.filter((entry) => typeof entry === "string" && entry))];
  if (!normalizedKeys.length) return [];
  const rows = await supabaseRequest(
    config,
    `${encodeURIComponent(config.table)}?select=player_key,name,best_wave,best_extra_kills,total_play_seconds,updated_at&player_key=in.(${encodeURIComponent(
      normalizedKeys.map((value) => `"${String(value).replace(/"/g, '\\"')}"`).join(",")
    )})`
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
      existing.totalPlaySeconds = Math.max(existing.totalPlaySeconds || 0, entry.totalPlaySeconds || 0) + (entry.playSecondsDelta || 0);
      existing.updatedAt = Date.now();
    } else {
      entries.push({
        ...entry,
        totalPlaySeconds: (entry.totalPlaySeconds || 0) + (entry.playSecondsDelta || 0),
        updatedAt: Date.now()
      });
    }
    return memoryStore.save(normalizeEntries(entries));
  }

  const existingEntries = await loadEntriesByPlayerKeys(config, [entry.playerKey]);
  const mergedPlaySeconds =
    Math.max(entry.totalPlaySeconds || 0, ...existingEntries.map((item) => item.totalPlaySeconds || 0)) +
    (entry.playSecondsDelta || 0);
  const mergedBestWave = Math.max(entry.bestWave, ...existingEntries.map((item) => item.bestWave || 1));
  const mergedBestExtraKills = Math.max(entry.bestExtraKills, ...existingEntries.map((item) => item.bestExtraKills || 0));

  await supabaseRequest(config, `${encodeURIComponent(config.table)}?on_conflict=player_key`, {
    method: "POST",
    headers: {
      Prefer: "resolution=merge-duplicates"
    },
    body: [
      {
        player_key: entry.playerKey,
        name: entry.name,
        best_wave: mergedBestWave,
        best_extra_kills: mergedBestExtraKills,
        total_play_seconds: mergedPlaySeconds,
        updated_at: new Date().toISOString()
      }
    ]
  });

  return loadEntries();
}

exports.handler = async (event) => {
  try {
    if (event.httpMethod === "GET") {
      if (event.queryStringParameters?.mode === "admin") {
        if (!isAdminRequestAuthorized(event)) {
          return json(403, { error: "Forbidden" });
        }
        const entries = await loadEntriesForAdmin();
        return json(200, {
          ...buildAdminStats(entries),
          generatedAt: Date.now()
        });
      }
      const entries = await loadEntries();
      return json(200, { entries });
    }

    if (event.httpMethod !== "POST") {
      return json(405, { error: "Method not allowed" });
    }

    let body;
    try {
      body = JSON.parse(event.body || "{}");
    } catch {
      return json(400, { error: "Invalid JSON" });
    }

    const playerKey = typeof body.playerKey === "string" ? body.playerKey.trim().slice(0, 80) : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 20) : "";
    const bestWave = Math.max(1, Number(body.bestWave) || 1);
    const bestExtraKills = Math.max(0, Number(body.bestExtraKills) || 0);
    const totalPlaySeconds = Math.max(0, Number(body.totalPlaySeconds) || 0);
    const playSecondsDelta = Math.max(0, Math.min(86400, Number(body.playSecondsDelta) || 0));

    if (!playerKey || !name) {
      return json(400, { error: "Missing playerKey or name" });
    }

    const entries = await saveEntry({
      playerKey,
      name,
      bestWave,
      bestExtraKills,
      totalPlaySeconds,
      playSecondsDelta
    });

    return json(200, { entries });
  } catch (error) {
    return json(500, {
      error: "Leaderboard function failed",
      details: error instanceof Error ? error.message : String(error)
    });
  }
};
