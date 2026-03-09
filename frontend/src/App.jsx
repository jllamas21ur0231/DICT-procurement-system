import { Routes, Route, Navigate } from 'react-router-dom';
import './css/App.css';
import PPMP from './pages/PPMP';
import MainLayout from './components/MainLayout';
import ProtectedRoute from './components/ProtectedRoute';
import SAdminProtectedRoute from './components/SAdminProtectedRoute';
import ProcurementDetails from "./pages/ProcurementDetails";
import EditProcurement from "./pages/EditProcurement";
import EditPurchaseRequest from "./pages/EditPurchaseRequest";
import SignIn from './pages/SignIn';
import Dashboard from './pages/Dashboard';
import Procurement from './pages/Procurement';
import PurchaseRequest from './pages/PurchaseRequest';
import CreatePurchaseRequest from './pages/CreatePurchaseRequest';
import CheckEmail from './pages/CheckEmail';
import NotFound from './pages/NotFound';
import AddProcurement from './pages/AddProcurement';
import VerificationFailed from './pages/VerificationFailed';
import OTP from './pages/OTP';
import LoadingScreen from './pages/LoadingScreen';
import ViewPurchaseRequest from "./pages/ViewPurchaseRequest";
import SAdminMainLayout from './components/sAdminMainLayout';
import SAdminSignIn from './pages/sAdmin/sAdminSignIn';
import SAdminOTP from './pages/sAdmin/sAdminOTP';
import SAdminDashboard from './pages/sAdmin/sAdminDashboard';
import SAdminProcurement from './pages/sAdmin/sAdminProcurement';
import SAdminAddProcurement from './pages/sAdmin/sAdminAddProcurement';
import Users from './pages/sAdmin/Users';


function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/signin" replace />} />

      {/* ── Public routes ───────────────────────────────────────────────────── */}
      <Route path="/signin" element={<SignIn />} />
      <Route path="/signin-otp" element={<OTP />} />
      <Route path="/check-email" element={<CheckEmail />} />
      <Route path="/verification-failed" element={<VerificationFailed />} />
      <Route path="/loading-screen" element={<LoadingScreen />} />

      {/* ── Protected end-user routes ────────────────────────────────────────── */}
      <Route path="/purchase-requests/:id" element={<ProtectedRoute><MainLayout><ViewPurchaseRequest /></MainLayout></ProtectedRoute>} />
      <Route path="/dashboard" element={
        <ProtectedRoute><MainLayout><Dashboard /></MainLayout></ProtectedRoute>
      } />
      <Route path="/ppmp" element={
        <ProtectedRoute><MainLayout><PPMP /></MainLayout></ProtectedRoute>
      } />
      <Route path="/procurement" element={
        <ProtectedRoute><MainLayout><Procurement /></MainLayout></ProtectedRoute>
      } />
      <Route path="/add-procurement" element={
        <ProtectedRoute><MainLayout><AddProcurement /></MainLayout></ProtectedRoute>
      } />
      <Route path="/procurement/:id/edit" element={<ProtectedRoute><MainLayout><EditProcurement /></MainLayout></ProtectedRoute>} />
      <Route path="/procurement/:id/purchase-request/:prId/edit" element={<ProtectedRoute><MainLayout><EditPurchaseRequest /></MainLayout></ProtectedRoute>} />
      <Route path="/procurement/:id" element={<ProtectedRoute><MainLayout><ProcurementDetails /></MainLayout></ProtectedRoute>} />
      <Route path="/purchase-request" element={
        <ProtectedRoute><MainLayout><PurchaseRequest /></MainLayout></ProtectedRoute>
      } />
      <Route path="/create-purchase-request" element={
        <ProtectedRoute><MainLayout><CreatePurchaseRequest /></MainLayout></ProtectedRoute>
      } />

      {/* ── Public sAdmin routes ─────────────────────────────────────────────── */}
      <Route path="/sadmin/signin" element={<SAdminSignIn />} />
      <Route path="/sadmin/otp" element={<SAdminOTP />} />

      {/* ── Protected sAdmin routes ──────────────────────────────────────────── */}
      <Route path="/sadmin/dashboard" element={
        <SAdminProtectedRoute><SAdminMainLayout><SAdminDashboard /></SAdminMainLayout></SAdminProtectedRoute>
      } />
      <Route path="/sadmin/users" element={
        <SAdminProtectedRoute><SAdminMainLayout><Users /></SAdminMainLayout></SAdminProtectedRoute>
      } />
      <Route path="/sadmin/procurement" element={
        <SAdminProtectedRoute><SAdminMainLayout><SAdminProcurement /></SAdminMainLayout></SAdminProtectedRoute>
      } />
      <Route path="/sadmin/add-procurement" element={
        <SAdminProtectedRoute><SAdminMainLayout><SAdminAddProcurement /></SAdminMainLayout></SAdminProtectedRoute>
      } />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
