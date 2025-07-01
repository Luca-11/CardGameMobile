-- Script pour corriger la fonction open_pack
-- Problème : Ambiguïté sur la colonne "id"

-- ========================================
-- SUPPRIMER L'ANCIENNE FONCTION
-- ========================================

DROP FUNCTION IF EXISTS open_pack(UUID, UUID);

-- ========================================
-- CRÉER LA NOUVELLE FONCTION CORRIGÉE
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
        card_id UUID,
        card_name TEXT,
        card_description TEXT,
        card_image_url TEXT,
        card_type TEXT,
        card_element TEXT,
        card_rarity TEXT,
        card_mana_cost INTEGER,
        card_attack INTEGER,
        card_defense INTEGER,
        card_created_at TIMESTAMPTZ,
        card_updated_at TIMESTAMPTZ
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

    -- Retourner les cartes générées avec les bons noms de colonnes
    RETURN QUERY SELECT 
        t.card_id as id,
        t.card_name as name,
        t.card_description as description,
        t.card_image_url as image_url,
        t.card_type,
        t.card_element as element,
        t.card_rarity as rarity,
        t.card_mana_cost as mana_cost,
        t.card_attack as attack,
        t.card_defense as defense,
        t.card_created_at as created_at,
        t.card_updated_at as updated_at
    FROM temp_generated_cards t;

    -- Nettoyer la table temporaire
    DROP TABLE temp_generated_cards;
END;
$$;

-- ========================================
-- VÉRIFICATION
-- ========================================

-- Vérifier que la fonction est créée
SELECT 
    routine_name, 
    routine_type,
    data_type
FROM information_schema.routines 
WHERE routine_name = 'open_pack'
AND routine_schema = 'public';

-- Tester la fonction (remplacez par des UUIDs réels)
-- SELECT * FROM open_pack('user-uuid-here', 'pack-uuid-here'); 