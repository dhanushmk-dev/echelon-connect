import React, { useState } from "react";
import { Info, Briefcase } from "lucide-react";

/**
 * Staff SignUp — Modern polished form card layout.
 * Role dropdown (Advisor / HOD / Warden) appears BEFORE Department dropdown.
 * Department dropdown is hidden completely if Role = Warden.
 * NO logic changes.
 */
function StaffSignUp({ onAuthenticated, onNavigate }) {
  const [name, setName] = useState("");
  const [role, setRole] = useState("advisor"); // Advisor, HOD, Warden
  const [department, setDepartment] = useState("Computer Science & Engineering");
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
      const response = await fetch("/api/staff/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          role,
          department: role === "warden" ? null : department,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to create staff account.");
      }

      onAuthenticated(data.staff);
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
            <Briefcase size={28} color="#0891b2" />
          </div>
          <p style={styles.eyebrow}>STAFF REGISTRATION</p>
          <h1 style={styles.title}>Create Staff Account</h1>
          <p style={styles.subtitle}>Register as a Department Advisor, HOD, or Hostel Warden.</p>
        </div>

        {error && <div style={styles.errorBox}>{error}</div>}

        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.sectionLabel}>Staff Information</div>

          <div style={styles.fieldGroup}>
            <label style={styles.label}>Full Name</label>
            <input
              type="text"
              required
              style={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Prof. Smith"
            />
          </div>

          {/* Role Dropdown comes BEFORE Department */}
          <div style={styles.fieldGroup}>
            <label style={styles.label}>Staff Role</label>
            <select
              style={styles.select}
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="advisor">Advisor (First Stage Approval)</option>
              <option value="hod">HOD (Second Stage Approval)</option>
              <option value="warden">Hostel Warden (Hosteller Approval)</option>
            </select>
          </div>

          {/* Department Dropdown shown ONLY for Advisor or HOD */}
          {role !== "warden" ? (
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
          ) : (
            <div style={styles.wardenNotice}>
              <Info size={16} style={{ display: "inline", verticalAlign: "middle", marginRight: "6px", flexShrink: 0 }} />
              <span><strong>Hostel Warden:</strong> Not tied to any single department. Wardens oversee hosteller leave requests across all departments.</span>
            </div>
          )}

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
            {loading ? "Creating Account…" : "Create Staff Account →"}
          </button>
        </form>

        <div style={styles.footer}>
          <span>Already have an account? </span>
          <button
            type="button"
            style={styles.linkBtn}
            onClick={() => onNavigate("staff-login")}
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
    maxWidth: "540px",
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
    backgroundColor: "#ecfeff",
    border: "1px solid #a5f3fc",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#0891b2",
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
    gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
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
  wardenNotice: {
    display: "flex",
    alignItems: "flex-start",
    gap: "6px",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    color: "#166534",
    padding: "12px 14px",
    borderRadius: "9px",
    fontSize: "13px",
    lineHeight: "1.5",
  },
  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #0f766e, #0891b2)",
    color: "#ffffff",
    border: "none",
    borderRadius: "9px",
    padding: "13px 16px",
    fontSize: "15px",
    fontWeight: "700",
    cursor: "pointer",
    marginTop: "8px",
    boxShadow: "0 4px 12px rgba(8,145,178,0.3)",
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
    color: "#0891b2",
    fontWeight: "700",
    fontSize: "14px",
    cursor: "pointer",
    padding: 0,
    marginLeft: "4px",
    fontFamily: "inherit",
  },
};

export default StaffSignUp;
