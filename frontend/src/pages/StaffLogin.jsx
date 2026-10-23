import React, { useState } from "react";
import { Briefcase, ClipboardCheck, ShieldCheck } from "lucide-react";

/**
 * Staff Login — Modern two-column card layout.
 * NO logic changes.
 */
function StaffLogin({ onAuthenticated, onNavigate }) {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/staff/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          password,
        }),
      });

      let data;
      try {
        data = await response.json();
      } catch (e) {
        throw new Error(
          response.status === 504 || response.status === 502
            ? "Cannot reach server. Please make sure the backend is running."
            : `Server returned an invalid response (${response.status} ${response.statusText}). Is the backend running?`
        );
      }

      if (!response.ok) {
        throw new Error(data.message || "Invalid credentials.");
      }

      onAuthenticated(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.card}>
        {/* Left branding panel */}
        <div style={styles.brandPanel}>
          <div style={styles.brandContent}>
            <div style={styles.brandIcon}>
              <Briefcase size={36} color="#fff" />
            </div>
            <h2 style={styles.brandTitle}>Staff Portal</h2>
            <p style={styles.brandDesc}>
              Review and approve student leave, OD, and outpass requests. Each decision routes automatically through the approval chain.
            </p>
            <div style={styles.featurePills}>
              <span style={styles.pill}><ClipboardCheck size={12} style={{display:"inline",marginRight:"5px",verticalAlign:"middle"}}/>Review Requests</span>
              <span style={styles.pill}><ShieldCheck size={12} style={{display:"inline",marginRight:"5px",verticalAlign:"middle"}}/>QR Gate Scan</span>
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div style={styles.formPanel}>
          <div style={styles.intro}>
            <p style={styles.eyebrow}>STAFF ACCESS</p>
            <h1 style={styles.title}>Staff Portal Login</h1>
            <p style={styles.subtitle}>Sign in as an Advisor, HOD, or Hostel Warden.</p>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Staff Name</label>
              <input
                type="text"
                required
                style={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Prof. Smith"
              />
            </div>

            <div style={styles.fieldGroup}>
              <label style={styles.label}>Password</label>
              <input
                type="password"
                required
                style={styles.input}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
              />
            </div>

            <button type="submit" disabled={loading} style={styles.submitBtn}>
              {loading ? "Logging in…" : "Login to Staff Dashboard →"}
            </button>
          </form>

          <div style={styles.footer}>
            <span>Don't have an account? </span>
            <button
              type="button"
              style={styles.linkBtn}
              onClick={() => onNavigate("staff-signup")}
            >
              Create Account / Sign Up
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    minHeight: "calc(100vh - 120px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px 20px",
    background: "linear-gradient(135deg, #f1f4f9 0%, #e8edf6 100%)",
  },
  card: {
    width: "100%",
    maxWidth: "820px",
    display: "flex",
    borderRadius: "20px",
    overflow: "hidden",
    boxShadow: "0 20px 40px -8px rgba(0,0,0,0.14), 0 8px 16px -8px rgba(0,0,0,0.06)",
    border: "1px solid #e2e8f0",
  },
  brandPanel: {
    flex: "0 0 260px",
    background: "linear-gradient(155deg, #0f766e 0%, #0891b2 100%)",
    padding: "48px 32px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  brandContent: {
    color: "#ffffff",
  },
  brandIcon: {
    width: "64px",
    height: "64px",
    borderRadius: "16px",
    backgroundColor: "rgba(255,255,255,0.18)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "20px",
  },
  brandTitle: {
    fontSize: "22px",
    fontWeight: "800",
    margin: "0 0 12px",
    letterSpacing: "-0.02em",
  },
  brandDesc: {
    fontSize: "13px",
    lineHeight: "1.65",
    opacity: 0.85,
    margin: "0 0 24px",
  },
  featurePills: {
    display: "flex",
    flexWrap: "wrap",
    gap: "8px",
  },
  pill: {
    backgroundColor: "rgba(255,255,255,0.18)",
    color: "#ffffff",
    border: "1px solid rgba(255,255,255,0.3)",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: "600",
  },
  formPanel: {
    flex: 1,
    backgroundColor: "#ffffff",
    padding: "48px 40px",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
  },
  intro: {
    marginBottom: "28px",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#0891b2",
    letterSpacing: "0.08em",
    margin: "0 0 6px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.025em",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "8px 0 0",
    lineHeight: "1.5",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "18px",
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
    padding: "12px 14px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#0f172a",
    backgroundColor: "#f8fafc",
    boxSizing: "border-box",
    outline: "none",
    fontFamily: "inherit",
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
    marginTop: "6px",
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

export default StaffLogin;
