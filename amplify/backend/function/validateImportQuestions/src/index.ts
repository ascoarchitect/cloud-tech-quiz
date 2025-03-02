import { AppSyncResolverHandler } from 'aws-lambda';

type Option = {
  id: string;
  text: string;
};

type QuestionInput = {
  text: string;
  options: Option[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
  tags: string[];
};

type ValidationResult = {
  valid: boolean;
  errors: string[];
};

export const handler: AppSyncResolverHandler<
  { questions: QuestionInput[] },
  ValidationResult
> = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { questions } = event.arguments;
  const errors: string[] = [];

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
      const optionIds = new Set<string>();
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
    } else if (!['CP', 'SAA', 'DEV', 'OPS', 'PRO'].includes(question.difficulty)) {
      errors.push(`Question #${index + 1}: Invalid difficulty. Must be one of: CP, SAA, DEV, OPS, PRO.`);
    }
  });

  return {
    valid: errors.length === 0,
    errors
  };
};