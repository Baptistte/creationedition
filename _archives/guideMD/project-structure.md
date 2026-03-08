# Structure du Projet

```
/
├── index.html                      # Page d'accueil
├── sitemap.xml                     # Sitemap XML
├── robots.txt                      # Fichier robots.txt
├── template.html                   # Template de base pour les nouvelles pages
├── keywords-research.md            # Recherche de mots-clés
├── project-structure.md            # Documentation de la structure
│
├── services/                       # Dossier des services
│   ├── creation-graphique-digitale/
│   │   ├── index.html             # Page pilier Création Graphique
│   │   ├── creation-logo-identite-visuelle/
│   │   │   └── index.html
│   │   ├── supports-imprimes-print/
│   │   │   └── index.html
│   │   └── creation-site-internet-frejus/
│   │       └── index.html
│   │
│   └── broderie-marquage-textile/
│       ├── index.html             # Page pilier Broderie
│       ├── broderie-personnalisee/
│       │   └── index.html
│       ├── flocage-marquage-textile/
│       │   └── index.html
│       └── vetements-travail-personnalises/
│           └── index.html
│
├── realisations/                   # Dossier des réalisations
│   └── index.html
│
├── blog/                          # Dossier du blog
│   └── index.html
│
├── contact/                       # Dossier contact
│   └── index.html
│
├── mentions-legales/              # Pages légales
│   └── index.html
│
├── politique-de-confidentialite/  # Pages légales
│   └── index.html
│
├── assets/                        # Dossier des ressources
│   ├── images/                    # Images du site
│   │   ├── services/             # Images des services
│   │   ├── realisations/         # Images des réalisations
│   │   └── blog/                 # Images du blog
│   │
│   ├── css/                      # Styles CSS
│   │   └── custom.css            # Styles personnalisés
│   │
│   └── js/                       # Scripts JavaScript
│       └── main.js               # Script principal
│
└── README.md                      # Documentation du projet
```

## Notes sur la Structure

1. **Organisation des Services**
   - Chaque service principal a son propre dossier
   - Les sous-services sont organisés en sous-dossiers
   - Utilisation de `index.html` pour les pages principales

2. **Gestion des Assets**
   - Images organisées par section
   - Styles et scripts séparés
   - Optimisation des images pour le web

3. **SEO**
   - URLs propres et descriptives
   - Structure de dossiers logique
   - Sitemap XML à la racine

4. **Maintenance**
   - Documentation claire
   - Structure modulaire
   - Facilité d'ajout de nouveaux contenus 