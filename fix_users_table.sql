-- =====================================================
-- SCRIPT DE CORRECTION DE LA TABLE USERS
-- =====================================================

-- 1. Vérifier si la table users existe
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') THEN
        -- Créer la table users si elle n'existe pas
        CREATE TABLE users (
            id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
            email TEXT NOT NULL,
            username VARCHAR(50) UNIQUE,
            coins INTEGER DEFAULT 1000 CHECK (coins >= 0),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
        );

        -- Trigger pour updated_at
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON users
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column();

        -- Activation de RLS
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;

        -- Politiques RLS pour la table users
        CREATE POLICY "Les utilisateurs peuvent voir leur propre profil" ON users
            FOR SELECT USING (auth.uid() = id);

        CREATE POLICY "Les utilisateurs peuvent modifier leur propre profil" ON users
            FOR UPDATE USING (auth.uid() = id);

        CREATE POLICY "Les utilisateurs peuvent créer leur profil" ON users
            FOR INSERT WITH CHECK (auth.uid() = id);

        -- Index pour les performances
        CREATE INDEX idx_users_email ON users(email);
        CREATE INDEX idx_users_username ON users(username);

        RAISE NOTICE 'Table users créée avec succès';
    ELSE
        RAISE NOTICE 'Table users existe déjà';
    END IF;
END $$;

-- 2. Insérer les utilisateurs existants qui ne sont pas dans la table users
INSERT INTO users (id, email, username, coins)
SELECT 
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'username', split_part(au.email, '@', 1)) as username,
    1000 as coins
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM users)
ON CONFLICT (id) DO NOTHING;

-- 3. Créer ou recréer le trigger pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, username, coins)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        1000
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger existant s'il existe
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Créer le nouveau trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- 4. Afficher le nombre d'utilisateurs dans chaque table
SELECT 
    'auth.users' as table_name,
    COUNT(*) as user_count
FROM auth.users
UNION ALL
SELECT 
    'public.users' as table_name,
    COUNT(*) as user_count
FROM users;

-- =====================================================
-- FIN DU SCRIPT
-- ===================================================== 