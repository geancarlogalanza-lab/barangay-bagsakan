import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/authcontext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Beneficiaries from './pages/Beneficiaries';
import Matching from './pages/Matching';
import QRGeneration from './pages/QRGeneration';
import Verification from './pages/Verification';

function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['admin', 'donor', 'volunteer']}>
              <>
                <Navbar />
                <div className="app-container">
                  <Dashboard />
                </div>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/beneficiaries" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <>
                <Navbar />
                <div className="app-container">
                  <Beneficiaries />
                </div>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/matching" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <>
                <Navbar />
                <div className="app-container">
                  <Matching />
                </div>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/qr" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <>
                <Navbar />
                <div className="app-container">
                  <QRGeneration />
                </div>
              </>
            </ProtectedRoute>
          } />
          
          <Route path="/verify" element={
            <ProtectedRoute allowedRoles={['admin', 'volunteer']}>
              <>
                <Navbar />
                <div className="app-container">
                  <Verification />
                </div>
              </>
            </ProtectedRoute>
          } />
        </Routes>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;