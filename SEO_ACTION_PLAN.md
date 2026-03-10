# SEO Action Plan — creationeditionbroderie.com
> Généré le 2026-03-10. Optimisé pour exécution par agent IA.
> Score de départ : **55/100**. Objectif après toutes les actions : **95/100**.
> Lire chaque tâche intégralement avant de modifier un fichier. Vérifier le résultat après chaque tâche.

---

## CONVENTIONS

- `ROOT` = `/Users/baptistegrincourtdeflogny/Desktop/Projets Dev/siteMamanAjour/creationedition`
- Toujours lire le fichier cible avec `Read` avant d'éditer
- Toujours vérifier le résultat après modification avec `Read` ou `Grep`
- Ne jamais modifier deux fichiers interdépendants dans le même edit sans vérification intermédiaire
- Les tâches sont ordonnées du plus impactant au moins impactant
- Chaque tâche indique : **Fichier(s)**, **Opération précise**, **Vérification**

---

## PHASE 1 — CRITIQUE (score actuel → ~72/100)
> Ces tâches ne nécessitent aucune rédaction. Corrections techniques pures.

---

### TÂCHE 1 — Corriger NAP + téléphone sur la page broderie personnalisée
**Impact :** Critique — fuite de conversions directe + signal local SEO négatif
**Fichier :** `ROOT/services/broderie-marquage-textile/broderie-personnalisee/index.html`

**Opérations :**
1. Chercher dans ce fichier toutes les occurrences de `123 Avenue de la République` → remplacer par `25 Place Dei Doufin - Le Paladien 7D`
2. Chercher `contact@creationedition.com` → remplacer par `emiliecreationbroderie@gmail.com`
3. Chercher `+33494405098` → remplacer par `+33980777652`
4. Chercher `0494405098` ou `04 94 40 50 98` → remplacer par `09 80 77 76 52`
5. Chercher `83600 Fréjus` dans le contexte de l'adresse erronée → vérifier que la ville/CP est correct après correction de l'adresse

**Vérification :** Grep `123 Avenue` dans ce fichier → doit retourner 0 résultat. Grep `+33980777652` → doit retourner ≥1 résultat.

---

### TÂCHE 2 — Corriger les canonicals sans slash final (3 fichiers)
**Impact :** Critique — canonical pointe vers la source d'une 301, pas la destination
**Fichiers :**
- `ROOT/services/creation-graphique-digitale/index.html`
- `ROOT/services/broderie-marquage-textile/index.html`
- `ROOT/services/broderie-personnalisee/index.html`

**Opération pour chaque fichier :**
Chercher la balise `<link rel="canonical"` et s'assurer que le `href` se termine par `/`.

Exemples de corrections attendues :
```
# Avant
<link rel="canonical" href="https://creationeditionbroderie.com/services/creation-graphique-digitale">
# Après
<link rel="canonical" href="https://creationeditionbroderie.com/services/creation-graphique-digitale/">
```

**Vérification :** Grep `rel="canonical"` dans chaque fichier → vérifier que l'URL se termine par `/`.

---

### TÂCHE 3 — Corriger le BreadcrumbList brisé (URLs 404)
**Impact :** Critique — données structurées invalides pénalisées par Google
**Fichier :** `ROOT/services/broderie-marquage-textile/broderie-personnalisee/index.html`

**Opération :**
Localiser le bloc `<script type="application/ld+json">` contenant `BreadcrumbList`. Remplacer l'intégralité de ce bloc par :

```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {
      "@type": "ListItem",
      "position": 1,
      "name": "Accueil",
      "item": "https://creationeditionbroderie.com/"
    },
    {
      "@type": "ListItem",
      "position": 2,
      "name": "Broderie & Marquage Textile",
      "item": "https://creationeditionbroderie.com/services/broderie-marquage-textile/"
    },
    {
      "@type": "ListItem",
      "position": 3,
      "name": "Broderie Personnalisée",
      "item": "https://creationeditionbroderie.com/services/broderie-marquage-textile/broderie-personnalisee/"
    }
  ]
}
</script>
```

**Vérification :** Grep `/services` dans le bloc JSON-LD → vérifier qu'aucune URL ne pointe vers `/services` seul ou `/services/broderie-marquage-textile` sans slash final.

---

### TÂCHE 4 — Ajouter les slashes finaux dans le sitemap (36 URLs)
**Impact :** Critique — 36 redirections 301 gaspillent le crawl budget
**Fichier :** `ROOT/sitemap.xml`

**Opérations :**
1. Lire le fichier entier
2. Pour chaque `<loc>` dont l'URL ne se termine pas par `/` et ne se termine pas par `.html`, ajouter `/` avant `</loc>`

