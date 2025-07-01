-- Script de diagnostic pour la fonction open_pack
-- Vérifie l'état actuel et identifie le problème

-- ========================================
-- ÉTAPE 1: Vérifier les fonctions existantes
-- ========================================

-- Lister toutes les fonctions open_pack existantes
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
-- ÉTAPE 2: Vérifier les tables impliquées
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
    c.id as card_id,
    c.name as card_name,
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
-- ÉTAPE 4: Vérifier les données de test
-- ========================================

-- Vérifier s'il y a des cartes dans la base
SELECT COUNT(*) as total_cards FROM cards;

-- Vérifier les rarités disponibles
SELECT rarity, COUNT(*) as count
FROM cards
GROUP BY rarity
ORDER BY count DESC;

-- Vérifier les packs disponibles
SELECT id, name, price, cards_per_pack, rarity_weights
FROM packs
WHERE is_active = true; 