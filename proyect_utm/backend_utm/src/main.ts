import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors();
  app.useGlobalPipes(new ValidationPipe());
  app.use((req, res, next) => {
    if (req.method === 'PATCH' && req.url.includes('/events/')) {
        const fs = require('fs');
        fs.appendFileSync('req.log', '\n\n--- INCOMING PATCH TO EVENT ---\n' + JSON.stringify(req.body, null, 2) + '\n-------------------------------\n\n');
    }
    next();
  });
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
