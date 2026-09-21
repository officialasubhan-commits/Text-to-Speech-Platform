const app = require('./src/app');
const config = require('./src/config');

const startServer = async () => {
  try {
    app.listen(config.port, () => {
      console.log(`\n Server running on port ${config.port}`);
      console.log(` Environment: ${config.nodeEnv}`);
      console.log(` Health check: http://localhost:${config.port}/api/health\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
