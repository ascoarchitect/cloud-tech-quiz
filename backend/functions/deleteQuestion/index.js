// backend/functions/deleteQuestion/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Delete a question
 */
exports.handler = async (event) => {
  try {
    // Get the question ID from path parameters
    const questionId = event.pathParameters.id;
    
    // Check if the question exists
    const getResult = await dynamoDB.get({
      TableName: process.env.QUESTION_TABLE,
      Key: { id: questionId }
    }).promise();
    
    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Question not found' })
      };
    }
    
    // Delete the question
    await dynamoDB.delete({
      TableName: process.env.QUESTION_TABLE,
      Key: { id: questionId }
    }).promise();
    
    // Return success
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ id: questionId })
    };
  } catch (error) {
    console.error('Error deleting question:', error);
    
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