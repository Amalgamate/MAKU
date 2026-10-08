import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { join } from 'path';

// This file is used by TypeORM CLI for migrations only.
// Env vars must be set in the shell before running migration commands.
// e.g. DB_HOST=localhost DB_USER=maku_user ... pnpm migration:run

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  database: process.env['DB_NAME'] ?? 'maku_db',
  username: process.env['DB_USER'] ?? 'maku_user',
  password: process.env['DB_PASS'] ?? 'maku_pass',
  entities: [join(__dirname, '..', 'modules', '**', '*.entity.{ts,js}')],
  migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
  synchronize: false,
  logging: process.env['DB_LOGGING'] === 'true',
});
