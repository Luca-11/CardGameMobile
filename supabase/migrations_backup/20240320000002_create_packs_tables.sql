-- Suppression des tables existantes
DROP TABLE IF EXISTS pack_purchases CASCADE;
DROP TABLE IF EXISTS card_packs CASCADE;

-- Création du type énuméré pour les raretés de cartes s'il n'existe pas déjà
DO $$ BEGIN
    CREATE TYPE card_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table des packs de cartes
CREATE TABLE card_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    cards_per_pack INTEGER NOT NULL DEFAULT 5,
    image_url TEXT,
    rarity_weights JSONB NOT NULL DEFAULT '{
        "common": 70,
        "uncommon": 20,
        "rare": 7,
        "epic": 2.5,
        "legendary": 0.5
    }'::jsonb,
    guaranteed_rarity card_rarity,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Contraintes
    CONSTRAINT valid_price CHECK (price > 0),
    CONSTRAINT valid_cards_per_pack CHECK (cards_per_pack > 0)
);

-- Création de la table des types de packs
CREATE TABLE pack_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL, -- Prix en monnaie du jeu
    cards_per_pack INTEGER NOT NULL,
    guaranteed_rarity card_rarity NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Création de la table des probabilités de rareté par pack
CREATE TABLE pack_rarity_odds (
    pack_type_id UUID REFERENCES pack_types(id) ON DELETE CASCADE,
    rarity card_rarity NOT NULL,
    probability DECIMAL NOT NULL CHECK (probability >= 0 AND probability <= 1),
    PRIMARY KEY (pack_type_id, rarity)
);

-- Table des achats de packs
CREATE TABLE pack_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pack_type_id UUID REFERENCES pack_types(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()) NOT NULL
);

-- Triggers pour updated_at
CREATE TRIGGER update_card_packs_updated_at
    BEFORE UPDATE ON card_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pack_purchases_updated_at
    BEFORE UPDATE ON pack_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE card_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_rarity_odds ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour card_packs
CREATE POLICY "Card packs are viewable by everyone" ON card_packs
    FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify card packs" ON card_packs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Politiques RLS pour pack_types
CREATE POLICY "Tout le monde peut voir les types de packs" ON pack_types
    FOR SELECT USING (true);

CREATE POLICY "Tout le monde peut voir les probabilités" ON pack_rarity_odds
    FOR SELECT USING (true);

-- Politiques RLS pour pack_purchases
CREATE POLICY "Les utilisateurs peuvent voir leurs achats" ON pack_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent acheter des packs" ON pack_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX idx_pack_purchases_user_id ON pack_purchases(user_id);
CREATE INDEX idx_pack_purchases_pack_type_id ON pack_purchases(pack_type_id);

-- Commentaires
COMMENT ON TABLE card_packs IS 'Table contenant les différents types de packs de cartes disponibles';
COMMENT ON TABLE pack_types IS 'Table contenant les différents types de packs disponibles';
COMMENT ON TABLE pack_rarity_odds IS 'Table contenant les probabilités de rareté pour chaque type de pack';
COMMENT ON TABLE pack_purchases IS 'Table contenant les achats de packs par les utilisateurs';

-- Insertion des packs de base
INSERT INTO card_packs (name, description, price, cards_per_pack, image_url) VALUES
    ('Pack de Démarrage', 'Un pack parfait pour débuter, contenant principalement des cartes communes et peu communes.', 100, 5, NULL),
    ('Pack Élémentaire', 'Contient des cartes élémentaires puissantes avec une chance accrue d''obtenir des cartes rares.', 200, 5, NULL),
    ('Pack Premium', 'Garantit au moins une carte rare ou mieux.', 500, 5, NULL),
    ('Pack Légendaire', 'Garantit au moins une carte épique et une chance accrue d''obtenir une carte légendaire.', 1000, 5, NULL);

