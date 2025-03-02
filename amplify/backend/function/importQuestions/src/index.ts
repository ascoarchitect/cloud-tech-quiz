import { AppSyncResolverHandler } from 'aws-lambda';
import { DynamoDB } from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

const documentClient = new DynamoDB.DocumentClient();

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

type ImportResult = {
  success: boolean;
  importedCount: number;
  errors: string[];
};

export const handler: AppSyncResolverHandler<
  { questions: QuestionInput[] },
  ImportResult
> = async (event) => {
  console.log('Received event:', JSON.stringify(event, null, 2));

  const { questions } = event.arguments;
  const errors: string[] = [];
  let importedCount = 0;

  // Get the Question table name from environment variables
  const tableName = process.env.API_CLOUDSKILLSASSESSMENT_QUESTIONTABLE_NAME;
  
  if (!tableName) {
    return {
      success: false,
      importedCount: 0,
      errors: ['Question table name not found in environment variables.']
    };
  }

  // Process each question
  for (const question of questions) {
    try {
      const item = {
        id: uuidv4(),
        text: question.text,
        options: question.options,
        correctAnswer: question.correctAnswer,
        explanation: question.explanation,
        category: question.category,
        difficulty: question.difficulty,
        tags: question.tags || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await documentClient.put({
        TableName: tableName,
        Item: item
      }).promise();

      importedCount++;
    } catch (error) {
      console.error('Error importing question:', error);
      errors.push(`Failed to import question: ${question.text.substring(0, 50)}... Error: ${error.message}`);
    }
  }

  return {
    success: errors.length === 0,
    importedCount,
    errors
  };
};