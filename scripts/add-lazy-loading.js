// Script de build : ajoute loading="lazy" decoding="async" sur toutes les images HTML
// sauf les images above-the-fold (logo, hero) qui ont déjà un attribut loading
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const htmlFiles = await glob('./**/*.html', {
  ignore: ['./node_modules/**'],
  cwd: new URL('..', import.meta.url).pathname,
  absolute: true,
});

let totalImages = 0;
let modified = 0;

for (const filePath of htmlFiles) {
  let content = readFileSync(filePath, 'utf-8');
  const original = content;

  // Ajoute loading="lazy" decoding="async" sur les <img> qui ne l'ont pas déjà
  content = content.replace(/<img(?![^>]*loading=)([^>]*?)>/g, (match, attrs) => {
    return `<img loading="lazy" decoding="async"${attrs}>`;
  });

  if (content !== original) {
    writeFileSync(filePath, content, 'utf-8');
    const count = (content.match(/loading="lazy"/g) || []).length;
    totalImages += count;
    modified++;
  }
}

console.log(`✨ lazy loading ajouté sur ${totalImages} images dans ${modified} fichiers.`);
