// backend/functions/deleteResponse/index.js
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
 * Delete a response
 */
exports.handler = async (event) => {
  try {
    // Get the response ID from path parameters
    const responseId = event.pathParameters.id;

    // Check if the response exists
    const getResult = await dynamoDB.send(
      new GetCommand({
        TableName: process.env.RESPONSE_TABLE,
        Key: { id: responseId },
      }),
    );

    if (!getResult.Item) {
      return {
        statusCode: 404,
        headers: corsHeaders,
        body: JSON.stringify({ message: "Response not found" }),
      };
    }

    // Delete the response
    await dynamoDB.send(
      new DeleteCommand({
        TableName: process.env.RESPONSE_TABLE,
        Key: { id: responseId },
      }),
    );

    // Return success
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({ id: responseId }),
    };
  } catch (error) {
    console.error("Error deleting response:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
