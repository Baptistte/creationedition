# 📬 Installation du système de Messages CRM

## 🎯 Ce qui a été ajouté

### 1. Tables de base de données
- **messages** : Tous les messages reçus via le formulaire de contact
- **Colonnes ajoutées à clients** : statut, nombre_messages, source, etc.
- **tags_clients** : Pour catégoriser les clients (VIP, Prospect chaud, etc.)
- **Vue** : vue_clients_stats pour avoir les statistiques

### 2. Fonctions Netlify
- `contact-submit` : Reçoit les messages du formulaire et crée/met à jour les clients
- `messages` : API pour gérer les messages (CRUD complet)

### 3. Page Admin
- `/admin/messages.html` : Interface complète pour gérer les messages

### 4. Modification du formulaire
- Le formulaire de contact envoie maintenant aussi vers votre CRM

---

## 📝 ÉTAPE 1 : Créer les tables SQL dans Neon

1. Allez sur https://console.neon.tech
2. Connectez-vous
3. Sélectionnez votre projet
4. Cliquez sur **"SQL Editor"**
5. **Copiez-collez ce SQL complet** :

```sql
-- Ajouter des colonnes à la table clients existante
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS statut TEXT DEFAULT 'prospect',
ADD COLUMN IF NOT EXISTS nombre_messages INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS premiere_prise_contact TIMESTAMP,
ADD COLUMN IF NOT EXISTS derniere_activite TIMESTAMP,
ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'formulaire-contact';

-- Créer un index sur l'email pour les recherches rapides
CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);

-- Table des messages reçus via le formulaire de contact
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    service_interesse TEXT,
    message TEXT NOT NULL,
    statut TEXT NOT NULL DEFAULT 'nouveau',
    priorite TEXT DEFAULT 'normale',
    lu BOOLEAN DEFAULT FALSE,
    archive BOOLEAN DEFAULT FALSE,
    notes_internes TEXT,
    date_reception TIMESTAMP DEFAULT NOW(),
    date_lecture TIMESTAMP,
    date_reponse TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index pour les recherches fréquentes
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_statut ON messages(statut);
CREATE INDEX IF NOT EXISTS idx_messages_date ON messages(date_reception DESC);
CREATE INDEX IF NOT EXISTS idx_messages_email ON messages(email);

-- Table pour les tags/catégories de clients
CREATE TABLE IF NOT EXISTS tags_clients (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL UNIQUE,
    couleur TEXT DEFAULT '#667eea',
    created_at TIMESTAMP DEFAULT NOW()
);

-- Table de liaison pour les tags (many-to-many)
CREATE TABLE IF NOT EXISTS clients_tags (
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES tags_clients(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW(),
    PRIMARY KEY (client_id, tag_id)
);

-- Insérer quelques tags par défaut
INSERT INTO tags_clients (nom, couleur) VALUES 
    ('VIP', '#ef4444'),
    ('Prospect chaud', '#f59e0b'),
    ('Client régulier', '#10b981'),
    ('À relancer', '#8b5cf6')
ON CONFLICT (nom) DO NOTHING;

-- Vue pour avoir les statistiques des clients
CREATE OR REPLACE VIEW vue_clients_stats AS
SELECT 
    c.*,
    COUNT(DISTINCT m.id) as total_messages,
    MAX(m.date_reception) as dernier_message,
    COUNT(DISTINCT m.id) FILTER (WHERE m.statut = 'nouveau') as messages_non_lus,
    ARRAY_AGG(DISTINCT t.nom) FILTER (WHERE t.nom IS NOT NULL) as tags
FROM clients c
LEFT JOIN messages m ON c.id = m.client_id
LEFT JOIN clients_tags ct ON c.id = ct.client_id
LEFT JOIN tags_clients t ON ct.tag_id = t.id
GROUP BY c.id;
```

6. Cliquez sur **"Run"** ou **"Execute"**
7. Vérifiez qu'il n'y a pas d'erreur

✅ **Les tables sont créées !**

---

## 🚀 ÉTAPE 2 : Pousser le code sur Git

```bash
git add .
git commit -m "Ajout système de messages CRM"
git push origin main
```

⏱️ Attendez 2-3 minutes que Netlify déploie

---

## ✅ ÉTAPE 3 : Tester le système

### Test 1 : Envoyer un message test

1. Allez sur https://www.creationeditionbroderie.com/contact/
2. Remplissez le formulaire
3. Envoyez

Le message devrait :
- ✅ Être envoyé par EmailJS (comme avant)
- ✅ Être enregistré dans votre CRM
- ✅ Créer automatiquement un profil client

### Test 2 : Voir les messages dans le CRM

1. Allez sur https://www.creationeditionbroderie.com/admin/login.html
2. Connectez-vous
3. Cliquez sur **"Messages"** dans le menu
4. Vous devriez voir votre message test ! 🎉

