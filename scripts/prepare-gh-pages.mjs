import fs from "node:fs";
import path from "node:path";

const distDir = path.resolve("dist");
const indexPath = path.join(distDir, "index.html");
const fallbackPath = path.join(distDir, "404.html");
const noJekyllPath = path.join(distDir, ".nojekyll");

if (!fs.existsSync(indexPath)) {
  throw new Error("dist/index.html not found. Run the build first.");
}

fs.copyFileSync(indexPath, fallbackPath);
fs.writeFileSync(noJekyllPath, "");
console.log("Prepared GitHub Pages fallback files.");
