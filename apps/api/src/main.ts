import 'reflect-metadata';
import { NestFactory, Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { TransformInterceptor } from './shared/interceptors/transform.interceptor';
import { globalValidationPipe } from './shared/pipes/validation.pipe';
import { JwtAuthGuard } from './shared/guards/jwt-auth.guard';
import { RolesGuard } from './shared/guards/roles.guard';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  const config = app.get(ConfigService);
  const reflector = app.get(Reflector);

  // Serve uploaded files (images, documents) as static assets
  app.useStaticAssets(join(process.cwd(), 'uploads'), { prefix: '/uploads' });

  // CORS
  const allowedOrigins = [
    config.get<string>('app.frontendPublicUrl') ?? '',
    config.get<string>('app.frontendAppUrl') ?? '',
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // Middleware
  app.use(cookieParser());

  // Global prefix
  app.setGlobalPrefix('v1');

  // Global guards (JWT is bypassed for @Public() routes)
  app.useGlobalGuards(new JwtAuthGuard(reflector), new RolesGuard(reflector));

  // Global pipe, filter, interceptor
  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new TransformInterceptor());

  // Swagger docs
  const swaggerConfig = new DocumentBuilder()
    .setTitle('MAKU Platform API')
    .setDescription('MAKU Digital Cooperative Platform — REST API')
    .setVersion('1.0')
    .addBearerAuth()
    .addCookieAuth('refreshToken')
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api/docs', app, document);

  const port = config.get<number>('app.port') ?? 3000;
  await app.listen(port);
  console.warn(`MAKU API running on port ${port}`);
  console.warn(`Swagger docs: http://localhost:${port}/api/docs`);
}

bootstrap();
