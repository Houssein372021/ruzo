update categories
set
    is_active = true,
    image_url = case slug
        when 'sets' then '/products/set-front.png'
        when 'sport-bras' then '/products/sports-bra-front.png'
        when 'sports-bras' then '/products/sports-bra-front.png'
        when 'bottoms' then '/products/bottoms-front.png'
        else image_url
    end
where slug in ('sets', 'sport-bras', 'sports-bras', 'bottoms');

insert into products (
    id,
    slug,
    category_id,
    title_en,
    title_ar,
    name_en,
    name_ar,
    description_en,
    description_ar,
    price,
    sale_price,
    badge,
    active,
    video_url,
    created_at,
    updated_at
) values (
    md5('ruzo-product-sculpt-set')::uuid,
    'ruzo-sculpt-set',
    (select id from categories where slug = 'sets'),
    'Rüzo Sculpt Set',
    'طقم روزو سكلبت',
    'Rüzo Sculpt Set',
    'طقم روزو سكلبت',
    'A polished activewear set with a supportive sports bra and sculpting high waist leggings for studio, travel, and everyday movement.',
    'طقم رياضي ناعم يضم حمالة صدر داعمة وليقنز بخصر عال لاطلالة انيقة ومريحة.',
    72.00,
    null,
    'NEW',
    true,
    '/hero.mp4',
    now(),
    now()
) on conflict (slug) do update set
    category_id = excluded.category_id,
    title_en = excluded.title_en,
    title_ar = excluded.title_ar,
    name_en = excluded.name_en,
    name_ar = excluded.name_ar,
    description_en = excluded.description_en,
    description_ar = excluded.description_ar,
    price = excluded.price,
    sale_price = excluded.sale_price,
    badge = excluded.badge,
    active = true,
    video_url = excluded.video_url,
    updated_at = now();

insert into products (
    id,
    slug,
    category_id,
    title_en,
    title_ar,
    name_en,
    name_ar,
    description_en,
    description_ar,
    price,
    sale_price,
    badge,
    active,
    video_url,
    created_at,
    updated_at
) values (
    md5('ruzo-product-luxe-sports-bra')::uuid,
    'luxe-support-sports-bra',
    coalesce(
        (select id from categories where slug = 'sport-bras' limit 1),
        (select id from categories where slug = 'sports-bras' limit 1)
    ),
    'Luxe Support Sport Bra',
    'حمالة لوكس سبورت',
    'Luxe Support Sport Bra',
    'حمالة لوكس سبورت',
    'A smooth medium support bra with a clean scoop neckline, soft stretch, and refined stitching details.',
    'حمالة رياضية بدعم متوسط وقصة ناعمة مع قماش مرن وتفاصيل خياطة راقية.',
    42.00,
    null,
    'BEST_SELLER',
    true,
    '/hero.mp4',
    now(),
    now()
) on conflict (slug) do update set
    category_id = excluded.category_id,
    title_en = excluded.title_en,
    title_ar = excluded.title_ar,
    name_en = excluded.name_en,
    name_ar = excluded.name_ar,
    description_en = excluded.description_en,
    description_ar = excluded.description_ar,
    price = excluded.price,
    sale_price = excluded.sale_price,
    badge = excluded.badge,
    active = true,
    video_url = excluded.video_url,
    updated_at = now();

insert into products (
    id,
    slug,
    category_id,
    title_en,
    title_ar,
    name_en,
    name_ar,
    description_en,
    description_ar,
    price,
    sale_price,
    badge,
    active,
    video_url,
    created_at,
    updated_at
) values (
    md5('ruzo-product-elevate-leggings')::uuid,
    'elevate-high-waist-leggings',
    (select id from categories where slug = 'bottoms'),
    'Elevate High Waist Leggings',
    'ليقنز اليفيت بخصر عال',
    'Elevate High Waist Leggings',
    'ليقنز اليفيت بخصر عال',
    'High waist leggings designed with a sculpting V seam, smooth compression, and a soft second skin feel.',
    'ليقنز بخصر عال وقصة منحوتة مع ضغط ناعم وملمس مريح كطبقة ثانية.',
    54.00,
    null,
    'LIMITED',
    true,
    '/hero.mp4',
    now(),
    now()
) on conflict (slug) do update set
    category_id = excluded.category_id,
    title_en = excluded.title_en,
    title_ar = excluded.title_ar,
    name_en = excluded.name_en,
    name_ar = excluded.name_ar,
    description_en = excluded.description_en,
    description_ar = excluded.description_ar,
    price = excluded.price,
    sale_price = excluded.sale_price,
    badge = excluded.badge,
    active = true,
    video_url = excluded.video_url,
    updated_at = now();

