# 🏗️ Architecture du CRM

## 📁 Structure des fichiers

```
creationedition/
│
├── admin/                          # Interface admin (non référencée)
│   ├── login.html                  # Page de connexion
│   ├── dashboard.html              # Tableau de bord avec statistiques
│   ├── clients.html                # Gestion des clients (CRUD complet)
│   ├── devis.html                  # Liste des devis
│   ├── projets.html                # Liste des projets
│   ├── factures.html               # Liste des factures
│   └── assets/
│       ├── css/
│       │   └── admin.css           # Styles de l'interface admin
│       └── js/
│           └── auth.js             # Gestion auth + API client
│
├── netlify/
│   └── functions/                  # API serverless
│       ├── auth-login.js           # POST - Authentification admin
│       ├── auth-verify.js          # GET - Vérification du token JWT
│       ├── clients.js              # CRUD clients
│       ├── devis.js                # CRUD devis
│       ├── projets.js              # CRUD projets
│       ├── factures.js             # CRUD factures
│       ├── setup-db.js             # Initialisation de la BDD (à sécuriser)
│       └── health-check.js         # Vérification de santé de la BDD
│
├── db/                             # Configuration base de données
│   ├── schema.js                   # Schéma Drizzle ORM (tables)
│   └── connection.js               # Connexion à Neon
│
├── scripts/                        # Scripts utilitaires
│   ├── migrate.js                  # Appliquer les migrations
│   └── init-db.js                  # Créer le compte admin par défaut
│
├── drizzle.config.js               # Configuration Drizzle ORM
├── package.json                    # Dépendances npm
├── netlify.toml                    # Configuration Netlify
├── robots.txt                      # Bloque /admin/ (SEO)
├── env.example                     # Template variables d'environnement
├── .gitignore                      # Fichiers à ignorer par Git
│
└── Documentation/
    ├── README-CRM.md               # Documentation complète
    ├── INSTALLATION-CRM.md         # Guide d'installation
    └── ARCHITECTURE-CRM.md         # Ce fichier
```

## 🗄️ Schéma de base de données

```
┌─────────────────┐
│     admins      │
├─────────────────┤
│ id (PK)         │
│ email           │
│ password (hash) │
│ nom             │
│ prenom          │
│ created_at      │
│ updated_at      │
└─────────────────┘

┌─────────────────┐
│    clients      │
├─────────────────┤
│ id (PK)         │────┐
│ nom             │    │
│ prenom          │    │
│ entreprise      │    │
│ email           │    │
│ telephone       │    │
│ adresse         │    │
│ ville           │    │
│ code_postal     │    │
│ notes           │    │
│ created_at      │    │
│ updated_at      │    │
└─────────────────┘    │
                       │
      ┌────────────────┼────────────────┬────────────────┐
      │                │                │                │
      │                │                │                │
┌─────▼───────┐  ┌─────▼───────┐  ┌────▼────────┐  ┌───▼─────────┐
│    devis    │  │   projets   │  │  factures   │  │             │
├─────────────┤  ├─────────────┤  ├─────────────┤  │             │
│ id (PK)     │  │ id (PK)     │  │ id (PK)     │  │             │
│ client_id   │  │ client_id   │  │ client_id   │  │             │
│ numero_devis│  │ devis_id    │  │ projet_id   │  │             │
│ titre       │  │ titre       │  │ numero_fact │  │             │
│ description │  │ description │  │ montant_ht  │  │             │
│ montant_ht  │  │ type_projet │  │ montant_ttc │  │             │
│ montant_ttc │  │ statut      │  │ tva         │  │             │
│ tva         │  │ montant     │  │ statut      │  │             │
│ statut      │  │ date_debut  │  │ date_emiss  │  │             │
│ date_*      │  │ date_fin    │  │ date_echea  │  │             │
│ notes       │  │ notes       │  │ date_paiem  │  │             │
│ created_at  │  │ created_at  │  │ notes       │  │             │
│ updated_at  │  │ updated_at  │  │ created_at  │  │             │
└─────┬───────┘  └─────────────┘  │ updated_at  │  │             │
      │                            └─────────────┘  │             │
      │                                             │             │
┌─────▼───────────┐                                 │             │
│  lignes_devis   │                                 │             │
├─────────────────┤                                 │             │
│ id (PK)         │                                 │             │
│ devis_id (FK)   │                                 │             │
│ designation     │                                 │             │
│ quantite        │                                 │             │
│ prix_unitaire   │                                 │             │
│ montant_total   │                                 │             │
│ ordre           │                                 │             │
│ created_at      │                                 │             │
└─────────────────┘                                 │             │
```

## 🔐 Flux d'authentification

