import { pool } from '../../database/connectionPostgreSQL.js'
import City from '../models/city.js';

// Obtener un listado de comunas
export const fetchCities = async () => {
    const result = await pool.query(`
        SELECT *
        FROM cities;
      `);
    return result.rows.map(row => new City(row))
}



// obtener las comunas asociadas a una región, usando la id de una región
export const fetchCitiesByStateId = async (state_id) => {
  const result = await pool.query(`
    SELECT *
    FROM cities
    WHERE cities.state_id = $1
  `, [state_id]);
  return result.rows.map(row => new City(row))
}


