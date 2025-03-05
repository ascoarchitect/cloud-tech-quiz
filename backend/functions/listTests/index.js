// backend/functions/listTests/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
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
 * List tests with optional filtering
 */
exports.handler = async (event) => {
  try {
    // Get query parameters for filtering
    const queryParams = event.queryStringParameters || {};

    // Base scan parameters
    let params = {
      TableName: process.env.TEST_TABLE,
      Limit: 100,
    };

    // Apply active filter if provided
    if (queryParams.active !== undefined) {
      const activeValue =
        queryParams.active.toLowerCase() === "true" ? "true" : "false";

      // Use the global secondary index for active status
      params.IndexName = "byActive";
      params.KeyConditionExpression = "active = :active";
      params.ExpressionAttributeValues = {
        ":active": activeValue,
      };
    }

    // Get last evaluated key for pagination
    if (queryParams.nextToken) {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(queryParams.nextToken, "base64").toString("utf8"),
      );
    }

    let result;

    // Execute either Query or Scan based on whether we have filter criteria
    if (params.KeyConditionExpression) {
      result = await dynamoDB.send(new QueryCommand(params));
    } else {
      result = await dynamoDB.send(new ScanCommand(params));
    }

    // Format next token for pagination
    let nextToken = null;
    if (result.LastEvaluatedKey) {
      nextToken = Buffer.from(JSON.stringify(result.LastEvaluatedKey)).toString(
        "base64",
      );
    }

    // Return the tests
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        items: result.Items,
        nextToken: nextToken,
      }),
    };
  } catch (error) {
    console.error("Error listing tests:", error);

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
