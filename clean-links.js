import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const blogDir = path.join(__dirname, "src", "content", "blog");

console.log("🚀 Iniciando escaneo y conversión de enlaces HTML a Markdown...");

if (!fs.existsSync(blogDir)) {
  console.error(`❌ No se encontró la carpeta en: ${blogDir}`);
  process.exit(1);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
let updatedFilesCount = 0;
let totalLinksConverted = 0;

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, "utf8");
  let hasChanges = false;
  let fileLinksCount = 0;

  // 1. REGEX PARA CAPTURAR ETIQUETAS <a href="...">Texto</a>
  // Captura el enlace (Grupo 1) y el texto interno (Grupo 2)
  const htmlAnchorRegex =
    /<a[^>]+href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/all>/gi;

  // Tratándose de variaciones comunes de WordPress, usamos un reemplazo dinámico por función
  const modifiedContent = content.replace(
    /<a\s+(?:[^>]*?\s+)?href="([^"]*)"[^>]*>(.*?)<\/a>/gi,
    (match, url, anchorText) => {
      let finalUrl = url.trim();

      // 2. NORMALIZACIÓN DE ENLACES INTERNOS HISTÓRICOS
      // Transforma http://moroccoblu.com -> /blog/2012-01-11-slug
      const wpPathRegex =
        /https?:\/\/moroccoblu\.com\/(\d{4})\/(\d{2})\/(\d{2})\/([a-zA-Z0-9-_]+)\/?/;
      const wpMatch = finalUrl.match(wpPathRegex);

      if (wpMatch) {
        const [_, year, month, day, slug] = wpMatch;
        finalUrl = `/blog/${year}-${month}-${day}-${slug}`;
      } else if (
        finalUrl.startsWith("http://moroccoblu.com") ||
        finalUrl.startsWith("https://moroccoblu.com")
      ) {
        // Si apunta al dominio antiguo pero no es un post (ej. una categoría), lo volvemos relativo básico
        finalUrl = finalUrl.replace(/https?:\/\/moroccoblu\.com/i, "");
        if (!finalUrl) finalUrl = "/";
      }

      fileLinksCount++;
      hasChanges = true;

      // Retorna el formato nativo estándar de Markdown
      return `[${anchorText.trim()}](${finalUrl})`;
    },
  );

  if (hasChanges) {
    fs.writeFileSync(filePath, modifiedContent, "utf8");
    console.log(
      `🔗 Enlaces HTML convertidos a Markdown (${fileLinksCount}) en: ${file}`,
    );
    updatedFilesCount++;
    totalLinksConverted += fileLinksCount;
  }
});

console.log(`\n✨ ¡Refactorización de enlaces completada con éxito!`);
console.log(`👉 Archivos Markdown actualizados: ${updatedFilesCount}`);
console.log(
  `👉 Total de enlaces HTML transformados a Markdown: ${totalLinksConverted}`,
);
