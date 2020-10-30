import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as hive from '@hiveio/hive-js';
import { AppModule } from './app.module';

declare const module: any;

hive.config.set('rebranded_api', true)
hive.broadcast.updateOperations()

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  if (module.hot) {
    module.hot.accept();
    module.hot.dispose(() => app.close());
  }

  const options = new DocumentBuilder()
    .setTitle('PeakD Node Beacon')
    .setDescription('A node monitor for the Hive blockchain')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, options);
  SwaggerModule.setup('api', app, document);

  // security
  app.use(helmet());
  app.enableCors();
  app.use(
    rateLimit({
      windowMs: 15 * 60 * 1000, // 10 minutes
      max: 100, // limit each IP to 100 requests per windowMs
    }),
  );
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
