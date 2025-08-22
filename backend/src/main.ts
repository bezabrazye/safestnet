import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import 'dotenv/config';
import helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({ origin: true });

  // Security headers
  app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        imgSrc: ["'self'", 'data:', 'https://api.qrserver.com'],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        connectSrc: ["'self'"],
        frameAncestors: ["'none'"],
      },
    } : false,
  }));

  // Увеличиваем лимит для body-parser до 10MB для поддержки больших изображений
  app.use(require('body-parser').json({ limit: '10mb' }));
  app.use(require('body-parser').urlencoded({ limit: '10mb', extended: true }));

  const port = process.env.PORT ? Number(process.env.PORT) : 8080;
  
  await app.listen(port);
  
  console.log(`🚀 SafeNet API listening on http://localhost:${port}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔑 OpenAI API: ${process.env.OPENAI_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🛡️ GSB API: ${process.env.GSB_API_KEY ? 'Configured' : 'Not configured'}`);
  console.log(`🔍 VirusTotal API: ${process.env.VIRUSTOTAL_API_KEY ? 'Configured' : 'Not configured'}`);
}

bootstrap();
