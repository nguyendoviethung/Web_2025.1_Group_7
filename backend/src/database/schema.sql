-- ==============================
-- CREATE DATABASE
-- # Bước 1: Tạo database trước
-- psql -U postgres -c "CREATE DATABASE library_management_datn_2025_1;"
-- # Bước 2: Chạy toàn bộ schema (bỏ qua dòng CREATE DATABASE trong file)
-- psql -U postgres -d library_management_datn_2025_1 -f backend/src/config/schema.sql
-- ==============================
CREATE DATABASE library_management_datn_2025_1;

-- ==============================
-- USERS
-- ==============================
CREATE TABLE users (
    id              SERIAL        PRIMARY KEY,
    full_name       VARCHAR(100)  NOT NULL,
    email           VARCHAR(150)  NOT NULL UNIQUE,
    student_id      VARCHAR(20)   UNIQUE,                   -- Mã số sinh viên (nếu là reader), NULL nếu là staff 
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
    favorite_genres TEXT[]        DEFAULT '{}'        -- mảng lưu các thể loại yêu thích (VD: {'Fiction', 'Science'}) 
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
    updated_at          TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,
    avg_rating      NUMERIC(3,2)  NOT NULL DEFAULT 0,    -- điểm đánh giá trung bình từ reviews
    review_count    INT           NOT NULL DEFAULT 0     -- tổng số review đã viết
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
    reference_id VARCHAR(10),
    is_read     BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP    DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_notif_user
        FOREIGN KEY (user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);

-- ==============================
-- BOOK RESERVATIONS
-- ==============================

CREATE TABLE book_reservations (
    id           SERIAL        PRIMARY KEY,
    user_id      INT           NOT NULL,
    book_id      VARCHAR(10)   NOT NULL,
    status       VARCHAR(20)   NOT NULL DEFAULT 'pending'
                     CHECK (status IN (
                         'pending',    -- đang chờ sách available
                         'ready',      -- sách đã available, chờ đến lấy
                         'fulfilled',  -- đã đến lấy & mượn thành công
                         'cancelled',  -- user tự hủy
                         'expired'     -- quá hạn không đến lấy
                     )),
    reserved_at  TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- Khi status = 'ready': expires_at = ready_at + 3 ngày
    expires_at   TIMESTAMP,
    notified_at  TIMESTAMP,   -- thời điểm đã gửi thông báo "sách sẵn sàng"
    notes        TEXT,
 
    CONSTRAINT fk_res_user
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_res_book
        FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE,
 
    -- 1 user chỉ có 1 reservation pending/ready cho 1 sách tại 1 thời điểm
    CONSTRAINT uq_active_reservation
        UNIQUE NULLS NOT DISTINCT (user_id, book_id, status)
);
 
CREATE INDEX idx_res_user_id   ON book_reservations(user_id);
CREATE INDEX idx_res_book_id   ON book_reservations(book_id);
CREATE INDEX idx_res_status    ON book_reservations(status);
 
-- ==============================
-- BOOK REVIEWS
-- ==============================

CREATE TABLE book_reviews (
    id          SERIAL        PRIMARY KEY,
    user_id     INT           NOT NULL,
    book_id     VARCHAR(10)   NOT NULL,
    borrow_id   INT,          -- gắn với lượt mượn cụ thể (nullable: review manual)
    rating      SMALLINT      NOT NULL CHECK (rating BETWEEN 1 AND 5),
    content     TEXT,         -- nội dung review (tùy chọn)
    is_approved BOOLEAN       NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP     DEFAULT CURRENT_TIMESTAMP,
 
    CONSTRAINT fk_rev_user
        FOREIGN KEY (user_id)  REFERENCES users(id)    ON DELETE CASCADE,
    CONSTRAINT fk_rev_book
        FOREIGN KEY (book_id)  REFERENCES books(id)    ON DELETE CASCADE,
    CONSTRAINT fk_rev_borrow
        FOREIGN KEY (borrow_id) REFERENCES borrows(id) ON DELETE SET NULL,
 
    -- 1 user chỉ review 1 sách 1 lần
    CONSTRAINT uq_user_book_review UNIQUE (user_id, book_id)
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
CREATE INDEX idx_rev_book_id ON book_reviews(book_id);
CREATE INDEX idx_rev_user_id ON book_reviews(user_id);
-- Tăng tốc query getConversations
CREATE INDEX IF NOT EXISTS idx_messages_sender_receiver
    ON messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at
    ON messages(created_at DESC);
 
CREATE INDEX IF NOT EXISTS idx_notif_user_read
    ON notifications(user_id, is_read);

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

-- Trigger cập nhật updated_at
CREATE TRIGGER trg_books_updated_at
    BEFORE UPDATE ON books
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_book_copies_updated_at
    BEFORE UPDATE ON book_copies
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_borrows_updated_at
    BEFORE UPDATE ON borrows
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger cập nhật updated_at
CREATE TRIGGER trg_reviews_updated_at
    BEFORE UPDATE ON book_reviews
    FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE OR REPLACE FUNCTION update_book_rating()
RETURNS TRIGGER AS $$
DECLARE
    v_book_id VARCHAR(10);
BEGIN
    -- Xác định book_id từ NEW hoặc OLD
    v_book_id := COALESCE(NEW.book_id, OLD.book_id);
 
    UPDATE books
    SET
        avg_rating   = COALESCE((
            SELECT ROUND(AVG(rating)::NUMERIC, 2)
            FROM book_reviews
            WHERE book_id = v_book_id AND is_approved = TRUE
        ), 0),
        review_count = (
            SELECT COUNT(*)
            FROM book_reviews
            WHERE book_id = v_book_id AND is_approved = TRUE
        )
    WHERE id = v_book_id;
 
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;
 
CREATE TRIGGER trg_update_book_rating
    AFTER INSERT OR UPDATE OR DELETE ON book_reviews
    FOR EACH ROW EXECUTE FUNCTION update_book_rating();