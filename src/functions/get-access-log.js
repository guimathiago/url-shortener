const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const queryParams = event.queryStringParameters;

  const params = {
      TableName: 'AccessLog',
  };

  if(queryParams) {
    params.FilterExpression = [];
    params.ExpressionAttributeValues = {};
    
    if(queryParams.shortUrl) {
      params.FilterExpression.push('shortUrl = :shortUrl');
      params.ExpressionAttributeValues[':shortUrl'] = queryParams.shortUrl;
    }

    if(queryParams.ip) {
      params.FilterExpression.push('ip = :ip');
      params.ExpressionAttributeValues[':ip'] = queryParams.ip;
    }

    if(queryParams.device) {
      params.FilterExpression.push('device = :device');
      params.ExpressionAttributeValues[':device'] = queryParams.device;
    }

    if(queryParams.dateTime) {
      params.FilterExpression.push('dateTime = :dateTime');
      params.ExpressionAttributeValues[':dateTime'] = queryParams.dateTime;
    }
  
    params.FilterExpression = params.FilterExpression.join(' AND ');
  }
  
  try {
    const data = await dynamoDb.scan(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },            
      body: JSON.stringify(data.Items),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};