BEGIN;

UPDATE order_items
SET product_id = NULL
WHERE product_id IS NOT NULL;

DELETE FROM reviews;
DELETE FROM product_images;
DELETE FROM product_variants;
DELETE FROM products;
DELETE FROM categories;

INSERT INTO categories (
    id,
    slug,
    name_en,
    name_ar,
    image_url,
    is_active,
    sort_order,
    created_at
) VALUES
    (
        '00000000-0000-0000-0000-000000000101',
        'sets',
        'Sets',
        U&'\0627\0644\0623\0637\0642\0645',
        NULL,
        TRUE,
        10,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000102',
        'dresses',
        'Dresses',
        U&'\0627\0644\0641\0633\0627\062A\064A\0646',
        NULL,
        TRUE,
        20,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000103',
        'bottoms',
        'Bottoms',
        U&'\0627\0644\0633\0631\0627\0648\064A\0644',
        NULL,
        TRUE,
        30,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000104',
        'tops',
        'Tops',
        U&'\0627\0644\0642\0645\0635\0627\0646',
        NULL,
        TRUE,
        40,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000105',
        'outerwear',
        'Outerwear',
        U&'\0627\0644\0645\0644\0627\0628\0633 \0627\0644\062E\0627\0631\062C\064A\0629',
        NULL,
        TRUE,
        50,
        NOW()
    );

COMMIT;
