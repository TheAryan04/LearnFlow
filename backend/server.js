import 'dotenv/config';
import http from 'http';
import app from './src/app.js';
import { connectDb, client } from './src/config/database.js';
import { initRealtime, closeRealtime } from './src/realtime.js';
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

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;
  console.log(`Received ${signal}; shutting down LearnFlow API`);

  const forceExit = setTimeout(() => {
    console.error('Graceful shutdown timed out; forcing exit');
    process.exit(1);
  }, 10_000);
  forceExit.unref();

  try {
    await closeRealtime();
    await client.close();
    clearTimeout(forceExit);
    process.exit(0);
  } catch (error) {
    console.error('Error during shutdown:', error);
    process.exit(1);
  }
}

process.on('SIGTERM', () => void shutdown('SIGTERM'));
process.on('SIGINT', () => void shutdown('SIGINT'));
