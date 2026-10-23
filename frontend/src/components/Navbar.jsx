import React, { useState } from "react";
import { Key, Edit, Lock, Users, LogOut, GraduationCap, Briefcase, QrCode } from "lucide-react";

/**
 * Navbar Component
 *
 * Refined styling:
 * - Solid, elegant dark slate background (#1e293b) across all pages
 * - Active nav item uses subtle translucent indigo pill with indigo border
 * - Inactive nav items remain translucent with crisp hover state (never stark white)
 * - Elevated dark dropdown card matching the header theme
 * - Prominent 'Scan Pass' action button for gate verification
 */
function Navbar({ currentUser, onNavigate, onLogout, currentPage, onOpenScanner }) {
  const [studentDropdownOpen, setStudentDropdownOpen] = useState(false);
  const [staffDropdownOpen, setStaffDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  return (
    <>
      <header style={styles.header}>
        <div style={styles.container}>
          {/* Brand Logo & Title */}
          <div style={styles.brand} onClick={() => onNavigate("home")}>
            <div style={styles.logoBadge}>EC</div>
            <span style={styles.brandName}>EchelonConnect</span>
          </div>

          {/* Navigation Links */}
          <nav style={styles.navLinks}>

            {/* Scan Pass Button (Always accessible or prominent for quick gate verification) */}
            <button
              style={styles.scanPassBtn}
              onClick={onOpenScanner}
              title="Scan or Verify Student Gate Pass"
            >
              <QrCode size={16} />
              <span>Scan Pass</span>
            </button>

            {/* Home — active when currentPage is exactly 'home' */}
            <button
              style={{
                ...styles.navItem,
                ...(currentPage === "home" ? styles.navItemActive : {}),
              }}
              onClick={() => onNavigate("home")}
            >
              Home
            </button>

            {!currentUser ? (
              <>
                {/* Student Dropdown (pre-login) */}
                <div
                  style={styles.dropdownWrapper}
                  onMouseEnter={() => setStudentDropdownOpen(true)}
                  onMouseLeave={() => setStudentDropdownOpen(false)}
                >
                  <button
                    style={{
                      ...styles.navItem,
                      ...(currentPage === "student-login" || currentPage === "student-signup"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    Student ▾
                  </button>
                  {studentDropdownOpen && (
                    /* paddingTop bridges the visual gap — no actual gap between button and menu */
                    <div style={styles.dropdownOuter}>
                      <div style={styles.dropdownMenu}>
                        <button
                          style={styles.dropdownItem}
                          onClick={() => {
                            setStudentDropdownOpen(false);
                            onNavigate("student-login");
                          }}
                        >
                          <Key size={14} style={styles.dropdownIcon} /> Student Login
                        </button>
                        <button
                          style={styles.dropdownItem}
                          onClick={() => {
                            setStudentDropdownOpen(false);
                            onNavigate("student-signup");
                          }}
                        >
                          <Edit size={14} style={styles.dropdownIcon} /> Student Sign Up
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Staff Dropdown (pre-login) */}
                <div
                  style={styles.dropdownWrapper}
                  onMouseEnter={() => setStaffDropdownOpen(true)}
                  onMouseLeave={() => setStaffDropdownOpen(false)}
                >
                  <button
                    style={{
                      ...styles.navItem,
                      ...(currentPage === "staff-login" || currentPage === "staff-signup"
                        ? styles.navItemActive
                        : {}),
                    }}
                  >
                    Staff ▾
                  </button>
                  {staffDropdownOpen && (
                    <div style={styles.dropdownOuter}>
                      <div style={styles.dropdownMenu}>
                        <button
                          style={styles.dropdownItem}
                          onClick={() => {
                            setStaffDropdownOpen(false);
                            onNavigate("staff-login");
                          }}
                        >
                          <Lock size={14} style={styles.dropdownIcon} /> Staff Login
                        </button>
                        <button
                          style={styles.dropdownItem}
                          onClick={() => {
                            setStaffDropdownOpen(false);
                            onNavigate("staff-signup");
                          }}
                        >
                          <Users size={14} style={styles.dropdownIcon} /> Staff Sign Up
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : currentUser.user_type === "student" ? (
              <>
                {/* Student Post-Login Nav Links */}
                <button
                  style={{
                    ...styles.navItem,
                    ...(currentPage === "request-form" ? styles.navItemActive : {}),
                  }}
                  onClick={() => onNavigate("request-form")}
                >
                  Request
                </button>
                <button
                  style={{
                    ...styles.navItem,
                    ...(currentPage === "student-dashboard" ? styles.navItemActive : {}),
                  }}
                  onClick={() => onNavigate("student-dashboard")}
                >
                  My Requests
                </button>

                {/* Student Profile Dropdown */}
                <div
                  style={styles.dropdownWrapper}
                  onMouseEnter={() => setUserDropdownOpen(true)}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <button style={styles.userButton}>
                    <span style={styles.avatarMini}>
                      {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "S"}
                    </span>
                    {currentUser.name} ▾
                  </button>
                  {userDropdownOpen && (
                    <div style={styles.dropdownOuter}>
                      <div style={styles.dropdownMenu}>
                        <div style={styles.dropdownUserInfo}>
                          <strong>{currentUser.name}</strong>
                          <span>{currentUser.register_number}</span>
                        </div>
                        <div style={styles.dropdownDivider} />
                        <button style={styles.dropdownItemDanger} onClick={onLogout}>
                          <LogOut size={14} style={styles.dropdownIcon} /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                {/* Staff Post-Login Nav Links */}
                <button
                  style={{
                    ...styles.navItem,
                    ...(currentPage === "staff-dashboard" ? styles.navItemActive : {}),
                  }}
                  onClick={() => onNavigate("staff-dashboard")}
                >
                  Dashboard
                </button>

                {/* Staff Profile Dropdown */}
                <div
                  style={styles.dropdownWrapper}
                  onMouseEnter={() => setUserDropdownOpen(true)}
                  onMouseLeave={() => setUserDropdownOpen(false)}
                >
                  <button style={styles.userButton}>
                    <span style={styles.avatarMini}>
                      {currentUser.role ? currentUser.role.charAt(0).toUpperCase() : "T"}
                    </span>
                    {currentUser.name} ({currentUser.role?.toUpperCase()}) ▾
                  </button>
                  {userDropdownOpen && (
                    <div style={styles.dropdownOuter}>
                      <div style={styles.dropdownMenu}>
                        <div style={styles.dropdownUserInfo}>
                          <strong>{currentUser.name}</strong>
                          <span>
                            {currentUser.role?.toUpperCase()}
                            {currentUser.department ? ` • ${currentUser.department}` : ""}
                          </span>
                        </div>
                        <div style={styles.dropdownDivider} />
                        <button style={styles.dropdownItemDanger} onClick={onLogout}>
                          <LogOut size={14} style={styles.dropdownIcon} /> Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </nav>
        </div>
      </header>

      {/* Sub-bar: user context info when logged in */}
      {currentUser && (
        <div style={styles.subBar}>
          <div style={styles.subBarContainer}>
            <span style={styles.subBarBadge}>
              {currentUser.user_type === "student" ? (
                <><GraduationCap size={12} style={{verticalAlign: "middle", marginRight: "4px", marginTop: "-2px"}} /> STUDENT</>
              ) : (
                <><Briefcase size={12} style={{verticalAlign: "middle", marginRight: "4px", marginTop: "-2px"}} /> STAFF ({currentUser.role?.toUpperCase()})</>
              )}
            </span>
            <span style={styles.subBarText}>
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

const styles = {
  header: {
    backgroundColor: "#1e293b",
    borderBottom: "1px solid #334155",
    position: "sticky",
    top: 0,
    zIndex: 100,
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "12px 24px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    cursor: "pointer",
  },
  logoBadge: {
    width: "38px",
    height: "38px",
    borderRadius: "8px",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: "800",
    fontSize: "15px",
    letterSpacing: "0.05em",
    boxShadow: "0 2px 8px rgba(37, 99, 235, 0.4)",
  },
  brandName: {
    color: "#ffffff",
    fontSize: "20px",
    fontWeight: "700",
    letterSpacing: "-0.02em",
  },
  navLinks: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
  },
  scanPassBtn: {
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "1px solid #6366f1",
    fontSize: "13px",
    fontWeight: "700",
    padding: "7px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    marginRight: "6px",
    boxShadow: "0 2px 8px rgba(79, 70, 229, 0.35)",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
  navItem: {
    background: "transparent",
    border: "none",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: "600",
    padding: "8px 14px",
    borderRadius: "6px",
    cursor: "pointer",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
  navItemActive: {
    color: "#ffffff",
    backgroundColor: "rgba(99, 102, 241, 0.25)",
    border: "1px solid rgba(99, 102, 241, 0.4)",
  },
  userButton: {
    background: "#334155",
    border: "1px solid #475569",
    color: "#ffffff",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    padding: "6px 14px",
    borderRadius: "20px",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
  avatarMini: {
    width: "22px",
    height: "22px",
    borderRadius: "50%",
    backgroundColor: "#2563eb",
    color: "#ffffff",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "11px",
    fontWeight: "700",
  },
  dropdownWrapper: {
    position: "relative",
  },
  dropdownOuter: {
    position: "absolute",
    top: "100%",
    right: 0,
    paddingTop: "6px",
    zIndex: 1000,
    minWidth: "190px",
  },
  dropdownMenu: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.35), 0 8px 10px -6px rgba(0, 0, 0, 0.2)",
    border: "1px solid #334155",
    overflow: "hidden",
    padding: "6px 0",
  },
  dropdownUserInfo: {
    padding: "10px 14px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    fontSize: "12px",
    color: "#94a3b8",
  },
  dropdownDivider: {
    height: "1px",
    backgroundColor: "#334155",
    margin: "4px 0",
  },
  dropdownItem: {
    width: "100%",
    padding: "9px 14px",
    textAlign: "left",
    background: "transparent",
    border: "none",
    fontSize: "13px",
    fontWeight: "500",
    color: "#e2e8f0",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "inherit",
    transition: "background-color 0.15s",
  },
  dropdownItemDanger: {
    width: "100%",
    padding: "9px 14px",
    textAlign: "left",
    background: "transparent",
    border: "none",
    fontSize: "13px",
    fontWeight: "600",
    color: "#f87171",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
    fontFamily: "inherit",
  },
  dropdownIcon: {
    fontSize: "14px",
  },
  subBar: {
    backgroundColor: "#f1f5f9",
    borderBottom: "1px solid #e2e8f0",
    padding: "8px 24px",
  },
  subBarContainer: {
    maxWidth: "1200px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    fontSize: "13px",
  },
  subBarBadge: {
    backgroundColor: "#e2e8f0",
    color: "#334155",
    padding: "2px 8px",
    borderRadius: "4px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.04em",
  },
  subBarText: {
    color: "#475569",
  },
};

export default Navbar;
