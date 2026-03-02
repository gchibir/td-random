const { getStore } = require("@netlify/blobs");

const STORE_NAME = "td-random";
const STORE_KEY = "leaderboard";
const LIMIT = 10;

function normalizeEntries(rawEntries) {
  if (!Array.isArray(rawEntries)) return [];
  return rawEntries
    .filter(
      (entry) =>
        entry &&
        typeof entry.playerKey === "string" &&
        entry.playerKey &&
        typeof entry.name === "string"
    )
    .map((entry) => ({
      playerKey: String(entry.playerKey).slice(0, 80),
      name: String(entry.name).slice(0, 20),
      bestWave: Math.max(1, Number(entry.bestWave) || 1),
      bestExtraKills: Math.max(0, Number(entry.bestExtraKills) || 0),
      updatedAt: Number(entry.updatedAt) || 0
    }))
    .sort((a, b) => b.bestExtraKills - a.bestExtraKills || b.bestWave - a.bestWave || b.updatedAt - a.updatedAt)
    .slice(0, LIMIT);
}

async function loadEntries(store) {
  try {
    const data = await store.get(STORE_KEY, { type: "json" });
    return normalizeEntries(data);
  } catch {
    try {
      const text = await store.get(STORE_KEY);
      return normalizeEntries(text ? JSON.parse(text) : []);
    } catch {
      return [];
    }
  }
}

async function saveEntries(store, entries) {
  const normalized = normalizeEntries(entries);
  if (typeof store.setJSON === "function") {
    await store.setJSON(STORE_KEY, normalized);
    return normalized;
  }
  await store.set(STORE_KEY, JSON.stringify(normalized), {
    contentType: "application/json; charset=utf-8"
  });
  return normalized;
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

exports.handler = async (event) => {
  const store = getStore(STORE_NAME);

  if (event.httpMethod === "GET") {
    const entries = await loadEntries(store);
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

  if (!playerKey || !name) {
    return json(400, { error: "Missing playerKey or name" });
  }

  const entries = await loadEntries(store);
  const existing = entries.find((entry) => entry.playerKey === playerKey);

  if (existing) {
    existing.name = name;
    existing.bestWave = Math.max(existing.bestWave, bestWave);
    existing.bestExtraKills = Math.max(existing.bestExtraKills, bestExtraKills);
    existing.updatedAt = Date.now();
  } else {
    entries.push({
      playerKey,
      name,
      bestWave,
      bestExtraKills,
      updatedAt: Date.now()
    });
  }

  const saved = await saveEntries(store, entries);
  return json(200, { entries: saved });
};
