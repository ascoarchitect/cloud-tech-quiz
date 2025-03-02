export const createTest = /* GraphQL */ `
  mutation CreateTest(
    $input: CreateTestInput!
    $condition: ModelTestConditionInput
  ) {
    createTest(input: $input, condition: $condition) {
      id
      name
      description
      timeLimit
      numQuestions
      difficulty
      categories
      active
      closureDate
      questions
      settings {
        allowRetake
        randomizeQuestions
        randomizeOptions
        showResultImmediately
      }
      createdAt
      updatedAt
    }
  }
`;

export const updateTest = /* GraphQL */ `
  mutation UpdateTest(
    $input: UpdateTestInput!
    $condition: ModelTestConditionInput
  ) {
    updateTest(input: $input, condition: $condition) {
      id
      name
      description
      timeLimit
      numQuestions
      difficulty
      categories
      active
      closureDate
      questions
      settings {
        allowRetake
        randomizeQuestions
        randomizeOptions
        showResultImmediately
      }
      createdAt
      updatedAt
    }
  }
`;

export const deleteTest = /* GraphQL */ `
  mutation DeleteTest(
    $input: DeleteTestInput!
    $condition: ModelTestConditionInput
  ) {
    deleteTest(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
    }
  }
`;

export const createQuestion = /* GraphQL */ `
  mutation CreateQuestion(
    $input: CreateQuestionInput!
    $condition: ModelQuestionConditionInput
  ) {
    createQuestion(input: $input, condition: $condition) {
      id
      text
      options {
        id
        text
      }
      correctAnswer
      explanation
      category
      difficulty
      tags
      createdAt
      updatedAt
    }
  }
`;

export const updateQuestion = /* GraphQL */ `
  mutation UpdateQuestion(
    $input: UpdateQuestionInput!
    $condition: ModelQuestionConditionInput
  ) {
    updateQuestion(input: $input, condition: $condition) {
      id
      text
      options {
        id
        text
      }
      correctAnswer
      explanation
      category
      difficulty
      tags
      createdAt
      updatedAt
    }
  }
`;

export const deleteQuestion = /* GraphQL */ `
  mutation DeleteQuestion(
    $input: DeleteQuestionInput!
    $condition: ModelQuestionConditionInput
  ) {
    deleteQuestion(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
    }
  }
`;

export const createResponse = /* GraphQL */ `
  mutation CreateResponse(
    $input: CreateResponseInput!
    $condition: ModelResponseConditionInput
  ) {
    createResponse(input: $input, condition: $condition) {
      id
      testId
      userId
      userName
      startTime
      endTime
      answers {
        questionId
        selectedOption
        correct
        timeSpent
      }
      score
      completed
      cheatingAttempts
      cheatingDetails
      createdAt
      updatedAt
    }
  }
`;

export const updateResponse = /* GraphQL */ `
  mutation UpdateResponse(
    $input: UpdateResponseInput!
    $condition: ModelResponseConditionInput
  ) {
    updateResponse(input: $input, condition: $condition) {
      id
      testId
      userId
      userName
      startTime
      endTime
      answers {
        questionId
        selectedOption
        correct
        timeSpent
      }
      score
      completed
      cheatingAttempts
      cheatingDetails
      createdAt
      updatedAt
    }
  }
`;

export const deleteResponse = /* GraphQL */ `
  mutation DeleteResponse(
    $input: DeleteResponseInput!
    $condition: ModelResponseConditionInput
  ) {
    deleteResponse(input: $input, condition: $condition) {
      id
      createdAt
      updatedAt
    }
  }
`;