-- Version alternative de la fonction open_pack
-- Utilise une approche différente pour éviter l'ambiguïté

-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);

-- Créer une version alternative
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
    WHERE id = p_pack_id;
    
    -- Marquer le pack comme ouvert
    UPDATE user_packs
    SET opened_at = NOW()
    WHERE id = p_pack_id AND user_id = p_user_id;
    
    -- Sélectionner les IDs des cartes aléatoirement
    SELECT ARRAY_AGG(card_id) INTO v_cards_array
    FROM (
        SELECT id as card_id
        FROM cards
        WHERE rarity = 'common'
        ORDER BY RANDOM()
        LIMIT v_cards_per_pack
    ) AS random_cards;
    
    -- Retourner chaque carte individuellement
    FOREACH v_card_id IN ARRAY v_cards_array
    LOOP
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
        INTO v_card_record
        FROM cards c
        WHERE c.id = v_card_id;
        
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