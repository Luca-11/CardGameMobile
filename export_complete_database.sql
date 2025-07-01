-- =====================================================
-- EXPORT COMPLET DE LA BASE DE DONNÉES - JEU DE CARTES
-- =====================================================
-- Ce script contient toute la structure et les données
-- nécessaires pour recréer la base de données complète
-- =====================================================

-- Suppression des tables existantes si nécessaire
DROP TABLE IF EXISTS pack_purchases CASCADE;
DROP TABLE IF EXISTS pack_rarity_odds CASCADE;
DROP TABLE IF EXISTS pack_types CASCADE;
DROP TABLE IF EXISTS card_packs CASCADE;
DROP TABLE IF EXISTS deck_cards CASCADE;
DROP TABLE IF EXISTS decks CASCADE;
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS user_currency CASCADE;
DROP TABLE IF EXISTS cards CASCADE;

-- Création des types énumérés
DO $$ BEGIN
    CREATE TYPE card_rarity AS ENUM ('common', 'uncommon', 'rare', 'epic', 'legendary');
    CREATE TYPE card_type AS ENUM ('creature', 'spell', 'equipment');
    CREATE TYPE card_element AS ENUM ('fire', 'water', 'earth', 'air', 'light', 'dark', 'neutral');
    CREATE TYPE user_role AS ENUM ('user', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- =====================================================
-- CRÉATION DES TABLES
-- =====================================================

-- Table des cartes
CREATE TABLE IF NOT EXISTS cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    image_url TEXT,
    card_type card_type NOT NULL,
    element card_element NOT NULL,
    rarity card_rarity NOT NULL,
    mana_cost INTEGER NOT NULL CHECK (mana_cost >= 0),
    attack INTEGER CHECK (attack >= 0),
    defense INTEGER CHECK (defense >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des cartes des utilisateurs
CREATE TABLE IF NOT EXISTS user_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, card_id)
);

-- Table des decks
CREATE TABLE IF NOT EXISTS decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(user_id, name)
);

-- Table des cartes dans les decks
CREATE TABLE IF NOT EXISTS deck_cards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID REFERENCES decks(id) ON DELETE CASCADE NOT NULL,
    card_id UUID REFERENCES cards(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(deck_id, card_id)
);

-- Table des packs de cartes
CREATE TABLE IF NOT EXISTS card_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT NOT NULL,
    price INTEGER NOT NULL CHECK (price > 0),
    cards_per_pack INTEGER NOT NULL DEFAULT 5 CHECK (cards_per_pack > 0),
    image_url TEXT,
    rarity_weights JSONB NOT NULL DEFAULT '{
        "common": 70,
        "uncommon": 20,
        "rare": 7,
        "epic": 2.5,
        "legendary": 0.5
    }'::jsonb,
    guaranteed_rarity card_rarity NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table des achats de packs
CREATE TABLE IF NOT EXISTS pack_purchases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES card_packs(id) ON DELETE CASCADE NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    total_price INTEGER NOT NULL CHECK (total_price > 0),
    opened_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Table pour gérer la monnaie des utilisateurs
CREATE TABLE user_currency (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    coins INTEGER NOT NULL DEFAULT 0 CHECK (coins >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- =====================================================
-- TRIGGERS ET FONCTIONS
-- =====================================================

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cards_updated_at
    BEFORE UPDATE ON cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cards_updated_at
    BEFORE UPDATE ON user_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_decks_updated_at
    BEFORE UPDATE ON decks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deck_cards_updated_at
    BEFORE UPDATE ON deck_cards
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_card_packs_updated_at
    BEFORE UPDATE ON card_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_currency_updated_at
    BEFORE UPDATE ON user_currency
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- FONCTIONS MÉTIER
-- =====================================================

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

-- Fonction d'achat de pack
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

-- =====================================================
-- SÉCURITÉ ET POLITIQUES RLS
-- =====================================================

-- Activation de RLS
ALTER TABLE cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE decks ENABLE ROW LEVEL SECURITY;
ALTER TABLE deck_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE card_packs ENABLE ROW LEVEL SECURITY;
ALTER TABLE pack_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_currency ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour les cartes
CREATE POLICY "Les cartes sont visibles par tout le monde" ON cards
    FOR SELECT USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les cartes" ON cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Politiques RLS pour les cartes des utilisateurs
CREATE POLICY "Les utilisateurs peuvent voir leurs propres cartes" ON user_cards
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent gérer leurs propres cartes" ON user_cards
    FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour les decks
CREATE POLICY "Les utilisateurs peuvent voir leurs propres decks" ON decks
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent gérer leurs propres decks" ON decks
    FOR ALL USING (auth.uid() = user_id);

-- Politiques RLS pour les cartes dans les decks
CREATE POLICY "Les utilisateurs peuvent voir les cartes de leurs decks" ON deck_cards
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM decks
            WHERE decks.id = deck_cards.deck_id
            AND decks.user_id = auth.uid()
        )
    );

