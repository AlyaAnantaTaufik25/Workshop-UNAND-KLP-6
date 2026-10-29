const path = require('path');
const dotenv = require('dotenv');

// Load environment variables from backend/.env
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const config = {
  app: {
    port: parseInt(process.env.PORT, 10) || 5000,
    env: process.env.NODE_ENV || 'development',
    apiPrefix: process.env.API_PREFIX || '/api/v1',
  },
  cors: {
    origin: process.env.CORS_ORIGIN
      ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim())
      : ['http://localhost:5173', 'http://localhost:3000'],
  },
  db: {
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT, 10) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'sim_workshop_unand',
    connectionLimit: parseInt(process.env.DB_CONNECTION_LIMIT, 10) || 10,
    connectTimeout: 2000,
    waitForConnections: true,
    queueLimit: 0,
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'dev_secret_unand_workshop',
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  },
};

module.exports = config;

