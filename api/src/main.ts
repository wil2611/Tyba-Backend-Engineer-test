import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NextFunction, Request, Response } from 'express';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use((req: Request, res: Response, next: NextFunction) => {
    if (req.path === '/') {
      res.redirect('/docs');
      return;
    }
    next();
  });

  const config = new DocumentBuilder()
    .setTitle('Tyba API - Guia practica')
    .setDescription(
      'Aqui puedes crear cuenta, iniciar sesion y buscar restaurantes cercanos. Si quieres probar rapido, crea usuario en /auth/signup, copia el token y pegalo en Authorize para habilitar los endpoints protegidos.',
    )
    .setVersion('1.0.0')
    .addTag('Autenticacion', 'Crea tu cuenta, inicia sesion y cierra sesion')
    .addTag('Restaurantes', 'Busca restaurantes por ciudad o por coordenadas')
    .addTag('Historial', 'Consulta la actividad de tu usuario autenticado')
    .addServer('http://localhost:3000', 'Ambiente local')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description:
          'Pega aqui el token que recibes en login, sin comillas ni prefijos. Ejemplo: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document, {
    customSiteTitle: 'Tyba API - Documentacion',
    swaggerOptions: {
      persistAuthorization: true,
      displayRequestDuration: true,
      filter: true,
      tryItOutEnabled: true,
    },
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
