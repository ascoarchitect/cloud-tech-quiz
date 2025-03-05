import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  TextField,
  Typography,
  Alert,
  Container,
  Box,
} from "@mui/material";
import { getTest } from "../services/api";

const HomePage: React.FC = () => {
  const [testId, setTestId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleTestIdChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setTestId(event.target.value);
    setError("");
  };

  const startTest = async () => {
    if (!testId.trim()) {
      setError("Please enter a Test ID");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const test = await getTest(testId);

      if (!test.active) {
        setError("This test is no longer active.");
        setLoading(false);
        return;
      }

      // Check if test has a closure date and it has passed
      if (test.closureDate) {
        const closureDate = new Date(test.closureDate);
        if (closureDate < new Date()) {
          setError(
            "This test is no longer available (closure date has passed).",
          );
          setLoading(false);
          return;
        }
      }

      // Navigate to test page
      navigate(`/test/${testId}/take`);
    } catch (err) {
      console.error("Error fetching test:", err);
      setError("Failed to find test. Please check the ID and try again.");
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 4, textAlign: "center" }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Cloud Skills Assessment
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          Test your cloud knowledge and skills
        </Typography>

        <Card sx={{ maxWidth: 600, margin: "40px auto", padding: 4 }}>
          <Typography variant="h6" gutterBottom>
            Enter your Test ID to begin
          </Typography>

          <TextField
            fullWidth
            label="Test ID"
            variant="outlined"
            margin="normal"
            value={testId}
            onChange={handleTestIdChange}
            placeholder="Enter the unique test ID provided to you"
          />

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={startTest}
            disabled={loading}
            sx={{ mt: 3 }}
          >
            {loading ? "Loading..." : "Start Test"}
          </Button>
        </Card>

        <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
          If you are an administrator, please access the admin dashboard to
          create and manage tests.
        </Typography>
      </Box>
    </Container>
  );
};

export default HomePage;
