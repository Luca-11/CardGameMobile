-- Script pour nettoyer et recréer les fonctions buy_pack
-- Problème : Conflit entre plusieurs versions de la fonction buy_pack

-- ========================================
-- ÉTAPE 1: Supprimer toutes les anciennes fonctions
-- ========================================

-- Supprimer toutes les fonctions buy_pack existantes
DROP FUNCTION IF EXISTS buy_pack(UUID, UUID);
DROP FUNCTION IF EXISTS buy_pack(UUID, UUID, INTEGER);
DROP FUNCTION IF EXISTS buy_pack(UUID, UUID, INTEGER, INTEGER);
DROP FUNCTION IF EXISTS buy_pack(UUID, UUID, INTEGER, INTEGER, INTEGER);

-- Supprimer aussi les fonctions open_pack si elles existent
DROP FUNCTION IF EXISTS open_pack(UUID, UUID);
DROP FUNCTION IF EXISTS open_pack(UUID, UUID, INTEGER);

-- ========================================
-- ÉTAPE 2: Vérifier qu'elles sont supprimées
-- ========================================

-- Vérifier qu'aucune fonction buy_pack n'existe plus
SELECT 
    routine_name, 
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('buy_pack', 'open_pack')
AND routine_schema = 'public';

-- ========================================
-- ÉTAPE 3: Créer la nouvelle fonction buy_pack
-- ========================================

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
    FROM public.packs
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
    FROM public.user_balances
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
        UPDATE public.user_balances
        SET balance = balance - v_pack_price
        WHERE user_id = p_user_id;

        -- Créer l'achat du pack
        INSERT INTO public.user_packs (user_id, pack_id)
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

-- ========================================
-- ÉTAPE 4: Créer la fonction open_pack
-- ========================================

CREATE OR REPLACE FUNCTION open_pack(
    p_user_id UUID,
    p_pack_id UUID
) RETURNS TABLE (
    id UUID,
    name TEXT,
    description TEXT,
    image_url TEXT,
    card_type TEXT,
    element TEXT,
    rarity TEXT,
    mana_cost INTEGER,
    attack INTEGER,
    defense INTEGER,
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_pack_cards_per_pack INTEGER;
    v_pack_rarity_weights JSONB;
    v_pack_guaranteed_rarity TEXT;
    v_card_id UUID;
    v_rarity TEXT;
    v_weight NUMERIC;
    v_total_weight NUMERIC := 0;
    v_random NUMERIC;
    v_selected_rarity TEXT;
BEGIN
    -- Récupérer les informations du pack
    SELECT 
        cards_per_pack,
        rarity_weights,
        guaranteed_rarity
    INTO 
        v_pack_cards_per_pack,
        v_pack_rarity_weights,
        v_pack_guaranteed_rarity
    FROM public.packs
    WHERE id = p_pack_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Pack non trouvé';
    END IF;

    -- Créer une table temporaire pour stocker les cartes générées
    CREATE TEMP TABLE temp_generated_cards (
        id UUID,
        name TEXT,
        description TEXT,
        image_url TEXT,
        card_type TEXT,
        element TEXT,
        rarity TEXT,
        mana_cost INTEGER,
        attack INTEGER,
        defense INTEGER,
        created_at TIMESTAMPTZ,
        updated_at TIMESTAMPTZ
    );

    -- Générer les cartes pour ce pack
    FOR i IN 1..v_pack_cards_per_pack LOOP
        -- Garantir au moins une carte de la rareté garantie
        IF i = 1 THEN
            v_selected_rarity := v_pack_guaranteed_rarity;
        ELSE
            -- Calculer les poids totaux
            v_total_weight := 0;
            FOR v_rarity, v_weight IN SELECT * FROM jsonb_each_text(v_pack_rarity_weights) LOOP
                v_total_weight := v_total_weight + v_weight::NUMERIC;
            END LOOP;

            -- Générer un nombre aléatoire
            v_random := random() * v_total_weight;

            -- Sélectionner la rareté basée sur les poids
            v_selected_rarity := v_pack_guaranteed_rarity; -- Par défaut
            v_total_weight := 0;
            FOR v_rarity, v_weight IN SELECT * FROM jsonb_each_text(v_pack_rarity_weights) LOOP
                v_total_weight := v_total_weight + v_weight::NUMERIC;
                IF v_random <= v_total_weight THEN
                    v_selected_rarity := v_rarity;
                    EXIT;
                END IF;
            END LOOP;
        END IF;

        -- Sélectionner une carte aléatoire de cette rareté
        SELECT 
            c.id,
            c.name,
            c.description,
            c.image_url,
            c.card_type,
            c.element,
            c.rarity,
            c.mana_cost,
            c.attack,
            c.defense,
            c.created_at,
            c.updated_at
        INTO v_card_id
        FROM public.cards c
        WHERE c.rarity = v_selected_rarity
        ORDER BY random()
        LIMIT 1;

        -- Si aucune carte de cette rareté n'existe, prendre une carte commune
        IF v_card_id IS NULL THEN
            SELECT 
                c.id,
                c.name,
                c.description,
                c.image_url,
                c.card_type,
                c.element,
                c.rarity,
                c.mana_cost,
                c.attack,
                c.defense,
                c.created_at,
                c.updated_at
            INTO v_card_id
            FROM public.cards c
            WHERE c.rarity = 'common'
            ORDER BY random()
            LIMIT 1;
        END IF;

        -- Ajouter la carte à la table temporaire
        INSERT INTO temp_generated_cards
        SELECT 
            c.id,
            c.name,
            c.description,
            c.image_url,
            c.card_type,
            c.element,
            c.rarity,
            c.mana_cost,
            c.attack,
            c.defense,
            c.created_at,
            c.updated_at
        FROM public.cards c
        WHERE c.id = v_card_id;

        -- Ajouter la carte à la collection de l'utilisateur
        INSERT INTO public.user_cards (user_id, card_id, obtained_at)
        VALUES (p_user_id, v_card_id, NOW())
        ON CONFLICT (user_id, card_id) DO NOTHING;
    END LOOP;

    -- Retourner les cartes générées
    RETURN QUERY SELECT * FROM temp_generated_cards;

    -- Nettoyer la table temporaire
    DROP TABLE temp_generated_cards;
END;
$$;

-- ========================================
-- ÉTAPE 5: Vérification finale
-- ========================================

-- Vérifier que les fonctions sont créées correctement
SELECT 
    routine_name, 
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name IN ('buy_pack', 'open_pack')
AND routine_schema = 'public'
ORDER BY routine_name;

-- Tester la fonction buy_pack avec un utilisateur existant
-- (Remplacez les UUIDs par des valeurs réelles de votre base)
-- SELECT * FROM buy_pack('user-uuid-here', 'pack-uuid-here'); 