import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spin, Select } from "antd";
import {
  CloseOutlined, CheckCircleOutlined, EyeOutlined,
  SortAscendingOutlined, BookOutlined, UserOutlined,
  CalendarOutlined, StopOutlined, SaveOutlined,
} from "@ant-design/icons";
import CustomPagination from "../../components/Pagination";
import Filter           from "../../components/Filter";
import axiosClient      from "../../services/axiosClient";
import { useToast }     from "../../components/Toast";
import "../../style/ReservationManagement.scss";

const PAGE_SIZE = 10;

const STATUS_FILTER = [
  { label: "Pending",   value: "pending"   },
  { label: "Ready",     value: "ready"     },
  { label: "Fulfilled", value: "fulfilled" },
  { label: "Cancelled", value: "cancelled" },
  { label: "Expired",   value: "expired"   },
];

const STATUS_META = {
  pending:   { bg: "#e6f4ff", color: "#0958d9", dot: "#2c8df4", label: "Pending"   },
  ready:     { bg: "#f6ffed", color: "#389e0d", dot: "#52c41a", label: "Ready"     },
  fulfilled: { bg: "#f0f0f0", color: "#595959", dot: "#8c8c8c", label: "Fulfilled" },
  cancelled: { bg: "#f5f5f5", color: "#8c8c8c", dot: "#bfbfbf", label: "Cancelled" },
  expired:   { bg: "#fff1f0", color: "#cf1322", dot: "#ff4d4f", label: "Expired"   },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.pending;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      padding: "0.3rem 1rem", borderRadius: "2rem",
      fontSize: "1.2rem", fontWeight: 600,
      background: m.bg, color: m.color,
    }}>
      <span style={{ width:"0.6rem", height:"0.6rem", borderRadius:"50%", background:m.dot, flexShrink:0 }} />
      {m.label}
    </span>
  );
};

const fmtDate = d => d ? new Date(d).toLocaleDateString("vi-VN", { day:"2-digit", month:"2-digit", year:"numeric" }) : "—";