URLs à corriger (celles sans slash final ni extension) :
```
/services/creation-graphique-digitale  →  /services/creation-graphique-digitale/
/services/creation-logo-identite-visuelle  →  /services/creation-logo-identite-visuelle/
/services/supports-imprimes-print  →  /services/supports-imprimes-print/
/services/creation-site-internet-frejus  →  /services/creation-site-internet-frejus/
/services/broderie-marquage-textile  →  /services/broderie-marquage-textile/
/services/broderie-personnalisee  →  /services/broderie-personnalisee/
/services/flocage-marquage-textile  →  /services/flocage-marquage-textile/
/services/vetements-travail-personnalises  →  /services/vetements-travail-personnalises/
/services/yachting  →  /services/yachting/
/realisations  →  /realisations/
/blog  →  /blog/
/contact  →  /contact/
/cgv  →  /cgv/
/mentions-legales  →  /mentions-legales/
/politique-de-confidentialite  →  /politique-de-confidentialite/
```

**Vérification :** Grep `<loc>https://creationeditionbroderie.com/[^/h]` dans sitemap.xml → doit retourner 0 résultat (toutes les URLs se terminent par `/` ou `.html`).

---

### TÂCHE 5 — Ajouter les 19 articles manquants au sitemap
**Impact :** Haute — 19 articles publiés non indexables via sitemap
**Fichier :** `ROOT/sitemap.xml`

**Opération :**
Ajouter les 19 entrées suivantes dans le bloc `<urlset>`, avant la balise `</urlset>`. Utiliser la date du jour comme `lastmod` provisoire et supprimer `<changefreq>` et `<priority>` (ignorés par Google) :

```xml
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/typographie-logo-guide-choix.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/erreurs-creation-logo-eviter.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/packaging-personnalise-image-produit.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/brochure-commerciale-guide-conception.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/broderie-restaurant-hotellerie-var.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/broderie-casquettes-bonnets-personnalises.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/entretien-textiles-brodes-guide.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/site-web-vitrine-efficace-2026.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/seo-local-artisan-google-business.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/reseaux-sociaux-artisans-guide-2026.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/communication-visuelle-restaurant-2026.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/tendances-identite-visuelle-2026.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/print-vs-digital-strategie-communication.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/signaletique-commerciale-frejus-guide.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/yacht-linen-embroidery-towels-sheets.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/cadeaux-entreprise-brodes-fidelisation.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/roll-up-kakemono-salon-professionnel.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/broderie-uniforme-scolaire-ecoles.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
<url>
  <loc>https://creationeditionbroderie.com/blog/articles/cout-identite-visuelle-complete-2026.html</loc>
  <lastmod>2026-03-10</lastmod>
</url>
```

**Vérification :** Grep `typographie-logo-guide-choix` dans sitemap.xml → doit retourner 1 résultat.

---

### TÂCHE 6 — Consolider les pages dupliquées via redirections 301
**Impact :** Critique — contenu dupliqué à deux chemins URL sans relation canonique
**Fichier :** `ROOT/netlify.toml`

**Contexte :** Ces pages existent à deux emplacements. La navigation pointe vers les chemins imbriqués → ce sont eux qui deviennent les canoniques. Les chemins plats doivent rediriger.

**Opération :**
Ajouter les redirections suivantes dans `ROOT/netlify.toml`, dans la section des `[[redirects]]` existante :

```toml
# Consolidation des pages services dupliquées (chemins plats → chemins imbriqués canoniques)
[[redirects]]
  from = "/services/broderie-personnalisee"
  to = "/services/broderie-marquage-textile/broderie-personnalisee/"
  status = 301
  force = true

[[redirects]]
  from = "/services/broderie-personnalisee/"
  to = "/services/broderie-marquage-textile/broderie-personnalisee/"
  status = 301
  force = true

[[redirects]]
  from = "/services/flocage-marquage-textile"
  to = "/services/broderie-marquage-textile/flocage-marquage-textile/"
  status = 301
  force = true

[[redirects]]
  from = "/services/flocage-marquage-textile/"
  to = "/services/broderie-marquage-textile/flocage-marquage-textile/"
  status = 301
  force = true

[[redirects]]
  from = "/services/vetements-travail-personnalises"
  to = "/services/broderie-marquage-textile/vetements-travail-personnalises/"
  status = 301
  force = true

[[redirects]]
  from = "/services/vetements-travail-personnalises/"
  to = "/services/broderie-marquage-textile/vetements-travail-personnalises/"
  status = 301
  force = true

[[redirects]]
  from = "/services/creation-logo-identite-visuelle"
  to = "/services/creation-graphique-digitale/creation-logo-identite-visuelle/"
  status = 301
  force = true

[[redirects]]
  from = "/services/creation-logo-identite-visuelle/"
  to = "/services/creation-graphique-digitale/creation-logo-identite-visuelle/"
  status = 301
  force = true

[[redirects]]
  from = "/services/supports-imprimes-print"
  to = "/services/creation-graphique-digitale/supports-imprimes-print/"
  status = 301
  force = true

[[redirects]]
  from = "/services/supports-imprimes-print/"
  to = "/services/creation-graphique-digitale/supports-imprimes-print/"
  status = 301
  force = true

[[redirects]]
  from = "/services/creation-site-internet-frejus"
  to = "/services/creation-graphique-digitale/creation-site-internet-frejus/"
  status = 301
  force = true

[[redirects]]
  from = "/services/creation-site-internet-frejus/"
  to = "/services/creation-graphique-digitale/creation-site-internet-frejus/"
  status = 301
  force = true
```

