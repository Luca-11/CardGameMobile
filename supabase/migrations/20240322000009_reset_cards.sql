-- Suppression de toutes les cartes existantes
DELETE FROM cards;

-- Réinitialisation de la séquence si nécessaire
-- ALTER SEQUENCE cards_id_seq RESTART WITH 1;

-- Insertion des nouvelles cartes
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