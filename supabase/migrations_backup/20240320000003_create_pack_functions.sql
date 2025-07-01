-- Fonction pour générer une carte aléatoire en fonction de la rareté
CREATE OR REPLACE FUNCTION get_random_card_by_rarity(rarity_param card_rarity)
RETURNS UUID AS $$
DECLARE
    selected_card_id UUID;
BEGIN
    SELECT id INTO selected_card_id
    FROM cards
    WHERE rarity = rarity_param
    ORDER BY RANDOM()
    LIMIT 1;
    
    RETURN selected_card_id;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour ouvrir un pack de cartes
CREATE OR REPLACE FUNCTION open_pack(
    p_user_id UUID,
    p_pack_id UUID
) RETURNS SETOF cards
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pack_record RECORD;
    v_card_id UUID;
    v_rarity card_rarity;
    v_random_number FLOAT;
    v_cumulative_probability FLOAT;
    v_i INTEGER;
    v_remaining_slots INTEGER;
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'Utilisateur non trouvé';
    END IF;

    -- Récupérer les informations du pack
    SELECT * INTO v_pack_record
    FROM card_packs
    WHERE id = p_pack_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pack non trouvé';
    END IF;

    -- Commencer la transaction
    BEGIN
        -- D'abord, sélectionner la carte garantie si applicable
        IF v_pack_record.guaranteed_rarity IS NOT NULL THEN
            -- Sélectionner une carte aléatoire de la rareté garantie
            SELECT id INTO v_card_id
            FROM cards
            WHERE rarity = v_pack_record.guaranteed_rarity
            ORDER BY RANDOM()
            LIMIT 1;

            -- Donner la carte à l'utilisateur
            INSERT INTO user_cards (user_id, card_id, quantity)
            VALUES (p_user_id, v_card_id, 1)
            ON CONFLICT (user_id, card_id)
            DO UPDATE SET quantity = user_cards.quantity + 1;

            -- Retourner la carte
            RETURN QUERY SELECT * FROM cards WHERE id = v_card_id;

            v_remaining_slots := v_pack_record.cards_per_pack - 1;
        ELSE
            v_remaining_slots := v_pack_record.cards_per_pack;
        END IF;

        -- Ensuite, sélectionner les cartes restantes selon les probabilités
        FOR v_i IN 1..v_remaining_slots LOOP
            -- Générer un nombre aléatoire entre 0 et 100
            v_random_number := random() * 100;
            v_cumulative_probability := 0;

            -- Déterminer la rareté en fonction des poids
            IF v_random_number < (v_pack_record.rarity_weights->>'legendary')::float THEN
                v_rarity := 'legendary';
            ELSIF v_random_number < (v_pack_record.rarity_weights->>'epic')::float + (v_pack_record.rarity_weights->>'legendary')::float THEN
                v_rarity := 'epic';
            ELSIF v_random_number < (v_pack_record.rarity_weights->>'rare')::float + (v_pack_record.rarity_weights->>'epic')::float + (v_pack_record.rarity_weights->>'legendary')::float THEN
                v_rarity := 'rare';
            ELSIF v_random_number < (v_pack_record.rarity_weights->>'uncommon')::float + (v_pack_record.rarity_weights->>'rare')::float + (v_pack_record.rarity_weights->>'epic')::float + (v_pack_record.rarity_weights->>'legendary')::float THEN
                v_rarity := 'uncommon';
            ELSE
                v_rarity := 'common';
            END IF;

            -- Sélectionner une carte aléatoire de cette rareté
            SELECT id INTO v_card_id
            FROM cards
            WHERE rarity = v_rarity
            ORDER BY RANDOM()
            LIMIT 1;

            -- Donner la carte à l'utilisateur
            INSERT INTO user_cards (user_id, card_id, quantity)
            VALUES (p_user_id, v_card_id, 1)
            ON CONFLICT (user_id, card_id)
            DO UPDATE SET quantity = user_cards.quantity + 1;

            -- Retourner la carte
            RETURN QUERY SELECT * FROM cards WHERE id = v_card_id;
        END LOOP;
    END;
END;
$$;

-- Fonction pour acheter un pack
CREATE OR REPLACE FUNCTION buy_pack(
    p_user_id UUID,
    p_pack_id UUID,
    p_quantity INTEGER DEFAULT 1
) RETURNS SETOF pack_purchases
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_pack_price INTEGER;
    v_total_price INTEGER;
    v_purchase_id UUID;
BEGIN
    -- Vérifier que l'utilisateur existe
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = p_user_id) THEN
        RAISE EXCEPTION 'Utilisateur non trouvé';
    END IF;

    -- Vérifier la quantité
    IF p_quantity <= 0 THEN
        RAISE EXCEPTION 'La quantité doit être positive';
    END IF;

    -- Récupérer le prix du pack
    SELECT price INTO v_pack_price
    FROM card_packs
    WHERE id = p_pack_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pack non trouvé';
    END IF;

    -- Calculer le prix total
    v_total_price := v_pack_price * p_quantity;

    -- Vérifier que l'utilisateur a assez d'argent (à implémenter plus tard)
    -- TODO: Ajouter la vérification du solde

    -- Créer l'achat
    INSERT INTO pack_purchases (user_id, pack_id, quantity, total_price)
    VALUES (p_user_id, p_pack_id, p_quantity, v_total_price)
    RETURNING id INTO v_purchase_id;

    -- Retourner l'achat
    RETURN QUERY SELECT * FROM pack_purchases WHERE id = v_purchase_id;
END;
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION buy_pack(UUID, UUID, INTEGER) TO authenticated;

-- Commentaires
COMMENT ON FUNCTION open_pack IS 'Fonction pour ouvrir un pack de cartes et distribuer les cartes à l''utilisateur';
COMMENT ON FUNCTION buy_pack IS 'Fonction pour acheter un ou plusieurs packs de cartes'; 