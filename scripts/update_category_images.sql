UPDATE categories
SET image_url = NULL
WHERE slug IN ('sets', 'dresses', 'bottoms', 'tops', 'outerwear');
