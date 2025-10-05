-- ============================================
-- CRM V2 - SCHEMA COMPLET
-- À exécuter dans Neon SQL Editor
-- ============================================

-- ============================================
-- 1. SUPPRIMER LES ANCIENNES TABLES INUTILES
-- ============================================

DROP TABLE IF EXISTS factures CASCADE;
DROP TABLE IF EXISTS projets CASCADE;

-- ============================================
-- 2. TABLE CLIENTS (déjà existante, ajouts)
-- ============================================

-- Ajouter colonnes si elles n'existent pas
ALTER TABLE clients 
ADD COLUMN IF NOT EXISTS entreprise TEXT,
ADD COLUMN IF NOT EXISTS siret TEXT,
ADD COLUMN IF NOT EXISTS adresse TEXT,
ADD COLUMN IF NOT EXISTS code_postal TEXT,
ADD COLUMN IF NOT EXISTS ville TEXT,
ADD COLUMN IF NOT EXISTS notes_internes TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Tableau de tags
ADD COLUMN IF NOT EXISTS total_devis_crees INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_devis_acceptes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS chiffre_affaires_total DECIMAL(10,2) DEFAULT 0;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_clients_tags ON clients USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);

-- ============================================
-- 3. TABLE RENDEZ-VOUS (AGENDA)
-- ============================================

