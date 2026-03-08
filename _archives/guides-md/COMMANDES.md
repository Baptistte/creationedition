# 📋 Commandes utiles pour le CRM

## 🚀 Installation et démarrage

### Installation des dépendances
```bash
npm install
```

### Développement local avec Netlify Dev
```bash
npm run dev
```
➜ Le site sera accessible sur `http://localhost:8888`
➜ Les fonctions serverless fonctionneront localement

---

## 🗄️ Base de données

### Générer les migrations après modification du schéma
```bash
npm run db:generate
```
➜ Crée les fichiers de migration dans `/drizzle`
➜ À faire après chaque modification de `db/schema.js`

### Appliquer les migrations
```bash
npm run db:migrate
```
➜ Exécute les migrations sur la base de données
➜ Crée/modifie les tables selon le schéma

### Initialiser le compte admin par défaut
```bash
npm run db:init
```
➜ Crée un admin avec :
  - Email: admin@creation-edition.fr
  - Mot de passe: Admin@2025

### Visualiser la base de données (Drizzle Studio)
```bash
npm run db:studio
```
➜ Interface web pour explorer et modifier la BDD
➜ Accessible sur `https://local.drizzle.studio`

---

## 🔐 Sécurité

### Générer un JWT_SECRET sécurisé
```bash
openssl rand -base64 32
```
➜ Copier le résultat dans les variables d'environnement Netlify

### Tester la connexion avec un token
```bash
# Remplacez YOUR_TOKEN par votre vrai token JWT
curl -X GET https://votre-site.netlify.app/.netlify/functions/auth-verify \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🌐 Netlify CLI

### Installer Netlify CLI globalement
```bash
npm install -g netlify-cli
```

### Se connecter à Netlify
```bash
netlify login
```
➜ Ouvre le navigateur pour l'authentification

### Lier le projet local à un site Netlify
```bash
netlify link
```
➜ Sélectionnez votre site dans la liste

### Voir le statut du site
```bash
netlify status
```

### Déployer manuellement
```bash
netlify deploy --prod
```

### Voir les variables d'environnement
```bash
netlify env:list
```

### Importer des variables d'environnement depuis un fichier
```bash
netlify env:import .env
```

### Ouvrir le dashboard Netlify
```bash
netlify open
```

### Ouvrir l'admin du site
```bash
netlify open:admin
```

---

## 🔧 Fonctions serverless

### Tester une fonction en local
```bash
# Démarrez d'abord le serveur de dev
npm run dev

# Dans un autre terminal, testez la fonction
curl -X POST http://localhost:8888/.netlify/functions/auth-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@creation-edition.fr","password":"Admin@2025"}'
```

### Voir les logs des fonctions (production)
```bash
netlify functions:log auth-login
```

---

## 📡 API Testing

### Health check (vérifier que la BDD fonctionne)
```bash
curl https://votre-site.netlify.app/.netlify/functions/health-check
```

### Se connecter (obtenir un token)
```bash
curl -X POST https://votre-site.netlify.app/.netlify/functions/auth-login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@creation-edition.fr","password":"Admin@2025"}'
```

### Récupérer la liste des clients
```bash
curl -X GET https://votre-site.netlify.app/.netlify/functions/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Créer un client
```bash
curl -X POST https://votre-site.netlify.app/.netlify/functions/clients \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nom": "Dupont",
    "prenom": "Jean",
    "email": "jean.dupont@example.com",
    "telephone": "0612345678"
  }'
```

### Initialiser la BDD (première fois uniquement)
```bash
# Ajoutez d'abord SETUP_SECRET dans les variables Netlify
curl -X POST https://votre-site.netlify.app/.netlify/functions/setup-db \
  -H "Authorization: Bearer VOTRE_SETUP_SECRET"
```

---

## 🧹 Git et déploiement

### Commiter les changements
```bash
git add .
git commit -m "Description des modifications"
git push origin main
```
➜ Netlify détectera le push et déploiera automatiquement

### Voir l'historique Git
```bash
git log --oneline
```

### Annuler les dernières modifications (avant commit)
```bash
git restore .
```