delete from product_variants
where product_id in (
    select id from products
    where slug in ('ruzo-sculpt-set', 'luxe-support-sports-bra', 'elevate-high-waist-leggings')
);

delete from product_images
where product_id in (
    select id from products
    where slug in ('ruzo-sculpt-set', 'luxe-support-sports-bra', 'elevate-high-waist-leggings')
);

insert into product_images (id, product_id, image_url, sort_order)
select
    md5('ruzo-image-sculpt-set-' || sort_order)::uuid,
    (select id from products where slug = 'ruzo-sculpt-set'),
    image_url,
    sort_order
from (values
    (1, '/products/set-front.png'),
    (2, '/products/set-back.png'),
    (3, '/products/set-angle-detail.png'),
    (4, '/products/set-black.png'),
    (5, '/products/set-ivory.png'),
    (6, '/products/set-taupe.png'),
    (7, '/products/set-rose.png')
) as images(sort_order, image_url);

insert into product_images (id, product_id, image_url, sort_order)
select
    md5('ruzo-image-sports-bra-' || sort_order)::uuid,
    (select id from products where slug = 'luxe-support-sports-bra'),
    image_url,
    sort_order
from (values
    (1, '/products/sports-bra-front.png'),
    (2, '/products/sports-bra-back.png'),
    (3, '/products/sports-bra-details.png'),
    (4, '/products/sports-bra-beige.png'),
    (5, '/products/sports-bra-black.png'),
    (6, '/products/sports-bra-ivory.png'),
    (7, '/products/sports-bra-taupe.png'),
    (8, '/products/sports-bra-rose.png')
) as images(sort_order, image_url);

insert into product_images (id, product_id, image_url, sort_order)
select
    md5('ruzo-image-bottoms-' || sort_order)::uuid,
    (select id from products where slug = 'elevate-high-waist-leggings'),
    image_url,
    sort_order
from (values
    (1, '/products/bottoms-front.png'),
    (2, '/products/bottoms-back.png'),
    (3, '/products/bottoms-angle-detail.png'),
    (4, '/products/bottoms-rose.png'),
    (5, '/products/bottoms-black.png'),
    (6, '/products/bottoms-ivory.png')
) as images(sort_order, image_url);

insert into product_variants (id, product_id, color_name, color_hex, size, stock, image_url)
select
    md5('ruzo-variant-sculpt-set-' || lower(color_name) || '-' || lower(size))::uuid,
    (select id from products where slug = 'ruzo-sculpt-set'),
    color_name,
    color_hex,
    size,
    stock,
    image_url
from (values
    ('Black', '#111111', '/products/set-black.png', 'XS', 8),
    ('Black', '#111111', '/products/set-black.png', 'S', 10),
    ('Black', '#111111', '/products/set-black.png', 'M', 10),
    ('Black', '#111111', '/products/set-black.png', 'L', 7),
    ('Ivory', '#F5EFE3', '/products/set-ivory.png', 'XS', 7),
    ('Ivory', '#F5EFE3', '/products/set-ivory.png', 'S', 9),
    ('Ivory', '#F5EFE3', '/products/set-ivory.png', 'M', 9),
    ('Ivory', '#F5EFE3', '/products/set-ivory.png', 'L', 6),
    ('Taupe', '#BCA895', '/products/set-taupe.png', 'XS', 6),
    ('Taupe', '#BCA895', '/products/set-taupe.png', 'S', 8),
    ('Taupe', '#BCA895', '/products/set-taupe.png', 'M', 8),
    ('Taupe', '#BCA895', '/products/set-taupe.png', 'L', 5),
    ('Rose', '#D88FA1', '/products/set-rose.png', 'XS', 6),
    ('Rose', '#D88FA1', '/products/set-rose.png', 'S', 8),
    ('Rose', '#D88FA1', '/products/set-rose.png', 'M', 8),
    ('Rose', '#D88FA1', '/products/set-rose.png', 'L', 5)
) as variants(color_name, color_hex, image_url, size, stock);

