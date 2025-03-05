export type OptionType = {
  id: string;
  text: string;
};

export type QuestionType = {
  id: string;
  text: string;
  options: OptionType[];
  correctAnswer: string;
  explanation: string;
  category: string;
  difficulty: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type TestSettingsType = {
  allowRetake: boolean;
  randomizeQuestions: boolean;
  randomizeOptions: boolean;
  showResultImmediately: boolean;
};

export type TestType = {
  id: string;
  name: string;
  description?: string;
  timeLimit: number;
  numQuestions: number;
  difficulty: string[];
  categories: string[];
  active: boolean;
  closureDate?: string;
  questions: string[];
  settings: TestSettingsType;
  createdAt?: string;
  updatedAt?: string;
};

export type AnswerType = {
  questionId: string;
  selectedOption: string;
  correct?: boolean;
  timeSpent?: number;
};

export type ResponseType = {
  id: string;
  testId: string;
  userId: string;
  userName: string;
  startTime: string;
  endTime?: string;
  answers: AnswerType[];
  score?: number;
  completed: boolean;
  cheatingAttempts?: number;
  cheatingDetails?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type CategoryStatType = {
  category: string;
  averageScore: number;
  questionCount: number;
};

export type TestStatisticsType = {
  testId: string;
  totalParticipants: number;
  completedTests: number;
  incompleteTests: number;
  averageScore: number;
  cheatingAttempts: number;
  categoryStats: CategoryStatType[];
};

export type ValidationResultType = {
  valid: boolean;
  errors: string[];
};

export type ImportResultType = {
  success: boolean;
  importedCount: number;
  errors: string[];
};

export interface TestResponseMetadata {
  disqualified?: boolean;
  disqualificationReason?: string;
  [key: string]: any; // Allow for additional metadata properties
}

export interface UpdateResponseInput {
  id: string;
  answers?: AnswerType[];
  score?: number;
  completed?: boolean;
  endTime?: string;
  cheatingAttempts?: number;
  cheatingDetails?: string[];
  metadata?: TestResponseMetadata;
}
