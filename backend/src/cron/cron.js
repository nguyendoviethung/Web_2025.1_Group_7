import cron from 'node-cron';
import getPool from '../config/db.js';
import ReservationModel from '../models/reservationModel.js';
import NotificationModel from '../models/notificationModel.js';

const FINE_PER_DAY = 5000;

export const startBorrowCron = () => {

  // chạy mỗi ngày lúc 00:00
  cron.schedule('0 0 * * *', async () => {
    console.log('[CRON] Running daily jobs...');
    const pool = getPool();

    try {
      // 1. BORROW → OVERDUE
      const overdueRes = await pool.query(
        `UPDATE borrows
         SET status = 'overdue'
         WHERE status = 'borrowing'
           AND due_date < CURRENT_DATE
           AND return_date IS NULL
         RETURNING id, user_id, book_copy_id, due_date`
      );

      if (overdueRes.rows.length > 0) {
        const notifs = await Promise.all(
          overdueRes.rows.map(async (b) => {
            const bookRes = await pool.query(
              `SELECT bk.title
               FROM book_copies bc
               JOIN books bk ON bk.id = bc.book_id
               WHERE bc.id = $1`,
              [b.book_copy_id]
            );

            return {
              user_id: b.user_id,
              type: 'overdue',
              title: 'Book Overdue!',
              message: `"${bookRes.rows[0]?.title || 'A book'}" is overdue since ${new Date(b.due_date).toLocaleDateString('vi-VN')}`,
            };
          })
        );

        await NotificationModel.createBulk(notifs);
        console.log(`[CRON] ${overdueRes.rows.length} borrow(s) marked overdue`);
      }

      // 2. UPDATE FINE
      await pool.query(
        `UPDATE borrows
         SET fine_amount = GREATEST(CURRENT_DATE - due_date, 0) * $1
         WHERE status = 'overdue'
           AND return_date IS NULL`,
        [FINE_PER_DAY]
      );


      // 3. REMIND BEFORE DUE

      const dueSoonRes = await pool.query(
        `SELECT b.id, b.user_id, b.book_copy_id, b.due_date
         FROM borrows b
         WHERE b.status = 'borrowing'
           AND b.due_date = CURRENT_DATE + INTERVAL '2 days'
           AND b.return_date IS NULL`
      );

      if (dueSoonRes.rows.length > 0) {
        const notifs = await Promise.all(
          dueSoonRes.rows.map(async (b) => {
            const bookRes = await pool.query(
              `SELECT bk.title
               FROM book_copies bc
               JOIN books bk ON bk.id = bc.book_id
               WHERE bc.id = $1`,
              [b.book_copy_id]
            );

            return {
              user_id: b.user_id,
              type: 'due_reminder',
              title: 'Due Reminder',
              message: `"${bookRes.rows[0]?.title}" is due on ${new Date(b.due_date).toLocaleDateString('vi-VN')}`,
            };
          })
        );

        await NotificationModel.createBulk(notifs);
        console.log(`[CRON] Sent ${notifs.length} due reminders`);
      }


      // 4. RESERVATION EXPIRE 

      const expiredRes = await ReservationModel.expireOverdueReady();

      if (expiredRes.length > 0) {

        // 4.1 notify người bị expire
        await NotificationModel.createBulk(
          expiredRes.map(r => ({
            user_id: r.user_id,
            type: 'general',
            title: 'Reservation Expired',
            message: 'Your reservation expired because you did not pick up the book in time.',
          }))
        );

        console.log(`[CRON] Expired ${expiredRes.length} reservations`);

        // 4.2 promote người tiếp theo
        const uniqueBooks = [...new Set(expiredRes.map(r => r.book_id))];

        for (const bookId of uniqueBooks) {
          try {
            const next = await ReservationModel.promoteNextPending(bookId);

            if (next) {
              await NotificationModel.create({
                user_id: next.user_id,
                type: 'general',
                title: 'Book Available',
                message: `"${next.book_title}" is now available for pickup (3 days).`,
              });

              console.log(`[CRON] Promoted next user ${next.user_id} for book ${bookId}`);
            }
          } catch (err) {
            console.error('[CRON] Promote error:', err.message);
          }
        }
      }

      console.log('[CRON] Done');
    } catch (err) {
      console.error('[CRON ERROR]:', err);
    }
  });
};