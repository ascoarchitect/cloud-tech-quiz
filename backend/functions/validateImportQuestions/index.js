// backend/functions/validateImportQuestions/index.js
/**
 * Validate questions for import
 */
const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://djvreacd6aujl.cloudfront.net',
  'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
  'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
  'Access-Control-Allow-Credentials': 'true'
};
exports.handler = async (event) => {
  try {
    // Parse the request body
    const requestBody = JSON.parse(event.body);
    const questions = requestBody.questions;

    if (!questions || !Array.isArray(questions)) {
      return {
        statusCode: 400,
        headers: corsHeaders,
        body: JSON.stringify({
          valid: false,
          errors: ["Invalid input: questions should be an array"],
        }),
      };
    }

    const errors = [];

    // Validate each question
    questions.forEach((question, index) => {
      const questionIndex = index + 1;

      // Check if question text exists
      if (!question.text) {
        errors.push(`Question #${questionIndex}: Missing question text.`);
      }

      // Check if options exist and are valid
      if (!question.options || question.options.length < 2) {
        errors.push(
          `Question #${questionIndex}: At least two options are required.`,
        );
      } else {
        // Check for duplicate option IDs
        const optionIds = new Set();
        question.options.forEach((option) => {
          if (optionIds.has(option.id)) {
            errors.push(
              `Question #${questionIndex}: Duplicate option ID - ${option.id}.`,
            );
          }
          optionIds.add(option.id);

          // Check if option text is provided
          if (!option.text) {
            errors.push(
              `Question #${questionIndex}, Option ${option.id}: Missing option text.`,
            );
          }
        });
      }

      // Check if correctAnswer is valid
      if (!question.correctAnswer) {
        errors.push(`Question #${questionIndex}: Missing correct answer.`);
      } else if (
        question.options &&
        !question.options.some((opt) => opt.id === question.correctAnswer)
      ) {
        errors.push(
          `Question #${questionIndex}: Correct answer does not match any option ID.`,
        );
      }

      // Check for explanation
      if (!question.explanation) {
        errors.push(`Question #${questionIndex}: Missing explanation.`);
      }

      // Check for category
      if (!question.category) {
        errors.push(`Question #${questionIndex}: Missing category.`);
      }

      // Check for difficulty
      if (!question.difficulty) {
        errors.push(`Question #${questionIndex}: Missing difficulty.`);
      }
    });

    // Return validation result
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        valid: errors.length === 0,
        errors: errors,
      }),
    };
  } catch (error) {
    console.error("Error validating questions:", error);

    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
        valid: false,
        errors: ["Internal server error"],
      }),
    };
  }
};
