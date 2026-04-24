import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';
import { createServer } from 'http';

import { startBorrowCron } from './cron/cron.js';
import { setupWsServer }  from './ws/wsServer.js';

const require   = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env
require('dotenv').config({ path: resolve(__dirname, '../.env') });

// Debug env
console.log('DB_HOST     =', process.env.DB_HOST);
console.log('DB_USER     =', process.env.DB_USER);
console.log('DB_NAME     =', process.env.DB_NAME);
console.log('DB_PASSWORD =', process.env.DB_PASSWORD);

// Import app + db
import app         from './app.js';
import { connect } from './config/db.js';

const PORT = process.env.PORT || 3000;

//  Tạo HTTP server từ Express
const httpServer = createServer(app);

//  Gắn WebSocket vào server
setupWsServer(httpServer);

connect((err, client, release) => {
  if (err) {
    console.error('Cannot connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  release();
  console.log('PostgreSQL connected');

  // Cron job
  startBorrowCron();

  // Start server
  httpServer.listen(PORT, () => {
    console.log(` HTTP + WS server running at http://localhost:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

// Error handlers
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});