const config = require('../config');
const prisma = require('../config/prisma');

/**
 * GET /api/health
 * Returns server health and service status information.
 */
const getHealth = async (req, res) => {
  const healthInfo = {
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: config.nodeEnv,
    services: {
      database: 'unknown',
    },
  };

  // Check database connection
  const db = prisma;
  if (db) {
    try {
      await db.$queryRaw`SELECT 1`;
      healthInfo.services.database = 'connected';
    } catch {
      healthInfo.services.database = 'disconnected';
      healthInfo.status = 'degraded';
    }
  } else {
    healthInfo.services.database = 'not initialized';
    healthInfo.status = 'degraded';
  }

  res.status(200).json(healthInfo);
};

module.exports = { getHealth };