CREATE POLICY "Les utilisateurs peuvent gérer les cartes de leurs decks" ON deck_cards
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM decks
            WHERE decks.id = deck_cards.deck_id
            AND decks.user_id = auth.uid()
        )
    );

-- Politiques RLS pour les packs
CREATE POLICY "Les packs sont visibles par tout le monde" ON card_packs
    FOR SELECT USING (true);

CREATE POLICY "Seuls les admins peuvent modifier les packs" ON card_packs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.raw_user_meta_data->>'role' = 'admin'
        )
    );

-- Politiques RLS pour les achats de packs
CREATE POLICY "Les utilisateurs peuvent voir leurs achats" ON pack_purchases
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Les utilisateurs peuvent effectuer des achats" ON pack_purchases
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politiques RLS pour la monnaie
CREATE POLICY "Les utilisateurs peuvent voir leur propre solde" ON user_currency
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Seul le système peut modifier les soldes" ON user_currency
    FOR ALL USING (false)
    WITH CHECK (false);

-- =====================================================
-- INDEX POUR LES PERFORMANCES
-- =====================================================

CREATE INDEX idx_user_cards_user_id ON user_cards(user_id);
CREATE INDEX idx_user_cards_card_id ON user_cards(card_id);
CREATE INDEX idx_decks_user_id ON decks(user_id);
CREATE INDEX idx_deck_cards_deck_id ON deck_cards(deck_id);
CREATE INDEX idx_deck_cards_card_id ON deck_cards(card_id);
CREATE INDEX idx_pack_purchases_user_id ON pack_purchases(user_id);
CREATE INDEX idx_pack_purchases_pack_id ON pack_purchases(pack_id);

-- =====================================================
-- DONNÉES INITIALES
-- =====================================================

-- Insertion des packs de base
INSERT INTO card_packs (name, description, price, cards_per_pack, rarity_weights, guaranteed_rarity) VALUES
    ('Pack de Démarrage', 'Un pack parfait pour débuter, contenant principalement des cartes communes et peu communes.', 100, 5, 
    '{
        "common": 70,
        "uncommon": 25,
        "rare": 5,
        "epic": 0,
        "legendary": 0
    }'::jsonb, 'common'),
    
    ('Pack Élémentaire', 'Contient des cartes élémentaires puissantes avec une chance accrue d''obtenir des cartes rares.', 200, 5,
    '{
        "common": 50,
        "uncommon": 35,
        "rare": 13,
        "epic": 2,
        "legendary": 0
    }'::jsonb, 'uncommon'),
    
    ('Pack Premium', 'Garantit au moins une carte rare ou mieux.', 500, 5,
    '{
        "common": 30,
        "uncommon": 40,
        "rare": 25,
        "epic": 4,
        "legendary": 1
    }'::jsonb, 'rare'),
    
    ('Pack Légendaire', 'Garantit au moins une carte épique et une chance accrue d''obtenir une carte légendaire.', 1000, 5,
    '{
        "common": 0,
        "uncommon": 20,
        "rare": 45,
        "epic": 25,
        "legendary": 10
    }'::jsonb, 'epic');

