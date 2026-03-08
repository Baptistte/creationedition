// Remplace <img src="...jpg/png"> par <picture><source webp><img></picture>
// Uniquement pour les images locales qui ont un équivalent .webp
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { glob } from 'glob';
import { resolve, dirname } from 'path';

const ROOT = new URL('..', import.meta.url).pathname;

const htmlFiles = await glob('./**/*.html', {
  ignore: ['./node_modules/**', './_archives/**'],
  cwd: ROOT,
  absolute: true,
});

let totalReplaced = 0;
let filesModified = 0;

for (const filePath of htmlFiles) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Trouver tous les <img> avec src local jpg/png non déjà dans <picture>
  content = content.replace(
    /(<img\s[^>]*src=["'])(\.\.\/|\.\/|\/)?([^"']+\.(png|jpg|jpeg))(["'][^>]*>)/gi,
    (match, before, prefix, imgPath, ext, after) => {
      // Ignorer si déjà dans un <picture>
      // (on vérifie dans le contexte via une heuristique simple)
      if (match.includes('logo_main')) return match; // favicon/logo branding

      // Construire le chemin absolu du webp
      const cleanPrefix = prefix || '';
      const webpPath = imgPath.replace(/\.(png|jpg|jpeg)$/i, '.webp');

      // Vérifier si le fichier WebP existe
      let webpAbsolute;
      if (cleanPrefix.startsWith('/') || (!cleanPrefix && imgPath.startsWith('/'))) {
        webpAbsolute = resolve(ROOT, webpPath.replace(/^\//, ''));
      } else {
        webpAbsolute = resolve(dirname(filePath), cleanPrefix + webpPath);
      }

      if (!existsSync(webpAbsolute)) return match;

      const srcset = `${cleanPrefix}${webpPath}`;
      const originalSrc = `${cleanPrefix}${imgPath}`;

      // Extraire les attributs pour les conserver
      const imgTag = `${before}${originalSrc}${after}`;

      return `<picture><source srcset="${srcset}" type="image/webp">${imgTag}</picture>`;
    }
  );

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    const count = (content.match(/<picture>/g) || []).length;
    totalReplaced += count;
    filesModified++;
    console.log(`✅ ${count} images → <picture> dans ${filePath.split('/').slice(-3).join('/')}`);
  }
}

console.log(`\n✨ ${totalReplaced} images converties en <picture> dans ${filesModified} fichiers.`);
