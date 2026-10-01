import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import AppLayout from './components/AppLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Donations from './pages/Donations';
import NewDonation from './pages/NewDonation';
import DonationDetail from './pages/DonationDetail';
import Reports from './pages/Reports';
import Users from './pages/Users';
import NotFound from './pages/NotFound';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/donations" element={<Donations />} />
            <Route
              path="/donations/new"
              element={<ProtectedRoute allowedRoles={['donor']}><NewDonation /></ProtectedRoute>}
            />
            <Route path="/donations/:id" element={<DonationDetail />} />
            <Route
              path="/reports"
              element={<ProtectedRoute allowedRoles={['admin']}><Reports /></ProtectedRoute>}
            />
            <Route
              path="/users"
              element={<ProtectedRoute allowedRoles={['admin']}><Users /></ProtectedRoute>}
            />
          </Route>

          <Route path="*" element={<NotFound />} />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
