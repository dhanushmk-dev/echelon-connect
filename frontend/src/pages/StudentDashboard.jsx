import React, { useState, useEffect } from "react";
import RequestTable from "../components/RequestTable.jsx";
import { FileText, Clock, CheckCircle2, XCircle, PlusCircle, Trash2 } from "lucide-react";

/**
 * StudentDashboard — Modern stat cards with icons, polished header, clean table.
 * NO logic changes.
 */
function StudentDashboard({ currentUser, onNavigate }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStudentRequests = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/requests/student/${currentUser.id}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch requests.");
      setRequests(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.id) {
      fetchStudentRequests();
    }
  }, [currentUser]);

  // Handle Clear button click (Hides from student view only)
  const handleClear = async () => {
    const confirmClear = window.confirm(
      "This will hide your request history. Continue?"
    );
    if (!confirmClear) return;

    try {
      const res = await fetch(`/api/requests/student/${currentUser.id}/clear`, {
        method: "PUT",
      });
      if (res.ok) {
        setRequests([]);
      }
    } catch (err) {
      alert("Error clearing requests: " + err.message);
    }
  };

  const pendingCount = requests.filter((r) => r.status?.startsWith("pending")).length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  const statCards = [
    {
      label: "Total Requests",
      value: requests.length,
      icon: <FileText size={20} color="#4f46e5" />,
      iconBg: "#eef2ff",
      accent: "#4f46e5",
    },
    {
      label: "Pending Review",
      value: pendingCount,
      icon: <Clock size={20} color="#d97706" />,
      iconBg: "#fffbeb",
      accent: "#f59e0b",
    },
    {
      label: "Approved",
      value: approvedCount,
      icon: <CheckCircle2 size={20} color="#059669" />,
      iconBg: "#ecfdf5",
      accent: "#10b981",
    },
    {
      label: "Rejected",
      value: rejectedCount,
      icon: <XCircle size={20} color="#dc2626" />,
      iconBg: "#fef2f2",
      accent: "#ef4444",
    },
  ];

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Header section */}
        <div style={styles.header}>
          <div>
            <p style={styles.eyebrow}>STUDENT WORKSPACE</p>
            <h1 style={styles.title}>My Requests</h1>
            <p style={styles.subtitle}>
              Track your leave, outpass, and OD requests across approval stages.
            </p>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.newRequestBtn}
              onClick={() => onNavigate("request-form")}
            >
              <PlusCircle size={15} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
              New Request
            </button>

            {requests.length > 0 && (
              <button style={styles.clearBtn} onClick={handleClear}>
                <Trash2 size={14} style={{ display: "inline", marginRight: "5px", verticalAlign: "middle" }} />
                Clear View
              </button>
            )}
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div style={styles.statsGrid}>
          {statCards.map((s) => (
            <div key={s.label} style={{ ...styles.statCard, borderTop: `3px solid ${s.accent}` }}>
              <div style={styles.statCardInner}>
                <div style={{ ...styles.statIconWrap, backgroundColor: s.iconBg }}>
                  {s.icon}
                </div>
                <div>
                  <span style={styles.statLabel}>{s.label}</span>
                  <strong style={{ ...styles.statVal, color: s.accent }}>{s.value}</strong>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Requests Table */}
        {loading ? (
          <div style={styles.loadingBox}>
            <Clock size={32} color="#cbd5e1" style={{ marginBottom: "10px" }} />
            <p>Loading your requests…</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : (
          <RequestTable requests={requests} role="student" />
        )}
      </div>
    </main>
  );
}

const styles = {
  page: {
    background: "linear-gradient(135deg, #f1f4f9 0%, #e8edf6 100%)",
    minHeight: "calc(100vh - 120px)",
    padding: "40px 24px 80px",
  },
  container: {
    maxWidth: "1150px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "28px",
    flexWrap: "wrap",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#4f46e5",
    letterSpacing: "0.08em",
    margin: "0 0 6px",
  },
  title: {
    fontSize: "28px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  subtitle: {
    fontSize: "14px",
    color: "#64748b",
    margin: "6px 0 0",
  },
  headerActions: {
    display: "flex",
    gap: "10px",
    alignItems: "center",
    flexWrap: "wrap",
  },
  newRequestBtn: {
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "white",
    border: "none",
    padding: "10px 18px",
    borderRadius: "9px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 4px 12px rgba(79,70,229,0.28)",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
  },
  clearBtn: {
    backgroundColor: "#ffffff",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
    padding: "9px 15px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "16px",
    marginBottom: "28px",
  },
  statCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    padding: "20px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  statCardInner: {
    display: "flex",
    alignItems: "center",
    gap: "14px",
  },
  statIconWrap: {
    width: "44px",
    height: "44px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  statLabel: {
    display: "block",
    fontSize: "12px",
    fontWeight: "600",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: "4px",
  },
  statVal: {
    display: "block",
    fontSize: "26px",
    fontWeight: "800",
    lineHeight: "1",
  },
  loadingBox: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#94a3b8",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    fontSize: "14px",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "14px 18px",
    borderRadius: "10px",
    fontSize: "14px",
    marginBottom: "20px",
    border: "1px solid #fecaca",
  },
};

export default StudentDashboard;
