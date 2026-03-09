# Assets utilisés par la page Yachting
> Fichier : `services/yachting/index.html`

---

## 📸 Images locales (7 fichiers)

| # | Chemin relatif (depuis yachting/) | Chemin absolu (depuis la racine du projet) | Utilisée pour |
|---|---|---|---|
| 1 | `../../logo_main.jpg` | `logo_main.jpg` | Favicon |
| 2 | `../../assets/images/services/yachting/Screenshot_20260209_110135_Instagram.jpg` | `assets/images/services/yachting/Screenshot_20260209_110135_Instagram.jpg` | Hero + Projet 4 (Crew Uniforms) |
| 3 | `../../assets/images/services/yachting/Screenshot_20260209_105844_Instagram.jpg` | `assets/images/services/yachting/Screenshot_20260209_105844_Instagram.jpg` | Projet 1 (Yacht Embroidery) |
| 4 | `../../assets/images/services/yachting/Screenshot_20260209_105938_Instagram.jpg` | `assets/images/services/yachting/Screenshot_20260209_105938_Instagram.jpg` | Projet 2 (Custom Textiles) |
| 5 | `../../assets/images/services/yachting/Screenshot_20260209_110040_Instagram.jpg` | `assets/images/services/yachting/Screenshot_20260209_110040_Instagram.jpg` | Projet 3 (Yacht Branding) |
| 6 | `../../assets/images/services/yachting/Screenshot_20260209_110235_Instagram.jpg` | `assets/images/services/yachting/Screenshot_20260209_110235_Instagram.jpg` | Projet 5 (Yacht Accessories) |
| 7 | `../../assets/images/services/yachting/Screenshot_20260209_110425_Instagram.jpg` | `assets/images/services/yachting/Screenshot_20260209_110425_Instagram.jpg` | Projet 6 (Safety Plans) |

---

## 📜 Scripts externes (1 fichier)

| # | URL | Rôle |
|---|---|---|
| 1 | `https://cdn.tailwindcss.com` | Framework CSS Tailwind (chargé via CDN, pas le CSS compilé local) |

---

## 🎨 Fonts externes (1 fichier)

| # | URL | Polices |
|---|---|---|
| 1 | `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Poppins:wght@400;500;600;700&display=swap` | Inter (300-700) + Poppins (400-700) |

---

## 📝 Scripts inline (2 blocs)

### Bloc 1 — Configuration Tailwind (ligne 19-41)
```javascript
tailwind.config = {
    theme: {
        extend: {
            colors: {
                'brand-magenta': '#D9006C',
                'brand-black': '#000000',
                'brand-gray-light': '#94A3B8',
                'brand-gray-medium': '#64748B',
                'brand-gray-dark': '#334155',
                'brand-gray-darker': '#1E293B',
                'yacht-navy': '#1E3A5F',
                'yacht-gold': '#D4A853',
                'yacht-blue': '#2563EB',
            },
            fontFamily: {
                'heading': ['Poppins', 'sans-serif'],
                'body': ['Inter', 'sans-serif']
            }
        }
    }
}
```

### Bloc 2 — JavaScript interactif (ligne 1126-1278)
Fonctionnalités incluses :
- **Menu mobile** : Ouverture/fermeture avec animation slide
- **Menu Services** : Dropdown toggle avec chevron rotation
- **Scroll animations** : IntersectionObserver pour `.scroll-animate`, `.scroll-animate-left`, `.scroll-animate-right`, `.scroll-animate-scale`
- **Counter animation** : Animation de comptage avec easing (pour les stats 3, 2, 4)
- **Smooth scroll** : Scroll fluide pour les ancres `#`
- **Parallax** : Effet parallax sur la section hero `.gradient-yacht`

---

## 🎨 Styles CSS inline (1 bloc — ligne 42-343)

Classes CSS personnalisées définies :
- `.gradient-yacht` — Fond dégradé bleu marine/or
- `.hover-lift` — Animation hover avec élévation
- `.yacht-pattern` — Pattern SVG ancre/vague en fond
- `.yacht-glow` — Ombre dorée pour boutons
- `.shimmer-gold` — Effet brillant doré sur texte
- `.anchor-bounce` — Animation rebond pour l'ancre ⚓
- `.animate-float` / `.animate-float-slow` / `.animate-float-delayed` — Animations flottantes
- `.animate-wave` — Animation vague
- `.fade-in-up` / `.fade-in-left` / `.fade-in-right` — Animations d'entrée
- `.scroll-animate` / `.scroll-animate-left` / `.scroll-animate-right` / `.scroll-animate-scale` — Animations au scroll
- `.btn-subtle` — Hover subtil pour boutons
- `.icon-hover-spin` — Rotation d'icône au hover
- `.glow-animate` — Effet lueur pulsante
- `.animated-gradient-text` — Texte avec dégradé animé
- `.delay-100` à `.delay-600` — Délais d'animation échelonnés

---

## 📋 Liens internes (pages liées)

| Destination | Chemin |
|---|---|
| Accueil | `../../index.html` |
| Réalisations | `../../realisations/index.html` |
| Blog | `../../blog/index.html` |
| Contact / Devis | `../../contact/index.html` |
| Logo & Identité Visuelle | `../creation-graphique-digitale/creation-logo-identite-visuelle/index.html` |
| Supports Imprimés | `../creation-graphique-digitale/supports-imprimes-print/index.html` |
| Création Site Internet | `../creation-graphique-digitale/creation-site-internet-frejus/index.html` |
| Broderie Personnalisée | `../broderie-marquage-textile/broderie-personnalisee/index.html` |
| Flocage & Marquage | `../broderie-marquage-textile/flocage-marquage-textile/index.html` |
| Vêtements de Travail | `../broderie-marquage-textile/vetements-travail-personnalises/index.html` |
| Yacht Services (self) | `../yachting/index.html` |

---

## ⚠️ Note importante
La page Yachting utilise le **CDN Tailwind** (`cdn.tailwindcss.com`) avec sa propre config inline, contrairement aux autres pages de services qui utilisent le fichier CSS compilé local (`/assets/css/tailwind.css`). Cela signifie que les couleurs `yacht-navy`, `yacht-gold`, `yacht-blue` fonctionnent sur cette page car elles sont définies dans le config inline, mais ne seront PAS disponibles dans le CSS compilé global sauf si ajoutées au `tailwind.config.cjs`.
