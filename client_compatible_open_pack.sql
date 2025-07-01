-- Version compatible client de la fonction open_pack
-- Retourne les noms de colonnes attendus par le client React Native

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);

-- Créer une version compatible client
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
    
    -- Retourner les cartes avec les noms attendus par le client
    RETURN QUERY
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