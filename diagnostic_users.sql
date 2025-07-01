-- =====================================================
-- SCRIPT DE DIAGNOSTIC - TABLE USERS
-- =====================================================

-- 1. Vérifier si la table users existe
SELECT 
    'Table users existe' as check_name,
    EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
    ) as result;

-- 2. Compter les utilisateurs dans chaque table
SELECT 'auth.users' as table_name, COUNT(*) as user_count FROM auth.users
UNION ALL
SELECT 'public.users' as table_name, COUNT(*) as user_count FROM users;

-- 3. Vérifier les politiques RLS sur la table users
SELECT 
    'Politiques RLS' as check_name,
    COUNT(*) as policy_count
FROM pg_policies 
WHERE tablename = 'users';

-- 4. Lister les utilisateurs dans auth.users
SELECT 
    'Utilisateurs auth.users' as check_name,
    id,
    email,
    raw_user_meta_data
FROM auth.users;

-- 5. Lister les utilisateurs dans public.users (si la table existe)
SELECT 
    'Utilisateurs public.users' as check_name,
    id,
    email,
    username,
    coins
FROM users;

-- 6. Vérifier les triggers sur auth.users
SELECT 
    'Triggers auth.users' as check_name,
    trigger_name,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
AND event_object_schema = 'auth';

-- 7. Tester l'accès à la table users avec l'utilisateur actuel
DO $$
DECLARE
    current_user_id UUID;
    user_count INTEGER;
BEGIN
    -- Récupérer l'ID de l'utilisateur actuel
    SELECT auth.uid() INTO current_user_id;
    
    IF current_user_id IS NOT NULL THEN
        -- Tester la sélection
        SELECT COUNT(*) INTO user_count FROM users WHERE id = current_user_id;
        RAISE NOTICE 'Accès à la table users: OK, % utilisateur(s) trouvé(s) pour l''utilisateur actuel', user_count;
    ELSE
        RAISE NOTICE 'Aucun utilisateur connecté';
    END IF;
    
    -- Tester l'insertion (devrait échouer à cause des politiques RLS)
    BEGIN
        INSERT INTO users (id, email, username, coins) 
        VALUES (gen_random_uuid(), 'test@test.com', 'test', 1000);
        RAISE NOTICE 'Insertion test: SUCCÈS (problème de sécurité!)';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Insertion test: ÉCHEC (normal, RLS fonctionne) - %', SQLERRM;
    END;
END $$;

-- =====================================================
-- FIN DU DIAGNOSTIC
-- ===================================================== 