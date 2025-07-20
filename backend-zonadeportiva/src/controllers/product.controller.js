import { pool } from '../../database/connectionPostgreSQL.js';
import Product from '../models/product.js';
import { validateProductStock } from '../services/product.service.js';

/**
 * @swagger
 * /product/:
 *   get:
 *     summary: Obtener listado de productos
 *     description: Retorna los productos tipo 'simple' que están publicados, incluyendo su metadata (precio, visibilidad).
 *     tags:
 *       - Productos
 *     responses:
 *       200:
 *         description: Productos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 1
 *                   title:
 *                     type: string
 *                     example: "Polera deportiva"
 *                   slug:
 *                     type: string
 *                     example: "polera-deportiva"
 *                   price:
 *                     type: number
 *                     format: float
 *                     example: 19990
 *                   regular_price:
 *                     type: number
 *                     format: float
 *                   sale_price:
 *                     type: number
 *                     format: float
 *                   visibility:
 *                     type: string
 *                     example: "visible"
 *       500:
 *         description: Error al obtener productos
 */
// Obtiene el listado completo de productos
export const getProducts = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT p.id, p.title, p.slug, pm.price, pm.regular_price, pm.sale_price, pm.visibility
      FROM products p
      JOIN product_meta pm ON p.id = pm.product_id
      JOIN brands b ON p.brand_id = b.id
      WHERE p.parent_id = 0
        AND p.product_type = 'simple'
        AND p.status = 'publish';
    `);

    res.status(200).json(result.rows);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener productos' });
  }
};


/**
 * @swagger
 * /product/get-product-some-details-by-slug/{slug}:
 *   get:
 *     summary: Obtener información básica de un producto por slug
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "zapatilla-running"
 *     responses:
 *       200:
 *         description: Producto encontrado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error al obtener producto
 */
// Obtiene un producto por slug (solo lo contenido en la tabla products)
export const getProductSomeDetailsBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const result = await pool.query('SELECT * FROM products WHERE slug = $1', [slug]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const product = new Product(result.rows[0]);

    res.status(200).json(product);
  } catch (error) {
   // console.error('Error al obtener producto por slug:', error);
    res.status(500).json({ message: 'Error al obtener producto' });
  }
};


// Obtiene el contenido de entre la tablas products y product_meta
const getMetaByProductId = async (id, slug) => {
  const result = await pool.query(
    "SELECT sku, price, regular_price, sale_price, stock, stock_status FROM product_meta WHERE product_id = $1",
    [id]
  );

  // Si no existe un registro en product_meta, se obtiene el precio de las variantes visibles
  if (result.rows.length === 0) {

    let price = null;
    
    const variants = await getValueDetailsAndProducts(slug);

    const variantsRows = variants?.rows || [];
  
    // Filtrar variantes visibles solamente
    const VisibleVariants = variantsRows.filter(v => v.visibility === 'visible');

    const prices = VisibleVariants.map(v => v.price);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    if (min !==  max){
      price = [min, max];
    }
    else{
      price = min;
    }

    return{
      sku: null,
      price,
      regular_price: null,
      sale_price: null,
      stock: null,
      stock_status: null
    }
  }

  return result.rows[0] || null;
};


// Cuando es padre, parent_id retorna null y por consecuenciaparent_name retorna null (la columna parent_name no existe en la bd)
const getCategoriesByProductId = async (id) => {
  const query = `
    SELECT 
      parent.id AS parent_id,
      parent.name AS parent_name,
      parent.slug AS parent_slug,
      json_agg(
        json_build_object(
          'id', child.id,
          'name', child.name,
          'child_slug', child.slug
        )
      ) AS subcategories
    FROM product_categories
    INNER JOIN categories AS child ON product_categories.category_id = child.id
    LEFT JOIN categories AS parent ON child.parent_id = parent.id
    WHERE product_categories.product_id = $1
    GROUP BY parent.id, parent.name, parent.slug;
  `;

  const result = await pool.query(query, [id]);
  return result.rows;
};


// Obtiene la información (id,slug,title,description,short_desc y name) relevante del producto y agrega la marca del producto
const getProductBySlug = async (slug) => {
  const result = await pool.query(
    `
    SELECT p.id, p.slug, p.title, p.description, p.short_desc, b.name AS brand
    FROM products p
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE p.slug = $1
    `,
    [slug]
  );

  return result.rows[0] || null;
};


// Obtener el ID del producto padre por slug
const getParentIdBySlug = async (slug) => {

  const parentResult = await pool.query(
    "SELECT id FROM products WHERE slug = $1",
    [slug]
  );

  if (parentResult.rows.length === 0) {
    return null;
  }
  
  return parentResult.rows[0].id;
  
};


// Obtener los IDs de los productos hijos del padre
const getChildrenIdsByParentId = async (parentId) => {

  const childrenResult = await pool.query(
    "SELECT id FROM products WHERE product_type = 'variable' AND parent_id = $1",
    [parentId]
  );

  if (childrenResult.rows.length === 0) {
    return null;
  }
  
  return childrenResult.rows.map(row => row.id);
};


// Obtener los value_id asociados a cada producto hijo
const getValueIdsByChildrenIds = async (childrenIds) => {

  const productValueResult = await pool.query(
    'SELECT product_id, value_id FROM product_value WHERE product_id = ANY($1)',
    [childrenIds]
  );

  if (productValueResult.rows.length === 0) {
    return null;
  }

  return productValueResult.rows.map(row => row.value_id);
};



// Obtener detalles de valores y productos
export const getValueDetailsAndProducts = async (slug) => {
  
  const parentId = await getParentIdBySlug(slug);
  const childrenIds = await getChildrenIdsByParentId(parentId);
  
  if (!childrenIds) {
    return null;
  }

  const valueIds = await getValueIdsByChildrenIds(childrenIds);

  if (!valueIds) {
    return null;
  }

  const attributeValuesResult = await pool.query(
    `SELECT 
      av.value_id, 
      av.value, 
      a.id AS attribute_id,
      a.name AS attribute_name,
      pm.stock_status, 
      pm.stock,
      pm.product_id,
      pm.price,
      p.slug,
      p.title AS product_name,
      pm.visibility
    FROM attribute_values av
    JOIN attributes a ON av.attribute_id = a.id
    JOIN product_value pv ON pv.value_id = av.value_id
    JOIN product_meta pm ON pm.product_id = pv.product_id
    JOIN products p ON p.id = pv.product_id
    WHERE pv.product_id = ANY($1)
      AND av.value_id = ANY($2)`,
    [childrenIds, valueIds]
  );

  return attributeValuesResult;
};




// Agrupar solo por atributo (como talla y color)
const groupAttributeValues = (rows) => {
  const groupedByAttribute = {};

  for (const row of rows) {
    const {
      attribute_name,
      attribute_id,
      value,
      value_id,
      product_id,
      slug: product_slug,
      stock,
      stock_status,
      price
    } = row;

    if (!groupedByAttribute[attribute_id]) {
      groupedByAttribute[attribute_id] = {
        attribute_name,
        attribute_id,
        values: {}
      };
    }

    const attributeGroup = groupedByAttribute[attribute_id];

    if (!attributeGroup.values[value_id]) {
      attributeGroup.values[value_id] = {
        value,
        value_id,
        items: []
      };
    }

    attributeGroup.values[value_id].items.push({
      product_id,
      value_id,
      slug: product_slug,
      price,
      value,
      stock,
      stock_status
    });
  }

  return Object.values(groupedByAttribute).map(attribute => ({
    attribute_name: attribute.attribute_name,
    attribute_id: attribute.attribute_id,
    values: Object.values(attribute.values)
  }));
};



// Obtener productos hijos (variants) para poner sus detalles, como talla y color
const getProductChildren = async (slug) => {
  try {
    const attributeValuesResult = await getValueDetailsAndProducts(slug);
    const rows = attributeValuesResult?.rows;

    if (!rows || rows.length === 0) {
      return null;
    }

    return groupAttributeValues(rows);
  } catch (error) {
    console.error('Error al obtener los attribute_values de los hijos:', error);
    throw error;
  }
};



// Recibe el listado de variantes sin procesar y los agrupa por product_id
export const groupByProductId = (variants) => {
  const result = [];

  variants.forEach(row => {
    const {
      product_id,
      value_id,
      slug,
      value,
      stock,
      stock_status,
      attribute_id,
      attribute_name
    } = row;

    const item = {
      product_id,
      value_id,
      slug,
      value,
      stock,
      stock_status,
      attribute_id,
      attribute_name
    };

    // Buscar si ya existe una entrada para ese product_id
    const existingEntry = result.find(entry => entry.product_id === product_id);

    if (existingEntry) {
      existingEntry.items.push(item);
    } else {
      result.push({
        product_id,
        items: [item]
      });
    }
  });

  return result;
};



/**
 * @swagger
 * /product/get-variants-by-slug/{slug}:
 *   get:
 *     summary: Obtener variantes de producto por slug
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "poleron-nike"
 *     responses:
 *       200:
 *         description: Variantes agrupadas por producto_id
 *       500:
 *         description: Error al obtener variantes
 */
// Obtiene las variantes de un producto usando el slug del padre, 
export const getVariantsBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    // Obtener las variantes de un producto (todas, sin procesar)
    const attributeValuesResult = await getValueDetailsAndProducts(slug);

    // Mostrar la variantes agrupadas por product_id
    return res.json(groupByProductId(attributeValuesResult.rows));

  } catch (error) {
    console.error('Error al obtener los attribute_values de los hijos:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};



/**
 * @swagger
 * /product/get-product-all-details-by-slug/{slug}:
 *   get:
 *     summary: Obtener todos los detalles de un producto padre
 *     tags:
 *       - Productos
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         example: "camiseta-adidas"
 *     responses:
 *       200:
 *         description: Producto con detalles completos
 *       404:
 *         description: Producto no encontrado
 *       500:
 *         description: Error interno
 */
// Usando el slug de 1 producto obtiene el detalle completo (todo lo que se necesita desde el front) de 1 producto
// La función solo utiliza productos que sean padre, dentro de esta función se debe incorporar el manejo de sus variantes como tamaños y colores
export const getProductAllDetailsBySlug = async (req, res) => {
  const { slug } = req.params;

  try {
    const product = await getProductBySlug(slug);
    if (!product) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    const id = product.id;

    const metadata = await getMetaByProductId(id, slug);
    const categories = await getCategoriesByProductId(id);
    const variants = await getProductChildren(slug);


    res.status(200).json({ 
      ...product,
      metadata,
      categories,
      variants,
    });
  } catch (error) {
    //console.error('Error al obtener todos los detalles del producto:', error);
    res.status(500).json({ message: 'Error al obtener todos los detalles del producto' });
  }
};



/**
 * @swagger
 * /product/check-stock:
 *   post:
 *     summary: Verificar stock disponible de un producto
 *     tags:
 *       - Productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - product_id
 *               - quantity
 *             properties:
 *               product_id:
 *                 type: integer
 *                 example: 101
 *               quantity:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       200:
 *         description: Resultado de la validación
 *       400:
 *         description: Parámetros faltantes o inválidos
 *       404:
 *         description: Stock insuficiente
 *       500:
 *         description: Error interno
 */
// Valida la cantidad de productos escogidos para añadir en el carrito (retorna 1 o 0)
export const checkProductStock = async (req, res) => {
  const { product_id, quantity } = req.body;

  try {
    const result = await validateProductStock(product_id, quantity);
    
    if (!result.success) {
      return res.status(404).json({ 
        result: result.result, 
        message: result.message 
      });
    }

    res.json({ result: result.result });

  } catch (error) {
    // Manejo de errores de validación de parámetros
    if (error.message.includes('Faltan parámetros')) {
      return res.status(400).json({ message: error.message });
    }
    
    // Error interno
    res.status(500).json({ 
      result: 0, 
      error: error.message 
    });
  }
};



/**
 * @swagger
 * /product/get-product-by-keyword:
 *   post:
 *     summary: Buscar productos por palabra clave
 *     tags:
 *       - Productos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               keyword:
 *                 type: string
 *                 example: "tenis"
 *               page:
 *                 type: integer
 *                 example: 1
 *               sort:
 *                 type: string
 *                 enum: [price_asc, price_desc, name_asc, name_desc]
 *                 example: "price_asc"
 *     responses:
 *       200:
 *         description: Resultados paginados de la búsqueda
 *       500:
 *         description: Error en la búsqueda
 */
//Permite buscar productos por keyword, title, description o short_desc
export const getProductByKeyword = async (req, res) => {
  const { keyword, page = 1, sort } = req.body;

  const pageSize = 20;

  let sortBy = 'default';
  let order = null;
  
  switch (sort) {
    case 'price_asc':
      sortBy = 'price';
      order = 'asc';
      break;
    case 'price_desc':
      sortBy = 'price';
      order = 'desc';
      break;
    case 'name_asc':
      sortBy = 'title';
      order = 'asc';
      break;
    case 'name_desc':
      sortBy = 'title';
      order = 'desc';
      break;
  }

  try {
    const productsQuery = `
      SELECT DISTINCT
        p.id, 
        p.slug, 
        p.title, 
        pm.price, 
        pm.regular_price,
        pm.visibility,
        pm.sale_price
      FROM products p
      JOIN product_meta pm ON pm.product_id = p.id
      WHERE (
        p.title ILIKE $1
        OR pm.keywords ILIKE $1
        OR p.description ILIKE $1
        OR p.short_desc ILIKE $1
      )
      AND p.status = 'publish'
      AND p.product_type = 'simple'
      AND pm.visibility = 'visible'
    `;

    const { rows: products } = await pool.query(productsQuery, [`%${keyword}%`]);

    console.log(`Total de resultados únicos (padres visibles): ${products.length}`);
    //res.json(products);

    // Se ordena el listado de prodcutos y se guarda en la lista original de productos combinados
    const paginatedProducts = await sortProducts(page, products, sortBy, order);

    const totalPages = Math.ceil(products.length / pageSize);

    const totalProducts = products.length;
    // Devolver productos
    return res.status(200).json({
      keyword,
      totalPages,
      page,
      totalProducts, 
      sortBy,
      order,
      products: paginatedProducts
    });

  } catch (error) {
    console.error('Error detallado:', error);
    res.status(500).json({ error: 'Error en la búsqueda', detalles: error.message });
  }
}




// Ordena un listado de productos
export const sortProducts = async (page, products, sortBy, order) => {

  if (!Array.isArray(products)) {
    throw new Error('El campo "products" debe ser un array.');
  }

  // Filtrar productos que tienen visibilidad = 'visible' en los metadatos
  products = products.filter(product => product.visibility === 'visible');

  const pageSize = 20;
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;

  if (sortBy !== 'default') {
    const normalizePrice = (value) => {
      if (Array.isArray(value)) return parseFloat(value[0]) || 0;
      return parseFloat(value) || 0;
    };

    const sortedProducts = [...products].sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];

      const priceFields = ['price', 'regular_price', 'sale_price'];
      if (priceFields.includes(sortBy)) {
        valA = normalizePrice(valA);
        valB = normalizePrice(valB);
      }

      if (valA == null && valB == null) return 0;
      if (valA == null) return order === 'asc' ? 1 : -1;
      if (valB == null) return order === 'asc' ? -1 : 1;

      if (typeof valA === 'string') {
        return order === 'asc'
          ? valA.localeCompare(valB)
          : valB.localeCompare(valA);
      } else {
        return order === 'asc' ? valA - valB : valB - valA;
      }
    });

    return sortedProducts.slice(startIndex, endIndex);
  }

  // Si no hay sort, simplemente paginar los productos
  return products.slice(startIndex, endIndex);
};

