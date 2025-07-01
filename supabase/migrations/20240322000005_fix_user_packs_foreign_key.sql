-- Supprimer la contrainte existante si elle existe
ALTER TABLE user_packs DROP CONSTRAINT IF EXISTS user_packs_pack_id_fkey;

-- Ajouter la nouvelle contrainte avec le bon nom de table
ALTER TABLE user_packs
    ADD CONSTRAINT user_packs_pack_id_fkey
    FOREIGN KEY (pack_id)
    REFERENCES card_packs(id)
    ON DELETE CASCADE;

-- Créer un index pour améliorer les performances des jointures
CREATE INDEX IF NOT EXISTS idx_user_packs_pack_id ON user_packs(pack_id); 