// backend/functions/updateQuestion/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Update an existing question
 */
exports.handler = async (event) => {
  try {
    // Get the question ID from path parameters
    const questionId = event.pathParameters.id;
    
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    
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
    
    // Build update expression and attribute values
    let updateExpression = 'SET updatedAt = :updatedAt';
    let expressionAttributeValues = {
      ':updatedAt': new Date().toISOString()
    };
    
    // Add fields to update
    if (requestBody.text !== undefined) {
      updateExpression += ', #text = :text';
      expressionAttributeValues[':text'] = requestBody.text;
    }
    
    if (requestBody.options !== undefined) {
      updateExpression += ', options = :options';
      expressionAttributeValues[':options'] = requestBody.options;
    }
    
    if (requestBody.correctAnswer !== undefined) {
      updateExpression += ', correctAnswer = :correctAnswer';
      expressionAttributeValues[':correctAnswer'] = requestBody.correctAnswer;
    }
    
    if (requestBody.explanation !== undefined) {
      updateExpression += ', explanation = :explanation';
      expressionAttributeValues[':explanation'] = requestBody.explanation;
    }
    
    if (requestBody.category !== undefined) {
      updateExpression += ', category = :category';
      expressionAttributeValues[':category'] = requestBody.category;
    }
    
    if (requestBody.difficulty !== undefined) {
      updateExpression += ', difficulty = :difficulty';
      expressionAttributeValues[':difficulty'] = requestBody.difficulty;
    }
    
    if (requestBody.tags !== undefined) {
      updateExpression += ', tags = :tags';
      expressionAttributeValues[':tags'] = requestBody.tags;
    }
    
    // Update the question
    const updateParams = {
      TableName: process.env.QUESTION_TABLE,
      Key: { id: questionId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: {
        '#text': 'text'  // 'text' is a reserved word in DynamoDB
      },
      ReturnValues: 'ALL_NEW'
    };
    
    const updateResult = await dynamoDB.update(updateParams).promise();
    
    // Return the updated question
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(updateResult.Attributes)
    };
  } catch (error) {
    console.error('Error updating question:', error);
    
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