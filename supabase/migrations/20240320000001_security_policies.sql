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