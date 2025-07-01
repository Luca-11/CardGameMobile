-- Création des types énumérés
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE card_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
CREATE TYPE card_type AS ENUM ('creature', 'spell', 'equipment');
CREATE TYPE card_element AS ENUM ('fire', 'water', 'earth', 'air', 'light', 'dark', 'neutral');

-- Fonction pour mettre à jour la colonne updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Table des utilisateurs
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    role user_role NOT NULL DEFAULT 'user',
    username TEXT UNIQUE NOT NULL,
    coins INTEGER NOT NULL DEFAULT 1000,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des cartes
CREATE TABLE cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    rarity card_rarity NOT NULL DEFAULT 'common',
    type card_type NOT NULL,
    element card_element NOT NULL DEFAULT 'neutral',
    attack INTEGER,
    defense INTEGER,
    mana_cost INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_creature_stats CHECK (
        (type = 'creature' AND attack IS NOT NULL AND defense IS NOT NULL) OR
        (type != 'creature' AND attack IS NULL AND defense IS NULL)
    )
);

-- Table des cartes possédées par les utilisateurs
CREATE TABLE user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(user_id, card_id)
);

-- Table des decks
CREATE TABLE decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des cartes dans les decks
CREATE TABLE deck_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES decks(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(deck_id, card_id),
    CONSTRAINT valid_quantity CHECK (quantity > 0 AND quantity <= 3)
);

-- Table des packs de cartes
CREATE TABLE card_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price INTEGER NOT NULL,
    cards_per_pack INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_price CHECK (price > 0),
    CONSTRAINT valid_cards_per_pack CHECK (cards_per_pack > 0)
);

-- Table des achats de packs
CREATE TABLE pack_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES card_packs(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    total_price INTEGER NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT valid_quantity CHECK (quantity > 0),
    CONSTRAINT valid_total_price CHECK (total_price > 0)
);

-- Création des triggers pour updated_at
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

-- Activation de RLS pour toutes les tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour users
CREATE POLICY "Users can view all users" ON users
    FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

-- Politiques RLS pour cards
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

-- Politiques RLS pour user_cards
CREATE POLICY "Users can view their own cards" ON user_cards
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own cards" ON user_cards
    FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour decks
CREATE POLICY "Users can view their own decks" ON decks
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own decks" ON decks
    FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour deck_cards
CREATE POLICY "Users can view cards in their decks" ON deck_cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM decks
            WHERE decks.id = deck_cards.deck_id
            AND decks.user_id = auth.uid()
        )
    );
CREATE POLICY "Users can manage cards in their decks" ON deck_cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM decks
            WHERE decks.id = deck_cards.deck_id
            AND decks.user_id = auth.uid()
        )
    );

-- Politiques RLS pour card_packs
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

-- Politiques RLS pour pack_purchases
CREATE POLICY "Users can view their own purchases" ON pack_purchases
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own purchases" ON pack_purchases
    FOR ALL USING (auth.uid() = user_id); 