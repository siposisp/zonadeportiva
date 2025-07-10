INSERT INTO shipping_methods (id, name, description, carrier, cost) VALUES
-- 1. Retiro en Tienda
(
    1,
    'Retiro en Tienda',
    'General Ordóñez 155 Of. 1002, Maipú.',
    'Zona Deportiva',
    0
),

-- 2. Por Pagar - Regiones
(
    2,
    'Por Pagar - Regiones',
    'Para REGIONES los envíos se realizan en modalidad POR PAGAR a la dirección indicada por nuestro cliente o en su defecto a alguna sucursal cercana. Una vez realizada la compra, un ejecutivo se contactará a la brevedad posible para coordinar el despacho. Podemos entregar un valor aproximado del costo del flete. Como así también recomendar la mejor alternativa según el punto de destino. Si necesitas más información puedes contactarnos a contacto@zonadeportiva.cl o al teléfono y WhatsApp +56939369828.',
    'Por definir',
    0
),

-- 3. Por Pagar - Coordinado
(
    3,
    'Por Pagar - Coordinado',
    'Coordinamos contigo para ofrecer la mejor alternativa con alguna empresa externa de transporte. Nos contactaremos a la brevedad posible, después de que se haya realizado el pago.',
    'Por definir',
    0
),

-- 4. Despacho Fijo
(
    4,
    'Despacho Fijo',
    'Costo fijo por despacho sin importar comuna o región.',
    'Zona Deportiva',
    8990
),

-- 5. Despacho Económico
(
    5,
    'Despacho Económico',
    'Tarifa rebajada para zonas seleccionadas.',
    'Zona Deportiva',
    3100
),

-- 6. Envío a Metropolitana
(
    6,
    'Envío a Región Metropolitana',
    'Disponible solo para direcciones dentro de la RM.',
    'Zona Deportiva',
    0
);