const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const dynamoDb = new AWS.DynamoDB.DocumentClient();

exports.handler = async (event) => {
  const { url, product, service, cpf, contract, phone, shortener_name } = JSON.parse(event.body);
  
  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'URL is required' }),
    };
  }

  if(!product) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Product is required' }),
    };
  }

  if(!shortener_name) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Shortener name is required' }),
    };
  }

  const scanParams = {
    TableName: 'Urls',
    FilterExpression: 'originalUrl = :url',
    ExpressionAttributeValues: {
      ':url': url,
    },
  };
  try {
    const result = await dynamoDb.scan(scanParams).promise();

    if (result.Items && result.Items.length > 0) {
      const existingItem = result.Items[0];
      return {
        statusCode: 200,
        body: JSON.stringify({ shortUrl: existingItem.shortUrl, originalUrl: url, shortener: existingItem.shortener }),
      };
    }
    
    const shortener = uuidv4().slice(0, 5);

    const shortUrl = `https://${shortener_name}/${shortener}` 

    const item = {
      shortUrl: shortUrl,
      originalUrl: url,
      product: product,
      shortener: shortener
    };

    if (service) item.service = service;
    if (cpf) item.cpf = cpf;
    if (contract) item.contract = contract;
    if (phone) item.phone = phone;

    const putParams = {
      TableName: 'Urls',
      Item: item,
    };
  
    await dynamoDb.put(putParams).promise();

    return {
      statusCode: 200,
      body: JSON.stringify({ shortUrl: shortUrl, originalUrl: url, shortener: shortener }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message }),
    };
  }
};