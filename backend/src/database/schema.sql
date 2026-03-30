-- ==============================
-- CREATE DATABASE
-- # Bước 1: Tạo database trước
-- psql -U postgres -c "CREATE DATABASE library_management_datn_2025_1;"

-- # Bước 2: Chạy toàn bộ schema (bỏ qua dòng CREATE DATABASE trong file)
-- psql -U postgres -d library_management_datn_2025_1 -f backend/src/config/schema.sql
-- ==============================
CREATE DATABASE library_management_datn_2025_1;

-- Sau khi chạy lệnh trên, kết nối vào DB rồi chạy tiếp phần dưới:
-- ==============================
-- USERS
-- ==============================
CREATE TABLE users (
    id              SERIAL        PRIMARY KEY,
    full_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    password        VARCHAR(255)  NOT NULL,
    avatar_url      VARCHAR(255),
    phone           VARCHAR(20),
    address         TEXT,
    role            VARCHAR(20)   NOT NULL CHECK (role   IN ('staff', 'reader')),
    status          VARCHAR(20)   NOT NULL DEFAULT 'active'
                        CHECK (status IN ('active', 'suspended', 'banned')),
    refresh_token   TEXT,                                 -- lưu refresh token (NULL khi logout)
    created_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP     DEFAULT CURRENT_TIMESTAMP
);


-- ==============================
-- BOOKS
-- ==============================
CREATE TABLE books (
    id                  VARCHAR(10)  PRIMARY KEY,         -- VD: BK001
    isbn                VARCHAR(50)  UNIQUE,
    title               VARCHAR(255) NOT NULL,
    book_cover          TEXT,
    author              VARCHAR(150),
    author_avatar       TEXT,
    genre               VARCHAR(100),
    publisher           VARCHAR(150),
    publish_year        INT,
    language            VARCHAR(50),
    pages               INT,
    location            VARCHAR(20),                      -- floor-room-shelf: 2-3-1
    quantity            INT          NOT NULL DEFAULT 0,  -- tổng số bản copy
    available           INT          NOT NULL DEFAULT 0,  -- số bản đang có sẵn
    currently_borrowed  INT          NOT NULL DEFAULT 0,  -- số bản đang được mượn
    borrowed_all_time   INT          NOT NULL DEFAULT 0,  -- tổng lượt mượn từ trước đến nay
    description         TEXT,
    created_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP
);


-- ==============================
-- BOOK COPIES
-- ==============================
CREATE TABLE book_copies (
    id          SERIAL       PRIMARY KEY,
    book_id     VARCHAR(10)  NOT NULL,
    barcode     VARCHAR(50)  UNIQUE NOT NULL,              -- mã vạch / QR trên bìa sách
    condition   VARCHAR(20)  NOT NULL DEFAULT 'good'
                    CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),
    status      VARCHAR(20)  NOT NULL DEFAULT 'available'
                    CHECK (status IN ('available', 'borrowed', 'lost', 'damaged')),
    notes       TEXT,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_copy_book
        FOREIGN KEY (book_id)
        REFERENCES books(id)
        ON DELETE CASCADE
);


-- ==============================
-- BORROWS
-- ==============================
CREATE TABLE borrows (
    id              SERIAL       PRIMARY KEY,
    user_id         INT          NOT NULL,
    book_copy_id    INT          NOT NULL,
    borrow_date     DATE         NOT NULL DEFAULT CURRENT_DATE,
    due_date        DATE         NOT NULL,
    return_date     DATE,                                  -- NULL = chưa trả
    fine_amount     INT          NOT NULL DEFAULT 0 CHECK (fine_amount >= 0),
    status          VARCHAR(20)  NOT NULL
                        CHECK (status IN ('borrowing', 'returned', 'overdue', 'lost')),
    renew_count     INT          NOT NULL DEFAULT 0,
    renew_limit     INT          NOT NULL DEFAULT 2,
    note            TEXT,
    created_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_borrow_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_borrow_copy
        FOREIGN KEY (book_copy_id)
        REFERENCES book_copies(id)
        ON DELETE CASCADE
);


-- ==============================
-- PAYMENTS
-- ==============================
CREATE TABLE payments (
    id              SERIAL       PRIMARY KEY,
    user_id         INT          NOT NULL,
    borrow_id       INT          UNIQUE,                   -- 1 khoản phạt gắn với 1 lượt mượn
    amount          INT          NOT NULL CHECK (amount >= 0),
    payment_method  VARCHAR(30)  DEFAULT 'cash'
                        CHECK (payment_method IN ('cash', 'transfer', 'card')),
    payment_date    TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    status          VARCHAR(20)  NOT NULL
                        CHECK (status IN ('paid', 'unpaid', 'partial')),
    note            TEXT,

    CONSTRAINT fk_payment_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_payment_borrow
        FOREIGN KEY (borrow_id)
        REFERENCES borrows(id)
        ON DELETE CASCADE
);


