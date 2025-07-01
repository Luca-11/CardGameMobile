-- Script complet pour le système de collection de cartes
-- Appliquer dans l'ordre pour éviter les erreurs

-- 1. Créer la table user_cards
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

-- 2. Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX IF NOT EXISTS idx_user_cards_card_id ON user_cards(card_id);

-- 3. RLS (Row Level Security)
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;

-- 4. Politiques de sécurité
CREATE POLICY "Users can view their own cards" ON user_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cards" ON user_cards
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cards" ON user_cards
    FOR UPDATE USING (auth.uid() = user_id);

-- 5. Fonction pour ajouter une carte à la collection
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

-- 6. Fonction pour récupérer la collection d'un utilisateur
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

-- 7. Mettre à jour la fonction open_pack pour ajouter les cartes à la collection
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);

CREATE OR REPLACE FUNCTION open_pack(
    p_user_id UUID,
    p_pack_id UUID
) RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    image_url TEXT,
    card_type TEXT,
    element TEXT,
    rarity TEXT,
    mana_cost INTEGER,
    attack INTEGER,
    defense INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_cards_per_pack INTEGER;
    v_card_record RECORD;
    v_cards_array UUID[];
    v_card_id UUID;
BEGIN
    -- Récupérer le nombre de cartes par pack
    SELECT cards_per_pack INTO v_cards_per_pack
    FROM packs
    WHERE packs.id = p_pack_id;
    
    -- Marquer le pack comme ouvert
    UPDATE user_packs
    SET opened_at = NOW()
    WHERE user_packs.id = p_pack_id AND user_packs.user_id = p_user_id;
    
    -- Sélectionner les IDs des cartes aléatoirement
    SELECT ARRAY_AGG(card_id) INTO v_cards_array
    FROM (
        SELECT cards.id as card_id
        FROM cards
        WHERE cards.rarity = 'common'
        ORDER BY RANDOM()
        LIMIT v_cards_per_pack
    ) AS random_cards;
    
    -- Retourner chaque carte individuellement et l'ajouter à la collection
    FOREACH v_card_id IN ARRAY v_cards_array
    LOOP
        -- Ajouter la carte à la collection de l'utilisateur
        PERFORM add_card_to_collection(p_user_id, v_card_id, 1);
        
        -- Récupérer les informations de la carte
        SELECT 
            cards.id,
            cards.name,
            cards.description,
            cards.image_url,
            cards.card_type,
            cards.element,
            cards.rarity,
            cards.mana_cost,
            cards.attack,
            cards.defense,
            cards.created_at,
            cards.updated_at
        INTO v_card_record
        FROM cards
        WHERE cards.id = v_card_id;
        
        id := v_card_record.id;
        name := v_card_record.name;
        description := v_card_record.description;
        image_url := v_card_record.image_url;
        card_type := v_card_record.card_type;
        element := v_card_record.element;
        rarity := v_card_record.rarity;
        mana_cost := v_card_record.mana_cost;
        attack := v_card_record.attack;
        defense := v_card_record.defense;
        created_at := v_card_record.created_at;
        updated_at := v_card_record.updated_at;
        
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$;

-- 8. Accorder les permissions
GRANT SELECT, INSERT, UPDATE ON user_cards TO authenticated;
GRANT EXECUTE ON FUNCTION add_card_to_collection(UUID, UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_collection(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO anon;

-- 9. Vérification finale
SELECT 'Système de collection installé avec succès!' as status; 