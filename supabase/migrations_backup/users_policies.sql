-- Activer RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Supprimer les politiques existantes si elles existent
DROP POLICY IF EXISTS "Users can create their own profile" ON users;
DROP POLICY IF EXISTS "Users can read their own profile" ON users;
DROP POLICY IF EXISTS "Users can update their own profile" ON users;
DROP POLICY IF EXISTS "Public read access to basic user info" ON users;
DROP POLICY IF EXISTS "Admins have full access" ON users;

-- Politique pour la création d'utilisateur
CREATE POLICY "Enable insert for authenticated users only" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Politique pour la lecture d'utilisateur
CREATE POLICY "Enable read access for authenticated users" ON users
  FOR SELECT
  USING (true);

-- Politique pour la mise à jour d'utilisateur
CREATE POLICY "Enable update for users based on id" ON users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Politique pour les administrateurs
CREATE POLICY "Enable full access for admin users" ON users
  USING (
    auth.jwt()->>'role' = 'admin'
    OR
    auth.uid() = id
  )
  WITH CHECK (
    auth.jwt()->>'role' = 'admin'
    OR
    auth.uid() = id
  ); 