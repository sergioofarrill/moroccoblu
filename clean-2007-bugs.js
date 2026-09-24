import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const blogDir = path.join(__dirname, "src", "content", "blog");

console.log("🧼 Iniciando limpieza profunda de errores posicionales (2:21)...");

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
let fixed = 0;

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  if (content.startsWith("---")) {
    const lines = content.split("\n");
    let changed = false;

    for (let i = 0; i < lines.length; i++) {
      // Si la línea del título tiene el escape roto que detectamos antes: \" o comillas duplicadas
      if (
        lines[i].startsWith("title:") &&
        (lines[i].includes('\\"') ||
          lines[i].includes('""') ||
          lines[i].endsWith('\\""') ||
          lines[i].endsWith('\"'))
      ) {
        let titleText = lines[i].replace("title:", "").trim();

        // Forzar limpieza absoluta del string
        titleText = titleText.replace(/^["']|["']\$/g, "");
        titleText = titleText.replace(/\\"/g, "");
        titleText = titleText.replace(/\\/g, "");
        titleText = titleText.replace(/"/g, "");
        titleText = titleText.trim();

        lines[i] = `title: "${titleText || "Publicación Histórica"}"`;
        changed = true;
      }

      // Aprovechamos para limpiar fallas idénticas en la descripción si las hay
      if (
        lines[i].startsWith("description:") &&
        (lines[i].includes('\\"') || lines[i].includes('""'))
      ) {
        let descText = lines[i].replace("description:", "").trim();
        descText = descText
          .replace(/^["']|["']\$/g, "")
          .replace(/\\"/g, "")
          .replace(/\\/g, "")
          .replace(/"/g, "")
          .trim();
        lines[i] = `description: "${descText}"`;
        changed = true;
      }
    }

    if (changed) {
      fs.writeFileSync(filePath, lines.join("\n"), "utf8");
      console.log(`✨ Reparado de raíz: ${file}`);
      fixed++;
    }
  }
});

console.log(
  `\n🔒 Control de calidad terminado. Se purgaron ${fixed} archivos con errores de sintaxis.`,
);
