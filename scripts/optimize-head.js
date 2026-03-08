// Script de build : optimise le <head> et ajoute le skip link sur tous les HTML
// - Ajoute les preconnect Google Fonts avant le lien fonts
// - Ajoute le skip link d'accessibilité en début de <body>
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const PRECONNECT = `<link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    `;

const SKIP_LINK = `<a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-[9999] focus:bg-brand-magenta focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:font-medium">Aller au contenu principal</a>`;

const htmlFiles = await glob('./**/*.html', {
  ignore: ['./node_modules/**'],
  cwd: new URL('..', import.meta.url).pathname,
  absolute: true,
});

let modified = 0;

for (const filePath of htmlFiles) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // 1. Ajouter preconnect avant Google Fonts si pas déjà présent
  if (content.includes('fonts.googleapis.com') && !content.includes('rel="preconnect"')) {
    content = content.replace(
      /(<link[^>]*fonts\.googleapis\.com[^>]*>)/,
      `${PRECONNECT}$1`
    );
  }

  // 2. Ajouter skip link juste après <body> si pas déjà présent
  if (!content.includes('href="#main-content"')) {
    content = content.replace(
      /(<body[^>]*>)/,
      `$1\n    ${SKIP_LINK}`
    );
  }

  // 3. Ajouter id="main-content" sur le premier <main> ou première <section> si pas déjà présent
  if (!content.includes('id="main-content"')) {
    content = content.replace(
      /<main(\s|>)/,
      `<main id="main-content"$1`
    );
    // Si pas de <main>, on cible la première <section> de contenu (après nav)
    if (!content.includes('id="main-content"')) {
      content = content.replace(
        /(<section\s)/,
        `<section id="main-content" `
      );
    }
  }

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    modified++;
  }
}

console.log(`✨ Head optimisé + skip link ajouté sur ${modified} fichiers.`);
