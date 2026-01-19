import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Typography, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { testAPI } from '../utils/api';

const ExamInstructions = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [scrolledToBottom, setScrolledToBottom] = useState(false);
  const [testData, setTestData] = useState<any>(null);

  useEffect(() => {
    // Only redirect if loading is complete AND user is not authenticated
    if (loading) return;
    if (!user) {
      navigate('/login');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff' }}>
        <Typography>Loading...</Typography>
      </Box>
    );
  }

  if (!user) {
    return null; // Will redirect via useEffect
  }

  useEffect(() => {
    // Load test data only when user is confirmed authenticated
    if (!user || loading) return;
    
    if (testId) {
      testAPI.getById(testId).then((res) => {
        setTestData(res.data);
      });
    }
  }, [testId, user, loading]);

  const handleNext = () => {
    navigate(`/exam-declaration/${testId}`);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const element = e.currentTarget;
    const isAtBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight < 10;
    setScrolledToBottom(isAtBottom);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#ffffff',
        fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          padding: '20px 40px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#f5f5f5',
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600, color: '#333' }}>
          {testData?.title || 'CATrix Examination'} — Instructions
        </Typography>
      </Box>

      {/* Scrollable Content */}
      <Box
        onScroll={handleScroll}
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '40px 60px',
          backgroundColor: '#ffffff',
        }}
      >
        <Container maxWidth="md">
          <Typography variant="body1" sx={{ lineHeight: 1.8, color: '#444', marginBottom: '24px' }}>
            <strong>Important Instructions:</strong>
          </Typography>

          <Box sx={{ marginBottom: '30px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              1. Exam Duration & Sections
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#555', marginBottom: '16px' }}>
              • This examination consists of 3 sections.
              <br />
              • Each section has a fixed time limit.
              <br />
              • Once the time for a section expires, you cannot go back to that section.
              <br />
              • You cannot switch between sections before your time is up.
            </Typography>
          </Box>

          <Box sx={{ marginBottom: '30px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              2. Question Palette Status (Left Panel)
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#555', marginBottom: '16px' }}>
              <strong style={{ color: '#aaa' }}>Gray ●</strong> Not Visited — You have not opened this question.
              <br />
              <strong style={{ color: '#ff9800' }}>Orange ●</strong> Visited — You have opened this question but not answered.
              <br />
              <strong style={{ color: '#4caf50' }}>Green ●</strong> Answered — You have answered this question.
              <br />
              <strong style={{ color: '#9c27b0' }}>Purple ●</strong> Marked for Review — You have marked this for review without answering.
              <br />
              <strong style={{ color: '#9c27b0' }}>Purple ✓</strong> Answered & Marked — You have answered and marked for review.
            </Typography>
          </Box>

          <Box sx={{ marginBottom: '30px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              3. Answering Questions
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#555', marginBottom: '16px' }}>
              • Click on your answer choice to select it.
              <br />
              • You can change your answer as many times as you want.
              <br />
              • Type your answer directly in text-based questions.
              <br />
              • Click "Clear Response" to deselect an answer.
            </Typography>
          </Box>

          <Box sx={{ marginBottom: '30px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              4. Navigation Controls
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#555', marginBottom: '16px' }}>
              • <strong>Previous:</strong> Go to previous question (disabled at first question).
              <br />
              • <strong>Clear Response:</strong> Clear your answer without marking.
              <br />
              • <strong>Mark for Review & Next:</strong> Mark question and proceed to next.
              <br />
              • <strong>Save & Next:</strong> Save your answer and proceed to next.
            </Typography>
          </Box>

          <Box sx={{ marginBottom: '30px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              5. Timing & Auto-Submit
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#555', marginBottom: '16px' }}>
              • Timer is shown at the top right.
              <br />
              • Do not wait for timer to reach zero. Submit your section manually.
              <br />
              • Your responses are automatically saved as you progress.
              <br />
              • If time expires, your section will auto-submit.
            </Typography>
          </Box>

          <Box sx={{ marginBottom: '30px' }}>
            <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '12px', color: '#333' }}>
              6. Restrictions During Exam
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.7, color: '#555', marginBottom: '16px' }}>
              • You cannot refresh or reload the exam page.
              <br />
              • You cannot copy or paste text.
              <br />
              • Right-click menu is disabled.
              <br />
              • Switching to another tab may be flagged.
              <br />
              • Maintain focus on the exam window at all times.
            </Typography>
          </Box>

          <Box sx={{ marginBottom: '30px', backgroundColor: '#fff3cd', padding: '16px', borderLeft: '4px solid #ffc107' }}>
            <Typography variant="body2" sx={{ color: '#856404', fontWeight: 500 }}>
              ⚠ <strong>Note:</strong> By proceeding to the next step, you confirm that you understand all instructions and agree to abide by the examination rules.
            </Typography>
          </Box>

          <Typography variant="body2" sx={{ textAlign: 'center', color: '#999', marginTop: '40px', marginBottom: '40px' }}>
            Scroll to the bottom to enable the Next button
          </Typography>
        </Container>
      </Box>

      {/* Footer */}
      <Box
        sx={{
          padding: '20px 40px',
          borderTop: '1px solid #e0e0e0',
          backgroundColor: '#f5f5f5',
          display: 'flex',
          justifyContent: 'center',
        }}
      >
        <Button
          variant="contained"
          onClick={handleNext}
          disabled={!scrolledToBottom}
          sx={{
            backgroundColor: scrolledToBottom ? '#1976d2' : '#ccc',
            color: '#ffffff',
            padding: '10px 40px',
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '4px',
            cursor: scrolledToBottom ? 'pointer' : 'not-allowed',
            '&:hover': scrolledToBottom ? { backgroundColor: '#1565c0' } : {},
          }}
        >
          Next
        </Button>
      </Box>
    </Box>
  );
};

export default ExamInstructions;
