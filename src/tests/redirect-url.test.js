const { handler } = require('../functions/redirect-url');
const AWS = require('aws-sdk');
const { getGeolocationByIP } = require('../Utils/getGeolocationByIP');

jest.mock('aws-sdk', () => {
  const mockDynamoDB = {
    scan: jest.fn().mockReturnThis(),
    put: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };

  return {
    DynamoDB: {
        DocumentClient: jest.fn(() => mockDynamoDB)
    }
  };
});

describe('redirect url', () => {
  beforeEach(() => {
      AWS.DynamoDB.DocumentClient().scan().promise.mockReset();
      AWS.DynamoDB.DocumentClient().put().promise.mockReset();
  });

  it('should redirect to original url', async () => {
    const mockUrlsResponse = {
      Items: [
        {
          originalUrl: 'https://www.teste.com/teste/url',
          product: 'example',
          cpf: '12345678901',
          contract: '12345678901',
          shortener: 'abcde',
          shortUrl: 'https://example.com/abcde'
        }
      ]
    };

    AWS.DynamoDB.DocumentClient().scan().promise.mockResolvedValue(mockUrlsResponse);

    const event = {
      pathParameters: {
        shortUrl: 'abcde'
      },
      headers: {
        'X-Forwarded-For': '123.123.123.123',
        'User-Agent': 'Mozilla/5.0'
      },
      requestContext: {
        identity: {
          sourceIp: '123.123.123.123'
        }
      }
    };

    jest.mock('../Utils/getGeolocationByIP', () => {
      return null;
    });
    
    const response = await handler(event);
    
    expect(response.statusCode).toEqual(301);
    expect(response.headers.Location).toEqual('https://www.teste.com/teste/url');
  });

  it('should return 404 if shortener is not found', async () => {
    const mockUrlsResponse = {
        Items: []
    };

    AWS.DynamoDB.DocumentClient().scan().promise.mockResolvedValue(mockUrlsResponse);

    const event = {
      pathParameters: {
        shortUrl: 'abcde'
      },
      headers: {
        'X-Forwarded-For': '123.123.123.123',
        'User-Agent': 'Mozilla/5.0'
      },
      requestContext: {
        identity: {
            sourceIp: '123.123.123.123'
        }
      }
    };
    
    const response = await handler(event);
    
    expect(response.statusCode).toEqual(404);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'URL not found');
  });

  it('should return 500 if there is an error', async () => {
    AWS.DynamoDB.DocumentClient().scan().promise.mockRejectedValue(new Error('DynamoDB error'));

    const event = {
      pathParameters: {
        shortUrl: 'abcde'
      },
      headers: {
        'X-Forwarded-For': '123.123.123.123',
        'User-Agent': 'Mozilla/5.0'
      },
      requestContext: {
        identity: {
          sourceIp: '123.123.123.123'
        }
      }
    };
    
    const response = await handler(event);
    
    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'DynamoDB error');
  });
});