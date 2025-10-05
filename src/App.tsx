import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './contexts/AppContext';
import Login from './pages/Login';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/layout/DashboardLayout';
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import UpcomingProjects from './pages/UpcomingProjects';
import OngoingProjects from './pages/OngoingProjects';
import Servers from './pages/Servers';
import Domains from './pages/Domains';
import Team from './pages/Team';
import { Toaster } from './components/ui/toaster';

function AppRoutes() {
  const { isAuthenticated } = useApp();

  return (
    <Routes>
      <Route path="/" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
      </Route>
      <Route
        path="/projects"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Projects />} />
      </Route>
      <Route
        path="/upcoming"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<UpcomingProjects />} />
      </Route>
      <Route
        path="/ongoing"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<OngoingProjects />} />
      </Route>
      <Route
        path="/servers"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Servers />} />
      </Route>
      <Route
        path="/domains"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Domains />} />
      </Route>
      <Route
        path="/team"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Team />} />
      </Route>
      {/* 404 Route - Must be last */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </AppProvider>
  );
}

export default App;
