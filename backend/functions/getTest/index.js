// backend/functions/getTest/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize clients
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

/**
 * Get a test by ID
 */
exports.handler = async (event) => {
  try {
    // Get the test ID from path parameters
    const testId = event.pathParameters.id;

    // Query DynamoDB
    const params = {
      TableName: process.env.TEST_TABLE,
      Key: {
        id: testId,
      },
    };

    const result = await dynamoDB.send(new GetCommand(params));

    // Check if the test exists
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Test not found" }),
      };
    }

    // Return the test
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    console.error("Error getting test:", error);

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
