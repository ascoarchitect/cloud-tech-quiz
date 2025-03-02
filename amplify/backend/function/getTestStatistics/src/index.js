// src/functions/getTestStatistics/src/index.js
const AWS = require('aws-sdk');
const documentClient = new AWS.DynamoDB.DocumentClient();

/**
 * @typedef {Object} CategoryStat
 * @property {string} category - The category name
 * @property {number} averageScore - The average score for this category
 * @property {number} questionCount - The number of questions in this category
 */

/**
 * @typedef {Object} TestStatistics
 * @property {string} testId - The test ID
 * @property {number} totalParticipants - Total number of participants
 * @property {number} completedTests - Number of completed tests
 * @property {number} incompleteTests - Number of incomplete tests
 * @property {number} averageScore - Overall average score
 * @property {number} cheatingAttempts - Number of cheating attempts
 * @property {CategoryStat[]} categoryStats - Statistics by category
 */

/**
 * Get test statistics 
 * @param {Object} event - The event object
 * @param {Object} event.arguments - The arguments
 * @param {string} event.arguments.testId - The test ID
 * @returns {Promise<TestStatistics>} Test statistics
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { testId } = event.arguments;
  
  // Get the table names from environment variables
  const responseTableName = process.env.API_CLOUDSKILLSASSESSMENT_RESPONSETABLE_NAME;
  const testTableName = process.env.API_CLOUDSKILLSASSESSMENT_TESTTABLE_NAME;
  const questionTableName = process.env.API_CLOUDSKILLSASSESSMENT_QUESTIONTABLE_NAME;
  
  if (!responseTableName || !testTableName || !questionTableName) {
    throw new Error('Table names not found in environment variables.');
  }

  // Get test data to access question IDs
  const testResponse = await documentClient.get({
    TableName: testTableName,
    Key: { id: testId }
  }).promise();
  
  const test = testResponse.Item;
  if (!test) {
    throw new Error(`Test with ID ${testId} not found.`);
  }

  // Query responses for this test
  const responseParams = {
    TableName: responseTableName,
    IndexName: 'byTest',
    KeyConditionExpression: 'testId = :testId',
    ExpressionAttributeValues: {
      ':testId': testId
    }
  };

  const responseData = await documentClient.query(responseParams).promise();
  const responses = responseData.Items || [];

  // Calculate basic statistics
  const totalParticipants = responses.length;
  const completedTests = responses.filter(r => r.completed).length;
  const incompleteTests = totalParticipants - completedTests;
  
  // Calculate average score
  const scores = responses.filter(r => r.completed && r.score !== undefined).map(r => r.score);
  const averageScore = scores.length > 0 
    ? scores.reduce((sum, score) => sum + score, 0) / scores.length 
    : 0;
  
  // Count cheating attempts
  const cheatingAttempts = responses.reduce(
    (total, response) => total + (response.cheatingAttempts || 0), 
    0
  );

  // Calculate category statistics
  // First, get all required questions
  const questionIds = test.questions || [];
  const categoryScores = {};
  
  // Get all response answers to analyze performance by category
  for (const response of responses) {
    if (!response.completed || !response.answers) continue;
    
    for (const answer of response.answers) {
      // Get the question details to know its category
      try {
        const questionResponse = await documentClient.get({
          TableName: questionTableName,
          Key: { id: answer.questionId }
        }).promise();
        
        const question = questionResponse.Item;
        if (!question) continue;
        
        const category = question.category;
        
        if (!categoryScores[category]) {
          categoryScores[category] = { correct: 0, total: 0 };
        }
        
        categoryScores[category].total++;
        if (answer.correct) {
          categoryScores[category].correct++;
        }
      } catch (error) {
        console.error(`Error retrieving question ${answer.questionId}:`, error);
      }
    }
  }
  
  // Convert to required format
  const categoryStats = Object.entries(categoryScores).map(([category, stats]) => ({
    category,
    averageScore: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    questionCount: stats.total
  }));

  // Sort by average score (lowest first to identify weakest areas)
  categoryStats.sort((a, b) => a.averageScore - b.averageScore);

  return {
    testId,
    totalParticipants,
    completedTests,
    incompleteTests,
    averageScore,
    cheatingAttempts,
    categoryStats
  };
};