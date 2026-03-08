# 🎨 CRM V2 - Création & Édition Broderie

## 📖 À PROPOS

CRM complet pour la gestion de :
- 👥 **Clients** avec historique détaillé
- 📄 **Devis** avec lignes et calculs automatiques
- 📅 **Agenda** (rendez-vous, appels, réunions)
- 📧 **Messages** avec tags et catégories
- ⏱️ **Timeline** d'activités

---

## 🚀 DÉMARRAGE RAPIDE

### 1. Installer les dépendances
```bash
npm install
```

### 2. Configurer les variables d'environnement
Sur Netlify, ajoutez :
- `JWT_SECRET` - Secret pour les tokens
- `SETUP_SECRET` - Secret pour l'initialisation
- `NETLIFY_DATABASE_URL` - URL Neon (déjà configuré)

### 3. Exécuter le SQL
Allez sur https://console.neon.tech → SQL Editor

Copiez-collez tout le contenu de `CRM-V2-SCHEMA.sql` et exécutez.

### 4. Déployer
```bash
git add .
git commit -m "CRM V2"
git push origin main
```

---

## 📂 STRUCTURE

```
creationedition/
│
├── admin/                        # Pages d'administration
│   ├── login.html               # Connexion
│   ├── dashboard.html           # Tableau de bord
│   ├── clients.html             # Liste clients
│   ├── devis.html               # Liste devis
│   ├── messages.html            # Messages reçus
│   └── assets/                  # CSS et JS admin
│
├── netlify/functions/           # Serverless API
│   ├── auth-login.js           # Authentification
│   ├── auth-verify.js          # Vérification JWT
│   ├── setup-db.js             # Initialisation BDD
│   ├── clients.js              # CRUD clients + historique
│   ├── devis.js                # CRUD devis + lignes + calculs
│   ├── agenda.js               # CRUD rendez-vous
│   ├── messages.js             # CRUD messages + tags
│   └── contact-submit.js       # Formulaire de contact
│
├── contact/                     # Page publique
│   └── index.html              # Formulaire de contact
│
├── db/                          # Configuration BDD (Drizzle)
│   ├── connection.js           # Connexion Neon
│   └── schema.js               # Schéma (legacy)
│
├── CRM-V2-SCHEMA.sql           # 🔥 SQL COMPLET À EXÉCUTER
├── CRM-V2-INSTRUCTIONS.md      # 📘 Documentation détaillée
├── ACTIONS-IMMEDIATES.md       # ⚡ Guide de démarrage rapide
├── README-CRM-V2.md            # 📖 Ce fichier
│
├── package.json                # Dépendances
├── netlify.toml                # Configuration Netlify
└── .gitignore
```

---

## 🔧 FONCTIONNALITÉS BACKEND

### 🔐 Authentification (`/auth-login`)
- Connexion admin avec JWT
- Token valide 7 jours
- Stocké dans `localStorage`

### 👥 Clients (`/clients`)
**GET** `/clients` - Liste tous les clients avec stats
**GET** `/clients?id=1` - Fiche client complète :
  - Infos de base
  - Tous les devis
  - Tous les messages
  - Tous les RDV
  - Timeline d'activités
  - Statistiques (CA, taux conversion...)

**POST** `/clients` - Créer un client
**PUT** `/clients` - Modifier un client
**DELETE** `/clients?id=1` - Supprimer un client

### 📄 Devis (`/devis`)
**GET** `/devis` - Liste tous les devis
**GET** `/devis?id=1` - Détail devis avec lignes
**GET** `/devis?client_id=1` - Devis d'un client
**GET** `/devis?statut=accepte` - Filtrer par statut

**POST** `/devis` - Créer un devis avec lignes
  - Numéro auto-généré (DEV-2025-0001)
  - Calcul automatique des totaux
  - Support des remises

**PUT** `/devis` - Modifier un devis
  - Mise à jour des lignes
  - Recalcul automatique

**DELETE** `/devis?id=1` - Supprimer un devis

### 📅 Agenda (`/agenda`)
**GET** `/agenda` - Liste tous les RDV
**GET** `/agenda?client_id=1` - RDV d'un client
**GET** `/agenda?date_debut=2025-10-10` - RDV d'une date
**GET** `/agenda?statut=planifie` - Filtrer par statut

**POST** `/agenda` - Créer un RDV
**PUT** `/agenda` - Modifier un RDV
**DELETE** `/agenda?id=1` - Supprimer un RDV

### 📧 Messages (`/messages`)
**GET** `/messages` - Liste tous les messages
**GET** `/messages?statut=nouveau` - Filtrer par statut
**GET** `/messages?categorie=demande-devis` - Filtrer par catégorie
**GET** `/messages?archive=false` - Non archivés seulement

**PUT** `/messages` - Mettre à jour un message
  - Marquer lu/non lu
  - Ajouter des tags
  - Changer catégorie
  - Ajouter réponse
  - Archiver

**DELETE** `/messages?id=1` - Supprimer un message

### 📬 Contact (`/contact-submit`)
**POST** `/contact-submit` - Soumission formulaire
  - Création automatique du client si nouveau
  - Incrémentation `nombre_messages`
  - Passage en "client-regulier" après 2 messages
  - Enregistrement du message

---

## 📊 BASE DE DONNÉES

### Tables Principales

#### `clients`
- Infos de base (nom, prénom, email, téléphone)
- Infos entreprise (entreprise, siret, adresse)
- CRM (statut, tags[], notes_internes, source)
- Stats (nb_messages, total_devis, ca_total)
- Dates (premiere_prise_contact, derniere_activite)

