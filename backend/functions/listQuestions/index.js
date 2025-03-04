// backend/functions/listQuestions/index.js
const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * List questions with optional filtering
 */
exports.handler = async (event) => {
  try {
    // Get query parameters for filtering
    const queryParams = event.queryStringParameters || {};
    
    // Base scan parameters
    let params = {
      TableName: process.env.QUESTION_TABLE,
      Limit: 100
    };
    
    // Apply category filter if provided
    if (queryParams.category) {
      // Use the global secondary index for category
      params.IndexName = 'byCategory';
      params.KeyConditionExpression = 'category = :category';
      params.ExpressionAttributeValues = {
        ':category': queryParams.category
      };
    }
    // Apply difficulty filter if provided
    else if (queryParams.difficulty) {
      // Use the global secondary index for difficulty
      params.IndexName = 'byDifficulty';
      params.KeyConditionExpression = 'difficulty = :difficulty';
      params.ExpressionAttributeValues = {
        ':difficulty': queryParams.difficulty
      };
    }
    
    // Get last evaluated key for pagination
    if (queryParams.nextToken) {
      params.ExclusiveStartKey = JSON.parse(
        Buffer.from(queryParams.nextToken, 'base64').toString('utf8')
      );
    }
    
    let result;
    
    // Execute either Query or Scan based on whether we have filter criteria
    if (params.KeyConditionExpression) {
      result = await dynamoDB.query(params).promise();
    } else {
      result = await dynamoDB.scan(params).promise();
    }
    
    // Format next token for pagination
    let nextToken = null;
    if (result.LastEvaluatedKey) {
      nextToken = Buffer.from(
        JSON.stringify(result.LastEvaluatedKey)
      ).toString('base64');
    }
    
    // Return the questions
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items: result.Items,
        nextToken: nextToken
      })
    };
  } catch (error) {
    console.error('Error listing questions:', error);
    
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ message: 'Internal server error' })
    };
  }
};