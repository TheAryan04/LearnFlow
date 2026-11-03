import express from 'express';
import cors from 'cors';
import { authRouter } from './auth.js';
import courses from './routes/courses.js';
import enrolments from './routes/enrolments.js';
import coursework from './routes/coursework.js';
import classroom from './routes/classroom.js';
import community from './routes/community.js';

const app = express();
const allowedOrigins = process.env.CORS_ORIGINS
  ? process.env.CORS_ORIGINS.split(',').map((origin) => origin.trim()).filter(Boolean)
  : '*';

app.disable('x-powered-by');
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

app.use(cors({
  origin: allowedOrigins,
  allowedHeaders: ['Authorization', 'Content-Type', 'Accept'],
}));
app.use(express.json({ limit: '2mb' }));

app.use('/api', authRouter, courses, enrolments, coursework, classroom, community);

app.use('/api', (_req, res) =>
  res.status(404).json({ success: false, message: 'Not found' })
);

app.use((err, _req, res, _next) => {
  const status = err.status || (
    err.type === 'entity.parse.failed' ? 400 : err.type === 'entity.too.large' || (err.name === 'MulterError' && err.code === 'LIMIT_FILE_SIZE') ? 413 : err.name === 'MulterError' ? 400 : 500
  );
  if (status >= 500) console.error(err);
  res.status(status).json({
    success: false,
    message: status >= 500 ? 'Internal server error' : err.message,
    ...(err.code ? { code: err.code } : {}),
  });
});

export default app;
