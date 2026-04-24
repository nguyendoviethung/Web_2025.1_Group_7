import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spin } from "antd";
import {
  CloseOutlined, EyeOutlined, BookOutlined,
  UserOutlined, CalendarOutlined, StopOutlined,
  SaveOutlined, SearchOutlined,
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
    <span className="resv-status-badge" style={{ background: m.bg, color: m.color }}>
      <span className="resv-status-dot" style={{ background: m.dot }} />
      {m.label}
    </span>
  );
};

const fmtDate = d =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// ─── Detail Modal ──────────────────────────────────────
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

          <div className="resv-section">
            <h4><CalendarOutlined /> Timeline</h4>
            <div className="resv-dates-grid">
              <div className="resv-date-item">
                <label>Reserved</label>
                <span>{fmtDate(r.reserved_at)}</span>
              </div>
              <div className="resv-date-item">
                <label>Pickup deadline</label>
                <span style={{ color: r.status === "ready" ? "#d46b08" : "inherit" }}>
                  {fmtDate(r.expires_at)}
                </span>
              </div>
            </div>
          </div>

          <div className="resv-status-row">
            Status: <StatusBadge status={r.status} />
          </div>

          {r.status === "ready" && (
            <div className="resv-ready-note">
              📢 Reader has been notified automatically when the book became available.
            </div>
          )}
        </div>

        <div className="resv-modal-footer">
          <button className="resv-btn resv-btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Cancel Confirm Modal ──────────────────────────────