Puis mettre à jour le sitemap pour utiliser les URLs canoniques imbriquées (voir Tâche 4 — les URLs plats doivent aussi être corrigées en imbriquées dans le sitemap).

**Vérification :** Grep `broderie-personnalisee` dans netlify.toml → doit retourner les nouvelles règles.

---

### TÂCHE 7 — Corriger IntersectionObserver (re-cache au scroll — risque CLS)
**Impact :** Haute — CLS dégradé + contenu masqué lors du rendu Google
**Fichier :** `ROOT/index.html`

**Opération :**
Localiser le bloc JavaScript contenant `IntersectionObserver`. Chercher le pattern :
```javascript
} else {
    entry.target.style.opacity = '0';
    entry.target.style.transform = 'translateY(20px)';
}
```
Supprimer ce bloc `else` entièrement. Ajouter `observer.unobserve(entry.target)` juste après la ligne qui révèle l'élément (typiquement après avoir mis `opacity = '1'` et `transform = 'none'`).

Résultat attendu — la callback de l'observer doit ressembler à :
```javascript
if (entry.isIntersecting) {
  entry.target.style.opacity = '1';
  entry.target.style.transform = 'none';
  observer.unobserve(entry.target); // ← ajouter cette ligne
}
// Supprimer tout bloc else
```

**Vérification :** Grep `translateY(20px)` dans index.html → doit retourner 0 résultat dans le contexte IntersectionObserver.

---

### TÂCHE 8 — Réserver la hauteur du widget Elfsight (risque CLS)
**Impact :** Haute — layout shift au chargement du widget tiers
**Fichier :** `ROOT/index.html`

**Opération :**
Chercher `elfsight-app-e5b8df07` (ou la classe Elfsight présente). Ajouter `style="min-height: 300px"` au `<div>` conteneur si cet attribut est absent.

```html
<!-- Avant -->
<div class="elfsight-app-e5b8df07-c86e-4f50-bb1e-51158a21a773" data-elfsight-app-lazy></div>

<!-- Après -->
<div class="elfsight-app-e5b8df07-c86e-4f50-bb1e-51158a21a773" data-elfsight-app-lazy style="min-height: 300px"></div>
```

**Vérification :** Grep `elfsight-app` dans index.html → vérifier que le div contient `min-height`.

---

### TÂCHE 9 — Supprimer le header X-XSS-Protection déprécié
**Impact :** Basse — header obsolète depuis 2019, la CSP suffit
**Fichier :** `ROOT/netlify.toml`

**Opération :**
Supprimer la ligne suivante dans la section `[headers.values]` de la règle `for = "/*"` :
```
X-XSS-Protection = "1; mode=block"
```

**Vérification :** Grep `X-XSS-Protection` dans netlify.toml → doit retourner 0 résultat.

---

## PHASE 2 — ON-PAGE SEO & SCHEMA (score ~72/100 → ~80/100)

---

### TÂCHE 10 — Réécrire les `<title>` des pages services (format mot-clé)
**Impact :** Haute — titre = signal de ranking #1 sur la page
**Fichiers et corrections :**

| Fichier | Titre actuel (question) | Titre cible |
|---------|------------------------|-------------|
| `services/creation-graphique-digitale/creation-logo-identite-visuelle/index.html` | Quel prix pour créer un logo ? | `Création Logo & Identité Visuelle Fréjus | Création Édition & Broderie` |
| `services/creation-graphique-digitale/supports-imprimes-print/index.html` | Où imprimer des flyers à Fréjus ? | `Impression Flyers & Supports Imprimés Fréjus | Création Édition & Broderie` |
| `services/creation-graphique-digitale/creation-site-internet-frejus/index.html` | Qui fait des sites web à Fréjus ? | `Création Site Internet Fréjus | Agence Web Var | Création Édition & Broderie` |
| `services/broderie-marquage-textile/broderie-personnalisee/index.html` | Combien coûte une broderie personnalisée ? | `Broderie Personnalisée Fréjus | Marquage Textile Var | Création Édition & Broderie` |
| `services/broderie-marquage-textile/flocage-marquage-textile/index.html` | Qu'est-ce que le flocage textile ? | `Flocage & Marquage Textile Fréjus | Personnalisation Vêtements Var` |
| `services/broderie-marquage-textile/vetements-travail-personnalises/index.html` | Où acheter des vêtements de travail ? | `Vêtements de Travail Personnalisés Fréjus | Broderie & Flocage Pro` |
| `services/creation-graphique-digitale/index.html` | Qui crée des logos à Fréjus ? | `Création Graphique & Digitale Fréjus | Studio Graphique Var` |
| `services/broderie-marquage-textile/index.html` | Où faire broder un logo à Fréjus ? | `Broderie & Marquage Textile Fréjus | Personnalisation Textile Var` |

**Opération pour chaque fichier :**
Lire le fichier, localiser `<title>` et remplacer le texte entre les balises.

**Vérification :** Grep `<title>` dans chaque fichier → vérifier le nouveau titre.

---

