// backend/functions/getTest/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get a test by ID
 */
exports.handler = async (event) => {
  try {
    // Get the test ID from path parameters
    const testId = event.pathParameters.id;

    // Query DynamoDB
    const params = {
      TableName: process.env.TEST_TABLE,
      Key: {
        id: testId
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    // Check if the test exists
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Test not found' })
      };
    }

    // Return the test
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error('Error getting test:', error);
    
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