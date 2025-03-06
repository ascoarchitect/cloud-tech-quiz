import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from "uuid";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  FormControlLabel,
  OutlinedInput,
  Chip,
  ListItemText,
  FormHelperText,
  Switch,
  Alert,
  IconButton,
  Stepper,
  Step,
  StepLabel,
  Autocomplete,
  Divider,
  CircularProgress,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { createTest, listQuestions } from "../../services/api";
import { QuestionType } from "../../types";
import {
  CATEGORY_OPTIONS,
  DIFFICULTY_OPTIONS,
} from "../../constants/constants";

const AdminTestCreate: React.FC = () => {
  const navigate = useNavigate();

  // Basic test information
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [timeLimit, setTimeLimit] = useState(60);
  const [numQuestions, setNumQuestions] = useState(20);
  const [active, setActive] = useState<string>("true");
  const [closureDate, setClosureDate] = useState("");

  // Test settings
  const [allowRetake, setAllowRetake] = useState(false);
  const [randomizeQuestions, setRandomizeQuestions] = useState(true);
  const [randomizeOptions, setRandomizeOptions] = useState(true);
  const [showResultImmediately, setShowResultImmediately] = useState(true);

  // Test content settings
  const [selectedDifficulties, setSelectedDifficulties] = useState<string[]>([
    "SAA",
  ]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);

  // Question selection
  const [availableQuestions, setAvailableQuestions] = useState<QuestionType[]>(
    [],
  );
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionType[]>(
    [],
  );
  const [selectedQuestions, setSelectedQuestions] = useState<QuestionType[]>(
    [],
  );
  const [questionSelectionMethod, setQuestionSelectionMethod] =
    useState("random"); // 'random' or 'manual'
  const [manualSelectionTag, setManualSelectionTag] = useState("");
  const [questionFilterText, setQuestionFilterText] = useState("");

  // UI state
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [questionsLoading, setQuestionsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [testCreated, setTestCreated] = useState<{
    id: string;
    url: string;
  } | null>(null);

  // Validation
  const [nameError, setNameError] = useState("");
  const [numQuestionsError, setNumQuestionsError] = useState("");
  const [timeLimitError, setTimeLimitError] = useState("");
  const [categoriesError, setCategoriesError] = useState("");
  const [selectedQuestionsError, setSelectedQuestionsError] = useState("");

  // Steps
  const steps = [
    "Basic Information",
    "Test Settings",
    "Question Selection",
    "Review & Create",
  ];

  // Fetch available questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Filter questions when filter criteria change
  useEffect(() => {
    if (availableQuestions.length > 0) {
      filterQuestions();
    }
  }, [
    selectedDifficulties,
    selectedCategories,
    availableQuestions,
    questionFilterText,
  ]);

  // Fetch questions from API
  const fetchQuestions = async () => {
    setQuestionsLoading(true);
    try {
      let allQuestions: QuestionType[] = [];
      let nextToken: string | undefined = undefined;
      let hasMore = true;

      // Loop until we've fetched all questions
      while (hasMore) {
        const result = await listQuestions({
          limit: 100, // Keep each request reasonable
          nextToken: nextToken,
          filter: {}, // Add any base filters here if needed
        });

        // Add the current batch to our collection
        const questionsBatch = result.items || [];
        allQuestions = [...allQuestions, ...questionsBatch];

        // Check if there are more questions to fetch
        nextToken = result.nextToken || undefined;
        hasMore = !!nextToken;
      }

      setAvailableQuestions(allQuestions);
      setFilteredQuestions(allQuestions);
      setQuestionsLoading(false);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setQuestionsLoading(false);
    }
  };

  // Filter questions based on selected criteria
  const filterQuestions = () => {
    const filtered = availableQuestions.filter((question) => {
      // Filter by difficulty
      if (
        selectedDifficulties.length > 0 &&
        !selectedDifficulties.includes(question.difficulty)
      ) {
        return false;
      }

      // Filter by category
      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(question.category)
      ) {
        return false;
      }

      // Filter by text search
      if (questionFilterText) {
        const searchText = questionFilterText.toLowerCase();
        const questionText = question.text.toLowerCase();

        // Check if question text includes search text
        if (!questionText.includes(searchText)) {
          // Check if any tags include search text
          const tagMatch = question.tags?.some((tag) =>
            tag.toLowerCase().includes(searchText),
          );

          if (!tagMatch) {
            return false;
          }
        }
      }

      return true;
    });

    setFilteredQuestions(filtered);
  };

  // Add a question to the selected questions list
  const addQuestion = (question: QuestionType) => {
    if (selectedQuestions.find((q) => q.id === question.id)) {
      return; // Question already selected
    }

    setSelectedQuestions([...selectedQuestions, question]);
  };

  // Remove a question from the selected questions list
  const removeQuestion = (questionId: string) => {
    setSelectedQuestions(selectedQuestions.filter((q) => q.id !== questionId));
  };

  // Handle random selection of questions
  const selectRandomQuestions = () => {
    if (filteredQuestions.length === 0) {
      setSelectedQuestionsError(
        "No questions match your criteria. Please adjust the difficulty or category filters.",
      );
      return;
    }

    if (filteredQuestions.length < numQuestions) {
      setSelectedQuestionsError(
        `Only ${filteredQuestions.length} questions match your criteria. Please reduce the number of questions or adjust the filters.`,
      );
      return;
    }

    setSelectedQuestionsError("");

    // Shuffle the filtered questions and take the first numQuestions
    const shuffled = [...filteredQuestions].sort(() => 0.5 - Math.random());
    setSelectedQuestions(shuffled.slice(0, numQuestions));
  };

  // Validate the current step
  const validateCurrentStep = (): boolean => {
    let isValid = true;

    // Reset all error messages
    setNameError("");
    setNumQuestionsError("");
    setTimeLimitError("");
    setCategoriesError("");
    setSelectedQuestionsError("");

    if (activeStep === 0) {
      // Validate basic information
      if (!name.trim()) {
        setNameError("Test name is required");
        isValid = false;
      }

      if (numQuestions <= 0) {
        setNumQuestionsError("Number of questions must be greater than 0");
        isValid = false;
      }

      if (timeLimit <= 0) {
        setTimeLimitError("Time limit must be greater than 0");
        isValid = false;
      }

      if (closureDate && new Date(closureDate) < new Date()) {
        setError("Closure date cannot be in the past");
        isValid = false;
      }
    } else if (activeStep === 1) {
      // Validate test settings
      if (selectedCategories.length === 0) {
        setCategoriesError("Please select at least one category");
        isValid = false;
      }
    } else if (activeStep === 2) {
      // Validate question selection
      if (questionSelectionMethod === "random") {
        if (filteredQuestions.length < numQuestions) {
          setSelectedQuestionsError(
            `Only ${filteredQuestions.length} questions match your criteria. Please reduce the number of questions or adjust the filters.`,
          );
          isValid = false;
        }
      } else if (questionSelectionMethod === "manual") {
        if (selectedQuestions.length !== numQuestions) {
          setSelectedQuestionsError(
            `Please select exactly ${numQuestions} questions (currently selected: ${selectedQuestions.length})`,
          );
          isValid = false;
        }
      }
    }

    return isValid;
  };

  // Handle next step
  const handleNext = () => {
    if (validateCurrentStep()) {
      if (activeStep === 2 && questionSelectionMethod === "random") {
        selectRandomQuestions();
      }

      setActiveStep(activeStep + 1);
      setError("");
    }
  };

  // Handle back step
  const handleBack = () => {
    setActiveStep(activeStep - 1);
    setError("");
  };

  // Create the test
  const createNewTest = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const questionIds = selectedQuestions.map((q) => q.id);

      // Create new test
      const testId = uuidv4();
      const testInput = {
        id: testId,
        name,
        description,
        timeLimit,
        numQuestions,
        difficulty: selectedDifficulties,
        categories: selectedCategories,
        active,
        closureDate: closureDate
          ? new Date(closureDate).toISOString()
          : undefined,
        questions: questionIds,
        settings: {
          allowRetake,
          randomizeQuestions,
          randomizeOptions,
          showResultImmediately,
        },
      };

      await createTest(testInput);

      setSuccess(true);
      setTestCreated({
        id: testId,
        url: `${window.location.origin}/test/${testId}/take`,
      });
      setLoading(false);
    } catch (err) {
      console.error("Error creating test:", err);
      setError("Failed to create test. Please try again.");
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h4" gutterBottom>
          Create New Test
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Error message */}
        {error && (
          <Alert
            severity="error"
            sx={{ mb: 3 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setError("")}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            {error}
          </Alert>
        )}

        {/* Success message */}
        {success && testCreated && (
          <Alert
            severity="success"
            sx={{ mb: 3 }}
            action={
              <IconButton
                aria-label="close"
                color="inherit"
                size="small"
                onClick={() => setSuccess(false)}
              >
                <CloseIcon fontSize="inherit" />
              </IconButton>
            }
          >
            <Typography variant="body1">Test created successfully!</Typography>
            <Box sx={{ mt: 1 }}>
              <Typography variant="body2">Test ID: {testCreated.id}</Typography>
              <Typography variant="body2">
                Test URL:{" "}
                <a
                  href={testCreated.url}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {testCreated.url}
                </a>
              </Typography>
            </Box>
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                size="small"
                onClick={() => navigate(`/admin/tests/${testCreated.id}`)}
              >
                View Test Details
              </Button>
              <Button
                variant="text"
                size="small"
                onClick={() => {
                  setTestCreated(null);
                  setSuccess(false);
                  navigate("/admin");
                }}
                sx={{ ml: 1 }}
              >
                Return to Dashboard
              </Button>
            </Box>
          </Alert>
        )}

        {/* Step content */}
        <Box sx={{ minHeight: 300 }}>
          {/* Step 1: Basic Information */}
          {activeStep === 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <TextField
                  label="Test Name"
                  variant="outlined"
                  fullWidth
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  error={!!nameError}
                  helperText={nameError}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  variant="outlined"
                  fullWidth
                  multiline
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  helperText="Provide a brief description of the test (optional)"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Number of Questions"
                  variant="outlined"
                  fullWidth
                  type="number"
                  required
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!numQuestionsError}
                  helperText={
                    numQuestionsError ||
                    "How many questions should be in the test"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Time Limit (minutes)"
                  variant="outlined"
                  fullWidth
                  type="number"
                  required
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(Number(e.target.value))}
                  InputProps={{ inputProps: { min: 1 } }}
                  error={!!timeLimitError}
                  helperText={
                    timeLimitError ||
                    "How long the test should last (in minutes)"
                  }
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={active === "true"}
                      onChange={(e) =>
                        setActive(e.target.checked ? "true" : "false")
                      }
                      color="primary"
                    />
                  }
                  label="Test Active"
                />
                <FormHelperText>
                  If unchecked, the test will be created but not accessible to
                  users
                </FormHelperText>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Closure Date (Optional)"
                  variant="outlined"
                  fullWidth
                  type="datetime-local"
                  value={closureDate}
                  onChange={(e) => setClosureDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                  helperText="If set, users won't be able to access the test after this date"
                />
              </Grid>
            </Grid>
          )}

          {/* Step 2: Test Settings */}
          {activeStep === 1 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Difficulty & Categories
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="difficulty-select-label">
                    Difficulty Level(s)
                  </InputLabel>
                  <Select
                    labelId="difficulty-select-label"
                    multiple
                    value={selectedDifficulties}
                    onChange={(e) =>
                      setSelectedDifficulties(e.target.value as string[])
                    }
                    input={<OutlinedInput label="Difficulty Level(s)" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {DIFFICULTY_OPTIONS.map((difficulty) => (
                      <MenuItem key={difficulty} value={difficulty}>
                        <Checkbox
                          checked={
                            selectedDifficulties.indexOf(difficulty) > -1
                          }
                        />
                        <ListItemText primary={difficulty} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    CP = Cloud Practitioner, SAA = Solutions Architect
                    Associate, etc.
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth error={!!categoriesError}>
                  <InputLabel id="categories-select-label">
                    Categories
                  </InputLabel>
                  <Select
                    labelId="categories-select-label"
                    multiple
                    value={selectedCategories}
                    onChange={(e) =>
                      setSelectedCategories(e.target.value as string[])
                    }
                    input={<OutlinedInput label="Categories" />}
                    renderValue={(selected) => (
                      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                        {selected.map((value) => (
                          <Chip key={value} label={value} />
                        ))}
                      </Box>
                    )}
                  >
                    {CATEGORY_OPTIONS.map((category) => (
                      <MenuItem key={category} value={category}>
                        <Checkbox
                          checked={selectedCategories.indexOf(category) > -1}
                        />
                        <ListItemText primary={category} />
                      </MenuItem>
                    ))}
                  </Select>
                  <FormHelperText>
                    {categoriesError ||
                      "Select categories that should be included in the test"}
                  </FormHelperText>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Divider sx={{ my: 2 }} />
                <Typography variant="h6" gutterBottom>
                  Test Behavior
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={randomizeQuestions}
                      onChange={(e) => setRandomizeQuestions(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Randomize Questions"
                />
                <FormHelperText>
                  If enabled, questions will be presented in random order to
                  each test taker
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={randomizeOptions}
                      onChange={(e) => setRandomizeOptions(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Randomize Answer Options"
                />
                <FormHelperText>
                  If enabled, answer options will be presented in random order
                  for each question
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={showResultImmediately}
                      onChange={(e) =>
                        setShowResultImmediately(e.target.checked)
                      }
                      color="primary"
                    />
                  }
                  label="Show Results Immediately"
                />
                <FormHelperText>
                  If enabled, test takers will see their results immediately
                  after submission
                </FormHelperText>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControlLabel
                  control={
                    <Switch
                      checked={allowRetake}
                      onChange={(e) => setAllowRetake(e.target.checked)}
                      color="primary"
                    />
                  }
                  label="Allow Retakes"
                />
                <FormHelperText>
                  If enabled, test takers can take the test multiple times
                </FormHelperText>
              </Grid>
            </Grid>
          )}

          {/* Step 3: Question Selection */}
          {activeStep === 2 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <FormControl component="fieldset">
                  <Typography variant="h6" gutterBottom>
                    Selection Method
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={questionSelectionMethod === "random"}
                            onChange={() =>
                              setQuestionSelectionMethod("random")
                            }
                            color="primary"
                          />
                        }
                        label="Random Selection"
                      />
                    </Grid>
                    <Grid item>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={questionSelectionMethod === "manual"}
                            onChange={() =>
                              setQuestionSelectionMethod("manual")
                            }
                            color="primary"
                          />
                        }
                        label="Manual Selection"
                      />
                    </Grid>
                  </Grid>
                  <FormHelperText>
                    {questionSelectionMethod === "random"
                      ? `${numQuestions} questions will be randomly selected from the question bank based on your filters`
                      : "You will manually select specific questions for the test"}
                  </FormHelperText>
                </FormControl>
              </Grid>

              {questionSelectionMethod === "manual" && (
                <>
                  <Grid item xs={12}>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <TextField
                        label="Search Questions"
                        variant="outlined"
                        fullWidth
                        value={questionFilterText}
                        onChange={(e) => setQuestionFilterText(e.target.value)}
                        placeholder="Search by question text or tag"
                      />
                      <Autocomplete
                        options={Array.from(
                          new Set(
                            availableQuestions.flatMap((q) => q.tags || []),
                          ),
                        ).sort((a, b) => a.localeCompare(b))}
                        value={manualSelectionTag}
                        onChange={(_, newValue) => {
                          setManualSelectionTag(newValue || "");
                          if (newValue) {
                            setQuestionFilterText(newValue);
                          }
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label="Filter by tag"
                            variant="outlined"
                          />
                        )}
                        sx={{ minWidth: 200 }}
                      />
                    </Box>
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Available Questions ({filteredQuestions.length})
                    </Typography>

                    {questionsLoading ? (
                      <Box
                        sx={{ display: "flex", justifyContent: "center", p: 3 }}
                      >
                        <CircularProgress />
                      </Box>
                    ) : (
                      <Paper
                        variant="outlined"
                        sx={{
                          height: 400,
                          overflow: "auto",
                          p: 2,
                          borderColor:
                            filteredQuestions.length < numQuestions
                              ? "error.main"
                              : "inherit",
                        }}
                      >
                        {filteredQuestions.length > 0 ? (
                          filteredQuestions
                            .filter(
                              (q) =>
                                !selectedQuestions.some((sq) => sq.id === q.id),
                            )
                            .map((question) => (
                              <Box
                                key={question.id}
                                sx={{
                                  mb: 2,
                                  p: 2,
                                  border: "1px solid #e0e0e0",
                                  borderRadius: 1,
                                  "&:hover": {
                                    bgcolor: "action.hover",
                                    cursor: "pointer",
                                  },
                                }}
                                onClick={() => addQuestion(question)}
                              >
                                <Typography variant="body2" gutterBottom>
                                  {question.text.length > 150
                                    ? `${question.text.substring(0, 150)}...`
                                    : question.text}
                                </Typography>
                                <Box
                                  sx={{
                                    display: "flex",
                                    gap: 1,
                                    flexWrap: "wrap",
                                    mt: 1,
                                  }}
                                >
                                  <Chip
                                    label={question.difficulty}
                                    size="small"
                                    color="primary"
                                    variant="outlined"
                                  />
                                  <Chip
                                    label={question.category}
                                    size="small"
                                    variant="outlined"
                                  />
                                  {question.tags?.map((tag) => (
                                    <Chip
                                      key={tag}
                                      label={tag}
                                      size="small"
                                      variant="outlined"
                                    />
                                  ))}
                                </Box>
                              </Box>
                            ))
                        ) : (
                          <Typography
                            color="textSecondary"
                            sx={{ textAlign: "center", mt: 2 }}
                          >
                            No questions match your filter criteria
                          </Typography>
                        )}
                      </Paper>
                    )}
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      Selected Questions ({selectedQuestions.length}/
                      {numQuestions})
                    </Typography>

                    <Paper
                      variant="outlined"
                      sx={{
                        height: 400,
                        overflow: "auto",
                        p: 2,
                        borderColor:
                          selectedQuestions.length !== numQuestions
                            ? "error.main"
                            : "success.main",
                      }}
                    >
                      {selectedQuestions.length > 0 ? (
                        selectedQuestions.map((question, index) => (
                          <Box
                            key={question.id}
                            sx={{
                              mb: 2,
                              p: 2,
                              border: "1px solid #e0e0e0",
                              borderRadius: 1,
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "flex-start",
                            }}
                          >
                            <Box>
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                {index + 1}.{" "}
                                {question.text.length > 150
                                  ? `${question.text.substring(0, 150)}...`
                                  : question.text}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                  mt: 1,
                                }}
                              >
                                <Chip
                                  label={question.difficulty}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  label={question.category}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                            <IconButton
                              size="small"
                              onClick={() => removeQuestion(question.id)}
                              color="error"
                            >
                              <CloseIcon />
                            </IconButton>
                          </Box>
                        ))
                      ) : (
                        <Typography
                          color="textSecondary"
                          sx={{ textAlign: "center", mt: 2 }}
                        >
                          No questions selected yet
                        </Typography>
                      )}
                    </Paper>

                    {selectedQuestionsError && (
                      <Typography color="error" variant="body2" sx={{ mt: 1 }}>
                        {selectedQuestionsError}
                      </Typography>
                    )}
                  </Grid>
                </>
              )}

              {questionSelectionMethod === "random" && (
                <Grid item xs={12}>
                  <Alert severity="info" sx={{ mb: 2 }}>
                    <Typography variant="body2">
                      Questions will be randomly selected from{" "}
                      {filteredQuestions.length} available questions that match
                      your filters:
                    </Typography>
                    <Box
                      sx={{ display: "flex", gap: 1, flexWrap: "wrap", mt: 1 }}
                    >
                      {selectedDifficulties.map((diff) => (
                        <Chip
                          key={diff}
                          label={diff}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      ))}
                      {selectedCategories.map((cat) => (
                        <Chip
                          key={cat}
                          label={cat}
                          size="small"
                          variant="outlined"
                        />
                      ))}
                    </Box>
                  </Alert>

                  {filteredQuestions.length < numQuestions && (
                    <Alert severity="error">
                      Only {filteredQuestions.length} questions match your
                      criteria, but you need {numQuestions} questions. Please
                      adjust your filters or reduce the number of questions.
                    </Alert>
                  )}

                  <Box sx={{ mt: 3 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      Sample Questions (Preview of 5 random questions)
                    </Typography>

                    <Paper
                      variant="outlined"
                      sx={{ p: 2, maxHeight: 400, overflow: "auto" }}
                    >
                      {filteredQuestions.length > 0 ? (
                        [...filteredQuestions]
                          .sort(() => 0.5 - Math.random()) // Shuffle
                          .slice(0, 5) // Take 5 random questions
                          .map((question, index) => (
                            <Box
                              key={question.id}
                              sx={{
                                mb: 2,
                                p: 2,
                                border: "1px solid #e0e0e0",
                                borderRadius: 1,
                              }}
                            >
                              <Typography
                                variant="body2"
                                sx={{ fontWeight: "medium" }}
                              >
                                {index + 1}. {question.text}
                              </Typography>
                              <Box
                                sx={{
                                  display: "flex",
                                  gap: 1,
                                  flexWrap: "wrap",
                                  mt: 1,
                                }}
                              >
                                <Chip
                                  label={question.difficulty}
                                  size="small"
                                  color="primary"
                                  variant="outlined"
                                />
                                <Chip
                                  label={question.category}
                                  size="small"
                                  variant="outlined"
                                />
                              </Box>
                            </Box>
                          ))
                      ) : (
                        <Typography
                          color="textSecondary"
                          sx={{ textAlign: "center", p: 2 }}
                        >
                          No questions match your filter criteria
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                </Grid>
              )}
            </Grid>
          )}

          {/* Step 4: Review & Create */}
          {activeStep === 3 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Typography variant="h6" gutterBottom>
                  Test Summary
                </Typography>

                <Paper variant="outlined" sx={{ p: 3 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">Test Name</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {name}
                      </Typography>

                      <Typography variant="subtitle2">Description</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {description || "(No description provided)"}
                      </Typography>

                      <Typography variant="subtitle2">Time Limit</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {timeLimit} minutes
                      </Typography>

                      <Typography variant="subtitle2">Questions</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {numQuestions} questions
                      </Typography>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Typography variant="subtitle2">
                        Difficulty Levels
                      </Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 2,
                        }}
                      >
                        {selectedDifficulties.map((diff) => (
                          <Chip
                            key={diff}
                            label={diff}
                            size="small"
                            color="primary"
                          />
                        ))}
                      </Box>

                      <Typography variant="subtitle2">Categories</Typography>
                      <Box
                        sx={{
                          display: "flex",
                          gap: 1,
                          flexWrap: "wrap",
                          mb: 2,
                        }}
                      >
                        {selectedCategories.map((cat) => (
                          <Chip key={cat} label={cat} size="small" />
                        ))}
                      </Box>

                      <Typography variant="subtitle2">Status</Typography>
                      <Chip
                        label={active === "true" ? "Active" : "Inactive"}
                        color={active === "true" ? "success" : "error"}
                        size="small"
                        sx={{ mb: 2 }}
                      />

                      <Typography variant="subtitle2">Closure Date</Typography>
                      <Typography variant="body1" sx={{ mb: 2 }}>
                        {closureDate
                          ? new Date(closureDate).toLocaleString()
                          : "No closure date set"}
                      </Typography>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Test Settings
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Checkbox
                          checked={randomizeQuestions}
                          disabled
                          size="small"
                        />
                        <Typography variant="body2">
                          Randomize Questions
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Checkbox
                          checked={randomizeOptions}
                          disabled
                          size="small"
                        />
                        <Typography variant="body2">
                          Randomize Answer Options
                        </Typography>
                      </Box>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", mb: 1 }}
                      >
                        <Checkbox
                          checked={showResultImmediately}
                          disabled
                          size="small"
                        />
                        <Typography variant="body2">
                          Show Results Immediately
                        </Typography>
                      </Box>

                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <Checkbox checked={allowRetake} disabled size="small" />
                        <Typography variant="body2">Allow Retakes</Typography>
                      </Box>
                    </Grid>
                  </Grid>

                  <Divider sx={{ my: 2 }} />

                  <Typography variant="subtitle1" sx={{ mb: 1 }}>
                    Question Selection
                  </Typography>
                  <Typography variant="body2">
                    {questionSelectionMethod === "random"
                      ? `${numQuestions} questions will be randomly selected from ${filteredQuestions.length} matching questions`
                      : `${selectedQuestions.length} questions manually selected`}
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Box>

        {/* Navigation buttons */}
        <Box sx={{ display: "flex", justifyContent: "space-between", mt: 4 }}>
          <Button
            variant="outlined"
            onClick={activeStep === 0 ? () => navigate("/admin") : handleBack}
          >
            {activeStep === 0 ? "Cancel" : "Back"}
          </Button>

          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={createNewTest}
              disabled={loading}
            >
              {loading ? "Creating..." : "Create Test"}
            </Button>
          ) : (
            <Button variant="contained" onClick={handleNext}>
              Next
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  );
};

export default AdminTestCreate;
