import { HashRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import Dashboard from './pages/Dashboard';
import Beneficiaries from './pages/Beneficiaries';
import Matching from './pages/Matching';
import QRGeneration from './pages/QRGeneration';
import Verification from './pages/Verification';

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={
          <>
            <Navbar />
            <div className="app-container">
              <Dashboard />
            </div>
          </>
        } />
        <Route path="/beneficiaries" element={
          <>
            <Navbar />
            <div className="app-container">
              <Beneficiaries />
            </div>
          </>
        } />
        <Route path="/matching" element={
          <>
            <Navbar />
            <div className="app-container">
              <Matching />
            </div>
          </>
        } />
        <Route path="/qr" element={
          <>
            <Navbar />
            <div className="app-container">
              <QRGeneration />
            </div>
          </>
        } />
        <Route path="/verify" element={
          <>
            <Navbar />
            <div className="app-container">
              <Verification />
            </div>
          </>
        } />
      </Routes>
    </HashRouter>
  );
}

export default App;