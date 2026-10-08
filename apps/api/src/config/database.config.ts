import { registerAs } from '@nestjs/config';

export const databaseConfig = registerAs('database', () => ({
  host: process.env['DB_HOST'] ?? 'localhost',
  port: parseInt(process.env['DB_PORT'] ?? '5432', 10),
  name: process.env['DB_NAME'] ?? 'maku_db',
  username: process.env['DB_USER'] ?? 'maku_user',
  password: process.env['DB_PASS'] ?? 'maku_pass',
  synchronize: process.env['NODE_ENV'] === 'development',
  logging: process.env['DB_LOGGING'] === 'true',
}));