-- Insertion des types de packs de base
INSERT INTO pack_types (name, description, price, cards_per_pack, guaranteed_rarity) VALUES
('Pack Débutant', 'Un pack parfait pour commencer, contenant principalement des cartes communes.', 100, 5, 'common'),
('Pack Standard', 'Un pack équilibré avec une chance d''obtenir des cartes rares.', 200, 5, 'uncommon'),
('Pack Premium', 'Un pack de haute qualité avec une carte rare garantie.', 500, 5, 'rare'),
('Pack Légendaire', 'Un pack exceptionnel contenant une carte épique ou légendaire garantie.', 1000, 5, 'epic');

-- Insertion des probabilités pour le Pack Débutant
INSERT INTO pack_rarity_odds (pack_type_id, rarity, probability) VALUES
((SELECT id FROM pack_types WHERE name = 'Pack Débutant'), 'common', 0.7),
((SELECT id FROM pack_types WHERE name = 'Pack Débutant'), 'uncommon', 0.25),
((SELECT id FROM pack_types WHERE name = 'Pack Débutant'), 'rare', 0.05);

-- Insertion des probabilités pour le Pack Standard
INSERT INTO pack_rarity_odds (pack_type_id, rarity, probability) VALUES
((SELECT id FROM pack_types WHERE name = 'Pack Standard'), 'common', 0.5),
((SELECT id FROM pack_types WHERE name = 'Pack Standard'), 'uncommon', 0.35),
((SELECT id FROM pack_types WHERE name = 'Pack Standard'), 'rare', 0.13),
((SELECT id FROM pack_types WHERE name = 'Pack Standard'), 'epic', 0.02);

-- Insertion des probabilités pour le Pack Premium
INSERT INTO pack_rarity_odds (pack_type_id, rarity, probability) VALUES
((SELECT id FROM pack_types WHERE name = 'Pack Premium'), 'common', 0.3),
((SELECT id FROM pack_types WHERE name = 'Pack Premium'), 'uncommon', 0.4),
((SELECT id FROM pack_types WHERE name = 'Pack Premium'), 'rare', 0.25),
((SELECT id FROM pack_types WHERE name = 'Pack Premium'), 'epic', 0.04),
((SELECT id FROM pack_types WHERE name = 'Pack Premium'), 'legendary', 0.01);

-- Insertion des probabilités pour le Pack Légendaire
INSERT INTO pack_rarity_odds (pack_type_id, rarity, probability) VALUES
((SELECT id FROM pack_types WHERE name = 'Pack Légendaire'), 'uncommon', 0.2),
((SELECT id FROM pack_types WHERE name = 'Pack Légendaire'), 'rare', 0.45),
((SELECT id FROM pack_types WHERE name = 'Pack Légendaire'), 'epic', 0.25),
((SELECT id FROM pack_types WHERE name = 'Pack Légendaire'), 'legendary', 0.1);

-- Mise à jour des packs existants avec leurs probabilités et raretés garanties
UPDATE card_packs
SET rarity_weights = '{
    "common": 70,
    "uncommon": 25,
    "rare": 5,
    "epic": 0,
    "legendary": 0
}'::jsonb,
    guaranteed_rarity = 'common'
WHERE name = 'Pack de Démarrage';

UPDATE card_packs
SET rarity_weights = '{
    "common": 50,
    "uncommon": 35,
    "rare": 13,
    "epic": 2,
    "legendary": 0
}'::jsonb,
    guaranteed_rarity = 'uncommon'
WHERE name = 'Pack Élémentaire';

UPDATE card_packs
SET rarity_weights = '{
    "common": 30,
    "uncommon": 40,
    "rare": 25,
    "epic": 4,
    "legendary": 1
}'::jsonb,
    guaranteed_rarity = 'rare'
WHERE name = 'Pack Premium';

UPDATE card_packs
SET rarity_weights = '{
    "common": 0,
    "uncommon": 20,
    "rare": 45,
    "epic": 25,
    "legendary": 10
}'::jsonb,
    guaranteed_rarity = 'epic'
WHERE name = 'Pack Légendaire'; 