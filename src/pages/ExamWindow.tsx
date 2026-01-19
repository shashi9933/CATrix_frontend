import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Box, Typography, Button, Radio, RadioGroup, FormControlLabel, TextField, Dialog, DialogTitle, DialogContent, DialogActions } from '@mui/material';
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
  visitedAt: number;
}

const ExamWindow = () => {
  const { testId } = useParams<{ testId: string }>();
  const { user, loading } = useAuth();

  const [test, setTest] = useState<Test | null>(null);
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Map<string, Answer>>(new Map());
  const [timeLeft, setTimeLeft] = useState(0);
  const [testLoading, setTestLoading] = useState(true);
  const [confirmSubmit, setConfirmSubmit] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load test data
  useEffect(() => {
    const loadTest = async () => {
      // Wait for auth loading to complete before loading test
      if (loading) {
        console.log('⏳ Waiting for authentication to complete...');
        return;
      }

      try {
        if (!testId) {
          console.error('❌ No testId provided');
          setTestLoading(false);
          return;
        }

        console.log('📋 Loading test:', testId);

        const response = await testAPI.getById(testId);
        const testData = response.data;

        if (!testData) {
          console.error('❌ No test data returned');
          setTestLoading(false);
          return;
        }

        console.log('✅ Test loaded:', testData.title);

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

        setTimeLeft(testData.duration * 60);

        const initialAnswers = new Map<string, Answer>();
        mappedQuestions.forEach((q: Question) => {
          initialAnswers.set(q.id, {
            questionId: q.id,
            answer: null,
            flagged: false,
            visitedAt: 0,
          });
        });
        setAnswers(initialAnswers);

        // Start test attempt (only if user is authenticated)
        if (user) {
          try {
            console.log('🚀 Starting test attempt for user:', user.id);
            const attemptResponse = await testAPI.startAttempt(testId);
            setAttemptId(attemptResponse.data.id);
            console.log('✅ Attempt started:', attemptResponse.data.id);
          } catch (err) {
            console.warn('⚠️ Could not create attempt record:', err);
            // Don't fail if we can't create attempt - exam can still be taken
          }
        } else {
          console.warn('⚠️ User not authenticated, attempt tracking disabled');
        }

        setTestLoading(false);
      } catch (err: any) {
        console.error('❌ Error loading test:', err);
        if (err.response?.status === 404) {
          console.error('Test not found (404). TestID:', testId);
        } else if (err.response?.status === 401) {
          console.error('Unauthorized (401). Auth token may be missing.');
        }
        setTestLoading(false);
      }
    };

    loadTest();
  }, [testId, loading]); // Depend on loading instead of user to prevent re-runs

  // Timer countdown
  useEffect(() => {
    if (!test || timeLeft <= 0 || submitted) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [test, timeLeft, submitted]);

  // Auto-save every 30 seconds
  useEffect(() => {
    if (!test || submitted) return;

    const interval = setInterval(() => {
      // Auto-save logic would go here
      console.log('Auto-saving answers...');
    }, 30000);

    return () => clearInterval(interval);
  }, [test, answers, submitted]);

  // Disable right-click
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    return () => document.removeEventListener('contextmenu', handleContextMenu);
  }, []);

  // Track window blur
  useEffect(() => {
    const handleBlur = () => {
      console.log('Window blur detected - tracking attempt');
    };

    const handleFocus = () => {
      console.log('Window focused again');
    };

    window.addEventListener('blur', handleBlur);
    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('blur', handleBlur);
      window.removeEventListener('focus', handleFocus);
    };
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };



  const handleAnswerChange = (answer: string) => {
    if (!currentQuestion || !attemptId) return;
    const newAnswers = new Map(answers);
    const existing = newAnswers.get(currentQuestion.id)!;
    newAnswers.set(currentQuestion.id, {
      ...existing,
      answer,
      visitedAt: existing.visitedAt || Date.now(),
    });
    setAnswers(newAnswers);

    // Auto-save to backend
    testAPI.saveAnswer(attemptId, currentQuestion.id, answer)
      .then(() => {
        console.log('Answer saved:', currentQuestion.id);
      })
      .catch((err) => {
        console.error('Error saving answer:', err);
      });
  };

  const handleClearResponse = () => {
    if (!currentQuestion) return;
    const newAnswers = new Map(answers);
    const existing = newAnswers.get(currentQuestion.id)!;
    newAnswers.set(currentQuestion.id, {
      ...existing,
      answer: null,
    });
    setAnswers(newAnswers);
  };

  const handleMarkForReview = () => {
    if (!currentQuestion) return;
    const newAnswers = new Map(answers);
    const existing = newAnswers.get(currentQuestion.id)!;
    newAnswers.set(currentQuestion.id, {
      ...existing,
      flagged: !existing.flagged,
    });
    setAnswers(newAnswers);
  };

  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (test && currentQuestionIndex < test.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleGoToQuestion = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleAutoSubmit = () => {
    if (!attemptId) return;
    setSubmitted(true);
    // Submit attempt to backend
    testAPI.submitAttempt(attemptId)
      .then(() => {
        console.log('Test submitted:', attemptId);
      })
      .catch((err) => {
        console.error('Error submitting test:', err);
      });
  };

  const handleManualSubmit = () => {
    setConfirmSubmit(false);
    if (!attemptId) return;
    setSubmitted(true);
    // Submit attempt to backend
    testAPI.submitAttempt(attemptId)
      .then(() => {
        console.log('Test submitted:', attemptId);
      })
      .catch((err) => {
        console.error('Error submitting test:', err);
      });
  };

  const getQuestionStatus = (index: number) => {
    const answer = answers.get(test!.questions[index].id);
    if (!answer || answer.visitedAt === 0) return 'notVisited';
    if (answer.flagged && answer.answer) return 'answeredMarked';
    if (answer.flagged) return 'marked';
    if (answer.answer) return 'answered';
    return 'visited';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'answered':
        return '#4CAF50'; // Green
      case 'answeredMarked':
        return '#9C27B0'; // Purple with tick
      case 'marked':
        return '#9C27B0'; // Purple
      case 'visited':
        return '#FF9800'; // Orange
      case 'notVisited':
        return '#E0E0E0'; // Gray
      default:
        return '#E0E0E0';
    }
  };

  if (testLoading) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff', fontFamily: '"Segoe UI", Arial, sans-serif' }}>
        <Typography sx={{ fontSize: '16px', color: '#666' }}>Please wait… Exam is loading</Typography>
      </Box>
    );
  }

  if (!test) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff', fontFamily: '"Segoe UI", Arial, sans-serif' }}>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: '16px', color: '#d32f2f', marginBottom: '16px' }}>Error loading exam</Typography>
          <Typography sx={{ fontSize: '12px', color: '#999', marginBottom: '16px' }}>Please check the browser console for details</Typography>
          <Button onClick={() => window.location.reload()}>Reload</Button>
        </Box>
      </Box>
    );
  }

  if (!test.questions || test.questions.length === 0) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff', fontFamily: '"Segoe UI", Arial, sans-serif' }}>
        <Typography sx={{ fontSize: '16px', color: '#d32f2f' }}>No questions found in this test</Typography>
      </Box>
    );
  }

  const currentQuestion = test.questions[currentQuestionIndex];

  if (!currentQuestion) {
    return (
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', backgroundColor: '#fff', fontFamily: '"Segoe UI", Arial, sans-serif' }}>
        <Typography sx={{ fontSize: '16px', color: '#d32f2f' }}>Error: Current question not found. Please refresh.</Typography>
      </Box>
    );
  }

  const currentAnswer = answers.get(currentQuestion.id) || null;

  if (submitted) {
    const answeredCount = Array.from(answers.values()).filter((a) => a.answer).length;
    const markedCount = Array.from(answers.values()).filter((a) => a.flagged).length;
    const notAttempted = test.questions.length - answeredCount;

    return (
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#fff',
          fontFamily: '"Segoe UI", Arial, sans-serif',
          flexDirection: 'column',
          padding: '40px',
        }}
      >
        <Typography sx={{ fontSize: '24px', fontWeight: 600, marginBottom: '20px', color: '#333' }}>
          ✓ Test Submitted
        </Typography>
        <Typography sx={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
          Your responses have been saved successfully.
        </Typography>

        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginBottom: '40px' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#4CAF50' }}>{answeredCount}</Typography>
            <Typography sx={{ fontSize: '14px', color: '#666' }}>Answered</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#9C27B0' }}>{markedCount}</Typography>
            <Typography sx={{ fontSize: '14px', color: '#666' }}>Marked for Review</Typography>
          </Box>
          <Box sx={{ textAlign: 'center' }}>
            <Typography sx={{ fontSize: '28px', fontWeight: 700, color: '#E0E0E0' }}>{notAttempted}</Typography>
            <Typography sx={{ fontSize: '14px', color: '#666' }}>Not Attempted</Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          onClick={() => {
            window.close();
          }}
          sx={{
            backgroundColor: '#1976d2',
            color: '#fff',
            padding: '10px 30px',
            fontSize: '16px',
            textTransform: 'none',
            borderRadius: '4px',
            '&:hover': { backgroundColor: '#1565c0' },
          }}
        >
          Close Exam Window
        </Button>
      </Box>
    );
  }

  const timerColor = timeLeft < 300 ? '#d32f2f' : '#666';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        backgroundColor: '#fff',
        fontFamily: '"Segoe UI", Roboto, Arial, sans-serif',
      }}
    >
      {/* Header - Flat & Simple */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '16px 24px',
          borderBottom: '1px solid #e0e0e0',
          backgroundColor: '#fafafa',
        }}
      >
        <Box sx={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
          <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#333' }}>
            {test.title}
          </Typography>
          <Typography sx={{ fontSize: '14px', color: '#666' }}>
            Section: {currentQuestion.section}
          </Typography>
        </Box>

        <Typography sx={{ fontSize: '16px', fontWeight: 600, color: timerColor }}>
          Time Left: {formatTime(timeLeft)}
        </Typography>
      </Box>

      {/* Main Content */}
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        {/* Left - Question */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Question Area */}
          <Box sx={{ flex: 1, overflowY: 'auto', padding: '24px', backgroundColor: '#fff' }}>
            <Box sx={{ maxWidth: '800px', margin: '0 auto' }}>
              <Typography sx={{ fontSize: '14px', color: '#999', marginBottom: '16px' }}>
                Question {currentQuestionIndex + 1} of {test.questions.length}
              </Typography>

              <Typography sx={{ fontSize: '16px', lineHeight: 1.8, color: '#333', marginBottom: '24px', fontWeight: 500 }}>
                {currentQuestion.questionText}
              </Typography>

              {/* Options */}
              <Box>
                {currentQuestion.options.length > 0 ? (
                  <RadioGroup
                    value={currentAnswer?.answer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                  >
                    {currentQuestion.options.map((option, index) => (
                      <FormControlLabel
                        key={index}
                        value={String(index)}
                        control={<Radio sx={{ color: '#1976d2' }} />}
                        label={
                          <Typography sx={{ fontSize: '14px', color: '#555', marginLeft: '8px' }}>
                            {typeof option === 'string' ? option : option.text || option}
                          </Typography>
                        }
                        sx={{
                          marginBottom: '12px',
                          padding: '12px',
                          border: '1px solid #e0e0e0',
                          borderRadius: '4px',
                          margin: '0 0 12px 0',
                          '&:hover': { backgroundColor: '#f9f9f9' },
                        }}
                      />
                    ))}
                  </RadioGroup>
                ) : (
                  <TextField
                    fullWidth
                    value={currentAnswer?.answer || ''}
                    onChange={(e) => handleAnswerChange(e.target.value)}
                    placeholder="Type your answer here"
                    multiline
                    rows={4}
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        border: '1px solid #e0e0e0',
                        borderRadius: '4px',
                        fontSize: '14px',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          </Box>

          {/* Footer Navigation */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '16px 24px',
              borderTop: '1px solid #e0e0e0',
              backgroundColor: '#fafafa',
            }}
          >
            <Button
              onClick={handlePrevQuestion}
              disabled={currentQuestionIndex === 0}
              sx={{
                fontSize: '14px',
                padding: '8px 16px',
                textTransform: 'none',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: currentQuestionIndex === 0 ? '#f0f0f0' : '#fff',
                color: currentQuestionIndex === 0 ? '#ccc' : '#666',
                cursor: currentQuestionIndex === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              Previous
            </Button>

            <Button
              onClick={handleClearResponse}
              sx={{
                fontSize: '14px',
                padding: '8px 16px',
                textTransform: 'none',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: '#fff',
                color: '#666',
              }}
            >
              Clear Response
            </Button>

            <Button
              onClick={() => {
                handleMarkForReview();
                handleNextQuestion();
              }}
              sx={{
                fontSize: '14px',
                padding: '8px 16px',
                textTransform: 'none',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: currentAnswer?.flagged ? '#fff3cd' : '#fff',
                color: '#666',
              }}
            >
              {currentAnswer?.flagged ? 'Flagged' : 'Mark'} & Next
            </Button>

            <Button
              onClick={handleNextQuestion}
              disabled={currentQuestionIndex === test.questions.length - 1}
              sx={{
                fontSize: '14px',
                padding: '8px 16px',
                textTransform: 'none',
                borderRadius: '4px',
                border: '1px solid #ddd',
                backgroundColor: currentQuestionIndex === test.questions.length - 1 ? '#f0f0f0' : '#fff',
                color: currentQuestionIndex === test.questions.length - 1 ? '#ccc' : '#666',
                cursor: currentQuestionIndex === test.questions.length - 1 ? 'not-allowed' : 'pointer',
              }}
            >
              Save & Next
            </Button>
          </Box>
        </Box>

        {/* Right - Question Palette */}
        <Box
          sx={{
            width: '240px',
            borderLeft: '1px solid #e0e0e0',
            display: 'flex',
            flexDirection: 'column',
            backgroundColor: '#fafafa',
            padding: '16px',
            overflowY: 'auto',
          }}
        >
          <Typography sx={{ fontSize: '12px', fontWeight: 700, marginBottom: '16px', color: '#333', textTransform: 'uppercase' }}>
            Question Palette
          </Typography>

          {/* Question Grid */}
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px', marginBottom: '24px' }}>
            {test.questions.map((q, index) => {
              const status = getQuestionStatus(index);
              return (
                <Box
                  key={q.id}
                  onClick={() => handleGoToQuestion(index)}
                  sx={{
                    aspectRatio: '1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: getStatusColor(status),
                    color: status === 'notVisited' ? '#999' : '#fff',
                    cursor: 'pointer',
                    fontSize: '11px',
                    fontWeight: 700,
                    borderRadius: '3px',
                    border: currentQuestionIndex === index ? '3px solid #1976d2' : 'none',
                    '&:hover': { opacity: 0.8 },
                  }}
                >
                  {index + 1}
                </Box>
              );
            })}
          </Box>

          {/* Status Legend */}
          <Box sx={{ borderTop: '1px solid #e0e0e0', paddingTop: '16px' }}>
            <Typography sx={{ fontSize: '11px', fontWeight: 700, marginBottom: '12px', color: '#333', textTransform: 'uppercase' }}>
              Status
            </Typography>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Box sx={{ width: '12px', height: '12px', backgroundColor: '#4CAF50', borderRadius: '2px' }} />
              <Typography sx={{ fontSize: '11px', color: '#666' }}>Answered</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Box sx={{ width: '12px', height: '12px', backgroundColor: '#9C27B0', borderRadius: '2px' }} />
              <Typography sx={{ fontSize: '11px', color: '#666' }}>Marked</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <Box sx={{ width: '12px', height: '12px', backgroundColor: '#FF9800', borderRadius: '2px' }} />
              <Typography sx={{ fontSize: '11px', color: '#666' }}>Visited</Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Box sx={{ width: '12px', height: '12px', backgroundColor: '#E0E0E0', borderRadius: '2px' }} />
              <Typography sx={{ fontSize: '11px', color: '#666' }}>Not Visited</Typography>
            </Box>
          </Box>

          {/* Submit Button */}
          <Button
            onClick={() => setConfirmSubmit(true)}
            sx={{
              marginTop: '24px',
              backgroundColor: '#d32f2f',
              color: '#fff',
              padding: '10px 16px',
              fontSize: '12px',
              fontWeight: 700,
              textTransform: 'uppercase',
              borderRadius: '4px',
              cursor: 'pointer',
              '&:hover': { backgroundColor: '#b71c1c' },
            }}
          >
            Submit Test
          </Button>
        </Box>
      </Box>

      {/* Submit Confirmation Dialog */}
      <Dialog
        open={confirmSubmit}
        onClose={() => setConfirmSubmit(false)}
        PaperProps={{
          sx: { borderRadius: '4px', fontFamily: '"Segoe UI", Arial, sans-serif' },
        }}
      >
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600, color: '#333' }}>
          Submit Test
        </DialogTitle>
        <DialogContent sx={{ paddingTop: '16px' }}>
          <Typography sx={{ fontSize: '14px', color: '#555', lineHeight: 1.6 }}>
            Are you sure you want to submit? You will not be able to change your answers after submission.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmSubmit(false)}
            sx={{
              fontSize: '14px',
              textTransform: 'none',
              color: '#1976d2',
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleManualSubmit}
            variant="contained"
            sx={{
              fontSize: '14px',
              textTransform: 'none',
              backgroundColor: '#d32f2f',
              color: '#fff',
              '&:hover': { backgroundColor: '#b71c1c' },
            }}
          >
            Submit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExamWindow;
