import { useState, useEffect } from "react";
import { Spin } from "antd";
import { SaveOutlined, CloseCircleOutlined } from "@ant-design/icons";
import reservationService from "../../services/reservationService";
import { useToast }       from "../../components/Toast";
import "../../style/ReaderReservations.scss";
 
const fmtDate = d => d ? new Date(d).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" }) : "—";
 
const STATUS_META = {
  pending:   { bg: "#e6f4ff", color: "#0958d9", label: "Waiting" },
  ready:     { bg: "#f6ffed", color: "#389e0d", label: "Ready to Pickup" },
  fulfilled: { bg: "#f0f0f0", color: "#8c8c8c", label: "Fulfilled" },
  cancelled: { bg: "#f5f5f5", color: "#8c8c8c", label: "Cancelled" },
  expired:   { bg: "#fff1f0", color: "#cf1322", label: "Expired" },
};
 
export default function ReaderReservations() {
  const toast = useToast();
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [cancelling,   setCancelling]   = useState(null);
 
  const load = () => {
    setLoading(true);
    reservationService.getMy()
      .then(res => setReservations(res.reservations || []))
      .catch(() => toast.error("Failed to load reservations"))
      .finally(() => setLoading(false));
  };
 
  useEffect(() => { load(); }, []);
 
  const handleCancel = async (id) => {
    setCancelling(id);
    try {
      await reservationService.cancel(id);
      setReservations(prev => prev.map(r => r.id === id ? { ...r, status: "cancelled" } : r));
      toast.success("Reservation cancelled");
    } catch (err) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setCancelling(null);
    }
  };
 
  const active   = reservations.filter(r => ["pending", "ready"].includes(r.status));
  const inactive = reservations.filter(r => !["pending", "ready"].includes(r.status));
 
  return (
    <div className="reader-reservations">
      <h1 className="rr-title"><SaveOutlined /> My Reservations</h1>
 
      {loading ? (
        <div style={{ display:"flex", justifyContent:"center", padding:"6rem" }}><Spin size="large" /></div>
      ) : reservations.length === 0 ? (
        <div className="rr-empty">
          <SaveOutlined />
          <p>No reservations yet</p>
          <small>When a book you want is unavailable, you can reserve it from the Book Catalog.</small>
        </div>
      ) : (
        <>
          {/* Active */}
          {active.length > 0 && (
            <div className="rr-section">
              <h2>Active ({active.length})</h2>
              <div className="rr-list">
                {active.map(r => {
                  const meta = STATUS_META[r.status] || STATUS_META.pending;
                  return (
                    <div key={r.id} className={`rr-item ${r.status === "ready" ? "rr-item--ready" : ""}`}>
                      <img
                        src={r.book_cover || "https://placehold.co/56x80?text=N/A"}
                        alt={r.book_title}
                        onError={e => { e.target.src = "https://placehold.co/56x80?text=N/A"; }}
                      />
                      <div className="rr-info">
                        <div className="rr-book-title">{r.book_title}</div>
                        <div className="rr-book-author">{r.book_author}</div>
                        <div className="rr-dates">
                          <span>Reserved: <strong>{fmtDate(r.reserved_at)}</strong></span>
                          {r.status === "ready" && r.expires_at && (
                            <span style={{ color: "#d46b08" }}>
                              Pickup by: <strong>{fmtDate(r.expires_at)}</strong>
                            </span>
                          )}
                        </div>
                        {r.status === "ready" && (
                          <div className="rr-ready-notice">
                            📚 This book is ready for pickup at the library!
                          </div>
                        )}
                      </div>
                      <div className="rr-actions">
                        <span className="rr-badge" style={{ background: meta.bg, color: meta.color }}>
                          {meta.label}
                        </span>
                        {["pending", "ready"].includes(r.status) && (
                          <button
                            className="rr-cancel-btn"
                            onClick={() => handleCancel(r.id)}
                            disabled={cancelling === r.id}
                          >
                            {cancelling === r.id ? <Spin size="small" /> : <><CloseCircleOutlined /> Cancel</>}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
 
          {/* History */}
          {inactive.length > 0 && (
            <div className="rr-section">
              <h2>History</h2>
              <div className="rr-list">
                {inactive.map(r => {
                  const meta = STATUS_META[r.status] || STATUS_META.cancelled;
                  return (
                    <div key={r.id} className="rr-item rr-item--inactive">
                      <img
                        src={r.book_cover || "https://placehold.co/56x80?text=N/A"}
                        alt={r.book_title}
                        onError={e => { e.target.src = "https://placehold.co/56x80?text=N/A"; }}
                      />
                      <div className="rr-info">
                        <div className="rr-book-title">{r.book_title}</div>
                        <div className="rr-book-author">{r.book_author}</div>
                        <div className="rr-dates">
                          <span>Reserved: <strong>{fmtDate(r.reserved_at)}</strong></span>
                        </div>
                      </div>
                      <span className="rr-badge" style={{ background: meta.bg, color: meta.color }}>
                        {meta.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
 