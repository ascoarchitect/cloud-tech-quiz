import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { generateClient } from "aws-amplify/api";
import { GraphQLResult } from '@aws-amplify/api';
import {
  Box,
  Typography,
  Grid,
  Paper,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Divider,
  Chip,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  ArrowForward as ArrowForwardIcon,
  Assessment as AssessmentIcon,
  QuestionAnswer as QuestionIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";
import { listTests } from "../../graphql/queries";
import { TestType } from "../../types";

const client = generateClient();

const AdminDashboard: React.FC = () => {
  const [tests, setTests] = useState<TestType[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTests();
  }, []);

  const fetchTests = async () => {
    try {
      const result = await client.graphql({
        query: listTests,
        variables: {
          limit: 1000,
        },
      }) as GraphQLResult<{
        listTests: { items: TestType[] }
      }>;
  
      // Now TypeScript knows that data exists and has the expected structure
      const testsData = result.data.listTests.items || [];
  
      // Sort by creation date (newest first)
      testsData.sort((a, b) => {
        return (
          new Date(b.createdAt || "").getTime() -
          new Date(a.createdAt || "").getTime()
        );
      });
  
      setTests(testsData);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching tests:", err);
      setLoading(false);
    }
  };

  const navigateToTestManagement = (testId: string) => {
    navigate(`/admin/tests/${testId}`);
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1200, mx: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Admin Dashboard
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Quick actions */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                component={Link}
                to="/admin/tests/create"
                fullWidth
              >
                Create New Test
              </Button>
              <Button
                variant="outlined"
                startIcon={<QuestionIcon />}
                component={Link}
                to="/admin/questions"
                fullWidth
              >
                Manage Questions
              </Button>
            </Box>
          </Paper>
        </Grid>

        {/* Recent tests */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Typography variant="h6" gutterBottom>
              Recent Tests
            </Typography>
            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List sx={{ width: "100%" }}>
                {tests.slice(0, 5).map((test) => (
                  <React.Fragment key={test.id}>
                    <ListItem>
                      <ListItemText
                        primary={test.name}
                        secondary={
                          <Box
                            sx={{
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 1,
                              mt: 0.5,
                            }}
                          >
                            <Chip
                              size="small"
                              label={`${test.numQuestions} questions`}
                              color="primary"
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={`${test.timeLimit} min`}
                              icon={<CalendarIcon fontSize="small" />}
                              variant="outlined"
                            />
                            <Chip
                              size="small"
                              label={test.active ? "Active" : "Inactive"}
                              color={test.active ? "success" : "error"}
                              variant="outlined"
                            />
                          </Box>
                        }
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          onClick={() => navigateToTestManagement(test.id)}
                          color="primary"
                        >
                          <ArrowForwardIcon />
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}

                {tests.length === 0 && (
                  <Typography
                    color="textSecondary"
                    sx={{ p: 2, textAlign: "center" }}
                  >
                    No tests created yet
                  </Typography>
                )}

                {tests.length > 5 && (
                  <Box sx={{ textAlign: "center", mt: 2 }}>
                    <Button
                      variant="text"
                      endIcon={<ArrowForwardIcon />}
                      onClick={() => {
                        // Navigate to a test list view (you'd need to create this page)
                        // For now, let's just show the first test's details
                        if (tests.length > 0) {
                          navigateToTestManagement(tests[0].id);
                        }
                      }}
                    >
                      View All Tests
                    </Button>
                  </Box>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* Test summary */}
      <Grid container spacing={3}>
        {/* Active tests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <AssessmentIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6">Active Tests</Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List>
                {tests
                  .filter((test) => test.active)
                  .slice(0, 5)
                  .map((test) => (
                    <ListItem
                      key={test.id}
                      onClick={() => navigateToTestManagement(test.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <ListItemText
                        primary={test.name}
                        secondary={
                          test.closureDate
                            ? `Closes: ${test.closureDate ? new Date(test.closureDate).toLocaleDateString() : "No date"}`
                            : "No closure date"
                        }
                      />
                      <IconButton edge="end" size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}

                {tests.filter((test) => test.active).length === 0 && (
                  <Typography
                    color="textSecondary"
                    sx={{ p: 1, textAlign: "center" }}
                  >
                    No active tests
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>

        {/* Upcoming tests */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
              <CalendarIcon color="primary" sx={{ mr: 1, fontSize: 28 }} />
              <Typography variant="h6">Tests with Upcoming Closure</Typography>
            </Box>

            {loading ? (
              <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
                <CircularProgress size={24} />
              </Box>
            ) : (
              <List>
                {tests
                  .filter(
                    (test) =>
                      test.active &&
                      test.closureDate &&
                      new Date(test.closureDate) > new Date(),
                  )
                  .sort((a, b) => {
                    if (a.closureDate && b.closureDate) {
                      return (
                        new Date(a.closureDate).getTime() -
                        new Date(b.closureDate).getTime()
                      );
                    }
                    return 0;
                  })
                  .slice(0, 5)
                  .map((test) => (
                    <ListItem
                      key={test.id}
                      onClick={() => navigateToTestManagement(test.id)}
                      sx={{ cursor: "pointer" }}
                    >
                      <ListItemText
                        primary={test.name}
                        secondary={
                          test.closureDate
                            ? `Closes: ${new Date(test.closureDate).toLocaleDateString()}`
                            : "No closure date"
                        }
                      />
                      <IconButton edge="end" size="small">
                        <EditIcon fontSize="small" />
                      </IconButton>
                    </ListItem>
                  ))}

                {tests.filter(
                  (test) =>
                    test.active &&
                    test.closureDate &&
                    new Date(test.closureDate) > new Date(),
                ).length === 0 && (
                  <Typography
                    color="textSecondary"
                    sx={{ p: 1, textAlign: "center" }}
                  >
                    No upcoming test closures
                  </Typography>
                )}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default AdminDashboard;
