do $$
declare
    orders_id_type text;
begin
    select data_type
    into orders_id_type
    from information_schema.columns
    where table_schema = current_schema()
      and table_name = 'orders'
      and column_name = 'id';

    if orders_id_type = 'bigint' then
        alter table order_items drop constraint if exists fkbioxgbv59vetrxe0ejfubep1w;
        alter table orders drop constraint if exists fkpxtb8awmi0dk6smoh2vp1litg;

        alter table order_items drop constraint if exists order_items_pkey;
        alter table orders drop constraint if exists orders_pkey;
        alter table customers drop constraint if exists customers_pkey;

        alter table customers add column if not exists id_uuid uuid;
        update customers
        set id_uuid = md5('ruzo-customer-' || id::text)::uuid
        where id_uuid is null;

        alter table orders add column if not exists id_uuid uuid;
        update orders
        set id_uuid = md5('ruzo-order-' || id::text)::uuid
        where id_uuid is null;

        alter table orders add column if not exists customer_id_uuid uuid;
        update orders o
        set customer_id_uuid = c.id_uuid
        from customers c
        where o.customer_id = c.id
          and o.customer_id_uuid is null;

        alter table order_items add column if not exists id_uuid uuid;
        update order_items
        set id_uuid = md5('ruzo-order-item-' || id::text)::uuid
        where id_uuid is null;

        alter table order_items add column if not exists order_id_uuid uuid;
        update order_items oi
        set order_id_uuid = o.id_uuid
        from orders o
        where oi.order_id = o.id
          and oi.order_id_uuid is null;

        alter table order_items drop column order_id;
        alter table orders drop column customer_id;
        alter table order_items drop column id;
        alter table orders drop column id;
        alter table customers drop column id;

        alter table customers rename column id_uuid to id;
        alter table orders rename column id_uuid to id;
        alter table orders rename column customer_id_uuid to customer_id;
        alter table order_items rename column id_uuid to id;
        alter table order_items rename column order_id_uuid to order_id;

        alter table customers alter column id set not null;
        alter table orders alter column id set not null;
        alter table orders alter column customer_id set not null;
        alter table order_items alter column id set not null;
        alter table order_items alter column order_id set not null;

        alter table customers add constraint customers_pkey primary key (id);
        alter table orders add constraint orders_pkey primary key (id);
        alter table order_items add constraint order_items_pkey primary key (id);

        alter table orders
            add constraint fkpxtb8awmi0dk6smoh2vp1litg
            foreign key (customer_id) references customers(id);

        alter table order_items
            add constraint fkbioxgbv59vetrxe0ejfubep1w
            foreign key (order_id) references orders(id);
    end if;
end $$;
