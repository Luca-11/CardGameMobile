-- Version ultra-simple de la fonction open_pack
-- Évite complètement l'ambiguïté sur les colonnes

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);

-- Créer une version ultra-simple
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
    v_pack_record RECORD;
    v_cards_per_pack INTEGER;
    v_rarity_weights JSONB;
    v_guaranteed_rarity TEXT;
    v_selected_cards UUID[];
    v_card_record RECORD;
BEGIN
    -- Récupérer les informations du pack
    SELECT 
        pack.cards_per_pack,
        pack.rarity_weights,
        pack.guaranteed_rarity
    INTO v_pack_record
    FROM packs pack
    WHERE pack.id = p_pack_id;
    
    v_cards_per_pack := v_pack_record.cards_per_pack;
    v_rarity_weights := v_pack_record.rarity_weights;
    v_guaranteed_rarity := v_pack_record.guaranteed_rarity;
    
    -- Marquer le pack comme ouvert
    UPDATE user_packs up
    SET opened_at = NOW()
    WHERE up.id = p_pack_id AND up.user_id = p_user_id;
    
    -- Sélectionner les cartes avec des alias explicites
    WITH selected_cards AS (
        SELECT 
            card.id as card_id,
            card.name as card_name,
            card.description as card_description,
            card.image_url as card_image_url,
            card.card_type as card_type,
            card.element as card_element,
            card.rarity as card_rarity,
            card.mana_cost as card_mana_cost,
            card.attack as card_attack,
            card.defense as card_defense,
            card.created_at as card_created_at,
            card.updated_at as card_updated_at
        FROM cards card
        WHERE card.rarity = 'common'
        ORDER BY RANDOM()
        LIMIT v_cards_per_pack
    )
    SELECT 
        card_id,
        card_name,
        card_description,
        card_image_url,
        card_type,
        card_element,
        card_rarity,
        card_mana_cost,
        card_attack,
        card_defense,
        card_created_at,
        card_updated_at
    FROM selected_cards;
    
    RETURN;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO anon;

-- Vérifier que la fonction est créée
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'open_pack'
AND n.nspname = 'public'; 