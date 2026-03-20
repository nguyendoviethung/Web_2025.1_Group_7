import getPool from '../config/db.js';

const BookModel = {

  // Lấy danh sách sách với phân trang, tìm kiếm, lọc thể loại, sắp xếp
async findAll({ search = '', genre = '', page = 1, limit = 10, sortBy = 'created_at', sortOrder = 'DESC' }) {
  const offset = (Number(page) - 1) * Number(limit);
  const params = [];
  const where  = [];

  if (search) {
    params.push(`%${search}%`);
    where.push(`(title ILIKE $${params.length} OR author ILIKE $${params.length})`);
  }

  if (genre) {
    params.push(genre);
    where.push(`genre = $${params.length}`);
  }

  const whereSQL = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Whitelist các cột được phép sort — tránh SQL injection
  const allowedSort = ['title', 'author', 'genre', 'quantity', 'available', 'borrowed_all_time', 'created_at', 'publish_year'];
  const safeSortBy    = allowedSort.includes(sortBy) ? sortBy : 'created_at';
  const safeSortOrder = sortOrder?.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const countRes = await getPool().query(
    `SELECT COUNT(*) FROM books ${whereSQL}`,
    params
  );

  params.push(Number(limit), offset);

  const dataRes = await getPool().query(
    `SELECT * FROM books ${whereSQL}
     ORDER BY ${safeSortBy} ${safeSortOrder}
     LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  );

  return {
    books: dataRes.rows,
    total: Number(countRes.rows[0].count),
  };
},

// Lấy danh sách thể loại sách
  async getGenres() {
    return await getPool().query(`
      SELECT DISTINCT genre
      FROM books
      WHERE genre IS NOT NULL AND genre != ''
      ORDER BY genre ASC
    `)
  },
    
  //  Tìm sách theo id
  async findById(id) {
    const result = await getPool().query(
      'SELECT * FROM books WHERE id = $1', [id]
    );
    return result.rows[0] || null;
  },

  // Thêm sách mới
  async create(data) {
    const {
      id, isbn, title, book_cover, author, author_avatar,
      genre, publisher, publish_year, language, pages,
      location, quantity, available, description,
    } = data;

    const result = await getPool().query(`
      INSERT INTO books (
        id, isbn, title, book_cover, author, author_avatar, genre,
        publisher, publish_year, language, pages, location,
        quantity, available, description
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15)
      RETURNING *
    `, [
      id, isbn, title, book_cover, author, author_avatar, genre,
      publisher, publish_year, language, pages, location,
      quantity || 0, available ?? quantity ?? 0, description,
    ]);
    return result.rows[0];
  },

  // Cập nhật sách
  async update(id, data) {
    const {
      title, book_cover, author, author_avatar, genre,
      publisher, publish_year, language, pages,
      location, quantity, description,
    } = data;

    const result = await getPool().query(`
      UPDATE books SET
        title=$2, book_cover=$3, author=$4, author_avatar=$5,
        genre=$6, publisher=$7, publish_year=$8, language=$9,
        pages=$10, location=$11, quantity=$12,
        description=$13, updated_at=NOW()
      WHERE id=$1 RETURNING *
    `, [
      id, title, book_cover, author, author_avatar, genre,
      publisher, publish_year, language, pages,
      location, quantity, description,
    ]);
    return result.rows[0] || null;
  },

  async delete(id) {
    await getPool().query('DELETE FROM books WHERE id = $1', [id]);
  },

  async getCopies(bookId) {
    const result = await getPool().query(
      'SELECT * FROM book_copies WHERE book_id = $1 ORDER BY id ASC',
      [bookId]
    );
    return result.rows;
  },

  // Thêm nhiều copies cùng lúc
async addCopiesBulk({ book_id, quantity, condition, notes }) {
  const qty = Number(quantity);
  if (qty < 1) throw new Error('Quantity must be at least 1');

  // Lấy barcode lớn nhất hiện tại của book này
  // VD: BK001-005 → lấy số 5
  const existRes = await getPool().query(
    `SELECT barcode
     FROM book_copies
     WHERE book_id = $1
     ORDER BY barcode DESC
     LIMIT 1`,
    [book_id]
  );

  let lastIndex = 0;

  if (existRes.rows.length > 0) {
    const lastBarcode = existRes.rows[0].barcode;
    // Parse số cuối sau dấu '-'
    // VD: "BK001-005" → "005" → 5
    const parts = lastBarcode.split('-');
    const lastNum = parseInt(parts[parts.length - 1], 10);
    if (!isNaN(lastNum)) {
      lastIndex = lastNum;
    }
  }

  // Generate barcodes mới với format 3 chữ số
  // VD: lastIndex=5, qty=3 → BK001-006, BK001-007, BK001-008
  const values       = [];
  const placeholders = [];

  for (let i = 0; i < qty; i++) {
    const nextIndex = lastIndex + i + 1;
    // Pad 3 chữ số: 1→001, 12→012, 123→123
    const barcode = `${book_id}-${String(nextIndex).padStart(3, '0')}`;
    const base    = i * 4;
    placeholders.push(
      `($${base + 1}, $${base + 2}, $${base + 3}, 'available', $${base + 4})`
    );
    values.push(book_id, barcode, condition || 'good', notes || null);
  }

  const result = await getPool().query(
    `INSERT INTO book_copies (book_id, barcode, condition, status, notes)
     VALUES ${placeholders.join(', ')}
     RETURNING *`,
    values
  );

  // Cập nhật quantity + available
  await getPool().query(
    `UPDATE books
     SET quantity  = quantity  + $1,
         available = available + $1
     WHERE id = $2`,
    [qty, book_id]
  );

  return result.rows;
},

// Cập nhật 1 copy
  async updateCopy(copyId, { status, condition, notes }) {
    const result = await getPool().query(`
      UPDATE book_copies
      SET status=$2, condition=$3, notes=$4, updated_at=NOW()
      WHERE id=$1 RETURNING *
    `, [copyId, status, condition, notes || null]);
    return result.rows[0];
  },

  // Xóa 1 copy
  async deleteCopy(copyId) {
    const res = await getPool().query(
      'SELECT book_id FROM book_copies WHERE id = $1', [copyId]
    );
    if (!res.rows[0]) return;

    const { book_id } = res.rows[0];
    await getPool().query('DELETE FROM book_copies WHERE id = $1', [copyId]);
    await getPool().query(
      `UPDATE books
       SET quantity  = quantity  - 1,
           available = available - 1
       WHERE id = $1`,
      [book_id]
    );
  },
};

export default BookModel;