-- Table pour gérer la monnaie des utilisateurs
CREATE TABLE user_currency (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger pour mettre à jour updated_at
CREATE TRIGGER update_user_currency_updated_at
    BEFORE UPDATE ON user_currency
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE user_currency ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Les utilisateurs peuvent voir leur propre solde" ON user_currency
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Seul le système peut modifier les soldes" ON user_currency
    FOR ALL USING (false)
    WITH CHECK (false);

-- Fonction pour obtenir le solde d'un utilisateur
CREATE OR REPLACE FUNCTION get_user_balance(p_user_id UUID)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- Créer l'entrée si elle n'existe pas
    INSERT INTO user_currency (user_id, coins)
    VALUES (p_user_id, 1000)  -- Solde initial de 1000 pièces
    ON CONFLICT (user_id) DO NOTHING;

    -- Retourner le solde
    RETURN (SELECT coins FROM user_currency WHERE user_id = p_user_id);
END;
$$;

-- Fonction pour mettre à jour le solde
CREATE OR REPLACE FUNCTION update_user_balance(
    p_user_id UUID,
    p_amount INTEGER
)
RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Mettre à jour le solde
    UPDATE user_currency
    SET coins = GREATEST(0, coins + p_amount)
    WHERE user_id = p_user_id
    RETURNING coins INTO v_new_balance;

    RETURN v_new_balance;
END;
$$;

-- Supprimer d'abord la fonction existante
DROP FUNCTION IF EXISTS buy_pack(UUID, UUID, INTEGER);

-- Mise à jour de la fonction d'achat de pack
CREATE OR REPLACE FUNCTION buy_pack(
    p_user_id UUID,
    p_pack_id UUID,
    p_quantity INTEGER DEFAULT 1
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pack_price INTEGER;
    v_total_price INTEGER;
    v_current_balance INTEGER;
    v_purchase_id UUID;
    v_new_balance INTEGER;
    v_result JSON;
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        v_result := json_build_object(
            'success', false,
            'message', 'Utilisateur non trouvé',
            'purchase_id', NULL,
            'new_balance', NULL
        );
        RETURN v_result;
    END IF;

    -- Vérifier la quantité
    IF p_quantity <= 0 THEN
        v_result := json_build_object(
            'success', false,
            'message', 'La quantité doit être positive',
            'purchase_id', NULL,
            'new_balance', NULL
        );
        RETURN v_result;
    END IF;

    -- Récupérer le prix du pack
    SELECT price INTO v_pack_price
    FROM card_packs
    WHERE id = p_pack_id;

    IF NOT FOUND THEN
        v_result := json_build_object(
            'success', false,
            'message', 'Pack non trouvé',
            'purchase_id', NULL,
            'new_balance', NULL
        );
        RETURN v_result;
    END IF;

    -- Calculer le prix total
    v_total_price := v_pack_price * p_quantity;

    -- Récupérer le solde actuel
    SELECT coins INTO v_current_balance
    FROM user_currency
    WHERE user_id = p_user_id;

    -- Vérifier le solde
    IF v_current_balance < v_total_price THEN
        v_result := json_build_object(
            'success', false,
            'message', 'Solde insuffisant',
            'purchase_id', NULL,
            'new_balance', v_current_balance
        );
        RETURN v_result;
    END IF;

    -- Débiter le compte
    v_new_balance := update_user_balance(p_user_id, -v_total_price);

    -- Créer l'achat
    INSERT INTO pack_purchases (user_id, pack_id, quantity, total_price)
    VALUES (p_user_id, p_pack_id, p_quantity, v_total_price)
    RETURNING id INTO v_purchase_id;

    -- Retourner le succès
    v_result := json_build_object(
        'success', true,
        'message', 'Achat réussi',
        'purchase_id', v_purchase_id,
        'new_balance', v_new_balance
    );
    RETURN v_result;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_user_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION buy_pack(UUID, UUID, INTEGER) TO authenticated;

-- Mise à jour de la table pack_purchases pour inclure opened_at
ALTER TABLE pack_purchases 
ADD COLUMN IF NOT EXISTS opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL; 