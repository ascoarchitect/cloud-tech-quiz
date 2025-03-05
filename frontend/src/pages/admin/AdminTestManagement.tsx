import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Button,
  FormControlLabel,
  Switch,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Alert,
  CircularProgress,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  IconButton,
  Tooltip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  Tab,
  Tabs,
  Link,
} from "@mui/material";
import {
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as CopyIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Warning as WarningIcon,
  ArrowBack as ArrowBackIcon,
  LinkOff as LinkOffIcon,
  Link as LinkOnIcon,
} from "@mui/icons-material";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip as ChartTooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import {
  getTest,
  updateTest,
  deleteTest,
  getTestStatistics,
  listResponses,
} from "../../services/api";
import { TestType, ResponseType } from "../../types";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  ChartTooltip,
  Legend,
);

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`test-management-tabpanel-${index}`}
      aria-labelledby={`test-management-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

const AdminTestManagement: React.FC = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();

  // Test data state
  const [test, setTest] = useState<TestType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Test statistics state
  const [statistics, setStatistics] = useState<{
    totalParticipants: number;
    completedTests: number;
    incompleteTests: number;
    averageScore: number;
    cheatingAttempts: number;
    categoryStats: Array<{
      category: string;
      averageScore: number;
      questionCount: number;
    }>;
  } | null>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Participant responses state
  const [responses, setResponses] = useState<ResponseType[]>([]);
  const [responsesLoading, setResponsesLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  // UI state
  const [tabValue, setTabValue] = useState(0);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: "",
    description: "",
    active: true,
    closureDate: "",
    allowRetake: false,
    randomizeQuestions: true,
    randomizeOptions: true,
    showResultImmediately: true,
  });
  const [copySuccess, setCopySuccess] = useState(false);

  // Load test data on mount
  useEffect(() => {
    if (testId) {
      fetchTestData();
    }
  }, [testId]);

  // Fetch test data from API
  const fetchTestData = async () => {
    setLoading(true);
    setError("");

    try {
      // Fetch test details
      const testData = await getTest(testId!);

      if (!testData) {
        setError("Test not found");
        setLoading(false);
        return;
      }

      setTest(testData);

      // Set initial edit form data
      setEditFormData({
        name: testData.name,
        description: testData.description || "",
        active: testData.active,
        closureDate: testData.closureDate
          ? new Date(testData.closureDate).toISOString().slice(0, 16)
          : "",
        allowRetake: testData.settings?.allowRetake || false,
        randomizeQuestions: testData.settings?.randomizeQuestions || true,
        randomizeOptions: testData.settings?.randomizeOptions || true,
        showResultImmediately: testData.settings?.showResultImmediately || true,
      });

      // Fetch test statistics
      fetchTestStatistics();

      // Fetch responses
      fetchTestResponses();

      setLoading(false);
    } catch (err) {
      console.error("Error fetching test data:", err);
      setError("Failed to load test data");
      setLoading(false);
    }
  };

  // Fetch test statistics
  const fetchTestStatistics = async () => {
    if (!testId) return;

    setStatsLoading(true);
    try {
      const stats = await getTestStatistics(testId);
      setStatistics(stats);
      setStatsLoading(false);
    } catch (err) {
      console.error("Error fetching test statistics:", err);
      setStatsLoading(false);
    }
  };

  // Fetch test responses
  const fetchTestResponses = async () => {
    if (!testId) return;

    setResponsesLoading(true);
    try {
      // Use the direct testId parameter instead of filter object
      const result = await listResponses({
        testId: testId,
        limit: 1000,
      });

      const responsesData = result.items;

      // Sort by start time (newest first)
      responsesData.sort((a, b) => {
        return (
          new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
        );
      });

      setResponses(responsesData);
      setResponsesLoading(false);
    } catch (err) {
      console.error("Error fetching test responses:", err);
      setResponsesLoading(false);
    }
  };

  // Handle updating test
  const handleUpdateTest = async () => {
    if (!test) return;

    setLoading(true);
    try {
      const updateInput = {
        id: test.id,
        name: editFormData.name,
        description: editFormData.description || undefined, // Use undefined instead of null
        active: editFormData.active,
        closureDate: editFormData.closureDate
          ? new Date(editFormData.closureDate).toISOString()
          : undefined, // Use undefined instead of null
        settings: {
          allowRetake: editFormData.allowRetake,
          randomizeQuestions: editFormData.randomizeQuestions,
          randomizeOptions: editFormData.randomizeOptions,
          showResultImmediately: editFormData.showResultImmediately,
        },
      };

      await updateTest(updateInput);
      // Refresh test data
      await fetchTestData();
      setShowEditDialog(false);
    } catch (err) {
      console.error("Error updating test:", err);
      setError("Failed to update test");
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting test
  const handleDeleteTest = async () => {
    if (!test) return;

    setLoading(true);
    try {
      await deleteTest(test.id);

      // Navigate back to admin dashboard
      navigate("/admin");
    } catch (err) {
      console.error("Error deleting test:", err);
      setError("Failed to delete test");
      setLoading(false);
    }
  };

  // Handle tab change
  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Handle pagination change
  const handleChangePage = (_: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Copy test link to clipboard
  const copyTestLink = () => {
    if (!test) return;

    const link = `${window.location.origin}/test/${test.id}/take`;
    navigator.clipboard.writeText(link);
    setCopySuccess(true);

    setTimeout(() => {
      setCopySuccess(false);
    }, 3000);
  };

  // Prepare data for category stats chart
  const prepareCategoryChart = () => {
    if (
      !statistics ||
      !statistics.categoryStats ||
      statistics.categoryStats.length === 0
    ) {
      return null;
    }

    const categories = statistics.categoryStats.map((stat) => stat.category);
    const scores = statistics.categoryStats.map((stat) => stat.averageScore);

    const data = {
      labels: categories,
      datasets: [
        {
          label: "Average Score (%)",
          data: scores,
          backgroundColor: "rgba(54, 162, 235, 0.6)",
          borderColor: "rgba(54, 162, 235, 1)",
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
          display: true,
          position: "top" as const,
        },
        title: {
          display: true,
          text: "Performance by Category",
        },
      },
    };

    return { data, options };
  };

  // Prepare data for completion stats chart
  const prepareCompletionChart = () => {
    if (!statistics) {
      return null;
    }

    const data = {
      labels: ["Completed", "Incomplete", "Cheating Attempts"],
      datasets: [
        {
          label: "Number of Tests",
          data: [
            statistics.completedTests,
            statistics.incompleteTests,
            statistics.cheatingAttempts,
          ],
          backgroundColor: [
            "rgba(75, 192, 192, 0.6)",
            "rgba(255, 206, 86, 0.6)",
            "rgba(255, 99, 132, 0.6)",
          ],
          borderColor: [
            "rgba(75, 192, 192, 1)",
            "rgba(255, 206, 86, 1)",
            "rgba(255, 99, 132, 1)",
          ],
          borderWidth: 1,
        },
      ],
    };

    const options = {
      responsive: true,
      plugins: {
        legend: {
          position: "top" as const,
        },
        title: {
          display: true,
          text: "Test Completion Statistics",
        },
      },
    };

    return { data, options };
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  if (loading && !test) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "50vh",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  if (!test) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Test not found
        </Alert>
        <Button
          variant="outlined"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin")}
        >
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  const categoryChart = prepareCategoryChart();
  const completionChart = prepareCompletionChart();

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      {/* Test header */}
      <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
        <Button
          variant="text"
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/admin")}
          sx={{ mr: 2 }}
        >
          Back
        </Button>
        <Typography variant="h4" component="h1">
          Test Management
        </Typography>
      </Box>

      {/* Test info card */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Typography variant="h5" gutterBottom>
              {test.name}
            </Typography>
            {test.description && (
              <Typography variant="body1" color="text.secondary" paragraph>
                {test.description}
              </Typography>
            )}

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              <Chip
                label={test.active ? "Active" : "Inactive"}
                color={test.active ? "success" : "error"}
                variant="outlined"
                icon={test.active ? <CheckCircleIcon /> : <CancelIcon />}
              />
              <Chip
                label={`${test.numQuestions} Questions`}
                variant="outlined"
              />
              <Chip label={`${test.timeLimit} Minutes`} variant="outlined" />
              {test.closureDate && (
                <Chip
                  label={`Closes: ${new Date(test.closureDate).toLocaleDateString()}`}
                  variant="outlined"
                  color={
                    new Date(test.closureDate) < new Date()
                      ? "error"
                      : "default"
                  }
                />
              )}
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
              {test.difficulty.map((diff) => (
                <Chip
                  key={diff}
                  label={diff}
                  color="primary"
                  variant="outlined"
                />
              ))}
              {test.categories.map((cat) => (
                <Chip key={cat} label={cat} variant="outlined" />
              ))}
            </Box>

            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
              <Chip
                label={
                  test.settings?.allowRetake ? "Retakes Allowed" : "No Retakes"
                }
                variant="outlined"
                size="small"
              />
              <Chip
                label={
                  test.settings?.randomizeQuestions
                    ? "Randomized Questions"
                    : "Fixed Order"
                }
                variant="outlined"
                size="small"
              />
              <Chip
                label={
                  test.settings?.randomizeOptions
                    ? "Randomized Options"
                    : "Fixed Options"
                }
                variant="outlined"
                size="small"
              />
              <Chip
                label={
                  test.settings?.showResultImmediately
                    ? "Immediate Results"
                    : "Delayed Results"
                }
                variant="outlined"
                size="small"
              />
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 2,
                height: "100%",
              }}
            >
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                onClick={() => setShowEditDialog(true)}
                fullWidth
              >
                Edit Test
              </Button>

              <Button
                variant="outlined"
                color="error"
                startIcon={<DeleteIcon />}
                onClick={() => setShowDeleteDialog(true)}
                fullWidth
              >
                Delete Test
              </Button>

              <Divider sx={{ my: 1 }} />

              <Typography variant="subtitle1" gutterBottom>
                Test Link
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <TextField
                  variant="outlined"
                  size="small"
                  fullWidth
                  value={`${window.location.origin}/test/${test.id}/take`}
                  InputProps={{
                    readOnly: true,
                  }}
                />
                <Tooltip title="Copy Link">
                  <IconButton color="primary" onClick={copyTestLink}>
                    {copySuccess ? (
                      <CheckCircleIcon color="success" />
                    ) : (
                      <CopyIcon />
                    )}
                  </IconButton>
                </Tooltip>
              </Box>

              <Button
                variant="outlined"
                startIcon={test.active ? <LinkOffIcon /> : <LinkOnIcon />}
                color={test.active ? "error" : "success"}
                onClick={async () => {
                  try {
                    await updateTest({
                      id: test.id,
                      active: !test.active,
                    });
                    fetchTestData();
                  } catch (err) {
                    console.error("Error toggling test status:", err);
                  }
                }}
                fullWidth
              >
                {test.active ? "Deactivate Test" : "Activate Test"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Paper>

      {/* Tabs for different views */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="test management tabs"
        >
          <Tab
            label="Overview & Statistics"
            id="test-management-tab-0"
            icon={<AssessmentIcon />}
            iconPosition="start"
          />
          <Tab
            label="Participants"
            id="test-management-tab-1"
            icon={<PeopleIcon />}
            iconPosition="start"
          />
        </Tabs>
      </Box>

      {/* Overview & Statistics tab */}
      <TabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          {/* Summary statistics */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Test Summary
              </Typography>

              {statsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : !statistics ? (
                <Alert severity="info">
                  No test statistics available yet. This data will appear once
                  participants take the test.
                </Alert>
              ) : (
                <Grid container spacing={2}>
                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Total Participants
                    </Typography>
                    <Typography variant="h4">
                      {statistics.totalParticipants}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Average Score
                    </Typography>
                    <Typography
                      variant="h4"
                      color={
                        statistics.averageScore >= 70
                          ? "success.main"
                          : statistics.averageScore >= 50
                            ? "warning.main"
                            : "error.main"
                      }
                    >
                      {statistics.averageScore.toFixed(1)}%
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Completed Tests
                    </Typography>
                    <Typography variant="h5">
                      {statistics.completedTests}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Incomplete Tests
                    </Typography>
                    <Typography variant="h5">
                      {statistics.incompleteTests}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Cheating Attempts
                    </Typography>
                    <Typography
                      variant="h5"
                      color={
                        statistics.cheatingAttempts > 0
                          ? "error.main"
                          : "inherit"
                      }
                    >
                      {statistics.cheatingAttempts}
                    </Typography>
                  </Grid>

                  <Grid item xs={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Completion Rate
                    </Typography>
                    <Typography variant="h5">
                      {statistics.totalParticipants > 0
                        ? `${((statistics.completedTests / statistics.totalParticipants) * 100).toFixed(1)}%`
                        : "N/A"}
                    </Typography>
                  </Grid>
                </Grid>
              )}
            </Paper>
          </Grid>

          {/* Completion chart */}
          <Grid item xs={12} md={6}>
            <Paper sx={{ p: 3, height: "100%" }}>
              <Typography variant="h6" gutterBottom>
                Test Completion Statistics
              </Typography>

              {statsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : !completionChart ? (
                <Alert severity="info">
                  No completion data available yet. This chart will appear once
                  participants take the test.
                </Alert>
              ) : (
                <Box sx={{ height: 300 }}>
                  <Bar
                    data={completionChart.data}
                    options={completionChart.options}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Category statistics chart */}
          <Grid item xs={12}>
            <Paper sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                Performance by Category
              </Typography>

              {statsLoading ? (
                <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : !categoryChart ? (
                <Alert severity="info">
                  No category performance data available yet. This chart will
                  appear once participants complete tests.
                </Alert>
              ) : (
                <Box sx={{ height: 400 }}>
                  <Bar
                    data={categoryChart.data}
                    options={categoryChart.options}
                  />
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Strongest/weakest categories */}
          {statistics &&
            statistics.categoryStats &&
            statistics.categoryStats.length > 0 && (
              <Grid item xs={12}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Category Performance Analysis
                  </Typography>

                  <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Strongest Categories
                      </Typography>

                      <List>
                        {[...statistics.categoryStats]
                          .sort((a, b) => b.averageScore - a.averageScore)
                          .slice(0, 3)
                          .map((stat, index) => (
                            <ListItem key={stat.category}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "success.main" }}>
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={stat.category}
                                secondary={`${stat.averageScore.toFixed(1)}% average score (${stat.questionCount} questions)`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    </Grid>

                    <Grid item xs={12} md={6}>
                      <Typography variant="subtitle1" gutterBottom>
                        Areas for Improvement
                      </Typography>

                      <List>
                        {[...statistics.categoryStats]
                          .sort((a, b) => a.averageScore - b.averageScore)
                          .slice(0, 3)
                          .map((stat, index) => (
                            <ListItem key={stat.category}>
                              <ListItemAvatar>
                                <Avatar sx={{ bgcolor: "error.main" }}>
                                  {index + 1}
                                </Avatar>
                              </ListItemAvatar>
                              <ListItemText
                                primary={stat.category}
                                secondary={`${stat.averageScore.toFixed(1)}% average score (${stat.questionCount} questions)`}
                              />
                            </ListItem>
                          ))}
                      </List>
                    </Grid>
                  </Grid>
                </Paper>
              </Grid>
            )}
        </Grid>
      </TabPanel>

      {/* Participants tab */}
      <TabPanel value={tabValue} index={1}>
        <Paper sx={{ width: "100%", overflow: "hidden" }}>
          <TableContainer sx={{ maxHeight: 600 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Participant</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Score</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responsesLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      <CircularProgress size={24} sx={{ mr: 1 }} />
                      Loading responses...
                    </TableCell>
                  </TableRow>
                ) : responses.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                      No participants have taken this test yet
                    </TableCell>
                  </TableRow>
                ) : (
                  responses
                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                    .map((response) => (
                      <TableRow key={response.id}>
                        <TableCell>{response.userName}</TableCell>
                        <TableCell>{formatDate(response.startTime)}</TableCell>
                        <TableCell>
                          {response.endTime
                            ? formatDate(response.endTime)
                            : "In Progress"}
                        </TableCell>
                        <TableCell>
                          {response.cheatingAttempts &&
                          response.cheatingAttempts > 0 ? (
                            <Chip
                              label="Cheating Detected"
                              color="error"
                              icon={<WarningIcon />}
                            />
                          ) : response.completed ? (
                            <Chip
                              label="Completed"
                              color="success"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              label="Incomplete"
                              color="warning"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {response.score !== null &&
                          response.score !== undefined ? (
                            <Typography
                              color={
                                response.score >= 70
                                  ? "success.main"
                                  : response.score >= 50
                                    ? "warning.main"
                                    : "error.main"
                              }
                              fontWeight="medium"
                            >
                              {response.score.toFixed(1)}%
                            </Typography>
                          ) : (
                            "N/A"
                          )}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/test/${testId}/results/${response.id}`}
                            target="_blank"
                            underline="none"
                          >
                            <Button size="small" variant="outlined">
                              View Results
                            </Button>
                          </Link>
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
            count={responses.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        </Paper>
      </TabPanel>

      {/* Edit test dialog */}
      <Dialog
        open={showEditDialog}
        onClose={() => setShowEditDialog(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Edit Test</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Test Name"
                variant="outlined"
                fullWidth
                value={editFormData.name}
                onChange={(e) =>
                  setEditFormData({ ...editFormData, name: e.target.value })
                }
                required
              />
            </Grid>

            <Grid item xs={12}>
              <TextField
                label="Description"
                variant="outlined"
                fullWidth
                multiline
                rows={3}
                value={editFormData.description}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    description: e.target.value,
                  })
                }
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.active}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        active: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Test Active"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="Closure Date (Optional)"
                variant="outlined"
                fullWidth
                type="datetime-local"
                value={editFormData.closureDate}
                onChange={(e) =>
                  setEditFormData({
                    ...editFormData,
                    closureDate: e.target.value,
                  })
                }
                InputLabelProps={{ shrink: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Typography variant="h6" gutterBottom>
                Test Settings
              </Typography>
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.randomizeQuestions}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        randomizeQuestions: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Randomize Questions"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.randomizeOptions}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        randomizeOptions: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Randomize Answer Options"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.showResultImmediately}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        showResultImmediately: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Show Results Immediately"
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={editFormData.allowRetake}
                    onChange={(e) =>
                      setEditFormData({
                        ...editFormData,
                        allowRetake: e.target.checked,
                      })
                    }
                    color="primary"
                  />
                }
                label="Allow Retakes"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowEditDialog(false)}>Cancel</Button>
          <Button
            onClick={handleUpdateTest}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save Changes"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
      >
        <DialogTitle>Delete Test</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this test? This action cannot be
            undone and will remove all test data and participant responses.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
          <Button
            onClick={handleDeleteTest}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminTestManagement;
