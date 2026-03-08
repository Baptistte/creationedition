-- SQL pour créer la table devis (si elle n'existe pas déjà)

-- Créer ou mettre à jour la table devis
CREATE TABLE IF NOT EXISTS devis (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    numero_devis TEXT UNIQUE,
    service TEXT,
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

-- Ajouter les colonnes si elles n'existent pas (pour mise à jour)
DO $$ 
BEGIN
    -- service
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='devis' AND column_name='service') THEN
        ALTER TABLE devis ADD COLUMN service TEXT;
    END IF;
    
    -- commentaire
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='devis' AND column_name='commentaire') THEN
        ALTER TABLE devis ADD COLUMN commentaire TEXT;
    END IF;
    
    -- prix
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='devis' AND column_name='prix') THEN
        ALTER TABLE devis ADD COLUMN prix DECIMAL(10,2) DEFAULT 0;
    END IF;
    
    -- date_envoi
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='devis' AND column_name='date_envoi') THEN
        ALTER TABLE devis ADD COLUMN date_envoi TIMESTAMP;
    END IF;
    
    -- date_acceptation
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='devis' AND column_name='date_acceptation') THEN
        ALTER TABLE devis ADD COLUMN date_acceptation TIMESTAMP;
    END IF;
    
    -- date_paiement
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='devis' AND column_name='date_paiement') THEN
        ALTER TABLE devis ADD COLUMN date_paiement TIMESTAMP;
    END IF;
END $$;

-- Index pour performance
CREATE INDEX IF NOT EXISTS idx_devis_client ON devis(client_id);
CREATE INDEX IF NOT EXISTS idx_devis_statut ON devis(statut);
CREATE INDEX IF NOT EXISTS idx_devis_numero ON devis(numero_devis);

-- Fonction pour générer un numéro de devis (facultatif, la fonction JS a un fallback)
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
