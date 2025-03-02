/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../src/API";
type GeneratedQuery<InputType, OutputType> = string & {
  __generatedQueryInput: InputType;
  __generatedQueryOutput: OutputType;
};

export const getQuestion = /* GraphQL */ `query GetQuestion($id: ID!) {
  getQuestion(id: $id) {
    id
    text
    options {
      id
      text
      __typename
    }
    correctAnswer
    explanation
    category
    difficulty
    tags
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetQuestionQueryVariables,
  APITypes.GetQuestionQuery
>;
export const listQuestions = /* GraphQL */ `query ListQuestions(
  $filter: ModelQuestionFilterInput
  $limit: Int
  $nextToken: String
) {
  listQuestions(filter: $filter, limit: $limit, nextToken: $nextToken) {
    items {
      id
      text
      correctAnswer
      explanation
      category
      difficulty
      tags
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListQuestionsQueryVariables,
  APITypes.ListQuestionsQuery
>;
export const getTest = /* GraphQL */ `query GetTest($id: ID!) {
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
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedQuery<APITypes.GetTestQueryVariables, APITypes.GetTestQuery>;
export const listTests = /* GraphQL */ `query ListTests(
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
      createdAt
      updatedAt
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<APITypes.ListTestsQueryVariables, APITypes.ListTestsQuery>;
export const getResponse = /* GraphQL */ `query GetResponse($id: ID!) {
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
      __typename
    }
    score
    completed
    cheatingAttempts
    cheatingDetails
    createdAt
    updatedAt
    owner
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetResponseQueryVariables,
  APITypes.GetResponseQuery
>;
export const listResponses = /* GraphQL */ `query ListResponses(
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
      cheatingDetails
      createdAt
      updatedAt
      owner
      __typename
    }
    nextToken
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ListResponsesQueryVariables,
  APITypes.ListResponsesQuery
>;
export const getTestStatistics = /* GraphQL */ `query GetTestStatistics($testId: ID!) {
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
      __typename
    }
    __typename
  }
}
` as GeneratedQuery<
  APITypes.GetTestStatisticsQueryVariables,
  APITypes.GetTestStatisticsQuery
>;
export const validateImportQuestions = /* GraphQL */ `query ValidateImportQuestions($questions: [QuestionInput!]!) {
  validateImportQuestions(questions: $questions) {
    valid
    errors
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ValidateImportQuestionsQueryVariables,
  APITypes.ValidateImportQuestionsQuery
>;
export const importQuestions = /* GraphQL */ `query ImportQuestions($questions: [QuestionInput!]!) {
  importQuestions(questions: $questions) {
    success
    importedCount
    errors
    __typename
  }
}
` as GeneratedQuery<
  APITypes.ImportQuestionsQueryVariables,
  APITypes.ImportQuestionsQuery
>;
