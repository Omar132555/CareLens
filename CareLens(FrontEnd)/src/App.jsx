import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/home.jsx";
import ChatCareLens from "./pages/ChatCareLens.jsx";
import "./styles/main.css";
import "./styles/design-system.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CompleteProfile from "./pages/CompleteProfile.jsx";
import MedicalProfile from "./pages/MedicalProfile.jsx";
import Test from "./pages/test.jsx";
import ForgetPassword from "./pages/Auth/forget.jsx";
import ResetPassword from "./pages/Auth/reset.jsx";
import EmergencyAlert from "./pages/EmergencyAlert.jsx";
import TreatmentFollowup from "./pages/TreatmentFollowup.jsx";
import PatientDashboard from "./pages/PatientDashboard.jsx";
import MedicationReminders from "./pages/MedicationReminders.jsx";
import SymptomTracker from "./pages/SymptomTracker.jsx";
import Articles from "./pages/Articles.jsx";
import ArticleDetail from "./pages/ArticleDetail.jsx";
import SavedArticles from "./pages/SavedArticles.jsx";
import AccountSettings from "./pages/AccountSettings.jsx";
import NotFound from "./pages/NotFound.jsx";
import ServiceUnavailable from "./pages/ServiceUnavailable.jsx";
import DoctorCategoryModal from "./components/DoctorCategoryModal.jsx";
import Forbidden from "./pages/Forbidden.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import AdminDashboard from "./pages/AdminDashboard.jsx";
import Doctors from "./pages/Doctors.jsx";

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/CompleteProfile" element={<CompleteProfile />} />
      <Route path="/medical-profile" element={<MedicalProfile />} />
      <Route
        path="/patient-dashboard"
        element={
          <ProtectedRoute allowedRoles={["patient"]}>
            <PatientDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctor-dashboard"
        element={
          <ProtectedRoute allowedRoles={["doctor"]}>
            <DoctorDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin-dashboard"
        element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/medications"
        element={
          <ProtectedRoute>
            <MedicationReminders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/doctors"
        element={
          <ProtectedRoute>
            <Doctors />
          </ProtectedRoute>
        }
      />
      <Route
        path="/symptoms"
        element={
          <ProtectedRoute>
            <SymptomTracker />
          </ProtectedRoute>
        }
      />
      <Route
        path="/articles"
        element={
          <ProtectedRoute>
            <Articles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/articles/:id"
        element={
          <ProtectedRoute>
            <ArticleDetail />
          </ProtectedRoute>
        }
      />
      <Route
        path="/articles/saved"
        element={
          <ProtectedRoute>
            <SavedArticles />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <AccountSettings />
          </ProtectedRoute>
        }
      />
      <Route
        path="/chat-ai/:id"
        element={
          <ProtectedRoute>
            <ChatCareLens />
          </ProtectedRoute>
        }
      />
      <Route
        path="/Doctor/Category/Select"
        element={
            <DoctorCategoryModal />
        }
      />
      <Route
        path="/emergency-alert"
        element={
          <ProtectedRoute>
            <EmergencyAlert />
          </ProtectedRoute>
        }
      />
      <Route
        path="/treatment-followup"
        element={
          <ProtectedRoute>
            <TreatmentFollowup />
          </ProtectedRoute>
        }
      />
      <Route path="/forget-password" element={<ForgetPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/test" element={<Test />} />
      <Route path="/service-unavailable" element={<ServiceUnavailable />} />
      <Route path="/503" element={<ServiceUnavailable />} />
      <Route path="/not-found" element={<NotFound />} />
      <Route path="/forbidden" element={<Forbidden />} />
      <Route path="*" element={<Navigate to="/not-found" replace />} />
    </Routes>
  );
}

export default App;