-- Insertion des cartes complètes
INSERT INTO cards (name, description, card_type, element, rarity, mana_cost, attack, defense) VALUES
-- Créatures communes (coût 1-3)
('Gobelin Éclaireur', 'Un petit gobelin agile et rusé.', 'creature', 'fire', 'common', 1, 1, 1),
('Soldat de la Garde', 'Un garde fidèle et dévoué.', 'creature', 'neutral', 'common', 2, 2, 2),
('Apprenti Mage', 'Un jeune mage en formation.', 'creature', 'neutral', 'common', 2, 1, 3),
('Loup des Plaines', 'Un prédateur solitaire.', 'creature', 'earth', 'common', 2, 2, 1),
('Élémentaire d''Eau', 'Une créature d''eau pure.', 'creature', 'water', 'common', 2, 1, 3),

-- Sorts communs (coût 1-2)
('Éclair', 'Inflige 2 dégâts à une cible.', 'spell', 'air', 'common', 1, NULL, NULL),
('Soin Mineur', 'Restaure 3 points de vie.', 'spell', 'light', 'common', 2, NULL, NULL),
('Boule de Feu', 'Inflige 3 dégâts à une cible.', 'spell', 'fire', 'common', 2, NULL, NULL),
('Croissance', 'Une créature gagne +1/+1.', 'spell', 'earth', 'common', 1, NULL, NULL),
('Bouclier de Glace', 'Une créature gagne +0/+3.', 'spell', 'water', 'common', 2, NULL, NULL),

-- Équipements communs (coût 2)
('Épée Courte', 'La créature équipée gagne +1/+0.', 'equipment', 'neutral', 'common', 2, NULL, NULL),
('Bouclier en Bois', 'La créature équipée gagne +0/+2.', 'equipment', 'neutral', 'common', 2, NULL, NULL),
('Bâton d''Apprenti', 'La créature équipée gagne +1/+1.', 'equipment', 'neutral', 'common', 2, NULL, NULL),
('Dague Rouillée', 'La créature équipée gagne Initiative.', 'equipment', 'neutral', 'common', 2, NULL, NULL),
('Amulette Simple', 'La créature équipée gagne +0/+1 et Vigilance.', 'equipment', 'neutral', 'common', 2, NULL, NULL),

-- Créatures peu communes (coût 3-4)
('Chevalier d''Argent', 'Un noble combattant en armure étincelante.', 'creature', 'light', 'uncommon', 3, 2, 4),
('Shaman des Vents', 'Un mystique qui commande aux brises.', 'creature', 'air', 'uncommon', 3, 3, 2),
('Golem de Pierre', 'Un gardien fait de roche pure.', 'creature', 'earth', 'uncommon', 4, 2, 5),
('Nécromancien', 'Un mage qui manipule les ombres.', 'creature', 'dark', 'uncommon', 4, 3, 3),
('Sirène', 'Une créature marine enchanteresse.', 'creature', 'water', 'uncommon', 3, 2, 3),

-- Sorts peu communs (coût 3-4)
('Tempête de Sable', 'Inflige 2 dégâts à toutes les créatures.', 'spell', 'earth', 'uncommon', 3, NULL, NULL),
('Vague Déferlante', 'Renvoie une créature dans la main de son propriétaire.', 'spell', 'water', 'uncommon', 3, NULL, NULL),
('Bénédiction', 'Toutes vos créatures gagnent +1/+1.', 'spell', 'light', 'uncommon', 4, NULL, NULL),
('Malédiction', 'Toutes les créatures adverses gagnent -1/-1.', 'spell', 'dark', 'uncommon', 4, NULL, NULL),
('Explosion de Lave', 'Inflige 4 dégâts répartis comme vous le souhaitez.', 'spell', 'fire', 'uncommon', 3, NULL, NULL),

-- Équipements peu communs (coût 3-4)
('Épée Longue', 'La créature équipée gagne +2/+1.', 'equipment', 'neutral', 'uncommon', 3, NULL, NULL),
('Armure de Plates', 'La créature équipée gagne +1/+3.', 'equipment', 'neutral', 'uncommon', 3, NULL, NULL),
('Arc Elfique', 'La créature équipée gagne +2/+0 et Portée.', 'equipment', 'neutral', 'uncommon', 4, NULL, NULL),
('Bouclier Runique', 'La créature équipée gagne +0/+3 et Résistance à la magie.', 'equipment', 'neutral', 'uncommon', 4, NULL, NULL),
('Grimoire Ancien', 'La créature équipée gagne +1/+1 et "T: Piochez une carte."', 'equipment', 'neutral', 'uncommon', 4, NULL, NULL),

