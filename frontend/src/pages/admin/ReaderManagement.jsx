import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spin, Select } from "antd";
import {
  EyeOutlined, CloseOutlined,
  UserOutlined, MailOutlined, PhoneOutlined, HistoryOutlined,
  StopOutlined, CheckCircleOutlined, SortAscendingOutlined,
  CalendarOutlined, BookOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import SearchBar        from "../../components/SearchBar";
import CustomPagination from "../../components/Pagination";
import Filter           from "../../components/Filter";
import Table            from "../../components/Table";
import readerService    from "../../services/readerService";
import { useToast }     from "../../components/Toast";
import "../../style/ReaderManagement.scss";

const PAGE_SIZE = 8;

const STATUS_FILTER_OPTIONS = [
  { label: "Active",    value: "active"    },
  { label: "Suspended", value: "suspended" },
  { label: "Banned",    value: "banned"    },
];

const SORT_OPTIONS = [
  { label: "Newest First", sortBy: "created_at", sortOrder: "DESC" },
  { label: "Oldest First", sortBy: "created_at", sortOrder: "ASC"  },
  { label: "Name A→Z",     sortBy: "full_name",  sortOrder: "ASC"  },
  { label: "Name Z→A",     sortBy: "full_name",  sortOrder: "DESC" },
];

// ── Status metadata ───────────────────────────────────────────────────────────
const STATUS_META = {
  active:    { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f", dot: "#52c41a",  label: "Active"    },
  suspended: { bg: "#fff7e6", color: "#d46b08", border: "#ffd591", dot: "#fa8c16",  label: "Suspended" },
  banned:    { bg: "#fff1f0", color: "#cf1322", border: "#ffa39e", dot: "#ff4d4f",  label: "Banned"    },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.active;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.5rem",
      padding: "0.3rem 1rem", borderRadius: "2rem",
      fontSize: "1.2rem", fontWeight: 600,
      background: m.bg, color: m.color, border: `0.1rem solid ${m.border}`,
    }}>
      <span style={{ width: "0.6rem", height: "0.6rem", borderRadius: "50%", background: m.dot, flexShrink: 0 }} />
      {m.label}
    </span>
  );
};

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// ════════════════════════════════════════════════════════════════════════════
// Modal: VIEW PROFILE
// ════════════════════════════════════════════════════════════════════════════
function ViewModal({ readerId, onClose }) {
  const toast = useToast();
  const [reader,  setReader]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    readerService.getById(readerId)
      .then(res => setReader(res.reader))
      .catch(() => { toast.error("Failed to load reader"); onClose(); })
      .finally(() => setLoading(false));
  }, [readerId]);

  if (loading) return (
    <div className="rm-overlay">
      <div className="rm-modal rm-modal--view" style={{ alignItems: "center", justifyContent: "center", minHeight: "30rem" }}>
        <Spin size="large" />
      </div>
    </div>
  );
  if (!reader) return null;

  const stats = [
    { label: "Total Borrows",       value: reader.total_borrows       || 0, color: "#2c8df4" },
    { label: "Currently Borrowing", value: reader.currently_borrowing || 0, color: "#fa8c16" },
    { label: "Overdue",             value: reader.overdue_count       || 0, color: "#ff4d4f" },
    { label: "Returned",            value: reader.total_returned      || 0, color: "#52c41a" },
  ];

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal rm-modal--view" onClick={e => e.stopPropagation()}>
        <div className="rm-modal__header">
          <div className="rm-modal__title"><EyeOutlined /><span>Reader Profile</span></div>
          <button className="rm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="rm-modal__body">
          <div className="rm-hero">
            <img
              src={reader.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${reader.full_name}`}
              alt={reader.full_name} className="rm-hero__avatar"
              onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${reader.full_name}`; }}
            />
            <div className="rm-hero__info">
              <h3 className="rm-hero__name">{reader.full_name}</h3>
              <p className="rm-hero__email">{reader.email}</p>
              <StatusBadge status={reader.status} />
            </div>
          </div>

          <div className="rm-info-grid">
            {[
              { icon: <UserOutlined />,     label: "Reader ID", value: reader.id },
              { icon: <PhoneOutlined />,    label: "Phone",     value: reader.phone || "—" },
              { icon: <CalendarOutlined />, label: "Joined",    value: fmtDate(reader.created_at) },
              { icon: <MailOutlined />,     label: "Email",     value: reader.email },
            ].map((item, i) => (
              <div key={i} className="rm-info-item">
                {item.icon}
                <div><label>{item.label}</label><span>{item.value}</span></div>
              </div>
            ))}
          </div>

          <div className="rm-stats-grid">
            {stats.map((s, i) => (
              <div key={i} className="rm-stat">
                <span className="rm-stat__num" style={{ color: s.color }}>{s.value}</span>
                <span className="rm-stat__lbl">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="rm-modal__footer">
          <button className="rm-btn rm-btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: BORROW HISTORY
// ════════════════════════════════════════════════════════════════════════════
function HistoryModal({ reader, onClose }) {
  const toast = useToast();
  const [history, setHistory] = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async (p = 1) => {
    try {
      setLoading(true);
      const res = await readerService.getBorrowHistory(reader.id, { page: p, limit: 6 });
      setHistory(res.history || []);
      setTotal(res.total    || 0);
    } catch {
      toast.error("Failed to load history");
    } finally {
      setLoading(false);
    }
  }, [reader.id]);

  useEffect(() => { load(1); }, []);

  const BORROW_META = {
    borrowing: { bg: "#e6f4ff", color: "#0958d9", label: "Borrowing" },
    returned:  { bg: "#f6ffed", color: "#389e0d", label: "Returned"  },
    overdue:   { bg: "#fff1f0", color: "#cf1322", label: "Overdue"   },
  };

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal rm-modal--history" onClick={e => e.stopPropagation()}>
        <div className="rm-modal__header">
          <div>
            <div className="rm-modal__title"><HistoryOutlined /><span>Borrow History</span></div>
            <p className="rm-modal__sub">{reader.full_name} · {total} records</p>
          </div>
          <button className="rm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="rm-modal__body rm-modal__body--notop">
          {loading ? (
            <div style={{ textAlign: "center", padding: "4rem" }}><Spin /></div>
          ) : history.length === 0 ? (
            <div className="rm-empty"><BookOutlined /><p>No borrow records found</p></div>
          ) : (
            <>
              <table className="rm-hist-table">
                <thead>
                  <tr>
                    <th>Book</th>
                    <th>Barcode</th>
                    <th>Borrow Date</th>
                    <th>Due Date</th>
                    <th>Return Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {history.map(h => {
                    const m = BORROW_META[h.status] || BORROW_META.returned;
                    return (
                      <tr key={h.id}>
                        <td>
                          <div className="rm-hist-book">
                            <img
                              src={h.book_cover || "https://placehold.co/32x44?text=N/A"}
                              alt={h.book_title}
                              onError={e => { e.target.src = "https://placehold.co/32x44?text=N/A"; }}
                            />
                            <div>
                              <div className="rm-hist-title">{h.book_title}</div>
                              <div className="rm-hist-author">{h.book_author}</div>
                            </div>
                          </div>
                        </td>
                        <td><code className="rm-code">{h.barcode}</code></td>
                        <td>{fmtDate(h.borrow_date)}</td>
                        <td style={{ color: h.status === "overdue" ? "#ff4d4f" : "inherit" }}>
                          {fmtDate(h.due_date)}
                        </td>
                        <td>{fmtDate(h.return_date)}</td>
                        <td>
                          <span style={{
                            display: "inline-flex", alignItems: "center",
                            padding: "0.25rem 0.9rem", borderRadius: "2rem",
                            fontSize: "1.2rem", fontWeight: 600,
                            background: m.bg, color: m.color,
                          }}>
                            {m.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {total > 6 && (
                <CustomPagination
                  total={total} pageSize={6} currentPage={page}
                  onChange={p => { setPage(p); load(p); }}
                />
              )}
            </>
          )}
        </div>
        <div className="rm-modal__footer">
          <button className="rm-btn rm-btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: STATUS ACTION
// Dùng cho tất cả: Suspend, Unsuspend, Ban
// ════════════════════════════════════════════════════════════════════════════
function StatusModal({ reader, targetStatus, onClose, onDone }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  // Config theo từng action
  const CONFIG = {
    suspended: {
      title:      "Suspend Reader",
      titleColor: "#d46b08",
      iconBg:     "#fff7e6",
      iconColor:  "#fa8c16",
      icon:       <StopOutlined />,
      desc:       "will be temporarily suspended and cannot borrow books until restored.",
      descColor:  "#d46b08",
      btnClass:   "rm-btn--warning",
      btnLabel:   "Suspend",
      warning:    null,
    },
    active: {
      title:      "Restore Reader",
      titleColor: "#389e0d",
      iconBg:     "#f6ffed",
      iconColor:  "#52c41a",
      icon:       <CheckCircleOutlined />,
      desc:       "will be restored and can borrow books again.",
      descColor:  "#389e0d",
      btnClass:   "rm-btn--success",
      btnLabel:   "Restore Access",
      warning:    null,
    },
    banned: {
      title:      "Ban Reader",
      titleColor: "#cf1322",
      iconBg:     "#fff1f0",
      iconColor:  "#ff4d4f",
      icon:       <WarningOutlined />,
      desc:       "will be permanently banned from the library system.",
      descColor:  "#cf1322",
      btnClass:   "rm-btn--danger",
      btnLabel:   "Ban Reader",
      warning:    "⚠️ This is a serious action. Banned readers cannot borrow books and will need staff intervention to reinstate.",
    },
  };

  const cfg = CONFIG[targetStatus];

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await readerService.updateStatus(reader.id, targetStatus);
      const successMsg = {
        suspended: "Reader suspended successfully!",
        active:    "Reader restored successfully!",
        banned:    "Reader banned successfully!",
      };
      toast.success(successMsg[targetStatus]);
      onDone();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rm-overlay" onClick={onClose}>
      <div className="rm-modal rm-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="rm-modal__header">
          <div className="rm-modal__title" style={{ color: cfg.titleColor }}>
            {cfg.icon}<span>{cfg.title}</span>
          </div>
          <button className="rm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>

        <div className="rm-modal__body rm-confirm-body">
          <div className="rm-confirm-icon" style={{ background: cfg.iconBg }}>
            {React.cloneElement(cfg.icon, { style: { color: cfg.iconColor } })}
          </div>
          <h3>Are you sure?</h3>
          <p>
            <strong>{reader.full_name}</strong>{" "}
            <span style={{ color: cfg.descColor }}>{cfg.desc}</span>
          </p>

          {/* Warning box chỉ hiện với Ban */}
          {cfg.warning && (
            <div className="rm-confirm-warning">{cfg.warning}</div>
          )}
        </div>

        <div className="rm-modal__footer">
          <button className="rm-btn rm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className={`rm-btn ${cfg.btnClass}`} onClick={handleConfirm} disabled={loading}>
            {loading ? <Spin size="small" /> : cfg.btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════════════════
const ReaderManagement = () => {
  const toast = useToast();

  const [readers,   setReaders]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("");
  const [sortBy,    setSortBy]    = useState("created_at");
  const [sortOrder, setSortOrder] = useState("DESC");

  // ✅ Refs — tránh stale closure
  const sortByRef    = useRef("created_at");
  const sortOrderRef = useRef("DESC");
  const searchRef    = useRef("");
  const statusRef    = useRef("");
  const pageRef      = useRef(1);
  const searchTimer  = useRef(null);

  // Modals
  const [viewId,      setViewId]      = useState(null);
  const [histReader,  setHistReader]  = useState(null);
  const [statusModal, setStatusModal] = useState(null); // { reader, targetStatus }

  // ── Load ──────────────────────────────────────────────
  const loadReaders = useCallback(async (p, s, st, sb, so) => {
    try {
      setLoading(true);
      const res = await readerService.getAll({
        page: p, limit: PAGE_SIZE,
        search: s, status: st,
        sortBy: sb, sortOrder: so,
      });
      setReaders(res.readers || []);
      setTotal(res.total    || 0);
    } catch {
      toast.error("Failed to load readers");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadReaders(1, "", "", "created_at", "DESC"); }, []);

  // ── Handlers ──────────────────────────────────────────
  const handleSearch = (value) => {
    const v = value.trimStart();
    setSearch(v);          searchRef.current = v;
    setPage(1);            pageRef.current   = 1;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() =>
      loadReaders(1, v.trim(), statusRef.current, sortByRef.current, sortOrderRef.current), 400);
  };

  const handleStatusFilter = (value) => {
    setStatus(value);      statusRef.current = value;
    setPage(1);            pageRef.current   = 1;
    loadReaders(1, searchRef.current, value, sortByRef.current, sortOrderRef.current);
  };

  const handleSortChange = (val) => {
    const [sb, so] = val.split("__");
    setSortBy(sb);         sortByRef.current    = sb;
    setSortOrder(so);      sortOrderRef.current = so;
    setPage(1);            pageRef.current      = 1;
    loadReaders(1, searchRef.current, statusRef.current, sb, so);
  };

  const handlePageChange = (p) => {
    setPage(p);            pageRef.current = p;
    loadReaders(p, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);
  };

  const handleReset = () => {
    setSearch("");         searchRef.current    = "";
    setStatus("");         statusRef.current    = "";
    setSortBy("created_at"); sortByRef.current  = "created_at";
    setSortOrder("DESC");  sortOrderRef.current = "DESC";
    setPage(1);            pageRef.current      = 1;
    loadReaders(1, "", "", "created_at", "DESC");
  };

  const reload = () =>
    loadReaders(pageRef.current, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);

  const hasFilter = search || status || sortBy !== "created_at" || sortOrder !== "DESC";

  // ── Dynamic actions theo status ────────────────────────
  // Luồng:
  //   active    → Suspend | Ban
  //   suspended → Restore (→ active) | Ban
  //   banned    → Restore (→ active)   [chỉ admin nếu muốn giới hạn]
  const getActions = (row) => {
    const base = [
      {
        label: "View Profile",
        icon:  <EyeOutlined />,
        className: "view",
        onClick: () => setViewId(row.id),
      },
      {
        label: "Borrow History",
        icon:  <HistoryOutlined />,
        className: "copies",
        onClick: () => setHistReader(row),
      },
    ];

    if (row.status === "active") {
      base.push({
        label: "Suspend",
        icon:  <StopOutlined />,
        className: "warning",
        onClick: () => setStatusModal({ reader: row, targetStatus: "suspended" }),
      });
      base.push({
        label: "Ban",
        icon:  <WarningOutlined />,
        className: "delete",
        onClick: () => setStatusModal({ reader: row, targetStatus: "banned" }),
      });
    }

    if (row.status === "suspended") {
      base.push({
        label: "Restore Access",
        icon:  <CheckCircleOutlined />,
        className: "activate",
        onClick: () => setStatusModal({ reader: row, targetStatus: "active" }),
      });
      base.push({
        label: "Ban",
        icon:  <WarningOutlined />,
        className: "delete",
        onClick: () => setStatusModal({ reader: row, targetStatus: "banned" }),
      });
    }

    if (row.status === "banned") {
      base.push({
        label: "Restore Access",
        icon:  <CheckCircleOutlined />,
        className: "activate",
        onClick: () => setStatusModal({ reader: row, targetStatus: "active" }),
      });
    }

    return base;
  };

  // ── Columns ───────────────────────────────────────────
  const columns = [
    {
      key: "_stt",
      label: "STT",
      sortable: false,
      render: (_, __, idx) => (
        <span className="rm-stt">{(page - 1) * PAGE_SIZE + idx + 1}</span>
      ),
    },
    {
      key: "full_name",
      label: "Reader",
      sortable: false,
      render: (value, row) => (
        <div className="rm-reader-cell">
          <img
            src={row.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${value}` }
            alt={value} className="rm-avatar"
            onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`; }}
          />
          <div>
            <div className="rm-reader-name">{value}</div>
            <div className="rm-reader-email">{row.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "phone",
      label: "Phone",
      sortable: false,
      render: v => v || <span style={{ color: "#bfbfbf" }}>—</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: v => <StatusBadge status={v} />,
    },
    {
      key: "total_borrows",
      label: "Total Borrows",
      sortable: false,
      render: v => (
        <strong style={{ color: "#2c8df4", fontSize: "1.5rem" }}>{Number(v) || 0}</strong>
      ),
    },
    {
      key: "currently_borrowing",
      label: "Borrowing Now",
      sortable: false,
      render: v => {
        const n = Number(v) || 0;
        return n > 0
          ? <span style={{ fontWeight: 600, color: "#fa8c16" }}>{n}</span>
          : <span style={{ color: "#bfbfbf" }}>0</span>;
      },
    },
    {
      key: "created_at",
      label: "Joined",
      sortable: false,
      render: v => <span style={{ color: "#8c8c8c", fontSize: "1.3rem" }}>{fmtDate(v)}</span>,
    },
  ];

  return (
    <div className="reader-management">

      {/* ── Header ── */}
      <div className="header">
        <h1 className="tittle">Readers Management</h1>
        <div className="header-actions">
          <Filter
            filterName="Status"
            options={STATUS_FILTER_OPTIONS}
            value={status}
            onChange={handleStatusFilter}
          />
          <Select
            value={`${sortBy}__${sortOrder}`}
            style={{ width: 180 }}
            onChange={handleSortChange}
            suffixIcon={<SortAscendingOutlined style={{ color: "#088ef5", fontSize: "1.5rem" }} />}
            options={SORT_OPTIONS.map(o => ({
              label: o.label,
              value: `${o.sortBy}__${o.sortOrder}`,
            }))}
          />
          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by name, email..."
          />
          {hasFilter && (
            <button className="btn-reset" onClick={handleReset}>✕ Reset</button>
          )}
        </div>
      </div>

      {/* ── Filter summary ── */}
      {(search || status) && (
        <div className="filter-summary">
          {search && <span className="filter-tag">🔍 "{search}"</span>}
          {status && <span className="filter-tag">👤 {status}</span>}
          <span className="filter-count">
            {total} result{total !== 1 ? "s" : ""} found
          </span>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "6rem" }}>
          <Spin size="large" />
        </div>
      ) : readers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👤</div>
          <p>{search || status ? "No readers match your search" : "No readers found"}</p>
          {(search || status) && (
            <button className="btn-reset" onClick={handleReset}>Clear filters</button>
          )}
        </div>
      ) : (
        <Table
          columns={columns}
          rows={readers}
          getActions={getActions}
          rowClassName={row =>
            row.status === "banned"    ? "rm-row--banned"    :
            row.status === "suspended" ? "rm-row--suspended" : ""
          }
        />
      )}

      {/* ── Pagination ── */}
      {!loading && readers.length > 0 && (
        <CustomPagination
          total={total} pageSize={PAGE_SIZE}
          currentPage={page} onChange={handlePageChange}
        />
      )}

      {/* ── Modals ── */}
      {viewId      && (
        <ViewModal readerId={viewId} onClose={() => setViewId(null)} />
      )}
      {histReader  && (
        <HistoryModal reader={histReader} onClose={() => setHistReader(null)} />
      )}
      {statusModal && (
        <StatusModal
          reader={statusModal.reader}
          targetStatus={statusModal.targetStatus}
          onClose={() => setStatusModal(null)}
          onDone={reload}
        />
      )}
    </div>
  );
};

export default ReaderManagement;