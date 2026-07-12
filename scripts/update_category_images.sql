UPDATE categories
SET image_url = '/categories/sets.png'
WHERE slug = 'sets';

UPDATE categories
SET image_url = '/categories/sports-bras.png'
WHERE slug IN ('sport-bras', 'sports-bras');

UPDATE categories
SET image_url = '/categories/bottoms.png'
WHERE slug = 'bottoms';
