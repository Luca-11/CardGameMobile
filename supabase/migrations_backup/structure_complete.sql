-- Nettoyage préalable
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TYPE IF EXISTS card_rarity CASCADE;
DROP TYPE IF EXISTS card_type CASCADE;
DROP TYPE IF EXISTS card_element CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;

-- Types énumérés
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE card_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE card_type AS ENUM ('creature', 'spell', 'equipment');
CREATE TYPE card_element AS ENUM ('fire', 'water', 'earth', 'air', 'light', 'dark', 'neutral');

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT NOT NULL UNIQUE,
    email TEXT NOT NULL UNIQUE,
    role user_role NOT NULL DEFAULT 'user',
    coins INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

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

-- Table des decks
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    UNIQUE(user_id, name)
);

-- Table des cartes dans les decks
CREATE TABLE deck_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Contraintes
    CONSTRAINT valid_quantity CHECK (quantity > 0 AND quantity <= 3),
    UNIQUE(deck_id, card_id)
);

-- Table des packs de cartes
CREATE TABLE card_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    cards_per_pack INTEGER NOT NULL DEFAULT 5,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    
    -- Contraintes
    CONSTRAINT valid_price CHECK (price > 0),
    CONSTRAINT valid_cards_per_pack CHECK (cards_per_pack > 0)
);

-- Table des achats de packs
CREATE TABLE pack_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES card_packs(id) ON DELETE CASCADE,
    purchase_date TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    opened BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cards_updated_at
    BEFORE UPDATE ON user_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decks_updated_at
    BEFORE UPDATE ON decks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deck_cards_updated_at
    BEFORE UPDATE ON deck_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_packs_updated_at
    BEFORE UPDATE ON card_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pack_purchases_updated_at
    BEFORE UPDATE ON pack_purchases
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;

-- Politiques RLS

-- Users
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Cards
CREATE POLICY "Cards are viewable by everyone" ON cards
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify cards" ON cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- User Cards
CREATE POLICY "Users can view their own cards" ON user_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own cards" ON user_cards
    FOR ALL USING (auth.uid() = user_id);

-- Decks
CREATE POLICY "Users can view their own decks" ON decks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own decks" ON decks
    FOR ALL USING (auth.uid() = user_id);

-- Deck Cards
CREATE POLICY "Users can view cards in their decks" ON deck_cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM decks
            WHERE decks.id = deck_id
            AND decks.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can manage cards in their decks" ON deck_cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM decks
            WHERE decks.id = deck_id
            AND decks.user_id = auth.uid()
        )
    );

-- Card Packs
CREATE POLICY "Card packs are viewable by everyone" ON card_packs
    FOR SELECT USING (true);

CREATE POLICY "Only admins can modify card packs" ON card_packs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Pack Purchases
CREATE POLICY "Users can view their own purchases" ON pack_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own purchases" ON pack_purchases
    FOR ALL USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX idx_cards_name ON cards(name);
CREATE INDEX idx_cards_rarity ON cards(rarity);
CREATE INDEX idx_cards_type ON cards(card_type);
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_card_id ON deck_cards(card_id);
CREATE INDEX idx_pack_purchases_user_id ON pack_purchases(user_id);
CREATE INDEX idx_pack_purchases_pack_id ON pack_purchases(pack_id);

-- Commentaires
COMMENT ON TABLE users IS 'Table contenant les informations des utilisateurs';
COMMENT ON TABLE cards IS 'Table contenant toutes les cartes disponibles dans le jeu';
COMMENT ON TABLE user_cards IS 'Table contenant les cartes possédées par chaque utilisateur';
COMMENT ON TABLE decks IS 'Table contenant les decks créés par les utilisateurs';
COMMENT ON TABLE deck_cards IS 'Table contenant les cartes dans chaque deck';
COMMENT ON TABLE card_packs IS 'Table contenant les différents types de packs de cartes disponibles';
COMMENT ON TABLE pack_purchases IS 'Table contenant les achats de packs par les utilisateurs'; 