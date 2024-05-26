const AWS = require('aws-sdk');
const { getGeolocationByIP } = require('../Utils/getGeolocationByIP');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { shortUrl } = event.pathParameters;
  const ips = event.headers['X-Forwarded-For'];
  const ip = ips ? ips.split(',')[0].trim() : event.requestContext.identity.sourceIp;
  const device = event.headers['User-Agent'];
  const geolocation = await getGeolocationByIP(ip);
  
  const params = {
    TableName: 'Urls',
    FilterExpression: 'shortener = :shortener',
    ExpressionAttributeValues: {
      ':shortener': shortUrl,
    },
  };

  try {
    const result = await dynamoDb.scan(params).promise();

    if (result.Items.length === 0) {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: 'URL not found' }),
      };
    }
    
    const originalUrl = result.Items[0].originalUrl;

    const accessParams = {
      TableName: 'AccessLog',
      Item: {
        shortUrl: result.Items[0].shortUrl,
        dateTime: new Date().toISOString(),
        ip: ip,
        device: device,
        geolocation: geolocation
      },
    };

    await dynamoDb.put(accessParams).promise();

    return {
      statusCode: 301,
      headers: {
        Location: originalUrl,
      },
      body: null,
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};