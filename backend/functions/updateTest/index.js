// backend/functions/updateTest/index.js
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
 * Update an existing test
 */
exports.handler = async (event) => {
  try {
    // Get the test ID from path parameters
    const testId = event.pathParameters.id;

    // Parse the request body
    const requestBody = JSON.parse(event.body);

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

    // Build update expression and attribute values
    let updateExpression = "SET updatedAt = :updatedAt";
    let expressionAttributeValues = {
      ":updatedAt": new Date().toISOString(),
    };

    // Add fields to update
    if (requestBody.name !== undefined) {
      updateExpression += ", #name = :name";
      expressionAttributeValues[":name"] = requestBody.name;
    }

    if (requestBody.description !== undefined) {
      updateExpression += ", description = :description";
      expressionAttributeValues[":description"] = requestBody.description;
    }

    if (requestBody.timeLimit !== undefined) {
      updateExpression += ", timeLimit = :timeLimit";
      expressionAttributeValues[":timeLimit"] = requestBody.timeLimit;
    }

    if (requestBody.numQuestions !== undefined) {
      updateExpression += ", numQuestions = :numQuestions";
      expressionAttributeValues[":numQuestions"] = requestBody.numQuestions;
    }

    if (requestBody.difficulty !== undefined) {
      updateExpression += ", difficulty = :difficulty";
      expressionAttributeValues[":difficulty"] = requestBody.difficulty;
    }

    if (requestBody.categories !== undefined) {
      updateExpression += ", categories = :categories";
      expressionAttributeValues[":categories"] = requestBody.categories;
    }

    if (requestBody.active !== undefined) {
      updateExpression += ", active = :active";
      expressionAttributeValues[":active"] = requestBody.active;
    }

    if (requestBody.closureDate !== undefined) {
      updateExpression += ", closureDate = :closureDate";
      expressionAttributeValues[":closureDate"] = requestBody.closureDate;
    }

    if (requestBody.questions !== undefined) {
      updateExpression += ", questions = :questions";
      expressionAttributeValues[":questions"] = requestBody.questions;
    }

    if (requestBody.settings !== undefined) {
      updateExpression += ", settings = :settings";
      expressionAttributeValues[":settings"] = {
        allowRetake:
          requestBody.settings.allowRetake !== undefined
            ? requestBody.settings.allowRetake
            : getResult.Item.settings?.allowRetake || false,
        randomizeQuestions:
          requestBody.settings.randomizeQuestions !== undefined
            ? requestBody.settings.randomizeQuestions
            : getResult.Item.settings?.randomizeQuestions || true,
        randomizeOptions:
          requestBody.settings.randomizeOptions !== undefined
            ? requestBody.settings.randomizeOptions
            : getResult.Item.settings?.randomizeOptions || true,
        showResultImmediately:
          requestBody.settings.showResultImmediately !== undefined
            ? requestBody.settings.showResultImmediately
            : getResult.Item.settings?.showResultImmediately || true,
      };
    }

    // Update the test
    const updateParams = {
      TableName: process.env.TEST_TABLE,
      Key: { id: testId },
      UpdateExpression: updateExpression,
      ExpressionAttributeValues: expressionAttributeValues,
      ExpressionAttributeNames: {
        "#name": "name", // 'name' is a reserved word in DynamoDB
      },
      ReturnValues: "ALL_NEW",
    };

    const updateResult = await dynamoDB.send(new UpdateCommand(updateParams));

    // Return the updated test
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify(updateResult.Attributes),
    };
  } catch (error) {
    console.error("Error updating test:", error);

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
