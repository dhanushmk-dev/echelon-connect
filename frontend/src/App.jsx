import React, { useState } from "react";
import Navbar from "./components/Navbar.jsx";
import Home from "./pages/Home.jsx";
import StudentSignUp from "./pages/StudentSignUp.jsx";
import StudentLogin from "./pages/StudentLogin.jsx";
import StaffSignUp from "./pages/StaffSignUp.jsx";
import StaffLogin from "./pages/StaffLogin.jsx";
import StudentDashboard from "./pages/StudentDashboard.jsx";
import RequestForm from "./pages/RequestForm.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import Verify from "./pages/Verify.jsx";
import QRScannerModal from "./components/QRScannerModal.jsx";

/**
 * App Root Component
 * Handles routing state, current logged-in user state, and logout actions.
 */
function App() {
  const [currentPage, setCurrentPage] = useState("home");
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = localStorage.getItem("echelon_ai_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [isScannerOpen, setIsScannerOpen] = useState(false);

  const handleAuthenticated = (user) => {
    setCurrentUser(user);
    localStorage.setItem("echelon_ai_user", JSON.stringify(user));
    if (user.user_type === "student") {
      setCurrentPage("student-dashboard");
    } else {
      setCurrentPage("staff-dashboard");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("echelon_ai_user");
    setCurrentPage("home");
  };

  const renderPage = () => {
    switch (currentPage) {
      case "student-signup":
        return (
          <StudentSignUp
            onAuthenticated={handleAuthenticated}
            onNavigate={setCurrentPage}
          />
        );
      case "student-login":
        return (
          <StudentLogin
            onAuthenticated={handleAuthenticated}
            onNavigate={setCurrentPage}
          />
        );
      case "staff-signup":
        return (
          <StaffSignUp
            onAuthenticated={handleAuthenticated}
            onNavigate={setCurrentPage}
          />
        );
      case "staff-login":
        return (
          <StaffLogin
            onAuthenticated={handleAuthenticated}
            onNavigate={setCurrentPage}
          />
        );
      case "student-dashboard":
        return currentUser?.user_type === "student" ? (
          <StudentDashboard currentUser={currentUser} onNavigate={setCurrentPage} />
        ) : (
          <Home onNavigate={setCurrentPage} />
        );
      case "request-form":
        return currentUser?.user_type === "student" ? (
          <RequestForm currentUser={currentUser} onNavigate={setCurrentPage} />
        ) : (
          <Home onNavigate={setCurrentPage} />
        );
      case "staff-dashboard":
        return currentUser?.user_type === "staff" ? (
          <StaffDashboard
            currentUser={currentUser}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        ) : (
          <Home onNavigate={setCurrentPage} />
        );
      case "home":
      default:
        return (
          <Home
            onNavigate={setCurrentPage}
            currentUser={currentUser}
            onOpenScanner={() => setIsScannerOpen(true)}
          />
        );
    }
  };

  const isVerifyRoute = window.location.pathname.startsWith("/verify/");
  const verifyToken = isVerifyRoute ? window.location.pathname.split("/verify/")[1] : null;

  if (isVerifyRoute) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Verify token={verifyToken} />
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar
        currentUser={currentUser}
        onNavigate={setCurrentPage}
        onLogout={handleLogout}
        currentPage={currentPage}
        onOpenScanner={() => setIsScannerOpen(true)}
      />
      <div style={{ flex: 1 }}>
        {renderPage()}
      </div>

      {/* Global QR Scanner Modal accessible from Navbar and Staff Dashboard */}
      <QRScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={() => {
          // Can refresh dashboard or trigger notifications
        }}
      />
    </div>
  );
}

export default App;
