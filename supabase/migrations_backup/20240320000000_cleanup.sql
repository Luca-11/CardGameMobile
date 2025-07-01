-- Suppression des triggers (seulement si les tables existent)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        DROP TRIGGER IF EXISTS update_users_updated_at ON users;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cards') THEN
        DROP TRIGGER IF EXISTS update_cards_updated_at ON cards;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_cards') THEN
        DROP TRIGGER IF EXISTS update_user_cards_updated_at ON user_cards;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'decks') THEN
        DROP TRIGGER IF EXISTS update_decks_updated_at ON decks;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deck_cards') THEN
        DROP TRIGGER IF EXISTS update_deck_cards_updated_at ON deck_cards;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'card_packs') THEN
        DROP TRIGGER IF EXISTS update_card_packs_updated_at ON card_packs;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pack_purchases') THEN
        DROP TRIGGER IF EXISTS update_pack_purchases_updated_at ON pack_purchases;
    END IF;
END $$;

-- Suppression des politiques RLS (seulement si les tables existent)
DO $$ 
BEGIN
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') THEN
        DROP POLICY IF EXISTS "Users can view all users" ON users;
        DROP POLICY IF EXISTS "Users can update their own profile" ON users;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'cards') THEN
        DROP POLICY IF EXISTS "Cards are viewable by everyone" ON cards;
        DROP POLICY IF EXISTS "Only admins can modify cards" ON cards;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'user_cards') THEN
        DROP POLICY IF EXISTS "Users can view their own cards" ON user_cards;
        DROP POLICY IF EXISTS "Users can manage their own cards" ON user_cards;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'decks') THEN
        DROP POLICY IF EXISTS "Users can view their own decks" ON decks;
        DROP POLICY IF EXISTS "Users can manage their own decks" ON decks;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'deck_cards') THEN
        DROP POLICY IF EXISTS "Users can view cards in their decks" ON deck_cards;
        DROP POLICY IF EXISTS "Users can manage cards in their decks" ON deck_cards;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'card_packs') THEN
        DROP POLICY IF EXISTS "Card packs are viewable by everyone" ON card_packs;
        DROP POLICY IF EXISTS "Only admins can modify card packs" ON card_packs;
    END IF;
    IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'pack_purchases') THEN
        DROP POLICY IF EXISTS "Users can view their own purchases" ON pack_purchases;
        DROP POLICY IF EXISTS "Users can manage their own purchases" ON pack_purchases;
    END IF;
END $$;

-- Suppression des tables dans l'ordre inverse des dépendances
DROP TABLE IF EXISTS pack_purchases CASCADE;
DROP TABLE IF EXISTS card_packs CASCADE;
DROP TABLE IF EXISTS deck_cards CASCADE;
DROP TABLE IF EXISTS decks CASCADE;
DROP TABLE IF EXISTS user_cards CASCADE;
DROP TABLE IF EXISTS cards CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Suppression des types
DROP TYPE IF EXISTS card_rarity CASCADE;
DROP TYPE IF EXISTS card_type CASCADE;
DROP TYPE IF EXISTS card_element CASCADE;
DROP TYPE IF EXISTS user_role CASCADE;

-- Suppression des fonctions
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE; 