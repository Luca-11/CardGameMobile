-- Script pour corriger la structure de la table packs
-- Problème : Le code attend rarity_weights et guaranteed_rarity mais la table a rarity_distribution

-- ========================================
-- ÉTAPE 1: Sauvegarder les données existantes
-- ========================================

-- Créer une table temporaire pour sauvegarder les données
CREATE TEMP TABLE temp_packs AS 
SELECT * FROM public.packs;

-- ========================================
-- ÉTAPE 2: Supprimer la table existante
-- ========================================

DROP TABLE IF EXISTS public.packs CASCADE;

-- ========================================
-- ÉTAPE 3: Recréer la table avec la bonne structure
-- ========================================

CREATE TABLE public.packs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    price INTEGER NOT NULL DEFAULT 0,
    cards_per_pack INTEGER NOT NULL DEFAULT 5,
    rarity_weights JSONB NOT NULL,
    guaranteed_rarity TEXT NOT NULL DEFAULT 'common',
    image_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- ÉTAPE 4: Créer les index
-- ========================================

CREATE INDEX idx_packs_price ON public.packs(price);
CREATE INDEX idx_packs_guaranteed_rarity ON public.packs(guaranteed_rarity);

-- ========================================
-- ÉTAPE 5: Insérer les données avec la nouvelle structure
-- ========================================

INSERT INTO public.packs (
    name, 
    description, 
    price, 
    cards_per_pack, 
    rarity_weights, 
    guaranteed_rarity, 
    image_url
) VALUES
(
    'Pack de Base',
    'Pack de départ avec 5 cartes communes',
    0,
    5,
    '{"common": 1.0, "uncommon": 0.0, "rare": 0.0, "epic": 0.0, "legendary": 0.0}',
    'common',
    'https://example.com/base-pack.png'
),
(
    'Pack Premium',
    'Pack premium avec des cartes de meilleure qualité',
    100,
    5,
    '{"common": 0.4, "uncommon": 0.4, "rare": 0.2, "epic": 0.0, "legendary": 0.0}',
    'uncommon',
    'https://example.com/premium-pack.png'
),
(
    'Pack Épique',
    'Pack avec des cartes épiques',
    250,
    5,
    '{"common": 0.2, "uncommon": 0.4, "rare": 0.2, "epic": 0.2, "legendary": 0.0}',
    'rare',
    'https://example.com/epic-pack.png'
),
(
    'Pack Légendaire',
    'Pack avec une chance de cartes légendaires',
    500,
    5,
    '{"common": 0.0, "uncommon": 0.4, "rare": 0.4, "epic": 0.0, "legendary": 0.2}',
    'legendary',
    'https://example.com/legendary-pack.png'
);

-- ========================================
-- ÉTAPE 6: Activer RLS et créer les politiques
-- ========================================

ALTER TABLE public.packs ENABLE ROW LEVEL SECURITY;

-- Politique pour packs : lecture publique
CREATE POLICY "Packs are viewable by everyone" ON public.packs
    FOR SELECT USING (true);

-- Politique pour packs : modification par admin seulement
CREATE POLICY "Packs are editable by admin only" ON public.packs
    FOR ALL USING (auth.role() = 'admin');

-- ========================================
-- ÉTAPE 7: Créer les triggers
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

-- ========================================
-- ÉTAPE 8: Vérification
-- ========================================

-- Vérifier que les données sont bien insérées
SELECT 
    name, 
    price, 
    cards_per_pack, 
    guaranteed_rarity,
    rarity_weights
FROM public.packs 
ORDER BY price; 