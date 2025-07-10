import { pool } from '../../database/connectionPostgreSQL.js'
import State from '../models/state.js';

// Obtener un listado de regiones
export const fetchStates = async () => {
    const result = await pool.query(`
        SELECT *
        FROM states;
      `);
    return result.rows.map(row => new State(row))
}
