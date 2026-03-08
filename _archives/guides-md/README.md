# 🎨 Création & Édition - Site Web + CRM

Site web professionnel pour Création & Édition avec système CRM intégré.

## 🌐 Site Public

Site vitrine pour les services de :
- 🧵 Broderie et marquage textile
- 🎯 Flocage
- 🖨️ Supports imprimés
- 🎨 Création graphique et logos
- 💻 Création de sites internet

**URL du site** : https://creationeditionbroderie.com

---

## 🔐 CRM Admin (Nouveau !)

Système de gestion client complet pour gérer :
- 👥 **Clients** - Base de données complète
- 📝 **Devis** - Création et suivi
- 🚀 **Projets** - Gestion des réalisations
- 💰 **Factures** - Suivi des paiements

### 🚀 Démarrage rapide

**Première installation ?** 

➜ Lisez **[PREMIERS-PAS.md](PREMIERS-PAS.md)** pour un guide complet (15-20 min)

### 📚 Documentation

| Document | Description | Temps |
|----------|-------------|-------|
| **[INDEX-DOCUMENTATION.md](INDEX-DOCUMENTATION.md)** | 📖 Index de toute la doc | 2 min |
| **[PREMIERS-PAS.md](PREMIERS-PAS.md)** | 🎯 Guide de démarrage | 10 min |
| **[INSTALLATION-CRM.md](INSTALLATION-CRM.md)** | 🔧 Installation détaillée | 8 min |
| **[COMMANDES.md](COMMANDES.md)** | 💻 Commandes utiles | Référence |
| **[README-CRM.md](README-CRM.md)** | 📚 Doc technique complète | 20 min |
| **[ARCHITECTURE-CRM.md](ARCHITECTURE-CRM.md)** | 🏗️ Architecture système | 15 min |
| **[RESUME-IMPLEMENTATION.md](RESUME-IMPLEMENTATION.md)** | ✅ Récapitulatif | 5 min |

### ⚡ Installation en 6 étapes

```bash
# 1. Installer les dépendances
npm install

# 2. Pousser sur Git
git push origin main

# 3. Configurer Neon sur Netlify (via l'interface)
# 4. Ajouter JWT_SECRET dans les variables Netlify
# 5. Initialiser la base de données
# 6. Se connecter sur /admin/login.html
```

**➜ Détails complets dans [PREMIERS-PAS.md](PREMIERS-PAS.md)**

---

## 🛠️ Technologies

### Site public
- HTML5 / CSS3 / JavaScript
- SEO optimisé
- Images optimisées (WebP)
- Performance maximale

### CRM
- **Backend** : Netlify Functions (Serverless)
- **Base de données** : Neon PostgreSQL
- **ORM** : Drizzle
- **Auth** : JWT + bcrypt
- **Frontend** : Vanilla JavaScript

---

## 📂 Structure du projet

```
creationedition/
├── admin/              # Interface CRM (non référencée)
├── netlify/functions/  # API serverless
├── db/                 # Schéma base de données
├── scripts/            # Scripts utilitaires
├── assets/             # Images et CSS du site public
├── services/           # Pages services
├── blog/               # Articles de blog
├── realisations/       # Portfolio
└── Documentation/      # Docs complètes (*.md)
```

---

## 🔒 Sécurité

- ✅ Pages admin non référencées (`robots.txt`)
- ✅ Authentification JWT sécurisée
- ✅ Mots de passe hashés (bcrypt)
- ✅ HTTPS forcé (Netlify)
- ✅ Variables sensibles protégées

---

## 🚀 Déploiement

Déploiement automatique sur Netlify à chaque push Git.

**Variables d'environnement requises** :
- `DATABASE_URL` (auto via Neon)
- `JWT_SECRET` (à configurer)

---

## 📞 Support

- **Documentation complète** : Consultez [INDEX-DOCUMENTATION.md](INDEX-DOCUMENTATION.md)
- **Problèmes** : Voir [PREMIERS-PAS.md](PREMIERS-PAS.md) section "Problèmes courants"
- **Commandes** : Référence dans [COMMANDES.md](COMMANDES.md)

---

## 🎯 Démarrer maintenant

**Nouveau ?** Commencez par lire **[PREMIERS-PAS.md](PREMIERS-PAS.md)** !

**Installation** : Suivez **[INSTALLATION-CRM.md](INSTALLATION-CRM.md)**

**Référence** : Consultez **[COMMANDES.md](COMMANDES.md)**

---

## 📊 Fonctionnalités CRM

### ✅ Disponible maintenant
- Authentification admin
- Gestion des clients (CRUD complet)
- Visualisation des devis
- Visualisation des projets
- Visualisation des factures
- Dashboard avec statistiques
- API REST complète

### 🔜 Prochainement
- Création de devis depuis l'interface
- Génération PDF
- Envoi d'emails
- Graphiques avancés
- Export Excel/CSV

---

## 💡 Aide-mémoire rapide

### Commandes essentielles
```bash
npm run dev          # Développement local
npm run db:studio    # Interface BDD
npm run db:migrate   # Appliquer migrations
npm run db:init      # Créer admin
```

### URLs importantes
- Site public : `/`
- Connexion CRM : `/admin/login.html`
- Dashboard : `/admin/dashboard.html`
- Health check : `/.netlify/functions/health-check`

### Identifiants par défaut
- Email : `admin@creation-edition.fr`
- Mot de passe : `Admin@2025`
- ⚠️ **À changer immédiatement après première connexion**

---

## 🎉 C'est parti !

Votre site web et CRM sont prêts. Suivez [PREMIERS-PAS.md](PREMIERS-PAS.md) pour commencer !

---

*Développé avec ❤️ pour Création & Édition*
*Mise à jour : 4 octobre 2025*

