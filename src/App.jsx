import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import Beneficiaries from './pages/Beneficiaries';
import Matching from './pages/Matching';
import QRGeneration from './pages/QRGeneration';
import Verification from './pages/Verification';

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <div style={{ padding: '2rem' }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/beneficiaries" element={<Beneficiaries />} />
          <Route path="/matching" element={<Matching />} />
          <Route path="/qr" element={<QRGeneration />} />
          <Route path="/verify" element={<Verification />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;