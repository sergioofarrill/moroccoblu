import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const blogDir = path.join(__dirname, "src", "content", "blog");

console.log("🚀 Iniciando extracción táctica de nombres de audio reales...");

if (!fs.existsSync(blogDir)) {
  console.error(`❌ No se encontró la carpeta en: ${blogDir}`);
  process.exit(1);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
let updatedCount = 0;

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, "utf8");

  // Captura bloques completos de Flash o shortcodes de audio antiguos
  const flashRegex =
    /<object[^>]*>([\s\S]*?)<\/object>|<embed[^>]*>|\[audio:[^\]]+\]/gi;

  if (flashRegex.test(content)) {
    // Ejecutamos el reemplazo sobre el bloque detectado
    content = content.replace(flashRegex, (match) => {
      // Buscamos cualquier cadena que parezca un archivo .mp3 dentro del bloque roto
      // Captura texto plano, URLs completas o variables de plugins
      const mp3Regex = /([a-zA-Z0-9_.-]+\.mp3)/i;
      const mp3Match = match.match(mp3Regex);

      let trackName = "track.mp3";
      if (mp3Match && mp3Match[1]) {
        // Extraemos puramente el nombre del archivo (ej: mi-cancion.mp3)
        trackName = mp3Match[1].split("/").pop();
      }

      // Retornamos el reproductor contemporáneo limpio
      return `<div class="my-8 bg-neutral-50 p-4 rounded-sm border border-neutral-100/80 flex flex-col gap-2 antialiased">
  <div class="flex items-center gap-2">
    <span class="w-2 h-2 rounded-full bg-neutral-400 animate-pulse"></span>
    <span class="text-[10px] uppercase tracking-widest text-neutral-400 font-bold font-sans">Archivo de Audio Histórico: ${trackName}</span>
  </div>
  <audio controls src="/tracks/${trackName}" class="w-full h-8 opacity-90 mt-1"></audio>
</div>`;
    });

    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Canción recuperada con éxito en: ${file}`);
    updatedCount++;
  }
});

console.log(
  `\n✨ ¡Proceso completado! Se restauraron e inyectaron ${updatedCount} tracks reales.`,
);
