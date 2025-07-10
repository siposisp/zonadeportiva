import app from './app.js';
import fs from 'fs';

// Leer data de utils/postgresql.js (si lo quieres usar)
const readData = () => {
  const data = fs.readFileSync('utils/postgresql.js', 'utf8');
  console.log('Data:', data);
};

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor en puerto ${PORT}`);
});
