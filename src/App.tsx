import { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { fetchAuthSession, getCurrentUser } from 'aws-amplify/auth';
import { Hub } from 'aws-amplify/utils';
import { withAuthenticator } from '@aws-amplify/ui-react';
import HomePage from './pages/HomePage';
import TestPage from './pages/TestPage';
import ResultsPage from './pages/ResultsPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminTestCreate from './pages/admin/AdminTestCreate';
import AdminQuestionManagement from './pages/admin/AdminQuestionManagement';
import AdminTestManagement from './pages/admin/AdminTestManagement';
import Header from './components/Header';
import Footer from './components/Footer';
import './App.css';

// Auth type definition
type AuthUserType = {
  username: string;
  userId: string;
  signInDetails?: {
    loginId?: string;
  };
  groups?: string[];
};

// Hub payload type
interface HubPayload {
  event: string;
  data?: any;
}

function App() {
  const [userInfo, setUserInfo] = useState<AuthUserType | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    async function checkAuth() {
      try {
        // Get current authenticated user
        const currentUser = await getCurrentUser();
        
        // Get session to check groups
        const session = await fetchAuthSession();
        
        // Extract groups from token payload
        const cognitoGroups = session.tokens?.accessToken?.payload['cognito:groups'];
        
        // Convert to string array if it exists
        const groups = Array.isArray(cognitoGroups) 
          ? cognitoGroups as string[] 
          : cognitoGroups 
            ? [cognitoGroups as string] 
            : [];
        
        setUserInfo({
          username: currentUser.username,
          userId: currentUser.userId,
          signInDetails: currentUser.signInDetails ? {
            loginId: currentUser.signInDetails.loginId || undefined
          } : undefined,
          groups: groups
        });
        
        // Check if user is in Admin group
        setIsAdmin(groups.includes('Admin'));
      } catch (error) {
        console.log('Not authenticated');
        setUserInfo(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    checkAuth();

    // Listen for auth events
    const unsubscribe = Hub.listen('auth', ({ payload }: { payload: HubPayload }) => {
      switch (payload.event) {
        case 'signedIn':
          checkAuth();
          break;
        case 'signedOut':
          setUserInfo(null);
          setIsAdmin(false);
          break;
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <div className="loading">Loading...</div>;
  }

  // Check if URL is a test taking page and don't show header/footer
  const isTestPage = location.pathname.startsWith('/test/') && location.pathname.includes('/take');

  return (
    <div className="app-container">
      {!isTestPage && <Header isAdmin={isAdmin} />}
      
      <main className="main-content">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/test/:testId/take" element={<TestPage />} />
          <Route path="/test/:testId/results/:responseId" element={<ResultsPage />} />
          
          {/* Admin routes */}
          <Route 
            path="/admin" 
            element={isAdmin ? <AdminDashboard /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/tests/create" 
            element={isAdmin ? <AdminTestCreate /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/questions" 
            element={isAdmin ? <AdminQuestionManagement /> : <Navigate to="/" />} 
          />
          <Route 
            path="/admin/tests/:testId" 
            element={isAdmin ? <AdminTestManagement /> : <Navigate to="/" />} 
          />
          
          {/* Fallback route */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      
      {!isTestPage && <Footer />}
    </div>
  );
}

export default withAuthenticator(App);