-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 30-03-2025 a las 20:02:17
-- Versión del servidor: 8.0.41
-- Versión de PHP: 8.3.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `zonadepo_zdep_web015`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `administradores`
--

CREATE TABLE `administradores` (
  `id` int NOT NULL,
  `usuario` varchar(250) NOT NULL,
  `nombre` varchar(250) NOT NULL,
  `clave` varchar(250) NOT NULL,
  `email` varchar(250) NOT NULL,
  `estado` int DEFAULT '1',
  `pregunta` varchar(250) DEFAULT NULL,
  `respuesta` varchar(250) DEFAULT NULL,
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL,
  `cookie` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `banners`
--

CREATE TABLE `banners` (
  `id` int NOT NULL,
  `ubicacion` varchar(250) NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `imagen` varchar(250) DEFAULT NULL,
  `enlace` varchar(250) DEFAULT NULL,
  `target` varchar(250) DEFAULT NULL,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int NOT NULL,
  `id_seccion` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `uamigable` varchar(250) NOT NULL,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `chilexpress`
--

CREATE TABLE `chilexpress` (
  `id` int NOT NULL,
  `codigo_comuna` varchar(50) NOT NULL,
  `rango1` int NOT NULL,
  `rango2` int NOT NULL,
  `rango3` int NOT NULL,
  `rango4` int NOT NULL,
  `rango5` int NOT NULL,
  `rango6` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes`
--

CREATE TABLE `clientes` (
  `id` int NOT NULL,
  `id_tcliente` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) DEFAULT NULL,
  `rut` varchar(12) DEFAULT NULL,
  `giro` varchar(250) DEFAULT NULL,
  `fnacimiento` varchar(10) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `clave` varchar(250) NOT NULL,
  `genero` varchar(10) DEFAULT NULL,
  `telefono1` varchar(20) DEFAULT NULL,
  `telefono2` varchar(20) DEFAULT NULL,
  `direccion` varchar(250) DEFAULT NULL,
  `codigo_region` varchar(50) DEFAULT NULL,
  `codigo_provincia` varchar(50) DEFAULT NULL,
  `codigo_comuna` varchar(50) DEFAULT NULL,
  `fingreso` datetime NOT NULL,
  `factualizacion` varchar(250) DEFAULT NULL,
  `estado` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `clientes_despachos`
--

CREATE TABLE `clientes_despachos` (
  `id` int NOT NULL,
  `id_cliente` int NOT NULL,
  `direccion_despacho` varchar(100) NOT NULL,
  `codigo_region_despacho` varchar(50) NOT NULL,
  `codigo_provincia_despacho` varchar(50) NOT NULL,
  `codigo_comuna_despacho` varchar(50) NOT NULL,
  `telefono_despacho` varchar(45) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comunas`
--

CREATE TABLE `comunas` (
  `id` int NOT NULL,
  `codigo_padre` varchar(50) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `costo_despacho` int DEFAULT '0',
  `estado` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizaciones`
--

CREATE TABLE `cotizaciones` (
  `id` int NOT NULL,
  `id_cliente` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `giro` varchar(250) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `direccion` varchar(250) NOT NULL,
  `region` varchar(250) NOT NULL,
  `ciudad` varchar(250) NOT NULL,
  `comuna` varchar(250) NOT NULL,
  `telefono2` varchar(50) NOT NULL,
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `medio_despacho` varchar(250) NOT NULL,
  `forma_pago` varchar(50) NOT NULL,
  `tipo_documento` varchar(100) NOT NULL,
  `observaciones` longtext,
  `estado` int DEFAULT '0',
  `neto` int NOT NULL,
  `despacho` int DEFAULT '0',
  `total` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cotizaciones_detalle`
--

CREATE TABLE `cotizaciones_detalle` (
  `id` int NOT NULL,
  `id_cotizacion` int NOT NULL,
  `codigo` varchar(250) NOT NULL,
  `producto` varchar(250) NOT NULL,
  `cantidad` int NOT NULL,
  `punitario` int NOT NULL,
  `ptotal` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `marcas`
--

CREATE TABLE `marcas` (
  `id` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `uamigable` varchar(250) NOT NULL,
  `imagen` varchar(250) DEFAULT NULL,
  `enlace` varchar(250) DEFAULT NULL,
  `target` varchar(250) DEFAULT NULL,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metas`
--

CREATE TABLE `metas` (
  `id` int NOT NULL,
  `url_amigables` int DEFAULT '0',
  `titulo` text,
  `autor` text,
  `asunto` text,
  `descripcion` text,
  `keywords` longtext,
  `lenguaje` varchar(10) DEFAULT NULL,
  `actualizacion` varchar(20) DEFAULT NULL,
  `robots` varchar(20) DEFAULT NULL,
  `googlebots` varchar(10) DEFAULT NULL,
  `distribucion` varchar(10) DEFAULT NULL,
  `googlecode` varchar(100) DEFAULT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `paginas`
--

CREATE TABLE `paginas` (
  `id` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `descripcion` longtext,
  `introduccion` varchar(250) DEFAULT NULL,
  `imagen` varchar(250) DEFAULT NULL,
  `mtitulo` varchar(250) DEFAULT NULL,
  `mdescripcion` text,
  `mclaves` text,
  `mautor` varchar(100) DEFAULT NULL,
  `mrobots` varchar(100) DEFAULT NULL,
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `parametros`
--

CREATE TABLE `parametros` (
  `id` int NOT NULL,
  `slogan` varchar(250) DEFAULT NULL,
  `direccion1` varchar(250) DEFAULT NULL,
  `direccion2` varchar(250) DEFAULT NULL,
  `telefono1` varchar(50) DEFAULT NULL,
  `telefono2` varchar(50) DEFAULT NULL,
  `telefono3` varchar(50) DEFAULT NULL,
  `telefono4` varchar(50) DEFAULT NULL,
  `email1` varchar(250) DEFAULT NULL,
  `email2` varchar(250) DEFAULT NULL,
  `email3` varchar(250) DEFAULT NULL,
  `pagina` varchar(250) NOT NULL,
  `mapa1` longtext,
  `mapa2` longtext,
  `horario` text NOT NULL,
  `redesf` varchar(250) DEFAULT NULL,
  `redest` varchar(250) DEFAULT NULL,
  `redesl` varchar(250) DEFAULT NULL,
  `redesi` varchar(250) DEFAULT NULL,
  `redesy` varchar(250) DEFAULT NULL,
  `redesv` varchar(250) DEFAULT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int NOT NULL,
  `id_cliente` int NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `rut` varchar(12) NOT NULL,
  `giro` varchar(250) DEFAULT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(50) NOT NULL,
  `direccion` varchar(250) NOT NULL,
  `region` varchar(250) NOT NULL,
  `ciudad` varchar(250) NOT NULL,
  `comuna` varchar(250) NOT NULL,
  `telefono2` varchar(50) NOT NULL,
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `medio_despacho` varchar(250) NOT NULL,
  `forma_pago` varchar(50) NOT NULL,
  `tipo_documento` varchar(100) NOT NULL,
  `observaciones` longtext,
  `estado` int DEFAULT '0',
  `neto` int NOT NULL,
  `despacho` int DEFAULT '0',
  `total` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos_detalle`
--

CREATE TABLE `pedidos_detalle` (
  `id` int NOT NULL,
  `id_pedido` int NOT NULL,
  `codigo` varchar(250) NOT NULL,
  `producto` varchar(250) NOT NULL,
  `cantidad` int NOT NULL,
  `punitario` int NOT NULL,
  `ptotal` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `popups`
--

CREATE TABLE `popups` (
  `id` int NOT NULL,
  `ubicacion` varchar(250) DEFAULT NULL,
  `titulo` varchar(250) DEFAULT NULL,
  `fecha_inicio` date NOT NULL,
  `hora_inicio` time NOT NULL,
  `fecha_termino` date NOT NULL,
  `hora_termino` time NOT NULL,
  `enlace` varchar(250) DEFAULT NULL,
  `target` varchar(250) DEFAULT NULL,
  `posicion` varchar(250) DEFAULT NULL,
  `imagen` varchar(250) NOT NULL,
  `estado` int NOT NULL DEFAULT '0',
  `fingreso` datetime DEFAULT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `preguntas`
--

CREATE TABLE `preguntas` (
  `id` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `descripcion` longtext,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int NOT NULL,
  `id_seccion` int NOT NULL,
  `id_categoria` int DEFAULT NULL,
  `id_subcategoria` int DEFAULT NULL,
  `id_marca` int DEFAULT NULL,
  `cgrupo` varchar(50) NOT NULL,
  `modelo` varchar(250) DEFAULT NULL,
  `titulo` varchar(250) NOT NULL,
  `uamigable` varchar(250) NOT NULL,
  `archivo` varchar(250) DEFAULT NULL,
  `descripcion` longtext,
  `ftecnica` longtext,
  `despacho` longtext,
  `garantia` text,
  `tipo` text,
  `oferta` int DEFAULT '0',
  `destacado` int DEFAULT '0',
  `nvisitas` int DEFAULT '0',
  `nventas` int NOT NULL DEFAULT '0',
  `tags` text,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `mtitulo` varchar(250) DEFAULT NULL,
  `mdescripcion` text,
  `mclaves` text,
  `mautor` varchar(100) DEFAULT NULL,
  `mrobots` varchar(100) DEFAULT NULL,
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_combinaciones`
--

CREATE TABLE `productos_combinaciones` (
  `id` int NOT NULL,
  `id_producto` int NOT NULL,
  `cinterno` varchar(50) NOT NULL,
  `combinacion` varchar(250) DEFAULT NULL,
  `precio_normal` int NOT NULL,
  `precio_oferta` int NOT NULL,
  `controla_stock` int DEFAULT '0',
  `stock` int NOT NULL,
  `peso` decimal(7,3) NOT NULL,
  `largo` decimal(7,3) NOT NULL,
  `ancho` decimal(7,3) NOT NULL,
  `alto` decimal(7,3) NOT NULL,
  `volumen` decimal(9,6) NOT NULL,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_galerias`
--

CREATE TABLE `productos_galerias` (
  `id` int NOT NULL,
  `id_producto` int NOT NULL,
  `imagen` varchar(250) DEFAULT NULL,
  `timagen` varchar(250) DEFAULT NULL,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos_relaciones`
--

CREATE TABLE `productos_relaciones` (
  `id_producto` int NOT NULL,
  `id_relacion` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `provincias`
--

CREATE TABLE `provincias` (
  `id` int NOT NULL,
  `codigo_padre` varchar(50) NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `estado` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `publicidades`
--

CREATE TABLE `publicidades` (
  `id` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `imagen` varchar(250) DEFAULT NULL,
  `enlace` varchar(250) DEFAULT NULL,
  `target` varchar(250) DEFAULT NULL,
  `posicion` int NOT NULL,
  `destacado` int DEFAULT '0',
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `regiones`
--

CREATE TABLE `regiones` (
  `id` int NOT NULL,
  `codigo` varchar(50) NOT NULL,
  `codigo_romano` varchar(5) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `secciones`
--

CREATE TABLE `secciones` (
  `id` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `uamigable` varchar(250) NOT NULL,
  `descripcion` longtext,
  `imagen_portada` varchar(250) DEFAULT NULL,
  `imagen` varchar(250) DEFAULT NULL,
  `enlace` text,
  `target` varchar(250) DEFAULT NULL,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `solicitudes`
--

CREATE TABLE `solicitudes` (
  `id` int NOT NULL,
  `tipo` varchar(100) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefono` varchar(250) DEFAULT NULL,
  `celular` varchar(250) DEFAULT NULL,
  `comentarios` text NOT NULL,
  `fingreso` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `subcategorias`
--

CREATE TABLE `subcategorias` (
  `id` int NOT NULL,
  `id_seccion` int NOT NULL,
  `id_categoria` int NOT NULL,
  `titulo` varchar(250) NOT NULL,
  `uamigable` varchar(250) NOT NULL,
  `posicion` int NOT NULL,
  `estado` int DEFAULT '0',
  `fingreso` datetime NOT NULL,
  `factualizacion` datetime DEFAULT NULL,
  `creador` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `transacciones`
--

CREATE TABLE `transacciones` (
  `id` int NOT NULL,
  `tbk_transaccion` varchar(20) NOT NULL DEFAULT '',
  `tbk_orden_compra` varchar(26) NOT NULL DEFAULT '0',
  `tbk_id_session` varchar(61) NOT NULL DEFAULT '',
  `tbk_fecha_contable` varchar(4) NOT NULL DEFAULT '',
  `tbk_fecha_transaccion` varchar(10) NOT NULL DEFAULT '',
  `tbk_hora_transaccion` varchar(8) NOT NULL DEFAULT '',
  `tbk_numero_final_tarjeta` varchar(16) NOT NULL DEFAULT '',
  `tbk_fecha_expiracion_tarjeta` varchar(4) NOT NULL DEFAULT '',
  `tbk_codigo_autorizacion` varchar(6) NOT NULL DEFAULT '',
  `tbk_codigo_tipo_pago` varchar(100) NOT NULL DEFAULT '',
  `tbk_codigo_respuesta` varchar(2) NOT NULL DEFAULT '',
  `tbk_descripcion_respuesta` varchar(100) NOT NULL DEFAULT '',
  `tbk_monto` decimal(10,4) NOT NULL DEFAULT '0.0000',
  `tbk_valor_cuota` decimal(9,4) NOT NULL DEFAULT '0.0000',
  `tbk_numero_cuotas` int NOT NULL DEFAULT '0',
  `tbk_codigo_comercio` varchar(12) NOT NULL DEFAULT '',
  `tbk_orden_compra_comercio` varchar(26) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `webpay`
--

CREATE TABLE `webpay` (
  `id` int NOT NULL,
  `trs_orden_compra` int NOT NULL DEFAULT '0',
  `trs_transaccion` varchar(250) NOT NULL DEFAULT '',
  `trs_respuesta` varchar(250) NOT NULL DEFAULT '',
  `trs_monto` int NOT NULL DEFAULT '0',
  `trs_cod_autorizacion` varchar(250) NOT NULL DEFAULT '',
  `trs_nro_final_tarjeta` varchar(250) NOT NULL DEFAULT '',
  `trs_fecha_contable` varchar(250) NOT NULL DEFAULT '',
  `trs_fecha_transaccion` varchar(250) NOT NULL DEFAULT '',
  `trs_hora_transaccion` varchar(250) NOT NULL DEFAULT '',
  `trs_id_session` varchar(250) NOT NULL DEFAULT '',
  `trs_id_transaccion` varchar(250) NOT NULL DEFAULT '',
  `trs_tipo_pago` varchar(250) NOT NULL DEFAULT '',
  `trs_nro_cuotas` int NOT NULL DEFAULT '0',
  `trs_tasa_interes_max` varchar(250) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb3;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `administradores`
--
ALTER TABLE `administradores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `banners`
--
ALTER TABLE `banners`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `chilexpress`
--
ALTER TABLE `chilexpress`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clientes`
--
ALTER TABLE `clientes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `clientes_despachos`
--
ALTER TABLE `clientes_despachos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `comunas`
--
ALTER TABLE `comunas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `cotizaciones_detalle`
--
ALTER TABLE `cotizaciones_detalle`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `marcas`
--
ALTER TABLE `marcas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `metas`
--
ALTER TABLE `metas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `paginas`
--
ALTER TABLE `paginas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `parametros`
--
ALTER TABLE `parametros`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pedidos_detalle`
--
ALTER TABLE `pedidos_detalle`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `popups`
--
ALTER TABLE `popups`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos_combinaciones`
--
ALTER TABLE `productos_combinaciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `productos_galerias`
--
ALTER TABLE `productos_galerias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `provincias`
--
ALTER TABLE `provincias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `publicidades`
--
ALTER TABLE `publicidades`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `regiones`
--
ALTER TABLE `regiones`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `secciones`
--
ALTER TABLE `secciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `subcategorias`
--
ALTER TABLE `subcategorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `webpay`
--
ALTER TABLE `webpay`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `administradores`
--
ALTER TABLE `administradores`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `banners`
--
ALTER TABLE `banners`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `chilexpress`
--
ALTER TABLE `chilexpress`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes`
--
ALTER TABLE `clientes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `clientes_despachos`
--
ALTER TABLE `clientes_despachos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `comunas`
--
ALTER TABLE `comunas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cotizaciones`
--
ALTER TABLE `cotizaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `cotizaciones_detalle`
--
ALTER TABLE `cotizaciones_detalle`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `marcas`
--
ALTER TABLE `marcas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metas`
--
ALTER TABLE `metas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `paginas`
--
ALTER TABLE `paginas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `parametros`
--
ALTER TABLE `parametros`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pedidos_detalle`
--
ALTER TABLE `pedidos_detalle`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `popups`
--
ALTER TABLE `popups`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `preguntas`
--
ALTER TABLE `preguntas`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos_combinaciones`
--
ALTER TABLE `productos_combinaciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos_galerias`
--
ALTER TABLE `productos_galerias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `provincias`
--
ALTER TABLE `provincias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `publicidades`
--
ALTER TABLE `publicidades`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `regiones`
--
ALTER TABLE `regiones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `secciones`
--
ALTER TABLE `secciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `solicitudes`
--
ALTER TABLE `solicitudes`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `subcategorias`
--
ALTER TABLE `subcategorias`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `transacciones`
--
ALTER TABLE `transacciones`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `webpay`
--
ALTER TABLE `webpay`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
