-- Script de débogage pour analyser le problème open_pack
-- Identifie exactement ce qui cause l'ambiguïté

-- ========================================
-- ÉTAPE 1: Analyser l'état actuel
-- ========================================

-- Vérifier s'il y a des fonctions open_pack
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'open_pack'
AND n.nspname = 'public';

-- ========================================
-- ÉTAPE 2: Analyser les tables impliquées
-- ========================================

-- Vérifier la structure de la table cards
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'cards'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier la structure de la table user_packs
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'user_packs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- Vérifier la structure de la table packs
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'packs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- ÉTAPE 3: Tester une requête simple
-- ========================================

-- Tester une requête simple pour voir où est l'ambiguïté
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
LIMIT 5;

-- ========================================
-- ÉTAPE 4: Vérifier les données
-- ========================================

-- Vérifier s'il y a des cartes
SELECT COUNT(*) as total_cards FROM cards;

-- Vérifier les rarités
SELECT rarity, COUNT(*) as count
FROM cards
GROUP BY rarity
ORDER BY count DESC;

-- Vérifier les packs
SELECT id, name, price, cards_per_pack
FROM packs
WHERE is_active = true;

-- ========================================
-- ÉTAPE 5: Tester une fonction simple
-- ========================================

-- Créer une fonction de test ultra-simple
CREATE OR REPLACE FUNCTION test_open_pack() 
RETURNS TABLE (
    test_id UUID,
    test_name TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cards.id as test_id,
        cards.name as test_name
    FROM cards
    WHERE cards.rarity = 'common'
    LIMIT 1;
END;
$$;

-- Tester la fonction
SELECT * FROM test_open_pack();

-- Nettoyer
DROP FUNCTION IF EXISTS test_open_pack(); 