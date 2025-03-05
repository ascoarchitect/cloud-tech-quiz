// frontend/src/services/api.ts
import {
  QuestionType,
  TestType,
  ResponseType,
  TestStatisticsType,
  ValidationResultType,
  ImportResultType,
  AnswerType,
} from "../types";
import { getIdToken } from "./auth";

// Replace with your API URL from the SAM deployment
const API_URL = import.meta.env.VITE_API_URL || "";

interface ApiOptions {
  method: "GET" | "POST" | "PUT" | "DELETE";
  path: string;
  body?: any;
  queryParams?: Record<string, string>;
  requiresAuth?: boolean;
}

/**
 * Make an API request
 */
export async function apiRequest<T>({
  method,
  path,
  body,
  queryParams,
  requiresAuth = true,
}: ApiOptions): Promise<T> {
  // Build query string
  let url = `${API_URL}${path}`;

  if (queryParams) {
    const params = new URLSearchParams();
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, value);
      }
    });

    const queryString = params.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  // Build request options
  const options: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
    },
  };

  // Add request body for POST/PUT
  if (body && (method === "POST" || method === "PUT")) {
    options.body = JSON.stringify(body);
  }

  // Add authorization header if required
  if (requiresAuth) {
    const token = await getIdToken();
    if (!token) {
      throw new Error("Authentication required");
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Make the request
  const response = await fetch(url, options);

  // Handle errors
  if (!response.ok) {
    let errorData;
    try {
      errorData = await response.json();
    } catch (e) {
      errorData = { message: "Unknown error" };
    }

    // Throw error with response data
    const error = new Error(
      errorData.message || `API Error: ${response.status}`,
    );
    (error as any).status = response.status;
    (error as any).data = errorData;
    throw error;
  }

  // Parse and return response data
  return await response.json();
}

// Question API Functions
export async function getQuestion(id: string): Promise<QuestionType> {
  return apiRequest<QuestionType>({
    method: "GET",
    path: `/questions/${id}`,
  });
}

export interface ListQuestionsOptions {
  limit?: number;
  nextToken?: string;
  filter?: Record<string, any>;
}

export interface ListQuestionsResponse {
  items: QuestionType[];
  nextToken?: string;
}

export async function listQuestions(
  options?: ListQuestionsOptions,
): Promise<ListQuestionsResponse> {
  const queryParams: Record<string, string> = {};

  if (options?.limit) {
    queryParams.limit = options.limit.toString();
  }

  if (options?.nextToken) {
    queryParams.nextToken = options.nextToken;
  }

  if (options?.filter) {
    queryParams.filter = JSON.stringify(options.filter);
  }

  return apiRequest<ListQuestionsResponse>({
    method: "GET",
    path: `/questions`,
    queryParams,
  });
}

export async function createQuestion(
  question: Omit<QuestionType, "id" | "createdAt" | "updatedAt">,
): Promise<QuestionType> {
  return apiRequest<QuestionType>({
    method: "POST",
    path: `/questions`,
    body: question,
  });
}

export async function updateQuestion(
  question: Pick<QuestionType, "id"> & Partial<QuestionType>,
): Promise<QuestionType> {
  return apiRequest<QuestionType>({
    method: "PUT",
    path: `/questions/${question.id}`,
    body: question,
  });
}

export async function deleteQuestion(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({
    method: "DELETE",
    path: `/questions/${id}`,
  });
}

export async function validateImportQuestions(
  questions: Omit<QuestionType, "id" | "createdAt" | "updatedAt">[],
): Promise<ValidationResultType> {
  return apiRequest<ValidationResultType>({
    method: "POST",
    path: `/questions/validate-import`,
    body: { questions },
  });
}

export async function importQuestions(
  questions: Omit<QuestionType, "id" | "createdAt" | "updatedAt">[],
): Promise<ImportResultType> {
  return apiRequest<ImportResultType>({
    method: "POST",
    path: `/questions/import`,
    body: { questions },
  });
}

// Test API Functions
export async function getTest(id: string): Promise<TestType> {
  return apiRequest<TestType>({
    method: "GET",
    path: `/tests/${id}`,
  });
}

export interface ListTestsOptions {
  limit?: number;
  nextToken?: string;
  filter?: Record<string, any>;
}

export interface ListTestsResponse {
  items: TestType[];
  nextToken?: string;
}

export async function listTests(
  options?: ListTestsOptions,
): Promise<ListTestsResponse> {
  const queryParams: Record<string, string> = {};

  if (options?.limit) {
    queryParams.limit = options.limit.toString();
  }

  if (options?.nextToken) {
    queryParams.nextToken = options.nextToken;
  }

  if (options?.filter) {
    queryParams.filter = JSON.stringify(options.filter);
  }

  return apiRequest<ListTestsResponse>({
    method: "GET",
    path: `/tests`,
    queryParams,
  });
}

export async function createTest(
  test: Omit<TestType, "createdAt" | "updatedAt">,
): Promise<TestType> {
  return apiRequest<TestType>({
    method: "POST",
    path: `/tests`,
    body: test,
  });
}

export async function updateTest(
  test: Pick<TestType, "id"> & Partial<TestType>,
): Promise<TestType> {
  return apiRequest<TestType>({
    method: "PUT",
    path: `/tests/${test.id}`,
    body: test,
  });
}

export async function deleteTest(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({
    method: "DELETE",
    path: `/tests/${id}`,
  });
}

// Response API Functions
export async function getResponse(id: string): Promise<ResponseType> {
  return apiRequest<ResponseType>({
    method: "GET",
    path: `/responses/${id}`,
  });
}

export interface ListResponsesOptions {
  limit?: number;
  nextToken?: string;
  filter?: Record<string, any>;
  testId?: string;
  userId?: string;
}

export interface ListResponsesResponse {
  items: ResponseType[];
  nextToken?: string;
}

export async function listResponses(
  options?: ListResponsesOptions,
): Promise<ListResponsesResponse> {
  const queryParams: Record<string, string> = {};

  if (options?.limit) {
    queryParams.limit = options.limit.toString();
  }

  if (options?.nextToken) {
    queryParams.nextToken = options.nextToken;
  }

  if (options?.testId) {
    queryParams.testId = options.testId;
  }

  if (options?.userId) {
    queryParams.userId = options.userId;
  }

  if (options?.filter) {
    queryParams.filter = JSON.stringify(options.filter);
  }

  return apiRequest<ListResponsesResponse>({
    method: "GET",
    path: `/responses`,
    queryParams,
  });
}

export interface CreateResponseInput {
  testId: string;
  userId: string;
  userName: string;
  startTime: string;
  answers?: AnswerType[];
  completed?: boolean;
  cheatingAttempts?: number;
  cheatingDetails?: string[];
}

export async function createResponse(
  response: CreateResponseInput,
): Promise<ResponseType> {
  return apiRequest<ResponseType>({
    method: "POST",
    path: `/responses`,
    body: response,
  });
}

export interface UpdateResponseInput {
  id: string;
  answers?: AnswerType[];
  endTime?: string;
  score?: number;
  completed?: boolean;
  cheatingAttempts?: number;
  cheatingDetails?: string[];
}

export async function updateResponse(
  response: UpdateResponseInput,
): Promise<ResponseType> {
  return apiRequest<ResponseType>({
    method: "PUT",
    path: `/responses/${response.id}`,
    body: response,
  });
}

export async function deleteResponse(id: string): Promise<{ id: string }> {
  return apiRequest<{ id: string }>({
    method: "DELETE",
    path: `/responses/${id}`,
  });
}

/**
 * Get test statistics
 */
export async function getTestStatistics(
  testId: string,
): Promise<TestStatisticsType> {
  return apiRequest<TestStatisticsType>({
    method: "GET",
    path: `/test-statistics/${testId}`,
  });
}
