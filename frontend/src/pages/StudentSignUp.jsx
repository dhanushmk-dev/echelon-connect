import React, { useState } from "react";
import { GraduationCap, Home } from "lucide-react";

/**
 * Student SignUp — Modern polished form card layout.
 * NO logic changes.
 */
function StudentSignUp({ onAuthenticated, onNavigate }) {
  const [name, setName] = useState("");
  const [registerNumber, setRegisterNumber] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [year, setYear] = useState("1");
  const [accommodationType, setAccommodationType] = useState("day_scholar");
  const [hostelBlock, setHostelBlock] = useState("Block A");
  const [roomNumber, setRoomNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const departments = [
    "Computer Science & Engineering",
    "Information Technology",
    "Electronics & Communication Engineering",
    "Electrical & Electronics Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Password and Confirm Password must match!");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/student/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          register_number: registerNumber,
          department,
          year: parseInt(year),
          accommodation_type: accommodationType,
          hostel_block: accommodationType === "hosteller" ? hostelBlock : null,
          room_number: accommodationType === "hosteller" ? roomNumber : null,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create account.");
      }

      onAuthenticated(data.student);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        <div style={styles.intro}>
          <div style={styles.iconWrap}>
            <GraduationCap size={28} color="#4f46e5" />
          </div>
          <p style={styles.eyebrow}>GET STARTED</p>
          <h1 style={styles.title}>Student Registration</h1>
          <p style={styles.subtitle}>Create your profile to submit and manage leave requests.</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          {/* Section: Personal */}
          <div style={styles.sectionLabel}>Personal Information</div>
          <div style={styles.rowGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Full Name</label>
              <input
                type="text"
                required
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. John Doe"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Register Number</label>
              <input
                type="text"
                required
                style={styles.input}
                value={registerNumber}
                onChange={(e) => setRegisterNumber(e.target.value)}
                placeholder="e.g. 710021104001"
              />
            </div>
          </div>

          <div style={styles.rowGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Department</label>
              <select
                style={styles.select}
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                {departments.map((dep) => (
                  <option key={dep} value={dep}>{dep}</option>
                ))}
              </select>
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Academic Year</label>
              <select
                style={styles.select}
                value={year}
                onChange={(e) => setYear(e.target.value)}
              >
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>
            </div>
          </div>

          {/* Section: Accommodation */}
          <div style={styles.sectionLabel}>Accommodation</div>
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Accommodation Type</label>
            <div style={styles.radioGrid}>
              <label
                style={{
                  ...styles.radioCard,
                  ...(accommodationType === "day_scholar" ? styles.radioCardActive : {}),
                }}
              >
                <input
                  type="radio"
                  name="accommodation"
                  value="day_scholar"
                  checked={accommodationType === "day_scholar"}
                  onChange={() => setAccommodationType("day_scholar")}
                  style={{ marginRight: "8px" }}
                />
                <strong>Day Scholar</strong>
              </label>

              <label
                style={{
                  ...styles.radioCard,
                  ...(accommodationType === "hosteller" ? styles.radioCardActive : {}),
                }}
              >
                <input
                  type="radio"
                  name="accommodation"
                  value="hosteller"
                  checked={accommodationType === "hosteller"}
                  onChange={() => setAccommodationType("hosteller")}
                  style={{ marginRight: "8px" }}
                />
                <Home size={15} style={{ display: "inline", marginRight: "5px", verticalAlign: "middle" }} />
                <strong>Hosteller</strong>
              </label>
            </div>
          </div>

          {/* Conditional Hostel Fields */}
          {accommodationType === "hosteller" && (
            <div style={styles.rowGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Hostel Block</label>
                <select
                  style={styles.select}
                  value={hostelBlock}
                  onChange={(e) => setHostelBlock(e.target.value)}
                >
                  <option value="Block A">Block A</option>
                  <option value="Block B">Block B</option>
                  <option value="Block C">Block C</option>
                  <option value="Block D">Block D</option>
                </select>
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>Room Number</label>
                <input
                  type="text"
                  required
                  style={styles.input}
                  value={roomNumber}
                  onChange={(e) => setRoomNumber(e.target.value)}
                  placeholder="e.g. 302"
                />
              </div>
            </div>
          )}

          {/* Section: Security */}
          <div style={styles.sectionLabel}>Account Security</div>
          <div style={styles.rowGrid}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create password"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Confirm Password</label>
              <input
                type="password"
                required
                style={styles.input}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat password"
              />
            </div>
          </div>

          <button type="submit" disabled={loading} style={styles.submitBtn}>
            {loading ? "Creating Account…" : "Create Student Account →"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account? </span>
          <button
            type="button"
            style={styles.linkBtn}
            onClick={() => onNavigate("student-login")}
          >
            Login
          </button>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "center",
    padding: "40px 20px 60px",
    background: "linear-gradient(135deg, #f1f4f9 0%, #e8edf6 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "600px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "20px",
    padding: "40px",
    boxShadow: "0 20px 40px -8px rgba(0,0,0,0.10), 0 8px 16px -8px rgba(0,0,0,0.05)",
  },
  intro: {
    marginBottom: "28px",
  },
  iconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#eef2ff",
    border: "1px solid #c7d2fe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#4f46e5",
    letterSpacing: "0.08em",
    margin: "0 0 6px",
  },
  title: {
    fontSize: "26px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "8px 0 0",
  },
  sectionLabel: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#94a3b8",
    textTransform: "uppercase",
    letterSpacing: "0.07em",
    paddingBottom: "8px",
    borderBottom: "1px solid #f1f5f9",
    marginBottom: "2px",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  rowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "14px",
  },
  fieldGroup: {
    display: "flex",
    flexDirection: "column",
    gap: "7px",
  },
  label: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#334155",
  },
  input: {
    width: "100%",
    padding: "11px 13px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },
  select: {
    width: "100%",
    padding: "11px 13px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
  },
  radioGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    marginTop: "2px",
  },
  radioCard: {
    padding: "12px 14px",
    border: "1.5px solid #e2e8f0",
    borderRadius: "9px",
    display: "flex",
    alignItems: "center",
    cursor: "pointer",
    backgroundColor: "#f8fafc",
    fontSize: "14px",
    color: "#334155",
    transition: "all 0.15s ease",
    fontFamily: "inherit",
  },
  radioCardActive: {
    borderColor: "#4f46e5",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
  },
  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    padding: "13px 16px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
    fontFamily: "inherit",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "12px 14px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "600",
    marginBottom: "18px",
    border: "1px solid #fecaca",
  },
  footer: {
    marginTop: "24px",
    paddingTop: "20px",
    borderTop: "1px solid #f1f5f9",
    textAlign: "center",
    fontSize: "14px",
    color: "#64748b",
  },
  linkBtn: {
    background: "none",
    border: "none",
    color: "#4f46e5",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    padding: 0,
    marginLeft: "4px",
    fontFamily: "inherit",
  },
};

export default StudentSignUp;
