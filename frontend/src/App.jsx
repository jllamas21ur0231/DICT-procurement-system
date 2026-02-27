import { Routes, Route, Navigate } from 'react-router-dom';
import './css/App.css';

import MainLayout from './components/MainLayout';
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Procurement from './pages/Procurement';
import PPMP from './pages/PPMP';
import PurchaseRequest from './pages/PurchaseRequest';
import CreatePurchaseRequest from './pages/CreatePurchaseRequest'; // ✅ ADD THIS
import CheckEmail from './pages/CheckEmail';
import NotFound from './pages/NotFound';
import AddProcurement from './pages/AddProcurement';
import VerificationFailed from './pages/VerificationFailed';
import OTP from './pages/OTP';
import LoadingScreen from './pages/LoadingScreen';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />
      
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signin-otp" element={<OTP />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/verification-failed" element={<VerificationFailed />} />
      <Route path="/loading-screen" element={<LoadingScreen />} />

      <Route path="/dashboard" element={<MainLayout><Dashboard /></MainLayout>} />
      <Route path="/procurement" element={<MainLayout><Procurement /></MainLayout>} />
      <Route path="/add-procurement" element={<MainLayout><AddProcurement /></MainLayout>} />
      {/* <Route path="/ppmp" element={<MainLayout><PPMP /></MainLayout>} /> */}
      <Route path="/purchase-request" element={<MainLayout><PurchaseRequest /></MainLayout>} />
      <Route path="/create-purchase-request" element={<MainLayout><CreatePurchaseRequest /></MainLayout>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