#### `devis`
- Infos de base (client_id, numero_devis, titre)
- Statuts (brouillon, envoye, accepte, refuse, expire)
- Montants (ht, tva, ttc, remise)
- Dates (creation, envoi, reponse, validite)
- Notes (internes, client, conditions_paiement)

#### `lignes_devis`
- devis_id (FK)
- ordre (pour tri)
- type_ligne (produit, service, section, texte)
- designation, description
- quantite, unite
- prix_unitaire_ht, montant_ht, taux_tva

#### `rendez_vous`
- client_id (FK nullable)
- titre, description
- date_debut, date_fin
- lieu, type_rdv, statut
- rappel_avant (minutes)
- notes, couleur

#### `messages`
- client_id (FK nullable)
- prenom, nom, email, telephone
- service_interesse, message
- statut, categorie, priorite
- lu, archive
- tags[]
- reponse
- dates (reception, lecture, reponse)

#### `activites`
- client_id (FK)
- type_activite (devis_cree, devis_envoye, devis_accepte, rdv_cree...)
- titre, description
- entite_type, entite_id (pour lier à un devis, message, RDV...)
- metadata (JSONB)
- created_at

### Fonctions SQL

**`generer_numero_devis()`**
Génère automatiquement un numéro de devis incrémental :
- Format: DEV-YYYY-NNNN
- Exemple: DEV-2025-0001

### Triggers

**`trigger_maj_historique_devis`**
Se déclenche lors de création/modification d'un devis :
- Met à jour les stats du client
- Ajoute une entrée dans la timeline

### Vues

**`vue_devis_complets`**
Devis avec infos client jointes

**`vue_stats_clients`**
Statistiques complètes par client

**`vue_agenda_aujourdhui`**
RDV du jour avec infos client

---

## 🎨 EXEMPLES D'UTILISATION

### Créer un devis complet
```javascript
const token = localStorage.getItem('token');

const devis = await fetch('/.netlify/functions/devis', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_id: 1,
    titre: "Logo + 50 polos brodés",
    description: "Création logo + broderie personnalisée",
    date_validite: "2025-11-30",
    conditions_paiement: "30% à la commande, 70% à la livraison",
    lignes: [
      {
        designation: "Création logo professionnel",
        description: "3 propositions, révisions illimitées",
        quantite: 1,
        prix_unitaire_ht: 500
      },
      {
        designation: "Broderie polo",
        description: "Logo brodé sur poitrine gauche",
        quantite: 50,
        unite: "pièce",
        prix_unitaire_ht: 12
      }
    ]
  })
});

const result = await devis.json();
console.log(result);
// { success: true, devis: {...}, message: "Devis DEV-2025-0001 créé avec succès" }
```

### Récupérer l'historique complet d'un client
```javascript
const client = await fetch('/.netlify/functions/clients?id=1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const data = await client.json();
console.log(data);
// {
//   success: true,
//   client: {...},
//   devis: [...],
//   messages: [...],
//   rendezVous: [...],
//   activites: [...],
//   stats: { nb_devis: 12, ca_total: 15420.50, ... }
// }
```

### Ajouter des tags à un message
```javascript
await fetch('/.netlify/functions/messages', {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 5,
    tags: ['urgent', 'devis', 'broderie'],
    categorie: 'demande-devis',
    priorite: 'haute',
    lu: true
  })
});
```

### Planifier un rendez-vous
```javascript
await fetch('/.netlify/functions/agenda', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_id: 1,
    titre: "Présentation maquettes",
    description: "Montrer les 3 propositions de logo",
    date_debut: "2025-10-15T14:00:00Z",
    date_fin: "2025-10-15T15:00:00Z",
    lieu: "Bureau client",
    type_rdv: "rendez-vous",
    statut: "planifie",
    rappel_avant: 60, // 1 heure avant
    couleur: "#10b981"
  })
});
```

---

## 🔐 SÉCURITÉ

- ✅ Toutes les routes API sont protégées par JWT
- ✅ Les tokens expirent après 7 jours
- ✅ Les mots de passe sont hashés avec bcrypt
- ✅ Les variables sensibles sont dans Netlify (jamais dans le code)
- ✅ CORS configuré
- ✅ Validation des données côté backend

---

## 📚 DOCUMENTATION

- **`CRM-V2-INSTRUCTIONS.md`** - Documentation complète avec exemples
- **`ACTIONS-IMMEDIATES.md`** - Guide de démarrage rapide
- **`CRM-V2-SCHEMA.sql`** - Schéma SQL complet avec commentaires

---

## 🆘 DÉPANNAGE

### "Non autorisé" lors des appels API
→ Votre token JWT a expiré, reconnectez-vous sur `/admin/login.html`

### "relation does not exist"
→ Vous n'avez pas exécuté le SQL `CRM-V2-SCHEMA.sql` dans Neon

### Les messages du formulaire ne s'enregistrent pas
→ Vérifiez que `NETLIFY_DATABASE_URL` existe dans les variables d'environnement

### Les totaux de devis ne se calculent pas
→ Vérifiez que la fonction `recalculerTotaux()` n'a pas d'erreur (logs Netlify)

---

## 📞 SUPPORT

Pour toute question ou amélioration, référez-vous aux fichiers de documentation ou demandez de l'aide !

---

**🎉 Votre CRM est prêt à propulser votre activité ! 🚀**

