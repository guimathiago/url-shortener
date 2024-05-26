const { handler } = require('../functions/get-access-log');
const AWS = require('aws-sdk');

jest.mock('aws-sdk', () => {
  const mockDynamoDB = {
    scan: jest.fn().mockReturnThis(),
    promise: jest.fn()
  };

  return {
    DynamoDB: {
      DocumentClient: jest.fn(() => mockDynamoDB)
    }
  };
});
describe('get access log', () => {
  beforeEach(() => {
    AWS.DynamoDB.DocumentClient().scan().promise.mockReset();
  });

  it('should get access log', async () => {
    const mockAccessLogResponse = {
      Items: [
        {
          shortUrl: 'https://example.com/abcde',
          ip: '192.168.0.1',
          userAgent: 'Mozilla/5.0',
          dateTime: '2021-01-01T00:00:00Z'
        }
      ]
    };

    AWS.DynamoDB.DocumentClient().scan().promise.mockResolvedValue(mockAccessLogResponse);
    const event = {};
    const response = await handler(event);
    expect(response.statusCode).toEqual(200);
    expect(JSON.parse(response.body)).toEqual([
      {
        shortUrl: 'https://example.com/abcde',
        ip: '192.168.0.1',
        userAgent: 'Mozilla/5.0',
        dateTime: '2021-01-01T00:00:00Z'
      }
    ]);
  });

  it('should return 500 if error', async () => {
    AWS.DynamoDB.DocumentClient().scan().promise.mockRejectedValue({});
    const event = {};
    const response = await handler(event);
    expect(response.statusCode).toEqual(500);
  });
});