// ── Detail Modal ──────────────────────────────────────
function DetailModal({ reservation: r, onClose }) {
  if (!r) return null;
  return (
    <div className="resv-overlay" onClick={onClose}>
      <div className="resv-modal resv-modal--detail" onClick={e => e.stopPropagation()}>
        <div className="resv-modal-header">
          <div className="resv-modal-title"><EyeOutlined /> Reservation Detail</div>
          <button className="resv-close-btn" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="resv-modal-body">
          {/* Book */}
          <div className="resv-section">
            <h4><BookOutlined /> Book</h4>
            <div className="resv-book-row">
              <img
                src={r.book_cover || "https://placehold.co/48x64?text=N/A"}
                alt={r.book_title}
                onError={e => { e.target.src = "https://placehold.co/48x64?text=N/A"; }}
              />
              <div>
                <div className="resv-book-title">{r.book_title}</div>
                <code className="resv-code">{r.book_id}</code>
              </div>
            </div>
          </div>

          {/* Reader */}
          <div className="resv-section">
            <h4><UserOutlined /> Reader</h4>
            <div className="resv-reader-row">
              <img
                src={r.reader_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reader_name}`}
                alt={r.reader_name}
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reader_name}`; }}
              />
              <div>
                <div className="resv-reader-name">{r.reader_name}</div>
                <div className="resv-reader-email">{r.reader_email}</div>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="resv-section">
            <h4><CalendarOutlined /> Dates</h4>
            <div className="resv-dates-grid">
              <div className="resv-date-item">
                <label>Reserved</label>
                <span>{fmtDate(r.reserved_at)}</span>
              </div>
              <div className="resv-date-item">
                <label>Expires</label>
                <span style={{ color: r.status === "ready" ? "#d46b08" : "inherit" }}>
                  {fmtDate(r.expires_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="resv-status-row">
            Status: <StatusBadge status={r.status} />
          </div>
        </div>
        <div className="resv-modal-footer">
          <button className="resv-btn resv-btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Action Modal ──────────────────────────────
function ConfirmModal({ reservation, action, onClose, onDone }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const isReady  = action === "ready";
  const title    = isReady ? "Mark as Ready" : "Cancel Reservation";
  const desc     = isReady
    ? `Mark "${reservation.book_title}" as ready for "${reservation.reader_name}" to pick up? A notification will be sent.`
    : `Cancel reservation for "${reservation.book_title}" by "${reservation.reader_name}"?`;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      if (isReady) {
        await axiosClient.patch(`/reservations/${reservation.id}/ready`);
        toast.success("Marked as ready — reader notified!");
      } else {
        await axiosClient.patch(`/reservations/${reservation.id}/cancel`);
        toast.success("Reservation cancelled.");
      }
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resv-overlay" onClick={onClose}>
      <div className="resv-modal resv-modal--confirm" onClick={e => e.stopPropagation()}>
        <div className="resv-modal-header">
          <div className={`resv-modal-title ${isReady ? "" : "resv-modal-title--danger"}`}>
            {isReady ? <CheckCircleOutlined /> : <StopOutlined />} {title}
          </div>
          <button className="resv-close-btn" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="resv-modal-body resv-modal-body--center">
          <div className={`resv-confirm-icon ${isReady ? "resv-confirm-icon--ok" : "resv-confirm-icon--warn"}`}>
            {isReady ? <CheckCircleOutlined /> : <StopOutlined />}
          </div>
          <p>{desc}</p>
        </div>
        <div className="resv-modal-footer">
          <button className="resv-btn resv-btn--secondary" onClick={onClose}>Cancel</button>
          <button
            className={`resv-btn ${isReady ? "resv-btn--success" : "resv-btn--danger"}`}
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? <Spin size="small" /> : (isReady ? "Confirm Ready" : "Cancel Reservation")}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────
export default function ReservationManagement() {
  const toast = useToast();

  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [status,       setStatus]       = useState("");

  const statusRef = useRef("");
  const pageRef   = useRef(1);

  const [detailRes,  setDetailRes]  = useState(null);
  const [confirmAct, setConfirmAct] = useState(null); // { reservation, action }

  const load = useCallback(async (p, st) => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/reservations", { params: { status: st, page: p, limit: PAGE_SIZE } });
      setReservations(res.reservations || []);
      setTotal(res.total || 0);
    } catch {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, ""); }, []);

  const handleStatusFilter = (val = "") => {
    setStatus(val);  statusRef.current = val;
    setPage(1);      pageRef.current   = 1;
    load(1, val);
  };

  const handlePageChange = (p) => {
    setPage(p); pageRef.current = p;
    load(p, statusRef.current);
  };

  const reload = () => load(pageRef.current, statusRef.current);

  // ── Status counts for summary cards ──────────────────
  const summaryCount = (st) => reservations.filter(r => r.status === st).length;

  return (
    <div className="reservation-management">
      <div className="header">
        <h1 className="tittle"><SaveOutlined /> Reservation Management</h1>
        <div className="header-actions">
          <Filter
            filterName="Status"
            options={STATUS_FILTER}
            value={status}
            onChange={handleStatusFilter}
          />
          {status && (
            <button className="btn-reset" onClick={() => handleStatusFilter("")}>✕ Reset</button>
          )}
        </div>
      </div>

      {/* Summary row */}
      <div className="resv-summary-row">
        {[
          { key: "pending",  label: "Pending",   color: "#0958d9", bg: "#e6f4ff" },
          { key: "ready",    label: "Ready",     color: "#389e0d", bg: "#f6ffed" },
          { key: "fulfilled",label: "Fulfilled", color: "#595959", bg: "#f5f5f5" },
          { key: "expired",  label: "Expired",   color: "#cf1322", bg: "#fff1f0" },
        ].map(s => (
          <div key={s.key} className="resv-summary-card" style={{ background: s.bg }}
               onClick={() => handleStatusFilter(s.key)}>
            <div className="resv-summary-num" style={{ color: s.color }}>
              {loading ? "—" : reservations.filter(r => r.status === s.key).length}
            </div>
            <div className="resv-summary-lbl" style={{ color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "6rem" }}><Spin size="large" /></div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>{status ? `No ${status} reservations` : "No reservations found"}</p>
        </div>
      ) : (
        <div className="resv-table-wrap">
          <table className="resv-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book</th>
                <th>Reader</th>
                <th>Reserved</th>
                <th>Expires</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, idx) => (
                <tr key={r.id} className={r.status === "expired" ? "resv-row--expired" : ""}>
                  <td className="resv-idx">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                  <td>
                    <div className="resv-book-cell">
                      <img
                        src={r.book_cover || "https://placehold.co/32x44?text=N/A"}
                        alt={r.book_title}
                        onError={e => { e.target.src = "https://placehold.co/32x44?text=N/A"; }}
                      />
                      <div>
                        <div className="resv-book-name">{r.book_title}</div>
                        <code className="resv-code-sm">{r.book_id}</code>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div className="resv-reader-cell">
                      <img
                        src={r.reader_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reader_name}`}
                        alt={r.reader_name}
                        className="resv-avatar"
                        onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reader_name}`; }}
                      />
                      <div>
                        <div className="resv-reader-name-sm">{r.reader_name}</div>
                        <div className="resv-reader-email-sm">{r.reader_email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="resv-date">{fmtDate(r.reserved_at)}</td>
                  <td className="resv-date" style={{ color: r.status === "ready" ? "#d46b08" : "inherit" }}>
                    {fmtDate(r.expires_at)}
                  </td>
                  <td><StatusBadge status={r.status} /></td>
                  <td>
                    <div className="resv-actions">
                      <button className="resv-action-btn resv-action-btn--view"
                              onClick={() => setDetailRes(r)} title="View">
                        <EyeOutlined />
                      </button>
                      {r.status === "pending" && (
                        <button className="resv-action-btn resv-action-btn--ready"
                                onClick={() => setConfirmAct({ reservation: r, action: "ready" })}
                                title="Mark Ready">
                          <CheckCircleOutlined />
                        </button>
                      )}
                      {["pending", "ready"].includes(r.status) && (
                        <button className="resv-action-btn resv-action-btn--cancel"
                                onClick={() => setConfirmAct({ reservation: r, action: "cancel" })}
                                title="Cancel">
                          <StopOutlined />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!loading && total > PAGE_SIZE && (
        <CustomPagination total={total} pageSize={PAGE_SIZE} currentPage={page} onChange={handlePageChange} />
      )}

      {detailRes  && <DetailModal  reservation={detailRes}       onClose={() => setDetailRes(null)} />}
      {confirmAct && <ConfirmModal reservation={confirmAct.reservation} action={confirmAct.action}
                                  onClose={() => setConfirmAct(null)} onDone={reload} />}
    </div>
  );
}