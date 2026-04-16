-- ==============================
-- MIGRATION: Thêm/sửa cột reference_id trong notifications
-- ==============================
-- books.id hiện là VARCHAR(10), nên reference_id cần cùng kiểu dữ liệu
-- để lưu book_id cho thông báo đánh giá sách sau khi trả.
ALTER TABLE notifications
ADD COLUMN IF NOT EXISTS reference_id VARCHAR(10) DEFAULT NULL;

-- Nếu cột đã tồn tại nhưng sai kiểu (INT), chuyển sang VARCHAR(10).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'notifications'
      AND column_name = 'reference_id'
      AND data_type <> 'character varying'
  ) THEN
    ALTER TABLE notifications
    ALTER COLUMN reference_id TYPE VARCHAR(10)
    USING reference_id::VARCHAR(10);
  END IF;
END $$;

-- Cột này dùng để lưu book_id khi tạo notification đánh giá sách
-- Frontend dùng reference_id để biết sách nào cần review
COMMENT ON COLUMN notifications.reference_id IS 'ID của resource liên quan (e.g., book_id khi yêu cầu review)';