-- Créatures rares (coût 5-6)
('Dragon de Feu', 'Un puissant dragon cracheur de flammes.', 'creature', 'fire', 'rare', 6, 5, 4),
('Ange Gardien', 'Un protecteur céleste aux ailes dorées.', 'creature', 'light', 'rare', 5, 3, 5),
('Kraken', 'Une terreur des profondeurs.', 'creature', 'water', 'rare', 6, 4, 6),
('Champion des Ténèbres', 'Un guerrier corrompu par l''obscurité.', 'creature', 'dark', 'rare', 5, 5, 3),
('Élémentaire Ancien', 'Une force de la nature primordiale.', 'creature', 'earth', 'rare', 6, 4, 5),

-- Sorts rares (coût 5-6)
('Jugement', 'Détruit toutes les créatures.', 'spell', 'light', 'rare', 6, NULL, NULL),
('Résurrection', 'Ramène une créature du cimetière sur le champ de bataille.', 'spell', 'light', 'rare', 5, NULL, NULL),
('Tempête de Météores', 'Inflige 5 dégâts à chaque créature et joueur.', 'spell', 'fire', 'rare', 6, NULL, NULL),
('Contrôle Mental', 'Prenez le contrôle d''une créature adverse.', 'spell', 'dark', 'rare', 5, NULL, NULL),
('Tsunami', 'Détruit tous les équipements et inflige 3 dégâts à chaque créature.', 'spell', 'water', 'rare', 5, NULL, NULL),

-- Équipements rares (coût 5-6)
('Lame du Dragon', 'La créature équipée gagne +3/+2 et "T: Inflige 2 dégâts à une cible."', 'equipment', 'fire', 'rare', 5, NULL, NULL),
('Armure Enchantée', 'La créature équipée gagne +2/+4 et Indestructible.', 'equipment', 'light', 'rare', 6, NULL, NULL),
('Couronne de Domination', 'La créature équipée gagne +3/+3 et Intimidation.', 'equipment', 'dark', 'rare', 5, NULL, NULL),
('Trident des Mers', 'La créature équipée gagne +4/+2 et peut bloquer les créatures volantes.', 'equipment', 'water', 'rare', 5, NULL, NULL),
('Marteau de Guerre', 'La créature équipée gagne +4/+4 mais perd Initiative.', 'equipment', 'neutral', 'rare', 6, NULL, NULL),

-- Créatures épiques (coût 7-8)
('Dragon Ancestral', 'Un dragon millénaire d''une puissance légendaire.', 'creature', 'fire', 'epic', 8, 8, 8),
('Titan de Cristal', 'Un colosse de cristal pur qui absorbe la magie.', 'creature', 'water', 'epic', 8, 7, 9),
('Archange Vengeur', 'Un ange de justice implacable.', 'creature', 'light', 'epic', 7, 7, 7),
('Seigneur des Abysses', 'Un démon ancien aux pouvoirs terrifiants.', 'creature', 'dark', 'epic', 8, 9, 6),
('Gardien de la Nature', 'L''esprit de la forêt incarné.', 'creature', 'earth', 'epic', 7, 6, 8),

-- Sorts épiques (coût 7-8)
('Foudre Divine', 'Inflige 8 dégâts, répartis comme vous le souhaitez.', 'spell', 'light', 'epic', 7, NULL, NULL),
('Éruption Volcanique', 'Inflige 6 dégâts à chaque créature et joueur.', 'spell', 'fire', 'epic', 8, NULL, NULL),
('Corruption Totale', 'Détruit toutes les créatures. Elles ne peuvent pas être régénérées.', 'spell', 'dark', 'epic', 8, NULL, NULL),
('Tempête du Siècle', 'Renvoie toutes les créatures dans les mains de leurs propriétaires et vous piochez 2 cartes.', 'spell', 'water', 'epic', 7, NULL, NULL),
('Éveil de la Forêt', 'Toutes vos créatures gagnent +3/+3 et Piétinement.', 'spell', 'earth', 'epic', 7, NULL, NULL),

