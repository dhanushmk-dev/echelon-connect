import React from "react";
import { GraduationCap, Users, FileCheck2, GitMerge, Eye, CheckCircle2, ArrowRight, Zap } from "lucide-react";

/**
 * Home Landing Page — Echelon Connect
 * Beautiful hero with gradient mesh, feature cards with icons, workflow strip.
 * NO logic changes — only presentation.
 */
function Home({ onNavigate, currentUser }) {
  return (
    <main style={styles.page}>
      {/* Decorative blurred blobs */}
      <div style={styles.blob1} aria-hidden="true" />
      <div style={styles.blob2} aria-hidden="true" />

      <section style={styles.heroSection}>
        <div style={styles.heroContainer}>

          {/* Badge */}
          <div style={styles.badge}>
            <Zap size={12} style={{ display: "inline", marginRight: "5px", verticalAlign: "middle" }} />
            ECHELON CONNECT PORTAL
          </div>

          {/* Title */}
          <h1 style={styles.heroTitle}>
            Smart leave &amp; outpass approvals,{" "}
            <span style={styles.heroTitleGradient}>all paperless.</span>
          </h1>

          <p style={styles.heroSubtitle}>
            A unified system connecting Students, Department Advisors, Heads of Department, and Hostel Wardens for fast,
            transparent multi-tier approvals — with a QR-gated exit scan.
          </p>

          {/* CTA area */}
          {!currentUser ? (
            <div style={styles.actionsGrid}>
              {/* Student portal card */}
              <div style={styles.portalCard}>
                <div style={styles.portalIconWrap} data-color="blue">
                  <GraduationCap size={26} color="#2563eb" />
                </div>
                <h3 style={styles.portalHeading}>Student Portal</h3>
                <p style={styles.portalDesc}>
                  Submit Day Scholar leave / OD or Hosteller outpass requests and track multi-tier status in real-time.
                </p>
                <div style={styles.btnRow}>
                  <button
                    style={styles.primaryBtn}
                    onClick={() => onNavigate("student-login")}
                  >
                    Student Login
                  </button>
                  <button
                    style={styles.ghostBtn}
                    onClick={() => onNavigate("student-signup")}
                  >
                    Sign Up
                  </button>
                </div>
              </div>

              {/* Staff portal card */}
              <div style={styles.portalCard}>
                <div style={{ ...styles.portalIconWrap, backgroundColor: "#f0fdf4", border: "1px solid #bbf7d0" }}>
                  <Users size={26} color="#16a34a" />
                </div>
                <h3 style={styles.portalHeading}>Staff Portal</h3>
                <p style={styles.portalDesc}>
                  Advisors, HODs, and Wardens can review pending requests with reasons, accommodation details, and
                  approve or reject instantly.
                </p>
                <div style={styles.btnRow}>
                  <button
                    style={styles.primaryBtn}
                    onClick={() => onNavigate("staff-login")}
                  >
                    Staff Login
                  </button>
                  <button
                    style={styles.ghostBtn}
                    onClick={() => onNavigate("staff-signup")}
                  >
                    Sign Up
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div style={styles.loggedInCard}>
              <div style={styles.loggedInAvatar}>
                {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : "U"}
              </div>
              <div>
                <p style={styles.loggedInGreeting}>Welcome back,</p>
                <p style={styles.loggedInName}>{currentUser.name}</p>
              </div>
              <button
                style={{ ...styles.primaryBtn, marginTop: 0, alignSelf: "center" }}
                onClick={() =>
                  onNavigate(currentUser.user_type === "student" ? "student-dashboard" : "staff-dashboard")
                }
              >
                Go to Dashboard <ArrowRight size={15} style={{ display: "inline", marginLeft: "4px", verticalAlign: "middle" }} />
              </button>
            </div>
          )}
        </div>
      </section>

      {/* ── Feature Cards ── */}
      <section style={styles.featuresSection}>
        <div style={styles.sectionContainer}>
          <p style={styles.sectionEyebrow}>WHY ECHELON CONNECT</p>
          <h2 style={styles.sectionTitle}>Everything your campus needs</h2>

          <div style={styles.featuresGrid}>
            <div style={styles.featureCard}>
              <div style={{ ...styles.featureIconCircle, backgroundColor: "#eff6ff" }}>
                <FileCheck2 size={22} color="#2563eb" />
              </div>
              <h3 style={styles.featureCardTitle}>100% Paperless</h3>
              <p style={styles.featureCardDesc}>
                Instant digital submission with automatic routing — no printed forms, no lost papers, no follow-up visits.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={{ ...styles.featureIconCircle, backgroundColor: "#fdf4ff" }}>
                <GitMerge size={22} color="#9333ea" />
              </div>
              <h3 style={styles.featureCardTitle}>Tiered Approval</h3>
              <p style={styles.featureCardDesc}>
                Every request passes through Advisor → HOD → Warden (if applicable) so nothing gets rubber-stamped.
              </p>
            </div>

            <div style={styles.featureCard}>
              <div style={{ ...styles.featureIconCircle, backgroundColor: "#f0fdf4" }}>
                <Eye size={22} color="#16a34a" />
              </div>
              <h3 style={styles.featureCardTitle}>Full Transparency</h3>
              <p style={styles.featureCardDesc}>
                Students see live status updates at every stage. Staff see complete reason, dates and accommodation details.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Approval Workflow Strip ── */}
      <section style={styles.workflowSection}>
        <div style={styles.sectionContainer}>
          <p style={styles.sectionEyebrow}>HOW IT WORKS</p>
          <h2 style={styles.sectionTitle}>Four-stage approval workflow</h2>

          <div style={styles.workflowStrip}>
            {[
              { label: "Student", sub: "Submits request", color: "#2563eb", bg: "#eff6ff" },
              { label: "Advisor", sub: "1st review", color: "#7c3aed", bg: "#f5f3ff" },
              { label: "HOD", sub: "2nd verification", color: "#0891b2", bg: "#ecfeff" },
              { label: "Warden", sub: "Final (Hostelars)", color: "#059669", bg: "#ecfdf5" },
            ].map((step, i, arr) => (
              <React.Fragment key={step.label}>
                <div style={styles.workflowStep}>
                  <div style={{ ...styles.workflowDot, backgroundColor: step.bg, border: `2px solid ${step.color}` }}>
                    <span style={{ color: step.color, fontWeight: "800", fontSize: "15px" }}>{i + 1}</span>
                  </div>
                  <strong style={{ ...styles.workflowLabel, color: step.color }}>{step.label}</strong>
                  <span style={styles.workflowSub}>{step.sub}</span>
                </div>
                {i < arr.length - 1 && (
                  <div style={styles.workflowArrow}>
                    <ArrowRight size={18} color="#94a3b8" />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <p style={styles.workflowNote}>
            <CheckCircle2 size={14} style={{ display: "inline", marginRight: "5px", verticalAlign: "middle", color: "#10b981" }} />
            Once fully approved, a single-use QR gate pass is generated automatically for hostel exit scanning.
          </p>
        </div>
      </section>
    </main>
  );
}

const styles = {
  page: {
    position: "relative",
    minHeight: "calc(100vh - 70px)",
    overflow: "hidden",
  },
  blob1: {
    position: "absolute",
    top: "-120px",
    right: "-180px",
    width: "520px",
    height: "520px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  blob2: {
    position: "absolute",
    bottom: "-80px",
    left: "-120px",
    width: "400px",
    height: "400px",
    borderRadius: "50%",
    background: "radial-gradient(circle, rgba(16,185,129,0.09) 0%, transparent 70%)",
    pointerEvents: "none",
    zIndex: 0,
  },
  heroSection: {
    position: "relative",
    zIndex: 1,
    padding: "72px 24px 56px",
    display: "flex",
    justifyContent: "center",
  },
  heroContainer: {
    maxWidth: "800px",
    width: "100%",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#eef2ff",
    color: "#4338ca",
    border: "1px solid #c7d2fe",
    padding: "6px 14px",
    borderRadius: "9999px",
    fontSize: "11px",
    fontWeight: "700",
    letterSpacing: "0.08em",
    marginBottom: "24px",
  },
  heroTitle: {
    fontSize: "clamp(30px, 5.5vw, 52px)",
    fontWeight: "900",
    color: "#0f172a",
    lineHeight: "1.15",
    letterSpacing: "-0.03em",
    margin: "0 0 20px",
  },
  heroTitleGradient: {
    background: "linear-gradient(90deg, #4f46e5, #7c3aed)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  heroSubtitle: {
    fontSize: "17px",
    lineHeight: "1.7",
    color: "#475569",
    maxWidth: "640px",
    margin: "0 auto 48px",
  },
  actionsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    textAlign: "left",
    marginBottom: "0",
  },
  portalCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "28px 28px 24px",
    boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -2px rgba(0,0,0,0.04)",
    display: "flex",
    flexDirection: "column",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  portalIconWrap: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    backgroundColor: "#eff6ff",
    border: "1px solid #bfdbfe",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "16px",
  },
  portalHeading: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px",
    letterSpacing: "-0.02em",
  },
  portalDesc: {
    fontSize: "14px",
    lineHeight: "1.6",
    color: "#64748b",
    margin: "0 0 22px",
    flex: 1,
  },
  btnRow: {
    display: "flex",
    gap: "10px",
  },
  primaryBtn: {
    flex: 1,
    background: "linear-gradient(135deg, #4f46e5, #6366f1)",
    color: "#ffffff",
    border: "none",
    padding: "11px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    transition: "transform 0.15s ease, box-shadow 0.15s ease",
    boxShadow: "0 2px 8px rgba(79,70,229,0.3)",
    fontFamily: "inherit",
  },
  ghostBtn: {
    backgroundColor: "#f8fafc",
    color: "#334155",
    border: "1px solid #e2e8f0",
    padding: "11px 16px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
    fontFamily: "inherit",
    transition: "background 0.15s ease",
  },
  loggedInCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px 28px",
    maxWidth: "480px",
    margin: "0 auto",
    display: "flex",
    alignItems: "center",
    gap: "20px",
    boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
    flexWrap: "wrap",
  },
  loggedInAvatar: {
    width: "52px",
    height: "52px",
    borderRadius: "50%",
    background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
    color: "#ffffff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "22px",
    fontWeight: "800",
    flexShrink: 0,
  },
  loggedInGreeting: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
  },
  loggedInName: {
    fontSize: "18px",
    fontWeight: "800",
    color: "#0f172a",
    margin: 0,
    letterSpacing: "-0.02em",
  },
  /* Section shared */
  featuresSection: {
    position: "relative",
    zIndex: 1,
    padding: "16px 24px 56px",
  },
  sectionContainer: {
    maxWidth: "960px",
    margin: "0 auto",
    textAlign: "center",
  },
  sectionEyebrow: {
    fontSize: "11px",
    fontWeight: "700",
    color: "#4f46e5",
    letterSpacing: "0.1em",
    marginBottom: "8px",
  },
  sectionTitle: {
    fontSize: "clamp(22px, 3.5vw, 32px)",
    fontWeight: "800",
    color: "#0f172a",
    letterSpacing: "-0.02em",
    marginBottom: "36px",
  },
  featuresGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "20px",
    textAlign: "left",
  },
  featureCard: {
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "16px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    transition: "transform 0.18s ease, box-shadow 0.18s ease",
  },
  featureIconCircle: {
    width: "44px",
    height: "44px",
    borderRadius: "11px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: "14px",
  },
  featureCardTitle: {
    fontSize: "15px",
    fontWeight: "800",
    color: "#0f172a",
    margin: "0 0 8px",
  },
  featureCardDesc: {
    fontSize: "13px",
    lineHeight: "1.6",
    color: "#64748b",
    margin: 0,
  },
  /* Workflow strip */
  workflowSection: {
    position: "relative",
    zIndex: 1,
    padding: "0 24px 72px",
  },
  workflowStrip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "0",
    flexWrap: "wrap",
    rowGap: "16px",
    padding: "32px 24px",
    backgroundColor: "#ffffff",
    border: "1px solid #e2e8f0",
    borderRadius: "18px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
    marginBottom: "20px",
  },
  workflowStep: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    padding: "0 16px",
  },
  workflowDot: {
    width: "48px",
    height: "48px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  workflowLabel: {
    fontSize: "13px",
    fontWeight: "800",
  },
  workflowSub: {
    fontSize: "12px",
    color: "#94a3b8",
    fontWeight: "500",
  },
  workflowArrow: {
    display: "flex",
    alignItems: "center",
    padding: "0 4px",
    marginTop: "-18px",
  },
  workflowNote: {
    fontSize: "13px",
    color: "#64748b",
    backgroundColor: "#f0fdf4",
    border: "1px solid #bbf7d0",
    padding: "10px 16px",
    borderRadius: "8px",
    display: "inline-block",
  },
};

export default Home;
