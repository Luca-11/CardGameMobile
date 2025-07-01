-- Suppression de l'ancienne fonction si elle existe
DROP FUNCTION IF EXISTS buy_pack;

-- Création de la nouvelle fonction
CREATE OR REPLACE FUNCTION buy_pack(
    p_user_id UUID,
    p_pack_id UUID
) RETURNS TABLE (
    success BOOLEAN,
    message TEXT,
    purchase_id UUID,
    new_balance INTEGER
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_pack_price INTEGER;
    v_user_balance INTEGER;
    v_purchase_id UUID;
BEGIN
    -- Vérifier si le pack existe et récupérer son prix
    SELECT price INTO v_pack_price
    FROM card_packs
    WHERE id = p_pack_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            FALSE,
            'Pack non trouvé'::TEXT,
            NULL::UUID,
            NULL::INTEGER;
        RETURN;
    END IF;

    -- Vérifier le solde de l'utilisateur
    SELECT balance INTO v_user_balance
    FROM user_balances
    WHERE user_id = p_user_id;

    IF NOT FOUND THEN
        RETURN QUERY SELECT 
            FALSE,
            'Solde utilisateur non trouvé'::TEXT,
            NULL::UUID,
            NULL::INTEGER;
        RETURN;
    END IF;

    -- Vérifier si l'utilisateur a assez d'argent
    IF v_user_balance < v_pack_price THEN
        RETURN QUERY SELECT 
            FALSE,
            'Solde insuffisant'::TEXT,
            NULL::UUID,
            v_user_balance;
        RETURN;
    END IF;

    -- Début de la transaction
    BEGIN
        -- Déduire le prix du solde de l'utilisateur
        UPDATE user_balances
        SET balance = balance - v_pack_price
        WHERE user_id = p_user_id;

        -- Créer l'achat du pack
        INSERT INTO user_packs (user_id, pack_id)
        VALUES (p_user_id, p_pack_id)
        RETURNING id INTO v_purchase_id;

        -- Retourner le succès
        RETURN QUERY SELECT 
            TRUE,
            'Achat réussi'::TEXT,
            v_purchase_id,
            (v_user_balance - v_pack_price);

    EXCEPTION WHEN OTHERS THEN
        -- En cas d'erreur, annuler la transaction
        RAISE NOTICE 'Erreur lors de l''achat du pack: %', SQLERRM;
        RETURN QUERY SELECT 
            FALSE,
            'Erreur lors de l''achat'::TEXT,
            NULL::UUID,
            v_user_balance;
    END;
END;
$$; 