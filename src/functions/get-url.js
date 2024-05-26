const AWS = require('aws-sdk');
const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const queryParams = event.queryStringParameters;
  let params = {
    TableName: 'Urls',
  };

  if(queryParams) {
    params.FilterExpression = [];
    params.ExpressionAttributeValues = {};
    
    if(queryParams.originalUrl) {
      params.FilterExpression.push('contains(originalUrl, :originalUrl)');
      params.ExpressionAttributeValues[':originalUrl'] = queryParams.originalUrl;
    }

    if(queryParams.product) {
      params.FilterExpression.push('product = :product');
      params.ExpressionAttributeValues[':product'] = !isNaN(queryParams.product) ? parseInt(queryParams.product, 10) : queryParams.product;
    }

    if(queryParams.cpf) {
      params.FilterExpression.push('cpf = :cpf');
      params.ExpressionAttributeValues[':cpf'] = queryParams.cpf;
    }

    if(queryParams.contract) {
      params.FilterExpression.push('contract = :contract');
      params.ExpressionAttributeValues[':contract'] = queryParams.contract;
    }

    if(queryParams.shortUrl) {
      params.FilterExpression.push('shortUrl = :shortUrl');
      params.ExpressionAttributeValues[':shortUrl'] = queryParams.shortUrl;
    }

    params.FilterExpression = params.FilterExpression.join(' AND ');
  }

  try {
    const data = await dynamoDb.scan(params).promise();

    const urlAccessCounts = await Promise.all(data.Items.map(async (item) => {
      const accessLogParams = {
        TableName: 'AccessLog',
        KeyConditionExpression: 'shortUrl = :shortUrl',
        ExpressionAttributeValues: {
          ':shortUrl': item.shortUrl
        },
        Select: 'COUNT'
      };
      const accessLogData = await dynamoDb.query(accessLogParams).promise();
      return {
        ...item,
        accessCount: accessLogData.Count || 0
      };
    }));

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*", 
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET,OPTIONS"
      },            
      body: JSON.stringify(urlAccessCounts),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};