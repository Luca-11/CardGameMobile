-- Afficher les types énumérés personnalisés
SELECT 
    t.typname AS "Nom du Type",
    e.enumlabel AS "Valeurs Possibles"
FROM pg_type t 
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE t.typname = 'card_rarity'
ORDER BY t.typname, e.enumsortorder;

-- Afficher la structure détaillée de toutes les tables
SELECT 
    c.table_schema,
    c.table_name,
    c.column_name,
    c.data_type,
    c.column_default,
    c.is_nullable,
    c.character_maximum_length,
    pgd.description as "Description"
FROM information_schema.columns c
LEFT JOIN pg_description pgd ON 
    pgd.objoid = (quote_ident(c.table_schema)||'.'||quote_ident(c.table_name))::regclass AND 
    pgd.objsubid = c.ordinal_position
WHERE c.table_schema = 'public'
    AND c.table_name IN ('card_packs', 'pack_types', 'pack_rarity_odds', 'pack_purchases')
ORDER BY c.table_name, c.ordinal_position;

-- Afficher les contraintes (clés primaires, étrangères, etc.)
SELECT 
    tc.table_schema, 
    tc.table_name, 
    tc.constraint_name,
    tc.constraint_type,
    kcu.column_name,
    CASE 
        WHEN tc.constraint_type = 'FOREIGN KEY' THEN
            ccu.table_name || '(' || ccu.column_name || ')'
        ELSE NULL
    END as "Referenced Table(Column)"
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
LEFT JOIN information_schema.constraint_column_usage ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.table_schema = 'public'
    AND tc.table_name IN ('card_packs', 'pack_types', 'pack_rarity_odds', 'pack_purchases')
ORDER BY tc.table_name, tc.constraint_type;

-- Afficher les politiques RLS
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
    AND tablename IN ('card_packs', 'pack_types', 'pack_rarity_odds', 'pack_purchases')
ORDER BY tablename, policyname;

-- Afficher les index
SELECT
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('card_packs', 'pack_types', 'pack_rarity_odds', 'pack_purchases')
ORDER BY tablename, indexname;

-- Afficher les triggers
SELECT 
    event_object_schema as table_schema,
    event_object_table as table_name,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_schema = 'public'
    AND event_object_table IN ('card_packs', 'pack_types', 'pack_rarity_odds', 'pack_purchases')
ORDER BY table_name, trigger_name; 