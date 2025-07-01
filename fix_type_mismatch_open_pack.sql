-- Correction des types de données pour la fonction open_pack
-- Résout le conflit entre VARCHAR et TEXT

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);

-- Créer une version avec les bons types
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
BEGIN
    -- Récupérer le nombre de cartes par pack
    SELECT cards_per_pack INTO v_cards_per_pack
    FROM packs
    WHERE id = p_pack_id;
    
    -- Marquer le pack comme ouvert
    UPDATE user_packs
    SET opened_at = NOW()
    WHERE id = p_pack_id AND user_id = p_user_id;
    
    -- Retourner les cartes avec conversion explicite des types
    RETURN QUERY
    SELECT 
        cards.id::UUID,
        cards.name::TEXT,
        cards.description::TEXT,
        cards.image_url::TEXT,
        cards.card_type::TEXT,
        cards.element::TEXT,
        cards.rarity::TEXT,
        cards.mana_cost::INTEGER,
        cards.attack::INTEGER,
        cards.defense::INTEGER,
        cards.created_at::TIMESTAMPTZ,
        cards.updated_at::TIMESTAMPTZ
    FROM cards
    WHERE cards.rarity = 'common'
    ORDER BY RANDOM()
    LIMIT v_cards_per_pack;
END;
$$;

-- Accorder les permissions
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO anon;

-- Vérifier que la fonction est créée
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'open_pack'
AND n.nspname = 'public'; 