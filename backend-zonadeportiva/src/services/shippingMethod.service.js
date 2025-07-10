import { pool } from '../../database/connectionPostgreSQL.js'
import Shipping_method from '../models/shippingMethod.js';
import City from '../models/city.js';



/*
// Obtener listado de precios para la ubicacion, recibe el id de la comuna
export const fetchShippingMethods = async (city_id) => {
  // Obtener el id de la región metropolitana
  const RM = await pool.query(`
    SELECT id
    FROM states
    WHERE short_name = 'RM'
  `);
   
  // Obtener el id de la región de la comuna que se recibe
  const state_id = await pool.query(`
    SELECT state_id
    FROM cities
    WHERE id = $1;
  `, [city_id]);


  if(state_id == RM){
    const name = await pool.query(`
      SELECT name
      FROM cities
      WHERE id = $1;
    `, [city_id]);

    const shipping_methods_ids = await pool.query(`
      SELECT shipping_method_id
      FROM metropolitan_shipping_options
      WHERE name = 'La Granja';
      WHERE id = $1;
    `, [name]);
    

    const result = await pool.query(`
      SELECT *
      FROM shipping_methods
      WHERE shipping_methods.id = ANY($1::int[])
    `, [shipping_methods_ids]);
    return result.rows.map(row => new Shipping_method(row));
  }
  else{
    const result = await pool.query(`
      SELECT *
      FROM shipping_methods
      WHERE shipping_methods.id = $1
    `, [2]);

    return result.rows.map(row => new Shipping_method(row))
  }
}

*/



// Obtener listado de precios para la ubicación; recibe el id de la comuna
export const fetchShippingMethods = async (city_id) => {
  // 1) ID de la Región Metropolitana ('RM')
  const rmRes = await pool.query(`
    SELECT id
    FROM states
    WHERE short_name = 'RM'
    LIMIT 1
  `);
  const rmId = rmRes.rows[0]?.id;

  // 2) Estado (región) de la comuna
  const stateRes = await pool.query(`
    SELECT state_id
    FROM cities
    WHERE id = $1
    LIMIT 1
  `, [city_id]);
  const stateId = stateRes.rows[0]?.state_id;

  // 3) Si es RM, buscamos métodos por id_city
  if (stateId === rmId) {
    const optsRes = await pool.query(`
      SELECT shipping_method_id
      FROM metropolitan_shipping_options
      WHERE id_city = $1
    `, [city_id]);

    const methodIds = optsRes.rows.map(r => r.shipping_method_id);
    if (methodIds.length === 0) return [];  // ningún método específico

    // Finalmente traemos los detalles de esos métodos
    const methodsRes = await pool.query(`
      SELECT *
      FROM shipping_methods
      WHERE id = ANY($1::int[])
    `, [methodIds]);

    return methodsRes.rows.map(row => new Shipping_method(row));
  }

  // 4) Otras regiones: método genérico (id = 2)
  const genericRes = await pool.query(`
    SELECT *
    FROM shipping_methods
    WHERE id = $1
  `, [2]);

  return genericRes.rows.map(row => new Shipping_method(row));
};





// obtener las comunas asociadas a una región, usando la id de una región
export const fetchCitiesByStateId = async (state_id) => {
  const result = await pool.query(`
    SELECT *
    FROM cities
    WHERE cities.state_id = $1
  `, [state_id]);
  return result.rows.map(row => new City(row))
}


