-- Script final corrigé pour Supabase avec les bons types de timestamp
-- À exécuter dans l'éditeur SQL de Supabase Dashboard

-- 1. Supprimer l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS get_user_collection(UUID);

-- 2. Créer la fonction avec les types corrects pour Supabase
CREATE OR REPLACE FUNCTION get_user_collection(p_user_id UUID)
RETURNS TABLE (
    card_id UUID,
    card_name TEXT,
    card_description TEXT,
    card_image_url TEXT,
    card_rarity TEXT,
    card_cost INTEGER,
    card_attack INTEGER,
    card_defense INTEGER,
    quantity BIGINT,
    card_created_at TIMESTAMPTZ,
    card_updated_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.name::TEXT,
        c.description,
        c.image_url,
        c.rarity::TEXT,
        c.cost,
        c.attack,
        c.defense,
        COUNT(uc.id),
        c.created_at,
        c.updated_at
    FROM user_cards uc
    JOIN cards c ON uc.card_id = c.id
    WHERE uc.user_id = p_user_id
    GROUP BY c.id, c.name, c.description, c.image_url, c.rarity, c.cost, c.attack, c.defense, c.created_at, c.updated_at
    ORDER BY c.rarity, c.name;
END;
$$;

-- 3. Accorder les permissions
GRANT EXECUTE ON FUNCTION get_user_collection(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_collection(UUID) TO anon;

-- 4. Vérification
SELECT 'Fonction get_user_collection corrigée pour Supabase avec TIMESTAMPTZ!' as status; 