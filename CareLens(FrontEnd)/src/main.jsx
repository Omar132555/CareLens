import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { AuthProvider } from "./components/AuthProvider";
import { BrowserRouter } from "react-router-dom";
import "./config";
import RoleProvider from "./components/RoleProvider";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <RoleProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </RoleProvider>
  </BrowserRouter>,
);
