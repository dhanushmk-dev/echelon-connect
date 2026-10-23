import React, { useState, useEffect } from "react";

/**
 * Modern RequestForm Component matching EchelonConnect aesthetics.
 * Conditionally displays fields for Day Scholars vs Hostellers.
 * Includes cascading Department -> Academic Year -> Advisor dropdowns.
 */
function RequestForm({ currentUser, onNavigate }) {
  const isHosteller = currentUser?.accommodation_type === "hosteller";

  // Form Fields
  const [requestType, setRequestType] = useState(
    isHosteller ? "leave_letter" : "leave_request"
  );
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [time, setTime] = useState("");
  const [outTime, setOutTime] = useState("");
  const [inTime, setInTime] = useState("");
  const [reason, setReason] = useState("");

  // Cascading Dropdowns State
  const [selectedDept, setSelectedDept] = useState(currentUser?.department || "");
  const [selectedYear, setSelectedYear] = useState(currentUser?.year || 1);
  const [advisorChoice, setAdvisorChoice] = useState("all");
  const [advisorsList, setAdvisorsList] = useState([]);
  const [departments, setDepartments] = useState([]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch departments list on mount
  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => setDepartments(data))
      .catch((err) => console.error("Error fetching departments:", err));
  }, []);

  // Fetch advisors whenever selected department changes
  useEffect(() => {
    if (selectedDept) {
      fetch(`/api/advisors?department=${encodeURIComponent(selectedDept)}`)
        .then((res) => res.json())
        .then((data) => setAdvisorsList(data))
        .catch((err) => console.error("Error fetching advisors:", err));
    }
  }, [selectedDept]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (new Date(toDate) < new Date(fromDate)) {
      setError("The 'To Date' cannot be before the 'From Date'.");
      return;
    }

    setLoading(true);

    try {
      let fromDateTimeVal = fromDate;
      let toDateTimeVal = toDate;

      // Append time if OD request
      if (requestType === "od_request" && time) {
        fromDateTimeVal = `${fromDate}T${time}:00`;
        toDateTimeVal = `${toDate}T${time}:00`;
      } else {
        fromDateTimeVal = `${fromDate}T09:00:00`;
        toDateTimeVal = `${toDate}T17:00:00`;
      }

      const payload = {
        student_id: currentUser.id,
        request_type: requestType,
        from_datetime: fromDateTimeVal,
        to_datetime: toDateTimeVal,
        out_time: requestType === "leave_outpass_letter" ? outTime : null,
        in_time: requestType === "leave_outpass_letter" ? inTime : null,
        reason,
        department: selectedDept,
        year: parseInt(selectedYear),
        accommodation_type: currentUser.accommodation_type,
        hostel_block: currentUser.hostel_block || null,
        room_number: currentUser.room_number || null,
        advisor_choice: advisorChoice,
      };

      const response = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to submit request.");
      }

      // Navigate to Student Dashboard upon successful submission
      onNavigate("student-dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main style={styles.page}>
      <div style={styles.container}>
        <div style={styles.formCard}>
          {/* Card Header */}
          <div style={styles.cardHeader}>
            <div>
              <p style={styles.eyebrow}>NEW REQUEST</p>
              <h2 style={styles.cardTitle}>Submit Leave / Outpass Application</h2>
            </div>
            <div style={styles.badge}>
              {isHosteller ? "Hosteller Account" : "Day Scholar Account"}
            </div>
          </div>

          {error && <div style={styles.errorBox}>{error}</div>}

          <form onSubmit={handleSubmit} style={styles.form}>
            {/* Request Type Selector */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>Request Type</label>
              <select
                style={styles.select}
                value={requestType}
                onChange={(e) => setRequestType(e.target.value)}
              >
                {!isHosteller && <option value="leave_request">Leave Request</option>}
                {!isHosteller && <option value="od_request">OD (On Duty) Request</option>}

                {isHosteller && <option value="leave_letter">Leave Letter</option>}
                {isHosteller && <option value="leave_outpass_letter">Leave and Outpass Letter</option>}
                {isHosteller && <option value="od_request">OD (On Duty) Request</option>}
              </select>
            </div>

            {/* Reason Textarea */}
            <div style={styles.fieldGroup}>
              <label style={styles.label}>
                Reason for {requestType.replace(/_/g, " ").toUpperCase()} <span style={{ color: "#ef4444" }}>*</span>
              </label>
              <textarea
                required
                rows={3}
                style={styles.textarea}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="State the clear reason for this leave, outpass, or on-duty request..."
              />
              <span style={styles.fieldHint}>This reason will be visible to your Advisor, HOD, and Warden.</span>
            </div>

            {/* Date Selection */}
            <div style={styles.rowGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>From Date</label>
                <input
                  type="date"
                  required
                  style={styles.input}
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </div>

              <div style={styles.fieldGroup}>
                <label style={styles.label}>To Date</label>
                <input
                  type="date"
                  required
                  style={styles.input}
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </div>
            </div>

            {/* Additional Time for OD */}
            {requestType === "od_request" && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Time of Event / OD</label>
                <input
                  type="time"
                  required
                  style={styles.input}
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </div>
            )}

            {/* Out Time & In Time for Leave and Outpass Letter */}
            {requestType === "leave_outpass_letter" && (
              <div style={styles.rowGrid}>
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Out Time (Leaving Campus)</label>
                  <input
                    type="time"
                    required
                    style={styles.input}
                    value={outTime}
                    onChange={(e) => setOutTime(e.target.value)}
                  />
                </div>

                <div style={styles.fieldGroup}>
                  <label style={styles.label}>In Time (Returning to Campus)</label>
                  <input
                    type="time"
                    required
                    style={styles.input}
                    value={inTime}
                    onChange={(e) => setInTime(e.target.value)}
                  />
                </div>
              </div>
            )}

            {/* Cascading Approval Targets */}
            <div style={styles.sectionDivider}>
              <span>Approval Workflow Routing</span>
            </div>

            <div style={styles.rowGrid}>
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Department</label>
                <select
                  style={styles.select}
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="">Select Department</option>
                  {departments.map((dep) => (
                    <option key={dep} value={dep}>{dep}</option>
                  ))}
                </select>
              </div>

              {selectedDept && (
                <div style={styles.fieldGroup}>
                  <label style={styles.label}>Academic Year</label>
                  <select
                    style={styles.select}
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              )}
            </div>

            {selectedDept && selectedYear && (
              <div style={styles.fieldGroup}>
                <label style={styles.label}>Designated Advisor</label>
                <select
                  style={styles.select}
                  value={advisorChoice}
                  onChange={(e) => setAdvisorChoice(e.target.value)}
                >
                  <option value="all">All (Notify all department advisors)</option>
                  {advisorsList.map((adv) => (
                    <option key={adv.id} value={adv.id}>{adv.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Submit Button */}
            <div style={{ marginTop: "12px" }}>
              <button
                type="submit"
                disabled={loading}
                style={styles.submitBtn}
              >
                {loading ? "Submitting Application..." : "Submit Application →"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}

const styles = {
  page: {
    background: "linear-gradient(135deg, #f1f4f9 0%, #e8edf6 100%)",
    minHeight: "calc(100vh - 120px)",
    padding: "40px 20px 80px",
  },
  container: {
    maxWidth: "700px",
    margin: "0 auto",
  },
  formCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderTop: "4px solid #4f46e5",
    borderRadius: "18px",
    padding: "40px",
    boxShadow: "0 10px 30px -5px rgba(0,0,0,0.08), 0 4px 8px -4px rgba(0,0,0,0.04)",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: "16px",
    marginBottom: "32px",
    flexWrap: "wrap",
    paddingBottom: "24px",
    borderBottom: "1px solid #f1f5f9",
  },
  eyebrow: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#4f46e5",
    letterSpacing: "0.08em",
    margin: "0 0 6px",
  },
  cardTitle: {
    fontSize: "22px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  badge: {
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    padding: "6px 14px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "700",
    border: "1px solid #c7d2fe",
    whiteSpace: "nowrap",
    alignSelf: "flex-start",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "22px",
  },
  rowGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
    gap: "16px",
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
    letterSpacing: "0.01em",
  },
  fieldHint: {
    fontSize: "12px",
    color: "#94a3b8",
    marginTop: "4px",
  },
  input: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    outlineColor: "#4f46e5",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s ease",
  },
  select: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    outlineColor: "#4f46e5",
    boxSizing: "border-box",
    fontFamily: "inherit",
    transition: "border-color 0.15s ease",
  },
  textarea: {
    width: "100%",
    padding: "12px 14px",
    borderRadius: "9px",
    border: "1.5px solid #e2e8f0",
    fontSize: "14px",
    color: "#1e293b",
    backgroundColor: "#f8fafc",
    outlineColor: "#4f46e5",
    resize: "vertical",
    boxSizing: "border-box",
    fontFamily: "inherit",
    lineHeight: "1.55",
    transition: "border-color 0.15s ease",
  },
  sectionDivider: {
    position: "relative",
    textAlign: "center",
    borderBottom: "1px solid #e2e8f0",
    lineHeight: "0.1em",
    color: "#94a3b8",
    fontSize: "11px",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.06em",
    margin: "4px 0",
  },
  submitBtn: {
    width: "100%",
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#ffffff",
    border: "none",
    padding: "14px 20px",
    borderRadius: "9px",
    fontWeight: "700",
    fontSize: "15px",
    cursor: "pointer",
    transition: "opacity 0.15s, transform 0.15s",
    boxShadow: "0 4px 14px rgba(79,70,229,0.32)",
    fontFamily: "inherit",
    letterSpacing: "-0.01em",
  },
  errorBox: {
    backgroundColor: "#fef2f2",
    color: "#b91c1c",
    padding: "12px 16px",
    borderRadius: "9px",
    fontSize: "14px",
    marginBottom: "20px",
    border: "1px solid #fecaca",
  },
};

export default RequestForm;

