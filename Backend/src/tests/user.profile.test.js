const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const jwt = require('jsonwebtoken');

describe('User Profile Tests', () => {
  let authToken;
  let testUserId;

  beforeAll(async () => {
    // Create a test user
    const testUser = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123'
    });
    await testUser.save();
    testUserId = testUser._id;

    // Generate auth token
    authToken = jwt.sign(
      { userId: testUserId },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  });

  afterAll(async () => {
    // Clean up test user
    await User.findByIdAndDelete(testUserId);
  });

  test('GET /api/user/profile - Success with valid token', async () => {
    console.log('Testing with token:', authToken);
    
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .set('Content-Type', 'application/json');

    console.log('Response:', {
      status: response.status,
      body: response.body,
      headers: response.headers
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('_id');
    expect(response.body).toHaveProperty('email', 'test@example.com');
  });

  test('GET /api/user/profile - Fail without token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Content-Type', 'application/json');

    console.log('Response without token:', {
      status: response.status,
      body: response.body
    });

    expect(response.status).toBe(401);
  });

  test('GET /api/user/profile - Fail with invalid token', async () => {
    const response = await request(app)
      .get('/api/user/profile')
      .set('Authorization', 'Bearer invalid_token')
      .set('Content-Type', 'application/json');

    console.log('Response with invalid token:', {
      status: response.status,
      body: response.body
    });

    expect(response.status).toBe(401);
  });
}); 