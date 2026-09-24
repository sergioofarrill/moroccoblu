import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const blogDir = path.join(__dirname, "src", "content", "blog");

console.log(
  "🚀 Iniciando escaneo, limpieza y normalización profunda de recursos...",
);

if (!fs.existsSync(blogDir)) {
  console.error(`❌ No se encontró la carpeta de posts en: ${blogDir}`);
  process.exit(1);
}

const files = fs.readdirSync(blogDir).filter((f) => f.endsWith(".md"));
let updatedCount = 0;
const unknownPathsFound = new Set();

files.forEach((file) => {
  const filePath = path.join(blogDir, file);
  let content = fs.readFileSync(filePath, "utf8"); // <-- La variable 'content' nace aquí adentro
  let hasChanges = false;

  // 1. Reemplazos directos para los paths absolutos conocidos
  const knownPatterns = [
    "http://moroccoblu.com",
    "https://moroccoblu.com",
    "http://moroccoblu.com",
    "https://moroccoblu.com",
  ];

  knownPatterns.forEach((pattern) => {
    if (content.includes(pattern)) {
      const replacement = pattern.includes("uploads")
        ? "/wp-content/uploads/"
        : "/blogimages/";
      content = content.split(pattern).join(replacement);
      hasChanges = true;
    }
  });

  // 2. CHEQUEO PREVENTIVO: Detectar si existen otras carpetas huérfanas
  const domainRegex = /https?:\/\/moroccoblu\.com\/([a-zA-Z0-9_.-]+)\//g;
  let match;
  while ((match = domainRegex.exec(content)) !== null) {
    const detectedFolder = match[1];
    if (detectedFolder !== "wp-content" && detectedFolder !== "blogimages") {
      unknownPathsFound.add(detectedFolder);
    }
  }

  // Convertir cualquier otra referencia absoluta restante al dominio viejo a ruta relativa
  if (content.match(/https?:\/\/moroccoblu\.com\//)) {
    content = content.replace(/https?:\/\/moroccoblu\.com\//g, "/");
    hasChanges = true;
  }

  // ==========================================
  // 💥 FASE DE SANITIZACIÓN: CORREGIR DOBLES PATHS (DENTRO DEL SCOPE)
  // ==========================================
  if (content.includes("/blogimages//blogimages/")) {
    content = content.split("/blogimages//blogimages/").join("/blogimages/");
    hasChanges = true;
  }
  if (content.includes("/blogimages/blogimages/")) {
    content = content.split("/blogimages/blogimages/").join("/blogimages/");
    hasChanges = true;
  }
  if (content.includes("/blogimages//")) {
    content = content.split("/blogimages//").join("/blogimages/");
    hasChanges = true;
  }
  if (content.includes("/wp-content/uploads//wp-content/uploads/")) {
    content = content
      .split("/wp-content/uploads//wp-content/uploads/")
      .join("/wp-content/uploads/");
    hasChanges = true;
  }
  if (content.includes("/wp-content/uploads/wp-content/uploads/")) {
    content = content
      .split("/wp-content/uploads/wp-content/uploads/")
      .join("/wp-content/uploads/");
    hasChanges = true;
  }

  // Guardar si se ejecutó alguna corrección física en este archivo específico
  if (hasChanges) {
    fs.writeFileSync(filePath, content, "utf8");
    console.log(`✅ Historial normalizado y limpio: ${file}`);
    updatedCount++;
  }
}); // <-- Aquí cierra de forma segura el bucle files.forEach

console.log(
  `\n✨ ¡Auditoría terminada! Se normalizaron ${updatedCount} archivos Markdown.`,
);

if (unknownPathsFound.size > 0) {
  console.log(
    "\n⚠️  [ALERTA DE DESARROLLO] Se detectaron directorios adicionales en tus posts antiguos:",
  );
  unknownPathsFound.forEach((folder) => {
    console.log(
      `   📁 /${folder}/ -> Asegúrate de copiar esta carpeta hacia: moroccoblu-static/public/${folder}/`,
    );
  });
} else {
  console.log(
    "\n🔒 Control de calidad exitoso: Estructura de imágenes 100% limpia y normalizada.",
  );
}
