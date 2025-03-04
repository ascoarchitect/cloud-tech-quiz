import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/auth";
import {
  Box,
  Typography,
  Button,
  Paper,
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  getTest,
  getQuestion,
  createResponse,
  updateResponse,
} from "../services/api";
import { TestType, QuestionType, AnswerType } from "../types";
import AntiCheatModule from "../utils/antiCheat";

const TestPage: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  // Test state
  const [test, setTest] = useState<TestType | null>(null);
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // User state
  const [userId, setUserId] = useState("");
  const [userName, setUserName] = useState("");

  // Test progress state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<AnswerType[]>([]);
  const [responseId, setResponseId] = useState("");
  const [remainingTime, setRemainingTime] = useState(0);
  const [testStarted, setTestStarted] = useState(false);

  // UI state
  const [selectedOption, setSelectedOption] = useState("");
  const [confirmEndDialog, setConfirmEndDialog] = useState(false);
  const [warning, setWarning] = useState("");

  // Anti-cheat reference
  const antiCheatRef = useRef<AntiCheatModule | null>(null);
  const questionStartTimeRef = useRef<number>(0);

  // Fetch test data and setup
  useEffect(() => {
    const fetchTestAndQuestions = async () => {
      if (!testId) {
        setError("Test ID is missing");
        setLoading(false);
        return;
      }

      try {
        // Get current user
        const userSession = await getCurrentUser();
        if (!userSession) {
          setError("User authentication failed");
          setLoading(false);
          return;
        }

        // Extract user info - note that we need to use the username from the session
        // and can use it as the userId as well (or any unique identifier)
        setUserId(userSession.getUsername());
        setUserName(userSession.getUsername());

        // Fetch test data
        const testData = await getTest(testId);

        if (!testData.active) {
          setError("This test is no longer active");
          setLoading(false);
          return;
        }

        // Check if test has expired
        if (testData.closureDate) {
          const closureDate = new Date(testData.closureDate);
          if (closureDate < new Date()) {
            setError(
              "This test is no longer available (closure date has passed)",
            );
            setLoading(false);
            return;
          }
        }

        setTest(testData);
        setRemainingTime(testData.timeLimit * 60); // Convert minutes to seconds

        // Fetch questions
        const questionPromises = testData.questions.map(async (questionId) => {
          try {
            const question = await getQuestion(questionId);
            return question;
          } catch (err) {
            console.error(`Error fetching question ${questionId}:`, err);
            return null;
          }
        });

        const fetchedQuestionsWithNulls = await Promise.all(questionPromises);

        // Filter out any null questions and ensure type safety
        const fetchedQuestions: QuestionType[] =
          fetchedQuestionsWithNulls.filter(
            (q): q is QuestionType => q !== null && q !== undefined,
          );

        // Randomize questions if enabled in test settings
        let processedQuestions = fetchedQuestions;
        if (testData.settings?.randomizeQuestions) {
          processedQuestions = shuffleArray([...processedQuestions]);
        }

        // Randomize options for each question if enabled
        if (testData.settings?.randomizeOptions) {
          processedQuestions = processedQuestions.map((q) => ({
            ...q,
            options: shuffleArray([...q.options]),
          }));
        }

        setQuestions(processedQuestions);

        // Initialize empty answers array
        const initialAnswers = processedQuestions.map((q) => ({
          questionId: q.id,
          selectedOption: "",
          correct: false,
          timeSpent: 0,
        }));

        setAnswers(initialAnswers);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching test:", err);
        setError("Failed to load test data");
        setLoading(false);
      }
    };

    fetchTestAndQuestions();
  }, [testId]);

  // Timer
  useEffect(() => {
    if (!testStarted || !test || remainingTime <= 0) return;

    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          endTest(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [testStarted, remainingTime]);

  // Start the test
  const startTest = async () => {
    if (!test || !userId) return;

    try {
      // Create initial response record
      const responseData = await createResponse({
        testId: testId!,
        userId,
        userName,
        startTime: new Date().toISOString(),
        answers: [],
        completed: false,
        cheatingAttempts: 0,
        cheatingDetails: [],
      });

      if (responseData && responseData.id) {
        setResponseId(responseData.id);
        setTestStarted(true);
        questionStartTimeRef.current = Date.now();

        // Initialize anti-cheat module
        antiCheatRef.current = new AntiCheatModule(
          handleCheatDetection,
          handleCheatWarning,
          { maxWarnings: 3 },
        );

        antiCheatRef.current.start();
      } else {
        throw new Error("Failed to create test response");
      }
    } catch (err) {
      console.error("Error starting test:", err);
      setError("Failed to start test");
    }
  };

  // Handle anti-cheat warning
  const handleCheatWarning = (reason: string) => {
    setWarning(reason);
  };

  // Handle detected cheating
  const handleCheatDetection = async (reason: string) => {
    if (!responseId) return;

    try {
      // Update response with cheating details
      await updateResponse({
        id: responseId,
        cheatingAttempts: 1,
        cheatingDetails: [reason],
        completed: true,
        endTime: new Date().toISOString(),
      });

      // Stop anti-cheat monitoring
      if (antiCheatRef.current) {
        antiCheatRef.current.stop();
      }

      // Navigate to results
      navigate(`/test/${testId}/results/${responseId}`);
    } catch (err) {
      console.error("Error handling cheat detection:", err);
    }
  };

  // Handle option selection
  const handleOptionSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedOption(event.target.value);

    // Update the answer for the current question
    const updatedAnswers = [...answers];
    updatedAnswers[currentQuestionIndex].selectedOption = event.target.value;

    // Record time spent on this question
    if (questionStartTimeRef.current > 0) {
      const timeSpent = Math.floor(
        (Date.now() - questionStartTimeRef.current) / 1000,
      );
      updatedAnswers[currentQuestionIndex].timeSpent = timeSpent;
    }

    setAnswers(updatedAnswers);
  };

  // Navigate to next question
  const nextQuestion = async () => {
    if (currentQuestionIndex < questions.length - 1) {
      // Save progress
      await saveProgress();

      // Move to next question
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedOption(answers[currentQuestionIndex + 1].selectedOption);

      // Reset question start time
      questionStartTimeRef.current = Date.now();
    }
  };

  // Navigate to previous question
  const prevQuestion = async () => {
    if (currentQuestionIndex > 0) {
      // Save progress
      await saveProgress();

      // Move to previous question
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedOption(answers[currentQuestionIndex - 1].selectedOption);

      // Reset question start time
      questionStartTimeRef.current = Date.now();
    }
  };

  // Save current progress
  const saveProgress = async () => {
    if (!responseId) return;

    try {
      await updateResponse({
        id: responseId,
        answers: answers,
      });
    } catch (err) {
      console.error("Error saving progress:", err);
    }
  };

  // End the test
  const endTest = async (_isTimeOut: boolean = false) => {
    if (!responseId || !test) return;

    // Record time spent on final question
    const updatedAnswers = [...answers];
    if (questionStartTimeRef.current > 0) {
      const timeSpent = Math.floor(
        (Date.now() - questionStartTimeRef.current) / 1000,
      );
      updatedAnswers[currentQuestionIndex].timeSpent = timeSpent;
    }

    try {
      // Mark answers as correct/incorrect
      const answersWithCorrectness = await Promise.all(
        updatedAnswers.map(async (answer) => {
          if (!answer.selectedOption) return answer;

          try {
            // Fetch the correct answer
            const question = await getQuestion(answer.questionId);
            const correctAnswer = question.correctAnswer;

            if (!correctAnswer) return answer;

            return {
              ...answer,
              correct: answer.selectedOption === correctAnswer,
            };
          } catch (err) {
            console.error(
              `Error getting correct answer for question ${answer.questionId}:`,
              err,
            );
            return answer;
          }
        }),
      );

      // Calculate score
      const answeredQuestions = answersWithCorrectness.filter(
        (a) => a.selectedOption,
      );
      const correctAnswers = answersWithCorrectness.filter((a) => a.correct);

      const score =
        answeredQuestions.length > 0
          ? (correctAnswers.length / answersWithCorrectness.length) * 100
          : 0;

      // Update response with final data
      await updateResponse({
        id: responseId,
        answers: answersWithCorrectness,
        score,
        completed: true,
        endTime: new Date().toISOString(),
      });

      // Stop anti-cheat monitoring
      if (antiCheatRef.current) {
        antiCheatRef.current.stop();
      }

      // Navigate to results
      navigate(`/test/${testId}/results/${responseId}`);
    } catch (err) {
      console.error("Error ending test:", err);
    }
  };

  // Format remaining time
  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? "0" : ""}${remainingSeconds}`;
  };

  // Utility function to shuffle array
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
  };

  // Handle errors and loading state
  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography variant="h5">Loading test...</Typography>
        <LinearProgress sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </Box>
    );
  }

  if (!test || questions.length === 0) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Alert severity="error" sx={{ mb: 2 }}>
          Test data could not be loaded
        </Alert>
        <Button variant="contained" onClick={() => navigate("/")}>
          Return to Home
        </Button>
      </Box>
    );
  }

  // Test introduction screen
  if (!testStarted) {
    return (
      <Box sx={{ p: 3, maxWidth: 800, mx: "auto" }}>
        <Paper sx={{ p: 3 }}>
          <Typography variant="h4" gutterBottom>
            {test.name}
          </Typography>

          {test.description && (
            <Typography variant="body1" paragraph>
              {test.description}
            </Typography>
          )}

          <Box sx={{ mt: 3 }}>
            <Typography variant="h6">Test Information:</Typography>
            <Typography>• Number of questions: {questions.length}</Typography>
            <Typography>• Time limit: {test.timeLimit} minutes</Typography>
            <Typography>• Difficulty: {test.difficulty.join(", ")}</Typography>

            <Typography variant="h6" sx={{ mt: 3 }}>
              Rules:
            </Typography>
            <Typography>
              • You must complete the test within the time limit
            </Typography>
            <Typography>
              • You cannot open other tabs or applications during the test
            </Typography>
            <Typography>
              • You cannot copy or paste content during the test
            </Typography>
            <Typography>
              • Navigating away from the test window may result in
              disqualification
            </Typography>

            {!test.settings?.allowRetake && (
              <Typography sx={{ mt: 2, fontWeight: "bold" }}>
                Note: You will not be able to retake this test once completed.
              </Typography>
            )}
          </Box>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={startTest}
            >
              Start Test
            </Button>
          </Box>
        </Paper>
      </Box>
    );
  }

  // Current question display
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1000, mx: "auto" }}>
      {/* Timer and progress indicator */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6">
          Question {currentQuestionIndex + 1} of {questions.length}
        </Typography>
        <Typography
          variant="h6"
          color={remainingTime < 300 ? "error" : "inherit"}
        >
          Time remaining: {formatTime(remainingTime)}
        </Typography>
      </Box>

      <LinearProgress
        variant="determinate"
        value={(currentQuestionIndex / questions.length) * 100}
        sx={{ mb: 3, height: 8, borderRadius: 2 }}
      />

      {/* Question */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          {currentQuestion.text}
        </Typography>

        <Box sx={{ mt: 3 }}>
          <RadioGroup value={selectedOption} onChange={handleOptionSelect}>
            {currentQuestion.options.map((option) => (
              <FormControlLabel
                key={option.id}
                value={option.id}
                control={<Radio />}
                label={
                  <Typography>
                    <strong>{option.id}.</strong> {option.text}
                  </Typography>
                }
                sx={{ mb: 1 }}
              />
            ))}
          </RadioGroup>
        </Box>
      </Paper>

      {/* Navigation buttons */}
      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 2 }}>
        <Button
          variant="outlined"
          onClick={prevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </Button>

        <Button
          variant="contained"
          color="error"
          onClick={() => setConfirmEndDialog(true)}
        >
          End Test
        </Button>

        {currentQuestionIndex < questions.length - 1 ? (
          <Button variant="contained" onClick={nextQuestion}>
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={() => setConfirmEndDialog(true)}
          >
            Submit Test
          </Button>
        )}
      </Box>

      {/* Confirmation dialog */}
      <Dialog
        open={confirmEndDialog}
        onClose={() => setConfirmEndDialog(false)}
      >
        <DialogTitle>
          {currentQuestionIndex < questions.length - 1
            ? "End Test Early?"
            : "Submit Test?"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {currentQuestionIndex < questions.length - 1
              ? `You still have ${questions.length - currentQuestionIndex - 1} questions remaining. Are you sure you want to end the test now?`
              : "Are you sure you want to submit your test? You won't be able to change your answers after submission."}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmEndDialog(false)}>Cancel</Button>
          <Button
            onClick={() => {
              setConfirmEndDialog(false);
              endTest();
            }}
            color="primary"
            variant="contained"
          >
            {currentQuestionIndex < questions.length - 1
              ? "End Test"
              : "Submit"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Warning snackbar */}
      <Snackbar
        open={!!warning}
        autoHideDuration={5000}
        onClose={() => setWarning("")}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="warning" onClose={() => setWarning("")}>
          {warning}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default TestPage;
