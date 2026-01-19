import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { CustomThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import TestSeries from './pages/TestSeries';
import StudyMaterials from './pages/StudyMaterials';
import Analytics from './pages/Analytics';
import Colleges from './pages/Colleges';
import Consultation from './pages/Consultation';
import Assistant from './pages/Assistant';
import Resources from './pages/Resources';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Test from './pages/Test';
import ExamInstructions from './pages/ExamInstructions';
import ExamDeclaration from './pages/ExamDeclaration';
import ExamWindow from './pages/ExamWindow';
import AdminPanel from './pages/AdminPanel';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();

  // Show loading state while authentication is being verified
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh',
        fontFamily: '"Segoe UI", Arial, sans-serif',
        fontSize: '16px',
        color: '#666'
      }}>
        <div>
          <div style={{ marginBottom: '16px', textAlign: 'center' }}>🔐 Verifying authentication...</div>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #1976d2',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto'
          }}></div>
        </div>
      </div>
    );
  }

  // Only redirect after loading is complete and user is still null
  return user ? <>{children}</> : <Navigate to="/login" replace />;
};

const App = () => {
  return (
    <CustomThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }
            >
              <Route index element={<Dashboard />} />
              <Route path="test-series" element={<TestSeries />} />
              <Route path="exam-instructions/:testId" element={<ExamInstructions />} />
              <Route path="exam-declaration/:testId" element={<ExamDeclaration />} />
              <Route path="exam/:testId" element={<ExamWindow />} />
              <Route path="test/:testId" element={<Test />} />
              <Route path="study-materials" element={<StudyMaterials />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="colleges" element={<Colleges />} />
              <Route path="consultation" element={<Consultation />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="resources" element={<Resources />} />
              <Route path="admin" element={<AdminPanel />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </CustomThemeProvider>
  );
};

export default App;
