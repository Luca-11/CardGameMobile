-- Création de la table user_balances
CREATE TABLE IF NOT EXISTS user_balances (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 1000 CHECK (balance >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger pour updated_at
CREATE TRIGGER update_user_balances_updated_at
    BEFORE UPDATE ON user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE user_balances ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own balance"
    ON user_balances
    FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Only the system can modify balances"
    ON user_balances
    FOR ALL
    USING (false)
    WITH CHECK (false);

-- Fonction pour initialiser le solde d'un nouvel utilisateur
CREATE OR REPLACE FUNCTION initialize_user_balance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO user_balances (user_id, balance)
    VALUES (NEW.id, 1000)
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$;

-- Trigger pour initialiser le solde lors de la création d'un utilisateur
DROP TRIGGER IF EXISTS initialize_user_balance_trigger ON auth.users;
CREATE TRIGGER initialize_user_balance_trigger
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION initialize_user_balance();

-- Initialiser les soldes pour les utilisateurs existants
INSERT INTO user_balances (user_id, balance)
SELECT id, 1000
FROM auth.users
ON CONFLICT (user_id) DO NOTHING; 