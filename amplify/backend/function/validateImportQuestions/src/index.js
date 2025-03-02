// src/functions/validateImportQuestions/src/index.js

/**
 * @typedef {Object} Option
 * @property {string} id - The option ID
 * @property {string} text - The option text
 */

/**
 * @typedef {Object} QuestionInput
 * @property {string} text - The question text
 * @property {Option[]} options - The answer options
 * @property {string} correctAnswer - The ID of the correct option
 * @property {string} explanation - The explanation for the correct answer
 * @property {string} category - The question category
 * @property {string} difficulty - The difficulty level
 * @property {string[]} tags - Question tags
 */

/**
 * @typedef {Object} ValidationResult
 * @property {boolean} valid - Whether all questions are valid
 * @property {string[]} errors - List of validation error messages
 */

/**
 * Validate a list of questions
 * @param {Object} event - The event object
 * @param {Object} event.arguments - The arguments
 * @param {QuestionInput[]} event.arguments.questions - The questions to validate
 * @returns {Promise<ValidationResult>} Validation result
 */
exports.handler = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { questions } = event.arguments;
  const errors = [];

  // Validate each question
  questions.forEach((question, index) => {
    // Check if question text exists
    if (!question.text) {
      errors.push(`Question #${index + 1}: Missing question text.`);
    }

    // Check if options exist and are valid
    if (!question.options || question.options.length < 2) {
      errors.push(`Question #${index + 1}: At least two options are required.`);
    } else {
      // Check for duplicate option IDs
      const optionIds = new Set();
      question.options.forEach((option) => {
        if (optionIds.has(option.id)) {
          errors.push(`Question #${index + 1}: Duplicate option ID - ${option.id}.`);
        }
        optionIds.add(option.id);

        // Check if option text is provided
        if (!option.text) {
          errors.push(`Question #${index + 1}, Option ${option.id}: Missing option text.`);
        }
      });
    }

    // Check if correctAnswer is valid
    if (!question.correctAnswer) {
      errors.push(`Question #${index + 1}: Missing correct answer.`);
    } else if (question.options && !question.options.some(opt => opt.id === question.correctAnswer)) {
      errors.push(`Question #${index + 1}: Correct answer does not match any option ID.`);
    }

    // Check for explanation
    if (!question.explanation) {
      errors.push(`Question #${index + 1}: Missing explanation.`);
    }

    // Check for category
    if (!question.category) {
      errors.push(`Question #${index + 1}: Missing category.`);
    }

    // Check for difficulty
    if (!question.difficulty) {
      errors.push(`Question #${index + 1}: Missing difficulty.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};