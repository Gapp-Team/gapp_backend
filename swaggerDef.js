const swaggerDefinition = {
  info: {
      title: 'Gapp',
      version: '3.0.3',
      description: 'API documentation for Gapp',
  },
  servers: [
      { url: 'http://192.168.0.26:3000', description: 'Development Server' },
  ],
  components: {
      securitySchemes: {
          jwt: {
              type: 'apiKey',
              in: 'header',
              name: 'Authorization',
          },
      },
  },
  security: [
      {
          jwt: [],
      },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./routes/*.js',  './components/schemas/*.js'],
};

module.exports = options;
