# 🚀 Guide d'installation complet - Étape par étape

## ✅ Ce que vous devez savoir

- ✅ Votre site reste 100% HTML/CSS/JS pour les visiteurs
- ✅ Node.js ne sert QUE pour le développement local
- ✅ Sur Netlify, tout est géré automatiquement
- ✅ Vous n'avez RIEN à configurer côté serveur

---

## 📋 Prérequis (vérifications)

### 1. Vérifier si Node.js est installé

Ouvrez un terminal et tapez :
```bash
node --version
```

**Si ça affiche une version (ex: v20.x.x)** → ✅ Passez à l'étape suivante

**Si ça affiche "command not found"** → Installez Node.js :
1. Allez sur https://nodejs.org/
2. Téléchargez la version **LTS** (Long Term Support)
3. Installez-le
4. Redémarrez votre terminal
5. Retestez `node --version`

### 2. Vérifier Git

```bash
git --version
```

Si ce n'est pas installé, téléchargez depuis https://git-scm.com/

### 3. Compte Netlify

Vous devez avoir un compte sur https://netlify.com
Votre site doit déjà être déployé sur Netlify.

---

## 🎯 ÉTAPE 1 : Installation des dépendances (5 minutes)

### 1.1 - Ouvrir le terminal dans votre projet

**Sur Mac :**
```bash
cd /Users/baptistegrincourtdeflogny/Desktop/siteMamanAjour/creationedition
```

**Vérifiez que vous êtes au bon endroit :**
```bash
ls
```
Vous devriez voir : `index.html`, `package.json`, `admin/`, etc.

### 1.2 - Installer les dépendances

```bash
npm install
```

**Ce qui va se passer :**
- npm va télécharger tous les packages nécessaires
- Cela va créer un dossier `node_modules/`
- Durée : 1-2 minutes

**✅ Succès si vous voyez :** "added XXX packages"

**❌ Erreur possible :** "npm not found"
→ Installez Node.js (voir prérequis)

---

## 🎯 ÉTAPE 2 : Configuration de Neon sur Netlify (5 minutes)

### 2.1 - Aller sur Netlify

1. Ouvrez votre navigateur
2. Allez sur https://app.netlify.com
3. Connectez-vous
4. Cliquez sur votre site

### 2.2 - Ajouter l'intégration Neon

1. Dans le menu de gauche, cherchez **"Integrations"**
2. Cliquez sur **"Search integrations"** ou **"Browse integrations"**
3. Cherchez **"Neon"** ou **"Neon Postgres"**
4. Cliquez sur **"Add integration"** ou **"Install"**

### 2.3 - Autoriser Neon

1. Une popup s'ouvre pour autoriser Neon
2. Cliquez sur **"Authorize"** ou **"Continue"**
3. Si on vous demande de vous connecter à Neon :
   - Créez un compte sur https://neon.tech (gratuit)
   - Ou connectez-vous si vous en avez déjà un

### 2.4 - Créer la base de données

1. Dans Netlify, retournez sur votre site
2. Allez dans **"Integrations"**
3. Cliquez sur **"Neon"**
4. Cliquez sur **"Create new database"**
5. Donnez-lui un nom (ex: `crm-creation-edition`)
6. Cliquez sur **"Create"**

### 2.5 - ⚠️ IMPORTANT : Revendiquer la base de données

**C'EST CRUCIAL !** Sinon votre base sera supprimée après 7 jours.

1. Dans Netlify > Integrations > Neon
2. Vous devriez voir un bouton **"Claim database"**
3. Cliquez dessus
4. Suivez les instructions

**✅ Succès si :** Vous voyez "Database claimed successfully"

### 2.6 - Vérifier la variable DATABASE_URL

1. Dans Netlify, allez dans **"Site settings"**
2. Dans le menu de gauche, cliquez sur **"Environment variables"**
3. Vérifiez qu'il existe une variable **`DATABASE_URL`** ou **`NEON_DATABASE_URL`**

**✅ Si elle existe** → Parfait, passez à l'étape suivante
**❌ Si elle n'existe pas** → Retournez à l'étape 2.4

---

## 🎯 ÉTAPE 3 : Générer JWT_SECRET (2 minutes)

### 3.1 - Générer une clé sécurisée

Dans votre terminal, tapez :

```bash
openssl rand -base64 32
```

**Vous allez obtenir quelque chose comme :**
```
8h7Kj9Lm2Nq5Rt6Uv3Wx4Yz1Ab8Cd9Ef0Gh=
```

**⚠️ Copiez cette valeur, vous en aurez besoin juste après !**

### 3.2 - Ajouter JWT_SECRET dans Netlify

1. Dans Netlify, allez dans **"Site settings"**
2. Cliquez sur **"Environment variables"**
3. Cliquez sur **"Add a variable"** ou **"Add"**
4. Remplissez :
   - **Key** : `JWT_SECRET`
   - **Value** : Collez la valeur générée à l'étape 3.1
