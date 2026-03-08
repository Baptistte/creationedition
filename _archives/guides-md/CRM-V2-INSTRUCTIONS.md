# 🎉 CRM V2 - TRANSFORMATION COMPLÈTE

Votre CRM a été entièrement refondu avec des fonctionnalités professionnelles !

## 📦 CE QUI A ÉTÉ FAIT

### ✅ 1. Nettoyage
- ❌ Supprimé le test "Devenir Client" de la page contact
- ❌ Supprimé les modules Projets et Factures (non utilisés)
- ❌ Supprimé les fichiers:
  - `netlify/functions/projets.js`
  - `netlify/functions/factures.js`
  - `netlify/functions/add-client-direct.js` (test)
  - `admin/projets.html`
  - `admin/factures.html`

### ✅ 2. Nouvelles Fonctionnalités Backend

#### 📅 **AGENDA** (`netlify/functions/agenda.js`)
- Créer, modifier, supprimer des rendez-vous
- Lier les RDV aux clients
- Filtrer par date, statut, client
- Types de RDV: rendez-vous, appel, réunion, autre
- Statuts: planifié, confirmé, annulé, terminé
- Rappels configurables
- Couleurs personnalisables

#### 📄 **DEVIS COMPLET** (`netlify/functions/devis.js`)
- Génération automatique de numéros (DEV-2025-0001)
- Gestion des lignes de devis
- Calculs automatiques (HT, TVA, TTC)
- Remises (% ou montant)
- Statuts: brouillon, envoyé, accepté, refusé, expiré
- Date de validité
- Conditions de paiement
- Notes internes et notes client

#### 📧 **MESSAGES AMÉLIORÉS** (`netlify/functions/messages.js`)
- **Tags multiples** (tableau)
- **Catégories**: général, demande-devis, réclamation, suivi, autre
- Réponses stockées
- Priorités
- Filtres avancés

#### 👤 **CLIENTS AVEC HISTORIQUE** (`netlify/functions/clients.js`)
- Fiche client complète avec:
  - Tous les devis avec statuts et montants
  - Tous les messages reçus
  - Tous les rendez-vous
  - Historique des activités (timeline)
  - Statistiques détaillées (CA, nb devis, taux conversion...)
- Gestion des tags
- Infos entreprise (SIRET, adresse complète)
- Source de contact

### ✅ 3. Base de Données V2

Le fichier **`CRM-V2-SCHEMA.sql`** contient TOUT ce qu'il faut :

#### Nouvelles Tables
- ✨ `rendez_vous` - Agenda complet
- ✨ `activites` - Historique de toutes les actions

#### Tables Améliorées
- 📊 `clients` - Nouvelles colonnes:
  - entreprise, siret, adresse, code_postal, ville
  - tags[], notes_internes
  - total_devis_crees, total_devis_acceptes, chiffre_affaires_total
  
- 💼 `devis` - Nouvelles colonnes:
  - date_validite, remise_pourcentage, remise_montant
  - conditions_paiement, notes_internes, notes_client
  
- 📋 `lignes_devis` - Nouvelles colonnes:
  - ordre, type_ligne, description, unite
  
- 📬 `messages` - Nouvelles colonnes:
  - tags[], categorie, reponse, fichiers_joints

#### Fonctions & Triggers
- 🔢 `generer_numero_devis()` - Auto-incrémentation
- ⚡ Trigger automatique pour mettre à jour l'historique client
- 📊 Vues SQL pour statistiques

---

## 🚀 INSTRUCTIONS D'INSTALLATION

### ÉTAPE 1️⃣ : Exécuter le SQL

1. **Allez sur** : https://console.neon.tech
2. **Ouvrez** : SQL Editor
3. **Copiez-collez** TOUT le contenu de **`CRM-V2-SCHEMA.sql`**
4. **Cliquez** : Run (▶️)
5. **Vérifiez** : Vous devez voir "Query executed successfully"

⚠️ **IMPORTANT** : Ce SQL est conçu pour :
- ✅ Ne PAS supprimer les données existantes
- ✅ Ajouter les nouvelles colonnes si elles n'existent pas
- ✅ Supprimer uniquement les tables projets/factures

### ÉTAPE 2️⃣ : Pousser le Code

