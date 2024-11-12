import swaggerJsdoc from 'swagger-jsdoc';

export const swaggerDoc = swaggerJsdoc({
  swaggerDefinition: {
    openapi: '3.0.1',
    info: {
      title: 'Message Service',
      version: '1.0.0',
      description: 'Message Service API',
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['**/controllers/*.{ts,js}'],
});
