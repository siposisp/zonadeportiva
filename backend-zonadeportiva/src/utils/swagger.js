import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Zona Deportiva API',
      version: '1.0.0',
      description: 'Documentación de la API Zona Deportiva',
    },
    servers: [
      {
        url: 'http://localhost:3000/', // Asegúrate de que esta URL base sea correcta
        description: 'Servidor de desarrollo',
      },
    ],
  },
  apis: [
    './src/controllers/*.js', 
    './src/controllers/paymentsMethods/*.js',
  ],
};

const specs = swaggerJSDoc(options);

export { swaggerUi, specs };