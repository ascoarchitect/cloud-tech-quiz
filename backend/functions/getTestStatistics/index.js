// backend/functions/getTestStatistics/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  QueryCommand,
} = require("@aws-sdk/lib-dynamodb");

// Initialize clients
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://djvreacd6aujl.cloudfront.net",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

/**
 * Get test statistics
 */
exports.handler = async (event) => {
  try {
    // Get the test ID from path parameters
    const testId = event.pathParameters.id;

    // Get test data to access question IDs
    const testResponse = await dynamoDB.send(
      new GetCommand({
        TableName: process.env.TEST_TABLE,
        Key: { id: testId },
      }),
    );

    const test = testResponse.Item;
    if (!test) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: `Test with ID ${testId} not found.` }),
      };
    }

    // Query responses for this test
    const responseParams = {
      TableName: process.env.RESPONSE_TABLE,
      IndexName: "byTest",
      KeyConditionExpression: "testId = :testId",
      ExpressionAttributeValues: {
        ":testId": testId,
      },
    };

    const responseData = await dynamoDB.send(new QueryCommand(responseParams));
    const responses = responseData.Items || [];

    // Calculate basic statistics
    const totalParticipants = responses.length;
    const completedTests = responses.filter((r) => r.completed).length;
    const incompleteTests = totalParticipants - completedTests;

    // Calculate average score
    const scores = responses
      .filter((r) => r.completed && r.score !== undefined)
      .map((r) => r.score);
    const averageScore =
      scores.length > 0
        ? scores.reduce((sum, score) => sum + score, 0) / scores.length
        : 0;

    // Count cheating attempts
    const cheatingAttempts = responses.reduce(
      (total, response) => total + (response.cheatingAttempts || 0),
      0,
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
          const questionResponse = await dynamoDB.send(
            new GetCommand({
              TableName: process.env.QUESTION_TABLE,
              Key: { id: answer.questionId },
            }),
          );

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
          console.error(
            `Error retrieving question ${answer.questionId}:`,
            error,
          );
        }
      }
    }

    // Convert to required format
    const categoryStats = Object.entries(categoryScores).map(
      ([category, stats]) => ({
        category,
        averageScore: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        questionCount: stats.total,
      }),
    );

    // Sort by average score (lowest first to identify weakest areas)
    categoryStats.sort((a, b) => a.averageScore - b.averageScore);

    const result = {
      testId,
      totalParticipants,
      completedTests,
      incompleteTests,
      averageScore,
      cheatingAttempts,
      categoryStats,
    };

    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error getting test statistics:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
