-- Version NUCLÉAIRE de la fonction open_pack
-- Supprime TOUT et recrée une version ultra-simple

-- ========================================
-- ÉTAPE 1: Supprimer TOUTES les versions
-- ========================================

-- Supprimer toutes les fonctions open_pack existantes
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);
DROP FUNCTION IF EXISTS open_pack(UUID, UUID, INTEGER);
DROP FUNCTION IF EXISTS open_pack(UUID, UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS open_pack(UUID, UUID, INTEGER, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS open_pack(UUID, UUID, TEXT);
DROP FUNCTION IF EXISTS open_pack(UUID, UUID, TEXT, INTEGER);

-- Supprimer avec CASCADE pour être sûr
DROP FUNCTION IF EXISTS open_pack(UUID, UUID) CASCADE;

-- ========================================
-- ÉTAPE 2: Vérifier qu'elles sont supprimées
-- ========================================

-- Vérifier qu'aucune fonction open_pack n'existe plus
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'open_pack'
AND n.nspname = 'public';

-- ========================================
-- ÉTAPE 3: Créer une version ultra-simple
-- ========================================

CREATE OR REPLACE FUNCTION open_pack(
    p_user_id UUID,
    p_pack_id UUID
) RETURNS TABLE (
    card_id UUID,
    card_name TEXT,
    card_description TEXT,
    card_image_url TEXT,
    card_type_value TEXT,
    card_element_value TEXT,
    card_rarity_value TEXT,
    card_mana_cost_value INTEGER,
    card_attack_value INTEGER,
    card_defense_value INTEGER,
    card_created_at_value TIMESTAMPTZ,
    card_updated_at_value TIMESTAMPTZ
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
    
    -- Retourner les cartes avec des noms UNIQUES
    RETURN QUERY
    SELECT 
        cards.id as card_id,
        cards.name as card_name,
        cards.description as card_description,
        cards.image_url as card_image_url,
        cards.card_type as card_type_value,
        cards.element as card_element_value,
        cards.rarity as card_rarity_value,
        cards.mana_cost as card_mana_cost_value,
        cards.attack as card_attack_value,
        cards.defense as card_defense_value,
        cards.created_at as card_created_at_value,
        cards.updated_at as card_updated_at_value
    FROM cards
    WHERE cards.rarity = 'common'
    ORDER BY RANDOM()
    LIMIT v_cards_per_pack;
END;
$$;

-- ========================================
-- ÉTAPE 4: Accorder les permissions
-- ========================================

GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO anon;

-- ========================================
-- ÉTAPE 5: Vérifier que la fonction est créée
-- ========================================

SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'open_pack'
AND n.nspname = 'public'; 