```bash
cd /Users/baptistegrincourtdeflogny/Desktop/siteMamanAjour/creationedition
git add .
git commit -m "CRM V2: Agenda, Devis complet, Historique clients"
git push origin main
```

### ÉTAPE 3️⃣ : Attendre le Déploiement

⏱️ 2-3 minutes sur Netlify

### ÉTAPE 4️⃣ : Tester les Fonctions

#### Test Agenda
```bash
curl -X GET "https://www.creationeditionbroderie.com/.netlify/functions/agenda" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### Test Devis
```bash
curl -X GET "https://www.creationeditionbroderie.com/.netlify/functions/devis" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### Test Client avec Historique
```bash
curl -X GET "https://www.creationeditionbroderie.com/.netlify/functions/clients?id=1" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

#### Test Messages avec Filtres
```bash
curl -X GET "https://www.creationeditionbroderie.com/.netlify/functions/messages?statut=nouveau" \
  -H "Authorization: Bearer VOTRE_TOKEN_JWT"
```

---

## 📱 PROCHAINES ÉTAPES (À FAIRE)

Les fonctions backend sont prêtes ! Maintenant il faut créer les pages HTML :

### 📅 Page Agenda (`admin/agenda.html`)
- Calendrier mensuel/hebdomadaire/journalier
- Création rapide de RDV
- Glisser-déposer pour déplacer les RDV
- Vue liste avec filtres
- Lien vers la fiche client

### 📄 Page Devis Améliorée (`admin/devis.html`)
- Formulaire de création avec:
  - Sélection client
  - Ajout dynamique de lignes
  - Calcul automatique des totaux
  - Aperçu PDF
- Gestion des statuts (brouillon → envoyé → accepté/refusé)
- Export PDF
- Envoi par email

### 👤 Page Fiche Client (`admin/client-detail.html`)
- En-tête avec infos principales
- Onglets:
  - 📊 Statistiques (graphiques)
  - 📄 Devis (liste avec statuts)
  - 📧 Messages (historique)
  - 📅 Rendez-vous (à venir et passés)
  - ⏱️ Timeline d'activités
- Actions rapides:
  - Créer un devis
  - Envoyer un message
  - Planifier un RDV

### 📧 Page Messages Améliorée (`admin/messages.html`)
- Système de tags (badges colorés)
- Catégories avec icônes
- Réponse rapide (formulaire intégré)
- Assignation
- Priorités visuelles

---

## 🗂️ STRUCTURE DES DONNÉES

### Client Complet
```javascript
{
  // Infos de base
  id: 1,
  nom: "Dupont",
  prenom: "Jean",
  email: "jean.dupont@example.com",
  telephone: "0612345678",
  
  // Entreprise
  entreprise: "SARL Dupont",
  siret: "12345678901234",
  adresse: "1 rue de la Paix",
  code_postal: "75001",
  ville: "Paris",
  
  // CRM
  statut: "client-regulier", // prospect, client-regulier, client-prioritaire, inactif
  tags: ["VIP", "Broderie", "Logo"],
  source: "formulaire-contact", // formulaire-contact, manuel, recommandation, etc.
  notes_internes: "Client très exigeant mais bon payeur",
  
  // Stats
  nombre_messages: 5,
  total_devis_crees: 12,
  total_devis_acceptes: 8,
  chiffre_affaires_total: 15420.50,
  
  // Dates
  premiere_prise_contact: "2025-01-15T10:30:00Z",
  derniere_activite: "2025-10-05T14:22:00Z"
}
```

### Devis Complet
```javascript
{
  id: 1,
  client_id: 1,
  numero_devis: "DEV-2025-0001",
  titre: "Logo + Broderie 50 pièces",
  description: "Création logo + broderie sur polos",
  
  statut: "accepte", // brouillon, envoye, accepte, refuse, expire
  
  date_creation: "2025-10-01T09:00:00Z",
  date_envoi: "2025-10-01T14:30:00Z",
  date_reponse: "2025-10-03T10:15:00Z",
  date_validite: "2025-10-31T23:59:59Z",
  
  montant_ht: 1200.00,
  montant_tva: 240.00,
  montant_ttc: 1440.00,
  taux_tva: 20.00,
  remise_pourcentage: 10.00,
  remise_montant: 120.00,
  
  conditions_paiement: "30% à la commande, 70% à la livraison",
  notes_internes: "Client fidèle, prioritaire",
  notes_client: "Merci pour votre confiance"
}
```

### Ligne de Devis
```javascript
{
  id: 1,
  devis_id: 1,
  ordre: 1,
  type_ligne: "produit", // produit, service, section, texte
  designation: "Création logo professionnel",
  description: "Logo vectoriel, 3 propositions, révisions illimitées",
  quantite: 1,
  unite: "unité", // unité, heure, jour, m², kg, etc.
  prix_unitaire_ht: 500.00,
  montant_ht: 500.00,
  taux_tva: 20.00
}
```

### Rendez-vous
```javascript
{
  id: 1,
  client_id: 1,
  titre: "Présentation maquettes logo",
  description: "Montrer les 3 propositions de logo",
  date_debut: "2025-10-10T14:00:00Z",
  date_fin: "2025-10-10T15:00:00Z",
  lieu: "Bureau client - 1 rue de la Paix, Paris",
  type_rdv: "rendez-vous", // rendez-vous, appel, reunion, autre
  statut: "planifie", // planifie, confirme, annule, termine
  rappel_avant: 60, // Minutes (60 = 1h avant)
  notes: "Apporter catalogue de broderie",
  couleur: "#10b981" // Pour l'affichage calendrier
}
```

### Message avec Tags
```javascript
{
  id: 1,
  client_id: 1,
  prenom: "Jean",
  nom: "Dupont",
  email: "jean.dupont@example.com",
  telephone: "0612345678",
  service_interesse: "Broderie Personnalisée",
  message: "Je voudrais un devis pour...",
  
  statut: "nouveau", // nouveau, lu, traite, archive
  categorie: "demande-devis", // general, demande-devis, reclamation, suivi, autre
  priorite: "normale", // basse, normale, haute, urgente
  tags: ["devis", "broderie", "urgent"],
  
  lu: false,
  archive: false,
  
  notes_internes: "Rappeler avant 17h",
  reponse: "Bonjour, voici votre devis...",
  
  date_reception: "2025-10-05T10:30:00Z",
  date_lecture: null,
  date_reponse: null
}
```

---

## 🎨 RECOMMANDATIONS DESIGN

### Couleurs par Statut
```css
/* Devis */
.brouillon { background: #94a3b8; } /* Gris */
.envoye { background: #3b82f6; } /* Bleu */
.accepte { background: #10b981; } /* Vert */
.refuse { background: #ef4444; } /* Rouge */
.expire { background: #f59e0b; } /* Orange */

/* Messages */
.nouveau { background: #8b5cf6; } /* Violet */
.lu { background: #3b82f6; } /* Bleu */
.traite { background: #10b981; } /* Vert */

/* Priorités */
.basse { border-left: 3px solid #10b981; }
.normale { border-left: 3px solid #3b82f6; }
.haute { border-left: 3px solid #f59e0b; }
.urgente { border-left: 3px solid #ef4444; }
```

### Icônes Recommandées
- 📅 Rendez-vous
- 📄 Devis
- 📧 Message
- 👤 Client
- 💰 Montant
- 📊 Statistiques
- ⏱️ Timeline
- 🏷️ Tags
- 🔔 Rappel

---

## ❓ FAQ

### Comment obtenir le token JWT ?
Connectez-vous sur `/admin/login.html`, le token est stocké dans `localStorage`.

### Les anciennes données sont-elles perdues ?
Non ! Le SQL préserve tous les clients, devis et messages existants.

### Comment ajouter un tag à un client ?
```javascript
fetch('/.netlify/functions/clients', {
  method: 'PUT',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    id: 1,
    tags: ['VIP', 'Broderie', 'Logo']
  })
})
```

### Comment créer un devis avec des lignes ?
```javascript
fetch('/.netlify/functions/devis', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    client_id: 1,
    titre: "Logo + Broderie",
    lignes: [
      {
        designation: "Création logo",
        quantite: 1,
        prix_unitaire_ht: 500
      },
      {
        designation: "Broderie polo",
        quantite: 50,
        unite: "pièce",
        prix_unitaire_ht: 12
      }
    ]
  })
})
```

---

## 📞 SUPPORT

Si vous avez des questions ou besoin d'aide pour créer les pages HTML, demandez-moi !

🎉 **Votre CRM est maintenant une solution professionnelle complète !**

