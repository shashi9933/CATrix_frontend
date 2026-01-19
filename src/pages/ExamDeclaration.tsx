import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Box, Button, Typography, Checkbox, FormControlLabel, Paper, Container } from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import { testAPI } from '../utils/api';

const ExamDeclaration = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const [testData, setTestData] = useState<any>(null);

  const [checkboxes, setCheckboxes] = useState({
    readInstructions: false,
    understandTiming: false,
    understandAutoSubmit: false,
    understandTracking: false,
    readyToBegin: false,
  });

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

  const allChecked = Object.values(checkboxes).every((v) => v);

  const handleCheckboxChange = (key: keyof typeof checkboxes) => {
    setCheckboxes((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleStartTest = () => {
    if (allChecked && testId) {
      // Open exam in new window
      window.open(
        `/exam/${testId}`,
        'ExamWindow',
        'width=1400,height=900,menubar=no,toolbar=no,location=no,status=no'
      );
      navigate('/test-series');
    }
  };

  const handleBack = () => {
    navigate(`/exam-instructions/${testId}`);
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
          {testData?.title || 'CATrix Examination'} — Declaration
        </Typography>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          padding: '40px 60px',
          backgroundColor: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={0}
            sx={{
              padding: '40px',
              backgroundColor: '#fafafa',
              border: '1px solid #e0e0e0',
            }}
          >
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                marginBottom: '32px',
                color: '#333',
                textAlign: 'center',
              }}
            >
              Examination Agreement
            </Typography>

            <Box sx={{ marginBottom: '24px' }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxes.readInstructions}
                    onChange={() => handleCheckboxChange('readInstructions')}
                    sx={{
                      color: '#1976d2',
                      '&.Mui-checked': { color: '#1976d2' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    I have read and understood all instructions carefully.
                  </Typography>
                }
                sx={{ marginBottom: '16px' }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxes.understandTiming}
                    onChange={() => handleCheckboxChange('understandTiming')}
                    sx={{
                      color: '#1976d2',
                      '&.Mui-checked': { color: '#1976d2' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    I understand section timing and cannot switch sections after time expires.
                  </Typography>
                }
                sx={{ marginBottom: '16px' }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxes.understandAutoSubmit}
                    onChange={() => handleCheckboxChange('understandAutoSubmit')}
                    sx={{
                      color: '#1976d2',
                      '&.Mui-checked': { color: '#1976d2' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    I agree that my responses will auto-submit if time expires.
                  </Typography>
                }
                sx={{ marginBottom: '16px' }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxes.understandTracking}
                    onChange={() => handleCheckboxChange('understandTracking')}
                    sx={{
                      color: '#1976d2',
                      '&.Mui-checked': { color: '#1976d2' },
                    }}
                  />
                }
                label={
                  <Typography variant="body2" sx={{ color: '#555' }}>
                    I understand that window focus switching and certain actions will be tracked.
                  </Typography>
                }
                sx={{ marginBottom: '24px' }}
              />
            </Box>

            <Box
              sx={{
                backgroundColor: '#fff3cd',
                padding: '16px',
                borderRadius: '4px',
                marginBottom: '24px',
              }}
            >
              <FormControlLabel
                control={
                  <Checkbox
                    checked={checkboxes.readyToBegin}
                    onChange={() => handleCheckboxChange('readyToBegin')}
                    sx={{
                      color: '#d98c26',
                      '&.Mui-checked': { color: '#d98c26' },
                    }}
                  />
                }
                label={
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#856404',
                      fontWeight: 600,
                    }}
                  >
                    I am ready to begin the examination. I understand this is a point of no return.
                  </Typography>
                }
              />
            </Box>

            <Typography
              variant="caption"
              sx={{
                display: 'block',
                color: '#999',
                textAlign: 'center',
                marginBottom: '32px',
              }}
            >
              Once you start, your exam window will open. Do not close it.
            </Typography>
          </Paper>
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
          gap: '16px',
        }}
      >
        <Button
          variant="outlined"
          onClick={handleBack}
          sx={{
            color: '#1976d2',
            borderColor: '#1976d2',
            padding: '10px 30px',
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '4px',
            '&:hover': { backgroundColor: '#f5f5f5' },
          }}
        >
          Back
        </Button>

        <Button
          variant="contained"
          onClick={handleStartTest}
          disabled={!allChecked}
          sx={{
            backgroundColor: allChecked ? '#d32f2f' : '#ccc',
            color: '#ffffff',
            padding: '10px 40px',
            fontSize: '16px',
            fontWeight: 600,
            textTransform: 'none',
            borderRadius: '4px',
            cursor: allChecked ? 'pointer' : 'not-allowed',
            '&:hover': allChecked ? { backgroundColor: '#b71c1c' } : {},
          }}
        >
          Start Test
        </Button>
      </Box>
    </Box>
  );
};

export default ExamDeclaration;
