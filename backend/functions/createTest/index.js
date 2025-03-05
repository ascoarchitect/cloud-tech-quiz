// backend/functions/createTest/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, PutCommand } = require("@aws-sdk/lib-dynamodb");
const { v4: uuidv4 } = require("uuid");
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://djvreacd6aujl.cloudfront.net",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

// Initialize clients
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

/**
 * Create a new test
 */
exports.handler = async (event) => {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);

    // Validate required fields
    if (!requestBody.name) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Test name is required" }),
      };
    }

    if (!requestBody.timeLimit || requestBody.timeLimit <= 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Valid time limit is required" }),
      };
    }

    if (!requestBody.numQuestions || requestBody.numQuestions <= 0) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "Valid number of questions is required",
        }),
      };
    }

    if (
      !requestBody.difficulty ||
      !Array.isArray(requestBody.difficulty) ||
      requestBody.difficulty.length === 0
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          message: "At least one difficulty level is required",
        }),
      };
    }

    if (
      !requestBody.categories ||
      !Array.isArray(requestBody.categories) ||
      requestBody.categories.length === 0
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "At least one category is required" }),
      };
    }

    // Create the test item
    const test = {
      id: requestBody.id || uuidv4(),
      name: requestBody.name,
      description: requestBody.description || null,
      timeLimit: requestBody.timeLimit,
      numQuestions: requestBody.numQuestions,
      difficulty: requestBody.difficulty,
      categories: requestBody.categories,
      // Store 'active' as a string instead of boolean to match the GSI definition
      active: requestBody.active !== undefined 
        ? (requestBody.active ? "true" : "false") 
        : "true",
      closureDate: requestBody.closureDate || null,
      questions: requestBody.questions || [],
      settings: {
        allowRetake:
          requestBody.settings?.allowRetake !== undefined
            ? requestBody.settings.allowRetake
            : false,
        randomizeQuestions:
          requestBody.settings?.randomizeQuestions !== undefined
            ? requestBody.settings.randomizeQuestions
            : true,
        randomizeOptions:
          requestBody.settings?.randomizeOptions !== undefined
            ? requestBody.settings.randomizeOptions
            : true,
        showResultImmediately:
          requestBody.settings?.showResultImmediately !== undefined
            ? requestBody.settings.showResultImmediately
            : true,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to DynamoDB
    await dynamoDB.send(
      new PutCommand({
        TableName: process.env.TEST_TABLE,
        Item: test,
      }),
    );

    // Return the created test
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(test),
    };
  } catch (error) {
    console.error("Error creating test:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};