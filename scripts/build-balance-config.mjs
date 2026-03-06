import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const dataDir = path.join(root, "data");

function readJson(file) {
  return JSON.parse(fs.readFileSync(path.join(dataDir, file), "utf8"));
}

const payload = {
  towers: readJson("towers.balance.json"),
  items: readJson("items.balance.json"),
  waves: readJson("waves.balance.json")
};

const js = `window.TD_BALANCE_CONFIG = ${JSON.stringify(payload, null, 2)};\n`;
fs.writeFileSync(path.join(dataDir, "balance-config.js"), js);
console.log("Generated: data/balance-config.js");
