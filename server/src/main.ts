import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS for local UI (Vite) and allow the `x-user` header used by the demo UI
  app.enableCors({
    // reflect request origin (useful for local/dev where UI may be on localhost or 127.0.0.1)
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-user'],
    credentials: true,
  });
  await app.listen(3001);
}
bootstrap();
