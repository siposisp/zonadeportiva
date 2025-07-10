-- Tabla Marcas

CREATE TABLE brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL
);

-- Tabla Productos

CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    parent_id      BIGINT NULL,
    title          VARCHAR(255) NOT NULL,
    description    TEXT,
    short_desc     TEXT,
    status         VARCHAR(10) CHECK (status IN ('publish', 'draft', 'pending')) NOT NULL DEFAULT 'publish',
    created_at     TIMESTAMP NOT NULL,
    updated_at     TIMESTAMP NOT NULL,
    length         DECIMAL(10,2) DEFAULT NULL,
    width          DECIMAL(10,2) DEFAULT NULL,
    height         DECIMAL(10,2) DEFAULT NULL,
    weight         DECIMAL(10,2) DEFAULT NULL,
    brand_id       BIGINT DEFAULT NULL,
    slug           VARCHAR(255) NOT NULL UNIQUE,
    product_type   VARCHAR(10) CHECK (product_type IN ('simple', 'variable', 'grouped', 'external')) NOT NULL DEFAULT 'simple',

    FOREIGN KEY (brand_id) REFERENCES brands(id) ON DELETE SET NULL
);

-- Tabla Productos Meta

--ojito, que a veces el stock es 0 y otras veces es NULL
CREATE TABLE product_meta (
    id              SERIAL PRIMARY KEY,
    product_id      BIGINT NOT NULL,
    sku             VARCHAR(100) UNIQUE,
    price           DECIMAL(10,2) DEFAULT NULL,
    regular_price   DECIMAL(10,2) DEFAULT NULL,
    sale_price      DECIMAL(10,2) DEFAULT NULL,
    sale_start      TIMESTAMP DEFAULT NULL,
    sale_end        TIMESTAMP DEFAULT NULL,
    stock           INT DEFAULT NULL,
    stock_status    VARCHAR(20) CHECK (stock_status IN ('instock', 'outofstock')) DEFAULT 'instock',
    visibility      VARCHAR(50) DEFAULT NULL,
    keywords        TEXT DEFAULT NULL,

    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- Tabla Categorías

CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    parent_id BIGINT DEFAULT NULL,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
);

-- Tabla Producto - Categorías (relación muchos a muchos)

CREATE TABLE product_categories (
    product_id BIGINT,
    category_id BIGINT,
    PRIMARY KEY (product_id, category_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- Tabla Atributos

CREATE TABLE attributes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Tabla Valores de Atributo

CREATE TABLE attribute_values (
    value_id SERIAL PRIMARY KEY,
    attribute_id INT NOT NULL,
    value VARCHAR(100) NOT NULL,
    FOREIGN KEY (attribute_id) REFERENCES attributes(id)
);

-- Tabla Producto - Valor de Atributo (relación muchos a muchos)

CREATE TABLE product_value (
    product_id BIGINT NOT NULL,
    value_id INT NOT NULL,

    PRIMARY KEY (product_id, value_id),

    FOREIGN KEY (product_id) REFERENCES products(id),
    FOREIGN KEY (value_id) REFERENCES attribute_values(value_id)
);

-- Tabla Usuarios
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL, -- hash en lugar de texto plano
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'customer'))
);

-- Tabla Cliente (Registrado o Invitado)
--Solo se almacena el email si es invitado
CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    user_id INTEGER, -- NULL si es invitado
    rut VARCHAR(12), -- formato chileno, validación se hace a nivel app
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(100),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Tabla Regiones
CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    short_name VARCHAR(100) NOT NULL
);

-- Tabla Comunas
CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_id INT NOT NULL,
    FOREIGN KEY (state_id) REFERENCES states(id)
);

-- Tabla Direcciones
-- Apartment se refiere a un departamento, casa, oficina, etc. 
-- Number es el número en la dirección
CREATE TABLE user_address (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    address TEXT,
    apartment TEXT,
    city_id INTEGER,
    state_id INTEGER,
    number INTEGER, -- Número de la dirección
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (city_id) REFERENCES cities(id),
    FOREIGN KEY (state_id) REFERENCES states(id)
);

-- Tabla Carrito de Compras
CREATE TABLE carts (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    quantity INTEGER NOT NULL DEFAULT 0
);

-- Tabla Productos del Carrito
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    cart_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price INTEGER NULL,
    total_price INTEGER NOT NULL,
    FOREIGN KEY (cart_id) REFERENCES carts(id),
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Tabla Ordenes
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER,
    address_id INTEGER,
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(20) NOT NULL CHECK (status IN (
        'pending',         -- pedido creado pero aún no procesado
        'processing',      -- en preparación o despacho
        'shipped',         -- enviado
        'delivered',       -- entregado
        'cancelled'        -- cancelado
    )),
    subtotal INTEGER NOT NULL,
    shipping_cost INTEGER DEFAULT 0,
    total INTEGER NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (address_id) REFERENCES user_address(id)
);