```
1. Utilisateur accède à /admin/login.html
   ↓
2. Saisie email + mot de passe
   ↓
3. POST /.netlify/functions/auth-login
   ↓
4. Vérification dans la table admins (bcrypt)
   ↓
5. Si OK : Génération JWT (expire 7 jours)
   ↓
6. Token stocké dans localStorage
   ↓
7. Redirection vers /admin/dashboard.html
   ↓
8. À chaque requête API : Header Authorization: Bearer {token}
   ↓
9. Les fonctions vérifient le token JWT
   ↓
10. Si invalide : 401 Unauthorized → Redirect login
```

## 🔄 Flux de données (exemple : Gestion des clients)

```
Interface Admin (clients.html)
         ↓
    fetch() API
         ↓
Authorization: Bearer {jwt_token}
         ↓
/.netlify/functions/clients
         ↓
Vérification JWT
         ↓
    [Si OK]
         ↓
getDb() → Drizzle ORM
         ↓
Requête SQL → Neon PostgreSQL
         ↓
Résultat JSON
         ↓
Interface Admin (affichage)
```

## 🛠️ Stack technologique

### Frontend
- **HTML5** : Structure sémantique
- **CSS3** : Design moderne et responsive
- **JavaScript Vanilla** : Pas de framework, léger et rapide
- **ES Modules** : Import/export natifs

### Backend
- **Netlify Functions** : Serverless Node.js
- **Node.js 20.12.2+** : Environnement d'exécution
- **Drizzle ORM** : ORM TypeScript-first pour PostgreSQL

### Base de données
- **Neon PostgreSQL** : Base de données serverless
- **Connection pooling** : Géré automatiquement par Neon

### Authentification & Sécurité
- **JWT (jsonwebtoken)** : Tokens d'authentification
- **bcryptjs** : Hashage des mots de passe (10 rounds)
- **HTTPS** : Forcé par Netlify
- **CORS** : Configuré sur les fonctions

### DevOps
- **Git** : Contrôle de version
- **Netlify** : Hébergement + CI/CD automatique
- **npm** : Gestion des dépendances

## 🔌 Endpoints API

### Authentification
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| POST | `/auth-login` | Connexion admin | Non |
| GET | `/auth-verify` | Vérifier token | Oui (Bearer) |

### Clients
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/clients` | Liste des clients | Oui |
| POST | `/clients` | Créer un client | Oui |
| PUT | `/clients` | Modifier un client | Oui |
| DELETE | `/clients` | Supprimer un client | Oui |

### Devis, Projets, Factures
Même structure CRUD pour :
- `/devis`
- `/projets`
- `/factures`

### Utilitaires
| Méthode | Endpoint | Description | Auth requise |
|---------|----------|-------------|--------------|
| GET | `/health-check` | État de la BDD | Non |
| POST | `/setup-db` | Init BDD (production) | Oui (Secret) |

## 🔒 Sécurité

### Niveau 1 : SEO
- `robots.txt` : Disallow /admin/
- Meta robots : noindex, nofollow sur toutes les pages admin

### Niveau 2 : Authentification
- JWT avec expiration (7 jours)
- Vérification du token sur chaque requête API
- Déconnexion automatique si token invalide

### Niveau 3 : Mots de passe
- Hashage bcrypt (10 rounds)
- Pas de stockage en clair
- Validation côté serveur

### Niveau 4 : Variables sensibles
- JWT_SECRET stocké uniquement sur Netlify
- DATABASE_URL jamais exposé côté client
- .gitignore pour .env local

### Recommandations supplémentaires
1. **Activer Netlify Identity** pour une couche supplémentaire
2. **Limiter les tentatives de connexion** (rate limiting)
3. **Logs d'audit** pour tracer les actions admin
4. **Backup régulier** de la base de données
5. **2FA** sur le compte Netlify

## 📊 Performance

### Frontend
- CSS et JS minifiés en production (Netlify)
- Pas de framework lourd (tout en vanilla)
- Chargement asynchrone des données

### Backend
- Fonctions serverless (cold start ~100-300ms)
- Connection pooling Neon (réutilisation des connexions)
- Requêtes SQL optimisées avec Drizzle

### Base de données
- Indexes automatiques sur les clés primaires et étrangères
- Requêtes avec LEFT JOIN pour éviter le N+1

## 🔄 Évolutions possibles

### Court terme
- [ ] Formulaires complets pour devis/projets/factures
- [ ] Génération PDF des devis et factures
- [ ] Upload de fichiers (logos clients)
- [ ] Recherche et filtres avancés

### Moyen terme
- [ ] Notifications par email (SendGrid/Resend)
- [ ] Tableau de bord avec graphiques (Chart.js)
- [ ] Export Excel/CSV
- [ ] Historique des modifications

### Long terme
- [ ] Multi-utilisateurs avec rôles
- [ ] Espace client (portail)
- [ ] Intégration comptable
- [ ] Application mobile (PWA)

---

📚 Cette architecture est évolutive et peut facilement s'adapter à vos besoins futurs !

