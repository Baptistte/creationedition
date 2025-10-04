# 🚀 Guide d'installation rapide du CRM

## Étapes à suivre sur Netlify

### 1️⃣ Installer les dépendances

Dans votre terminal local :

```bash
npm install
```

### 2️⃣ Pousser le code sur votre dépôt Git

```bash
git add .
git commit -m "Ajout du CRM avec base de données Neon"
git push origin main
```

### 3️⃣ Configurer la base de données Neon sur Netlify

1. Connectez-vous à votre [dashboard Netlify](https://app.netlify.com)
2. Sélectionnez votre site
3. Allez dans **Integrations** ou **Extensions**
4. Cherchez **Neon Postgres** et cliquez sur **Add integration**
5. Suivez les étapes pour autoriser Neon
6. Cliquez sur **Create new database** ou liez une base existante
7. **IMPORTANT** : Cliquez sur **Claim database** pour la rendre permanente (sinon elle sera supprimée après 7 jours)

### 4️⃣ Configurer les variables d'environnement

Dans votre dashboard Netlify :

1. Allez dans **Site settings** > **Environment variables**
2. Vérifiez que `DATABASE_URL` ou `NEON_DATABASE_URL` est présente (ajoutée automatiquement par Neon)
3. Ajoutez une nouvelle variable :
   - **Key** : `JWT_SECRET`
   - **Value** : Générez une clé sécurisée avec cette commande :
     ```bash
     openssl rand -base64 32
     ```
   - Copiez le résultat et collez-le comme valeur

### 5️⃣ Déployer le site

Le site se déploie automatiquement après votre push Git.

Si vous voulez forcer un nouveau déploiement :
- Dans Netlify, allez dans **Deploys**
- Cliquez sur **Trigger deploy** > **Clear cache and deploy site**

### 6️⃣ Générer les migrations de base de données

Option A - En local (si vous avez configuré les variables d'environnement localement) :

```bash
npm run db:generate
npm run db:migrate
npm run db:init
```

Option B - Via Netlify CLI :

```bash
# Se connecter à Netlify
npx netlify login

# Lier votre projet
npx netlify link

# Exécuter les commandes avec les variables d'environnement de Netlify
npx netlify env:import .env  # Si vous avez un fichier .env local
npx netlify dev  # Ou lancez les scripts dans l'environnement Netlify
```

### 7️⃣ Se connecter au CRM

1. Allez sur : `https://votre-site.netlify.app/admin/login.html`
2. Utilisez les identifiants par défaut :
   - **Email** : `admin@creation-edition.fr`
   - **Mot de passe** : `Admin@2025`

⚠️ **Changez immédiatement ce mot de passe !**

## ✅ Vérifications

- [ ] Le site se déploie sans erreur sur Netlify
- [ ] Les fonctions serverless sont actives (voir **Functions** dans Netlify)
- [ ] La base de données Neon est revendiquée (claimed)
- [ ] `JWT_SECRET` est configuré dans les variables d'environnement
- [ ] Vous pouvez vous connecter sur `/admin/login.html`
- [ ] Le dashboard affiche les statistiques
- [ ] Vous pouvez ajouter un client test

## 🔧 Commandes utiles

```bash
# Développement local avec Netlify Dev
npm run dev

# Visualiser la base de données
npm run db:studio

# Générer les migrations après modification du schéma
npm run db:generate

# Appliquer les migrations
npm run db:migrate

# Initialiser/réinitialiser le compte admin
npm run db:init
```

## 🆘 Problèmes courants

### "Cannot connect to database"
- Vérifiez que Neon est bien intégré dans Netlify
- Vérifiez que `DATABASE_URL` est présent dans les variables d'environnement
- Revendiquez votre base de données si ce n'est pas déjà fait

### "Unauthorized" lors de la connexion
- Vérifiez que `JWT_SECRET` est bien configuré
- Essayez de vider le cache du navigateur et localStorage
- Vérifiez les logs des fonctions Netlify

### Les fonctions ne répondent pas
- Vérifiez que Node.js version 20.12.2+ est utilisée
- Consultez les logs dans **Functions** sur Netlify
- Vérifiez que les dépendances sont bien installées

### Erreur "Table does not exist"
- Vous devez exécuter les migrations : `npm run db:migrate`
- Si en production, vous pouvez créer une fonction Netlify temporaire pour exécuter les migrations

## 📞 Besoin d'aide ?

Consultez le fichier `README-CRM.md` pour la documentation complète.

---

🎉 Votre CRM est maintenant opérationnel !

