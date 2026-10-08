import { registerAs } from '@nestjs/config';

export const appConfig = registerAs('app', () => ({
  nodeEnv: process.env['NODE_ENV'] ?? 'development',
  port: parseInt(process.env['PORT'] ?? '3000', 10),
  frontendPublicUrl: process.env['FRONTEND_PUBLIC_URL'] ?? 'http://localhost:5173',
  frontendAppUrl: process.env['FRONTEND_APP_URL'] ?? 'http://localhost:5174',
  apiBaseUrl: process.env['API_BASE_URL'] ?? 'http://localhost:3000',
}));