### TÂCHE 11 — Remplacer le schema LocalBusiness de la homepage
**Impact :** Haute — schema incomplet, @type sous-spécifié, WebSite absent
**Fichier :** `ROOT/index.html`

**Opération :**
Localiser le bloc `<script type="application/ld+json">` existant dans le `<head>`. Le remplacer intégralement par ce bloc (conserver les URLs sameAs existantes) :

```json
<script type="application/ld+json">
[
  {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    "@id": "https://creationeditionbroderie.com/#organization",
    "name": "Création Édition & Broderie",
    "url": "https://creationeditionbroderie.com/",
    "logo": {
      "@type": "ImageObject",
      "url": "https://creationeditionbroderie.com/logo_main.jpg",
      "width": 400,
      "height": 400
    },
    "image": {
      "@type": "ImageObject",
      "url": "https://creationeditionbroderie.com/assets/images/services/og-image.jpg"
    },
    "description": "Studio créatif et atelier de marquage textile à Fréjus, Côte d'Azur. Spécialisé en identité visuelle, création de logos, supports imprimés, web design, broderie et flocage personnalisés pour entreprises et particuliers.",
    "telephone": "+33980777652",
    "email": "emiliecreationbroderie@gmail.com",
    "priceRange": "À partir de 390€",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "25 Place Dei Doufin - Le Paladien 7D",
      "addressLocality": "Fréjus",
      "postalCode": "83600",
      "addressRegion": "Var",
      "addressCountry": "FR"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": 43.4329,
      "longitude": 6.7361
    },
    "areaServed": [
      { "@type": "City", "name": "Fréjus" },
      { "@type": "City", "name": "Saint-Raphaël" },
      { "@type": "AdministrativeArea", "name": "Var" },
      { "@type": "AdministrativeArea", "name": "Côte d'Azur" }
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday"],
        "opens": "09:00",
        "closes": "17:00"
      }
    ],
    "makesOffer": [
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Création Logo & Identité Visuelle",
          "description": "Création de logos sur-mesure, charte graphique complète, 3 propositions et révisions incluses.",
          "url": "https://creationeditionbroderie.com/services/creation-graphique-digitale/creation-logo-identite-visuelle/",
          "provider": { "@id": "https://creationeditionbroderie.com/#organization" },
          "areaServed": "Fréjus, Var, Côte d'Azur"
        },
        "priceSpecification": { "@type": "PriceSpecification", "price": "390", "priceCurrency": "EUR", "minPrice": "390" }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Broderie Personnalisée",
          "description": "Broderie sur vêtements, linge et textile professionnel. Logos, prénoms et motifs sur-mesure.",
          "url": "https://creationeditionbroderie.com/services/broderie-marquage-textile/broderie-personnalisee/",
          "provider": { "@id": "https://creationeditionbroderie.com/#organization" },
          "areaServed": "Fréjus, Var, Côte d'Azur"
        },
        "priceSpecification": { "@type": "PriceSpecification", "price": "5", "priceCurrency": "EUR", "minPrice": "5" }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Flocage & Marquage Textile",
          "description": "Flocage professionnel sur textile : tee-shirts, vestes, vêtements de travail personnalisés.",
          "url": "https://creationeditionbroderie.com/services/broderie-marquage-textile/flocage-marquage-textile/",
          "provider": { "@id": "https://creationeditionbroderie.com/#organization" },
          "areaServed": "Fréjus, Var, Côte d'Azur"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Supports Imprimés & Print",
          "description": "Impression de flyers, cartes de visite, brochures et affiches. BAT gratuit.",
          "url": "https://creationeditionbroderie.com/services/creation-graphique-digitale/supports-imprimes-print/",
          "provider": { "@id": "https://creationeditionbroderie.com/#organization" },
          "areaServed": "Fréjus, Var, Côte d'Azur"
        }
      },
      {
        "@type": "Offer",
        "itemOffered": {
          "@type": "Service",
          "name": "Création Site Internet",
          "description": "Création de sites web professionnels, modernes et responsive pour entreprises et indépendants.",
          "url": "https://creationeditionbroderie.com/services/creation-graphique-digitale/creation-site-internet-frejus/",
          "provider": { "@id": "https://creationeditionbroderie.com/#organization" },
          "areaServed": "Fréjus, Var, Côte d'Azur"
        }
      }
    ],
    "sameAs": [
      "https://g.co/kgs/wpZFPDN",
      "https://www.facebook.com/people/Creation-Edition-Broderie-Frejus/100063745952041/",
      "https://www.instagram.com/creationeditionbroderie/",
      "https://www.linkedin.com/company/creation-edition-broderie/"
    ]
  },
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "https://creationeditionbroderie.com/#website",
    "url": "https://creationeditionbroderie.com/",
    "name": "Création Édition & Broderie",
    "description": "Agence de communication créative à Fréjus : graphisme, broderie, flocage, impression et création web.",
    "publisher": { "@id": "https://creationeditionbroderie.com/#organization" },
    "inLanguage": "fr-FR"
  }
]
</script>
```

