-- Tabla Productos

SELECT 
    p.ID AS product_id,
    p.post_parent AS parent_id,
    p.post_title AS title,
    p.post_content AS description,
    p.post_excerpt AS short_desc,
    p.post_date AS created_at,
    p.post_modified AS updated_at,
    NULLIF(pm_length.meta_value, '') AS length,
    NULLIF(pm_width.meta_value, '') AS width,
    NULLIF(pm_height.meta_value, '') AS height,
    NULLIF(pm_weight.meta_value, '') AS weight,
    (
        SELECT MIN(t.term_id)
        FROM wp_term_relationships tr
        INNER JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id AND tt.taxonomy = 'pa_marcas'
        INNER JOIN wp_terms t ON tt.term_id = t.term_id
        WHERE tr.object_id = p.ID
    ) AS brand_id,
    p.post_name AS slug,
    CASE 
        WHEN p.post_type = 'product_variation' THEN 'variable'
        WHEN p.post_type = 'product' THEN 
            COALESCE(pm_type.meta_value, 'simple') 
        ELSE 'external'
    END AS product_type
FROM wp_posts p
LEFT JOIN wp_postmeta pm_length   ON p.ID = pm_length.post_id AND pm_length.meta_key = '_length'
LEFT JOIN wp_postmeta pm_width    ON p.ID = pm_width.post_id AND pm_width.meta_key = '_width'
LEFT JOIN wp_postmeta pm_height   ON p.ID = pm_height.post_id AND pm_height.meta_key = '_height'
LEFT JOIN wp_postmeta pm_weight   ON p.ID = pm_weight.post_id AND pm_weight.meta_key = '_weight'
LEFT JOIN wp_postmeta pm_type     ON p.ID = pm_type.post_id AND pm_type.meta_key = '_product_type'
LEFT JOIN wp_postmeta pm_parent   ON p.ID = pm_parent.post_id AND pm_parent.meta_key = '_parent_id'
WHERE p.post_type IN ('product', 'product_variation')
  AND p.post_status IN ('publish', 'draft', 'pending');

-- Tabla Productos Meta
SELECT 
    p.ID AS product_id,
    sku.meta_value AS sku,
    price.meta_value AS price,
    regular_price.meta_value AS regular_price,
    sale_price.meta_value AS sale_price,
    sale_start.meta_value AS sale_start,
    sale_end.meta_value AS sale_end,
    stock.meta_value AS stock,
    stock_status.meta_value AS stock_status,
    CASE 
        WHEN p.post_status = 'publish' THEN 'visible'
        ELSE 'hidden'
    END AS visibility,
    GROUP_CONCAT(DISTINCT wt.name SEPARATOR ', ') AS keywords
FROM wp_posts p
LEFT JOIN wp_postmeta sku           ON p.ID = sku.post_id AND sku.meta_key = '_sku'
LEFT JOIN wp_postmeta price         ON p.ID = price.post_id AND price.meta_key = '_price'
LEFT JOIN wp_postmeta regular_price ON p.ID = regular_price.post_id AND regular_price.meta_key = '_regular_price'
LEFT JOIN wp_postmeta sale_price    ON p.ID = sale_price.post_id AND sale_price.meta_key = '_sale_price'
LEFT JOIN wp_postmeta sale_start    ON p.ID = sale_start.post_id AND sale_start.meta_key = '_sale_price_dates_from'
LEFT JOIN wp_postmeta sale_end      ON p.ID = sale_end.post_id AND sale_end.meta_key = '_sale_price_dates_to'
LEFT JOIN wp_postmeta stock         ON p.ID = stock.post_id AND stock.meta_key = '_stock'
LEFT JOIN wp_postmeta stock_status  ON p.ID = stock_status.post_id AND stock_status.meta_key = '_stock_status'
LEFT JOIN wp_term_relationships wtr ON p.ID = wtr.object_id
LEFT JOIN wp_term_taxonomy wtt ON wtr.term_taxonomy_id = wtt.term_taxonomy_id AND wtt.taxonomy = 'product_tag'
LEFT JOIN wp_terms wt ON wtt.term_id = wt.term_id
WHERE p.post_type IN ('product', 'product_variation')
GROUP BY 
    p.ID,
    sku.meta_value,
    price.meta_value,
    regular_price.meta_value,
    sale_price.meta_value,
    sale_start.meta_value,
    sale_end.meta_value,
    stock.meta_value,
    stock_status.meta_value,
    p.post_status;

-- Tabla Marcas

SELECT 
    t.term_id AS brand_id,
    t.name AS name
FROM wp_terms t
INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'pa_marcas';

-- Tabla Categorias

SELECT
    t.term_id AS category_id,
    t.name AS name,
    NULLIF(tt.parent, 0) AS parent_id
FROM wp_terms t
INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy = 'product_cat';

-- Tabla Producto Categoria

SELECT
    p.ID AS product_id,
    tt.term_id AS category_id
