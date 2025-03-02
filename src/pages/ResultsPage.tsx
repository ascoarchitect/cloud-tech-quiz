import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { GraphQLResult } from "@aws-amplify/api";
import {
  Box,
  Typography,
  Paper,
  Divider,
  List,
  ListItem,
  Chip,
  Button,
  CircularProgress,
  Alert,
  useTheme,
} from "@mui/material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { getTest, getResponse } from "../graphql/queries";
import { TestType, ResponseType, QuestionType } from "../types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
);

const client = generateClient();

const ResultsPage: React.FC = () => {
  const { testId, responseId } = useParams<{
    testId: string;
    responseId: string;
  }>();
  const navigate = useNavigate();
  const theme = useTheme();

  const [test, setTest] = useState<TestType | null>(null);
  const [response, setResponse] = useState<ResponseType | null>(null);
  const [questions, setQuestions] = useState<Record<string, QuestionType>>({});
  const [categoryStats, setCategoryStats] = useState<
    Record<string, { correct: number; total: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchResults = async () => {
      if (!testId || !responseId) {
        setError("Missing test or response ID");
        setLoading(false);
        return;
      }

      try {
        // Fetch test data
        const testResult = (await client.graphql({
          query: getTest,
          variables: { id: testId },
        })) as GraphQLResult<{
          getTest: TestType;
        }>;

        // Use optional chaining to safely access the data
        const testData = testResult.data?.getTest;

        if (!testData) {
          setError("Test not found");
          setLoading(false);
          return;
        }

        setTest(testData);

        // Fetch response data
        const responseResult = (await client.graphql({
          query: getResponse,
          variables: { id: responseId },
        })) as GraphQLResult<{
          getResponse: ResponseType;
        }>;

        const responseData = responseResult.data?.getResponse;

        if (!responseData) {
          setError("Response not found");
          setLoading(false);
          return;
        }

        setResponse(responseData);

        // Fetch questions
        const questionsMap: Record<string, QuestionType> = {};
        const categoryMap: Record<string, { correct: number; total: number }> =
          {};

        if (responseData.answers && responseData.answers.length > 0) {
          await Promise.all(
            responseData.answers.map(async (answer) => {
              try {
                const qResult = (await client.graphql({
                  query: `
                      query GetQuestionDetails {
                        getQuestion(id: "${answer.questionId}") {
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
                        }
                      }
                    `,
                })) as GraphQLResult<{
                  getQuestion: QuestionType;
                }>;

                const questionData = qResult.data?.getQuestion;
                if (questionData) {
                  questionsMap[answer.questionId] = questionData;

                  // Track category statistics
                  const category = questionData.category;
                  if (!categoryMap[category]) {
                    categoryMap[category] = { correct: 0, total: 0 };
                  }

                  categoryMap[category].total++;
                  if (answer.correct) {
                    categoryMap[category].correct++;
                  }
                }
              } catch (err) {
                console.error(
                  `Error fetching question ${answer.questionId}:`,
                  err,
                );
              }
            }),
          );
        }

        setQuestions(questionsMap);
        setCategoryStats(categoryMap);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching results:", err);
        setError("Failed to load test results");
        setLoading(false);
      }
    };

    fetchResults();
  }, [testId, responseId]);

  // Calculate overall statistics
  const calculateStats = () => {
    if (!response || !response.answers) return null;

    const totalQuestions = response.answers.length;
    const answeredQuestions = response.answers.filter(
      (a) => a.selectedOption,
    ).length;
    const correctAnswers = response.answers.filter((a) => a.correct).length;

    const stats = {
      totalQuestions,
      answeredQuestions,
      correctAnswers,
      score: response.score || 0,
      unanswered: totalQuestions - answeredQuestions,
      incorrectAnswers: answeredQuestions - correctAnswers,
    };

    return stats;
  };

  // Prepare category data for chart
  const prepareCategoryChart = () => {
    const categories = Object.keys(categoryStats).sort();
    const percentages = categories.map((category) => {
      const { correct, total } = categoryStats[category];
      return total > 0 ? (correct / total) * 100 : 0;
    });

    const data = {
      labels: categories,
      datasets: [
        {
          label: "Score by Category (%)",
          data: percentages,
          backgroundColor: theme.palette.primary.main,
          borderColor: theme.palette.primary.dark,
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
        },
      },
      plugins: {
        legend: {
          display: false,
        },
        title: {
          display: true,
          text: "Performance by Category",
        },
      },
    };

    return { data, options };
  };

  // Identify strengths and weaknesses
  const identifyStrengthsAndWeaknesses = () => {
    if (Object.keys(categoryStats).length === 0)
      return { strengths: [], weaknesses: [] };

    const categoryPerformance = Object.entries(categoryStats).map(
      ([category, stats]) => ({
        category,
        percentage: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
        questionCount: stats.total,
      }),
    );

    // Sort by performance (high to low)
    categoryPerformance.sort((a, b) => b.percentage - a.percentage);

    // Define strengths and weaknesses
    const strengths = categoryPerformance
      .filter((cat) => cat.percentage >= 70 && cat.questionCount >= 2)
      .map((cat) => cat.category);

    const weaknesses = categoryPerformance
      .filter((cat) => cat.percentage < 60 && cat.questionCount >= 2)
      .map((cat) => cat.category);

    return { strengths, weaknesses };
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "80vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </Box>
    );
  }

  if (!test || !response) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Failed to load test results
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </Box>
    );
  }

  const stats = calculateStats();
  if (!stats) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Invalid test data
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </Box>
    );
  }

  const chart = prepareCategoryChart();
  const { strengths, weaknesses } = identifyStrengthsAndWeaknesses();

  // Check for cheating attempts safely
  const cheatingAttemptsDetected =
    response.cheatingAttempts && response.cheatingAttempts > 0;

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }}>
      {/* Test Information */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Test Results
        </Typography>
        <Typography variant="h6">{test.name}</Typography>

        {cheatingAttemptsDetected && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            This test was ended early due to potential violations of test rules.
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", flexWrap: "wrap", gap: 2 }}>
          <Box sx={{ minWidth: 150 }}>
            <Typography variant="body2" color="text.secondary">
              Score
            </Typography>
            <Typography
              variant="h4"
              color={
                stats.score >= 70
                  ? "success.main"
                  : stats.score >= 50
                    ? "warning.main"
                    : "error.main"
              }
            >
              {stats.score.toFixed(1)}%
            </Typography>
          </Box>

          <Box sx={{ minWidth: 150 }}>
            <Typography variant="body2" color="text.secondary">
              Correct Answers
            </Typography>
            <Typography variant="h5">
              {stats.correctAnswers} / {stats.totalQuestions}
            </Typography>
          </Box>

          <Box sx={{ minWidth: 150 }}>
            <Typography variant="body2" color="text.secondary">
              Time Taken
            </Typography>
            <Typography variant="h5">
              {response.startTime && response.endTime
                ? `${Math.floor((new Date(response.endTime).getTime() - new Date(response.startTime).getTime()) / 60000)} minutes`
                : "N/A"}
            </Typography>
          </Box>
        </Box>
      </Paper>

      {/* Performance Summary */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h5" gutterBottom>
          Performance Summary
        </Typography>

        <Box sx={{ height: 300, mb: 4 }}>
          <Bar data={chart.data} options={chart.options} />
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" gutterBottom>
            Strengths
          </Typography>
          {strengths.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {strengths.map((strength) => (
                <Chip
                  key={strength}
                  label={strength}
                  color="success"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              No clear strengths identified yet. Continue practicing across all
              areas.
            </Typography>
          )}

          <Divider sx={{ my: 2 }} />

          <Typography variant="h6" gutterBottom>
            Areas for Improvement
          </Typography>
          {weaknesses.length > 0 ? (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              {weaknesses.map((weakness) => (
                <Chip
                  key={weakness}
                  label={weakness}
                  color="error"
                  variant="outlined"
                />
              ))}
            </Box>
          ) : (
            <Typography variant="body1" color="text.secondary">
              Good job! No significant weaknesses identified.
            </Typography>
          )}
        </Box>
      </Paper>

      {/* Detailed Answers */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          Detailed Answers
        </Typography>

        <List>
          {response.answers &&
            response.answers.map((answer, index) => {
              const question = questions[answer.questionId];
              if (!question) return null;

              return (
                <React.Fragment key={answer.questionId}>
                  <ListItem
                    alignItems="flex-start"
                    sx={{ flexDirection: "column" }}
                  >
                    <Box sx={{ width: "100%", mb: 1 }}>
                      <Typography variant="body1" fontWeight="bold">
                        Question {index + 1}: {question.text}
                      </Typography>

                      <Box sx={{ display: "flex", gap: 1, mt: 1, mb: 1 }}>
                        <Chip
                          label={question.category}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        <Chip
                          label={question.difficulty}
                          size="small"
                          color="secondary"
                          variant="outlined"
                        />
                      </Box>
                    </Box>

                    <Box sx={{ width: "100%" }}>
                      <Typography variant="body2" color="text.secondary">
                        Your Answer:
                      </Typography>
                      <Typography
                        variant="body1"
                        sx={{
                          color: answer.correct ? "success.main" : "error.main",
                          fontWeight: "medium",
                        }}
                      >
                        {answer.selectedOption
                          ? question.options.find(
                              (opt) => opt.id === answer.selectedOption,
                            )?.text || "Unknown option"
                          : "Not answered"}
                      </Typography>

                      {!answer.correct && (
                        <Box sx={{ mt: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            Correct Answer:
                          </Typography>
                          <Typography variant="body1" color="success.main">
                            {question.options.find(
                              (opt) => opt.id === question.correctAnswer,
                            )?.text || "Unknown"}
                          </Typography>
                        </Box>
                      )}

                      <Box
                        sx={{
                          mt: 2,
                          bgcolor: "action.hover",
                          p: 2,
                          borderRadius: 1,
                        }}
                      >
                        <Typography variant="body2" color="text.secondary">
                          Explanation:
                        </Typography>
                        <Typography variant="body1">
                          {question.explanation}
                        </Typography>
                      </Box>
                    </Box>
                  </ListItem>
                  {index < (response.answers?.length ?? 0) - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              );
            })}
        </List>

        <Box sx={{ mt: 3, textAlign: "center" }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/")}
            sx={{ minWidth: 200 }}
          >
            Return to Home
          </Button>
        </Box>
      </Paper>
    </Box>
  );
};

export default ResultsPage;
