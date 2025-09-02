// backend/functions/deleteTest/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

// Initialize clients
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);
const corsHeaders = {
  "Access-Control-Allow-Origin": "https://d39ffogr9d0c34.cloudfront.net",
  "Access-Control-Allow-Headers":
    "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
  "Access-Control-Allow-Methods": "GET,POST,PUT,DELETE,OPTIONS",
  "Access-Control-Allow-Credentials": "true",
};

/**
 * Delete a test
 */
exports.handler = async (event) => {
  try {
    // Get the test ID from path parameters
    const testId = event.pathParameters.id;

    // Check if the test exists
    const getResult = await dynamoDB.send(
      new GetCommand({
        TableName: process.env.TEST_TABLE,
        Key: { id: testId },
      }),
    );

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Test not found" }),
      };
    }

    // Delete the test
    await dynamoDB.send(
      new DeleteCommand({
        TableName: process.env.TEST_TABLE,
        Key: { id: testId },
      }),
    );

    // Return success
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ id: testId }),
    };
  } catch (error) {
    console.error("Error deleting test:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
