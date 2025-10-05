-- SQL pour les DEVIS SIMPLES

-- Si la table devis n'existe pas, la créer
CREATE TABLE IF NOT EXISTS devis (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    numero_devis TEXT UNIQUE NOT NULL,
    service TEXT NOT NULL,
    commentaire TEXT,
    prix DECIMAL(10,2) DEFAULT 0,
    statut TEXT DEFAULT 'en-attente',
    date_creation TIMESTAMP DEFAULT NOW(),
    date_envoi TIMESTAMP,
    date_acceptation TIMESTAMP,
    date_paiement TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Si la table existe déjà, ajouter les colonnes manquantes
ALTER TABLE devis 
ADD COLUMN IF NOT EXISTS service TEXT,
ADD COLUMN IF NOT EXISTS commentaire TEXT,
ADD COLUMN IF NOT EXISTS prix DECIMAL(10,2) DEFAULT 0,
ADD COLUMN IF NOT EXISTS date_envoi TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_acceptation TIMESTAMP,
ADD COLUMN IF NOT EXISTS date_paiement TIMESTAMP;

-- Mettre à jour le statut si besoin (facultatif)
-- UPDATE devis SET statut = 'en-attente' WHERE statut = 'brouillon';

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_numero ON devis(numero_devis);

-- Fonction pour générer un numéro de devis
CREATE OR REPLACE FUNCTION generer_numero_devis()
RETURNS TEXT AS $$
DECLARE
    annee TEXT;
    compteur INTEGER;
    nouveau_numero TEXT;
BEGIN
    annee := TO_CHAR(CURRENT_DATE, 'YYYY');
    
    SELECT COUNT(*) + 1 INTO compteur
    FROM devis
    WHERE numero_devis LIKE 'DEV-' || annee || '-%';
    
    nouveau_numero := 'DEV-' || annee || '-' || LPAD(compteur::TEXT, 4, '0');
    
    RETURN nouveau_numero;
END;
$$ LANGUAGE plpgsql;

