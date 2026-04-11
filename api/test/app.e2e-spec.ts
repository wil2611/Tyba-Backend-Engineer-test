import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import request from 'supertest';
import { AppModule } from '../src/app.module';

type SignupResponse = {
  user: {
    email: string;
  };
  accessToken: string;
};

type UserActionsResponse = {
  data: Array<{ action: string }>;
  meta: unknown;
};
// pruebas para el flujo principal de la API
describe('Flujo principal API (e2e)', () => {
  let app: INestApplication;
  let token = '';
  const getHttpServer = (): Parameters<typeof request>[0] =>
    app.getHttpServer() as Parameters<typeof request>[0];
  const email = `qa.${Date.now()}@mail.com`;
  const password = 'ClaveSegura123';
  const fullName = 'Tester Junior';
//inicializamos la app antes de las pruebas y la cerramos al final
  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });
// cerramos la app después de las pruebas
  afterAll(async () => {
    await app.close();
  });

  it('signup crea usuario y devuelve token', async () => {
    const res = await request(getHttpServer())
      .post('/auth/signup')
      .send({ email, fullName, password })
      .expect(201);
    const body = res.body as SignupResponse;

    expect(body.user.email).toBe(email.toLowerCase());
    expect(body.accessToken).toBeDefined();
    token = body.accessToken;
  });
 
  it('signup duplicado responde 400', async () => {
    await request(getHttpServer())
      .post('/auth/signup')
      .send({ email, fullName, password })
      .expect(400);
  });

  it('login invalido responde 401', async () => {
    await request(getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'clave-mala-123' })
      .expect(401);
  });

  it('logout sin token responde 401', async () => {
    await request(getHttpServer()).post('/auth/logout').expect(401);
  });

  it('restaurants sin city ni lat/lng responde 400 (con token)', async () => {
    await request(getHttpServer())
      .get('/restaurants/nearby')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('user-actions/me devuelve historial del usuario autenticado', async () => {
    const res = await request(getHttpServer())
      .get('/user-actions/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const body = res.body as UserActionsResponse;

    expect(Array.isArray(body.data)).toBe(true);
    expect(body.meta).toBeDefined();
    expect(body.data.some((action) => action.action === 'SIGNUP')).toBe(true);
  });
});
