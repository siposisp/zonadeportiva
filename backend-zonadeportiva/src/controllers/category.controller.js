import { pool } from '../../database/connectionPostgreSQL.js';
import Category from '../models/category.js';
import Product from '../models/product.js';
import { getValueDetailsAndProducts, sortProducts } from './product.controller.js';

/**
 * @swagger
 * /category/:
 *   get:
 *     summary: Obtener todas las categorías
 *     description: Retorna todas las categorías disponibles, sin distinguir jerarquía entre padres e hijos.
 *     tags:
 *       - Categorías
 *     responses:
 *       200:
 *         description: Lista completa de categorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                     example: 5
 *                   slug:
 *                     type: string
 *                     example: "zapatillas"
 *                   name:
 *                     type: string
 *                     example: "Zapatillas"
 *                   parent_id:
 *                     type: integer
 *                     nullable: true
 *                     example: null
 *       500:
 *         description: Error interno al obtener categorías
 */
// Listado completo de todas las categorias (no discrimina entre categoria y subcategorias)
export const getCategories = async (req, res) => {
    try {
      const result = await pool.query('SELECT * FROM categories');
      
      const categories = result.rows.map(row => new Category(row));
  
      res.status(200).json(categories);
    } catch (error) {
      console.error('Error al obtener categorias:', error);
      res.status(500).json({ message: 'Error al obtener categorias' });
    }
};

export const getProductsByCategorySlug = async (req, res) => {
    const { slug } = req.params;
  
    try {
      const result = await pool.query('SELECT * FROM productos WHERE slug = $1', [slug]);
      
      const products = result.rows.map(row => new Product(row));
  
      res.status(200).json(products);
    } catch (error) {
      console.error('Error al obtener productos por categoria:', error);
      res.status(500).json({ message: 'Error al obtener productos por categoria' });
    }
};

// Obtener listado de categorías que son padre
const getParentCategories = async () => {
  const query = `SELECT id, slug, name FROM categories WHERE parent_id IS NULL`;
  
  try {
    const result = await pool.query(query);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener valores de atributos:', error);
    throw new Error('No se pudo obtener los valores de atributos');
  }
};

// Obtener listado de subcategorias dado un padre
const getSubcategoriesByParent = async (parentId) => {
  const query = `SELECT id, slug, name FROM categories WHERE parent_id = $1`;
  
  try {
    const result = await pool.query(query, [parentId]);
    return result.rows;
  } catch (error) {
    console.error('Error al obtener subcategorías:', error);
    throw new Error('No se pudo obtener las subcategorías');
  }
};


/**
 * @swagger
 * /category/get-grouped-categories:
 *   get:
 *     summary: Obtener categorías agrupadas con subcategorías
 *     description: Devuelve las categorías padres con sus subcategorías agrupadas. Si una categoría no tiene hijos, el arreglo estará vacío.
 *     tags:
 *       - Categorías
 *     responses:
 *       200:
 *         description: Lista agrupada de categorías y subcategorías
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   parent_id:
 *                     type: integer
 *                     example: 1
 *                   slug:
 *                     type: string
 *                     example: "ropa-hombre"
 *                   category:
 *                     type: string
 *                     example: "Ropa Hombre"
 *                   subcategories:
 *                     type: array
 *                     items:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: integer
 *                           example: 4
 *                         name:
 *                           type: string
 *                           example: "Pantalones"
 *                         slug:
 *                           type: string
 *                           example: "pantalones"
 *                         parent_id:
 *                           type: integer
 *                           example: 1
 *       500:
 *         description: Error al obtener categorías agrupadas
 */
// Obtiene un listado con categorias y cada categoria tiene subcategorias, si no tiene subcategorías, el arreglo subcategorías queda vacio
export const getGroupedCategories = async (req, res) => {
  try {
    // Obtener categorías padre
    const parentCategories = await getParentCategories();
    
    const result = [];

    // Recorrer cada categoría padre y obtener sus subcategorías
    for (const parentCategory of parentCategories) {
      const subcategories = await getSubcategoriesByParent(parentCategory.id);

      result.push({
        parent_id: parentCategory.id,
        slug: parentCategory.slug,
        category: parentCategory.name,
        subcategories: subcategories
      });
    }

    // Responder con el resultado
    res.status(200).json(result);

  } catch (error) {
    console.error('Error al obtener categorías y subcategorías:', error);
    res.status(500).json({ message: 'Error al obtener categorías y subcategorías' });
  }
};

// Obtener id y parent_id desde el slug
const getParentData = async (slug) => {

  const categoryResult = await pool.query(
    `SELECT id, parent_id FROM categories WHERE slug = $1`,
    [slug]
  );

  if (categoryResult.rows.length === 0) {
    return null;
  }
  
  return categoryResult; 
};


// Consulta con UNION para obtener productos asociados a la categoría y sus subcategorías
// Obtiene el p.id, p.slug y p.title
const getProductsByCategoryAndSubcategory = async (categoryId) => {
  const query = `
    (
      SELECT p.id, p.slug, p.title
      FROM categories c, product_categories pc, products p
      WHERE c.id = $1
        AND pc.category_id = c.id
        AND pc.product_id = p.id
        AND p.product_type = 'simple'
        AND p.status = 'publish'
    )
    UNION
    (
      SELECT p.id, p.slug, p.title
      FROM categories c, product_categories pc, products p
      WHERE c.parent_id = $1
        AND pc.category_id = c.id
        AND pc.product_id = p.id
        AND p.product_type = 'simple'
        AND p.status = 'publish'
    )
  `;

  const result = await pool.query(query, [categoryId]);

  if (result.rows.length === 0) {
    return null;
  }

  return result;
};



