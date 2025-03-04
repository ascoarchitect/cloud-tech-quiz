// backend/functions/updateResponse/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Update an existing response
 */
exports.handler = async (event) => {
  try {
    // Get the response ID from path parameters
    const responseId = event.pathParameters.id;
    
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    
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
    
    // Build update expression and attribute values
    let updateExpression = 'SET updatedAt = :updatedAt';
    let expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    
    // Add fields to update
    if (requestBody.endTime !== undefined) {
      updateExpression += ', endTime = :endTime';
      expressionAttributeValues[':endTime'] = requestBody.endTime;
    }
    
    if (requestBody.answers !== undefined) {
      updateExpression += ', answers = :answers';
      expressionAttributeValues[':answers'] = requestBody.answers;
    }
    
    if (requestBody.score !== undefined) {
      updateExpression += ', score = :score';
      expressionAttributeValues[':score'] = requestBody.score;
    }
    
    if (requestBody.completed !== undefined) {
      updateExpression += ', completed = :completed';
      expressionAttributeValues[':completed'] = requestBody.completed;
    }
    
    if (requestBody.cheatingAttempts !== undefined) {
      updateExpression += ', cheatingAttempts = :cheatingAttempts';
      expressionAttributeValues[':cheatingAttempts'] = requestBody.cheatingAttempts;
    }
    
    if (requestBody.cheatingDetails !== undefined) {
      updateExpression += ', cheatingDetails = :cheatingDetails';
      expressionAttributeValues[':cheatingDetails'] = requestBody.cheatingDetails;
    }
    
    // Update the response
    const updateParams = {
      TableName: process.env.RESPONSE_TABLE,
      Key: { id: responseId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };
    
    const updateResult = await dynamoDB.update(updateParams).promise();
    
    // Return the updated response
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(updateResult.Attributes)
    };
  } catch (error) {
    console.error('Error updating response:', error);
    
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