-- =====================================================
-- CRÉATION DE LA TABLE USERS DANS LE SCHÉMA PUBLIC
-- =====================================================
-- Cette table fait le lien entre auth.users et vos données métier
-- =====================================================

-- Création de la table users dans le schéma public
CREATE TABLE IF NOT EXISTS users (
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

-- Fonction pour créer automatiquement un profil utilisateur
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO users (id, email, username, coins)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
        1000
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil lors de l'inscription
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- =====================================================
-- FIN DU SCRIPT
-- ===================================================== 