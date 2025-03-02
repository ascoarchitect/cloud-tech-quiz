export const getTest = /* GraphQL */ `
  query GetTest($id: ID!) {
    getTest(id: $id) {
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

export const listTests = /* GraphQL */ `
  query ListTests(
    $filter: ModelTestFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listTests(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const getQuestion = /* GraphQL */ `
  query GetQuestion($id: ID!) {
    getQuestion(id: $id) {
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

export const listQuestions = /* GraphQL */ `
  query ListQuestions(
    $filter: ModelQuestionFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listQuestions(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
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
      nextToken
    }
  }
`;

export const getResponse = /* GraphQL */ `
  query GetResponse($id: ID!) {
    getResponse(id: $id) {
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

export const listResponses = /* GraphQL */ `
  query ListResponses(
    $filter: ModelResponseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listResponses(filter: $filter, limit: $limit, nextToken: $nextToken) {
      items {
        id
        testId
        userId
        userName
        startTime
        endTime
        score
        completed
        cheatingAttempts
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const listResponsesByTest = /* GraphQL */ `
  query ListResponsesByTest(
    $testId: ID!
    $filter: ModelResponseFilterInput
    $limit: Int
    $nextToken: String
  ) {
    listResponses(
      filter: {testId: {eq: $testId}, ...($filter || {})}
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        id
        testId
        userId
        userName
        startTime
        endTime
        score
        completed
        cheatingAttempts
        cheatingDetails
        createdAt
        updatedAt
      }
      nextToken
    }
  }
`;

export const getTestStatistics = /* GraphQL */ `
  query GetTestStatistics($testId: ID!) {
    getTestStatistics(testId: $testId) {
      testId
      totalParticipants
      completedTests
      incompleteTests
      averageScore
      cheatingAttempts
      categoryStats {
        category
        averageScore
        questionCount
      }
    }
  }
`;

export const validateImportQuestions = /* GraphQL */ `
  query ValidateImportQuestions($questions: [QuestionInput!]!) {
    validateImportQuestions(questions: $questions) {
      valid
      errors
    }
  }
`;

export const importQuestions = /* GraphQL */ `
  query ImportQuestions($questions: [QuestionInput!]!) {
    importQuestions(questions: $questions) {
      success
      importedCount
      errors
    }
  }
`;