-- Diagnostic complet de la base de données
-- Vérifier l'état actuel des fonctions et tables

-- 1. Vérifier toutes les fonctions open_pack existantes
SELECT 
    p.proname as function_name,
    pg_get_function_arguments(p.oid) as arguments,
    pg_get_function_result(p.oid) as return_type,
    p.prosrc as source_code
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE p.proname = 'open_pack'
AND n.nspname = 'public'
ORDER BY p.oid;

-- 2. Vérifier la structure de la table cards
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cards'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 3. Vérifier la structure de la table packs
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'packs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 4. Vérifier la structure de la table user_packs
SELECT 
    column_name,
    data_type,
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'user_packs'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- 5. Vérifier les permissions sur les tables
SELECT 
    table_name,
    privilege_type
FROM information_schema.table_privileges
WHERE table_schema = 'public'
AND table_name IN ('cards', 'packs', 'user_packs')
ORDER BY table_name, privilege_type;

-- 6. Vérifier les permissions sur les fonctions
SELECT 
    routine_name,
    privilege_type
FROM information_schema.routine_privileges
WHERE routine_schema = 'public'
AND routine_name = 'open_pack'
ORDER BY privilege_type;

-- 7. Test simple de la table cards
SELECT COUNT(*) as total_cards FROM cards;
SELECT DISTINCT rarity FROM cards;

-- 8. Test simple de la table packs
SELECT COUNT(*) as total_packs FROM packs;
SELECT DISTINCT cards_per_pack FROM packs;

-- 9. Test simple de la table user_packs
SELECT COUNT(*) as total_user_packs FROM user_packs; 