> **Note agent :** Avant de remplacer, lire le fichier et récupérer les URLs `sameAs` existantes pour les conserver/compléter. Les URLs LinkedIn et Instagram ci-dessus sont des exemples — vérifier les vraies URLs dans le footer ou le code existant.

**Vérification :** Grep `ProfessionalService` dans index.html → doit retourner 1 résultat. Grep `WebSite` → doit retourner 1 résultat.

---

### TÂCHE 12 — Ajouter Service + BreadcrumbList sur les pages services sans schema
**Impact :** Haute — aucun schema sur 4 pages de services
**Fichiers cibles :**
- `ROOT/services/creation-graphique-digitale/creation-logo-identite-visuelle/index.html`
- `ROOT/services/creation-graphique-digitale/supports-imprimes-print/index.html`
- `ROOT/services/creation-graphique-digitale/creation-site-internet-frejus/index.html`
- `ROOT/services/broderie-marquage-textile/flocage-marquage-textile/index.html`
- `ROOT/services/broderie-marquage-textile/vetements-travail-personnalises/index.html`

**Opération :**
Pour chaque fichier, ajouter dans le `<head>` (avant `</head>`) un bloc `<script type="application/ld+json">` avec `Service` + `BreadcrumbList`. Adapter les valeurs selon la page.

Exemple pour `creation-logo-identite-visuelle` :
```json
<script type="application/ld+json">
[
  {
    "@context": "https://schema.org",
    "@type": "Service",
    "name": "Création Logo & Identité Visuelle",
    "description": "Création de logos professionnels sur-mesure à Fréjus : 3 propositions graphiques, révisions incluses, charte graphique complète.",
    "url": "https://creationeditionbroderie.com/services/creation-graphique-digitale/creation-logo-identite-visuelle/",
    "provider": {
      "@type": "ProfessionalService",
      "@id": "https://creationeditionbroderie.com/#organization"
    },
    "areaServed": ["Fréjus", "Saint-Raphaël", "Var", "Côte d'Azur"],
    "offers": {
      "@type": "Offer",
      "priceSpecification": {
        "@type": "PriceSpecification",
        "price": "390",
        "priceCurrency": "EUR",
        "minPrice": "390"
      }
    },
    "inLanguage": "fr-FR"
  },
  {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      { "@type": "ListItem", "position": 1, "name": "Accueil", "item": "https://creationeditionbroderie.com/" },
      { "@type": "ListItem", "position": 2, "name": "Création Graphique & Digitale", "item": "https://creationeditionbroderie.com/services/creation-graphique-digitale/" },
      { "@type": "ListItem", "position": 3, "name": "Création Logo & Identité Visuelle", "item": "https://creationeditionbroderie.com/services/creation-graphique-digitale/creation-logo-identite-visuelle/" }
    ]
  }
]
</script>
```

Adapter pour chaque page en changeant : `name`, `description`, `url`, `price` (si connu), et les `itemListElement` du fil d'Ariane.

**Vérification :** Grep `BreadcrumbList` dans chaque fichier → doit retourner 1 résultat par fichier.

---

### TÂCHE 13 — Ajouter canonical manquant sur la page broderie personnalisée
**Impact :** Moyenne — page sans canonical = risque de duplicate content
**Fichier :** `ROOT/services/broderie-marquage-textile/broderie-personnalisee/index.html`

**Opération :**
Vérifier si une balise `<link rel="canonical">` existe. Si absente, l'ajouter dans le `<head>` :
```html
<link rel="canonical" href="https://creationeditionbroderie.com/services/broderie-marquage-textile/broderie-personnalisee/">
```

**Vérification :** Grep `rel="canonical"` dans ce fichier → doit retourner 1 résultat avec le bon href.

---

### TÂCHE 14 — Unifier les URLs sameAs dans tous les blocs schema Organization
**Impact :** Moyenne — entité non consolidable par Google et les IA si URLs incohérentes
**Fichiers :** Tous les fichiers HTML contenant `"@type": "Organization"` ou `sameAs`

**Opération :**
1. Grep `sameAs` dans tout le répertoire ROOT
2. Identifier toutes les URLs Facebook utilisées (il existe au moins deux formats différents)
3. Choisir une URL canonique par réseau social (utiliser celle du schema homepage mis à jour en Tâche 11)
4. Remplacer toutes les occurrences des URLs alternatives par les URLs canoniques retenues

**Vérification :** Grep `facebook.com` dans `ROOT/**/*.html` → toutes les occurrences dans les schemas doivent utiliser la même URL.

---

### TÂCHE 15 — Optimiser l'image LCP (fetchpriority + preload)
**Impact :** Haute — LCP potentiellement retardé par lazy loading incorrect
**Fichier :** `ROOT/index.html`

**Opération :**
1. Lire le `<head>` de index.html et identifier les balises `<link rel="preload">` existantes
2. Identifier la première image visible du hero (chercher le premier `<img>` dans la section hero/bannière)
3. Si cette image a `loading="lazy"`, le supprimer
4. Ajouter `fetchpriority="high"` sur cette image
5. Ajouter dans le `<head>` avant `</head>` :
```html
<link rel="preload" as="image" href="[URL_IMAGE_HERO]" fetchpriority="high">
```
Remplacer `[URL_IMAGE_HERO]` par le `src` réel de l'image hero identifiée.

