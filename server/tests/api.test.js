const request = require('supertest');
const app = require('../src/app');
const prisma = require('../src/config/prisma');

jest.setTimeout(25000);

afterAll(async () => {
  await prisma.$disconnect();
});

describe('API Health & System Tests', () => {
  it('GET /api/health should return 200 with service status', async () => {
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.status).toBeDefined();
    expect(res.body.services).toBeDefined();
  });

  it('GET /api/nonexistent-route should return 404', async () => {
    const res = await request(app).get('/api/nonexistent-route');
    expect(res.status).toBe(404);
    expect(res.body.success).toBe(false);
    expect(res.body.error).toContain('not found');
  });
});

describe('TTS & Voice Synthesis Tests', () => {
  it('GET /api/tts/voices should return catalog of natural voices', async () => {
    const res = await request(app).get('/api/tts/voices');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('GET /api/tts/download should stream audio successfully', async () => {
    const res = await request(app)
      .get('/api/tts/download?text=Hello%20World&language=en-US');
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('audio');
  });

  it('POST /api/tts/download should accept JSON payload and stream audio', async () => {
    const res = await request(app)
      .post('/api/tts/download')
      .send({ text: 'Testing audio download stream', language: 'en-US' });
    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('audio');
  });

  it('POST /api/tts without text should return 400 bad request', async () => {
    const res = await request(app)
      .post('/api/tts')
      .send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('POST /api/tts with prohibited words should be blocked by content filter', async () => {
    const res = await request(app)
      .post('/api/tts')
      .send({ text: 'fuck this test', language: 'en-US' });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Content Policy Violation');
  });
});

describe('Document Upload API Tests', () => {
  it('POST /api/documents/upload without file should return 400', async () => {
    const res = await request(app).post('/api/documents/upload');
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
