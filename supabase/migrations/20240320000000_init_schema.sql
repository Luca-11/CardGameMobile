-- Suppression des tables existantes si nécessaire
DROP TABLE IF EXISTS pack_purchases CASCADE;
DROP TABLE IF EXISTS pack_rarity_odds CASCADE;
DROP TABLE IF EXISTS pack_types CASCADE;
DROP TABLE IF EXISTS card_packs CASCADE;
DROP TABLE IF EXISTS deck_cards CASCADE;
DROP TABLE IF EXISTS decks CASCADE;
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS cards CASCADE;

-- Création des types énumérés
DO $$ BEGIN
    CREATE TYPE card_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
    CREATE TYPE card_type AS ENUM ('creature', 'spell', 'equipment');
    CREATE TYPE card_element AS ENUM ('fire', 'water', 'earth', 'air', 'light', 'dark', 'neutral');
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Table des cartes
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url TEXT,
    card_type card_type NOT NULL,
    element card_element NOT NULL,
    rarity card_rarity NOT NULL,
    mana_cost INTEGER NOT NULL CHECK (mana_cost >= 0),
    attack INTEGER CHECK (attack >= 0),
    defense INTEGER CHECK (defense >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des cartes des utilisateurs
CREATE TABLE IF NOT EXISTS user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, card_id)
);

-- Table des decks
CREATE TABLE IF NOT EXISTS decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Table des cartes dans les decks
CREATE TABLE IF NOT EXISTS deck_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(deck_id, card_id)
);

-- Table des packs de cartes
CREATE TABLE IF NOT EXISTS card_packs (
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

-- Table des achats de packs
CREATE TABLE IF NOT EXISTS pack_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES card_packs(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price INTEGER NOT NULL CHECK (total_price > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Triggers pour updated_at
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

-- Activation de RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;

-- Index pour les performances
CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_card_id ON deck_cards(card_id);
CREATE INDEX idx_pack_purchases_user_id ON pack_purchases(user_id);
CREATE INDEX idx_pack_purchases_pack_id ON pack_purchases(pack_id); 