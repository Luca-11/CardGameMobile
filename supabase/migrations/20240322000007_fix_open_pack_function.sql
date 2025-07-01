-- Supprimer l'ancienne fonction
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);

-- Recréer la fonction avec la vérification des cartes disponibles
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
    v_available_cards INTEGER;
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

    -- Vérifier qu'il y a des cartes de la rareté garantie
    SELECT COUNT(*) INTO v_available_cards
    FROM cards
    WHERE rarity = v_pack_record.guaranteed_rarity;

    IF v_available_cards = 0 THEN
        RAISE EXCEPTION 'Aucune carte disponible pour la rareté garantie: %', v_pack_record.guaranteed_rarity;
    END IF;

    -- Donner la carte garantie
    SELECT id INTO v_card_id
    FROM cards
    WHERE rarity = v_pack_record.guaranteed_rarity
    ORDER BY RANDOM()
    LIMIT 1;

    -- Insérer la carte garantie dans user_cards
    INSERT INTO user_cards (user_id, card_id, quantity)
    VALUES (p_user_id, v_card_id, 1)
    ON CONFLICT (user_id, card_id)
    DO UPDATE SET quantity = user_cards.quantity + 1;

    -- Retourner la carte garantie
    RETURN QUERY SELECT * FROM cards WHERE id = v_card_id;

    -- Calculer les slots restants
    v_remaining_slots := v_pack_record.cards_per_pack - 1;

    -- Distribuer les cartes restantes
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

        -- Vérifier qu'il y a des cartes de cette rareté
        SELECT COUNT(*) INTO v_available_cards
        FROM cards
        WHERE rarity = v_rarity;

        IF v_available_cards = 0 THEN
            -- Si aucune carte n'est disponible pour cette rareté, passer à la rareté inférieure
            CASE v_rarity
                WHEN 'legendary' THEN v_rarity := 'epic';
                WHEN 'epic' THEN v_rarity := 'rare';
                WHEN 'rare' THEN v_rarity := 'uncommon';
                WHEN 'uncommon' THEN v_rarity := 'common';
                ELSE v_rarity := 'common';
            END CASE;
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
$$;

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION open_pack(UUID, UUID) TO authenticated; 