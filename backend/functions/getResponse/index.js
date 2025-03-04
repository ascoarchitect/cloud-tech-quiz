// backend/functions/getResponse/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient, GetCommand } = require("@aws-sdk/lib-dynamodb");

// Initialize clients
const client = new DynamoDBClient({});
const dynamoDB = DynamoDBDocumentClient.from(client);

/**
 * Get a response by ID
 */
exports.handler = async (event) => {
  try {
    // Get the response ID from path parameters
    const responseId = event.pathParameters.id;

    // Query DynamoDB
    const params = {
      TableName: process.env.RESPONSE_TABLE,
      Key: {
        id: responseId,
      },
    };

    const result = await dynamoDB.send(new GetCommand(params));

    // Check if the response exists
    if (!result.Item) {
      return {
        statusCode: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
        body: JSON.stringify({ message: "Response not found" }),
      };
    }

    // Return the response
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(result.Item),
    };
  } catch (error) {
    console.error("Error getting response:", error);

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
