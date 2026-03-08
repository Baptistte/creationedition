# CRM Création & Édition

## 🎯 Vue d'ensemble

Ce CRM complet intègre une base de données Neon PostgreSQL sur Netlify pour gérer vos clients, devis, projets et factures.

## 🚀 Installation et Configuration

### 1. Installation des dépendances

```bash
npm install
```

### 2. Configuration de la base de données Neon

#### Option A : Via l'interface Netlify (Recommandé)
1. Connectez-vous à votre dashboard Netlify
2. Allez dans **Extensions** > **Neon database**
3. Cliquez sur **Add database**
4. Suivez les instructions pour lier votre compte Neon
5. **Important** : Revendiquez votre base de données pour qu'elle fonctionne au-delà de 7 jours

#### Option B : Via Netlify CLI
```bash
npx netlify db init
```

### 3. Configuration des variables d'environnement

Dans votre dashboard Netlify, allez dans **Site settings** > **Environment variables** et ajoutez :

- `DATABASE_URL` : Fournie automatiquement par Netlify/Neon
- `JWT_SECRET` : Générez une clé sécurisée :
  ```bash
  openssl rand -base64 32
  ```

### 4. Génération et migration du schéma de base de données

```bash
# Générer les migrations
npm run db:generate

# Appliquer les migrations
npm run db:migrate
```

### 5. Initialiser le compte admin

```bash
npm run db:init
```

Cette commande crée un compte admin par défaut :
- **Email** : admin@creation-edition.fr
- **Mot de passe** : Admin@2025

⚠️ **IMPORTANT** : Changez ce mot de passe dès votre première connexion !

## 📊 Structure de la base de données

### Tables principales

#### `admins`
Stocke les comptes administrateurs avec authentification sécurisée (bcrypt).

#### `clients`
Informations complètes sur vos clients (nom, entreprise, contact, adresse, notes).

#### `devis`
Gestion des devis avec statuts (brouillon, envoyé, accepté, refusé, expiré).

#### `lignes_devis`
Détails des lignes de chaque devis (désignation, quantité, prix).

#### `projets`
Suivi des projets en cours (broderie, floquage, print, logo, site web).

#### `factures`
Gestion des factures avec statuts (impayée, payée, annulée).

## 🔐 Sécurité

### Authentification
- JWT (JSON Web Token) avec expiration de 7 jours
- Mots de passe hashés avec bcrypt (10 rounds)
- Vérification automatique du token sur toutes les requêtes

### Pages non référencées
Toutes les pages admin incluent `<meta name="robots" content="noindex, nofollow">` pour éviter l'indexation par les moteurs de recherche.

### Recommandations supplémentaires
1. **Mettre à jour le robots.txt** pour bloquer l'accès au répertoire /admin/ :
   ```
   User-agent: *
   Disallow: /admin/
   ```

2. **Utiliser Netlify Identity** (optionnel) pour une couche de sécurité supplémentaire

3. **Activer l'authentification à deux facteurs** pour votre compte Netlify

## 🎨 Interface Admin

### Accès
Connectez-vous à : `https://votre-site.netlify.app/admin/login.html`

### Pages disponibles

#### 📊 Dashboard
Vue d'ensemble avec statistiques :
- Nombre total de clients
- Devis en cours
- Projets actifs
- Factures impayées
- Derniers devis créés

#### 👥 Clients
- Liste complète des clients
- Ajout/Modification/Suppression
- Informations détaillées (entreprise, contact, adresse)

#### 📝 Devis
- Visualisation de tous les devis
- Statuts en temps réel
- Montants HT et TTC

#### 🚀 Projets
- Suivi des projets en cours
- Types : broderie, floquage, print, logo, site web
- Dates de début et fin

#### 💰 Factures
- Liste des factures
- Suivi des paiements
- Dates d'échéance

## 🛠️ Développement local

### Lancer le serveur de développement Netlify
```bash
npm run dev
```

Le site sera accessible sur `http://localhost:8888`

### Visualiser le schéma de base de données
```bash
npm run db:studio
```

## 📝 API Endpoints

Toutes les fonctions sont dans `netlify/functions/` :

### Authentification
- `POST /.netlify/functions/auth-login` - Connexion admin
- `GET /.netlify/functions/auth-verify` - Vérifier le token

### Clients
- `GET /.netlify/functions/clients` - Liste des clients
- `POST /.netlify/functions/clients` - Créer un client
- `PUT /.netlify/functions/clients` - Modifier un client
- `DELETE /.netlify/functions/clients` - Supprimer un client

### Devis, Projets, Factures
Même structure CRUD pour :
- `/.netlify/functions/devis`
- `/.netlify/functions/projets`
- `/.netlify/functions/factures`

## 🔄 Déploiement

Le déploiement est automatique sur Netlify. À chaque push sur votre branche principale :
1. Les fonctions serverless sont déployées
2. Le site statique est publié
3. Les variables d'environnement sont appliquées

## 📚 Technologies utilisées

- **Backend** : Netlify Functions (Node.js)
- **Base de données** : Neon PostgreSQL
- **ORM** : Drizzle ORM
- **Authentification** : JWT + bcrypt
- **Frontend** : HTML/CSS/JavaScript (Vanilla)

## 🆘 Dépannage

### La base de données ne se connecte pas
1. Vérifiez que `DATABASE_URL` est bien configuré dans Netlify
2. Assurez-vous d'avoir revendiqué votre base de données Neon
3. Vérifiez les logs Netlify Functions

### Erreur 401 lors de l'authentification
1. Vérifiez que `JWT_SECRET` est configuré
2. Videz le localStorage du navigateur
3. Reconnectez-vous

### Les fonctions serverless ne répondent pas
1. Vérifiez les logs dans le dashboard Netlify
2. Assurez-vous que les dépendances sont installées
3. Vérifiez la configuration `netlify.toml`

## 📞 Support

Pour toute question ou problème, consultez :
- [Documentation Netlify Functions](https://docs.netlify.com/functions/overview/)
- [Documentation Neon](https://neon.tech/docs/introduction)
- [Documentation Drizzle ORM](https://orm.drizzle.team/docs/overview)

---

Développé avec ❤️ pour Création & Édition