**Vérification :** Grep `fetchpriority="high"` dans index.html → doit retourner ≥1 résultat.

---

### TÂCHE 16 — Supprimer les balises `<changefreq>` et `<priority>` du sitemap
**Impact :** Basse — bruit inutile, ignoré par Google
**Fichier :** `ROOT/sitemap.xml`

**Opération :**
Supprimer toutes les lignes contenant `<changefreq>` et toutes les lignes contenant `<priority>` dans le fichier.

**Vérification :** Grep `changefreq` dans sitemap.xml → doit retourner 0 résultat.

---

### TÂCHE 17 — Supprimer le token Google Search Console en doublon
**Impact :** Basse — nettoyage
**Fichier :** `ROOT/index.html`

**Opération :**
Chercher les deux occurrences de `<meta name="google-site-verification"`. En garder une seule (la plus récente ou celle de la propriété GSC active). Supprimer l'autre.

**Vérification :** Grep `google-site-verification` dans index.html → doit retourner exactement 1 résultat.

---

### TÂCHE 18 — Nettoyer robots.txt des règles WordPress inutiles
**Impact :** Basse — nettoyage, signal de qualité
**Fichier :** `ROOT/robots.txt`

**Opération :**
Lire le fichier. Supprimer toutes les lignes `Disallow` concernant :
- `/wp-admin/`
- `/wp-includes/`
- `/wp-content/`
- `/wp-json/`
- `/xmlrpc.php`
- `/wp-login.php`
- Toute autre directive spécifique à WordPress

Conserver uniquement les `Disallow` pertinents pour ce site statique (ex : `/admin/`, `/_archives/`, etc.) et la déclaration `Sitemap:`.

**Vérification :** Grep `wp-admin` dans robots.txt → doit retourner 0 résultat.

---

### TÂCHE 19 — Supprimer `<meta name="keywords">` de toutes les pages
**Impact :** Basse — ignoré par Google, révèle la stratégie aux concurrents
**Scope :** Tous les fichiers HTML du projet

**Opération :**
Grep `<meta name="keywords"` dans ROOT récursivement. Pour chaque fichier retourné, supprimer la ligne entière contenant cette balise.

**Vérification :** Grep `<meta name="keywords"` dans ROOT → doit retourner 0 résultat.

---

### TÂCHE 20 — Ajouter og:image:width et og:image:height sur toutes les pages
**Impact :** Basse — améliore l'affichage lors du partage sur réseaux sociaux
**Scope :** Tous les fichiers HTML contenant `og:image`

**Opération :**
Grep `og:image"` dans ROOT. Pour chaque fichier, après la balise `<meta property="og:image"`, ajouter si absentes :
```html
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
```

**Vérification :** Grep `og:image:width` dans ROOT → doit retourner autant de résultats que de fichiers avec og:image.

---

### TÂCHE 21 — Mettre à jour HSTS dans netlify.toml
**Impact :** Basse — sécurité améliorée
**Fichier :** `ROOT/netlify.toml`

**Opération :**
Dans la section `[headers.values]` de la règle `for = "/*"`, si la clé `Strict-Transport-Security` est présente, la mettre à jour. Sinon l'ajouter :
```toml
Strict-Transport-Security = "max-age=63072000; includeSubDomains; preload"
```

**Vérification :** Grep `Strict-Transport-Security` dans netlify.toml → doit retourner la nouvelle valeur.

---

### TÂCHE 22 — Charger pdf.js en lazy (dynamique) uniquement si nécessaire
**Impact :** Moyenne — 1,4 MB de JS inutilement parsé sur toutes les pages
**Fichier :** `ROOT/index.html` (et tout autre fichier chargeant pdf.js)

**Opération :**
1. Grep `pdf.js` dans ROOT récursivement pour identifier tous les fichiers qui le chargent
2. Pour chaque fichier, remplacer le `<script src="...pdf.js" defer>` par un chargement dynamique conditionnel :
```html
<script>
  // Charger pdf.js uniquement si un viewer PDF est présent sur la page
  if (document.querySelector('.pdf-viewer, [data-pdf-src], canvas[data-pdf]')) {
    const script = document.createElement('script');
    script.src = '[URL_PDF_JS]';
    document.head.appendChild(script);
  }
</script>
```
Adapter le sélecteur selon l'élément réellement utilisé pour déclencher le PDF.

**Vérification :** Grep `pdf.js` dans les fichiers modifiés → la balise `<script src>` directe ne doit plus exister.

---

## PHASE 3 — CONTENU & AUTORITÉ (score ~80/100 → ~90/100)
> Ces tâches nécessitent de la rédaction. Demander confirmation avant d'exécuter.

---

### TÂCHE 23 — Réécrire les deux pages catégories thin content
**Impact :** Critique — thin content (~200 mots) avec H2 placeholder visible
**Fichiers :**
- `ROOT/services/creation-graphique-digitale/index.html`
- `ROOT/services/broderie-personnalisee/index.html`

