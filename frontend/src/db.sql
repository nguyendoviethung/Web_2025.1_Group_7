    -- ==============================
    -- CREATE DATABASE
    -- ==============================
    CREATE DATABASE library_management;
    -- \c library_management


    -- ==============================
    -- USERS
    -- ==============================
    CREATE TABLE users (
        id          SERIAL PRIMARY KEY,
        full_name   VARCHAR(100)  NOT NULL,
        email       VARCHAR(150)  NOT NULL UNIQUE,
        password    VARCHAR(255)  NOT NULL,
        avatar_url  VARCHAR(255),
        phone       VARCHAR(20),                          -- [THÊM] số điện thoại liên lạc
        address     TEXT,                                 -- [THÊM] địa chỉ
        role        VARCHAR(20)   NOT NULL CHECK (role   IN ('staff', 'reader')),
        status      VARCHAR(20)   NOT NULL CHECK (status IN ('active', 'disabled', 'banned')),
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );


    -- ==============================
    -- BOOKS
    -- ==============================
    CREATE TABLE books (
        id                  VARCHAR(10)  PRIMARY KEY,     -- BK001
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
        location            VARCHAR(20),                  -- floor-room-shelf: 2-3-1
        quantity            INT NOT NULL DEFAULT 0,       -- tổng số bản copy
        available           INT NOT NULL DEFAULT 0,       -- số bản đang có sẵn
        currently_borrowed  INT NOT NULL DEFAULT 0,       -- số bản đang được mượn
        borrowed_all_time   INT NOT NULL DEFAULT 0,       -- tổng lượt mượn từ trước đến nay
        description         TEXT,
        created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP   -- [THÊM]
    );


    -- ==============================
    -- BOOK COPIES
    -- ==============================
    -- Mỗi bản vật lý của một đầu sách
    CREATE TABLE book_copies (
        id          SERIAL       PRIMARY KEY,
        book_id     VARCHAR(10)  NOT NULL,               
        barcode     VARCHAR(50)  UNIQUE NOT NULL,         -- mã vạch / QR trên bìa sách
        condition   VARCHAR(20)  NOT NULL DEFAULT 'good'
                        CHECK (condition IN ('excellent', 'good', 'fair', 'poor')),  
        status      VARCHAR(20)  NOT NULL DEFAULT 'available'
                        CHECK (status IN ('available', 'borrowed', 'lost', 'damaged')),
        notes       TEXT,                                
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 

        CONSTRAINT fk_copy_book
            FOREIGN KEY (book_id)
            REFERENCES books(id)
            ON DELETE CASCADE
    );


    -- ==============================
    -- BORROWS
    -- ==============================
    CREATE TABLE borrows (
        id              SERIAL  PRIMARY KEY,
        user_id         INT     NOT NULL,
        book_copy_id    INT     NOT NULL,

        borrow_date     DATE    NOT NULL DEFAULT CURRENT_DATE,
        due_date        DATE    NOT NULL,
        return_date     DATE,                             -- NULL = chưa trả

        fine_amount     INT     NOT NULL DEFAULT 0 CHECK (fine_amount >= 0),  -- tiền phạt (VNĐ hoặc điểm)
        status          VARCHAR(20) NOT NULL
                            CHECK (status IN ('borrowing', 'returned', 'overdue', 'lost')),  -- [THÊM] 'lost'
        renew_count     INT NOT NULL DEFAULT 0,           -- số lần đã gia hạn
        renew_limit     INT NOT NULL DEFAULT 2,           -- [THÊM] giới hạn gia hạn tối đa
        note            TEXT,                             -- [THÊM] ghi chú của thủ thư

        created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,   -- [THÊM]

        CONSTRAINT fk_borrow_user
            FOREIGN KEY (user_id)       REFERENCES users(id)       ON DELETE CASCADE,
        CONSTRAINT fk_borrow_copy
            FOREIGN KEY (book_copy_id)  REFERENCES book_copies(id) ON DELETE CASCADE
    );


    -- ==============================
    -- PAYMENTS
    -- ==============================
    CREATE TABLE payments (
        id              SERIAL  PRIMARY KEY,
        user_id         INT     NOT NULL,
        borrow_id       INT     UNIQUE,                   -- 1 khoản phạt gắn với 1 lượt mượn

        amount          INT     NOT NULL CHECK (amount >= 0),
        payment_method  VARCHAR(30) DEFAULT 'cash'
                            CHECK (payment_method IN ('cash', 'transfer', 'card')),  -- [THÊM]
        payment_date    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        status          VARCHAR(20) NOT NULL
                            CHECK (status IN ('paid', 'unpaid', 'partial')),
        note            TEXT,                             -- [THÊM] ghi chú thanh toán

        CONSTRAINT fk_payment_user
            FOREIGN KEY (user_id)   REFERENCES users(id)    ON DELETE CASCADE,
        CONSTRAINT fk_payment_borrow
            FOREIGN KEY (borrow_id) REFERENCES borrows(id)  ON DELETE CASCADE
    );


    -- ==============================
    -- MESSAGES
    -- ==============================
    CREATE TABLE messages (
        id          SERIAL  PRIMARY KEY,
        sender_id   INT     NOT NULL,
        receiver_id INT     NOT NULL,
        content     TEXT    NOT NULL,
        is_read     BOOLEAN NOT NULL DEFAULT FALSE,       -- [THÊM] trạng thái đã đọc
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_msg_sender
            FOREIGN KEY (sender_id)   REFERENCES users(id) ON DELETE CASCADE,
        CONSTRAINT fk_msg_receiver
            FOREIGN KEY (receiver_id) REFERENCES users(id) ON DELETE CASCADE
    );


    -- ==============================
    -- NOTIFICATIONS
    -- ==============================
    CREATE TABLE notifications (
        id          SERIAL  PRIMARY KEY,
        user_id     INT     NOT NULL,
        type        VARCHAR(30) DEFAULT 'general'
                        CHECK (type IN ('general', 'due_reminder', 'overdue', 'fine', 'system')),  -- [THÊM]
        title       VARCHAR(255),                         -- [THÊM] tiêu đề thông báo
        message     TEXT    NOT NULL,
        is_read     BOOLEAN NOT NULL DEFAULT FALSE,
        created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

        CONSTRAINT fk_notif_user
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );


    -- ==============================
    -- INDEXES (Performance)
    -- ==============================
    CREATE INDEX idx_borrows_user_id       ON borrows(user_id);
    CREATE INDEX idx_borrows_status        ON borrows(status);
    CREATE INDEX idx_borrows_due_date      ON borrows(due_date);           -- [THÊM] tra cứu sách quá hạn
    CREATE INDEX idx_book_copies_book_id   ON book_copies(book_id);
    CREATE INDEX idx_book_copies_status    ON book_copies(status);         -- [THÊM]
    CREATE INDEX idx_book_copies_barcode   ON book_copies(barcode);        -- [THÊM] quét mã vạch nhanh
    CREATE INDEX idx_notifications_user_id ON notifications(user_id);
    CREATE INDEX idx_messages_receiver_id  ON messages(receiver_id);       -- [THÊM]