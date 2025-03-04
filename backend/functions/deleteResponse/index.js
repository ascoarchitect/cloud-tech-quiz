// backend/functions/deleteResponse/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Delete a response
 */
exports.handler = async (event) => {
  try {
    // Get the response ID from path parameters
    const responseId = event.pathParameters.id;
    
    // Check if the response exists
    const getResult = await dynamoDB.get({
      TableName: process.env.RESPONSE_TABLE,
      Key: { id: responseId }
    }).promise();
    
    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Response not found' })
      };
    }
    
    // Delete the response
    await dynamoDB.delete({
      TableName: process.env.RESPONSE_TABLE,
      Key: { id: responseId }
    }).promise();
    
    // Return success
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ id: responseId })
    };
  } catch (error) {
    console.error('Error deleting response:', error);
    
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