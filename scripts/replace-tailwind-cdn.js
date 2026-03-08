// Script de build : remplace le CDN Tailwind + la config inline
// par un lien vers le CSS compilé dans tous les fichiers HTML
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const htmlFiles = await glob('./**/*.html', {
  ignore: ['./node_modules/**'],
  cwd: new URL('..', import.meta.url).pathname,
  absolute: true,
});

let modified = 0;

for (const filePath of htmlFiles) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // 1. Remplacer le CDN Tailwind par le CSS compilé
  content = content.replace(
    /<script src="https:\/\/cdn\.tailwindcss\.com"><\/script>\s*/g,
    '<link rel="stylesheet" href="/assets/css/tailwind.css">\n    '
  );

  // 2. Supprimer le bloc <script>tailwind.config = {...}</script>
  // Gère les espaces/indentation variables
  content = content.replace(
    /\s*<script>\s*tailwind\.config\s*=\s*\{[\s\S]*?\}\s*<\/script>/g,
    ''
  );

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    modified++;
    console.log(`✅ Mis à jour: ${filePath.split('/').slice(-3).join('/')}`);
  }
}

console.log(`\n✨ ${modified} fichier(s) HTML mis à jour sur ${htmlFiles.length} trouvés.`);
