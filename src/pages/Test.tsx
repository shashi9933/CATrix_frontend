import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  LinearProgress,
  Alert,
} from '@mui/material';
import {
  Timer as TimerIcon,
  NavigateBefore as PrevIcon,
  NavigateNext as NextIcon,
  Flag as FlagIcon,
  FlagOutlined as FlagOutlinedIcon,
} from '@mui/icons-material';
import { testAPI } from '../utils/api';
import { useAuth } from '../contexts/AuthContext';

interface Question {
  id: string;
  questionText: string;
  options: any[];
  correctAnswer: string;
  marks: number;
  difficulty?: string;
  section?: string;
}

interface Test {
  id: string;
  title: string;
  duration: number;
  totalMarks: number;
  section: string;
  questions: Question[];
}

interface Answer {
  questionId: string;
  answer: string | null;
  flagged: boolean;
  attemptedAt: number;
}

const Test = () => {
  const { testId } = useParams<{ testId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [test, setTest] = useState<Test | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSummary, setShowSummary] = useState(false);
  const [confirmSubmit, setConfirmSubmit] = useState(false);

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      try {
        if (!user) {
          navigate('/login');
          return;
        }

        if (!testId) {
          setError('No test ID provided');
          setLoading(false);
          return;
        }

        const response = await testAPI.getById(testId);
        const testData = response.data;
        
        // Map questions to ensure they have all required fields
        const mappedQuestions = testData.questions.map((q: any, index: number) => ({
          id: q.id || `q-${index}`,
          questionText: q.questionText || '',
          options: q.options ? (typeof q.options === 'string' ? JSON.parse(q.options) : q.options) : [],
          correctAnswer: q.correctAnswer || '',
          marks: q.marks || 3,
          difficulty: q.difficulty || 'MEDIUM',
          section: q.section || 'QA',
        }));

        setTest({
          ...testData,
          questions: mappedQuestions,
        });

        // Initialize time in seconds
        setTimeLeft(testData.duration * 60);

        // Initialize answers map
        const initialAnswers = new Map<string, Answer>();
        mappedQuestions.forEach((q: Question) => {
          initialAnswers.set(q.id, {
            questionId: q.id,
            answer: null,
            flagged: false,
            attemptedAt: 0,
          });
        });
        setAnswers(initialAnswers);

        setLoading(false);
      } catch (err) {
        console.error('Error loading test:', err);
        setError('Failed to load test. Please try again.');
        setLoading(false);
      }
    };

    loadTest();
  }, [testId, user, navigate]);

  // Timer countdown
  useEffect(() => {
    if (!test || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [test, timeLeft]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = test?.questions[currentQuestionIndex];
  const currentAnswer = currentQuestion ? answers.get(currentQuestion.id) : null;

  const handleAnswerChange = (answer: string) => {
    if (!currentQuestion) return;
    const newAnswers = new Map(answers);
    newAnswers.set(currentQuestion.id, {
      ...newAnswers.get(currentQuestion.id)!,
      answer,
      attemptedAt: Date.now(),
    });
    setAnswers(newAnswers);
  };

  const handleToggleFlag = () => {
    if (!currentQuestion) return;
    const newAnswers = new Map(answers);
    const current = newAnswers.get(currentQuestion.id)!;
    newAnswers.set(currentQuestion.id, {
      ...current,
      flagged: !current.flagged,
    });
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmitTest = () => {
    setConfirmSubmit(false);
    setShowSummary(true);
  };

  const getQuestionStatus = (index: number) => {
    const answer = answers.get(test!.questions[index].id);
    if (!answer) return 'notVisited';
    if (answer.flagged) return 'flagged';
    if (answer.answer) return 'answered';
    return 'visited';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return '#22ab94';
      case 'flagged':
        return '#ff7b54';
      case 'visited':
        return '#3d5afe';
      case 'notVisited':
        return '#e0e0e0';
      default:
        return '#e0e0e0';
    }
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading test...</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
        <Button onClick={() => navigate('/test-series')} sx={{ mt: 2 }}>
          Back to Test Series
        </Button>
      </Box>
    );
  }

  if (!test || !currentQuestion) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">Test data not found</Alert>
      </Box>
    );
  }

  if (showSummary) {
    const answeredCount = Array.from(answers.values()).filter((a) => a.answer).length;
    const flaggedCount = Array.from(answers.values()).filter((a) => a.flagged).length;

    return (
      <Box sx={{ p: 3, maxWidth: 1200, mx: 'auto' }}>
        <Typography variant="h4" gutterBottom>
          Test Summary
        </Typography>
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Questions
                </Typography>
                <Typography variant="h5">{test.questions.length}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Answered
                </Typography>
                <Typography variant="h5" sx={{ color: '#22ab94' }}>
                  {answeredCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Flagged
                </Typography>
                <Typography variant="h5" sx={{ color: '#ff7b54' }}>
                  {flaggedCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Not Attempted
                </Typography>
                <Typography variant="h5" sx={{ color: '#e0e0e0' }}>
                  {test.questions.length - answeredCount}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Typography variant="h6" gutterBottom>
          Question Status
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 3 }}>
          {test.questions.map((q, index) => {
            const status = getQuestionStatus(index);
            return (
              <Box
                key={q.id}
                onClick={() => {
                  setShowSummary(false);
                  setCurrentQuestionIndex(index);
                }}
                sx={{
                  width: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: 1,
                  bgcolor: getStatusColor(status),
                  color: status === 'notVisited' ? 'text.secondary' : 'white',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: 12,
                  '&:hover': {
                    opacity: 0.8,
                  },
                }}
              >
                {index + 1}
              </Box>
            );
          })}
        </Box>

        <Box sx={{ display: 'flex', gap: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={() => {
              setShowSummary(false);
              setCurrentQuestionIndex(0);
            }}
          >
            Continue Test
          </Button>
          <Button variant="outlined" color="primary" onClick={() => navigate('/test-series')}>
            Back to Test Series
          </Button>
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Main Test Area */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {/* Header */}
        <Paper
          sx={{
            p: 2,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: 0,
          }}
          elevation={2}
        >
          <Typography variant="h6">{test.title}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TimerIcon color={timeLeft < 600 ? 'error' : 'primary'} />
              <Typography variant="h6" sx={{ color: timeLeft < 600 ? 'error.main' : 'text.primary' }}>
                {formatTime(timeLeft)}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="error"
              onClick={() => setConfirmSubmit(true)}
            >
              Submit Test
            </Button>
          </Box>
        </Paper>

        {/* Question Counter */}
        <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="subtitle2">
            Question {currentQuestionIndex + 1} of {test.questions.length}
          </Typography>
          <LinearProgress
            variant="determinate"
            value={((currentQuestionIndex + 1) / test.questions.length) * 100}
            sx={{ mt: 1 }}
          />
        </Box>

        {/* Question Content */}
        <Box sx={{ flex: 1, p: 3, overflowY: 'auto' }}>
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                <Box>
                  <Chip label={currentQuestion.section} size="small" sx={{ mr: 1 }} />
                  <Chip
                    label={currentQuestion.difficulty}
                    size="small"
                    color={
                      currentQuestion.difficulty === 'HARD'
                        ? 'error'
                        : currentQuestion.difficulty === 'MEDIUM'
                        ? 'warning'
                        : 'success'
                    }
                  />
                </Box>
                <Typography variant="caption" color="textSecondary">
                  Marks: {currentQuestion.marks}
                </Typography>
              </Box>
              <Typography variant="h6" paragraph>
                {currentQuestion.questionText}
              </Typography>

              {/* Options */}
              <Box sx={{ mt: 3 }}>
                {currentQuestion.options.length > 0 ? (
                  <RadioGroup
                    value={currentAnswer?.answer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={String(index)}
                        control={<Radio />}
                        label={typeof option === 'string' ? option : option.text || option}
                        sx={{
                          p: 2,
                          mb: 1,
                          border: 1,
                          borderColor: 'divider',
                          borderRadius: 1,
                          '&:hover': {
                            bgcolor: 'action.hover',
                          },
                        }}
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <TextField
                    fullWidth
                    label="Enter your answer"
                    value={currentAnswer?.answer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here"
                    multiline
                    rows={3}
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Navigation */}
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'space-between', bgcolor: 'background.paper', borderTop: 1, borderColor: 'divider' }}>
          <Button
            variant="outlined"
            startIcon={<PrevIcon />}
            onClick={handlePrevQuestion}
            disabled={currentQuestionIndex === 0}
          >
            Previous
          </Button>
          <Button
            variant={currentAnswer?.flagged ? 'contained' : 'outlined'}
            color={currentAnswer?.flagged ? 'warning' : 'primary'}
            startIcon={currentAnswer?.flagged ? <FlagIcon /> : <FlagOutlinedIcon />}
            onClick={handleToggleFlag}
          >
            {currentAnswer?.flagged ? 'Flagged' : 'Flag'}
          </Button>
          <Button
            variant="outlined"
            endIcon={<NextIcon />}
            onClick={handleNextQuestion}
            disabled={currentQuestionIndex === test.questions.length - 1}
          >
            Next
          </Button>
        </Box>
      </Box>

      {/* Sidebar - Question Palette */}
      <Paper
        sx={{
          width: 280,
          p: 2,
          borderRadius: 0,
          overflowY: 'auto',
          display: { xs: 'none', md: 'block' },
        }}
        elevation={0}
      >
        <Typography variant="subtitle1" gutterBottom>
          Question Palette
        </Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 1 }}>
          {test.questions.map((q, index) => {
            const status = getQuestionStatus(index);
            return (
              <Box
                key={q.id}
                onClick={() => handleGoToQuestion(index)}
                sx={{
                  width: '100%',
                  paddingBottom: '100%',
                  position: 'relative',
                }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 1,
                    bgcolor: getStatusColor(status),
                    color: status === 'notVisited' ? 'text.secondary' : 'white',
                    cursor: 'pointer',
                    fontWeight: 'bold',
                    border: currentQuestionIndex === index ? 3 : 0,
                    borderColor: 'primary.main',
                    '&:hover': {
                      opacity: 0.8,
                    },
                  }}
                >
                  {index + 1}
                </Box>
              </Box>
            );
          })}
        </Box>

        {/* Status Legend */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
          <Typography variant="caption" display="block" gutterBottom>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#22ab94', borderRadius: 0.5 }} />
              Answered
            </Box>
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#ff7b54', borderRadius: 0.5 }} />
              Flagged
            </Box>
          </Typography>
          <Typography variant="caption" display="block" gutterBottom>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#3d5afe', borderRadius: 0.5 }} />
              Visited
            </Box>
          </Typography>
          <Typography variant="caption" display="block">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 16, height: 16, bgcolor: '#e0e0e0', borderRadius: 0.5 }} />
              Not Visited
            </Box>
          </Typography>
        </Box>
      </Paper>

      {/* Submit Confirmation Dialog */}
      <Dialog open={confirmSubmit} onClose={() => setConfirmSubmit(false)}>
        <DialogTitle>Submit Test</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to submit the test? You won't be able to change your answers after submission.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmSubmit(false)}>Cancel</Button>
          <Button onClick={handleSubmitTest} variant="contained" color="error">
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Test;
