// Ajoute le schema BreadcrumbList sur les pages services et articles blog
import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

const BASE_URL = 'https://creationeditionbroderie.com';

// Mapping chemin → label lisible
const LABELS = {
  'services': 'Services',
  'creation-graphique-digitale': 'Création Graphique & Digitale',
  'broderie-marquage-textile': 'Broderie & Marquage Textile',
  'broderie-personnalisee': 'Broderie Personnalisée',
  'yachting': 'Yachting',
  'creation-logo-identite-visuelle': 'Logo & Identité Visuelle',
  'supports-imprimes-print': 'Supports Imprimés',
  'creation-site-internet-frejus': 'Création Site Internet',
  'flocage-marquage-textile': 'Flocage & Marquage Textile',
  'vetements-travail-personnalises': 'Vêtements de Travail',
  'blog': 'Blog',
  'articles': 'Articles',
};

function slugToLabel(slug) {
  return LABELS[slug] || slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function buildBreadcrumb(segments) {
  const items = [
    { '@type': 'ListItem', position: 1, name: 'Accueil', item: BASE_URL }
  ];
  let path = '';
  segments.forEach((seg, i) => {
    path += '/' + seg;
    items.push({
      '@type': 'ListItem',
      position: i + 2,
      name: slugToLabel(seg),
      item: BASE_URL + path,
    });
  });
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  };
}

const patterns = [
  './services/**/*.html',
  './blog/articles/*.html',
];

const htmlFiles = (await Promise.all(
  patterns.map(p => glob(p, { ignore: ['./node_modules/**'], absolute: true }))
)).flat();

let modified = 0;

for (const filePath of htmlFiles) {
  // Ignorer les fichiers déjà breadcrumb-ifiés
  let content = readFileSync(filePath, 'utf-8');
  if (content.includes('BreadcrumbList')) continue;

  // Calculer les segments depuis la racine du projet
  const rel = filePath.replace(/.*\/creationedition\//, '').replace(/\/index\.html$/, '').replace(/\.html$/, '');
  const segments = rel.split('/').filter(Boolean);
  if (segments.length < 1) continue;

  const schema = JSON.stringify(buildBreadcrumb(segments), null, 2);
  const tag = `    <script type="application/ld+json">\n${schema}\n    </script>`;

  // Insérer avant </head>
  content = content.replace('</head>', `${tag}\n</head>`);
  writeFileSync(filePath, content, 'utf-8');
  modified++;
  console.log(`✅ Breadcrumb ajouté: ${rel}`);
}

console.log(`\n✨ ${modified} pages mises à jour.`);