FROM wp_posts p
INNER JOIN wp_term_relationships tr ON p.ID = tr.object_id
INNER JOIN wp_term_taxonomy tt ON tr.term_taxonomy_id = tt.term_taxonomy_id
WHERE p.post_type IN ('product', 'product_variation')
  AND tt.taxonomy = 'product_cat';

-- Tabla Atributos

SELECT
    MIN(tt.term_taxonomy_id) AS attribute_id,
    REPLACE(tt.taxonomy, 'pa_', '') AS name
FROM wp_term_taxonomy tt
WHERE tt.taxonomy LIKE 'pa_%'
  AND tt.taxonomy <> 'pa_marcas'
GROUP BY tt.taxonomy;

-- Tabla Atributos Valores

SELECT
    t.term_id AS value_id,
    (SELECT MIN(tt2.term_taxonomy_id)
     FROM wp_term_taxonomy tt2
     WHERE tt2.taxonomy = tt.taxonomy) AS attribute_id,
    t.name AS value
FROM wp_terms t
INNER JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
WHERE tt.taxonomy LIKE 'pa_%'
  AND (SELECT MIN(tt2.term_taxonomy_id)
       FROM wp_term_taxonomy tt2
       WHERE tt2.taxonomy = tt.taxonomy) <> 18;

-- Tabla Producto Valor

SELECT 
    p.ID AS product_id,
    t.term_id AS value_id
FROM wp_posts p
JOIN wp_postmeta pm 
    ON p.ID = pm.post_id 
    AND pm.meta_key LIKE 'attribute_pa_%'
JOIN wp_terms t 
    ON t.slug = pm.meta_value
JOIN wp_term_taxonomy tt 
    ON t.term_id = tt.term_id 
    AND tt.taxonomy = REPLACE(pm.meta_key, 'attribute_', '') -- ejemplo: 'attribute_pa_color' -> 'pa_color'
WHERE p.post_type = 'product_variation'

-- Tabla Usuario

SELECT
    u.ID AS user_id,
    u.user_email AS email,
    u.user_pass AS password_hash,
    CASE
        WHEN um.meta_value LIKE '%customer%' THEN 'customer'
        WHEN um.meta_value LIKE '%administrator%' THEN 'admin'
        ELSE 'customer' -- Valor por defecto si se omite el rol
    END AS role
FROM wp_users u
JOIN wp_usermeta um ON um.user_id = u.ID
WHERE um.meta_key = 'wp_capabilities'
  AND (
      um.meta_value LIKE '%customer%' OR
      um.meta_value LIKE '%administrator%'
  );

-- Tabla Cliente (Registrado o Invitado)

SELECT 
    u.ID AS customer_id,
    u.ID AS user_id,
    MAX(CASE WHEN um.meta_key = 'billing_rut' THEN um.meta_value END) AS rut,
    MAX(CASE WHEN um.meta_key = 'first_name' THEN um.meta_value END) AS first_name,
    MAX(CASE WHEN um.meta_key = 'last_name' THEN um.meta_value END) AS last_name,
    MAX(CASE WHEN um.meta_key = 'billing_phone' THEN um.meta_value END) AS phone,
FROM wp_users u
LEFT JOIN wp_usermeta um ON um.user_id = u.ID
GROUP BY u.ID;

-- Tabla Direccion

SELECT
    u.ID AS address_id,
    u.ID AS customer_id,
    MAX(CASE WHEN um.meta_key = 'billing_address_1' THEN um.meta_value END) AS address_line1,
    MAX(CASE WHEN um.meta_key = 'billing_address_2' THEN um.meta_value END) AS address_line2,
    MAX(CASE WHEN um.meta_key = 'billing_city' THEN um.meta_value END) AS city_id,
    MAX(CASE WHEN um.meta_key = 'billing_state' THEN um.meta_value END) AS state_id,
FROM wp_users u
JOIN wp_usermeta um ON u.ID = um.user_id
JOIN wp_usermeta caps ON caps.user_id = u.ID
WHERE caps.meta_key = 'wp_capabilities'
GROUP BY u.ID

-- Tabla Ordenes

SELECT
    p.ID AS order_id,

    CASE 
        WHEN CAST(customer_user_meta.meta_value AS UNSIGNED) = 0 THEN NULL
        ELSE CAST(customer_user_meta.meta_value AS UNSIGNED)
    END AS customer_id,

    CASE 
        WHEN CAST(customer_user_meta.meta_value AS UNSIGNED) = 0 THEN NULL
        ELSE CAST(customer_user_meta.meta_value AS UNSIGNED)
    END AS address_id,

    p.post_date AS order_date,

    CASE p.post_status
        WHEN 'wc-processing'   THEN 'processing'
        WHEN 'wc-refunded'     THEN 'cancelled'
        WHEN 'wc-ywraq-new'    THEN 'pending'
        WHEN 'wc-failed'       THEN 'cancelled'
        WHEN 'wc-completed'    THEN 'delivered'
        WHEN 'wc-cancelled'    THEN 'cancelled'
        ELSE 'pending'
    END AS status,

    CAST(
        CAST(total.meta_value AS UNSIGNED) 
        - COALESCE(CAST(shipping.meta_value AS UNSIGNED), 0)
    AS UNSIGNED) AS subtotal,

    COALESCE(
        CAST(shipping.meta_value AS UNSIGNED),
        CAST(shipping_backup.meta_value AS UNSIGNED),
        0
    ) AS shipping_cost,

    CAST(total.meta_value AS UNSIGNED) AS total

