-- Fonction pour ajouter des pièces au solde d'un utilisateur
CREATE OR REPLACE FUNCTION add_coins(
    p_user_id UUID,
    p_amount INTEGER
) RETURNS INTEGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_new_balance INTEGER;
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'Utilisateur non trouvé';
    END IF;

    -- Vérifier que le montant est positif
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'Le montant doit être positif';
    END IF;

    -- Mettre à jour le solde
    UPDATE user_currency
    SET coins = coins + p_amount
    WHERE user_id = p_user_id
    RETURNING coins INTO v_new_balance;

    -- Si l'utilisateur n'a pas encore de solde, créer une entrée
    IF NOT FOUND THEN
        INSERT INTO user_currency (user_id, coins)
        VALUES (p_user_id, p_amount)
        RETURNING coins INTO v_new_balance;
    END IF;

    RETURN v_new_balance;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION add_coins(UUID, INTEGER) TO authenticated; 