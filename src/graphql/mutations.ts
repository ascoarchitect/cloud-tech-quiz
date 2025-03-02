/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../src/API";
type GeneratedMutation<InputType, OutputType> = string & {
  __generatedMutationInput: InputType;
  __generatedMutationOutput: OutputType;
};

export const createQuestion = /* GraphQL */ `mutation CreateQuestion(
  $input: CreateQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  createQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.CreateQuestionMutationVariables,
  APITypes.CreateQuestionMutation
>;
export const updateQuestion = /* GraphQL */ `mutation UpdateQuestion(
  $input: UpdateQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  updateQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.UpdateQuestionMutationVariables,
  APITypes.UpdateQuestionMutation
>;
export const deleteQuestion = /* GraphQL */ `mutation DeleteQuestion(
  $input: DeleteQuestionInput!
  $condition: ModelQuestionConditionInput
) {
  deleteQuestion(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteQuestionMutationVariables,
  APITypes.DeleteQuestionMutation
>;
export const createTest = /* GraphQL */ `mutation CreateTest(
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
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.CreateTestMutationVariables,
  APITypes.CreateTestMutation
>;
export const updateTest = /* GraphQL */ `mutation UpdateTest(
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
      __typename
    }
    createdAt
    updatedAt
    __typename
  }
}
` as GeneratedMutation<
  APITypes.UpdateTestMutationVariables,
  APITypes.UpdateTestMutation
>;
export const deleteTest = /* GraphQL */ `mutation DeleteTest(
  $input: DeleteTestInput!
  $condition: ModelTestConditionInput
) {
  deleteTest(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteTestMutationVariables,
  APITypes.DeleteTestMutation
>;
export const createResponse = /* GraphQL */ `mutation CreateResponse(
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
` as GeneratedMutation<
  APITypes.CreateResponseMutationVariables,
  APITypes.CreateResponseMutation
>;
export const updateResponse = /* GraphQL */ `mutation UpdateResponse(
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
` as GeneratedMutation<
  APITypes.UpdateResponseMutationVariables,
  APITypes.UpdateResponseMutation
>;
export const deleteResponse = /* GraphQL */ `mutation DeleteResponse(
  $input: DeleteResponseInput!
  $condition: ModelResponseConditionInput
) {
  deleteResponse(input: $input, condition: $condition) {
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
` as GeneratedMutation<
  APITypes.DeleteResponseMutationVariables,
  APITypes.DeleteResponseMutation
>;
