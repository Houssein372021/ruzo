BEGIN;

SET client_encoding = 'UTF8';

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
        'الأطقم',
        '/products/ruzo/metallic-magenta-set-01.webp',
        TRUE,
        10,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000102',
        'dresses',
        'Dresses',
        'الفساتين',
        '/products/ruzo/black-midi-dress-01.webp',
        TRUE,
        20,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000103',
        'bottoms',
        'Bottoms',
        'السراويل',
        NULL,
        TRUE,
        30,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000104',
        'tops',
        'Tops',
        'القمصان',
        NULL,
        TRUE,
        40,
        NOW()
    ),
    (
        '00000000-0000-0000-0000-000000000105',
        'outerwear',
        'Outerwear',
        'الملابس الخارجية',
        NULL,
        TRUE,
        50,
        NOW()
    );

CREATE TEMP TABLE import_products (
    position INTEGER,
    slug TEXT PRIMARY KEY,
    category_slug TEXT NOT NULL,
    name_en TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    short_description_en TEXT NOT NULL,
    short_description_ar TEXT NOT NULL,
    description_en TEXT NOT NULL,
    description_ar TEXT NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    badge TEXT,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    stock_xs INTEGER NOT NULL,
    stock_s INTEGER NOT NULL,
    stock_m INTEGER NOT NULL,
    stock_l INTEGER NOT NULL
) ON COMMIT DROP;

