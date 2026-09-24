import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ajusta esta ruta absoluta o relativa si tu estructura cambió
const blogDir = path.join(__dirname, "src", "content", "blog");
const reportFile = path.join(__dirname, "swf-report.md");

console.log("🔍 Iniciando escaneo de archivos Flash (.swf) en los posts...");

if (!fs.existsSync(blogDir)) {
  console.error(`❌ No se encontró la carpeta de contenidos en: ${blogDir}`);
  process.exit(1);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
let matchCount = 0;
let reportContent = `# Reporte de Contenido Flash (.swf) — Moroccoblu\n\nGenerado el: ${new Date().toLocaleDateString("es-MX")}\n\n`;
reportContent += `| # | Archivo Post | Tipo Detectado | Coincidencia Encontrada |\n|---|---|---|---|\n`;

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  const content = fs.readFileSync(filePath, "utf8");
  const lines = content.split("\n");
  let hasFlash = false;

  // Patrones de búsqueda: extensión swf o contenedores antiguos
  const swfRegex = /(\.swf|<object|<embed|\[audio:)/i;

  lines.forEach((line, index) => {
    if (swfRegex.test(line)) {
      matchCount++;
      hasFlash = true;

      // Determinar qué tipo de rastro es
      let type = "Extensión .swf";
      if (line.includes("<object")) type = "Tag <object>";
      if (line.includes("<embed")) type = "Tag <embed>";
      if (line.includes("[audio:")) type = "Shortcode Audio";

      // Limpiar la línea para que no rompa la tabla Markdown del reporte
      const cleanLine = line.replace(/\|/g, "\\|").trim().substring(0, 60);

      reportContent += `| ${matchCount} | \`\${file}\` | ${type} | \`\${cleanLine}...\` |\n`;
    }
  });

  if (hasFlash) {
    console.log(`⚠️ Flash detectado en: ${file}`);
  }
});

if (matchCount === 0) {
  reportContent += `\n¡Felicidades! 🎉 No se encontraron archivos ni etiquetas Flash en ninguna publicación.`;
  console.log(
    "\n🔒 Control de calidad exitoso: Tu blog está 100% limpio de Flash.",
  );
} else {
  console.log(
    `\n✨ Escaneo terminado. Se encontraron ${matchCount} incidencias.`,
  );
  console.log(`📝 Reporte detallado guardado en: ${reportFile}`);
}

fs.writeFileSync(reportFile, reportContent, "utf8");
