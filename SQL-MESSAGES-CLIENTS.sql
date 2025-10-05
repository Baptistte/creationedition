-- Créer la table messages si elle n'existe pas
CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE,
    prenom TEXT NOT NULL,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    telephone TEXT,
    service_interesse TEXT,
    message TEXT NOT NULL,
    statut TEXT DEFAULT 'nouveau',
    lu BOOLEAN DEFAULT FALSE,
    archive BOOLEAN DEFAULT FALSE,
    priorite TEXT DEFAULT 'normal',
    notes_internes TEXT,
    tags TEXT[],
    categorie TEXT DEFAULT 'general',
    date_reception TIMESTAMP DEFAULT NOW(),
    date_lecture TIMESTAMP,
    date_reponse TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Créer la table clients si elle n'existe pas
CREATE TABLE IF NOT EXISTS clients (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    prenom TEXT,
    email TEXT NOT NULL UNIQUE,
    telephone TEXT,
    entreprise TEXT,
    adresse TEXT,
    code_postal TEXT,
    ville TEXT,
    notes TEXT,
    statut TEXT DEFAULT 'prospect',
    nombre_messages INTEGER DEFAULT 0,
    premiere_prise_contact TIMESTAMP,
    derniere_activite TIMESTAMP,
    source TEXT DEFAULT 'formulaire-contact',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Créer des index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_messages_client_id ON messages(client_id);
CREATE INDEX IF NOT EXISTS idx_messages_date_reception ON messages(date_reception);
CREATE INDEX IF NOT EXISTS idx_messages_statut ON messages(statut);
CREATE INDEX IF NOT EXISTS idx_messages_lu ON messages(lu);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_statut ON clients(statut);
CREATE INDEX IF NOT EXISTS idx_clients_derniere_activite ON clients(derniere_activite);
