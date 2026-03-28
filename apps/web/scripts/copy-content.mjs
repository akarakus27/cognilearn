import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.join(__dirname, "..", "..", "..");
const source = path.join(repoRoot, "content");
const dest = path.join(__dirname, "..", "public", "content");

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-content] Skip: missing ${src}`);
    return;
  }
  fs.mkdirSync(dst, { recursive: true });
  for (const name of fs.readdirSync(src)) {
    const s = path.join(src, name);
    const d = path.join(dst, name);
    if (fs.statSync(s).isDirectory()) copyRecursive(s, d);
    else fs.copyFileSync(s, d);
  }
}

copyRecursive(source, dest);
console.log(`[copy-content] ${source} -> ${dest}`);
