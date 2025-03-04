// backend/functions/importQuestions/index.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Import questions
 */
exports.handler = async (event) => {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const questions = requestBody.questions;
    
    if (!questions || !Array.isArray(questions)) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          success: false,
          importedCount: 0,
          errors: ['Invalid input: questions should be an array']
        })
      };
    }
    
    const errors = [];
    let importedCount = 0;
    
    // Process each question
    for (const question of questions) {
      try {
        // Create the question item
        const item = {
          id: uuidv4(),
          text: question.text,
          options: question.options,
          correctAnswer: question.correctAnswer,
          explanation: question.explanation,
          category: question.category,
          difficulty: question.difficulty,
          tags: question.tags || [],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        
        // Save to DynamoDB
        await dynamoDB.put({
          TableName: process.env.QUESTION_TABLE,
          Item: item
        }).promise();
        
        importedCount++;
      } catch (error) {
        console.error('Error importing question:', error);
        errors.push(`Failed to import question: ${question.text.substring(0, 50)}... Error: ${error.message}`);
      }
    }
    
    // Return import result
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: errors.length === 0,
        importedCount,
        errors
      })
    };
  } catch (error) {
    console.error('Error importing questions:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        success: false,
        importedCount: 0,
        errors: ['Internal server error']
      })
    };
  }
};