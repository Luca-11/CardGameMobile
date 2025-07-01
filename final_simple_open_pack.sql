-- Version finale ultra-simple de la fonction open_pack
-- Évite TOUS les conflits de colonnes

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);

-- Créer une version finale ultra-simple
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
    
    -- Retourner les cartes avec des alias uniques
    RETURN QUERY
    SELECT 
        c.id,
        c.name,
        c.description,
        c.image_url,
        c.card_type,
        c.element,
        c.rarity,
        c.mana_cost,
        c.attack,
        c.defense,
        c.created_at,
        c.updated_at
    FROM cards c
    WHERE c.rarity = 'common'
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
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'open_pack'
AND n.nspname = 'public'; 