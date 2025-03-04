// backend/functions/createQuestion/index.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Create a new question
 */
exports.handler = async (event) => {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    
    // Validate required fields
    if (!requestBody.text) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Question text is required' })
      };
    }
    
    if (!requestBody.options || !Array.isArray(requestBody.options) || requestBody.options.length < 2) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'At least two options are required' })
      };
    }
    
    if (!requestBody.correctAnswer) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Correct answer is required' })
      };
    }
    
    if (!requestBody.explanation) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Explanation is required' })
      };
    }
    
    if (!requestBody.category) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Category is required' })
      };
    }
    
    if (!requestBody.difficulty) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: 'Difficulty is required' })
      };
    }
    
    // Create the question item
    const question = {
      id: uuidv4(),
      text: requestBody.text,
      options: requestBody.options,
      correctAnswer: requestBody.correctAnswer,
      explanation: requestBody.explanation,
      category: requestBody.category,
      difficulty: requestBody.difficulty,
      tags: requestBody.tags || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    // Save to DynamoDB
    await dynamoDB.put({
      TableName: process.env.QUESTION_TABLE,
      Item: question
    }).promise();
    
    // Return the created question
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(question)
    };
  } catch (error) {
    console.error('Error creating question:', error);
    
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