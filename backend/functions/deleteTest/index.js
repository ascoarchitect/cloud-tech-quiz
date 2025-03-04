// backend/functions/deleteTest/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Delete a test
 */
exports.handler = async (event) => {
  try {
    // Get the test ID from path parameters
    const testId = event.pathParameters.id;
    
    // Check if the test exists
    const getResult = await dynamoDB.get({
      TableName: process.env.TEST_TABLE,
      Key: { id: testId }
    }).promise();
    
    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Test not found' })
      };
    }
    
    // Delete the test
    await dynamoDB.delete({
      TableName: process.env.TEST_TABLE,
      Key: { id: testId }
    }).promise();
    
    // Return success
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ id: testId })
    };
  } catch (error) {
    console.error('Error deleting test:', error);
    
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