---

## 🎨 Fonctionnalités disponibles

### Dans la page Messages :

#### Statistiques
- Nombre de nouveaux messages
- Total des messages
- Messages traités
- Messages archivés

#### Filtres
- **Tous** : Tous les messages
- **Nouveaux** : Messages non lus
- **Lus** : Messages déjà consultés
- **Traités** : Messages dont vous vous êtes occupé
- **Archivés** : Messages archivés

#### Actions sur chaque message
- ✓ **Marquer comme lu**
- ✓ **Marquer comme traité**
- 📦 **Archiver**
- 🗑️ **Supprimer**
- 👤 **Voir le client**

#### Auto-création de clients
- **1er message** → Client créé automatiquement avec statut "prospect"
- **2ème message et +** → Client passé en "client-regulier"
- **Pas de doublon** → Si l'email existe déjà, mise à jour du client

---

## 🔄 Comment ça fonctionne

### Scénario 1 : Nouveau client

1. Jean Dupont remplit le formulaire pour la première fois
2. ✅ Un profil client est créé automatiquement
3. ✅ Le message est enregistré
4. ✅ Le client a le statut "prospect"
5. ✅ L'email est envoyé via EmailJS

### Scénario 2 : Client qui revient

1. Jean Dupont remplit à nouveau le formulaire
2. ✅ Son profil est mis à jour (pas de doublon)
3. ✅ Son statut passe à "client-regulier"
4. ✅ Le nombre de messages est incrémenté
5. ✅ Le nouveau message est enregistré

---

## 📊 Statuts disponibles

### Statuts des messages
- **nouveau** : Message non lu (badge bleu)
- **lu** : Message consulté
- **traite** : Vous avez répondu/géré
- **archive** : Message archivé
- **spam** : Message indésirable

### Statuts des clients
- **prospect** : Premier contact
- **client-regulier** : 2 messages ou plus
- **client** : A passé commande
- **vip** : Client important

### Priorités des messages
- **normale** : Par défaut
- **haute** : Important (⚠️)
- **urgente** : Très urgent (🔥)

---

## 🎯 Prochaines étapes recommandées

### 1. Testez avec des vrais messages
- Envoyez plusieurs messages tests
- Testez toutes les actions (marquer comme lu, archiver, etc.)
- Vérifiez que les clients sont bien créés

### 2. Consultez les messages régulièrement
- L'interface se rafraîchit automatiquement toutes les 30 secondes
- Ou cliquez sur "🔄 Actualiser" manuellement

### 3. Organisez vos clients
- Ajoutez des tags (VIP, etc.) dans la page Clients
- Consultez les statistiques

---

## 🔧 Personnalisation possible

### Ajouter d'autres statuts de messages
Dans Neon SQL Editor :
```sql
-- Exemple : ajouter un statut "en-attente-de-reponse"
-- Utilisez simplement ce statut dans l'interface
```

### Ajouter d'autres tags clients
```sql
INSERT INTO tags_clients (nom, couleur) VALUES 
    ('Nouveau tag', '#couleur-hex');
```

### Modifier les priorités
Vous pouvez les changer directement depuis l'interface admin.

---

## 💡 Astuces

### Voir tous les messages d'un client
1. Allez dans **Clients**
2. Trouvez le client
3. Cliquez sur "Voir le profil"
4. Vous verrez tous ses messages

### Rechercher un message
Utilisez la fonction de recherche de votre navigateur (Cmd/Ctrl + F) dans la page Messages.

### Ne pas perdre de messages
- Les messages sont enregistrés AVANT l'envoi EmailJS
- Même si EmailJS échoue, le message est dans votre CRM
- Vous ne perdez aucun lead !

---

## 🆘 Dépannage

### Les messages n'apparaissent pas dans le CRM
1. Vérifiez que les tables sont créées dans Neon
2. Vérifiez que le déploiement Netlify est terminé (vert)
3. Consultez les logs Netlify Functions

### Le formulaire ne fonctionne plus
- Le formulaire continue d'utiliser EmailJS normalement
- L'envoi au CRM est non-bloquant (ne cause pas d'erreur)
- Vérifiez la console du navigateur (F12)

### Impossible de marquer un message comme lu
- Vérifiez que vous êtes bien connecté
- Votre token JWT est peut-être expiré
- Déconnectez-vous et reconnectez-vous

---

## 📞 Résumé rapide

✅ **SQL copié-collé dans Neon** → Tables créées
✅ **Git push** → Code déployé
✅ **Formulaire testé** → Message enregistré
✅ **Admin/Messages** → Interface fonctionnelle

**Vous avez maintenant un CRM complet avec gestion des messages ! 🎉**

---

*Dernière mise à jour : 4 octobre 2025*