**Opération :**
1. Lire chaque fichier pour comprendre la structure HTML existante (hero, grille de cartes, CTA)
2. Localiser la section `<h2>Appel à l'Action</h2>` → remplacer par un vrai titre + contenu
3. Enrichir le contenu principal pour atteindre minimum 800 mots. Contenu requis :
   - Description du pôle de services (3-4 paragraphes)
   - Section "Notre processus" (4 étapes minimum)
   - Section "Pourquoi nous choisir" (3-4 arguments différenciants)
   - Section FAQ (4-6 questions/réponses propres au secteur)
   - Témoignage client (prénom + secteur + résultat)
   - CTA final avec prix indicatif

**Contenu suggéré pour `creation-graphique-digitale` :**
Thèmes : identité visuelle, charte graphique, impression, web design, studio local Fréjus, accompagnement de A à Z.

**Contenu suggéré pour `broderie-personnalisee` (page racine) :**
Thèmes : broderie artisanale, personnalisation textile, entreprises et particuliers, Fréjus, machines professionnelles, délais, tarifs à partir de 5€.

**Vérification :** Grep `Appel à l'Action` dans chaque fichier → doit retourner 0 résultat.

---

### TÂCHE 24 — Créer la page "À propos"
**Impact :** Haute — pilier E-E-A-T Experience, auteure nommée
**Fichier à créer :** `ROOT/a-propos/index.html`

**Opération :**
Créer un fichier `index.html` dans un nouveau dossier `ROOT/a-propos/`. Utiliser la structure HTML des autres pages du site comme template (même `<head>`, navigation, footer). Contenu minimum :

```
- Titre H1 : "À propos d'Émilie — Votre Studio Créatif à Fréjus"
- Photo de l'auteure (si disponible dans ROOT/assets/images/)
- Biographie : parcours, formation, années d'expérience, spécialités
- Section équipements : machines de broderie, logiciels (Adobe, Procreate...)
- Section valeurs : approche sur-mesure, suivi client, local
- Section chiffres clés : +200 projets, +300 clients, années d'activité
- Schema Person dans le <head>
- CTA vers Contact
```

