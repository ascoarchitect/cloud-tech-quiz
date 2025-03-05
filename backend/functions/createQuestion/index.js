// backend/functions/createQuestion/index.js
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
        headers: corsHeaders,
        body: JSON.stringify({ message: "Question text is required" }),
      };
    }

    if (
      !requestBody.options ||
      !Array.isArray(requestBody.options) ||
      requestBody.options.length < 2
    ) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "At least two options are required" }),
      };
    }

    if (!requestBody.correctAnswer) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Correct answer is required" }),
      };
    }

    if (!requestBody.explanation) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Explanation is required" }),
      };
    }

    if (!requestBody.category) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Category is required" }),
      };
    }

    if (!requestBody.difficulty) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Difficulty is required" }),
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
      updatedAt: new Date().toISOString(),
    };

    // Save to DynamoDB
    await dynamoDB.send(
      new PutCommand({
        TableName: process.env.QUESTION_TABLE,
        Item: question,
      }),
    );

    // Return the created question
    return {
      statusCode: 201,
      headers: corsHeaders,
      body: JSON.stringify(question),
    };
  } catch (error) {
    console.error("Error creating question:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
