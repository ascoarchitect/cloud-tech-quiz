// backend/functions/updateResponse/index.js
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const {
  DynamoDBDocumentClient,
  GetCommand,
  UpdateCommand,
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
 * Update an existing response
 */
exports.handler = async (event) => {
  try {
    // Get the response ID from path parameters
    const responseId = event.pathParameters.id;

    // Parse the request body
    const requestBody = JSON.parse(event.body);

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

    // Build update expression and attribute values
    let updateExpression = "SET updatedAt = :updatedAt";
    let expressionAttributeValues = {
      ":updatedAt": new Date().toISOString(),
    };

    // Add fields to update
    if (requestBody.endTime !== undefined) {
      updateExpression += ", endTime = :endTime";
      expressionAttributeValues[":endTime"] = requestBody.endTime;
    }

    if (requestBody.answers !== undefined) {
      updateExpression += ", answers = :answers";
      expressionAttributeValues[":answers"] = requestBody.answers;
    }

    if (requestBody.score !== undefined) {
      updateExpression += ", score = :score";
      expressionAttributeValues[":score"] = requestBody.score;
    }

    if (requestBody.completed !== undefined) {
      updateExpression += ", completed = :completed";
      expressionAttributeValues[":completed"] = requestBody.completed;
    }

    if (requestBody.cheatingAttempts !== undefined) {
      updateExpression += ", cheatingAttempts = :cheatingAttempts";
      expressionAttributeValues[":cheatingAttempts"] =
        requestBody.cheatingAttempts;
    }

    if (requestBody.cheatingDetails !== undefined) {
      updateExpression += ", cheatingDetails = :cheatingDetails";
      expressionAttributeValues[":cheatingDetails"] =
        requestBody.cheatingDetails;
    }

    // Update the response
    const updateParams = {
      TableName: process.env.RESPONSE_TABLE,
      Key: { id: responseId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    };

    const updateResult = await dynamoDB.send(new UpdateCommand(updateParams));

    // Return the updated response
    return {
      statusCode: 200,
      headers: corsHeaders,
      body: JSON.stringify(updateResult.Attributes),
    };
  } catch (error) {
    console.error("Error updating response:", error);

    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ message: "Internal server error" }),
    };
  }
};