insert into product_variants (id, product_id, color_name, color_hex, size, stock, image_url)
select
    md5('ruzo-variant-sports-bra-' || lower(color_name) || '-' || lower(size))::uuid,
    (select id from products where slug = 'luxe-support-sports-bra'),
    color_name,
    color_hex,
    size,
    stock,
    image_url
from (values
    ('Black', '#111111', '/products/sports-bra-black.png', 'XS', 12),
    ('Black', '#111111', '/products/sports-bra-black.png', 'S', 14),
    ('Black', '#111111', '/products/sports-bra-black.png', 'M', 14),
    ('Black', '#111111', '/products/sports-bra-black.png', 'L', 10),
    ('Ivory', '#F5EFE3', '/products/sports-bra-ivory.png', 'XS', 10),
    ('Ivory', '#F5EFE3', '/products/sports-bra-ivory.png', 'S', 12),
    ('Ivory', '#F5EFE3', '/products/sports-bra-ivory.png', 'M', 12),
    ('Ivory', '#F5EFE3', '/products/sports-bra-ivory.png', 'L', 9),
    ('Taupe', '#BCA895', '/products/sports-bra-taupe.png', 'XS', 9),
    ('Taupe', '#BCA895', '/products/sports-bra-taupe.png', 'S', 11),
    ('Taupe', '#BCA895', '/products/sports-bra-taupe.png', 'M', 11),
    ('Taupe', '#BCA895', '/products/sports-bra-taupe.png', 'L', 8),
    ('Rose', '#D88FA1', '/products/sports-bra-rose.png', 'XS', 9),
    ('Rose', '#D88FA1', '/products/sports-bra-rose.png', 'S', 11),
    ('Rose', '#D88FA1', '/products/sports-bra-rose.png', 'M', 11),
    ('Rose', '#D88FA1', '/products/sports-bra-rose.png', 'L', 8),
    ('Beige', '#D8C3A5', '/products/sports-bra-beige.png', 'XS', 8),
    ('Beige', '#D8C3A5', '/products/sports-bra-beige.png', 'S', 10),
    ('Beige', '#D8C3A5', '/products/sports-bra-beige.png', 'M', 10),
    ('Beige', '#D8C3A5', '/products/sports-bra-beige.png', 'L', 7)
) as variants(color_name, color_hex, image_url, size, stock);

insert into product_variants (id, product_id, color_name, color_hex, size, stock, image_url)
select
    md5('ruzo-variant-bottoms-' || lower(color_name) || '-' || lower(size))::uuid,
    (select id from products where slug = 'elevate-high-waist-leggings'),
    color_name,
    color_hex,
    size,
    stock,
    image_url
from (values
    ('Black', '#111111', '/products/bottoms-black.png', 'XS', 10),
    ('Black', '#111111', '/products/bottoms-black.png', 'S', 12),
    ('Black', '#111111', '/products/bottoms-black.png', 'M', 12),
    ('Black', '#111111', '/products/bottoms-black.png', 'L', 9),
    ('Ivory', '#F5EFE3', '/products/bottoms-ivory.png', 'XS', 8),
    ('Ivory', '#F5EFE3', '/products/bottoms-ivory.png', 'S', 10),
    ('Ivory', '#F5EFE3', '/products/bottoms-ivory.png', 'M', 10),
    ('Ivory', '#F5EFE3', '/products/bottoms-ivory.png', 'L', 7),
    ('Taupe', '#BCA895', '/products/bottoms-front.png', 'XS', 7),
    ('Taupe', '#BCA895', '/products/bottoms-front.png', 'S', 9),
    ('Taupe', '#BCA895', '/products/bottoms-front.png', 'M', 9),
    ('Taupe', '#BCA895', '/products/bottoms-front.png', 'L', 6),
    ('Rose', '#D88FA1', '/products/bottoms-rose.png', 'XS', 8),
    ('Rose', '#D88FA1', '/products/bottoms-rose.png', 'S', 10),
    ('Rose', '#D88FA1', '/products/bottoms-rose.png', 'M', 10),
    ('Rose', '#D88FA1', '/products/bottoms-rose.png', 'L', 7)
) as variants(color_name, color_hex, image_url, size, stock);
