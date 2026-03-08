# 🎯 Premiers pas avec votre CRM

## ✅ Checklist de démarrage

Suivez ces étapes dans l'ordre pour mettre en place votre CRM.

### 📋 Avant de commencer

- [ ] Vous avez un compte Netlify actif
- [ ] Votre site est déjà déployé sur Netlify
- [ ] Vous avez accès au dashboard Netlify de votre site

---

## 🚀 Installation (15-20 minutes)

### Étape 1 : Installer les dépendances localement

Ouvrez un terminal dans le dossier du projet et exécutez :

```bash
npm install
```

✅ Attendez que toutes les dépendances soient installées.

---

### Étape 2 : Pousser le code sur Git

```bash
git add .
git commit -m "Ajout du CRM avec Neon PostgreSQL"
git push origin main
```

✅ Le code est maintenant sur votre dépôt Git et Netlify va démarrer un déploiement.

---

### Étape 3 : Configurer Neon sur Netlify

1. Allez sur https://app.netlify.com
2. Cliquez sur votre site
3. Dans le menu de gauche, cliquez sur **Integrations**
4. Cherchez **Neon Postgres** (ou **Neon Database**)
5. Cliquez sur **Add integration**
6. Suivez le processus d'autorisation avec Neon
7. Cliquez sur **Create new database**
8. ⚠️ **IMPORTANT** : Une fois créée, cliquez sur **Claim database** pour la rendre permanente

✅ Votre base de données Neon est maintenant liée à votre site Netlify !

---

### Étape 4 : Configurer JWT_SECRET

1. Dans votre dashboard Netlify, allez dans **Site settings**
2. Cliquez sur **Environment variables** (dans le menu de gauche)
3. Cliquez sur **Add a variable**
4. Sur votre ordinateur, ouvrez un terminal et exécutez :
   ```bash
   openssl rand -base64 32
   ```
5. Copiez le résultat (une longue chaîne de caractères)
6. Dans Netlify :
   - **Key** : `JWT_SECRET`
   - **Value** : Collez la chaîne générée
7. Cliquez sur **Create variable**

✅ Votre secret JWT est configuré !

---

### Étape 5 : Redéployer le site

1. Dans Netlify, allez dans **Deploys**
2. Cliquez sur **Trigger deploy** > **Deploy site**

✅ Attendez que le déploiement soit terminé (icône verte).

---

### Étape 6 : Initialiser la base de données

Pour cette étape, vous avez deux options :

#### Option A : Via une fonction Netlify (Plus simple)

1. Ajoutez une variable d'environnement temporaire dans Netlify :
   - **Key** : `SETUP_SECRET`
   - **Value** : Choisissez un mot de passe temporaire (ex: `MonSecret123!`)

2. Dans votre terminal local, exécutez :
   ```bash
   curl -X POST https://votre-site.netlify.app/.netlify/functions/setup-db \
     -H "Authorization: Bearer MonSecret123!"
   ```
   *(Remplacez `votre-site.netlify.app` et `MonSecret123!` par vos valeurs)*

3. ⚠️ **Après l'initialisation, supprimez la variable `SETUP_SECRET` de Netlify**

#### Option B : En local avec Netlify CLI

```bash
# Installer Netlify CLI si ce n'est pas déjà fait
npm install -g netlify-cli

# Se connecter
netlify login

# Lier votre projet
netlify link

# Générer les migrations
npm run db:generate

# Exécuter dans le contexte Netlify
netlify dev
# Dans un autre terminal :
npm run db:migrate
npm run db:init
```

✅ La base de données est initialisée avec un compte admin par défaut !

---

### Étape 7 : Première connexion

1. Ouvrez votre navigateur
2. Allez sur : `https://votre-site.netlify.app/admin/login.html`
3. Connectez-vous avec :
   - **Email** : `admin@creation-edition.fr`
   - **Mot de passe** : `Admin@2025`

✅ Vous êtes maintenant connecté au CRM !

---

### Étape 8 : Changer le mot de passe (IMPORTANT !)

Pour le moment, l'interface ne permet pas de changer le mot de passe directement.

