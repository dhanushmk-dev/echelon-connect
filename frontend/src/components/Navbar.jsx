import React, { useState, useEffect, useRef } from "react";
import {
  Key,
  Edit,
  Lock,
  Users,
  LogOut,
  GraduationCap,
  Briefcase,
  QrCode,
  Menu,
  X,
  ChevronDown
} from "lucide-react";

/**
 * Navbar Component — Echelon Connect
 * - Modern dark navy background (#0b132b / #0f172a) with rich purple accents (#8b5cf6 / #a855f7)
 * - Custom EC Logo from /logo.png
 * - Responsive hamburger drawer menu on mobile
 * - Click-based accessible dropdowns with outside-click closing
 * - Sticky header with backdrop blur
 */
function Navbar({ currentUser, onNavigate, onLogout, currentPage, onOpenScanner }) {
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const studentRef = useRef(null);
  const staffRef = useRef(null);
  const userRef = useRef(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (studentRef.current && !studentRef.current.contains(e.target)) {
        setStudentDropdownOpen(false);
      }
      if (staffRef.current && !staffRef.current.contains(e.target)) {
        setStaffDropdownOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target)) {
        setUserDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNav = (page) => {
    setMobileMenuOpen(false);
    setStudentDropdownOpen(false);
    setStaffDropdownOpen(false);
    setUserDropdownOpen(false);
    onNavigate(page);
  };

  return (
    <>
      <header className="navbar-header">
        <div className="navbar-container">
          {/* Brand Logo & Title */}
          <div className="navbar-brand" onClick={() => handleNav("home")}>
            <img
              src="/logo.png"
              alt="Echelon Connect Logo"
              className="navbar-logo-img"
              onError={(e) => {
                e.target.style.display = "none";
                const fallback = e.target.parentElement.querySelector(".navbar-logo-fallback");
                if (fallback) fallback.style.display = "flex";
              }}
            />
            <div className="navbar-logo-fallback" style={{ display: "none" }}>EC</div>
            <span className="navbar-brand-name">
              Echelon<span className="brand-purple">Connect</span>
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="navbar-nav-desktop">
            {/* Scan Pass Button */}
            <button
              className="navbar-scan-btn"
              onClick={onOpenScanner}
              title="Scan or Verify Student Gate Pass"
            >
              <QrCode size={16} />
              <span>Scan Pass</span>
            </button>

            {/* Home link */}
            <button
              className={`navbar-item ${currentPage === "home" ? "active" : ""}`}
              onClick={() => handleNav("home")}
            >
              Home
            </button>

            {!currentUser ? (
              <>
                {/* Student Dropdown (Click-based) */}
                <div className="navbar-dropdown-wrap" ref={studentRef}>
                  <button
                    className={`navbar-item ${
                      currentPage === "student-login" || currentPage === "student-signup" ? "active" : ""
                    }`}
                    onClick={() => {
                      setStudentDropdownOpen(!studentDropdownOpen);
                      setStaffDropdownOpen(false);
                    }}
                  >
                    <span>Student</span>
                    <ChevronDown size={14} className={`chevron ${studentDropdownOpen ? "open" : ""}`} />
                  </button>

                  {studentDropdownOpen && (
                    <div className="navbar-dropdown-menu">
                      <button
                        className="navbar-dropdown-item"
                        onClick={() => handleNav("student-login")}
                      >
                        <Key size={15} className="item-icon" />
                        <span>Student Login</span>
                      </button>
                      <button
                        className="navbar-dropdown-item"
                        onClick={() => handleNav("student-signup")}
                      >
                        <Edit size={15} className="item-icon" />
                        <span>Student Sign Up</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* Staff Dropdown (Click-based) */}
                <div className="navbar-dropdown-wrap" ref={staffRef}>
                  <button
                    className={`navbar-item ${
                      currentPage === "staff-login" || currentPage === "staff-signup" ? "active" : ""
                    }`}
                    onClick={() => {
                      setStaffDropdownOpen(!staffDropdownOpen);
                      setStudentDropdownOpen(false);
                    }}
                  >
                    <span>Staff</span>
                    <ChevronDown size={14} className={`chevron ${staffDropdownOpen ? "open" : ""}`} />
                  </button>

                  {staffDropdownOpen && (
                    <div className="navbar-dropdown-menu">
                      <button
                        className="navbar-dropdown-item"
                        onClick={() => handleNav("staff-login")}
                      >
                        <Lock size={15} className="item-icon" />
                        <span>Staff Login</span>
                      </button>
                      <button
                        className="navbar-dropdown-item"
                        onClick={() => handleNav("staff-signup")}
                      >
                        <Users size={15} className="item-icon" />
                        <span>Staff Sign Up</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : currentUser.user_type === "student" ? (
              <>
                {/* Student logged-in navigation */}
                <button
                  className={`navbar-item ${currentPage === "request-form" ? "active" : ""}`}
                  onClick={() => handleNav("request-form")}
                >
                  Request
                </button>
                <button
                  className={`navbar-item ${currentPage === "student-dashboard" ? "active" : ""}`}
                  onClick={() => handleNav("student-dashboard")}
                >
                  My Requests
                </button>

                {/* Student Profile */}
                <div className="navbar-dropdown-wrap" ref={userRef}>
                  <button
                    className="navbar-user-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <span className="navbar-avatar-mini">
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "S"}
                    </span>
                    <span className="navbar-user-name">{currentUser.name}</span>
                    <ChevronDown size={13} className={`chevron ${userDropdownOpen ? "open" : ""}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="navbar-dropdown-menu right-aligned">
                      <div className="navbar-user-info">
                        <strong>{currentUser.name}</strong>
                        <span>{currentUser.register_number}</span>
                      </div>
                      <div className="navbar-divider" />
                      <button
                        className="navbar-dropdown-item danger"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                      >
                        <LogOut size={15} className="item-icon" />
                        <span>Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Staff logged-in navigation */}
                <button
                  className={`navbar-item ${currentPage === "staff-dashboard" ? "active" : ""}`}
                  onClick={() => handleNav("staff-dashboard")}
                >
                  Dashboard
                </button>

                {/* Staff Profile */}
                <div className="navbar-dropdown-wrap" ref={userRef}>
                  <button
                    className="navbar-user-btn"
                    onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  >
                    <span className="navbar-avatar-mini staff">
                      {currentUser.role ? currentUser.role.charAt(0).toUpperCase() : "T"}
                    </span>
                    <span className="navbar-user-name">
                      {currentUser.name} ({currentUser.role?.toUpperCase()})
                    </span>
                    <ChevronDown size={13} className={`chevron ${userDropdownOpen ? "open" : ""}`} />
                  </button>

                  {userDropdownOpen && (
                    <div className="navbar-dropdown-menu right-aligned">
                      <div className="navbar-user-info">
                        <strong>{currentUser.name}</strong>
                        <span>
                          {currentUser.role?.toUpperCase()}
                          {currentUser.department ? ` • ${currentUser.department}` : ""}
                        </span>
                      </div>
                      <div className="navbar-divider" />
                      <button
                        className="navbar-dropdown-item danger"
                        onClick={() => {
                          setUserDropdownOpen(false);
                          onLogout();
                        }}
                      >
                        <LogOut size={15} className="item-icon" />
                        <span>Log out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>

          {/* Mobile Right Icons (Scan Pass button + Hamburger toggle) */}
          <div className="navbar-mobile-controls">
            <button
              className="navbar-scan-btn mobile-compact"
              onClick={onOpenScanner}
              title="Scan QR Pass"
            >
              <QrCode size={16} />
              <span>Scan</span>
            </button>

            <button
              className="navbar-hamburger-btn"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Navigation */}
        {mobileMenuOpen && (
          <div className="navbar-mobile-drawer">
            <button
              className={`navbar-mobile-item ${currentPage === "home" ? "active" : ""}`}
              onClick={() => handleNav("home")}
            >
              Home
            </button>

            {!currentUser ? (
              <>
                <div className="navbar-mobile-section-title">STUDENT ACCESS</div>
                <button
                  className={`navbar-mobile-subitem ${currentPage === "student-login" ? "active" : ""}`}
                  onClick={() => handleNav("student-login")}
                >
                  <Key size={16} />
                  <span>Student Login</span>
                </button>
                <button
                  className={`navbar-mobile-subitem ${currentPage === "student-signup" ? "active" : ""}`}
                  onClick={() => handleNav("student-signup")}
                >
                  <Edit size={16} />
                  <span>Student Sign Up</span>
                </button>

                <div className="navbar-mobile-section-title">STAFF ACCESS</div>
                <button
                  className={`navbar-mobile-subitem ${currentPage === "staff-login" ? "active" : ""}`}
                  onClick={() => handleNav("staff-login")}
                >
                  <Lock size={16} />
                  <span>Staff Login</span>
                </button>
                <button
                  className={`navbar-mobile-subitem ${currentPage === "staff-signup" ? "active" : ""}`}
                  onClick={() => handleNav("staff-signup")}
                >
                  <Users size={16} />
                  <span>Staff Sign Up</span>
                </button>
              </>
            ) : currentUser.user_type === "student" ? (
              <>
                <div className="navbar-mobile-section-title">PORTAL ACTIONS</div>
                <button
                  className={`navbar-mobile-item ${currentPage === "request-form" ? "active" : ""}`}
                  onClick={() => handleNav("request-form")}
                >
                  Submit New Request
                </button>
                <button
                  className={`navbar-mobile-item ${currentPage === "student-dashboard" ? "active" : ""}`}
                  onClick={() => handleNav("student-dashboard")}
                >
                  My Requests &amp; Passes
                </button>
                <div className="navbar-divider" style={{ margin: "12px 0" }} />
                <button
                  className="navbar-mobile-item danger"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log out ({currentUser.name})</span>
                </button>
              </>
            ) : (
              <>
                <div className="navbar-mobile-section-title">STAFF ACTIONS</div>
                <button
                  className={`navbar-mobile-item ${currentPage === "staff-dashboard" ? "active" : ""}`}
                  onClick={() => handleNav("staff-dashboard")}
                >
                  Staff Dashboard
                </button>
                <div className="navbar-divider" style={{ margin: "12px 0" }} />
                <button
                  className="navbar-mobile-item danger"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                >
                  <LogOut size={16} />
                  <span>Log out ({currentUser.name})</span>
                </button>
              </>
            )}
          </div>
        )}
      </header>

      {/* Sub-bar: user context info when logged in */}
      {currentUser && (
        <div className="navbar-subbar">
          <div className="navbar-subbar-container">
            <span className="navbar-subbar-badge">
              {currentUser.user_type === "student" ? (
                <>
                  <GraduationCap size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  STUDENT
                </>
              ) : (
                <>
                  <Briefcase size={13} style={{ verticalAlign: "middle", marginRight: "4px" }} />
                  STAFF ({currentUser.role?.toUpperCase()})
                </>
              )}
            </span>
            <span className="navbar-subbar-text">
              Signed in as <strong>{currentUser.name}</strong>
              {currentUser.department ? ` • ${currentUser.department}` : ""}
              {currentUser.accommodation_type
                ? ` (${currentUser.accommodation_type === "hosteller" ? "Hosteller" : "Day Scholar"})`
                : ""}
            </span>
          </div>
        </div>
      )}
    </>
  );
}

export default Navbar;
