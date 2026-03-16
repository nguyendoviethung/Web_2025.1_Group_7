import pkg from 'pg';
const { Pool } = pkg;

// Không tạo pool ngay — tạo lazily khi connect() được gọi
let pool = null;

const getPool = () => {
  if (!pool) {
    pool = new Pool({
      host:     process.env.DB_HOST     || 'localhost',
      port:     parseInt(process.env.DB_PORT || '5432', 10),
      user:     process.env.DB_USER,
      password: String(process.env.DB_PASSWORD),
      database: process.env.DB_NAME,
    });
  }
  return pool;
};

const connect = async (callback) => {
  try {
    const client = await getPool().connect();
    callback(null, client, () => client.release());
  } catch (err) {
    callback(err, null, null);
  }
};


export { connect, getPool };
export default getPool;