INSERT INTO import_products (
    position,
    slug,
    category_slug,
    name_en,
    name_ar,
    short_description_en,
    short_description_ar,
    description_en,
    description_ar,
    price,
    badge,
    color_name,
    color_hex,
    stock_xs,
    stock_s,
    stock_m,
    stock_l
) VALUES
    (
        1,
        'metallic-magenta-set',
        'sets',
        'Metallic Magenta Set',
        'طقم ميتاليك ماجنتا',
        'A luminous two-piece set with a shirred strapless top and flowing maxi skirt.',
        'طقم لامع من قطعتين بتوب مكشكش بدون أكتاف وتنورة طويلة منسدلة.',
        'Designed as a statement set for evenings and destination edits, this metallic magenta look balances a fitted top with a relaxed full-length skirt.',
        'صمم هذا الطقم الميتاليك الماجنتا لإطلالة لافتة في السهرات والسفر، مع توازن بين التوب المحدد والتنورة الطويلة المريحة.',
        145.00,
        NULL,
        'Magenta',
        '#8A0F5A',
        4,
        6,
        6,
        4
    ),
    (
        2,
        'lemon-satin-set',
        'sets',
        'Lemon Satin Set',
        'طقم ساتان ليموني',
        'A soft lemon satin set with a sculpted top and fluid long skirt.',
        'طقم ساتان ليموني ناعم بتوب محدد وتنورة طويلة منسدلة.',
        'This satin set brings a polished resort feel through soft shine, an open neckline, and a long skirt made for warm-day movement.',
        'يمنح هذا الطقم الساتان إحساسا صيفيا أنيقا بلمعته الناعمة وقصته المفتوحة وتنورته الطويلة سهلة الحركة.',
        132.00,
        NULL,
        'Lemon',
        '#E6D778',
        5,
        8,
        8,
        5
    ),
    (
        3,
        'black-midi-dress',
        'dresses',
        'Black Midi Dress',
        'فستان أسود ميدي',
        'A clean black midi dress with a structured waist and soft volume.',
        'فستان أسود ميدي بقصة نظيفة وخصر محدد وحجم ناعم.',
        'A refined black dress for everyday polish, cut with a V neckline, a shaped bodice, and a midi skirt that feels easy but elevated.',
        'فستان أسود راق للاستخدام اليومي، بقبة على شكل V وخصر محدد وتنورة ميدي تجمع بين الراحة والأناقة.',
        118.00,
        NULL,
        'Black',
        '#080808',
        4,
        7,
        7,
        4
    ),
    (
        4,
        'red-halter-dress',
        'dresses',
        'Red Halter Dress',
        'فستان أحمر هالتر',
        'A vivid red halter dress with a front keyhole and soft tie detail.',
        'فستان أحمر هالتر بفتحة أمامية وربطة ناعمة.',
        'Made for a strong summer silhouette, this halter dress has a fluid drape, front cutout, and a confident red satin finish.',
        'صمم هذا الفستان الهالتر لإطلالة صيفية قوية بقصة منسدلة وفتحة أمامية ولمسة ساتان حمراء لافتة.',
        122.00,
        NULL,
        'Red',
        '#B20D1C',
        3,
        6,
        6,
        3
    ),
    (
        5,
        'white-mini-dress',
        'dresses',
        'White Mini Dress',
        'فستان أبيض قصير',
        'A fresh white mini dress with a relaxed strapless shape.',
        'فستان أبيض قصير بقصة مريحة بدون أكتاف.',
        'Light, clean, and simple, this white mini dress is cut for warm days with an easy swing shape and minimal finish.',
        'فستان أبيض خفيف وبسيط يناسب الأيام الدافئة بقصة واسعة سهلة ولمسة نظيفة.',
        92.00,
        NULL,
        'White',
        '#F7F3EA',
        5,
        8,
        8,
        5
    ),
    (
        6,
        'pink-floral-mini-dress',
        'dresses',
        'Pink Floral Mini Dress',
        'فستان وردي مزهر قصير',
        'A romantic pink floral mini dress with a soft flared skirt.',
        'فستان وردي مزهر قصير بتنورة ناعمة واسعة.',
        'A feminine mini dress with delicate floral print, short sleeves, and a flared hem that brings an effortless daytime mood.',
        'فستان قصير أنثوي بطبعة زهور ناعمة وأكمام قصيرة وحافة واسعة لإطلالة يومية خفيفة.',
        98.00,
        NULL,
        'Pink Floral',
        '#F3C4D3',
        4,
        7,
        7,
        4
    ),
    (
        7,
        'taupe-fitted-maxi-dress',
        'dresses',
        'Taupe Fitted Maxi Dress',
        'فستان تاوب ماكسي محدد',
        'A fitted taupe maxi dress with a clean column silhouette.',
        'فستان تاوب ماكسي محدد بقصة عمودية نظيفة.',
        'This taupe maxi dress follows the body with a smooth, minimal line, making it a quiet statement piece for day-to-night styling.',
        'يتبع هذا الفستان التاوب الماكسي شكل الجسم بخط ناعم وبسيط، ليكون قطعة أنيقة من النهار إلى المساء.',
        112.00,
        NULL,
        'Taupe',
        '#B79AA1',
        4,
        6,
        6,
        4
    ),
    (
        8,
        'black-satin-short-set',
        'sets',
        'Black Satin Short Set',
        'طقم ساتان أسود قصير',
        'A black satin short set with sculptural knot closures.',
        'طقم ساتان أسود قصير بتفاصيل عقد بارزة.',
        'A polished black satin set pairing tailored shorts with a structured top and sculptural fastenings for a bold evening feel.',
        'طقم ساتان أسود أنيق يجمع بين شورت مفصل وتوب منظم بتفاصيل عقد بارزة لإطلالة مسائية قوية.',
        126.00,
        NULL,
        'Black',
        '#080808',
        3,
        6,
        6,
        3
    ),
    (
        9,
        'black-contrast-short-set',
        'sets',
        'Black Contrast Short Set',
        'طقم شورت أسود بتفاصيل متباينة',
        'A sporty black short set finished with crisp contrast edging.',
        'طقم شورت أسود بطابع رياضي وحواف متباينة واضحة.',
        'A modern short set with a relaxed top, clean black base, and white contrast trim that keeps the look sharp and easy.',
        'طقم شورت عصري بتوب مريح وقاعدة سوداء وحواف بيضاء متباينة تمنح الإطلالة وضوحا وسهولة.',
        104.00,
        NULL,
        'Black Contrast',
        '#11131A',
        4,
        7,
        7,
        4
    ),
    (
        10,
        'sheer-shirt-trouser-set',
        'sets',
        'Sheer Shirt Trouser Set',
        'طقم قميص شفاف وبنطال',
        'A sheer black shirt paired with wide grey trousers.',
        'قميص أسود شفاف مع بنطال رمادي واسع.',
        'This city-ready set pairs a translucent black shirt with tailored grey trousers for a crisp, elevated wardrobe moment.',
        'يجمع هذا الطقم الحضري بين قميص أسود شفاف وبنطال رمادي مفصل لإطلالة راقية وواضحة.',
        132.00,
        NULL,
        'Black / Grey',
        '#2F2F32',
        4,
        7,
        7,
        4
    ),
    (
        11,
        'ivory-satin-trouser-set',
        'sets',
        'Ivory Satin Trouser Set',
        'طقم ساتان عاجي وبنطال',
        'An ivory satin trouser set with a sleeveless soft top.',
        'طقم ساتان عاجي مع توب ناعم بدون أكمام وبنطال واسع.',
        'A luminous ivory set made with a fluid sleeveless top and matching wide trousers for a polished relaxed silhouette.',
        'طقم عاجي لامع بتوب بدون أكمام وبنطال واسع مطابق لإطلالة مريحة وراقية.',
        132.00,
        NULL,
        'Ivory',
        '#EFE7D7',
        4,
        7,
        7,
        4
    ),
    (
        12,
        'pearl-satin-trouser-set',
        'sets',
        'Pearl Satin Trouser Set',
        'طقم ساتان لؤلؤي وبنطال',
        'A pale pearl satin trouser set with a delicate tie-front top.',
        'طقم ساتان لؤلؤي فاتح مع توب بربطة أمامية ناعمة.',
        'Soft and luminous, this pearl satin set combines an easy tie-front top with wide trousers for a refined summer look.',
        'طقم ساتان لؤلؤي ناعم يجمع توبا بربطة أمامية مع بنطال واسع لإطلالة صيفية راقية.',
        128.00,
        NULL,
        'Pearl',
        '#E8E8F4',
        4,
        7,
        7,
        4
    ),
    (
        13,
        'terry-polo-set',
        'sets',
        'The Terry Polo Set',
        'The Terry Polo Set',
        'A soft white polo set with wide-leg trousers and patch pockets.',
        'A soft white polo set with wide-leg trousers and patch pockets.',
        'The Terry Polo Set features a short sleeve polo and matching high-waisted, wide-leg trousers with patch pockets. Crafted from a soft, textured fabric, this effortless look is available in white.',
        'The Terry Polo Set features a short sleeve polo and matching high-waisted, wide-leg trousers with patch pockets. Crafted from a soft, textured fabric, this effortless look is available in white.',
        58.00,
        NULL,
        'White',
        '#F7F5EF',
        4,
        8,
        8,
        4
    );

