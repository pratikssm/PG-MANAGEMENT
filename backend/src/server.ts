import app from './app';
import { env } from './config/env';
import { connectDB } from './config/db';

async function start() {
  await connectDB();

  const server = app.listen(env.port, () => {
    console.log(`\n🚀 StayNest API Server running on port ${env.port}`);
    console.log(`📍 Environment: ${env.nodeEnv}`);
    console.log(`🌐 Client URL: ${env.clientUrl}`);
    console.log(`📡 API Base: http://localhost:${env.port}/api\n`);
  });

  process.on('unhandledRejection', (err: any) => {
    console.error('Unhandled Rejection:', err);
    server.close(() => process.exit(1));
  });

  process.on('SIGTERM', () => {
    console.log('SIGTERM received. Shutting down gracefully...');
    server.close(() => console.log('Process terminated.'));
  });
}

start();