5. Cliquez sur **"Create variable"** ou **"Save"**

**✅ Succès :** Vous voyez `JWT_SECRET` dans la liste des variables

---

## 🎯 ÉTAPE 4 : Pousser le code sur Git (3 minutes)

### 4.1 - Vérifier l'état de Git

Dans votre terminal :

```bash
git status
```

Vous devriez voir beaucoup de fichiers en rouge (nouveaux fichiers non suivis).

### 4.2 - Ajouter tous les fichiers

```bash
git add .
```

**Le point (.) signifie "tout ajouter"**

### 4.3 - Créer un commit

```bash
git commit -m "Ajout du CRM complet avec Neon PostgreSQL"
```

**✅ Succès :** Vous voyez "XX files changed"

### 4.4 - Pousser sur votre dépôt

```bash
git push origin main
```

**OU** (si votre branche s'appelle master) :
```bash
git push origin master
```

**Ce qui va se passer :**
- Vos fichiers vont être envoyés sur GitHub/GitLab
- Netlify va détecter le push automatiquement
- Netlify va commencer un déploiement

### 4.5 - Vérifier le déploiement

1. Retournez sur https://app.netlify.com
2. Cliquez sur votre site
3. Cliquez sur **"Deploys"** dans le menu
4. Vous devriez voir un déploiement **"In progress"** (jaune)
5. Attendez qu'il devienne **"Published"** (vert)

**⏱️ Durée : 2-5 minutes**

**✅ Succès :** Le déploiement est vert avec "Published"

**❌ Si erreur :** 
- Cliquez sur le déploiement
- Regardez les logs
- Cherchez l'erreur
- Contactez-moi avec l'erreur

---

## 🎯 ÉTAPE 5 : Initialiser la base de données (5 minutes)

Nous devons créer les tables dans la base de données Neon.

### Option A : Via une fonction Netlify (Recommandé)

#### 5A.1 - Ajouter SETUP_SECRET temporairement

1. Dans Netlify > Site settings > Environment variables
2. Cliquez sur **"Add a variable"**
3. Remplissez :
   - **Key** : `SETUP_SECRET`
   - **Value** : `MonSecret123!` (choisissez ce que vous voulez)
4. Cliquez sur **"Create variable"**

#### 5A.2 - Redéployer

1. Dans Netlify > Deploys
2. Cliquez sur **"Trigger deploy"**
3. Cliquez sur **"Deploy site"**
4. Attendez que ce soit vert

#### 5A.3 - Appeler la fonction d'initialisation

Dans votre terminal :

```bash
curl -X POST https://VOTRE-SITE.netlify.app/.netlify/functions/setup-db \
  -H "Authorization: Bearer MonSecret123!"
```

**⚠️ Remplacez :**
- `VOTRE-SITE.netlify.app` par l'URL de votre site
- `MonSecret123!` par le SETUP_SECRET que vous avez choisi

**✅ Succès si vous voyez :**
```json
{
  "success": true,
  "message": "Base de données initialisée avec succès",
  "admin": {
    "email": "admin@creation-edition.fr",
    "defaultPassword": "Admin@2025"
  }
}
```

#### 5A.4 - ⚠️ SUPPRIMER SETUP_SECRET

**IMPORTANT pour la sécurité !**

1. Retournez dans Netlify > Environment variables
2. Trouvez `SETUP_SECRET`
3. Cliquez sur les 3 points > **"Delete"**

### Option B : En local (Si Option A ne marche pas)

#### 5B.1 - Créer un fichier .env local

Dans le dossier de votre projet, créez un fichier `.env` :

```bash
nano .env
```

Collez dedans :
```
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require
JWT_SECRET=votre_jwt_secret_de_netlify
```

**⚠️ Remplacez les valeurs par les vraies depuis Netlify !**

Pour récupérer DATABASE_URL :
1. Netlify > Site settings > Environment variables
2. Copiez la valeur de `DATABASE_URL` ou `NEON_DATABASE_URL`

Sauvegardez avec : `Ctrl+O` puis `Enter`, puis `Ctrl+X`

#### 5B.2 - Générer les migrations

```bash
npm run db:generate
```

#### 5B.3 - Appliquer les migrations

```bash
npm run db:migrate
```

#### 5B.4 - Créer le compte admin

```bash
npm run db:init
```

**✅ Succès si vous voyez :**
```
✅ Compte admin créé avec succès!
📧 Email: admin@creation-edition.fr
🔑 Mot de passe: Admin@2025
```

---

## 🎯 ÉTAPE 6 : Première connexion ! (2 minutes)

### 6.1 - Ouvrir la page de connexion

Dans votre navigateur, allez sur :

```
https://VOTRE-SITE.netlify.app/admin/login.html
```

**⚠️ Remplacez `VOTRE-SITE.netlify.app` par votre vraie URL !**

### 6.2 - Se connecter

Entrez :
- **Email** : `admin@creation-edition.fr`
- **Mot de passe** : `Admin@2025`

Cliquez sur **"Se connecter"**

### 6.3 - Vérifier que ça marche

**✅ Si ça marche :** Vous êtes redirigé vers le Dashboard
**❌ Si erreur :** Notez le message d'erreur et passez au dépannage

---

## 🎯 ÉTAPE 7 : Tester le CRM (5 minutes)

### 7.1 - Ajouter un client test

1. Dans le menu de gauche, cliquez sur **"Clients"**
2. Cliquez sur **"+ Nouveau client"**
3. Remplissez :
   - **Nom** : Test
   - **Prénom** : Client
   - **Email** : test@example.com
   - **Téléphone** : 0612345678
4. Cliquez sur **"Enregistrer"**

**✅ Succès :** Le client apparaît dans la liste

### 7.2 - Vérifier le dashboard

1. Cliquez sur **"Dashboard"** dans le menu
2. Vous devriez voir :
   - **Total Clients** : 1
   - Le client que vous venez d'ajouter dans "Derniers devis"

**✅ Si tout s'affiche correctement → BRAVO ! 🎉**

---

## 🎯 ÉTAPE 8 : Sécuriser (5 minutes)

### 8.1 - Changer le mot de passe admin

**Pour le moment, cette fonctionnalité n'est pas dans l'interface.**

Vous pouvez :

**Option 1 : Utiliser Drizzle Studio (en local)**
```bash
npm run db:studio
```
Puis modifiez le mot de passe dans la table `admins`

**Option 2 : Via SQL directement dans Neon**
1. Allez sur https://console.neon.tech
2. Sélectionnez votre projet
3. Cliquez sur **"SQL Editor"**
4. Exécutez :
```sql
-- Générez un hash bcrypt sur https://bcrypt-generator.com/
-- Avec votre nouveau mot de passe
UPDATE admins 
SET password = 'HASH_BCRYPT_ICI' 
WHERE email = 'admin@creation-edition.fr';
```

### 8.2 - Vérifier les variables Netlify

Assurez-vous que :
- ✅ `DATABASE_URL` existe
- ✅ `JWT_SECRET` existe
- ❌ `SETUP_SECRET` n'existe PLUS (supprimé à l'étape 5A.4)

