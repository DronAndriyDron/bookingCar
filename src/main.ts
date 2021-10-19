import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const port = process.env.PORT;
  app.useGlobalPipes(new ValidationPipe())
  app.setGlobalPrefix('api');
  await app.listen(port);
  console.log(`server running in port ${port}`)
  
}
bootstrap();
