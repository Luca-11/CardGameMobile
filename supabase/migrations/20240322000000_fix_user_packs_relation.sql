-- Suppression de la table existante
DROP TABLE IF EXISTS user_packs CASCADE;

-- Recréation de la table avec la bonne relation
CREATE TABLE user_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    pack_id UUID REFERENCES card_packs(id) ON DELETE CASCADE NOT NULL,
    opened_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Trigger pour updated_at
CREATE TRIGGER update_user_packs_updated_at
    BEFORE UPDATE ON user_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Activation de RLS
ALTER TABLE user_packs ENABLE ROW LEVEL SECURITY;

-- Politiques RLS
CREATE POLICY "Users can view their own packs" ON user_packs
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their own packs" ON user_packs
    FOR ALL USING (auth.uid() = user_id);

-- Index pour les performances
CREATE INDEX idx_user_packs_user_id ON user_packs(user_id);
CREATE INDEX idx_user_packs_pack_id ON user_packs(pack_id); 