Schema `Person` à ajouter dans le `<head>` :
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "Émilie [Nom de famille à compléter]",
  "jobTitle": "Directrice artistique & Fondatrice",
  "worksFor": { "@id": "https://creationeditionbroderie.com/#organization" },
  "url": "https://creationeditionbroderie.com/a-propos/",
  "sameAs": [
    "https://www.linkedin.com/in/[profil-linkedin-emilie/]"
  ]
}
</script>
```

Ajouter ensuite `/a-propos/` au sitemap.xml.

**Vérification :** Fichier `ROOT/a-propos/index.html` existe. Grep `a-propos` dans sitemap.xml → doit retourner 1 résultat.

---

### TÂCHE 25 — Ajouter des FAQs avec schema FAQPage sur les pages services
**Impact :** Haute — rich snippets FAQ + boost citations IA
**Fichiers cibles :** Toutes les pages de services (priorité aux pages avec titres en format question)

**Opération :**
Pour chaque page service, ajouter une section FAQ HTML avec 4-6 questions. Puis ajouter le schema correspondant dans le `<head>`.

Exemple de questions par service :

**Broderie personnalisée :**
- Quel est le délai pour une broderie personnalisée ?
- Quel est la quantité minimum pour une commande de broderie ?
- Quels formats de fichier acceptez-vous pour un logo à broder ?
- Peut-on broder sur tous types de textiles ?
- Combien coûte une broderie de prénom sur une serviette ?

**Logo & Identité visuelle :**
- Combien de temps pour créer un logo professionnel ?
- Combien de propositions sont incluses dans la création de logo ?
- Quels fichiers sont livrés à la fin du projet ?
- Peut-on modifier le logo après livraison ?
- La charte graphique est-elle incluse dans le prix ?

Schema FAQPage à ajouter dans le `<head>` (exemple broderie) :
```json
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "Quel est le délai pour une broderie personnalisée ?",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "Le délai standard est de 5 à 7 jours ouvrés. Un service express 48h est disponible sur demande."
      }
    }
  ]
}
</script>
```

**Vérification :** Grep `FAQPage` dans chaque fichier modifié → doit retourner 1 résultat.

---

### TÂCHE 26 — Mettre à jour les auteurs des articles de blog (Organization → Person)
**Impact :** Haute — E-E-A-T Expertise et Authoritativeness
**Scope :** Tous les fichiers dans `ROOT/blog/articles/*.html` contenant un schema `BlogPosting`

**Opération :**
Grep `"@type": "Organization"` dans `ROOT/blog/articles/`. Pour chaque fichier retourné, dans le contexte du schema BlogPosting, remplacer :
```json
"author": {
  "@type": "Organization",
  "name": "Création Édition & Broderie"
}
```
Par :
```json
"author": {
  "@type": "Person",
  "name": "Émilie [Nom de famille]",
  "url": "https://creationeditionbroderie.com/a-propos/"
}
```

**Vérification :** Grep `"author"` dans 3 articles aléatoires → doit contenir `"@type": "Person"`.

---

### TÂCHE 27 — Intégrer des témoignages clients avec schema Review
**Impact :** Haute — autorité, conversion, éligibilité aux étoiles dans les SERPs
**Fichier principal :** `ROOT/index.html`

**Opération :**
1. Vérifier si une section témoignages existe dans index.html (Grep `témoignage` ou `avis`)
2. Si absente, créer une section HTML entre la section portfolio et le footer
3. Minimum 4 témoignages avec : prénom + initial du nom, secteur, texte du témoignage, note /5
4. Ajouter dans le `<head>` un schema `AggregateRating` intégré à l'`Organization` :

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "5",
  "reviewCount": "47",
  "bestRating": "5"
}
```
(Ajuster `ratingValue` et `reviewCount` selon les vraies données Google)

Ajouter également des schemas `Review` individuels si souhaité.

**Vérification :** Grep `AggregateRating` dans index.html → doit retourner 1 résultat.

---

## PHASE 4 — BACKLOG (score ~90/100 → ~95/100)

---

### TÂCHE 28 — Créer un favicon.png propre
**Impact :** Basse
**Fichier :** `ROOT/logo_main.jpg` → créer `ROOT/favicon.png`

**Opération :**
Si un outil de conversion d'image est disponible : convertir `logo_main.jpg` en PNG 32x32 et 180x180. Placer à la racine comme `favicon.png` et `apple-touch-icon.png`.

Remplacer dans **tous les fichiers HTML** :
```html
<!-- Avant (fragile, mauvais MIME) -->
<link rel="icon" href="../../../logo_main.jpg" type="image/jpg">

<!-- Après (absolu, correct) -->
<link rel="icon" href="/favicon.png" type="image/png">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
```

**Vérification :** Grep `rel="icon"` dans 3 fichiers → tous doivent pointer vers `/favicon.png` avec chemin absolu.

---

### TÂCHE 29 — Corriger le copyright statique dans les mentions légales
**Impact :** Basse — signal de maintenance
**Fichier :** `ROOT/mentions-legales/index.html`

**Opération :**
Chercher `© 2024` dans ce fichier. Remplacer par un script dynamique identique à celui de la homepage :
```html
© <span id="yearMentions"></span> Création Édition & Broderie
<script>document.getElementById('yearMentions').textContent = new Date().getFullYear();</script>
```

**Vérification :** Grep `© 2024` dans mentions-legales/index.html → doit retourner 0 résultat.

---

### TÂCHE 30 — Supprimer les emoji des meta descriptions
**Impact :** Basse — présentation dans les SERPs
**Scope :** Tous les fichiers HTML du projet

**Opération :**
Grep `<meta name="description"` dans ROOT. Pour chaque fichier contenant des emoji (🎨, 💡, ✂️, 📞, etc.) dans les meta descriptions, les supprimer et utiliser l'espace récupéré pour ajouter un mot-clé pertinent.

**Vérification :** Grep `description.*🎨` dans ROOT → doit retourner 0 résultat.

---

## TÂCHES HUMAINES (non exécutables par agent)
> Ces tâches nécessitent des informations ou actions externes. Les lister pour information.

| # | Tâche | Raison bloquante |
|---|-------|-----------------|
| H1 | Compléter mentions légales : SIRET, Code APE, hébergeur, nom complet directrice | Données personnelles / légales à fournir par le propriétaire |
| H2 | Ajouter le vrai nom de famille d'Émilie dans le schema Person et la page À propos | Donnée personnelle |
| H3 | Vérifier et corriger les URLs sameAs Instagram et LinkedIn réels | URLs exactes à fournir par le propriétaire |
| H4 | Soumettre le domaine à hstspreload.org | Action externe irréversible, confirmation requise |
| H5 | Soumettre le sitemap mis à jour dans Google Search Console | Accès GSC requis |
| H6 | Ajouter les vraies photos témoignages clients | Assets à fournir |
| H7 | Valider la note AggregateRating avec les vraies données Google Business | Données réelles à récupérer dans Google Business |

---

## ORDRE D'EXÉCUTION RECOMMANDÉ POUR L'AGENT

```
Phase 1 (toutes séquentielles, impact immédiat) :
  T1 → T2 → T3 → T4 → T5 → T6 → T7 → T8 → T9

Phase 2 (peuvent être parallélisées par groupe de fichiers) :
  T10 + T13 + T17 + T19 + T20 (modifications indépendantes)
  T11 → T14 (index.html — séquentielles)
  T12 (fichiers services — parallélisables entre eux)
  T16 → T18 (fichiers de config — séquentielles)
  T15 + T21 + T22 (optimisations techniques indépendantes)

Phase 3 (demander confirmation avant chaque tâche) :
  T23 → T24 → T25 → T26 → T27

Phase 4 :
  T28 → T29 → T30
```

---

## SCORE ESTIMÉ PAR PHASE

| Après phase | Score estimé | Gain |
|-------------|-------------|------|
| Départ | 55/100 | — |
| Phase 1 | 72/100 | +17 |
| Phase 2 | 80/100 | +8 |
| Phase 3 | 90/100 | +10 |
| Phase 4 | 95/100 | +5 |
