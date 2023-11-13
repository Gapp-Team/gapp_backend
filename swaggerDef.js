const swaggerDefinition = {
    info: {
      title: 'Gapp',
      version: '3.1.0',
      description: 'API documentation for Gapp',
    },
    basePath: '/',
  };
  
  const options = {
    swaggerDefinition,
    apis: ['./routes/categories.js', './routes/products.js', './routes/users.js'],
  };
  
  module.exports = options;
  
  