CREATE TEMP TABLE import_product_images (
    slug TEXT NOT NULL,
    image_url TEXT NOT NULL,
    sort_order INTEGER NOT NULL
) ON COMMIT DROP;

INSERT INTO import_product_images (slug, image_url, sort_order) VALUES
    ('metallic-magenta-set', '/products/ruzo/metallic-magenta-set-01.webp', 1),
    ('metallic-magenta-set', '/products/ruzo/metallic-magenta-set-02.webp', 2),
    ('metallic-magenta-set', '/products/ruzo/metallic-magenta-set-03.webp', 3),
    ('metallic-magenta-set', '/products/ruzo/metallic-magenta-set-04.webp', 4),
    ('lemon-satin-set', '/products/ruzo/lemon-satin-set-01.webp', 1),
    ('lemon-satin-set', '/products/ruzo/lemon-satin-set-02.webp', 2),
    ('lemon-satin-set', '/products/ruzo/lemon-satin-set-03.webp', 3),
    ('lemon-satin-set', '/products/ruzo/lemon-satin-set-04.webp', 4),
    ('lemon-satin-set', '/products/ruzo/lemon-satin-set-05.webp', 5),
    ('lemon-satin-set', '/products/ruzo/lemon-satin-set-06.webp', 6),
    ('lemon-satin-set', '/products/ruzo/lemon-satin-set-07.webp', 7),
    ('black-midi-dress', '/products/ruzo/black-midi-dress-01.webp', 1),
    ('black-midi-dress', '/products/ruzo/black-midi-dress-02.webp', 2),
    ('black-midi-dress', '/products/ruzo/black-midi-dress-03.webp', 3),
    ('red-halter-dress', '/products/ruzo/red-halter-dress-01.webp', 1),
    ('red-halter-dress', '/products/ruzo/red-halter-dress-02.webp', 2),
    ('white-mini-dress', '/products/ruzo/white-mini-dress-01.webp', 1),
    ('white-mini-dress', '/products/ruzo/white-mini-dress-02.webp', 2),
    ('white-mini-dress', '/products/ruzo/white-mini-dress-03.webp', 3),
    ('pink-floral-mini-dress', '/products/ruzo/pink-floral-mini-dress-01.webp', 1),
    ('pink-floral-mini-dress', '/products/ruzo/pink-floral-mini-dress-02.webp', 2),
    ('pink-floral-mini-dress', '/products/ruzo/pink-floral-mini-dress-03.webp', 3),
    ('pink-floral-mini-dress', '/products/ruzo/pink-floral-mini-dress-04.webp', 4),
    ('taupe-fitted-maxi-dress', '/products/ruzo/taupe-fitted-maxi-dress-01.webp', 1),
    ('taupe-fitted-maxi-dress', '/products/ruzo/taupe-fitted-maxi-dress-02.webp', 2),
    ('taupe-fitted-maxi-dress', '/products/ruzo/taupe-fitted-maxi-dress-03.webp', 3),
    ('black-satin-short-set', '/products/ruzo/black-satin-short-set-01.webp', 1),
    ('black-satin-short-set', '/products/ruzo/black-satin-short-set-02.webp', 2),
    ('black-satin-short-set', '/products/ruzo/black-satin-short-set-03.webp', 3),
    ('black-contrast-short-set', '/products/ruzo/black-contrast-short-set-01.webp', 1),
    ('sheer-shirt-trouser-set', '/products/ruzo/sheer-shirt-trouser-set-01.webp', 1),
    ('sheer-shirt-trouser-set', '/products/ruzo/sheer-shirt-trouser-set-02.webp', 2),
    ('sheer-shirt-trouser-set', '/products/ruzo/sheer-shirt-trouser-set-03.webp', 3),
    ('ivory-satin-trouser-set', '/products/ruzo/ivory-satin-trouser-set-01.webp', 1),
    ('ivory-satin-trouser-set', '/products/ruzo/ivory-satin-trouser-set-02.webp', 2),
    ('ivory-satin-trouser-set', '/products/ruzo/ivory-satin-trouser-set-03.webp', 3),
    ('pearl-satin-trouser-set', '/products/ruzo/pearl-satin-trouser-set-01.webp', 1),
    ('pearl-satin-trouser-set', '/products/ruzo/pearl-satin-trouser-set-02.webp', 2),
    ('terry-polo-set', '/products/ruzo/terry-polo-set-01.webp', 1);

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
    price,
    sale_price,
    badge,
    active,
    video_url,
    created_at,
    updated_at
)
SELECT
    md5('product:' || import_products.slug)::uuid,
    import_products.slug,
    categories.id,
    import_products.name_en,
    import_products.name_ar,
    import_products.name_en,
    import_products.name_ar,
    import_products.description_en,
    import_products.description_ar,
    import_products.short_description_en,
    import_products.short_description_ar,
    import_products.price,
    NULL,
    import_products.badge,
    TRUE,
    NULL,
    NOW() - (import_products.position || ' minutes')::interval,
    NOW()
FROM import_products
JOIN categories ON categories.slug = import_products.category_slug;

INSERT INTO product_images (
    id,
    product_id,
    image_url,
    sort_order
)
SELECT
    md5('image:' || import_product_images.slug || ':' || import_product_images.sort_order)::uuid,
    md5('product:' || import_product_images.slug)::uuid,
    import_product_images.image_url,
    import_product_images.sort_order
FROM import_product_images;

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
    md5('variant:' || import_products.slug || ':' || variant_sizes.size)::uuid,
    md5('product:' || import_products.slug)::uuid,
    import_products.color_name,
    import_products.color_hex,
    variant_sizes.size,
    variant_sizes.stock,
    first_images.image_url
FROM import_products
CROSS JOIN LATERAL (
    VALUES
        ('XS', import_products.stock_xs),
        ('S', import_products.stock_s),
        ('M', import_products.stock_m),
        ('L', import_products.stock_l)
) AS variant_sizes(size, stock)
JOIN LATERAL (
    SELECT image_url
    FROM import_product_images
    WHERE import_product_images.slug = import_products.slug
    ORDER BY sort_order
    LIMIT 1
) AS first_images ON TRUE;

COMMIT;