-- Tabla Productos Comprados
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price BIGINT NOT NULL, -- Precio en CLP, sin decimales
    total_price BIGINT NOT NULL, -- unit_price * quantity en CLP
    FOREIGN KEY (order_id) REFERENCES orders(id)
);


-- Tabla de registro de envios
CREATE TABLE shipping_methods (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,          -- Nombre resumido
    description TEXT,                    -- Detalle explicativo
    carrier VARCHAR(255),
    cost DECIMAL(10,2)
);


-- Tabla de metodos de envio
CREATE TABLE shippings (
    id SERIAL PRIMARY KEY,
    shipping_method_id INTEGER,
    tracking_code VARCHAR(100),              -- Puede ser NULL si no se proporciona
    dispatched_at TIMESTAMP,                 -- Puede ser NULL si aún no se despacha
    delivered_at TIMESTAMP,                  -- Puede ser NULL si aún no se entrega
    FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id)
);

-- Tabla de envios en region metropolitana
CREATE TABLE metropolitan_shipping_options (
    id SERIAL PRIMARY KEY,
    id_city INTEGER NOT NULL,
    name VARCHAR(50),
    shipping_method_id INTEGER NOT NULL,
    FOREIGN KEY (shipping_method_id) REFERENCES shipping_methods(id)
);


-- Tabla Metodos de Pago
CREATE TABLE payment_providers (
    id SERIAL PRIMARY KEY,
    name VARCHAR(60)
);


-- Tabla Pagos
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    provider_id INTEGER, -- FK a payment_providers
    amount BIGINT NOT NULL,      -- Monto en CLP
    status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'failed', 'pending')),
    paid_at TIMESTAMP,
    transaction_id VARCHAR(120),  -- Puede ser NULL
    document_type VARCHAR(20),    -- Puede ser NULL (boleta, factura, etc.)
    FOREIGN KEY (order_id) REFERENCES orders(id)
);


-- Tabla Webpay
CREATE TABLE webpay_transactions (
    id SERIAL PRIMARY KEY,
    payment_id INTEGER NOT NULL,
    buy_order TEXT NOT NULL,
    vci varchar(250) NOT NULL,
    amount BIGINT NOT NULL,--
    status varchar(50) NOT NULL,--
    session_id TEXT NOT NULL,
    card_last_numbers int NOT NULL, -- Ultimos 4 numeros de la tarjeta
    accounting_date varchar(250) NOT NULL,
    transaction_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    authorization_code varchar(50) NOT NULL,
    payment_type_code varchar(50) NOT NULL,
    response_code int NOT NULL,
    installments_number int NOT NULL,
    FOREIGN KEY (payment_id) REFERENCES payments(id)
);




/*
-- Tabla Pagos
CREATE TABLE payments (
    id SERIAL PRIMARY KEY,
    order_id INTEGER NOT NULL,
    provider VARCHAR(50),              -- Puede ser NULL si no se conoce el proveedor
    amount INTEGER NOT NULL,           -- Monto en CLP (entero)
    status VARCHAR(20) NOT NULL CHECK (status IN ('paid', 'failed', 'pending')),
    paid_at TIMESTAMP NOT NULL,
    transaction_id VARCHAR(100),       -- Puede ser NULL
    document_type VARCHAR(20),         -- Puede ser NULL (boleta, factura, etc.)
    FOREIGN KEY (order_id) REFERENCES orders(id)
);
*/

-- Opcional: Tabla Despachos
-- CREATE TABLE shippings (
--     shipping_id SERIAL PRIMARY KEY,
--     order_id INTEGER NOT NULL,
--     shipping_method VARCHAR(100) NOT NULL,   -- Ej: Chilexpress, Retiro en tienda
--     tracking_code VARCHAR(100),              -- Puede ser NULL si no se proporciona
--     dispatched_at TIMESTAMP,                 -- Puede ser NULL si aún no se despacha
--     delivered_at TIMESTAMP,                  -- Puede ser NULL si aún no se entrega
--     FOREIGN KEY (order_id) REFERENCES orders(id)
-- );

-- CREATE TABLE shipping_methods (
--   shipping_method_id SERIAL PRIMARY KEY,
--   name VARCHAR(255) NOT NULL,
--   carrier VARCHAR(255),
--   cost DECIMAL(10,2)
-- );