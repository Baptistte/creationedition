import { pgTable, serial, text, timestamp, decimal, integer, boolean } from 'drizzle-orm/pg-core';

// Table des administrateurs
export const admins = pgTable('admins', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  password: text('password').notNull(), // Hash bcrypt
  nom: text('nom').notNull(),
  prenom: text('prenom').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table des clients
export const clients = pgTable('clients', {
  id: serial('id').primaryKey(),
  nom: text('nom').notNull(),
  prenom: text('prenom'),
  entreprise: text('entreprise'),
  email: text('email').notNull(),
  telephone: text('telephone'),
  adresse: text('adresse'),
  ville: text('ville'),
  codePostal: text('code_postal'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table des devis
export const devis = pgTable('devis', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  numeroDevis: text('numero_devis').notNull().unique(),
  titre: text('titre').notNull(),
  description: text('description'),
  montantHT: decimal('montant_ht', { precision: 10, scale: 2 }).notNull(),
  montantTTC: decimal('montant_ttc', { precision: 10, scale: 2 }).notNull(),
  tva: decimal('tva', { precision: 5, scale: 2 }).notNull().default('20.00'),
  statut: text('statut').notNull().default('brouillon'), // brouillon, envoye, accepte, refuse, expire
  dateCreation: timestamp('date_creation').defaultNow().notNull(),
  dateEnvoi: timestamp('date_envoi'),
  dateValidite: timestamp('date_validite'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table des lignes de devis
export const lignesDevis = pgTable('lignes_devis', {
  id: serial('id').primaryKey(),
  devisId: integer('devis_id').notNull().references(() => devis.id),
  designation: text('designation').notNull(),
  quantite: integer('quantite').notNull().default(1),
  prixUnitaire: decimal('prix_unitaire', { precision: 10, scale: 2 }).notNull(),
  montantTotal: decimal('montant_total', { precision: 10, scale: 2 }).notNull(),
  ordre: integer('ordre').notNull().default(0),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Table des projets/commandes
export const projets = pgTable('projets', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  devisId: integer('devis_id').references(() => devis.id),
  titre: text('titre').notNull(),
  description: text('description'),
  typeProjet: text('type_projet').notNull(), // broderie, floquage, print, logo, site-web
  statut: text('statut').notNull().default('en-cours'), // en-cours, termine, annule
  montant: decimal('montant', { precision: 10, scale: 2 }),
  dateDebut: timestamp('date_debut').defaultNow().notNull(),
  dateFin: timestamp('date_fin'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Table des factures
export const factures = pgTable('factures', {
  id: serial('id').primaryKey(),
  clientId: integer('client_id').notNull().references(() => clients.id),
  projetId: integer('projet_id').references(() => projets.id),
  numeroFacture: text('numero_facture').notNull().unique(),
  montantHT: decimal('montant_ht', { precision: 10, scale: 2 }).notNull(),
  montantTTC: decimal('montant_ttc', { precision: 10, scale: 2 }).notNull(),
  tva: decimal('tva', { precision: 5, scale: 2 }).notNull().default('20.00'),
  statut: text('statut').notNull().default('impayee'), // impayee, payee, annulee
  dateEmission: timestamp('date_emission').defaultNow().notNull(),
  dateEcheance: timestamp('date_echeance').notNull(),
  datePaiement: timestamp('date_paiement'),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

