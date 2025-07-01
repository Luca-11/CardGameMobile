-- Suppression des politiques existantes
DROP POLICY IF EXISTS "Cards are viewable by everyone" ON cards;
DROP POLICY IF EXISTS "Only admins can modify cards" ON cards;
DROP POLICY IF EXISTS "Users can view their own cards" ON user_cards;
DROP POLICY IF EXISTS "Users can manage their own cards" ON user_cards;

-- Suppression des types existants
DROP TYPE IF EXISTS card_rarity CASCADE;
DROP TYPE IF EXISTS card_type CASCADE;
DROP TYPE IF EXISTS card_element CASCADE;

-- Suppression de la fonction si elle existe
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Suppression des tables existantes
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS cards CASCADE;

-- Création des types énumérés
CREATE TYPE card_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE card_type AS ENUM ('creature', 'spell', 'equipment');
CREATE TYPE card_element AS ENUM ('fire', 'water', 'earth', 'air', 'light', 'dark', 'neutral');

-- Table des cartes
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url TEXT,
    card_type card_type NOT NULL,
    element card_element NOT NULL DEFAULT 'neutral',
    rarity card_rarity NOT NULL DEFAULT 'common',
    mana_cost INTEGER NOT NULL DEFAULT 0,
    attack INTEGER,
    defense INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Contraintes
    CONSTRAINT valid_mana_cost CHECK (mana_cost >= 0),
    CONSTRAINT valid_attack CHECK (attack IS NULL OR attack >= 0),
    CONSTRAINT valid_defense CHECK (defense IS NULL OR defense >= 0),
    CONSTRAINT creature_stats CHECK (
        (card_type = 'creature' AND attack IS NOT NULL AND defense IS NOT NULL) OR
        (card_type != 'creature' AND attack IS NULL AND defense IS NULL)
    )
);

-- Table des cartes des utilisateurs
CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Contraintes
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    UNIQUE(user_id, card_id)
);

-- Trigger pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cards_updated_at
    BEFORE UPDATE ON user_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- Politiques pour cards
CREATE POLICY "Cards are viewable by everyone" ON cards
    FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify cards" ON cards
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Politiques pour user_cards
CREATE POLICY "Users can view their own cards" ON user_cards
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cards" ON user_cards
    FOR ALL
    USING (auth.uid() = user_id);

-- Index pour améliorer les performances
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_type ON cards(card_type);
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);

-- Commentaires
COMMENT ON TABLE cards IS 'Table contenant toutes les cartes disponibles dans le jeu';
COMMENT ON TABLE user_cards IS 'Table contenant les cartes possédées par chaque utilisateur'; 