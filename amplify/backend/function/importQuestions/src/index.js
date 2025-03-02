// src/functions/importQuestions/src/index.js
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * @typedef {Object} Option
 * @property {string} id - The option ID
 * @property {string} text - The option text
 */

/**
 * @typedef {Object} QuestionInput
 * @property {string} text - The question text
 * @property {Option[]} options - The answer options
 * @property {string} correctAnswer - The ID of the correct option
 * @property {string} explanation - The explanation for the correct answer
 * @property {string} category - The question category
 * @property {string} difficulty - The difficulty level
 * @property {string[]} tags - Question tags
 */

/**
 * @typedef {Object} ImportResult
 * @property {boolean} success - Whether the import was successful
 * @property {number} importedCount - Number of questions imported
 * @property {string[]} errors - List of error messages
 */

/**
 * Import questions into the database
 * @param {Object} event - The event object
 * @param {Object} event.arguments - The arguments
 * @param {QuestionInput[]} event.arguments.questions - The questions to import
 * @returns {Promise<ImportResult>} Import result
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { questions } = event.arguments;
  const errors = [];
  let importedCount = 0;

  // Get the Question table name from environment variables
  const tableName = process.env.API_CLOUDSKILLSASSESSMENT_QUESTIONTABLE_NAME;
  
  if (!tableName) {
    return {
      success: false,
      importedCount: 0,
      errors: ['Question table name not found in environment variables.']
    };
  }

  // Process each question
  for (const question of questions) {
    try {
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

      await documentClient.put({
        TableName: tableName,
        Item: item
      }).promise();

      importedCount++;
    } catch (error) {
      console.error('Error importing question:', error);
      errors.push(`Failed to import question: ${question.text.substring(0, 50)}... Error: ${error.message}`);
    }
  }

  return {
    success: errors.length === 0,
    importedCount,
    errors
  };
};