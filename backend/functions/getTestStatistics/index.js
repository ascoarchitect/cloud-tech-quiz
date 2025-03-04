// backend/functions/getTestStatistics/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * Get test statistics 
 */
exports.handler = async (event) => {
  try {
    // Get the test ID from path parameters
    const testId = event.pathParameters.testId;
    
    // Get test data to access question IDs
    const testResponse = await dynamoDB.get({
      TableName: process.env.TEST_TABLE,
      Key: { id: testId }
    }).promise();
    
    const test = testResponse.Item;
    if (!test) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({ message: `Test with ID ${testId} not found.` })
      };
    }

    // Query responses for this test
    const responseParams = {
      TableName: process.env.RESPONSE_TABLE,
      IndexName: 'byTest',
      KeyConditionExpression: 'testId = :testId',
      ExpressionAttributeValues: {
        ':testId': testId
      }
    };

    const responseData = await dynamoDB.query(responseParams).promise();
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
          const questionResponse = await dynamoDB.get({
            TableName: process.env.QUESTION_TABLE,
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

    const result = {
      testId,
      totalParticipants,
      completedTests,
      incompleteTests,
      averageScore,
      cheatingAttempts,
      categoryStats
    };

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error getting test statistics:', error);
    
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