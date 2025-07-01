-- Correction des types de données dans la table cards
-- Évite les conflits entre VARCHAR et TEXT

-- ========================================
-- ÉTAPE 1: Vérifier les types actuels
-- ========================================

-- Vérifier la structure actuelle de la table cards
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cards'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- ÉTAPE 2: Corriger les types si nécessaire
-- ========================================

-- Convertir VARCHAR en TEXT pour éviter les conflits
ALTER TABLE cards 
ALTER COLUMN name TYPE TEXT,
ALTER COLUMN description TYPE TEXT,
ALTER COLUMN image_url TYPE TEXT,
ALTER COLUMN card_type TYPE TEXT,
ALTER COLUMN element TYPE TEXT,
ALTER COLUMN rarity TYPE TEXT;

-- ========================================
-- ÉTAPE 3: Vérifier les types après correction
-- ========================================

-- Vérifier la structure après correction
SELECT 
    column_name, 
    data_type, 
    character_maximum_length,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'cards'
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ========================================
-- ÉTAPE 4: Tester une requête simple
-- ========================================

-- Tester une requête simple pour vérifier que tout fonctionne
SELECT 
    id,
    name,
    description,
    image_url,
    card_type,
    element,
    rarity,
    mana_cost,
    attack,
    defense,
    created_at,
    updated_at
FROM cards
WHERE rarity = 'common'
LIMIT 5; 