---

## ✅ CHECKLIST FINALE

Cochez ce qui fonctionne :

- [ ] Node.js installé localement
- [ ] Dépendances installées (`npm install`)
- [ ] Neon intégré dans Netlify
- [ ] Base de données créée et revendiquée (claimed)
- [ ] `JWT_SECRET` configuré dans Netlify
- [ ] Code poussé sur Git
- [ ] Déploiement Netlify réussi (vert)
- [ ] Base de données initialisée (tables créées)
- [ ] Compte admin créé
- [ ] Connexion sur `/admin/login.html` réussie
- [ ] Client test ajouté avec succès
- [ ] Dashboard affiche les stats
- [ ] `SETUP_SECRET` supprimé

**Si tout est coché → FÉLICITATIONS ! 🎉**

---

## 🆘 Dépannage rapide

### Erreur : "Cannot connect to database"

**Solution :**
1. Vérifiez que `DATABASE_URL` existe dans Netlify
2. Vérifiez que la base Neon est bien créée
3. Testez : https://votre-site.netlify.app/.netlify/functions/health-check

### Erreur : "Unauthorized" à la connexion

**Solution :**
1. Vérifiez que `JWT_SECRET` existe dans Netlify
2. Videz le cache du navigateur (Cmd/Ctrl + Shift + R)
3. Ouvrez la console (F12) et tapez : `localStorage.clear()`

### Erreur : "Table does not exist"

**Solution :**
Les migrations ne sont pas appliquées. Refaites l'étape 5.

### Les fonctions Netlify ne répondent pas

**Solution :**
1. Attendez 2-3 minutes (cold start)
2. Vérifiez dans Netlify > Functions
3. Cliquez sur une fonction et regardez les logs

### npm install échoue

**Solution :**
1. Vérifiez votre connexion internet
2. Essayez : `npm cache clean --force`
3. Réessayez : `npm install`

---

## 🎯 Commandes de maintenance

### Voir les logs en temps réel (en local)

```bash
npm run dev
```
Puis ouvrez http://localhost:8888

### Visualiser la base de données

```bash
npm run db:studio
```

### Réinitialiser le compte admin

```bash
npm run db:init
```

---

## 📞 Prochaines étapes

Maintenant que tout fonctionne :

1. **Ajoutez vos vrais clients**
2. **Explorez les différentes pages**
3. **Consultez la documentation complète** dans `README-CRM.md`
4. **Personnalisez l'interface** si nécessaire

---

## 🎊 Félicitations !

Votre CRM est maintenant **100% opérationnel** !

Vous pouvez gérer :
- 👥 Vos clients
- 📝 Vos devis
- 🚀 Vos projets
- 💰 Vos factures

Le tout de manière sécurisée et professionnelle ! 🚀

---

*Si vous avez des questions à n'importe quelle étape, n'hésitez pas !*