FROM wp_posts p

LEFT JOIN wp_postmeta customer_user_meta 
    ON customer_user_meta.post_id = p.ID AND customer_user_meta.meta_key = '_customer_user'
LEFT JOIN wp_postmeta shipping 
    ON shipping.post_id = p.ID AND shipping.meta_key = '_shipping_total'
LEFT JOIN wp_postmeta shipping_backup 
    ON shipping_backup.post_id = p.ID AND shipping_backup.meta_key = '_order_shipping'
LEFT JOIN wp_postmeta total 
    ON total.post_id = p.ID AND total.meta_key = '_order_total'

WHERE p.post_type = 'shop_order';

-- Tabla Productos Comprados

SELECT
    oi.order_id,
    CAST(product_meta.meta_value AS UNSIGNED) AS product_id,
    CAST(qty_meta.meta_value AS UNSIGNED) AS quantity,
    CAST(unit_price_meta.meta_value AS UNSIGNED) AS unit_price,
    CAST(unit_price_meta.meta_value AS UNSIGNED) * CAST(qty_meta.meta_value AS UNSIGNED) AS total_price

FROM wp_woocommerce_order_items oi

LEFT JOIN wp_woocommerce_order_itemmeta product_meta 
    ON product_meta.order_item_id = oi.order_item_id AND product_meta.meta_key = '_product_id'

LEFT JOIN wp_woocommerce_order_itemmeta qty_meta 
    ON qty_meta.order_item_id = oi.order_item_id AND qty_meta.meta_key = '_qty'

LEFT JOIN wp_woocommerce_order_itemmeta unit_price_meta 
    ON unit_price_meta.order_item_id = oi.order_item_id AND unit_price_meta.meta_key = '_line_subtotal'

WHERE oi.order_item_type = 'line_item';

-- Tabla Pagos

SELECT
    p.ID AS order_id,
    NULLIF(pm_method.meta_value, '') AS provider,
    CAST(pm_total.meta_value AS UNSIGNED) AS amount,
    CASE p.post_status
        WHEN 'wc-completed'   THEN 'paid'
        WHEN 'wc-processing'  THEN 'paid'
        WHEN 'wc-failed'      THEN 'failed'
        WHEN 'wc-cancelled'   THEN 'failed'
        WHEN 'wc-refunded'    THEN 'failed'
        ELSE 'pending' -- incluye wc-ywraq-new u otros
    END AS status,
    p.post_date AS paid_at,
    pm_tx.meta_value AS transaction_id,
    COALESCE(pm_doc1.meta_value, pm_doc2.meta_value) AS document_type

FROM wp_posts p

LEFT JOIN wp_postmeta pm_total   ON pm_total.post_id = p.ID AND pm_total.meta_key = '_order_total'
LEFT JOIN wp_postmeta pm_method  ON pm_method.post_id = p.ID AND pm_method.meta_key = '_payment_method_title'
LEFT JOIN wp_postmeta pm_tx      ON pm_tx.post_id = p.ID AND pm_tx.meta_key = 'webpay_transaction_id'
LEFT JOIN wp_postmeta pm_doc1    ON pm_doc1.post_id = p.ID AND pm_doc1.meta_key = 'billing_tipo_documento'
LEFT JOIN wp_postmeta pm_doc2    ON pm_doc2.post_id = p.ID AND pm_doc2.meta_key = '_billing_tipo_documento'

WHERE p.post_type = 'shop_order';

-- Tabla Despachos

SELECT
    o.ID AS order_id,
    si.order_item_name AS shipping_method,
    MAX(CASE WHEN pm.meta_key = '_tracking_number' THEN pm.meta_value ELSE NULL END) AS tracking_code,
    o.post_date AS dispatched_at,
    FROM_UNIXTIME(MAX(CASE WHEN pm.meta_key = '_completed_date' THEN pm.meta_value ELSE NULL END)) AS delivered_at
FROM wp_posts o
LEFT JOIN wp_woocommerce_order_items si ON si.order_id = o.ID AND si.order_item_type = 'shipping'
LEFT JOIN wp_postmeta pm ON pm.post_id = o.ID
WHERE o.post_type = 'shop_order'
GROUP BY o.ID, si.order_item_name 
ORDER BY `delivered_at` ASC 