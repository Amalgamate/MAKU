import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DataSource } from 'typeorm';
import { AppModule } from '../app.module';

async function initializeSchema() {
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error', 'warn'],
  });
  try {
    await app.get(DataSource).synchronize();
  } finally {
    await app.close();
  }
}

initializeSchema().catch((error: unknown) => {
  console.error('Failed to initialize MAKU database schema', error);
  process.exitCode = 1;
});