### Créer une branche pour tester
```bash
git checkout -b test-nouvelle-feature
```

---

## 🐛 Débogage

### Voir les logs Netlify en temps réel
```bash
netlify watch
```

### Tester le build localement
```bash
netlify build
```

### Voir les erreurs de déploiement
Via le dashboard Netlify :
1. Aller dans **Deploys**
2. Cliquer sur le dernier déploiement
3. Consulter les **Deploy logs**

### Vider le cache et redéployer
Dans le dashboard Netlify :
**Deploys** > **Trigger deploy** > **Clear cache and deploy site**

---

## 📦 NPM et dépendances

### Mettre à jour les dépendances
```bash
npm update
```

### Vérifier les vulnérabilités
```bash
npm audit
```

### Corriger les vulnérabilités automatiquement
```bash
npm audit fix
```

### Installer une nouvelle dépendance
```bash
npm install nom-du-package
```

### Installer une dépendance de développement
```bash
npm install --save-dev nom-du-package
```

---

## 🔍 Utilitaires

### Trouver le port utilisé par un processus
```bash
# macOS/Linux
lsof -ti:8888 | xargs kill -9

# Windows (PowerShell)
Get-Process -Id (Get-NetTCPConnection -LocalPort 8888).OwningProcess | Stop-Process
```

### Nettoyer node_modules et réinstaller
```bash
rm -rf node_modules package-lock.json
npm install
```

### Vider le cache npm
```bash
npm cache clean --force
```

---

## 🗂️ Fichiers importants

| Fichier | Description |
|---------|-------------|
| `package.json` | Dépendances et scripts npm |
| `netlify.toml` | Configuration Netlify |
| `drizzle.config.js` | Configuration Drizzle ORM |
| `db/schema.js` | Schéma de la base de données |
| `db/connection.js` | Connexion à Neon |
| `.gitignore` | Fichiers ignorés par Git |
| `env.example` | Template variables d'environnement |

---

## 📚 Documentation

| Fichier | Contenu |
|---------|---------|
| `README-CRM.md` | Documentation complète du CRM |
| `INSTALLATION-CRM.md` | Guide d'installation étape par étape |
| `ARCHITECTURE-CRM.md` | Architecture technique détaillée |
| `PREMIERS-PAS.md` | Guide de démarrage rapide |
| `COMMANDES.md` | Ce fichier (commandes utiles) |

---

## 🎯 Workflow recommandé

### Développement d'une nouvelle fonctionnalité

1. **Créer une branche**
   ```bash
   git checkout -b feature/nouvelle-fonctionnalite
   ```

2. **Développer en local**
   ```bash
   npm run dev
   ```

3. **Tester les modifications**
   - Tester dans le navigateur
   - Vérifier les logs
   - Tester les APIs avec curl

4. **Commiter**
   ```bash
   git add .
   git commit -m "Ajout de [fonctionnalité]"
   ```

5. **Merger dans main**
   ```bash
   git checkout main
   git merge feature/nouvelle-fonctionnalite
   git push origin main
   ```

6. **Vérifier le déploiement**
   - Attendre le build Netlify
   - Tester en production

---

## ⚡ Raccourcis pratiques

```bash
# Tout en un : installation + migration + init
npm install && npm run db:generate && npm run db:migrate && npm run db:init

# Redémarrage complet
rm -rf node_modules .netlify && npm install && npm run dev

# Ouvrir rapidement le CRM
open https://votre-site.netlify.app/admin/login.html
# Ou sur macOS
open http://localhost:8888/admin/login.html
```

---

## 💡 Astuces

### Créer un alias pour les commandes fréquentes (bash/zsh)

Ajoutez dans `~/.zshrc` ou `~/.bashrc` :

```bash
alias crm-dev="cd ~/path/to/project && npm run dev"
alias crm-studio="cd ~/path/to/project && npm run db:studio"
alias crm-deploy="cd ~/path/to/project && git push origin main"
```

Puis rechargez :
```bash
source ~/.zshrc
```

---

**✨ Gardez ce fichier à portée de main pour référence rapide !**

