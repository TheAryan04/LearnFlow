import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { connectDb } from './src/config/database.js';
import { initRealtime } from './src/realtime.js';
import { seedAndIndex } from './src/seed.js';
import { initStorage } from './src/storage.js';

const port = Number(process.env.PORT || 8000);
const server = http.createServer(app);

initRealtime(server);

await connectDb();
await seedAndIndex();

initStorage()
  .then(() => console.log('Storage initialized'))
  .catch((error) => console.error('Storage initialization failed:', error.message));

server.listen(port, '0.0.0.0', () => {
  console.log(`LearnFlow API listening on ${port}`);
});
