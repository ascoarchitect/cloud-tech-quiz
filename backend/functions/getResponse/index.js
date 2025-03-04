// backend/functions/getResponse/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get a response by ID
 */
exports.handler = async (event) => {
  try {
    // Get the response ID from path parameters
    const responseId = event.pathParameters.id;

    // Query DynamoDB
    const params = {
      TableName: process.env.RESPONSE_TABLE,
      Key: {
        id: responseId
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    // Check if the response exists
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Response not found' })
      };
    }

    // Return the response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error('Error getting response:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};