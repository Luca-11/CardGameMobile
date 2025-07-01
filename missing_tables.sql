-- Script pour créer les tables manquantes
-- Tables: packs, user_balances

-- ========================================
-- TABLE: packs
-- ========================================

-- Créer la table packs
CREATE TABLE IF NOT EXISTS public.packs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    card_count INTEGER NOT NULL DEFAULT 5,
    rarity_distribution JSONB,
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Créer l'index sur le prix pour le tri
CREATE INDEX IF NOT EXISTS idx_packs_price ON public.packs(price);

-- Insérer des données de test pour les packs
INSERT INTO public.packs (name, description, price, card_count, rarity_distribution, image_url) VALUES
('Pack de Base', 'Pack de départ avec 5 cartes communes', 0, 5, '{"common": 5, "uncommon": 0, "rare": 0, "epic": 0, "legendary": 0}', 'https://example.com/base-pack.png'),
('Pack Premium', 'Pack premium avec des cartes de meilleure qualité', 100, 5, '{"common": 2, "uncommon": 2, "rare": 1, "epic": 0, "legendary": 0}', 'https://example.com/premium-pack.png'),
('Pack Épique', 'Pack avec des cartes épiques', 250, 5, '{"common": 1, "uncommon": 2, "rare": 1, "epic": 1, "legendary": 0}', 'https://example.com/epic-pack.png'),
('Pack Légendaire', 'Pack avec une chance de cartes légendaires', 500, 5, '{"common": 0, "uncommon": 2, "rare": 2, "epic": 0, "legendary": 1}', 'https://example.com/legendary-pack.png')
ON CONFLICT (id) DO NOTHING;

-- ========================================
-- TABLE: user_balances
-- ========================================

-- Créer la table user_balances
CREATE TABLE IF NOT EXISTS public.user_balances (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    balance INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Créer l'index sur user_id
CREATE INDEX IF NOT EXISTS idx_user_balances_user_id ON public.user_balances(user_id);

-- ========================================
-- POLITIQUES RLS (Row Level Security)
-- ========================================

-- Activer RLS sur packs
ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Politique pour packs : lecture publique
CREATE POLICY "Packs are viewable by everyone" ON public.packs
    FOR SELECT USING (true);

-- Politique pour packs : modification par admin seulement
CREATE POLICY "Packs are editable by admin only" ON public.packs
    FOR ALL USING (auth.role() = 'admin');

-- Activer RLS sur user_balances
ALTER TABLE public.user_balances ENABLE ROW LEVEL SECURITY;

-- Politique pour user_balances : lecture de son propre solde
CREATE POLICY "Users can view own balance" ON public.user_balances
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour user_balances : modification de son propre solde
CREATE POLICY "Users can update own balance" ON public.user_balances
    FOR UPDATE USING (auth.uid() = user_id);

-- Politique pour user_balances : insertion de son propre solde
CREATE POLICY "Users can insert own balance" ON public.user_balances
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger pour mettre à jour updated_at sur packs
CREATE OR REPLACE FUNCTION update_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_packs_updated_at
    BEFORE UPDATE ON public.packs
    FOR EACH ROW
    EXECUTE FUNCTION update_packs_updated_at();

-- Trigger pour mettre à jour updated_at sur user_balances
CREATE OR REPLACE FUNCTION update_user_balances_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_balances_updated_at
    BEFORE UPDATE ON public.user_balances
    FOR EACH ROW
    EXECUTE FUNCTION update_user_balances_updated_at();

-- ========================================
-- FONCTION pour créer automatiquement un solde utilisateur
-- ========================================

-- Fonction pour créer un solde initial pour les nouveaux utilisateurs
CREATE OR REPLACE FUNCTION create_user_balance()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_balances (user_id, balance)
    VALUES (NEW.id, 1000) -- Solde initial de 1000
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un solde lors de l'inscription
DROP TRIGGER IF EXISTS trigger_create_user_balance ON auth.users;
CREATE TRIGGER trigger_create_user_balance
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_balance();

-- ========================================
-- INSÉRER LES SOLDES POUR LES UTILISATEURS EXISTANTS
-- ========================================

-- Insérer des soldes pour les utilisateurs existants qui n'en ont pas
INSERT INTO public.user_balances (user_id, balance)
SELECT id, 1000
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM public.user_balances)
ON CONFLICT (user_id) DO NOTHING; 