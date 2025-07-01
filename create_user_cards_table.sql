-- Table pour stocker les cartes possédées par chaque utilisateur
CREATE TABLE IF NOT EXISTS user_cards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    card_id UUID NOT NULL REFERENCES cards(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Contrainte unique pour éviter les doublons
    UNIQUE(user_id, card_id)
);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON user_cards(card_id);

-- RLS (Row Level Security)
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- Politique : un utilisateur ne peut voir que ses propres cartes
CREATE POLICY "Users can view their own cards" ON user_cards
    FOR SELECT USING (auth.uid() = user_id);

-- Politique : un utilisateur ne peut insérer que ses propres cartes
CREATE POLICY "Users can insert their own cards" ON user_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique : un utilisateur ne peut modifier que ses propres cartes
CREATE POLICY "Users can update their own cards" ON user_cards
    FOR UPDATE USING (auth.uid() = user_id);

-- Fonction pour ajouter une carte à la collection d'un utilisateur
CREATE OR REPLACE FUNCTION add_card_to_collection(
    p_user_id UUID,
    p_card_id UUID,
    p_quantity INTEGER DEFAULT 1
) RETURNS BOOLEAN LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    INSERT INTO user_cards (user_id, card_id, quantity)
    VALUES (p_user_id, p_card_id, p_quantity)
    ON CONFLICT (user_id, card_id)
    DO UPDATE SET 
        quantity = user_cards.quantity + p_quantity,
        updated_at = NOW();
    
    RETURN TRUE;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
END;
$$;

-- Fonction pour récupérer la collection d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_collection(p_user_id UUID)
RETURNS TABLE (
    card_id UUID,
    card_name TEXT,
    card_description TEXT,
    card_image_url TEXT,
    card_type TEXT,
    card_element TEXT,
    card_rarity TEXT,
    card_mana_cost INTEGER,
    card_attack INTEGER,
    card_defense INTEGER,
    quantity INTEGER,
    card_created_at TIMESTAMPTZ,
    card_updated_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id as card_id,
        c.name as card_name,
        c.description as card_description,
        c.image_url as card_image_url,
        c.card_type as card_type,
        c.element as card_element,
        c.rarity as card_rarity,
        c.mana_cost as card_mana_cost,
        c.attack as card_attack,
        c.defense as card_defense,
        uc.quantity,
        c.created_at as card_created_at,
        c.updated_at as card_updated_at
    FROM user_cards uc
    JOIN cards c ON uc.card_id = c.id
    WHERE uc.user_id = p_user_id
    ORDER BY c.rarity, c.name;
END;
$$;

-- Accorder les permissions
GRANT SELECT, INSERT, UPDATE ON user_cards TO authenticated;
GRANT EXECUTE ON FUNCTION add_card_to_collection(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_collection(UUID) TO authenticated; 