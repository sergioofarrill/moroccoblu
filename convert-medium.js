import fs from "fs";
import path from "path";
import { JSDOM } from "jsdom";
import TurndownService from "turndown";

// Configuración de rutas
const INPUT_DIR = "./medium-export/posts"; // Carpeta con los HTML de Medium
const OUTPUT_DIR = "./src/content/blog"; // Carpeta destino en tu Astro proyecto

if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

const turndownService = new TurndownService({
  headingStyle: "atx",
  codeBlockStyle: "fenced",
});

// Leer todos los archivos HTML de la carpeta de exportación
fs.readdir(INPUT_DIR, (err, files) => {
  if (err) {
    console.error("Error leyendo el directorio de entrada:", err);
    return;
  }

  const htmlFiles = files.filter((file) => file.endsWith(".html"));

  htmlFiles.forEach((file) => {
    const filePath = path.join(INPUT_DIR, file);
    const htmlContent = fs.readFileSync(filePath, "utf-8");

    // Parsear el HTML con JSDOM
    const dom = new JSDOM(htmlContent);
    const document = dom.window.document;

    // Extraer Metadatos
    const titleElement =
      document.querySelector("h1, .p-name") || document.querySelector("title");
    const title = titleElement
      ? titleElement.textContent.trim().replace(/"/g, '\\"')
      : "Post sin título";

    // Medium guarda la fecha de publicación en un tag <time> o clase .dt-published
    const timeElement = document.querySelector("time, .dt-published");
    let publishDate = new Date().toISOString().split("T")[0]; // Fallback hoy
    if (timeElement) {
      const parsedDate = new Date(
        timeElement.getAttribute("datetime") || timeElement.textContent,
      );
      if (!isNaN(parsedDate)) {
        publishDate = parsedDate.toISOString().split("T")[0];
      }
    }

    // Extraer la primera imagen para usarla como cover image en el frontmatter
    const firstImg = document.querySelector("img");
    const coverImage = firstImg ? firstImg.getAttribute("src") : "";

    // Extraer una pequeña descripción/subtítulo si existe
    const descriptionElement = document.querySelector(".p-summary, p");
    const description = descriptionElement
      ? descriptionElement.textContent
          .trim()
          .substring(0, 140)
          .replace(/"/g, '\\"') + "..."
      : "";

    // Limpiar el HTML antes de convertir (remover títulos duplicados, firmas, etc.)
    const articleBody = document.querySelector(".e-content") || document.body;

    // Remover el h1 principal del cuerpo para que no se duplique con el frontmatter
    const mainHeading = articleBody.querySelector("h1");
    if (mainHeading) mainHeading.remove();

    // Convertir el cuerpo purificado a Markdown
    let markdownContent = turndownService.turndown(articleBody.innerHTML);

    // Sanatizar etiquetas de enlaces internos o metadatos de Medium sobrantes si fuera necesario
    // (Opcional) Convertir URLs absolutas relativas a Medium

    // Construir Frontmatter estructurado
    const frontmatter = [
      "---",
      `title: "${title}"`,
      `description: "${description}"`,
      `pubDate: ${publishDate}`,
      coverImage
        ? `heroImage: "${coverImage}"`
        : '# heroImage: "" (Dejar vacío activará el fallback CDN)',
      "---",
      "",
      markdownContent,
    ].join("\n");

    // Generar un nombre de archivo limpio basado en la fecha y el nombre original
    const cleanFileName = `${publishDate}-${file.replace(".html", ".md")}`;
    const outputPath = path.join(OUTPUT_DIR, cleanFileName);

    fs.writeFileSync(outputPath, frontmatter, "utf-8");
    console.log(`Convertido con éxito: ${cleanFileName}`);
  });
});
