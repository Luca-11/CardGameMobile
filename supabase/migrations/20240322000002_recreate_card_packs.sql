-- Suppression des tables existantes si nécessaire
DROP TABLE IF EXISTS pack_purchases CASCADE;
DROP TABLE IF EXISTS pack_rarity_odds CASCADE;
DROP TABLE IF EXISTS pack_types CASCADE;
DROP TABLE IF EXISTS card_packs CASCADE;
DROP TABLE IF EXISTS packs CASCADE;

-- Table des packs de cartes
CREATE TABLE card_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price > 0),
    cards_per_pack INTEGER NOT NULL DEFAULT 5 CHECK (cards_per_pack > 0),
    image_url TEXT,
    rarity_weights JSONB NOT NULL DEFAULT '{
        "common": 70,
        "uncommon": 20,
        "rare": 7,
        "epic": 2.5,
        "legendary": 0.5
    }'::jsonb,
    guaranteed_rarity card_rarity NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger pour updated_at
CREATE TRIGGER update_card_packs_updated_at
    BEFORE UPDATE ON card_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE card_packs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Card packs are viewable by everyone" ON card_packs
    FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify card packs" ON card_packs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'::text
        )
    );

-- Insertion des packs de base
INSERT INTO card_packs (name, description, price, cards_per_pack, rarity_weights, guaranteed_rarity) VALUES
    ('Pack de Démarrage', 'Un pack parfait pour débuter, contenant principalement des cartes communes et peu communes.', 100, 5, 
    '{
        "common": 70,
        "uncommon": 25,
        "rare": 5,
        "epic": 0,
        "legendary": 0
    }'::jsonb, 'common'),
    
    ('Pack Élémentaire', 'Contient des cartes élémentaires puissantes avec une chance accrue d''obtenir des cartes rares.', 200, 5,
    '{
        "common": 50,
        "uncommon": 35,
        "rare": 13,
        "epic": 2,
        "legendary": 0
    }'::jsonb, 'uncommon'),
    
    ('Pack Premium', 'Garantit au moins une carte rare ou mieux.', 500, 5,
    '{
        "common": 30,
        "uncommon": 40,
        "rare": 25,
        "epic": 4,
        "legendary": 1
    }'::jsonb, 'rare'),
    
    ('Pack Légendaire', 'Garantit au moins une carte épique et une chance accrue d''obtenir une carte légendaire.', 1000, 5,
    '{
        "common": 0,
        "uncommon": 20,
        "rare": 45,
        "epic": 25,
        "legendary": 10
    }'::jsonb, 'epic'); 