import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const blogDir = path.join(__dirname, "src", "content", "blog");

console.log(
  '🚀 Eliminando comillas escapadas (\\") y normalizando el Frontmatter...',
);

if (!fs.existsSync(blogDir)) {
  console.error(`❌ No se encontró la carpeta en: ${blogDir}`);
  process.exit(1);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
let fixedCount = 0;

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  if (content.startsWith("---")) {
    const parts = content.split("---");
    if (parts.length >= 3) {
      const frontmatterLines = parts[1].split("\n");
      let title = "Entrada histórica";
      let pubDate = "2011-01-01";
      let description = "Publicación del archivo de Moroccoblu.";
      let hasYamlData = false;

      frontmatterLines.forEach((line) => {
        const cleanLine = line.trim();
        if (cleanLine.startsWith("title:")) {
          title = cleanLine.replace("title:", "").trim();
          hasYamlData = true;
        }
        if (cleanLine.startsWith("pubDate:")) {
          pubDate = cleanLine.replace("pubDate:", "").trim();
        }
        if (cleanLine.startsWith("description:")) {
          description = cleanLine.replace("description:", "").trim();
        }
      });

      if (hasYamlData) {
        // Purgar por completo las comillas externas antiguas, diagonales invertidas y limpiar el string
        let cleanTitle = title
          .replace(/^["']|["']\$/g, "")
          .replace(/\\"/g, '"')
          .replace(/\\/g, "")
          .trim();
        let cleanDescription = description
          .replace(/^["']|["']\$/g, "")
          .replace(/\\"/g, '"')
          .replace(/\\/g, "")
          .trim();
        let cleanPubDate = pubDate.replace(/^["']|["']\$/g, "").trim();

        // Para evitar conflictos con comillas internas, removemos las comillas dobles del texto del título
        cleanTitle = cleanTitle.replace(/"/g, "'");
        cleanDescription = cleanDescription.replace(/"/g, "'");

        // Construimos el bloque limpio, alineado perfectamente al margen izquierdo sin diagonales
        const cleanFrontmatter = `\ntitle: "${cleanTitle}"\npubDate: "${cleanPubDate}"\ndescription: "${cleanDescription}"\n`;

        parts[1] = cleanFrontmatter;
        const newContent = parts.join("---");

        if (content !== newContent) {
          fs.writeFileSync(filePath, newContent, "utf8");
          console.log(`🧽 Archivo sanitizado y libre de escapes: ${file}`);
          fixedCount++;
        }
      }
    }
  }
});

console.log(`\n✨ ¡Proceso completado con éxito!`);
console.log(
  `👉 Se eliminaron las comillas escapadas en ${fixedCount} archivos Markdown.`,
);
