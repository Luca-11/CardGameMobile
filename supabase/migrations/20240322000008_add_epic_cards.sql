-- Ajout de cartes épiques et légendaires
INSERT INTO cards (name, description, card_type, element, rarity, mana_cost, attack, defense) VALUES
-- Créatures épiques
('Dragon Ancestral Supérieur', 'Un dragon millénaire dont la puissance n''a d''égal que sa sagesse.', 'creature', 'fire', 'epic', 8, 8, 8),
('Titan de Cristal', 'Un colosse de cristal pur qui absorbe et réfléchit la magie.', 'creature', 'water', 'epic', 8, 7, 9),
('Gardien des Âges', 'Un être mystique qui transcende le temps.', 'creature', 'light', 'epic', 8, 6, 10),
('Béhémoth des Abysses', 'Une créature titanesque qui règne sur les profondeurs.', 'creature', 'dark', 'epic', 8, 9, 7),
('Archimage Suprême', 'Un mage dont les pouvoirs dépassent l''entendement.', 'creature', 'neutral', 'epic', 8, 7, 7),

-- Sorts épiques
('Jugement Céleste', 'Bannit toutes les créatures adverses.', 'spell', 'light', 'epic', 8, NULL, NULL),
('Tempête du Néant', 'Détruit tous les équipements et inflige 5 dégâts à chaque créature.', 'spell', 'dark', 'epic', 8, NULL, NULL),
('Raz-de-Marée', 'Renvoie toutes les créatures dans les mains de leurs propriétaires.', 'spell', 'water', 'epic', 7, NULL, NULL),
('Nova Arcanique', 'Inflige 7 dégâts à toutes les créatures et tous les joueurs.', 'spell', 'fire', 'epic', 8, NULL, NULL),
('Séisme Dévastateur', 'Détruit tous les équipements et inflige 6 dégâts à chaque créature.', 'spell', 'earth', 'epic', 8, NULL, NULL),

-- Équipements épiques
('Épée des Anciens', 'La créature équipée gagne +5/+3 et Initiative.', 'equipment', 'light', 'epic', 7, NULL, NULL),
('Armure du Dragon', 'La créature équipée gagne +3/+5 et Indestructible.', 'equipment', 'fire', 'epic', 7, NULL, NULL),
('Couronne du Sage', 'La créature équipée gagne +2/+2 et permet de piocher une carte à chaque attaque.', 'equipment', 'neutral', 'epic', 6, NULL, NULL),
('Grimoire Interdit', 'La créature équipée gagne +4/+4 et Double frappe.', 'equipment', 'dark', 'epic', 7, NULL, NULL),
('Orbe des Éléments', 'La créature équipée gagne +3/+3 et peut changer son élément.', 'equipment', 'neutral', 'epic', 6, NULL, NULL),

-- Créatures légendaires
('Bahamut, Empereur des Dragons', 'Le souverain absolu de tous les dragons, sa puissance est inégalée.', 'creature', 'fire', 'legendary', 10, 12, 12),
('Léviathan Primordial', 'Le premier des léviathans, maître des océans depuis l''aube des temps.', 'creature', 'water', 'legendary', 10, 10, 14),
('Archange Suprême', 'Le plus puissant des anges, porteur de la lumière divine.', 'creature', 'light', 'legendary', 10, 11, 11),
('Seigneur du Néant', 'L''incarnation même des ténèbres, celui qui dévore la lumière.', 'creature', 'dark', 'legendary', 10, 13, 9),
('Gaia, l''Ancienne', 'La terre elle-même prend vie pour protéger ses enfants.', 'creature', 'earth', 'legendary', 10, 9, 15),

-- Sorts légendaires
('Apocalypse', 'Détruit tout sur le terrain. Les créatures détruites ne peuvent pas être régénérées.', 'spell', 'dark', 'legendary', 10, NULL, NULL),
('Résurrection Divine', 'Ramène toutes vos créatures détruites sur le terrain avec +1/+1.', 'spell', 'light', 'legendary', 10, NULL, NULL),
('Cataclysme Élémentaire', 'Inflige 10 dégâts à toutes les créatures et tous les joueurs.', 'spell', 'fire', 'legendary', 10, NULL, NULL),
('Déluge Primordial', 'Renvoie tout dans les mains des propriétaires et vous fait piocher 3 cartes.', 'spell', 'water', 'legendary', 10, NULL, NULL),
('Éveil de Gaia', 'Double l''attaque et la défense de toutes vos créatures.', 'spell', 'earth', 'legendary', 10, NULL, NULL),

-- Équipements légendaires
('Excalibur, Lame Sacrée', 'La créature équipée gagne +7/+7, Initiative, Vigilance et Indestructible.', 'equipment', 'light', 'legendary', 10, NULL, NULL),
('Faux du Faucheur', 'La créature équipée gagne +10/+3 et "Quand cette créature inflige des dégâts, exilez la créature ciblée."', 'equipment', 'dark', 'legendary', 10, NULL, NULL),
('Égide des Dieux', 'La créature équipée gagne +5/+10 et ne peut pas être ciblée par les sorts ou capacités adverses.', 'equipment', 'neutral', 'legendary', 10, NULL, NULL),
('Trident de Poséidon', 'La créature équipée gagne +8/+6 et peut attaquer trois créatures à la fois.', 'equipment', 'water', 'legendary', 10, NULL, NULL),
('Marteau de Thor', 'La créature équipée gagne +9/+5 et inflige 3 dégâts à toutes les autres créatures quand elle attaque.', 'equipment', 'air', 'legendary', 10, NULL, NULL); 