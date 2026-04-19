import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import CandidateList from './pages/CandidateList';
import CandidateForm from './pages/CandidateForm';
import CandidateProfile from './pages/CandidateProfile';
import Settings from './pages/Settings';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="candidates" element={<CandidateList />} />
          <Route path="candidates/new" element={<CandidateForm />} />
          <Route path="candidates/:id/edit" element={<CandidateForm />} />
          <Route path="candidates/:id" element={<CandidateProfile />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
