/* tslint:disable */
/* eslint-disable */
// this is an auto generated file. This will be overwritten

import * as APITypes from "../src/API";
type GeneratedSubscription<InputType, OutputType> = string & {
  __generatedSubscriptionInput: InputType;
  __generatedSubscriptionOutput: OutputType;
};

export const onCreateQuestion = /* GraphQL */ `subscription OnCreateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onCreateQuestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateQuestionSubscriptionVariables,
  APITypes.OnCreateQuestionSubscription
>;
export const onUpdateQuestion = /* GraphQL */ `subscription OnUpdateQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onUpdateQuestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateQuestionSubscriptionVariables,
  APITypes.OnUpdateQuestionSubscription
>;
export const onDeleteQuestion = /* GraphQL */ `subscription OnDeleteQuestion($filter: ModelSubscriptionQuestionFilterInput) {
  onDeleteQuestion(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteQuestionSubscriptionVariables,
  APITypes.OnDeleteQuestionSubscription
>;
export const onCreateTest = /* GraphQL */ `subscription OnCreateTest($filter: ModelSubscriptionTestFilterInput) {
  onCreateTest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnCreateTestSubscriptionVariables,
  APITypes.OnCreateTestSubscription
>;
export const onUpdateTest = /* GraphQL */ `subscription OnUpdateTest($filter: ModelSubscriptionTestFilterInput) {
  onUpdateTest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateTestSubscriptionVariables,
  APITypes.OnUpdateTestSubscription
>;
export const onDeleteTest = /* GraphQL */ `subscription OnDeleteTest($filter: ModelSubscriptionTestFilterInput) {
  onDeleteTest(filter: $filter) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteTestSubscriptionVariables,
  APITypes.OnDeleteTestSubscription
>;
export const onCreateResponse = /* GraphQL */ `subscription OnCreateResponse(
  $filter: ModelSubscriptionResponseFilterInput
  $owner: String
) {
  onCreateResponse(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnCreateResponseSubscriptionVariables,
  APITypes.OnCreateResponseSubscription
>;
export const onUpdateResponse = /* GraphQL */ `subscription OnUpdateResponse(
  $filter: ModelSubscriptionResponseFilterInput
  $owner: String
) {
  onUpdateResponse(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnUpdateResponseSubscriptionVariables,
  APITypes.OnUpdateResponseSubscription
>;
export const onDeleteResponse = /* GraphQL */ `subscription OnDeleteResponse(
  $filter: ModelSubscriptionResponseFilterInput
  $owner: String
) {
  onDeleteResponse(filter: $filter, owner: $owner) {
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
` as GeneratedSubscription<
  APITypes.OnDeleteResponseSubscriptionVariables,
  APITypes.OnDeleteResponseSubscription
>;
