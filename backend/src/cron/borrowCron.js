import cron from "node-cron";
import getPool from "../config/db.js";

const FINE_PER_DAY = 5000;

export const startBorrowCron = () => {
  cron.schedule("0 0 * * *", async () => { // Chạy vào lúc 00:00 hàng ngày
    console.log(" Running borrow cron...");

    try {
      const pool = getPool();

      await pool.query(`
        UPDATE borrows
        SET status = 'overdue'
        WHERE status = 'borrowing'
          AND due_date < CURRENT_DATE
          AND return_date IS NULL
      `);

      await pool.query(`
        UPDATE borrows
        SET fine_amount = GREATEST(CURRENT_DATE - due_date, 0) * $1
        WHERE status = 'overdue'
          AND return_date IS NULL
      `, [FINE_PER_DAY]);

      console.log(" Cron done");
    } catch (err) {
      console.error(" Cron error:", err);
    }
  });
};