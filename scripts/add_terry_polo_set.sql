BEGIN;

WITH product_data AS (
    SELECT
        md5('product:terry-polo-set')::uuid AS product_id,
        categories.id AS category_id,
        'terry-polo-set'::text AS slug,
        'The Terry Polo Set'::text AS name,
        'A soft white polo set with wide-leg trousers and patch pockets.'::text AS short_description,
        'The Terry Polo Set features a short sleeve polo and matching high-waisted, wide-leg trousers with patch pockets. Crafted from a soft, textured fabric, this effortless look is available in white.'::text AS description,
        'Machine wash cold on gentle cycle, wash with similar colors, and hang or lay flat to dry. Do not bleach.'::text AS fabric_care,
        58.00::numeric AS price,
        '/products/ruzo/terry-polo-set-01.webp'::text AS image_url
    FROM categories
    WHERE categories.slug = 'sets'
),
upsert_product AS (
    INSERT INTO products (
        id,
        slug,
        category_id,
        title_en,
        title_ar,
        name_en,
        name_ar,
        description_en,
        description_ar,
        short_description_en,
        short_description_ar,
        fabric_care_en,
        fabric_care_ar,
        price,
        sale_price,
        badge,
        active,
        video_url,
        created_at,
        updated_at
    )
    SELECT
        product_id,
        slug,
        category_id,
        name,
        name,
        name,
        name,
        description,
        description,
        short_description,
        short_description,
        fabric_care,
        fabric_care,
        price,
        NULL,
        NULL,
        TRUE,
        NULL,
        NOW(),
        NOW()
    FROM product_data
    ON CONFLICT (id) DO UPDATE SET
        slug = EXCLUDED.slug,
        category_id = EXCLUDED.category_id,
        title_en = EXCLUDED.title_en,
        title_ar = EXCLUDED.title_ar,
        name_en = EXCLUDED.name_en,
        name_ar = EXCLUDED.name_ar,
        description_en = EXCLUDED.description_en,
        description_ar = EXCLUDED.description_ar,
        short_description_en = EXCLUDED.short_description_en,
        short_description_ar = EXCLUDED.short_description_ar,
        fabric_care_en = EXCLUDED.fabric_care_en,
        fabric_care_ar = EXCLUDED.fabric_care_ar,
        price = EXCLUDED.price,
        sale_price = EXCLUDED.sale_price,
        badge = EXCLUDED.badge,
        active = EXCLUDED.active,
        video_url = EXCLUDED.video_url,
        updated_at = NOW()
    RETURNING id
)
INSERT INTO product_images (
    id,
    product_id,
    image_url,
    sort_order
)
SELECT
    md5('image:terry-polo-set:1')::uuid,
    product_id,
    image_url,
    1
FROM product_data
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    image_url = EXCLUDED.image_url,
    sort_order = EXCLUDED.sort_order;

WITH product_data AS (
    SELECT
        md5('product:terry-polo-set')::uuid AS product_id,
        '/products/ruzo/terry-polo-set-01.webp'::text AS image_url
),
variant_data AS (
    SELECT *
    FROM (VALUES
        ('XS'::text, 4),
        ('S'::text, 8),
        ('M'::text, 8),
        ('L'::text, 4)
    ) AS variants(size, stock)
)
INSERT INTO product_variants (
    id,
    product_id,
    color_name,
    color_hex,
    size,
    stock,
    image_url
)
SELECT
    md5('variant:terry-polo-set:' || variant_data.size)::uuid,
    product_data.product_id,
    'White',
    '#F7F5EF',
    variant_data.size,
    variant_data.stock,
    product_data.image_url
FROM product_data
CROSS JOIN variant_data
ON CONFLICT (id) DO UPDATE SET
    product_id = EXCLUDED.product_id,
    color_name = EXCLUDED.color_name,
    color_hex = EXCLUDED.color_hex,
    size = EXCLUDED.size,
    stock = EXCLUDED.stock,
    image_url = EXCLUDED.image_url;

COMMIT;
