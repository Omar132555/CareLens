import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/login.jsx";
import Register from "./pages/register.jsx";
import Home from "./pages/home.jsx";
import ChatCareLens from "./pages/ChatCareLens.jsx";
import "./styles/main.css";
import "./styles/design-system.css";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import CompleteProfile from "./pages/CompleteProfile.jsx";
import Test from "./pages/test.jsx";
function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/Home" element={<Home />} />
      <Route path="/CompleteProfile" element={<CompleteProfile />} />
      <Route path="/chat-ai/:id" element={<ChatCareLens />} />
      <Route path="/register" element={<Register />} />
      <Route path="/test" element={<Test />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
