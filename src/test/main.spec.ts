import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';

describe('Main (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should start the application', async () => {
    const response = await request(app.getHttpServer()).get('/');
    expect(response.status).toBe(401); // Assuming no route is defined
  });

  afterAll(async () => {
    await app.close();
  });
});
