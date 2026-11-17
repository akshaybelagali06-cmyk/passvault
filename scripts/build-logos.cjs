const fs = require("fs");
const path = require("path");

const servicesFile = path.join(__dirname, "../src/data/services.json");
const iconsDir = path.join(__dirname, "../node_modules/simple-icons/icons");

if (!fs.existsSync(iconsDir)) {
  console.error(
    "simple-icons icons folder not found. Run: npm install --save-dev simple-icons",
  );
  process.exit(1);
}

const services = JSON.parse(fs.readFileSync(servicesFile, "utf8"));
const slug = (n) => n.toLowerCase().replace(/[^a-z0-9]/g, "");
const out = {};
const missing = [];

for (const s of services) {
  const file = path.join(iconsDir, slug(s.name) + ".svg");
  const d = fs.existsSync(file)
    ? fs.readFileSync(file, "utf8").match(/<path d="([^"]+)"/)?.[1]
    : null;
  if (d) out[s.name] = d;
  else missing.push(s.name);
}

fs.writeFileSync(
  path.join(__dirname, "../src/data/logo-paths.ts"),
  "export const LOGO_PATHS: Record<string, string> = " +
    JSON.stringify(out, null, 2) +
    ";\n",
);

console.log("Logos found:", Object.keys(out).length);
console.log(
  "Missing (these keep the letter tile):",
  missing.join(", ") || "none",
);
