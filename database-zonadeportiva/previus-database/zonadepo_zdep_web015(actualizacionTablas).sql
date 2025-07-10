--
-- Estructura de tabla para la tabla `administradores`
--

--Se quitan los apartados: 
--pregunta 
--respuesta
CREATE TABLE administradores (
  id SERIAL PRIMARY KEY,
  usuario VARCHAR(250) NOT NULL,
  nombre VARCHAR(250) NOT NULL,
  clave VARCHAR(250) NOT NULL,
  email VARCHAR(250) NOT NULL,
  estado INTEGER DEFAULT 1,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP,
  creador VARCHAR(250) NOT NULL,
  cookie VARCHAR(250)
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE categorias (
  id SERIAL PRIMARY KEY,
  id_seccion INTEGER NOT NULL,
  titulo VARCHAR(250) NOT NULL,
  uamigable VARCHAR(250) NOT NULL,
  posicion INTEGER NOT NULL,
  estado INTEGER DEFAULT 0,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP,
  creador VARCHAR(250) NOT NULL
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chilexpress`
--

CREATE TABLE chilexpress (
  id SERIAL PRIMARY KEY,
  codigo_comuna VARCHAR(50) NOT NULL,
  rango1 INTEGER NOT NULL,
  rango2 INTEGER NOT NULL,
  rango3 INTEGER NOT NULL,
  rango4 INTEGER NOT NULL,
  rango5 INTEGER NOT NULL,
  rango6 INTEGER NOT NULL
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

--Se quitan los apartados: 
--codigo_region
--codigo_provincia
CREATE TABLE clientes (
  id SERIAL PRIMARY KEY,
  id_tcliente INTEGER NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100),
  rut VARCHAR(12),
  giro VARCHAR(250),
  fnacimiento VARCHAR(10),
  email VARCHAR(100) NOT NULL,
  clave VARCHAR(250) NOT NULL,
  genero VARCHAR(10),
  telefono1 VARCHAR(20),
  telefono2 VARCHAR(20),
  direccion VARCHAR(250),
  codigo_comuna VARCHAR(50),
  fingreso TIMESTAMP NOT NULL,
  factualizacion VARCHAR(250),
  estado INTEGER DEFAULT 1
);


-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes_despachos`
--

--Se quitan los apartados: 
--codigo_region_despacho
--codigo_provincia_despacho
CREATE TABLE clientes_despachos (
  id SERIAL PRIMARY KEY,  
  id_cliente INT NOT NULL, 
  direccion_despacho VARCHAR(100) NOT NULL,
  codigo_comuna_despacho VARCHAR(50) NOT NULL,
  telefono_despacho VARCHAR(45) NOT NULL,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id) 
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comunas`
--

--Se quitan los apartados: 
--costo_despacho (porque todos son 0)

--codigo padre es la foranea de provincias(en donde se llama codigo ) (es varchar)
CREATE TABLE comunas (
  id SERIAL PRIMARY KEY, 
  codigo_padre VARCHAR(50) NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  estado INT DEFAULT 1
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizaciones`
--

--Se quitan los apartados: 
--direccion
--region
--ciudad
--comuna
--telefono2
--medio_despacho
--forma_pago
--tipo_documento
--observaciones
--factualizacion
--nombre
--rut
--giro
--email
--telefono

--Están en 0, pero no estoy seguro de quitarlas
--neto
--despacho
--total
CREATE TABLE cotizaciones (
  id SERIAL PRIMARY KEY,
  id_cliente INT NOT NULL,
  fingreso TIMESTAMP NOT NULL,
  estado INT DEFAULT 0,
  FOREIGN KEY (id_cliente) REFERENCES clientes(id) 
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizaciones_detalle`
--

--Están en 0, pero no estoy seguro de quitarlas
--punitario
--ptotal
CREATE TABLE cotizaciones_detalle (
  id SERIAL PRIMARY KEY,
  id_cotizacion INTEGER NOT NULL,
  codigo VARCHAR(250) NOT NULL,
  producto VARCHAR(250) NOT NULL,
  cantidad INTEGER NOT NULL,
  FOREIGN KEY (id_cotizaciones) REFERENCES cotizaciones(id) 
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas`
--

--Se quitan los apartados: 
--enlace
--target
CREATE TABLE marcas (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(250) NOT NULL,
  uamigable VARCHAR(250) NOT NULL,
  imagen VARCHAR(250),
  posicion INTEGER NOT NULL,
  estado INTEGER DEFAULT 0,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP,
  creador VARCHAR(250) NOT NULL
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metas`
--

--No se si quitarla, hay que ver si tiene algún uso, porque solo tiene 1 elemento
CREATE TABLE metas (
  id SERIAL PRIMARY KEY,
  url_amigables INTEGER DEFAULT 0,
  titulo TEXT,
  autor TEXT,
  asunto TEXT,
  descripcion TEXT,
  keywords TEXT,
  lenguaje VARCHAR(10),
  actualizacion VARCHAR(20),
  robots VARCHAR(20),
  googlebots VARCHAR(10),
  distribucion VARCHAR(10),
  googlecode VARCHAR(100),
  estado INTEGER DEFAULT 0,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP,
  creador VARCHAR(250) NOT NULL
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parametros`
--

--Se quitan los apartados: 
--slogan
--direccion2
--telefono3
--telefono4
--email2
--email3
--pagina
--mapa1
--mapa2
--horario
--redesl
--redesi

--Preguntar al cliente por los parámetros
CREATE TABLE datos_contacto (
  id              SERIAL PRIMARY KEY,
  direccion1      VARCHAR(250),
  telefono1       VARCHAR(50),
  telefono2       VARCHAR(50),
  email1          VARCHAR(250),
  redesf          VARCHAR(250),
  redest          VARCHAR(250),
  redesy          VARCHAR(250),
  redesv          VARCHAR(250),
  estado          INTEGER DEFAULT 0,
  fingreso        TIMESTAMP NOT NULL,
  factualizacion  TIMESTAMP,
  creador         VARCHAR(250) NOT NULL
);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE pedidos (
  id SERIAL PRIMARY KEY,
  id_cliente INTEGER NOT NULL,
  direccion VARCHAR(250) NOT NULL,
  region VARCHAR(250) NOT NULL,
  ciudad VARCHAR(250) NOT NULL,
  comuna VARCHAR(250) NOT NULL,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP,
  medio_despacho VARCHAR(250) NOT NULL,
  forma_pago VARCHAR(50) NOT NULL,
  tipo_documento VARCHAR(100) NOT NULL,
  observaciones TEXT,
  estado INTEGER DEFAULT 0,
  neto INTEGER NOT NULL,
  despacho INTEGER DEFAULT 0,
  total INTEGER NOT NULL 
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos_detalle`
--

--codigo parece ser el SKU de cada producto
CREATE TABLE pedidos_detalle (
  id SERIAL PRIMARY KEY,
  id_pedido INTEGER NOT NULL,
  codigo VARCHAR(250) NOT NULL,
  producto VARCHAR(250) NOT NULL,
  cantidad INTEGER NOT NULL,
  punitario INTEGER NOT NULL,
  ptotal INTEGER NOT NULL,
  FOREIGN KEY (id_pedido) REFERENCES pedidos(id) 
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

--Se quitan los apartados: 
--id_subcategoria
--archivo
--mautor
--oferta

--en mrobots algunos tienen index,follow no se que significa
CREATE TABLE productos (
  id SERIAL PRIMARY KEY,
  id_seccion INT NOT NULL,
  id_categoria INT DEFAULT NULL,
  id_marca INT DEFAULT NULL,
  cgrupo VARCHAR(50) NOT NULL,
  modelo VARCHAR(250) DEFAULT NULL,
  titulo VARCHAR(250) NOT NULL,
  uamigable VARCHAR(250) NOT NULL,
  descripcion TEXT,
  ftecnica TEXT,
  despacho TEXT,
  garantia TEXT,
  tipo TEXT,
  destacado INT DEFAULT 0,
  nvisitas INT DEFAULT 0,
  nventas INT NOT NULL DEFAULT 0,
  tags TEXT,
  posicion INT NOT NULL,
  estado INT DEFAULT 0,
  mtitulo VARCHAR(250) DEFAULT NULL,
  mdescripcion TEXT,
  mclaves TEXT,
  mrobots VARCHAR(100) DEFAULT NULL,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP DEFAULT NULL,
  creador VARCHAR(250) NOT NULL
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_combinaciones`
--

CREATE TABLE productos_combinaciones (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL,
  cinterno VARCHAR(50) NOT NULL,
  combinacion VARCHAR(250),
  precio_normal INT NOT NULL,
  precio_oferta INT NOT NULL,
  controla_stock INT DEFAULT 0,
  stock INT NOT NULL,
  peso DECIMAL(7,3) NOT NULL,
  largo DECIMAL(7,3) NOT NULL,
  ancho DECIMAL(7,3) NOT NULL,
  alto DECIMAL(7,3) NOT NULL,
  volumen DECIMAL(9,6) NOT NULL,
  posicion INT NOT NULL,
  estado INT DEFAULT 0,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP,
  creador VARCHAR(250) NOT NULL
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_galerias`
--

--Se quitan los apartados: 
--timagen
CREATE TABLE productos_galerias (
  id SERIAL PRIMARY KEY,
  id_producto INT NOT NULL,
  imagen VARCHAR(250) DEFAULT NULL,
  posicion INT NOT NULL,
  estado INT DEFAULT 0,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP DEFAULT NULL,
  creador VARCHAR(250) NOT NULL,
  FOREIGN KEY (id_producto) REFERENCES productos(id)
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_relaciones`
--

CREATE TABLE productos_relaciones (
  id_producto INT NOT NULL,
  id_relacion INT NOT NULL
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `provincias`
--

--codigo padre hace referencia a codigo, de la tabla regiones (varchar entre 1 y 15)
CREATE TABLE provincias (
  id SERIAL PRIMARY KEY,
  codigo_padre VARCHAR(50) NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  estado INT DEFAULT 1
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regiones`
--

CREATE TABLE regiones (
  id SERIAL PRIMARY KEY,
  codigo VARCHAR(50) NOT NULL,
  codigo_romano VARCHAR(5) NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  posicion INTEGER NOT NULL,
  estado INTEGER DEFAULT 1
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `secciones`
--

--Se quitan los apartados: 
--descripcion
--imagen_portada
--imagen
--enlace
--target

--AL parecer las secciones contienen categorías
CREATE TABLE secciones (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(250) NOT NULL,
  uamigable VARCHAR(250) NOT NULL,
  posicion INTEGER NOT NULL,
  estado INTEGER DEFAULT 0,
  fingreso TIMESTAMP NOT NULL,
  factualizacion TIMESTAMP,
  creador VARCHAR(250) NOT NULL
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transacciones`
--

CREATE TABLE transacciones (
  id SERIAL PRIMARY KEY,
  tbk_transaccion VARCHAR(20) NOT NULL DEFAULT '',
  tbk_orden_compra VARCHAR(26) NOT NULL DEFAULT '0',
  tbk_id_session VARCHAR(61) NOT NULL DEFAULT '',
  tbk_fecha_contable VARCHAR(4) NOT NULL DEFAULT '',
  tbk_fecha_transaccion VARCHAR(10) NOT NULL DEFAULT '',
  tbk_hora_transaccion VARCHAR(8) NOT NULL DEFAULT '',
  tbk_numero_final_tarjeta VARCHAR(16) NOT NULL DEFAULT '',
  tbk_fecha_expiracion_tarjeta VARCHAR(4) NOT NULL DEFAULT '',
  tbk_codigo_autorizacion VARCHAR(6) NOT NULL DEFAULT '',
  tbk_codigo_tipo_pago VARCHAR(100) NOT NULL DEFAULT '',
  tbk_codigo_respuesta VARCHAR(2) NOT NULL DEFAULT '',
  tbk_descripcion_respuesta VARCHAR(100) NOT NULL DEFAULT '',
  tbk_monto NUMERIC(10,4) NOT NULL DEFAULT 0.0000,
  tbk_valor_cuota NUMERIC(9,4) NOT NULL DEFAULT 0.0000,
  tbk_numero_cuotas INTEGER NOT NULL DEFAULT 0,
  tbk_codigo_comercio VARCHAR(12) NOT NULL DEFAULT '',
  tbk_orden_compra_comercio VARCHAR(26) NOT NULL DEFAULT ''
);
-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `webpay`
--

CREATE TABLE webpay (
  id SERIAL PRIMARY KEY,
  trs_orden_compra INT NOT NULL DEFAULT 0,
  trs_transaccion VARCHAR(250) NOT NULL DEFAULT '',
  trs_respuesta VARCHAR(250) NOT NULL DEFAULT '',
  trs_monto INT NOT NULL DEFAULT 0,
  trs_cod_autorizacion VARCHAR(250) NOT NULL DEFAULT '',
  trs_nro_final_tarjeta VARCHAR(250) NOT NULL DEFAULT '',
  trs_fecha_contable VARCHAR(250) NOT NULL DEFAULT '',
  trs_fecha_transaccion VARCHAR(250) NOT NULL DEFAULT '',
  trs_hora_transaccion VARCHAR(250) NOT NULL DEFAULT '',
  trs_id_session VARCHAR(250) NOT NULL DEFAULT '',
  trs_id_transaccion VARCHAR(250) NOT NULL DEFAULT '',
  trs_tipo_pago VARCHAR(250) NOT NULL DEFAULT '',
  trs_nro_cuotas INT NOT NULL DEFAULT 0,
  trs_tasa_interes_max VARCHAR(250) NOT NULL DEFAULT ''
);