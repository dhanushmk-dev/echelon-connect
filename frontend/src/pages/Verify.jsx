import React, { useEffect, useState } from "react";
import { CheckCircle, XCircle, AlertCircle, CalendarClock, Clock, User, Building, MapPin, Ticket } from "lucide-react";

export default function Verify({ token }) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [expired, setExpired] = useState(false);
  const [expiring, setExpiring] = useState(false);
  
  const fetchVerifyData = async () => {
    try {
      const res = await fetch(`/api/verify/${token}`);
      const result = await res.json();
      if (result.expired) {
        setExpired(true);
      } else {
        setData(result);
      }
    } catch (err) {
      setExpired(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVerifyData();
  }, [token]);

  const handleExpire = async () => {
    if (!window.confirm("Are you sure? This QR can't be used again.")) return;
    setExpiring(true);
    try {
      const res = await fetch(`/api/verify/${token}/expire`, { method: "POST" });
      if (res.ok) {
        setExpired(true);
        setData(null);
      } else {
        alert("Failed to expire QR");
      }
    } catch (err) {
      alert("Error contacting server");
    } finally {
      setExpiring(false);
    }
  };

  if (loading) {
    return <div className="verify-container loading">Loading...</div>;
  }

  if (expired || !data) {
    return (
      <div className="verify-container expired">
        <XCircle className="verify-icon-large text-red" />
        <h2>This QR has expired</h2>
        <p>This pass is no longer valid or has already been used.</p>
      </div>
    );
  }

  return (
    <div className="verify-container valid">
      <div className="verify-header">
        <CheckCircle className="verify-icon-large text-green" />
        <h2>Valid Pass</h2>
        <p className="verify-subtitle">{data.request_type.replace(/_/g, " ").toUpperCase()}</p>
      </div>
      
      <div className="verify-card">
        <div className="verify-row">
          <User className="verify-icon" />
          <div className="verify-info">
            <span className="verify-label">Name</span>
            <span className="verify-value">{data.name}</span>
          </div>
        </div>
        <div className="verify-row">
          <Ticket className="verify-icon" />
          <div className="verify-info">
            <span className="verify-label">Register Number</span>
            <span className="verify-value">{data.register_number}</span>
          </div>
        </div>
        <div className="verify-row">
          <Building className="verify-icon" />
          <div className="verify-info">
            <span className="verify-label">Department</span>
            <span className="verify-value">{data.department}</span>
          </div>
        </div>
        <div className="verify-row">
          <CalendarClock className="verify-icon" />
          <div className="verify-info">
            <span className="verify-label">Academic Year</span>
            <span className="verify-value">Year {data.year}</span>
          </div>
        </div>
        <div className="verify-row">
          <MapPin className="verify-icon" />
          <div className="verify-info">
            <span className="verify-label">Accommodation</span>
            <span className="verify-value capitalize">{data.accommodation_type.replace("_", " ")}</span>
          </div>
        </div>
        
        <hr className="verify-divider" />
        
        <div className="verify-row">
          <Clock className="verify-icon text-indigo" />
          <div className="verify-info">
            <span className="verify-label">From</span>
            <span className="verify-value">{new Date(data.from_datetime).toLocaleString()}</span>
          </div>
        </div>
        <div className="verify-row">
          <Clock className="verify-icon text-indigo" />
          <div className="verify-info">
            <span className="verify-label">To</span>
            <span className="verify-value">{new Date(data.to_datetime).toLocaleString()}</span>
          </div>
        </div>
        
        {(data.out_time || data.in_time) && (
          <div className="verify-times">
            {data.out_time && (
              <div className="verify-time-box">
                <span className="verify-label">Out Time</span>
                <span className="verify-value">{data.out_time}</span>
              </div>
            )}
            {data.in_time && (
              <div className="verify-time-box">
                <span className="verify-label">In Time</span>
                <span className="verify-value">{data.in_time}</span>
              </div>
            )}
          </div>
        )}
      </div>

      <button className="verify-expire-btn" onClick={handleExpire} disabled={expiring}>
        {expiring ? "Recording Exit & Expiring Pass..." : "Accept Gate Exit & Expire Pass ✓"}
      </button>
    </div>
  );
}
