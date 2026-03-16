import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const require   = createRequire(import.meta.url);
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env từ thư mục backend/
require('dotenv').config({ path: resolve(__dirname, '../.env') });

// Verify đã load đúng
console.log(' DB_HOST     =', process.env.DB_HOST);
console.log('DB_USER     =', process.env.DB_USER);
console.log(' DB_NAME     =', process.env.DB_NAME);
console.log(' DB_PASSWORD =', process.env.DB_PASSWORD);

// Import app và db
import app          from './app.js';
import { connect }  from './config/db.js';

const PORT = process.env.PORT || 3000;

connect((err, client, release) => {
  if (err) {
    console.error(' Cannot connect to PostgreSQL:', err.message);
    process.exit(1);
  }

  release();
  console.log(' PostgreSQL connected');

  app.listen(PORT, () => {
    console.log(` Server running at http://localhost:${PORT}`);
    console.log(` Environment: ${process.env.NODE_ENV || 'development'}`);
  });
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err.message);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err.message);
  process.exit(1);
});