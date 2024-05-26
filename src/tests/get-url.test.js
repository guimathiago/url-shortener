const { handler } = require('../functions/get-url');
const AWS = require('aws-sdk');

jest.mock('aws-sdk', () => {
  const mockDynamoDB = {
    scan: jest.fn().mockReturnThis(),
    query: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };

  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDynamoDB)
    }
  };
});

describe('get url', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient().scan().promise.mockReset();
    AWS.DynamoDB.DocumentClient().query().promise.mockReset();
  });

  it('should get url', async () => {
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
        
    const response = await handler({});
    
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual([
      {
        originalUrl: 'https://www.teste.com/teste/url',
        product: 'example',
        cpf: '12345678901',
        contract: '12345678901',
        shortener: 'abcde',
        shortUrl: 'https://example.com/abcde',
        accessCount: 0
      }
    ]);
  });

  it('should return 500 if there is an error', async () => {
    const event = {
      queryStringParameters: {
        originalUrl: 'https://www.example.com',
        product: 'example',
        cpf: '12345678901',
        contract: '12345678901',
        shortUrl: 'https://example.com/abcde'
      },
    };

    AWS.DynamoDB.DocumentClient.mockImplementationOnce(() => {
      throw new Error();
    });

    const response = await handler(event);

    expect(response.statusCode).toEqual(500);
    expect(JSON.parse(response.body)).toHaveProperty('message');
  });
});