-- Équipements épiques (coût 7-8)
('Épée des Anciens', 'La créature équipée gagne +5/+3 et Initiative.', 'equipment', 'light', 'epic', 7, NULL, NULL),
('Armure du Dragon', 'La créature équipée gagne +3/+5 et Indestructible.', 'equipment', 'fire', 'epic', 7, NULL, NULL),
('Couronne du Sage', 'La créature équipée gagne +2/+2 et "T: Piochez deux cartes."', 'equipment', 'neutral', 'epic', 7, NULL, NULL),
('Grimoire Interdit', 'La créature équipée gagne +4/+4 et Double frappe.', 'equipment', 'dark', 'epic', 8, NULL, NULL),
('Orbe des Éléments', 'La créature équipée gagne +3/+3 et Protection contre toutes les couleurs.', 'equipment', 'neutral', 'epic', 8, NULL, NULL),

-- Créatures légendaires (coût 9-10)
('Bahamut, Empereur des Dragons', 'Le souverain absolu de tous les dragons.', 'creature', 'fire', 'legendary', 10, 12, 12),
('Léviathan Primordial', 'Le premier des léviathans, maître des océans.', 'creature', 'water', 'legendary', 10, 10, 14),
('Archange Suprême', 'Le plus puissant des anges, porteur de la lumière divine.', 'creature', 'light', 'legendary', 10, 11, 11),
('Seigneur du Néant', 'L''incarnation même des ténèbres.', 'creature', 'dark', 'legendary', 10, 13, 9),
('Gaia, l''Ancienne', 'La terre elle-même prend vie.', 'creature', 'earth', 'legendary', 10, 9, 15),

-- Sorts légendaires (coût 9-10)
('Apocalypse', 'Exile toutes les cartes en jeu et dans les mains.', 'spell', 'dark', 'legendary', 10, NULL, NULL),
('Résurrection Divine', 'Ramène toutes vos créatures détruites avec +2/+2.', 'spell', 'light', 'legendary', 9, NULL, NULL),
('Cataclysme Élémentaire', 'Inflige 10 dégâts à toutes les créatures et tous les joueurs.', 'spell', 'fire', 'legendary', 10, NULL, NULL),
('Déluge Primordial', 'Renvoie tout dans les mains des propriétaires. Piochez 3 cartes.', 'spell', 'water', 'legendary', 9, NULL, NULL),
('Éveil de Gaia', 'Double l''attaque et la défense de toutes vos créatures.', 'spell', 'earth', 'legendary', 10, NULL, NULL),

-- Équipements légendaires (coût 9-10)
('Excalibur, Lame Sacrée', 'La créature équipée gagne +7/+7, Initiative, Vigilance et Indestructible.', 'equipment', 'light', 'legendary', 10, NULL, NULL),
('Faux du Faucheur', 'La créature équipée gagne +10/+3 et "Quand cette créature inflige des dégâts, exilez la créature ciblée."', 'equipment', 'dark', 'legendary', 10, NULL, NULL),
('Égide des Dieux', 'La créature équipée gagne +5/+10 et ne peut pas être ciblée.', 'equipment', 'neutral', 'legendary', 9, NULL, NULL),
('Trident de Poséidon', 'La créature équipée gagne +8/+6 et peut attaquer trois créatures.', 'equipment', 'water', 'legendary', 10, NULL, NULL),
('Marteau de Thor', 'La créature équipée gagne +9/+5 et inflige 3 dégâts à toutes les autres créatures quand elle attaque.', 'equipment', 'air', 'legendary', 10, NULL, NULL);

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Accorder les permissions nécessaires
GRANT EXECUTE ON FUNCTION get_user_balance(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION buy_pack(UUID, UUID, INTEGER) TO authenticated;

-- =====================================================
-- FIN DU SCRIPT D'EXPORT
-- =====================================================
-- Ce script contient toute la structure et les données
-- nécessaires pour recréer votre base de données complète
-- ===================================================== 