// Obtener detalles desde product_meta
const getMetaDetails = async (ids) => {

  const detalles = await pool.query(
    `SELECT pm.product_id, pm.price, pm.regular_price, pm.sale_price, pm.visibility
    FROM product_meta pm
    WHERE pm.product_id = ANY($1)`,
    [ids]
  );

  if (detalles.rows.length === 0) {
    return null;
  }
  
  return detalles; 
};



// Combina un producto con sus detalles de precio y visibilidad.
// Si no encuentra precio directo, busca variantes y calcula el rango de precios.
const mergeProductWithDetails = async (product, detailsMap) => {
  const detail = detailsMap.get(product.id) || {};
  let { price, regular_price = null, sale_price = null, visibility = null } = detail;

  // Si no tiene precio, se consultan sus variantes
  if (price == null) {
    const variants = await getValueDetailsAndProducts(product.slug);
    const variantsRows = variants?.rows || [];
  
    // Filtrar variantes visibles solamente
    const VisibleVariants = variantsRows.filter(v => v.visibility === 'visible');
  
    if (VisibleVariants.length > 0) {
      // Calcular precio mínimo y máximo solo entre las variantes visibles
      const prices = VisibleVariants.map(v => v.price);
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      if (min !==  max){
        price = [min, max];
      }
      else{
        price = min;
      }
  
      // Obtener visibilidad desde la primera variante visible
      visibility = VisibleVariants[0].visibility ?? null;
    } else {
      // No hay variantes visibles con precio
      price = null;
      visibility = 'hidden';
    }
  }
  
  return {
    ...product,
    price,
    regular_price,
    sale_price,
    visibility,
  };
};



/**
 * @swagger
 * /category/products-by-categories:
 *   post:
 *     summary: Obtener productos por categoría
 *     description: Retorna productos que pertenecen a la categoría indicada por su slug, incluyendo subcategorías. Soporta paginación y ordenamiento.
 *     tags:
 *       - Categorías
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - slug
 *             properties:
 *               slug:
 *                 type: string
 *                 example: "zapatillas"
 *               page:
 *                 type: integer
 *                 example: 1
 *               sort:
 *                 type: string
 *                 enum: [price_asc, price_desc, name_asc, name_desc]
 *                 example: "price_desc"
 *     responses:
 *       200:
 *         description: Productos obtenidos exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 slug:
 *                   type: string
 *                   example: "zapatillas"
 *                 page:
 *                   type: integer
 *                   example: 1
 *                 totalPages:
 *                   type: integer
 *                   example: 3
 *                 totalProducts:
 *                   type: integer
 *                   example: 60
 *                 sortBy:
 *                   type: string
 *                   example: "price"
 *                 order:
 *                   type: string
 *                   example: "desc"
 *                 products:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       title:
 *                         type: string
 *                       price:
 *                         type: number
 *                       slug:
 *                         type: string
 *                       visibility:
 *                         type: string
 *       400:
 *         description: Falta el parámetro slug
 *       500:
 *         description: Error al obtener productos
 */
// Función que entrega un listado de productos, considerando la categoría y subcategoría
export const getProductsByCategories = async (req, res) => {
  const { slug, page = 1, sort } = req.body;
  const pageSize = 20;

  let sortBy = 'default';
  let order = null; // Orden de ordenamiento, no de compra
  
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

  // Validar parámetro de entrada
  if (!slug) {
    return res.status(400).json({ message: 'Falta el parámetro: slug es requerido' });
  }

  try {
    // Buscar ID de la categoría a partir del slug
    const categoryResult = await getParentData(slug);
    if (!categoryResult.rows.length) return res.status(200).json([]);

    const categoryId = categoryResult.rows[0].id;

    // Obtener productos de la categoría y sus subcategorías
    const productsResult = await getProductsByCategoryAndSubcategory(categoryId);
    const products = productsResult?.rows || [];
    if (products.length === 0) return res.status(200).json([]);

    // Obtener metadatos de los productos (precio, visibilidad, etc.)
    const ids = products.map(p => p.id);
    const details = await getMetaDetails([ids]);

    // Crear un mapa para acceder rápidamente a los detalles por ID
    const detailsMap = new Map(
      details.rows.map(d => [parseInt(d.product_id), d])
    );

    // Unir cada producto con sus detalles, consultando variantes si es necesario
    // Productos combinados
    let productsMerged = await Promise.all(
      products.map(product => mergeProductWithDetails(product, detailsMap))
    );


    // Se ordena el listado de prodcutos y se guarda en la lista original de productos combinados
    const paginatedProducts = await sortProducts(page, productsMerged, sortBy, order);

    const totalPages = Math.ceil(productsMerged.length / pageSize);

    const totalProducts = productsMerged.length;
    // Devolver productos
    return res.status(200).json({
      slug,
      totalPages,
      page,
      totalProducts, 
      sortBy,
      order,
      products: paginatedProducts
    });

  } catch (error) {
    console.error('Error al obtener productos por categoría y subcategoría:', error);
    return res.status(500).json({ message: 'Error al obtener productos' });
  }
};