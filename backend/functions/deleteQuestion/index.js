// backend/functions/deleteQuestion/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");
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
 * Delete a question
 */
exports.handler = async (event) => {
  try {
    // Get the question ID from path parameters
    const questionId = event.pathParameters.id;

    // Check if the question exists
    const getResult = await dynamoDB.send(
      new GetCommand({
        TableName: process.env.QUESTION_TABLE,
        Key: { id: questionId },
      }),
    );

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Question not found" }),
      };
    }

    // Delete the question
    await dynamoDB.send(
      new DeleteCommand({
        TableName: process.env.QUESTION_TABLE,
        Key: { id: questionId },
      }),
    );

    // Return success
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ id: questionId }),
    };
  } catch (error) {
    console.error("Error deleting question:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
