import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tooltip,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormLabel,
} from "@mui/material";
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  CloudUpload as CloudUploadIcon,
  Search as SearchIcon,
  Clear as ClearIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  AddCircleOutline as AddOptionIcon,
  RemoveCircleOutline as RemoveOptionIcon,
} from "@mui/icons-material";
import {
  createQuestion,
  updateQuestion,
  deleteQuestion,
  listQuestions,
  validateImportQuestions,
  importQuestions,
} from "../../services/api";
import { QuestionType, OptionType } from "../../types";

// Define difficulty options
const DIFFICULTY_OPTIONS = ["CP", "SAA", "DEV", "OPS", "PRO", "TF"];

// Define category options based on AWS exam categories
const CATEGORY_OPTIONS = [
  "Compute",
  "Analytics",
  "Storage",
  "Database",
  "Networking",
  "Security",
  "Disaster Recovery & Resilience",
  "Cost Optimization",
  "Application Integration",
  "Serverless",
  "Migration",
  "Machine Learning",
  "IAM",
  "Containers",
  "Monitoring",
  "Developer Tools",
  "Management & Governance",
  "End User Computing",
  "Quantum Technologies",
  "General",
  "Other",
  "Terraform"
];

const AdminQuestionManagement: React.FC = () => {
  // State for question list
  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [filteredQuestions, setFilteredQuestions] = useState<QuestionType[]>(
    [],
  );
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // State for filtering
  const [filterText, setFilterText] = useState("");
  const [filterDifficulty, setFilterDifficulty] = useState<string>("");
  const [filterCategory, setFilterCategory] = useState<string>("");

  // State for adding/editing question
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState<QuestionType | null>(
    null,
  );
  const [questionText, setQuestionText] = useState("");
  const [questionOptions, setQuestionOptions] = useState<OptionType[]>([
    { id: "A", text: "" },
    { id: "B", text: "" },
    { id: "C", text: "" },
    { id: "D", text: "" },
  ]);
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [questionExplanation, setQuestionExplanation] = useState("");
  const [questionCategory, setQuestionCategory] = useState("");
  const [questionDifficulty, setQuestionDifficulty] = useState("");
  const [questionTags, setQuestionTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");

  // State for import dialog
  const [showImportDialog, setShowImportDialog] = useState(false);
  const [importJson, setImportJson] = useState("");
  const [importFile, setImportFile] = useState<File | null>(null);
  const [importValidationResults, setImportValidationResults] = useState<{
    valid: boolean;
    errors: string[];
  } | null>(null);
  const [importLoading, setImportLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for delete dialog
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteQuestionId, setDeleteQuestionId] = useState<string | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for notifications
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error" | "info" | "warning";
  }>({
    open: false,
    message: "",
    severity: "info",
  });

  // Fetch questions on component mount
  useEffect(() => {
    fetchQuestions();
  }, []);

  // Apply filters when filter criteria change
  useEffect(() => {
    applyFilters();
  }, [questions, filterText, filterDifficulty, filterCategory]);

  // Fetch questions from API
  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const result = await listQuestions({ limit: 1000 });

      const questionsData = result.items;
      setQuestions(questionsData);
      setFilteredQuestions(questionsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching questions:", err);
      setLoading(false);
      showSnackbar("Failed to load questions", "error");
    }
  };

  // Apply filters to questions
  const applyFilters = () => {
    let filtered = [...questions];

    // Filter by text search
    if (filterText) {
      const searchText = filterText.toLowerCase();
      filtered = filtered.filter((question) => {
        const questionText = question.text.toLowerCase();
        const questionTags =
          question.tags?.map((tag) => tag.toLowerCase()) || [];

        // Check if question text includes search text
        if (questionText.includes(searchText)) {
          return true;
        }

        // Check if any tags include search text
        if (questionTags.some((tag) => tag.includes(searchText))) {
          return true;
        }

        return false;
      });
    }

    // Filter by difficulty
    if (filterDifficulty) {
      filtered = filtered.filter(
        (question) => question.difficulty === filterDifficulty,
      );
    }

    // Filter by category
    if (filterCategory) {
      filtered = filtered.filter(
        (question) => question.category === filterCategory,
      );
    }

    setFilteredQuestions(filtered);
    setPage(0); // Reset to first page after filtering
  };

  // Reset filters
  const resetFilters = () => {
    setFilterText("");
    setFilterDifficulty("");
    setFilterCategory("");
  };

  // Show question form for adding
  const handleAddQuestion = () => {
    setIsEditing(false);
    setCurrentQuestion(null);
    setQuestionText("");
    setQuestionOptions([
      { id: "A", text: "" },
      { id: "B", text: "" },
      { id: "C", text: "" },
      { id: "D", text: "" },
    ]);
    setCorrectAnswer("");
    setQuestionExplanation("");
    setQuestionCategory("");
    setQuestionDifficulty("");
    setQuestionTags([]);
    setNewTag("");
    setShowQuestionForm(true);
  };

  // Show question form for editing
  const handleEditQuestion = (question: QuestionType) => {
    setIsEditing(true);
    setCurrentQuestion(question);
    setQuestionText(question.text);
    setQuestionOptions(question.options);
    setCorrectAnswer(question.correctAnswer);
    setQuestionExplanation(question.explanation);
    setQuestionCategory(question.category);
    setQuestionDifficulty(question.difficulty);
    setQuestionTags(question.tags || []);
    setNewTag("");
    setShowQuestionForm(true);
  };

  // Show delete confirmation dialog
  const handleDeleteQuestion = (questionId: string) => {
    setDeleteQuestionId(questionId);
    setShowDeleteDialog(true);
  };

  // Handle option text change
  const handleOptionChange = (index: number, text: string) => {
    const updatedOptions = [...questionOptions];
    updatedOptions[index].text = text;
    setQuestionOptions(updatedOptions);
  };

  // Add an option
  const handleAddOption = () => {
    // Generate the next option ID (A, B, C, ..., Z)
    const nextId = String.fromCharCode(65 + questionOptions.length);
    setQuestionOptions([...questionOptions, { id: nextId, text: "" }]);
  };

  // Remove an option
  const handleRemoveOption = (index: number) => {
    // Ensure we have at least 2 options
    if (questionOptions.length <= 2) {
      showSnackbar("Questions must have at least 2 options", "warning");
      return;
    }

    const updatedOptions = [...questionOptions];
    updatedOptions.splice(index, 1);

    // If the correct answer was removed, reset it
    if (correctAnswer === questionOptions[index].id) {
      setCorrectAnswer("");
    }

    setQuestionOptions(updatedOptions);
  };

  // Add a tag
  const handleAddTag = () => {
    if (!newTag.trim()) return;

    // Don't add duplicate tags
    if (questionTags.includes(newTag.trim())) {
      showSnackbar("Tag already exists", "warning");
      return;
    }

    setQuestionTags([...questionTags, newTag.trim()]);
    setNewTag("");
  };

  // Remove a tag
  const handleRemoveTag = (tagToRemove: string) => {
    setQuestionTags(questionTags.filter((tag) => tag !== tagToRemove));
  };

  // Validate question form
  const validateQuestionForm = (): boolean => {
    if (!questionText.trim()) {
      showSnackbar("Question text is required", "error");
      return false;
    }

    // Check if all options have text
    if (questionOptions.some((option) => !option.text.trim())) {
      showSnackbar("All options must have text", "error");
      return false;
    }

    if (!correctAnswer) {
      showSnackbar("You must select a correct answer", "error");
      return false;
    }

    if (!questionExplanation.trim()) {
      showSnackbar("Explanation is required", "error");
      return false;
    }

    if (!questionCategory) {
      showSnackbar("Category is required", "error");
      return false;
    }

    if (!questionDifficulty) {
      showSnackbar("Difficulty is required", "error");
      return false;
    }

    return true;
  };

  // Save question (create or update)
  const handleSaveQuestion = async () => {
    if (!validateQuestionForm()) return;

    setLoading(true);
    try {
      const questionInput = {
        text: questionText.trim(),
        options: questionOptions,
        correctAnswer,
        explanation: questionExplanation.trim(),
        category: questionCategory,
        difficulty: questionDifficulty,
        tags: questionTags,
      };

      if (isEditing && currentQuestion) {
        // Update existing question
        await updateQuestion({
          id: currentQuestion.id,
          ...questionInput,
        });

        showSnackbar("Question updated successfully", "success");
      } else {
        // Create new question
        await createQuestion(questionInput);

        showSnackbar("Question created successfully", "success");
      }

      // Refresh questions list
      await fetchQuestions();
      setShowQuestionForm(false);
    } catch (err) {
      console.error("Error saving question:", err);
      showSnackbar("Failed to save question", "error");
    } finally {
      setLoading(false);
    }
  };

  // Confirm and execute question deletion
  const confirmDeleteQuestion = async () => {
    if (!deleteQuestionId) return;

    setDeleteLoading(true);
    try {
      await deleteQuestion(deleteQuestionId);

      // Refresh questions list
      await fetchQuestions();
      showSnackbar("Question deleted successfully", "success");
      setShowDeleteDialog(false);
    } catch (err) {
      console.error("Error deleting question:", err);
      showSnackbar("Failed to delete question", "error");
    } finally {
      setDeleteLoading(false);
    }
  };

  // Handle file selection for import
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImportFile(file);

      // Read file content
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        setImportJson(content);
      };
      reader.readAsText(file);
    }
  };

  // Validate import JSON
  const validateImportJson = async () => {
    setImportLoading(true);
    setImportValidationResults(null);

    try {
      // Parse JSON
      const parsedJson = JSON.parse(importJson);

      // Validate structure
      if (!parsedJson.questions || !Array.isArray(parsedJson.questions)) {
        setImportValidationResults({
          valid: false,
          errors: ['Invalid JSON structure. Expected a "questions" array.'],
        });
        setImportLoading(false);
        return;
      }

      // Call validate import API
      const result = await validateImportQuestions(parsedJson.questions);
      setImportValidationResults(result);
    } catch (err) {
      console.error("Error validating import:", err);
      setImportValidationResults({
        valid: false,
        errors: [
          "Failed to validate import: " +
            ((err as Error).message || "Unknown error"),
        ],
      });
    } finally {
      setImportLoading(false);
    }
  };

  // Execute import
  const executeImport = async () => {
    if (!importValidationResults?.valid) return;

    setImportLoading(true);
    try {
      // Parse JSON
      const parsedJson = JSON.parse(importJson);

      // Call import questions API
      const importResult = await importQuestions(parsedJson.questions);

      if (importResult.success) {
        showSnackbar(
          `Successfully imported ${importResult.importedCount} questions`,
          "success",
        );
        setShowImportDialog(false);

        // Refresh questions list
        await fetchQuestions();
      } else {
        setImportValidationResults({
          valid: false,
          errors: importResult.errors || ["Failed to import questions"],
        });
      }
    } catch (err) {
      console.error("Error importing questions:", err);
      setImportValidationResults({
        valid: false,
        errors: [
          "Failed to import: " + ((err as Error).message || "Unknown error"),
        ],
      });
    } finally {
      setImportLoading(false);
    }
  };

  // Pagination handlers
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Show snackbar notification
  const showSnackbar = (
    message: string,
    severity: "success" | "error" | "info" | "warning",
  ) => {
    setSnackbar({
      open: true,
      message,
      severity,
    });
  };

  // Close snackbar
  const handleCloseSnackbar = () => {
    setSnackbar({
      ...snackbar,
      open: false,
    });
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Question Management
      </Typography>

      {/* Action buttons */}
      <Box sx={{ mb: 3, display: "flex", gap: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleAddQuestion}
        >
          Add Question
        </Button>
        <Button
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          onClick={() => setShowImportDialog(true)}
        >
          Import Questions
        </Button>
      </Box>

      {/* Filter controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Filters
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={4}>
            <TextField
              label="Search Questions"
              variant="outlined"
              fullWidth
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              InputProps={{
                endAdornment: filterText ? (
                  <IconButton size="small" onClick={() => setFilterText("")}>
                    <ClearIcon fontSize="small" />
                  </IconButton>
                ) : (
                  <SearchIcon color="action" fontSize="small" />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-difficulty-label">Difficulty</InputLabel>
              <Select
                labelId="filter-difficulty-label"
                value={filterDifficulty}
                onChange={(e) => setFilterDifficulty(e.target.value)}
                label="Difficulty"
              >
                <MenuItem value="">All Difficulties</MenuItem>
                {DIFFICULTY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={3}>
            <FormControl fullWidth variant="outlined">
              <InputLabel id="filter-category-label">Category</InputLabel>
              <Select
                labelId="filter-category-label"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {CATEGORY_OPTIONS.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={2}>
            <Button
              variant="outlined"
              fullWidth
              onClick={resetFilters}
              startIcon={<ClearIcon />}
            >
              Clear
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Questions table */}
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell width="50%">Question</TableCell>
                <TableCell width="15%">Category</TableCell>
                <TableCell width="15%">Difficulty</TableCell>
                <TableCell width="20%">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    <CircularProgress size={24} sx={{ mr: 1 }} />
                    Loading questions...
                  </TableCell>
                </TableRow>
              ) : filteredQuestions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    No questions found
                  </TableCell>
                </TableRow>
              ) : (
                filteredQuestions
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((question) => (
                    <TableRow key={question.id}>
                      <TableCell>
                        <Typography variant="body2">
                          {question.text.length > 150
                            ? `${question.text.substring(0, 150)}...`
                            : question.text}
                        </Typography>

                        {question.tags && question.tags.length > 0 && (
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 0.5,
                              mt: 1,
                            }}
                          >
                            {question.tags.map((tag) => (
                              <Chip
                                key={tag}
                                label={tag}
                                size="small"
                                variant="outlined"
                              />
                            ))}
                          </Box>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip label={question.category} size="small" />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={question.difficulty}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Tooltip title="Edit">
                            <IconButton
                              color="primary"
                              onClick={() => handleEditQuestion(question)}
                            >
                              <EditIcon />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete">
                            <IconButton
                              color="error"
                              onClick={() => handleDeleteQuestion(question.id)}
                            >
                              <DeleteIcon />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[10, 25, 50, 100]}
          component="div"
          count={filteredQuestions.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Question form dialog */}
      <Dialog
        open={showQuestionForm}
        onClose={() => setShowQuestionForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Question" : "Add Question"}
        </DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Question Text"
                variant="outlined"
                fullWidth
                required
                multiline
                rows={3}
                value={questionText}
                onChange={(e) => setQuestionText(e.target.value)}
              />
            </Grid>

            <Grid item xs={12}>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: 1,
                }}
              >
                <Typography variant="subtitle1">Answer Options</Typography>
                <Button
                  size="small"
                  startIcon={<AddOptionIcon />}
                  onClick={handleAddOption}
                >
                  Add Option
                </Button>
              </Box>

              <Box component="form">
                <FormControl component="fieldset" sx={{ width: "100%" }}>
                  <FormLabel component="legend">
                    Select the correct answer:
                  </FormLabel>
                  <RadioGroup
                    value={correctAnswer}
                    onChange={(e) => setCorrectAnswer(e.target.value)}
                  >
                    {questionOptions.map((option, index) => (
                      <Box
                        key={index}
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 1,
                          mb: 2,
                        }}
                      >
                        <FormControlLabel
                          value={option.id}
                          control={<Radio />}
                          label={`Option ${option.id}:`}
                          sx={{ minWidth: 120 }}
                        />
                        <TextField
                          fullWidth
                          required
                          variant="outlined"
                          value={option.text}
                          onChange={(e) =>
                            handleOptionChange(index, e.target.value)
                          }
                        />
                        <IconButton
                          color="error"
                          onClick={() => handleRemoveOption(index)}
                          size="small"
                        >
                          <RemoveOptionIcon />
                        </IconButton>
                      </Box>
                    ))}
                  </RadioGroup>
                </FormControl>
              </Box>
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Explanation"
                variant="outlined"
                fullWidth
                required
                multiline
                rows={3}
                value={questionExplanation}
                onChange={(e) => setQuestionExplanation(e.target.value)}
                helperText="Explain why the correct answer is right and others are wrong"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                  labelId="category-label"
                  value={questionCategory}
                  onChange={(e) => setQuestionCategory(e.target.value)}
                  label="Category"
                >
                  {CATEGORY_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControl fullWidth required>
                <InputLabel id="difficulty-label">Difficulty</InputLabel>
                <Select
                  labelId="difficulty-label"
                  value={questionDifficulty}
                  onChange={(e) => setQuestionDifficulty(e.target.value)}
                  label="Difficulty"
                >
                  {DIFFICULTY_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle1" gutterBottom>
                Tags
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}
              >
                <TextField
                  label="Add Tag"
                  variant="outlined"
                  size="small"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  sx={{ flexGrow: 1 }}
                />
                <Button
                  variant="outlined"
                  onClick={handleAddTag}
                  disabled={!newTag.trim()}
                >
                  Add
                </Button>
              </Box>

              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                {questionTags.map((tag) => (
                  <Chip
                    key={tag}
                    label={tag}
                    onDelete={() => handleRemoveTag(tag)}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowQuestionForm(false)}>Cancel</Button>
          <Button
            onClick={handleSaveQuestion}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Question</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this question? This action cannot be
            undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteQuestion}
            color="error"
            variant="contained"
            disabled={deleteLoading}
          >
            {deleteLoading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Import dialog */}
      <Dialog
        open={showImportDialog}
        onClose={() => setShowImportDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Import Questions</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" paragraph>
            Import questions from a JSON file that follows the format in the
            provided example. The JSON should contain a "questions" array with
            each question object.
          </Typography>

          <Box sx={{ mb: 3, p: 2, bgcolor: "grey.100", borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Expected format:
            </Typography>
            <Box
              component="pre"
              sx={{ fontSize: "0.875rem", overflow: "auto" }}
            >
              {`{
  "questions": [
    {
      "text": "Question text here",
      "options": [
        {"id": "A", "text": "Option A text"},
        {"id": "B", "text": "Option B text"},
        {"id": "C", "text": "Option C text"},
        {"id": "D", "text": "Option D text"}
      ],
      "correctAnswer": "B",
      "explanation": "Explanation text here",
      "category": "Compute",
      "difficulty": "SAA",
      "tags": ["EC2", "Instance Types"]
    },
    ...
  ]
}`}
            </Box>
          </Box>

          <Box sx={{ mb: 3 }}>
            <input
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              style={{ display: "none" }}
              ref={fileInputRef}
            />
            <Button
              variant="outlined"
              startIcon={<CloudUploadIcon />}
              onClick={() => fileInputRef.current?.click()}
              sx={{ mr: 2 }}
            >
              Select File
            </Button>

            {importFile && (
              <Chip
                label={importFile.name}
                onDelete={() => {
                  setImportFile(null);
                  setImportJson("");
                  setImportValidationResults(null);
                }}
              />
            )}
          </Box>

          {importFile && (
            <Box sx={{ mb: 3 }}>
              <TextField
                label="JSON Content"
                variant="outlined"
                fullWidth
                multiline
                rows={10}
                value={importJson}
                onChange={(e) => {
                  setImportJson(e.target.value);
                  setImportValidationResults(null);
                }}
              />

              <Box sx={{ mt: 2 }}>
                <Button
                  variant="outlined"
                  onClick={validateImportJson}
                  disabled={!importJson.trim() || importLoading}
                  startIcon={
                    importLoading ? (
                      <CircularProgress size={20} />
                    ) : (
                      <CheckIcon />
                    )
                  }
                >
                  Validate
                </Button>
              </Box>
            </Box>
          )}

          {importValidationResults && (
            <Alert
              severity={importValidationResults.valid ? "success" : "error"}
              sx={{ mb: 2 }}
            >
              {importValidationResults.valid ? (
                <Typography>
                  Validation successful! The import contains valid questions.
                </Typography>
              ) : (
                <>
                  <Typography fontWeight="bold">
                    Validation failed with the following errors:
                  </Typography>
                  <ul>
                    {importValidationResults.errors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </>
              )}
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowImportDialog(false)}>Cancel</Button>
          <Button
            onClick={executeImport}
            variant="contained"
            color="primary"
            disabled={!importValidationResults?.valid || importLoading}
          >
            {importLoading ? "Importing..." : "Import Questions"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar notification */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default AdminQuestionManagement;