**Solution temporaire** : Utilisez Drizzle Studio en local

```bash
npm run db:studio
```

Puis modifiez le mot de passe dans la table `admins`.

**Ou attendez** que la fonctionnalité soit ajoutée dans une prochaine version.

---

## 🎉 C'est fait ! Utilisons le CRM

### Ajouter votre premier client

1. Dans le menu de gauche, cliquez sur **Clients**
2. Cliquez sur **+ Nouveau client**
3. Remplissez les informations :
   - Nom (requis)
   - Prénom
   - Entreprise
   - Email (requis)
   - Téléphone
   - Adresse complète
   - Notes (informations utiles)
4. Cliquez sur **Enregistrer**

✅ Votre premier client est créé !

---

### Créer un devis (À développer)

La fonctionnalité complète de création de devis sera ajoutée prochainement.
Pour le moment, vous pouvez :
- Visualiser les devis existants
- Voir leur statut
- Consulter les montants

---

### Naviguer dans le dashboard

Le **Dashboard** vous donne une vue d'ensemble :
- 📊 Nombre total de clients
- 📝 Devis en cours (brouillon ou envoyés)
- 🚀 Projets actifs
- 💰 Factures impayées

---

## 🔧 Vérifications et tests

### Tester la connexion à la base de données

Allez sur : `https://votre-site.netlify.app/.netlify/functions/health-check`

Vous devriez voir :
```json
{
  "success": true,
  "status": "healthy",
  "database": "connected",
  "timestamp": "2025-10-04T..."
}
```

✅ Si vous voyez ce message, tout fonctionne !

---

### Vérifier les fonctions Netlify

1. Dans le dashboard Netlify, allez dans **Functions**
2. Vous devriez voir toutes ces fonctions :
   - `auth-login`
   - `auth-verify`
   - `clients`
   - `devis`
   - `projets`
   - `factures`
   - `health-check`
   - `setup-db`

✅ Si elles sont toutes listées, c'est bon !

---

### Consulter les logs en cas de problème

1. Dans Netlify, allez dans **Functions**
2. Cliquez sur une fonction (ex: `auth-login`)
3. Consultez les **Recent logs** pour voir les erreurs

---

## 🆘 Problèmes courants

### ❌ "Cannot connect to database"

**Solution** :
1. Vérifiez que Neon est bien intégré (Integrations dans Netlify)
2. Vérifiez que `DATABASE_URL` existe dans les variables d'environnement
3. Assurez-vous d'avoir **revendiqué** (claimed) la base de données

---

### ❌ "Unauthorized" à la connexion

**Solution** :
1. Vérifiez que `JWT_SECRET` est configuré dans Netlify
2. Videz le cache de votre navigateur (Cmd/Ctrl + Shift + R)
3. Videz le localStorage : F12 > Console > `localStorage.clear()`

---

### ❌ "Table does not exist"

**Solution** :
Vous devez exécuter les migrations de la base de données.
Suivez l'Étape 6 (Option A ou B) ci-dessus.

---

### ❌ Les fonctions ne répondent pas

**Solution** :
1. Attendez 2-3 minutes après le déploiement (cold start)
2. Consultez les logs dans **Functions** sur Netlify
3. Vérifiez que Node.js 20.12.2+ est utilisé (dans `netlify.toml`)

---

## 📚 Prochaines étapes

Une fois que tout fonctionne :

1. **Ajoutez vos clients réels**
2. **Explorez les différentes pages** (Clients, Devis, Projets, Factures)
3. **Consultez la documentation complète** dans `README-CRM.md`
4. **Personnalisez l'interface** si nécessaire
5. **Configurez les sauvegardes** de votre base de données Neon

---

## 🎊 Félicitations !

Votre CRM est maintenant opérationnel ! 

Vous pouvez gérer vos clients, suivre vos devis et projets, tout cela de manière sécurisée et professionnelle.

---

### 📞 Besoin d'aide ?

- **Documentation complète** : `README-CRM.md`
- **Architecture** : `ARCHITECTURE-CRM.md`
- **Installation détaillée** : `INSTALLATION-CRM.md`

---

**Bon travail ! 🚀**