-- ==============================
-- MESSAGES
-- ==============================
CREATE TABLE messages (
    id          SERIAL    PRIMARY KEY,
    sender_id   INT       NOT NULL,
    receiver_id INT       NOT NULL,
    content     TEXT      NOT NULL,
    is_read     BOOLEAN   NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_msg_sender
        FOREIGN KEY (sender_id)
        REFERENCES users(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_msg_receiver
        FOREIGN KEY (receiver_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ==============================
-- NOTIFICATIONS
-- ==============================
CREATE TABLE notifications (
    id          SERIAL       PRIMARY KEY,
    user_id     INT          NOT NULL,
    type        VARCHAR(30)  DEFAULT 'general'
                    CHECK (type IN ('general', 'due_reminder', 'overdue', 'fine', 'system')),
    title       VARCHAR(255),
    message     TEXT         NOT NULL,
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);


-- ==============================
-- INDEXES (Performance)
-- ==============================
CREATE INDEX idx_borrows_user_id        ON borrows(user_id);
CREATE INDEX idx_borrows_status         ON borrows(status);
CREATE INDEX idx_borrows_due_date       ON borrows(due_date);
CREATE INDEX idx_book_copies_book_id    ON book_copies(book_id);
CREATE INDEX idx_book_copies_status     ON book_copies(status);
CREATE INDEX idx_book_copies_barcode    ON book_copies(barcode);
CREATE INDEX idx_notifications_user_id  ON notifications(user_id);
CREATE INDEX idx_messages_receiver_id   ON messages(receiver_id);
-- Index cho refresh_token để tìm kiếm nhanh khi verify
CREATE INDEX idx_users_refresh_token    ON users(refresh_token);


-- ==============================
-- AUTO-UPDATE updated_at TRIGGER
-- ==============================

-- Hàm trigger dùng chung cho tất cả bảng
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Gắn trigger vào từng bảng có cột updated_at
CREATE TRIGGER trg_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_book_copies_updated_at
    BEFORE UPDATE ON book_copies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_borrows_updated_at
    BEFORE UPDATE ON borrows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();


-- ==============================
-- SEED DATA MẪU (tuỳ chọn)
-- ==============================

-- Tài khoản staff mẫu (password: Admin@123)
INSERT INTO users (full_name, email, password, role, status)
VALUES (
    'Admin Library',
    'admin@library.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt của 'Admin@123'
    'staff',
    'active'
);

-- Tài khoản reader mẫu (password: Reader@123)
INSERT INTO users (full_name, email, password, role, status)
VALUES (
    'Nguyen Van A',
    'reader@library.com',
    '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', -- bcrypt của 'Reader@123'
    'reader',
    'active'
);

-- Sách mẫu
INSERT INTO books (id, isbn, title, author, genre, publisher, publish_year, language, pages, location, quantity, available)
VALUES
    ('BK001', '978-0-7432-7356-5', 'The Great Gatsby',           'F. Scott Fitzgerald', 'Fiction',    'Scribner',          1925, 'English', 180, '1-1-1', 3, 3),
    ('BK002', '978-0-06-112008-4', 'To Kill a Mockingbird',      'Harper Lee',          'Fiction',    'HarperCollins',     1960, 'English', 281, '1-1-2', 2, 2),
    ('BK003', '978-0-452-28423-4', '1984',                       'George Orwell',       'Dystopian',  'Penguin Books',     1949, 'English', 328, '1-2-1', 4, 4),
    ('BK004', '978-0-14-143951-8', 'Pride and Prejudice',        'Jane Austen',         'Romance',    'Penguin Classics',  1813, 'English', 432, '1-2-2', 2, 2),
    ('BK005', '978-0-7432-7357-2', 'The Catcher in the Rye',     'J.D. Salinger',       'Fiction',    'Little, Brown',     1951, 'English', 224, '1-3-1', 3, 3);

-- Book copies mẫu cho BK001 (3 bản)
INSERT INTO book_copies (book_id, barcode, condition, status)
VALUES
    ('BK001', 'BC001-001', 'good',      'available'),
    ('BK001', 'BC001-002', 'good',      'available'),
    ('BK001', 'BC001-003', 'excellent', 'available');

-- Book copies mẫu cho BK002 (2 bản)
INSERT INTO book_copies (book_id, barcode, condition, status)
VALUES
    ('BK002', 'BC002-001', 'good', 'available'),
    ('BK002', 'BC002-002', 'fair', 'available');