// backend/functions/getQuestion/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get a question by ID
 */
exports.handler = async (event) => {
  try {
    // Get the question ID from path parameters
    const questionId = event.pathParameters.id;

    // Query DynamoDB
    const params = {
      TableName: process.env.QUESTION_TABLE,
      Key: {
        id: questionId
      }
    };

    const result = await dynamoDB.get(params).promise();
    
    // Check if the question exists
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Question not found' })
      };
    }

    // Return the question
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result.Item)
    };
  } catch (error) {
    console.error('Error getting question:', error);
    
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