function CancelModal({ reservation, onClose, onDone }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await axiosClient.patch(`/reservations/${reservation.id}/cancel`);
      toast.success("Reservation cancelled.");
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to cancel");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="resv-overlay" onClick={onClose}>
      <div className="resv-modal resv-modal--confirm" onClick={e => e.stopPropagation()}>
        <div className="resv-modal-header">
          <div className="resv-modal-title resv-modal-title--danger">
            <StopOutlined /> Cancel Reservation
          </div>
          <button className="resv-close-btn" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="resv-modal-body resv-modal-body--center">
          <div className="resv-confirm-icon resv-confirm-icon--warn">
            <StopOutlined />
          </div>
          <p>
            Cancel reservation for <strong>"{reservation.book_title}"</strong> by{" "}
            <strong>{reservation.reader_name}</strong>?
          </p>
        </div>
        <div className="resv-modal-footer">
          <button className="resv-btn resv-btn--secondary" onClick={onClose}>Go back</button>
          <button className="resv-btn resv-btn--danger" onClick={handleConfirm} disabled={loading}>
            {loading ? <Spin size="small" /> : "Cancel Reservation"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────
export default function ReservationManagement() {
  const toast = useToast();

  // Data
  const [reservations, setReservations] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);

  // Filters
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");

  // Refs to avoid stale closure
  const statusRef = useRef("");
  const searchRef = useRef("");
  const pageRef   = useRef(1);
  const debounce  = useRef(null);

  // Modals
  const [detailRes,  setDetailRes]  = useState(null);
  const [cancelRes,  setCancelRes]  = useState(null);

  // ── Fetch ────────────────────────────────────────────
  const load = useCallback(async (p, st, q) => {
    setLoading(true);
    try {
      const res = await axiosClient.get("/reservations", {
        params: { status: st, search: q, page: p, limit: PAGE_SIZE },
      });
      setReservations(res.reservations || []);
      setTotal(res.total || 0);
    } catch {
      toast.error("Failed to load reservations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(1, "", ""); }, []);

  const handleStatusFilter = (val = "") => {
    setStatus(val);   statusRef.current = val;
    setPage(1);       pageRef.current   = 1;
    load(1, val, searchRef.current);
  };

  const handleSearch = (e) => {
    const val = e.target.value;
    setSearch(val);   searchRef.current = val;
    setPage(1);       pageRef.current   = 1;
    clearTimeout(debounce.current);
    debounce.current = setTimeout(() => load(1, statusRef.current, val.trim()), 400);
  };

  const handleReset = () => {
    setStatus(""); statusRef.current = "";
    setSearch(""); searchRef.current = "";
    setPage(1);    pageRef.current   = 1;
    load(1, "", "");
  };

  const handlePageChange = (p) => {
    setPage(p); pageRef.current = p;
    load(p, statusRef.current, searchRef.current);
  };

  const reload = () => load(pageRef.current, statusRef.current, searchRef.current);

  const hasFilter = search || status;

  // Summary counts — fetch separate totals for each status once
  const [statusCounts, setStatusCounts] = useState({});
  useEffect(() => {
    const fetchCounts = async () => {
      const counts = {};
      await Promise.all(
        ["pending", "ready", "fulfilled", "expired"].map(async (st) => {
          try {
            const r = await axiosClient.get("/reservations", { params: { status: st, page: 1, limit: 1 } });
            counts[st] = r.total || 0;
          } catch { counts[st] = 0; }
        })
      );
      setStatusCounts(counts);
    };
    fetchCounts();
  }, []);

  return (
    <div className="reservation-management">

      {/* ── Header ── */}
      <div className="header">
        <h1 className="tittle"><SaveOutlined /> Reservation Management</h1>
        <div className="header-actions">

          {/* Search box */}
          <div className="resv-search-box">
            <SearchOutlined className="resv-search-icon" />
            <input
              placeholder="Search by book or reader..."
              value={search}
              onChange={handleSearch}
            />
          </div>

          {/* Status filter */}
          <Filter
            filterName="Status"
            options={STATUS_FILTER}
            value={status}
            onChange={handleStatusFilter}
          />

          {hasFilter && (
            <button className="btn-reset" onClick={handleReset}>✕ Reset</button>
          )}
        </div>
      </div>

      {/* ── Summary cards (clickable shortcuts) ── */}
      <div className="resv-summary-row">
        {[
          { key: "pending",   label: "Pending",   color: "#0958d9", bg: "#e6f4ff" },
          { key: "ready",     label: "Ready",     color: "#389e0d", bg: "#f6ffed" },
          { key: "fulfilled", label: "Fulfilled", color: "#595959", bg: "#f5f5f5" },
          { key: "expired",   label: "Expired",   color: "#cf1322", bg: "#fff1f0" },
        ].map(s => (
          <div
            key={s.key}
            className={`resv-summary-card ${status === s.key ? "resv-summary-card--active" : ""}`}
            style={{ background: s.bg }}
            onClick={() => handleStatusFilter(status === s.key ? "" : s.key)}
          >
            <div className="resv-summary-num" style={{ color: s.color }}>
              {statusCounts[s.key] ?? "—"}
            </div>
            <div className="resv-summary-lbl" style={{ color: s.color }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Filter summary ── */}
      {hasFilter && (
        <div className="resv-filter-bar">
          {search && <span className="resv-filter-tag">🔍 "{search}"</span>}
          {status && <span className="resv-filter-tag">📋 {status}</span>}
          <span className="resv-filter-count">{total} result{total !== 1 ? "s" : ""}</span>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "6rem" }}><Spin size="large" /></div>
      ) : reservations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>{hasFilter ? "No reservations match your filters" : "No reservations found"}</p>
          {hasFilter && <button className="btn-reset" onClick={handleReset}>Clear filters</button>}
        </div>
      ) : (
        <div className="resv-table-wrap">
          <table className="resv-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Book</th>
                <th>Reader</th>
                <th>Reserved On</th>
                <th>Pickup Deadline</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map((r, idx) => (
                <tr key={r.id}
                    className={[
                      r.status === "expired"   ? "resv-row--expired"  : "",
                      r.status === "cancelled" ? "resv-row--cancelled": "",
                    ].filter(Boolean).join(" ")}
                >
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

                  <td className="resv-date"
                      style={{ color: r.status === "ready" ? "#d46b08" : "inherit", fontWeight: r.status === "ready" ? 600 : 400 }}>
                    {fmtDate(r.expires_at)}
                  </td>

                  <td><StatusBadge status={r.status} /></td>

                  <td>
                    <div className="resv-actions">
                      <button
                        className="resv-action-btn resv-action-btn--view"
                        onClick={() => setDetailRes(r)}
                        title="View detail"
                      >
                        <EyeOutlined />
                      </button>
                      {/* Only allow admin cancel for pending/ready */}
                      {["pending", "ready"].includes(r.status) && (
                        <button
                          className="resv-action-btn resv-action-btn--cancel"
                          onClick={() => setCancelRes(r)}
                          title="Cancel reservation"
                        >
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
        <CustomPagination
          total={total} pageSize={PAGE_SIZE}
          currentPage={page} onChange={handlePageChange}
        />
      )}

      {detailRes && <DetailModal reservation={detailRes} onClose={() => setDetailRes(null)} />}
      {cancelRes && <CancelModal reservation={cancelRes} onClose={() => setCancelRes(null)} onDone={reload} />}
    </div>
  );
}