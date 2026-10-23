import React, { useState, useEffect } from "react";
import RequestTable from "../components/RequestTable.jsx";
import { RefreshCw, Trash2, Zap, QrCode, CheckCircle2, XCircle, Clock } from "lucide-react";

/**
 * StaffDashboard — Modern tidy toolbar, polished banner, icon-rich stat row.
 * NO logic changes.
 */
function StaffDashboard({ currentUser, onOpenScanner }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const role = currentUser?.role; // 'advisor', 'hod', or 'warden'

  const fetchStaffRequests = async () => {
    try {
      setLoading(true);
      let endpoint = "";

      if (role === "advisor") {
        endpoint = `/api/requests/advisor/${currentUser.id}`;
      } else if (role === "hod") {
        endpoint = `/api/requests/hod/${currentUser.id}`;
      } else if (role === "warden") {
        endpoint = `/api/requests/warden`;
      }

      const res = await fetch(endpoint);
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
    if (currentUser) {
      fetchStaffRequests();
    }
  }, [currentUser]);

  // Handle Accept Button Action
  const handleAccept = async (requestId) => {
    let endpoint = "";
    if (role === "advisor") endpoint = `/api/requests/${requestId}/advisor-decision`;
    else if (role === "hod") endpoint = `/api/requests/${requestId}/hod-decision`;
    else if (role === "warden") endpoint = `/api/requests/${requestId}/warden-decision`;

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "approve" }),
      });
      if (res.ok) {
        fetchStaffRequests();
      }
    } catch (err) {
      alert("Error approving request: " + err.message);
    }
  };

  // Handle Reject Button Action
  const handleReject = async (requestId) => {
    let endpoint = "";
    if (role === "advisor") endpoint = `/api/requests/${requestId}/advisor-decision`;
    else if (role === "hod") endpoint = `/api/requests/${requestId}/hod-decision`;
    else if (role === "warden") endpoint = `/api/requests/${requestId}/warden-decision`;

    try {
      const res = await fetch(endpoint, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ decision: "reject" }),
      });
      if (res.ok) {
        fetchStaffRequests();
      }
    } catch (err) {
      alert("Error rejecting request: " + err.message);
    }
  };

  // Clear Button: Temporarily hides requests from this staff member's view
  const handleClear = async () => {
    try {
      const res = await fetch(`/api/requests/staff/${currentUser.id}/clear`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentUser.role, department: currentUser.department }),
      });
      if (res.ok) {
        setRequests([]);
      }
    } catch (err) {
      alert("Error clearing dashboard: " + err.message);
    }
  };

  // Clear All Button: PERMANENTLY deletes request rows from database
  const handleClearAll = async () => {
    const confirmDelete = window.confirm(
      "This will permanently delete these requests for everyone, including the student. This cannot be undone. Continue?"
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`/api/requests/staff/${currentUser.id}/clear-all`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: currentUser.role, department: currentUser.department }),
      });
      if (res.ok) {
        setRequests([]);
      }
    } catch (err) {
      alert("Error deleting requests: " + err.message);
    }
  };

  const getRoleTitle = () => {
    if (role === "advisor") return "Department Advisor Dashboard";
    if (role === "hod") return "Head of Department (HOD) Dashboard";
    if (role === "warden") return "Hostel Warden Dashboard";
    return "Staff Dashboard";
  };

  const getRoleSubtitle = () => {
    if (role === "advisor")
      return `Reviewing requests submitted to ${currentUser?.department || "Department"} (Year 1-4).`;
    if (role === "hod")
      return `Reviewing verified advisor requests for ${currentUser?.department || "Department"}.`;
    if (role === "warden")
      return "Reviewing approved hosteller leave and outpass requests across all departments.";
    return "Review and manage incoming student requests.";
  };

  const pendingCount = requests.filter((r) => r.status?.startsWith("pending")).length;
  const approvedCount = requests.filter((r) => r.status === "approved").length;
  const rejectedCount = requests.filter((r) => r.status === "rejected").length;

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        {/* Header with Title and Dashboard Actions */}
        <div style={styles.header}>
          <div>
            <div style={styles.roleTag}>
              {role === "warden" ? "HOSTEL WARDEN PORTAL" : `DEPARTMENT PORTAL • ${currentUser?.department || ""}`}
            </div>
            <h1 style={styles.title}>{getRoleTitle()}</h1>
            <p style={styles.subtitle}>{getRoleSubtitle()}</p>
          </div>

          <div style={styles.headerActions}>
            <button
              style={styles.scanBtn}
              onClick={onOpenScanner}
              title="Open QR Scanner to verify student passes"
            >
              <QrCode size={15} style={{ display: "inline", marginRight: "6px", verticalAlign: "middle" }} />
              Scan Pass
            </button>

            <button style={styles.refreshBtn} onClick={fetchStaffRequests}>
              <RefreshCw size={14} style={{ display: "inline", marginRight: "5px", verticalAlign: "middle" }} />
              Refresh
            </button>

            {requests.length > 0 && (
              <>
                <button style={styles.clearBtn} onClick={handleClear} title="Hide requests from your dashboard view only">
                  Clear View
                </button>
                <button
                  style={styles.clearAllBtn}
                  onClick={handleClearAll}
                  title="Permanently delete matching pending requests from database"
                >
                  <Trash2 size={14} style={{ display: "inline", marginRight: "4px", verticalAlign: "middle" }} />
                  Clear All
                </button>
              </>
            )}
          </div>
        </div>

        {/* Stats row */}
        <div style={styles.statsRow}>
          <div style={{ ...styles.statChip, borderColor: "#fde68a", backgroundColor: "#fffbeb" }}>
            <Clock size={16} color="#d97706" />
            <span style={{ color: "#b45309", fontWeight: "700" }}>{pendingCount}</span>
            <span style={styles.chipLabel}>Pending</span>
          </div>
          <div style={{ ...styles.statChip, borderColor: "#a7f3d0", backgroundColor: "#ecfdf5" }}>
            <CheckCircle2 size={16} color="#059669" />
            <span style={{ color: "#047857", fontWeight: "700" }}>{approvedCount}</span>
            <span style={styles.chipLabel}>Approved</span>
          </div>
          <div style={{ ...styles.statChip, borderColor: "#fecaca", backgroundColor: "#fef2f2" }}>
            <XCircle size={16} color="#dc2626" />
            <span style={{ color: "#b91c1c", fontWeight: "700" }}>{rejectedCount}</span>
            <span style={styles.chipLabel}>Rejected</span>
          </div>
        </div>

        {/* Pending Requests Overview Banner */}
        <div style={styles.banner}>
          <div style={styles.bannerIcon}><Zap size={22} color="#f59e0b" /></div>
          <div>
            <strong style={styles.bannerTitle}>
              {requests.length} Pending {requests.length === 1 ? "Request" : "Requests"} Requiring Your Action
            </strong>
            <p style={styles.bannerSubtitle}>
              Please verify the reason, date, and time before accepting or rejecting student submissions.
            </p>
          </div>
        </div>

        {/* Requests Table */}
        {loading ? (
          <div style={styles.loadingBox}>
            <Clock size={32} color="#cbd5e1" style={{ marginBottom: "10px" }} />
            <p>Loading pending requests…</p>
          </div>
        ) : error ? (
          <div style={styles.errorBox}>{error}</div>
        ) : (
          <RequestTable
            requests={requests}
            role={role}
            onAccept={handleAccept}
            onReject={handleReject}
          />
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
    maxWidth: "1200px",
    margin: "0 auto",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "20px",
    marginBottom: "20px",
    flexWrap: "wrap",
  },
  roleTag: {
    display: "inline-block",
    fontSize: "11px",
    fontWeight: "700",
    color: "#4f46e5",
    letterSpacing: "0.08em",
    marginBottom: "6px",
    textTransform: "uppercase",
    backgroundColor: "#eef2ff",
    border: "1px solid #c7d2fe",
    padding: "3px 10px",
    borderRadius: "9999px",
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
  scanBtn: {
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#ffffff",
    border: "none",
    padding: "10px 16px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
    fontFamily: "inherit",
    animation: "pulse-glow 2.5s infinite",
  },
  refreshBtn: {
    backgroundColor: "#ffffff",
    color: "#1e293b",
    border: "1.5px solid #e2e8f0",
    padding: "9px 14px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    display: "flex",
    alignItems: "center",
  },
  clearBtn: {
    backgroundColor: "#ffffff",
    color: "#475569",
    border: "1.5px solid #e2e8f0",
    padding: "9px 14px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
  },
  clearAllBtn: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    border: "1.5px solid #fecaca",
    padding: "9px 14px",
    borderRadius: "9px",
    fontSize: "13px",
    fontWeight: "700",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    fontFamily: "inherit",
  },
  statsRow: {
    display: "flex",
    gap: "12px",
    flexWrap: "wrap",
    marginBottom: "20px",
  },
  statChip: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 14px",
    borderRadius: "9999px",
    border: "1.5px solid",
    fontSize: "13px",
    fontWeight: "600",
  },
  chipLabel: {
    color: "#64748b",
    fontWeight: "500",
  },
  banner: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderLeft: "4px solid #4f46e5",
    borderRadius: "12px",
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    marginBottom: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  bannerIcon: {
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
  },
  bannerTitle: {
    color: "#0f172a",
    fontSize: "15px",
    fontWeight: "700",
  },
  bannerSubtitle: {
    color: "#64748b",
    fontSize: "13px",
    margin: "2px 0 0",
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

export default StaffDashboard;
