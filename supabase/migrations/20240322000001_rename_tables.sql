-- Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Card packs are viewable by everyone" ON card_packs;
DROP POLICY IF EXISTS "Only admins can modify card_packs" ON card_packs;

-- Renommer la table card_packs en packs
ALTER TABLE IF EXISTS card_packs RENAME TO packs;

-- Mettre à jour les références dans user_packs
ALTER TABLE user_packs DROP CONSTRAINT IF EXISTS user_packs_pack_id_fkey;
ALTER TABLE user_packs
    ADD CONSTRAINT user_packs_pack_id_fkey
    FOREIGN KEY (pack_id)
    REFERENCES packs(id)
    ON DELETE CASCADE;

-- Créer les nouvelles politiques
CREATE POLICY "Packs are viewable by everyone" 
    ON packs
    FOR SELECT
    USING (true);

CREATE POLICY "Only admins can modify packs" 
    ON packs
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM auth.users
            WHERE auth.users.id = auth.uid()
            AND auth.users.role = 'admin'::text
        )
    ); 