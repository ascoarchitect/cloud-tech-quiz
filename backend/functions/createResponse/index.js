// backend/functions/createResponse/index.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Create a new response
 */
exports.handler = async (event) => {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    
    // Validate required fields
    if (!requestBody.testId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Test ID is required' })
      };
    }
    
    if (!requestBody.userId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'User ID is required' })
      };
    }
    
    if (!requestBody.userName) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'User name is required' })
      };
    }
    
    if (!requestBody.startTime) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Start time is required' })
      };
    }
    
    // Create the response item
    const response = {
      id: requestBody.id || uuidv4(),
      testId: requestBody.testId,
      userId: requestBody.userId,
      userName: requestBody.userName,
      startTime: requestBody.startTime,
      endTime: requestBody.endTime || null,
      answers: requestBody.answers || [],
      score: requestBody.score || null,
      completed: requestBody.completed !== undefined ? requestBody.completed : false,
      cheatingAttempts: requestBody.cheatingAttempts || 0,
      cheatingDetails: requestBody.cheatingDetails || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to DynamoDB
    await dynamoDB.put({
      TableName: process.env.RESPONSE_TABLE,
      Item: response
    }).promise();
    
    // Return the created response
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(response)
    };
  } catch (error) {
    console.error('Error creating response:', error);
    
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