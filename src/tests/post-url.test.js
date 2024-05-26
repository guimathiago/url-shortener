const { handler } = require('../functions/post-url');
const AWS = require('aws-sdk');

jest.mock('aws-sdk', () => {
  const mockQuery = jest.fn().mockReturnValue({
    promise: jest.fn().mockResolvedValue({
      Items: []
    })
  });

  const mockDocumentClient = {
    scan: mockQuery,
    put: jest.fn().mockReturnThis(),
    promise: jest.fn(),
  };

  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDocumentClient)
    }
  };
});

describe('create short url', () => {
  it('should create a short url', async () => {
    const event = {
      body: JSON.stringify({
        url: 'https://www.example.com',
        product: 'example',
        shortener_name: 'example.com',
      }),
    };
    
    const response = await handler(event);

    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toHaveProperty('shortUrl');
    expect(JSON.parse(response.body)).toHaveProperty('originalUrl');
  });
  
  it('should return 400 if url is not provided', async () => {
    const event = {
    body: JSON.stringify({
      product: 'example',
      shortener_name: 'example.com',
    }),
    };

    const response = await handler(event);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'URL is required');
  });
  
  it('should return 400 if product is not provided', async () => {
    const event = {
    body: JSON.stringify({
      url: 'https://www.example.com',
      shortener_name: 'example.com',
    }),
    };

    const response = await handler(event);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'Product is required');
  });
  
  it('should return 400 if shortener name is not provided', async () => {
    const event = {
    body: JSON.stringify({
      url: 'https://www.example.com',
      product: 'example',
    }),
    };

    const response = await handler(event);

    expect(response.statusCode).toEqual(400);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'Shortener name is required');
  });
  
  it('should return 500 if DynamoDB query fails', async () => {
    AWS.DynamoDB.DocumentClient().scan().promise.mockRejectedValue(new Error('DynamoDB error'));
    
    const event = {
      body: JSON.stringify({
        url: 'https://www.example.com',
        product: 'example',
        shortener_name: 'example.com',
      }),
    };
  
    const response = await handler(event);

    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'DynamoDB error');
  });
});