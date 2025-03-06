// backend/functions/listResponses/index.js
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
 * List responses with optional filtering
 */
exports.handler = async (event) => {
  try {
    // Get query parameters for filtering
    const queryParams = event.queryStringParameters || {};

    // Base parameters
    let params = {
      TableName: process.env.RESPONSE_TABLE,
      Limit: 100,
    };

    // Apply test filter if provided
    if (queryParams.testId) {
      // Use the global secondary index for test ID
      params.IndexName = "byTest";
      params.KeyConditionExpression = "testId = :testId";
      params.ExpressionAttributeValues = {
        ":testId": queryParams.testId,
      };
    }
    // Apply user filter if provided
    else if (queryParams.userId) {
      // Use the global secondary index for user ID
      params.IndexName = "byUser";
      params.KeyConditionExpression = "userId = :userId";
      params.ExpressionAttributeValues = {
        ":userId": queryParams.userId,
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

    // Return the responses
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify({
        items: result.Items,
        nextToken: nextToken,
      }),
    };
  } catch (error) {
    console.error("Error listing responses:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
