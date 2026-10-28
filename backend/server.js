import 'dotenv/config';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { connectDb } from './src/core.js';
import { authRouter } from './src/auth.js';
import { initRealtime } from './src/realtime.js';
import { seedAndIndex } from './src/seed.js';
import courses from './src/routes/courses.js';
import enrolments from './src/routes/enrolments.js';
import coursework from './src/routes/coursework.js';
import { initStorage } from './src/storage.js';
import classroom from './src/routes/classroom.js';
import community from './src/routes/community.js';

const app = express();

app.use(cors({ origin: (process.env.CORS_ORIGINS || '*').split(','), allowedHeaders: ['Authorization', 'Content-Type', 'Accept'] }));
app.use(express.json({ limit: '2mb' }));
app.use('/api', authRouter, courses, enrolments, coursework, classroom, community);

app.use('/api', (_req, res) => res.status(404).json({ success: false, message: 'Not found' }));

app.use((err, _req, res, _next) => {
  const status = err.status || (err.type === 'entity.parse.failed' || err.name === 'MulterError' ? 400 : 500);
  if (status >= 500) console.error(err);
  res.status(status).json({ success: false, message: status >= 500 ? 'Internal server error' : err.message, ...(err.code ? { code: err.code } : {}) });
});

const server = http.createServer(app);
initRealtime(server);

await connectDb();
await seedAndIndex();
initStorage().then(() => console.log('Storage initialized')).catch((e) => console.error(e.message));
server.listen(Number(process.env.PORT), '0.0.0.0', () => console.log(`LearnFlow API listening on ${process.env.PORT}`));
