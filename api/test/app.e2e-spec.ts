import { INestApplication, ValidationPipe } from '@nestjs/common';
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

type LoginResponse = {
  user: { email: string };
  accessToken: string;
};

type RestaurantsResponse = {
  search: {
    city: string | null;
    lat: number;
    lng: number;
  };
  data: Array<{
    name: string;
    address?: string | null;
    lat: number;
    lng: number;
  }>;
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
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    await app.init();
  });
  // cerramos la app despues de las pruebas
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
  it('signup con email invalido responde 400', async () => {
    await request(getHttpServer())
      .post('/auth/signup')
      .send({ email: 'correo-invalido', fullName, password })
      .expect(400);
  });

  it('signup con password corta responde 400', async () => {
    await request(getHttpServer())
      .post('/auth/signup')
      .send({
        email: `short.${Date.now()}@mail.com`,
        fullName,
        password: '1234',
      })
      .expect(400);
  });

  it('login exitoso devuelve token y usuario', async () => {
    const res = await request(getHttpServer())
      .post('/auth/login')
      .send({ email, password });

    expect([200, 201]).toContain(res.status);
    const body = res.body as LoginResponse;

    expect(body.accessToken).toBeDefined();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(email.toLowerCase());

    token = body.accessToken;
  });

  it('login con email invalido responde 400', async () => {
    await request(getHttpServer())
      .post('/auth/login')
      .send({ email: 'correo-invalido', password })
      .expect(400);
  });

  it('login con password corta responde 400', async () => {
    await request(getHttpServer())
      .post('/auth/login')
      .send({ email, password: '1234' })
      .expect(400);
  });

  it('login invalido responde 401', async () => {
    await request(getHttpServer())
      .post('/auth/login')
      .send({ email, password: 'clave-mala-123' })
      .expect(401);
  });

  it('restaurants sin city ni lat/lng responde 400 (con token)', async () => {
    await request(getHttpServer())
      .get('/restaurants/nearby')
      .set('Authorization', `Bearer ${token}`)
      .expect(400);
  });

  it('restaurants sin token responde 401', async () => {
    await request(getHttpServer())
      .get('/restaurants/nearby?city=Bogota')
      .expect(401);
  });

  it('user-actions/me sin token responde 401', async () => {
    await request(getHttpServer()).get('/user-actions/me').expect(401);
  });

  it('logout sin token responde 401', async () => {
    await request(getHttpServer()).post('/auth/logout').expect(401);
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

  it('restaurants con ciudad responde 200', async () => {
    const res = await request(getHttpServer())
      .get('/restaurants/nearby?city=Bogota')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
    const body = res.body as RestaurantsResponse;
    expect(body).toHaveProperty('search');
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);

    expect(body.search.city).toBe('Bogota');
    expect(typeof body.search.lat).toBe('number');
    expect(typeof body.search.lng).toBe('number');

    if (body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('name');
      expect(body.data[0]).toHaveProperty('lat');
      expect(body.data[0]).toHaveProperty('lng');
    }
  }, 20000);

  it('restaurants con coordenadas responde 200', async () => {
    const res = await request(getHttpServer())
      .get('/restaurants/nearby?lat=4.7110&lng=-74.0721')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = res.body as RestaurantsResponse;
    expect(body).toHaveProperty('search');
    expect(body).toHaveProperty('data');
    expect(Array.isArray(body.data)).toBe(true);

    expect(body.search.city).toBeNull();
    expect(typeof body.search.lat).toBe('number');
    expect(typeof body.search.lng).toBe('number');

    if (body.data.length > 0) {
      expect(body.data[0]).toHaveProperty('name');
      expect(body.data[0]).toHaveProperty('address');
    }
  }, 20000);

  it('logout con token responde ok y queda registrado en historial', async () => {
    const logoutRes = await request(getHttpServer())
      .post('/auth/logout')
      .set('Authorization', `Bearer ${token}`);

    expect([200, 201]).toContain(logoutRes.status);

    const actionsRes = await request(getHttpServer())
      .get('/user-actions/me')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    const body = actionsRes.body as UserActionsResponse;
    expect(body.data.some((action) => action.action === 'LOGOUT')).toBe(true);
  });
});
