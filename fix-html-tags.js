import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const blogDir = path.join(__dirname, "src", "content", "blog");

console.log("🚀 Sanitizando secuencias de escape y comillas en Frontmatter...");

if (!fs.existsSync(blogDir)) {
  console.error(`❌ No se encontró la carpeta en: ${blogDir}`);
  process.exit(1);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
let updatedCount = 0;

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let hasChanges = false;

  // Detectar si el Frontmatter tiene problemas potenciales de escape
  if (content.includes("title: ") || content.includes("\\")) {
    const lines = content.split("\n");

    for (let i = 0; i < lines.length; i++) {
      if (lines[i].startsWith("title:")) {
        let cleanTitle = lines[i].replace("title:", "").trim();

        // Purgar de raíz diagonales invertidas y comillas conflictivas
        cleanTitle = cleanTitle.replace(/^["']|["']\$/g, "");
        cleanTitle = cleanTitle.replace(/\\/g, ""); // Eliminar diagonales de escape robadas de SQL
        cleanTitle = cleanTitle.replace(/"/g, "'"); // Cambiar comillas dobles internas por simples

        // Envolver de forma segura el título sanitizado en comillas simples para YAML
        const newTitleLine = `title: '${cleanTitle}'`;
        if (lines[i] !== newTitleLine) {
          lines[i] = newTitleLine;
          hasChanges = true;
        }
        break;
      }
    }

    if (hasChanges) {
      content = lines.join("\n");
      fs.writeFileSync(filePath, content, "utf8");
      console.log(`🧹 Frontmatter purgado con éxito: ${file}`);
      updatedCount++;
    }
  }
});

console.log(
  `\n✨ ¡Sprints de limpieza terminados! Se corrigieron ${updatedCount} archivos Markdown.`,
);
