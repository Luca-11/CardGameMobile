-- Script pour créer la table user_packs manquante
-- Cette table est nécessaire pour stocker les achats de packs

-- ========================================
-- TABLE: user_packs
-- ========================================

CREATE TABLE IF NOT EXISTS public.user_packs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    pack_id UUID NOT NULL REFERENCES public.packs(id) ON DELETE CASCADE,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, pack_id, created_at)
);

-- ========================================
-- INDEX
-- ========================================

CREATE INDEX IF NOT EXISTS idx_user_packs_user_id ON public.user_packs(user_id);
CREATE INDEX IF NOT EXISTS idx_user_packs_pack_id ON public.user_packs(pack_id);
CREATE INDEX IF NOT EXISTS idx_user_packs_opened_at ON public.user_packs(opened_at);

-- ========================================
-- POLITIQUES RLS
-- ========================================

ALTER TABLE public.user_packs ENABLE ROW LEVEL SECURITY;

-- Politique pour user_packs : lecture de ses propres packs
CREATE POLICY "Users can view own packs" ON public.user_packs
    FOR SELECT USING (auth.uid() = user_id);

-- Politique pour user_packs : insertion de ses propres packs
CREATE POLICY "Users can insert own packs" ON public.user_packs
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Politique pour user_packs : mise à jour de ses propres packs
CREATE POLICY "Users can update own packs" ON public.user_packs
    FOR UPDATE USING (auth.uid() = user_id);

-- ========================================
-- TRIGGERS
-- ========================================

-- Trigger pour mettre à jour updated_at sur user_packs
CREATE OR REPLACE FUNCTION update_user_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_user_packs_updated_at
    BEFORE UPDATE ON public.user_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_user_packs_updated_at();

-- ========================================
-- VÉRIFICATION
-- ========================================

-- Vérifier que la table est créée
SELECT 
    table_name, 
    table_type 
FROM information_schema.tables 
WHERE table_name = 'user_packs'
AND table_schema = 'public'; 