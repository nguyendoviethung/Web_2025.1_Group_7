import express, { json, urlencoded } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import cookieParser from 'cookie-parser';
import routes from './routes/index.js';
import errorHandler from './middlewares/errorHandler.js';

const app = express();

// ─── SECURITY MIDDLEWARE ────────────────────────────────
app.use(helmet()); // bảo mật HTTP headers

app.use(cors({
  origin:      process.env.CLIENT_URL || 'http://localhost:5173', // Vite dev port
  credentials: true, // cho phép gửi cookie
  methods:     ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── PARSE MIDDLEWARE ───────────────────────────────────
app.use(json());              // parse body JSON
app.use(urlencoded({ extended: true })); // parse form data
app.use(cookieParser());              // parse cookie

// ─── LOGGING ────────────────────────────────────────────
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev')); // log request ra console khi dev
}

// ─── HEALTH CHECK ───────────────────────────────────────
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status:  'OK',
    message: 'Server is running',
    time:    new Date().toISOString(),
  });
});

// ─── ROUTES ─────────────────────────────────────────────
app.use('/api', routes);

// ─── 404 HANDLER ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ─── GLOBAL ERROR HANDLER ───────────────────────────────
// Phải để cuối cùng, sau tất cả routes
app.use(errorHandler);

export default app;