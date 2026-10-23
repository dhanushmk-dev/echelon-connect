import React, { useState } from "react";
import { QrCode, X, Clock, Check, FileText, ShieldCheck } from "lucide-react";

/**
 * Reusable RequestTable component used by both Student and Staff dashboards.
 * Displays request details with Reason, total days, dates & times.
 * Matches clean modern styling of EchelonConnect.
 */
function RequestTable({ requests, role, onAccept, onReject }) {
  const [qrModalReq, setQrModalReq] = useState(null);
  // Helper function to format DateTime string into Date and Time components
  const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return { date: "-", time: "" };
    const dateObj = new Date(dateTimeString);
    const date = dateObj.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
    const time = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { date, time };
  };

  // Helper function to calculate total days between from_datetime and to_datetime
  const calculateDays = (fromStr, toStr) => {
    if (!fromStr || !toStr) return 1;
    const fromDate = new Date(fromStr);
    const toDate = new Date(toStr);
    const diffTime = Math.abs(toDate - fromDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  };

  // Map request types to plain English labels
  const formatRequestType = (type) => {
    switch (type) {
      case "leave_request":
        return "Leave Request";
      case "od_request":
        return "OD Request";
      case "leave_letter":
        return "Leave Letter";
      case "leave_outpass_letter":
        return "Leave & Outpass Letter";
      default:
        return type;
    }
  };

  // Map status strings to readable tags
  const formatStatus = (status) => {
    switch (status) {
      case "pending_advisor":
        return "Pending Advisor";
      case "pending_hod":
        return "Pending HOD";
      case "pending_warden":
        return "Pending Warden";
      case "approved":
        return "Approved";
      case "rejected":
        return "Rejected";
      default:
        return status;
    }
  };

  if (!requests || requests.length === 0) {
    return (
      <div style={styles.emptyContainer}>
        <div style={styles.emptyIcon}><FileText size={48} color="#cbd5e1" /></div>
        <p style={styles.emptyTitle}>No requests available</p>
        <p style={styles.emptySubtitle}>Submitted requests will appear here once available.</p>
      </div>
    );
  }

  return (
    <>
      <div style={styles.tableCard}>
        <div style={styles.tableWrapper}>
          <table style={styles.table}>
          <thead>
            <tr>
              {/* Show Hostel Block & Room column for Warden only */}
              {role === "warden" && <th style={styles.th}>Hostel Info</th>}
              {role !== "student" && <th style={styles.th}>Student</th>}
              <th style={styles.th}>Type</th>
              <th style={styles.th}>Reason</th>
              <th style={styles.th}>From</th>
              <th style={styles.th}>To</th>
              <th style={styles.th}>Days</th>
              <th style={styles.th}>Status</th>
              {role !== "student" && <th style={styles.th}>Gate Exit</th>}
              {role === "student" && <th style={{ ...styles.th, textAlign: "center" }}>QR Pass</th>}
              {(role === "advisor" || role === "hod" || role === "warden") && (
                <th style={{ ...styles.th, textAlign: "center" }}>Action</th>
              )}
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => {
              const fromInfo = formatDateTime(req.from_datetime);
              const toInfo = formatDateTime(req.to_datetime);
              const totalDays = calculateDays(req.from_datetime, req.to_datetime);

              return (
                <tr key={req.id} style={styles.tr}>
                  {/* Warden Hostel Info */}
                  {role === "warden" && (
                    <td style={styles.td}>
                      <div style={styles.hostelBadge}>
                        <strong>{req.hostel_block || "N/A"}</strong>
                        <span>Room {req.room_number || "N/A"}</span>
                      </div>
                    </td>
                  )}

                  {/* Student Details for Staff Dashboards */}
                  {role !== "student" && (
                    <td style={styles.td}>
                      <div style={styles.studentName}>{req.student_name || "Student"}</div>
                      <div style={styles.studentSubtext}>
                        {req.register_number} • {req.department || ""} (Yr {req.year || "1"})
                      </div>
                    </td>
                  )}

                  {/* Request Type */}
                  <td style={styles.td}>
                    <span style={styles.typeBadge}>
                      {formatRequestType(req.request_type)}
                    </span>
                  </td>

                  {/* REASON Column */}
                  <td style={{ ...styles.td, maxWidth: "260px" }}>
                    <div style={styles.reasonBox} title={req.reason}>
                      {req.reason ? req.reason : <em style={{ color: "#94a3b8" }}>No reason provided</em>}
                    </div>
                  </td>

                  {/* From Column: Date on top, Time below */}
                  <td style={styles.td}>
                    <div style={styles.dateText}>{fromInfo.date}</div>
                    {req.out_time ? (
                      <div style={styles.timeBadge}><Clock size={12} style={{marginRight: "4px"}} /> {req.out_time}</div>
                    ) : req.request_type === "od_request" && fromInfo.time ? (
                      <div style={styles.timeBadge}><Clock size={12} style={{marginRight: "4px"}} /> {fromInfo.time}</div>
                    ) : null}
                  </td>

                  {/* To Column: Date on top, Time below */}
                  <td style={styles.td}>
                    <div style={styles.dateText}>{toInfo.date}</div>
                    {req.in_time ? (
                      <div style={styles.timeBadge}><Clock size={12} style={{marginRight: "4px"}} /> {req.in_time}</div>
                    ) : req.request_type === "od_request" && toInfo.time ? (
                      <div style={styles.timeBadge}><Clock size={12} style={{marginRight: "4px"}} /> {toInfo.time}</div>
                    ) : null}
                  </td>

                  {/* Days */}
                  <td style={styles.td}>
                    <span style={styles.daysBadge}>{totalDays} {totalDays === 1 ? "day" : "days"}</span>
                  </td>

                  {/* Status Badge */}
                  <td style={styles.td}>
                    <span style={getStatusBadgeStyle(req.status)}>
                      {formatStatus(req.status)}
                    </span>
                  </td>

                  {/* Gate Exit / Scanned At Column for Staff & Advisors */}
                  {role !== "student" && (
                    <td style={styles.td}>
                      {req.scanned_at ? (
                        <div style={styles.scannedBadge}>
                          <ShieldCheck size={14} color="#059669" />
                          <div>
                            <div style={styles.scannedDate}>
                              {formatDateTime(req.scanned_at).date}
                            </div>
                            <div style={styles.scannedTime}>
                              {formatDateTime(req.scanned_at).time}
                            </div>
                          </div>
                        </div>
                      ) : req.status === "approved" ? (
                        <span style={styles.pendingScanBadge}>Not Exited</span>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>-</span>
                      )}
                    </td>
                  )}

                  {role === "student" && (
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      {req.qr_image_path ? (
                        <button
                          style={styles.qrButton}
                          onClick={() => setQrModalReq(req)}
                          title="View QR Pass"
                        >
                          <QrCode size={16} /> View QR
                        </button>
                      ) : (
                        <span style={{ color: "#94a3b8", fontSize: "12px" }}>-</span>
                      )}
                    </td>
                  )}
                  
                  {/* Accept / Reject Buttons for Staff */}
                  {(role === "advisor" || role === "hod" || role === "warden") && (
                    <td style={{ ...styles.td, textAlign: "center" }}>
                      <div style={styles.actionGroup}>
                        <button
                          style={styles.acceptButton}
                          onClick={() => onAccept(req.id)}
                          title="Accept and approve/forward this request"
                        >
                          <Check size={16} /> Accept
                        </button>
                        <button
                          style={styles.rejectButton}
                          onClick={() => onReject(req.id)}
                          title="Reject and stop this request"
                        >
                          <X size={16} /> Reject
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
      
      {qrModalReq && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            <button style={styles.modalClose} onClick={() => setQrModalReq(null)}>
              <X size={20} />
            </button>
            <h3 style={styles.modalTitle}>Gate Pass QR</h3>
            <p style={styles.modalSubtitle}>Scan this at the gate</p>
            <div style={styles.qrContainer}>
              <img
                src={qrModalReq.qr_image_path}
                alt="Gate Pass QR Code"
                style={styles.qrImage}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
}

const getStatusBadgeStyle = (status) => {
  let bg = "#f1f5f9";
  let color = "#475569";
  let border = "#cbd5e1";

  if (status === "approved") {
    bg = "#ecfdf5";
    color = "#047857";
    border = "#a7f3d0";
  } else if (status === "rejected") {
    bg = "#fef2f2";
    color = "#b91c1c";
    border = "#fecaca";
  } else if (status?.startsWith("pending")) {
    bg = "#fffbeb";
    color = "#b45309";
    border = "#fde68a";
  }

  return {
    backgroundColor: bg,
    color: color,
    border: `1px solid ${border}`,
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "700",
    display: "inline-block",
    whiteSpace: "nowrap",
  };
};

const styles = {
  tableCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06), 0 2px 4px rgba(0,0,0,0.03)",
    overflow: "hidden",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    textAlign: "left",
    minWidth: "720px",
  },
  th: {
    backgroundColor: "#f8fafc",
    color: "#64748b",
    padding: "13px 16px",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    borderBottom: "1px solid #e2e8f0",
    position: "sticky",
    top: 0,
    zIndex: 1,
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
    transition: "background-color 0.15s ease",
  },
  td: {
    padding: "14px 16px",
    fontSize: "14px",
    color: "#334155",
    verticalAlign: "middle",
  },
  studentName: {
    fontWeight: "700",
    color: "#0f172a",
    fontSize: "14px",
  },
  studentSubtext: {
    fontSize: "12px",
    color: "#64748b",
    marginTop: "2px",
  },
  typeBadge: {
    fontWeight: "600",
    color: "#1e293b",
    fontSize: "13px",
  },
  reasonBox: {
    fontSize: "13px",
    lineHeight: "1.45",
    color: "#334155",
    backgroundColor: "#f8fafc",
    padding: "8px 12px",
    borderRadius: "8px",
    border: "1px solid #e2e8f0",
    wordBreak: "break-word",
  },
  dateText: {
    fontWeight: "700",
    color: "#1e293b",
    fontSize: "13px",
  },
  timeBadge: {
    fontSize: "11px",
    color: "#475569",
    backgroundColor: "#e2e8f0",
    padding: "2px 7px",
    borderRadius: "5px",
    marginTop: "4px",
    display: "inline-flex",
    alignItems: "center",
    fontWeight: "500",
  },
  daysBadge: {
    fontSize: "13px",
    fontWeight: "700",
    color: "#475569",
  },
  hostelBadge: {
    display: "flex",
    flexDirection: "column",
    fontSize: "13px",
    color: "#0f172a",
  },
  actionGroup: {
    display: "inline-flex",
    gap: "8px",
    justifyContent: "center",
  },
  acceptButton: {
    background: "linear-gradient(135deg, #059669, #10b981)",
    color: "white",
    border: "none",
    padding: "7px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    transition: "opacity 0.15s, transform 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    boxShadow: "0 2px 6px rgba(16,185,129,0.3)",
    fontFamily: "inherit",
  },
  rejectButton: {
    background: "linear-gradient(135deg, #dc2626, #ef4444)",
    color: "white",
    border: "none",
    padding: "7px 14px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    transition: "opacity 0.15s, transform 0.15s",
    display: "inline-flex",
    alignItems: "center",
    gap: "5px",
    boxShadow: "0 2px 6px rgba(239,68,68,0.3)",
    fontFamily: "inherit",
  },
  emptyContainer: {
    padding: "60px 20px",
    textAlign: "center",
    backgroundColor: "#ffffff",
    borderRadius: "14px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
  },
  emptyIcon: {
    marginBottom: "12px",
  },
  emptyTitle: {
    fontSize: "17px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 6px",
    letterSpacing: "-0.01em",
  },
  emptySubtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: 0,
  },
  qrButton: {
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "white",
    border: "none",
    padding: "6px 12px",
    borderRadius: "7px",
    cursor: "pointer",
    fontWeight: "700",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "6px",
    transition: "opacity 0.15s",
    margin: "0 auto",
    fontFamily: "inherit",
    boxShadow: "0 2px 6px rgba(79,70,229,0.25)",
  },
  modalOverlay: {
    position: "fixed",
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.6)",
    backdropFilter: "blur(6px)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1000,
    animation: "fadeIn 0.2s ease",
  },
  modalContent: {
    backgroundColor: "white",
    padding: "36px",
    borderRadius: "20px",
    boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
    textAlign: "center",
    position: "relative",
    maxWidth: "90%",
    width: "380px",
    animation: "scaleIn 0.2s ease",
  },
  modalClose: {
    position: "absolute",
    top: "16px", right: "16px",
    background: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    color: "#64748b",
    cursor: "pointer",
    padding: "6px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  modalTitle: {
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 4px",
    letterSpacing: "-0.02em",
  },
  modalSubtitle: {
    color: "#64748b",
    fontSize: "14px",
    margin: "0 0 24px",
  },
  qrContainer: {
    background: "white",
    padding: "16px",
    border: "1px solid #e2e8f0",
    borderRadius: "14px",
    display: "inline-block",
  },
  qrImage: {
    width: "200px",
    height: "200px",
    display: "block",
  },
  scannedBadge: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    backgroundColor: "#ecfdf5",
    border: "1px solid #a7f3d0",
    padding: "5px 9px",
    borderRadius: "8px",
    width: "fit-content",
  },
  scannedDate: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#065f46",
    lineHeight: "1.2",
  },
  scannedTime: {
    fontSize: "11px",
    color: "#047857",
  },
  pendingScanBadge: {
    fontSize: "11px",
    fontWeight: "600",
    color: "#64748b",
    backgroundColor: "#f1f5f9",
    border: "1px solid #e2e8f0",
    padding: "3px 8px",
    borderRadius: "5px",
    display: "inline-block",
  },
};

export default RequestTable;
