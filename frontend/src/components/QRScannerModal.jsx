import React, { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { X, CheckCircle, AlertTriangle, Upload, ShieldCheck } from "lucide-react";

/**
 * QRScannerModal
 * Allows Gate Staff / Guards / Advisors to scan student QR Gate passes
 * via device camera, image file upload, or manual token entry.
 * Single-use: upon accepting, records scanned_at timestamp and expires the QR immediately.
 */
export default function QRScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [passData, setPassData] = useState(null);
  const [scannedToken, setScannedToken] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);

  const scannerRef = useRef(null);
  const fileInputRef = useRef(null);

  // Extract clean token if full URL is scanned (e.g., http://.../verify/abc123xyz)
  const extractToken = (rawString) => {
    if (!rawString) return "";
    const trimmed = rawString.trim();
    if (trimmed.includes("/verify/")) {
      const parts = trimmed.split("/verify/");
      return parts[parts.length - 1].split("?")[0].split("/")[0].trim();
    }
    return trimmed;
  };

  // Verify token with backend
  const verifyToken = async (token) => {
    const cleanToken = extractToken(token);
    if (!cleanToken) {
      setErrorMsg("Please provide a valid QR pass or token.");
      return;
    }

    setLoading(true);
    setErrorMsg("");
    setPassData(null);
    setScannedToken(cleanToken);

    try {
      const res = await fetch(`/api/verify/${cleanToken}`);
      const data = await res.json();

      if (data.expired) {
        setErrorMsg("This QR pass is EXPIRED, already used, or invalid.");
      } else {
        setPassData(data);
      }
    } catch (err) {
      setErrorMsg("Failed to communicate with verification server: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Start Camera Scanning
  const startCamera = async () => {
    setErrorMsg("");
    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader-canvas");
      }

      const hasCameras = await Html5Qrcode.getCameras();
      if (!hasCameras || hasCameras.length === 0) {
        setErrorMsg("No camera detected on this device. Use manual entry or upload image.");
        return;
      }

      await scannerRef.current.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
        },
        async (decodedText) => {
          // Stop camera once scanned
          stopCamera();
          await verifyToken(decodedText);
        },
        () => {
          // Ignore ongoing scanning frame errors
        }
      );
      setCameraActive(true);
    } catch (err) {
      console.warn("Camera start failed:", err);
      setErrorMsg("Could not start camera. Check browser permissions or use Manual Entry.");
      setCameraActive(false);
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current && scannerRef.current.isScanning) {
        await scannerRef.current.stop();
      }
    } catch (err) {
      console.warn("Stop scanner error:", err);
    } finally {
      setCameraActive(false);
    }
  };

  // Handle image upload scanning
  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setErrorMsg("");

    // CRITICAL: Must await the asynchronous camera stop before calling scanFile
    await stopCamera();

    try {
      if (!scannerRef.current) {
        scannerRef.current = new Html5Qrcode("reader-canvas");
      }
      
      let decodedText;
      try {
        decodedText = await scannerRef.current.scanFile(file, false);
      } catch (err1) {
        // Fallback retry with showImage=true
        try {
          decodedText = await scannerRef.current.scanFile(file, true);
        } catch (err2) {
          throw new Error("Could not detect any QR code in the uploaded image.");
        }
      }

      if (decodedText) {
        await verifyToken(decodedText);
      } else {
        setErrorMsg("Could not detect any QR code in the uploaded image.");
      }
    } catch (err) {
      console.warn("Scan file error:", err);
      setErrorMsg("Could not detect any QR code in the uploaded image. Please ensure the QR is sharp and well lit.");
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  // Accept and Record Exit (Single-use expiration)
  const handleAcceptPass = async () => {
    if (!scannedToken) return;

    if (!window.confirm("Confirm gate exit? This pass will be marked as used and EXPIRED immediately.")) {
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/verify/${scannedToken}/expire`, {
        method: "POST",
      });
      const data = await res.json();

      if (res.ok) {
        setCompleted(true);
        if (onScanSuccess) {
          onScanSuccess({ token: scannedToken, passData, scanned_at: data.scanned_at });
        }
      } else {
        setErrorMsg(data.message || "Failed to mark pass as used.");
      }
    } catch (err) {
      setErrorMsg("Error finalizing pass: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAll = () => {
    stopCamera();
    setPassData(null);
    setScannedToken(null);
    setCompleted(false);
    setErrorMsg("");
  };

  const handleClose = () => {
    resetAll();
    onClose();
  };

  useEffect(() => {
    if (isOpen && !passData && !completed) {
      // Small delay to ensure DOM element exists
      const timer = setTimeout(() => {
        startCamera();
      }, 300);
      return () => {
        clearTimeout(timer);
        stopCamera();
      };
    } else {
      stopCamera();
    }
  }, [isOpen, passData, completed]);

  if (!isOpen) return null;

  return (
    <div style={styles.overlay} onClick={handleClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerTitleWrap}>
            <div style={styles.headerIcon}>
              <ShieldCheck size={22} color="#4f46e5" />
            </div>
            <div>
              <h3 style={styles.headerTitle}>Gate Pass QR Scanner</h3>
              <p style={styles.headerSubtitle}>Point camera at student QR pass for 1-time gate exit verification</p>
            </div>
          </div>
          <button style={styles.closeBtn} onClick={handleClose}>
            <X size={20} />
          </button>
        </div>

        {/* Error Alert */}
        {errorMsg && (
          <div style={styles.errorBox}>
            <AlertTriangle size={18} style={{ flexShrink: 0 }} />
            <div>
              <strong style={{ display: "block" }}>Verification Notice</strong>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Content Body */}
        <div style={styles.body}>
          {completed ? (
            /* Success State */
            <div style={styles.successState}>
              <div style={styles.successIcon}>
                <CheckCircle size={56} color="#10b981" />
              </div>
              <h4 style={styles.successTitle}>Pass Verified & Recorded!</h4>
              <p style={styles.successDesc}>
                Student exit timestamp has been recorded. This QR pass is now permanently expired.
              </p>
              <div style={styles.actionRow}>
                <button
                  style={styles.btnPrimary}
                  onClick={() => {
                    resetAll();
                  }}
                >
                  Scan Another Pass
                </button>
                <button style={styles.btnSecondary} onClick={handleClose}>
                  Done
                </button>
              </div>
            </div>
          ) : passData ? (
            /* Valid Pass Details View */
            <div style={styles.detailsView}>
              <div style={styles.passHeader}>
                <span style={styles.validBadge}>✓ VALID GATE PASS</span>
                <span style={styles.passTypeBadge}>
                  {passData.request_type?.replace(/_/g, " ").toUpperCase()}
                </span>
              </div>

              <div style={styles.detailsGrid}>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Student Name</span>
                  <strong style={styles.detailValue}>{passData.name}</strong>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Register Number</span>
                  <strong style={styles.detailValue}>{passData.register_number}</strong>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Department & Year</span>
                  <span style={styles.detailValue}>
                    {passData.department} (Year {passData.year})
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>Accommodation</span>
                  <span style={styles.detailValue}>
                    {passData.accommodation_type === "hosteller" ? "Hosteller" : "Day Scholar"}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>From Date/Time</span>
                  <span style={styles.detailValue}>
                    {new Date(passData.from_datetime).toLocaleString()}
                  </span>
                </div>
                <div style={styles.detailRow}>
                  <span style={styles.detailLabel}>To Date/Time</span>
                  <span style={styles.detailValue}>
                    {new Date(passData.to_datetime).toLocaleString()}
                  </span>
                </div>
                {passData.out_time && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>Out Time</span>
                    <span style={styles.detailValue}>{passData.out_time}</span>
                  </div>
                )}
                {passData.in_time && (
                  <div style={styles.detailRow}>
                    <span style={styles.detailLabel}>In Time</span>
                    <span style={styles.detailValue}>{passData.in_time}</span>
                  </div>
                )}
              </div>

              <div style={styles.expiryNotice}>
                ⚠️ <strong>Single-Use Action:</strong> Clicking "Accept & Mark Exit" will record the exact gate exit timestamp to the student's request and immediately expire this pass.
              </div>

              <div style={styles.actionRow}>
                <button
                  style={styles.btnAccept}
                  onClick={handleAcceptPass}
                  disabled={loading}
                >
                  {loading ? "Recording Exit..." : "Accept & Record Gate Exit ✓"}
                </button>
                <button
                  style={styles.btnSecondary}
                  onClick={() => {
                    setPassData(null);
                    setScannedToken(null);
                    setErrorMsg("");
                  }}
                  disabled={loading}
                >
                  Cancel / Re-scan
                </button>
              </div>
            </div>
          ) : (
            /* Live Camera View */
            <div style={styles.cameraBox}>
              <div id="reader-canvas" style={styles.canvas}></div>
              <p style={styles.cameraHelper}>
                Point camera at the student's QR pass to record gate exit.
              </p>
              <div style={styles.uploadRow}>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileUpload}
                />
                <button
                  style={styles.uploadBtn}
                  onClick={() => fileInputRef.current?.click()}
                  disabled={loading}
                >
                  <Upload size={14} /> Or Upload QR Image
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(15, 23, 42, 0.75)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    padding: "16px",
  },
  modal: {
    backgroundColor: "#ffffff",
    borderRadius: "16px",
    maxWidth: "540px",
    width: "100%",
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    animation: "fadeIn 0.2s ease-out",
  },
  header: {
    padding: "18px 24px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitleWrap: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  headerIcon: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    backgroundColor: "#e0e7ff",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    margin: 0,
    fontSize: "17px",
    fontWeight: "700",
    color: "#0f172a",
  },
  headerSubtitle: {
    margin: "2px 0 0",
    fontSize: "12px",
    color: "#64748b",
  },
  closeBtn: {
    background: "#f1f5f9",
    border: "none",
    borderRadius: "8px",
    width: "32px",
    height: "32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    color: "#64748b",
  },
  errorBox: {
    margin: "16px 24px 0",
    padding: "12px 14px",
    borderRadius: "8px",
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#991b1b",
    fontSize: "13px",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  body: {
    padding: "24px",
    maxHeight: "75vh",
    overflowY: "auto",
  },
  cameraBox: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "14px",
  },
  canvas: {
    width: "100%",
    maxWidth: "360px",
    borderRadius: "12px",
    overflow: "hidden",
    border: "2px dashed #cbd5e1",
    backgroundColor: "#0f172a",
    minHeight: "260px",
  },
  cameraHelper: {
    fontSize: "13px",
    color: "#64748b",
    margin: 0,
    textAlign: "center",
  },
  uploadRow: {
    marginTop: "4px",
  },
  uploadBtn: {
    backgroundColor: "#f1f5f9",
    border: "1px solid #cbd5e1",
    color: "#334155",
    padding: "8px 14px",
    borderRadius: "6px",
    fontSize: "13px",
    fontWeight: "600",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },
  detailsView: {
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  passHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: "12px",
    borderBottom: "1px solid #e2e8f0",
  },
  validBadge: {
    backgroundColor: "#ecfdf5",
    color: "#059669",
    border: "1px solid #a7f3d0",
    padding: "4px 10px",
    borderRadius: "9999px",
    fontSize: "12px",
    fontWeight: "700",
  },
  passTypeBadge: {
    fontSize: "12px",
    fontWeight: "700",
    color: "#4f46e5",
    backgroundColor: "#eef2ff",
    padding: "4px 10px",
    borderRadius: "6px",
  },
  detailsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "12px",
    backgroundColor: "#f8fafc",
    padding: "16px",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
  },
  detailRow: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  detailLabel: {
    fontSize: "11px",
    textTransform: "uppercase",
    color: "#64748b",
    fontWeight: "600",
    letterSpacing: "0.04em",
  },
  detailValue: {
    fontSize: "13px",
    color: "#0f172a",
    fontWeight: "600",
  },
  expiryNotice: {
    backgroundColor: "#fffbeb",
    border: "1px solid #fde68a",
    color: "#92400e",
    padding: "10px 14px",
    borderRadius: "8px",
    fontSize: "12px",
    lineHeight: "1.5",
  },
  actionRow: {
    display: "flex",
    gap: "10px",
  },
  btnAccept: {
    flex: 1,
    backgroundColor: "#10b981",
    color: "#ffffff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  btnSecondary: {
    backgroundColor: "#f1f5f9",
    color: "#334155",
    border: "1px solid #cbd5e1",
    padding: "12px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "600",
    cursor: "pointer",
  },
  btnPrimary: {
    flex: 1,
    backgroundColor: "#4f46e5",
    color: "#ffffff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "8px",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
  },
  successState: {
    textAlign: "center",
    padding: "20px 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
  },
  successIcon: {
    marginBottom: "4px",
  },
  successTitle: {
    margin: 0,
    fontSize: "20px",
    fontWeight: "800",
    color: "#0f172a",
  },
  successDesc: {
    margin: 0,
    fontSize: "14px",
    color: "#64748b",
    maxWidth: "380px",
    lineHeight: "1.5",
  },
};
