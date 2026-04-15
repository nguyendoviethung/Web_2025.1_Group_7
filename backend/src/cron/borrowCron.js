import cron              from 'node-cron';
import getPool           from '../config/db.js';
import ReservationModel  from '../models/reservationModel.js';
import NotificationModel from '../models/notificationModel.js';
 
const FINE_PER_DAY = 5000;
 
export const startBorrowCron = () => {
 
  // ── Chạy lúc 00:00 hàng ngày ─────────────────────────
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily borrow jobs...');
    const pool = getPool();
 
    try {
      // 1. Đánh dấu overdue
      const overdueRes = await pool.query(
        `UPDATE borrows SET status = 'overdue'
         WHERE status = 'borrowing' AND due_date < CURRENT_DATE AND return_date IS NULL
         RETURNING id, user_id, book_copy_id, due_date`
      );
 
      // Thông báo overdue cho user
      if (overdueRes.rows.length > 0) {
        const overdueNotifs = await Promise.all(
          overdueRes.rows.map(async (b) => {
            const bookRes = await pool.query(
              `SELECT bk.title FROM book_copies bc JOIN books bk ON bk.id = bc.book_id WHERE bc.id = $1`,
              [b.book_copy_id]
            );
            return {
              user_id: b.user_id,
              type:    'overdue',
              title:   'Book Overdue!',
              message: `"${bookRes.rows[0]?.title || 'A book'}" is overdue since ${new Date(b.due_date).toLocaleDateString('vi-VN')}. Please return it to avoid fines.`,
            };
          })
        );
        await NotificationModel.createBulk(overdueNotifs);
        console.log(`[CRON] Marked ${overdueRes.rows.length} borrow(s) as overdue`);
      }
 
      // 2. Cập nhật fine_amount
      await pool.query(
        `UPDATE borrows
         SET fine_amount = GREATEST(CURRENT_DATE - due_date, 0) * $1
         WHERE status = 'overdue' AND return_date IS NULL`,
        [FINE_PER_DAY]
      );
 
      // 3. Thông báo sắp đến hạn (còn 2 ngày)
      const dueSoonRes = await pool.query(
        `SELECT b.id, b.user_id, b.book_copy_id, b.due_date
         FROM borrows b
         WHERE b.status = 'borrowing'
           AND b.due_date = CURRENT_DATE + INTERVAL '2 days'
           AND b.return_date IS NULL`
      );
 
      if (dueSoonRes.rows.length > 0) {
        const dueSoonNotifs = await Promise.all(
          dueSoonRes.rows.map(async (b) => {
            const bookRes = await pool.query(
              `SELECT bk.title FROM book_copies bc JOIN books bk ON bk.id = bc.book_id WHERE bc.id = $1`,
              [b.book_copy_id]
            );
            return {
              user_id: b.user_id,
              type:    'due_reminder',
              title:   ' Due Date Reminder',
              message: `"${bookRes.rows[0]?.title || 'A book'}" is due on ${new Date(b.due_date).toLocaleDateString('vi-VN')}. Please return or renew it in time.`,
            };
          })
        );
        await NotificationModel.createBulk(dueSoonNotifs);
        console.log(`[CRON] Sent ${dueSoonRes.rows.length} due-soon notification(s)`);
      }
 
      // 4. Hủy reservation quá hạn (ready > 3 ngày không đến lấy)
      const expiredRes = await ReservationModel.expireOverdueReady();
      if (expiredRes.length > 0) {
        const expiredNotifs = expiredRes.map(r => ({
          user_id: r.user_id,
          type:    'general',
          title:   'Reservation Expired',
          message: `Your reservation has expired because you didn't pick it up in time. You can reserve again if needed.`,
        }));
        await NotificationModel.createBulk(expiredNotifs);
        console.log(`[CRON] Expired ${expiredRes.length} reservation(s)`);
      }
 
      console.log('[CRON] Daily jobs done');
    } catch (err) {
      console.error('[CRON] Error:', err);
    }
  });
};