CREATE TABLE IF NOT EXISTS rendez_vous (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    titre TEXT NOT NULL,
    description TEXT,
    date_debut TIMESTAMP NOT NULL,
    date_fin TIMESTAMP NOT NULL,
    lieu TEXT,
    type_rdv TEXT DEFAULT 'rendez-vous', -- rendez-vous, appel, reunion, autre
    statut TEXT DEFAULT 'planifie', -- planifie, confirme, annule, termine
    rappel_avant INTEGER, -- Minutes avant (15, 30, 60, 1440...)
    notes TEXT,
    couleur TEXT DEFAULT '#6366f1', -- Pour l'affichage agenda
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rdv_client ON rendez_vous(client_id);
CREATE INDEX IF NOT EXISTS idx_rdv_date ON rendez_vous(date_debut);
CREATE INDEX IF NOT EXISTS idx_rdv_statut ON rendez_vous(statut);

-- ============================================
-- 4. TABLE DEVIS (améliorée)
-- ============================================

-- Vérifier si la table existe, sinon la créer
CREATE TABLE IF NOT EXISTS devis (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    numero_devis TEXT UNIQUE NOT NULL,
    titre TEXT NOT NULL,
    description TEXT,
    statut TEXT DEFAULT 'brouillon', -- brouillon, envoye, accepte, refuse, expire
    date_creation TIMESTAMP DEFAULT NOW(),
    date_envoi TIMESTAMP,
    date_reponse TIMESTAMP,
    date_validite TIMESTAMP, -- Date limite de validité
    montant_ht DECIMAL(10,2) DEFAULT 0,
    montant_tva DECIMAL(10,2) DEFAULT 0,
    montant_ttc DECIMAL(10,2) DEFAULT 0,
    taux_tva DECIMAL(5,2) DEFAULT 20.00,
    remise_pourcentage DECIMAL(5,2) DEFAULT 0,
    remise_montant DECIMAL(10,2) DEFAULT 0,
    conditions_paiement TEXT,
    notes_internes TEXT,
    notes_client TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_numero ON devis(numero_devis);

-- ============================================
-- 5. TABLE LIGNES DE DEVIS (améliorée)
-- ============================================

CREATE TABLE IF NOT EXISTS lignes_devis (
    id SERIAL PRIMARY KEY,
    devis_id INTEGER REFERENCES devis(id) ON DELETE CASCADE,
    ordre INTEGER DEFAULT 0, -- Pour l'ordre d'affichage
    type_ligne TEXT DEFAULT 'produit', -- produit, service, section, texte
    designation TEXT NOT NULL,
    description TEXT,
    quantite DECIMAL(10,2) DEFAULT 1,
    unite TEXT DEFAULT 'unité', -- unité, heure, jour, m², kg, etc.
    prix_unitaire_ht DECIMAL(10,2) DEFAULT 0,
    montant_ht DECIMAL(10,2) DEFAULT 0,
    taux_tva DECIMAL(5,2) DEFAULT 20.00,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_lignes_devis ON lignes_devis(devis_id);

-- ============================================
-- 6. TABLE MESSAGES (améliorée avec tags)
-- ============================================

-- Ajouter colonnes si elles n'existent pas
ALTER TABLE messages 
ADD COLUMN IF NOT EXISTS tags TEXT[], -- Tableau de tags
ADD COLUMN IF NOT EXISTS categorie TEXT DEFAULT 'general', -- general, demande-devis, reclamation, suivi, autre
ADD COLUMN IF NOT EXISTS reponse TEXT,
ADD COLUMN IF NOT EXISTS fichiers_joints JSONB; -- Stockage des infos sur les pièces jointes

CREATE INDEX IF NOT EXISTS idx_messages_tags ON messages USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_messages_categorie ON messages(categorie);

-- ============================================
-- 7. TABLE HISTORIQUE ACTIVITES
-- ============================================

CREATE TABLE IF NOT EXISTS activites (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    type_activite TEXT NOT NULL, -- devis_cree, devis_envoye, devis_accepte, message_recu, rdv_cree, etc.
    titre TEXT NOT NULL,
    description TEXT,
    entite_type TEXT, -- devis, message, rendez_vous
    entite_id INTEGER, -- ID de l'entité concernée
    metadata JSONB, -- Données supplémentaires
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activites_client ON activites(client_id);
CREATE INDEX IF NOT EXISTS idx_activites_date ON activites(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activites_type ON activites(type_activite);

-- ============================================
-- 8. FONCTION : Générer numéro de devis automatique
-- ============================================

CREATE OR REPLACE FUNCTION generer_numero_devis()
RETURNS TEXT AS $$
DECLARE
    annee TEXT;
    compteur INTEGER;
    nouveau_numero TEXT;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    -- Compter les devis de l'année
    SELECT COUNT(*) + 1 INTO compteur
    FROM devis
    WHERE numero_devis LIKE 'DEV-' || annee || '-%';
    
    -- Générer le numéro (ex: DEV-2025-0001)
    nouveau_numero := 'DEV-' || annee || '-' || LPAD(compteur::TEXT, 4, '0');
    
    RETURN nouveau_numero;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 9. TRIGGER : Mettre à jour l'historique client
-- ============================================

CREATE OR REPLACE FUNCTION maj_historique_client()
RETURNS TRIGGER AS $$
BEGIN
    -- Mettre à jour les statistiques du client
    IF TG_TABLE_NAME = 'devis' THEN
        -- Compter les devis
        UPDATE clients SET
            total_devis_crees = (SELECT COUNT(*) FROM devis WHERE client_id = NEW.client_id),
            total_devis_acceptes = (SELECT COUNT(*) FROM devis WHERE client_id = NEW.client_id AND statut = 'accepte'),
            chiffre_affaires_total = (SELECT COALESCE(SUM(montant_ttc), 0) FROM devis WHERE client_id = NEW.client_id AND statut = 'accepte'),
            updated_at = NOW()
        WHERE id = NEW.client_id;
        
        -- Ajouter dans l'historique
        INSERT INTO activites (client_id, type_activite, titre, entite_type, entite_id)
        VALUES (
            NEW.client_id,
            CASE 
                WHEN TG_OP = 'INSERT' THEN 'devis_cree'
                WHEN NEW.statut = 'envoye' THEN 'devis_envoye'
                WHEN NEW.statut = 'accepte' THEN 'devis_accepte'
                WHEN NEW.statut = 'refuse' THEN 'devis_refuse'
                ELSE 'devis_modifie'
            END,
            'Devis ' || NEW.numero_devis || ' - ' || NEW.titre,
            'devis',
            NEW.id
        );
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_maj_historique_devis ON devis;
CREATE TRIGGER trigger_maj_historique_devis
    AFTER INSERT OR UPDATE ON devis
    FOR EACH ROW
    EXECUTE FUNCTION maj_historique_client();

-- ============================================
-- 10. VUES UTILES
-- ============================================

-- Vue : Devis avec infos client
CREATE OR REPLACE VIEW vue_devis_complets AS
SELECT 
    d.*,
    c.nom,
    c.prenom,
    c.email,
    c.telephone,
    c.entreprise,
    c.statut as statut_client
FROM devis d
JOIN clients c ON d.client_id = c.id;

-- Vue : Statistiques clients
CREATE OR REPLACE VIEW vue_stats_clients AS
SELECT 
    c.*,
    COUNT(DISTINCT d.id) as nb_devis,
    COUNT(DISTINCT CASE WHEN d.statut = 'accepte' THEN d.id END) as nb_devis_acceptes,
    COALESCE(SUM(CASE WHEN d.statut = 'accepte' THEN d.montant_ttc ELSE 0 END), 0) as ca_total,
    COUNT(DISTINCT m.id) as nb_messages,
    COUNT(DISTINCT r.id) as nb_rendez_vous
FROM clients c
LEFT JOIN devis d ON c.id = d.client_id
LEFT JOIN messages m ON c.id = m.client_id
LEFT JOIN rendez_vous r ON c.id = r.client_id
GROUP BY c.id;

-- Vue : Agenda du jour
CREATE OR REPLACE VIEW vue_agenda_aujourdhui AS
SELECT 
    r.*,
    c.nom,
    c.prenom,
    c.email,
    c.telephone,
    c.entreprise
FROM rendez_vous r
LEFT JOIN clients c ON r.client_id = c.id
WHERE DATE(r.date_debut) = CURRENT_DATE
ORDER BY r.date_debut;

-- ============================================
-- 11. DONNÉES PAR DÉFAUT
-- ============================================

-- Tags par défaut pour les messages
UPDATE messages SET tags = ARRAY['nouveau'] WHERE tags IS NULL;

-- Couleurs par défaut pour les types de RDV
-- (À utiliser dans le frontend)

-- ============================================
-- FIN DU SCHEMA
-- ============================================

-- Afficher les tables créées
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

