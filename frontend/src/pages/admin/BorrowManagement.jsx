import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spin, Select } from "antd";
import {
  EyeOutlined, CloseOutlined, PlusOutlined,
  CheckCircleOutlined, ExclamationCircleOutlined,
  BookOutlined, UserOutlined, CalendarOutlined,
  SortAscendingOutlined, BarcodeOutlined,
} from "@ant-design/icons";
import SearchBar        from "../../components/SearchBar";
import Table            from "../../components/Table";
import CustomPagination from "../../components/Pagination";
import Filter           from "../../components/Filter";
import borrowService    from "../../services/borrowService";
import { useToast }     from "../../components/Toast";
import "../../style/BorrowManagement.scss";

const PAGE_SIZE = 8;

const STATUS_FILTER = [
  { label: "Borrowing", value: "borrowing" },
  { label: "Overdue",   value: "overdue"   },
  { label: "Returned",  value: "returned"  },
];

const SORT_OPTIONS = [
  { label: "Borrow Date ↓", sortBy: "borrow_date", sortOrder: "DESC" },
  { label: "Borrow Date ↑", sortBy: "borrow_date", sortOrder: "ASC"  },
  { label: "Due Date ↓",    sortBy: "due_date",    sortOrder: "DESC" },
  { label: "Due Date ↑",    sortBy: "due_date",    sortOrder: "ASC"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const STATUS_META = {
  borrowing: { bg: "#e6f4ff", color: "#0958d9", border: "#91caff", dot: "#2c8df4", label: "Borrowing" },
  overdue:   { bg: "#fff1f0", color: "#cf1322", border: "#ffa39e", dot: "#ff4d4f", label: "Overdue"   },
  returned:  { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f", dot: "#52c41a", label: "Returned"  },
};

const StatusBadge = ({ status }) => {
  const m = STATUS_META[status] || STATUS_META.borrowing;
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

const isOverdueDate = (row) =>
  row.status === "overdue" || (row.status === "borrowing" && row.due_date && new Date(row.due_date) < new Date());

// ════════════════════════════════════════════════════════════════════════════
// Modal: VIEW DETAIL
// ════════════════════════════════════════════════════════════════════════════
function ViewModal({ borrowId, onClose }) {
  const toast = useToast();
  const [borrow,  setBorrow]  = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    borrowService.getById(borrowId)
      .then(res => setBorrow(res.borrow))
      .catch(() => { toast.error("Failed to load borrow detail"); onClose(); })
      .finally(() => setLoading(false));
  }, [borrowId]);

  if (loading) return (
    <div className="bm-overlay">
      <div className="bm-modal bm-modal--view" style={{ alignItems: "center", justifyContent: "center", minHeight: "30rem" }}>
        <Spin size="large" />
      </div>
    </div>
  );
  if (!borrow) return null;

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--view" onClick={e => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__title"><EyeOutlined /><span>Transaction Detail</span></div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">

          {/* Status banner */}
          <div className="bm-detail-banner">
            <span className="bm-detail-id">#{borrow.id}</span>
            <StatusBadge status={borrow.status} />
          </div>

          {/* Book info */}
          <div className="bm-detail-section">
            <h4><BookOutlined /> Book</h4>
            <div className="bm-detail-book">
              <img
                src={borrow.book_cover || "https://placehold.co/60x84?text=N/A"}
                alt={borrow.book_title}
                onError={e => { e.target.src = "https://placehold.co/60x84?text=N/A"; }}
              />
              <div>
                <div className="bm-detail-book-title">{borrow.book_title}</div>
                <div className="bm-detail-book-author">{borrow.book_author}</div>
                <code className="bm-barcode">{borrow.barcode}</code>
              </div>
            </div>
          </div>

          {/* Reader info */}
          <div className="bm-detail-section">
            <h4><UserOutlined /> Reader</h4>
            <div className="bm-detail-reader">
              <img
                src={borrow.reader_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${borrow.reader_name}`}
                alt={borrow.reader_name}
                className="bm-reader-avatar"
                onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${borrow.reader_name}`; }}
              />
              <div>
                <div className="bm-detail-reader-name">{borrow.reader_name}</div>
                <div className="bm-detail-reader-email">{borrow.reader_email}</div>
                {borrow.reader_phone && <div className="bm-detail-reader-phone">{borrow.reader_phone}</div>}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bm-detail-section">
            <h4><CalendarOutlined /> Dates</h4>
            <div className="bm-date-grid">
              <div className="bm-date-item">
                <label>Borrow Date</label>
                <span>{fmtDate(borrow.borrow_date)}</span>
              </div>
              <div className="bm-date-item">
                <label>Due Date</label>
                <span style={{ color: isOverdueDate(borrow) ? "#ff4d4f" : "inherit" }}>
                  {fmtDate(borrow.due_date)}
                </span>
              </div>
              <div className="bm-date-item">
                <label>Return Date</label>
                <span style={{ color: borrow.return_date ? "#52c41a" : "#bfbfbf" }}>
                  {fmtDate(borrow.return_date)}
                </span>
              </div>
            </div>
          </div>

        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: CREATE BORROW
// ════════════════════════════════════════════════════════════════════════════
function CreateModal({ onClose, onCreated }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    user_id:  "",
    barcode:  "",
    due_date: "",
  });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  // Default due date: 14 ngày từ hôm nay
  useEffect(() => {
    const d = new Date();
    d.setDate(d.getDate() + 14);
    set("due_date", d.toISOString().split("T")[0]);
  }, []);

  const handleSubmit = async () => {
    if (!form.user_id.trim() || !form.barcode.trim() || !form.due_date) {
      toast.warning("All fields are required");
      return;
    }
    if (new Date(form.due_date) <= new Date()) {
      toast.warning("Due date must be in the future");
      return;
    }
    try {
      setLoading(true);
      await borrowService.create({
        user_id:  form.user_id.trim(),
        barcode:  form.barcode.trim(),
        due_date: form.due_date,
      });
      toast.success("Book borrowed successfully!");
      onCreated();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to create borrow");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--create" onClick={e => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__title"><PlusOutlined /><span>New Borrow</span></div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <div className="bm-form-grid">

            <div className="bm-form-group">
              <label>Reader ID <span className="bm-req">*</span></label>
              <div className="bm-input-wrap">
                <UserOutlined />
                <input
                  placeholder="e.g. 29"
                  value={form.user_id}
                  onChange={e => set("user_id", e.target.value)}
                />
              </div>
              <small>Enter the reader's account ID</small>
            </div>

            <div className="bm-form-group">
              <label>Book Copy Barcode <span className="bm-req">*</span></label>
              <div className="bm-input-wrap">
                <BarcodeOutlined />
                <input
                  placeholder="e.g. BK001-001"
                  value={form.barcode}
                  onChange={e => set("barcode", e.target.value.toUpperCase())}
                />
              </div>
              <small>Enter the barcode printed on the book copy</small>
            </div>

            <div className="bm-form-group bm-form-full">
              <label>Due Date <span className="bm-req">*</span></label>
              <input
                type="date"
                className="bm-date-input"
                value={form.due_date}
                min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                onChange={e => set("due_date", e.target.value)}
              />
            </div>

          </div>
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Spin size="small" /> : <><CheckCircleOutlined /> Confirm Borrow</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: RETURN BOOK
// ════════════════════════════════════════════════════════════════════════════
function ReturnModal({ borrow, onClose, onReturned }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const handleReturn = async () => {
    try {
      setLoading(true);
      await borrowService.returnBook(borrow.id);
      toast.success("Book returned successfully!");
      onReturned();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to process return");
    } finally {
      setLoading(false);
    }
  };

  const isOverdue = borrow.status === "overdue" ||
    (borrow.status === "borrowing" && new Date(borrow.due_date) < new Date());

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__title" style={{ color: "#389e0d" }}>
            <CheckCircleOutlined /><span>Return Book</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body bm-confirm-body">
          <div className="bm-confirm-icon" style={{ background: "#f6ffed" }}>
            <CheckCircleOutlined style={{ color: "#52c41a" }} />
          </div>
          <h3>Confirm book return?</h3>
          <p>
            <strong>{borrow.book_title}</strong>
            <br />
            <span style={{ color: "#8c8c8c", fontSize: "1.3rem" }}>
              Borrowed by <strong>{borrow.reader_name}</strong> · {borrow.barcode}
            </span>
          </p>
          {isOverdue && (
            <div className="bm-return-warning">
              ⚠️ This book is <strong>overdue</strong>. Please handle any late fees before confirming.
            </div>
          )}
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--success" onClick={handleReturn} disabled={loading}>
            {loading ? <Spin size="small" /> : "Confirm Return"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════════════════
const BorrowManagement = () => {
  const toast = useToast();

  const [borrows,   setBorrows]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [total,     setTotal]     = useState(0);
  const [page,      setPage]      = useState(1);
  const [search,    setSearch]    = useState("");
  const [status,    setStatus]    = useState("");
  const [sortBy,    setSortBy]    = useState("borrow_date");
  const [sortOrder, setSortOrder] = useState("DESC");

  // Refs — tránh stale closure
  const sortByRef    = useRef("borrow_date");
  const sortOrderRef = useRef("DESC");
  const searchRef    = useRef("");
  const statusRef    = useRef("");
  const pageRef      = useRef(1);
  const searchTimer  = useRef(null);

  // Modals
  const [viewId,       setViewId]       = useState(null);
  const [createOpen,   setCreateOpen]   = useState(false);
  const [returnBorrow, setReturnBorrow] = useState(null);

  // ── Load ──────────────────────────────────────────
  const loadBorrows = useCallback(async (p, s, st, sb, so) => {
    try {
      setLoading(true);
      const res = await borrowService.getAll({
        page: p, limit: PAGE_SIZE,
        search: s, status: st,
        sortBy: sb, sortOrder: so,
      });
      setBorrows(res.borrows || []);
      setTotal(res.total    || 0);
    } catch {
      toast.error("Failed to load borrow records");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadBorrows(1, "", "", "borrow_date", "DESC"); }, []);

  // ── Handlers ──────────────────────────────────────
  const handleSearch = (value) => {
    const v = value.trimStart();
    setSearch(v);          searchRef.current = v;
    setPage(1);            pageRef.current   = 1;
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() =>
      loadBorrows(1, v.trim(), statusRef.current, sortByRef.current, sortOrderRef.current), 400);
  };

  const handleStatusFilter = (value) => {
    setStatus(value);      statusRef.current = value;
    setPage(1);            pageRef.current   = 1;
    loadBorrows(1, searchRef.current, value, sortByRef.current, sortOrderRef.current);
  };

  const handleSortChange = (val) => {
    const [sb, so] = val.split("__");
    setSortBy(sb);         sortByRef.current    = sb;
    setSortOrder(so);      sortOrderRef.current = so;
    setPage(1);            pageRef.current      = 1;
    loadBorrows(1, searchRef.current, statusRef.current, sb, so);
  };

  const handlePageChange = (p) => {
    setPage(p);            pageRef.current = p;
    loadBorrows(p, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);
  };

  const handleReset = () => {
    setSearch("");         searchRef.current    = "";
    setStatus("");         statusRef.current    = "";
    setSortBy("borrow_date"); sortByRef.current = "borrow_date";
    setSortOrder("DESC");  sortOrderRef.current = "DESC";
    setPage(1);            pageRef.current      = 1;
    loadBorrows(1, "", "", "borrow_date", "DESC");
  };

  const reload = () =>
    loadBorrows(pageRef.current, searchRef.current, statusRef.current, sortByRef.current, sortOrderRef.current);

  const hasFilter = search || status || sortBy !== "borrow_date" || sortOrder !== "DESC";

  // ── Dynamic actions per row ────────────────────────
  const getActions = (row) => {
    const actions = [
      {
        label: "View Detail",
        icon:  <EyeOutlined />,
        className: "view",
        onClick: () => setViewId(row.id),
      },
    ];

    if (row.status !== "returned") {
      actions.push({
        label: "Return Book",
        icon:  <CheckCircleOutlined />,
        className: "activate",
        onClick: () => setReturnBorrow(row),
      });
    }

    return actions;
  };

  // ── Columns ───────────────────────────────────────
  const columns = [
    {
      key: "_stt",
      label: "STT",
      sortable: false,
      render: (_, __, idx) => (
        <span className="bm-stt">{(page - 1) * PAGE_SIZE + idx + 1}</span>
      ),
    },
    {
      key: "book_title",
      label: "Book",
      sortable: false,
      render: (value, row) => (
        <div className="bm-book-cell">
          <img
            src={row.book_cover || "https://placehold.co/36x50?text=N/A"}
            alt={value}
            onError={e => { e.target.src = "https://placehold.co/36x50?text=N/A"; }}
          />
          <div>
            <div className="bm-book-title">{value}</div>
            <code className="bm-barcode-sm">{row.barcode}</code>
          </div>
        </div>
      ),
    },
    {
      key: "reader_name",
      label: "Reader",
      sortable: false,
      render: (value, row) => (
        <div className="bm-reader-cell">
          <img
            src={row.reader_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`}
            alt={value}
            className="bm-avatar"
            onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`; }}
          />
          <span>{value}</span>
        </div>
      ),
    },
    {
      key: "borrow_date",
      label: "Borrow Date",
      sortable: false,
      render: v => <span className="bm-date">{fmtDate(v)}</span>,
    },
    {
      key: "due_date",
      label: "Due Date",
      sortable: false,
      render: (v, row) => (
        <span className="bm-date" style={{ color: isOverdueDate(row) ? "#ff4d4f" : "inherit", fontWeight: isOverdueDate(row) ? 600 : 400 }}>
          {fmtDate(v)}
        </span>
      ),
    },
    {
      key: "return_date",
      label: "Return Date",
      sortable: false,
      render: v => v
        ? <span className="bm-date" style={{ color: "#52c41a" }}>{fmtDate(v)}</span>
        : <span style={{ color: "#bfbfbf" }}>—</span>,
    },
    {
      key: "status",
      label: "Status",
      sortable: false,
      render: v => <StatusBadge status={v} />,
    },
  ];

  // Summary counts
  const counts = {
    borrowing: borrows.filter(b => b.status === "borrowing").length,
    overdue:   borrows.filter(b => b.status === "overdue").length,
    returned:  borrows.filter(b => b.status === "returned").length,
  };

  return (
    <div className="borrow-management">

      {/* ── Header ── */}
      <div className="header">
        <h1 className="tittle">Borrow Management</h1>
        <div className="header-actions">
          <Filter
            filterName="Status"
            options={STATUS_FILTER}
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
            placeholder="Search book, reader, barcode..."
          />
          {hasFilter && (
            <button className="btn-reset" onClick={handleReset}>✕ Reset</button>
          )}
          <button className="btn-add" onClick={() => setCreateOpen(true)}>
            <PlusOutlined /> New Borrow
          </button>
        </div>
      </div>

      {/* ── Summary chips ── */}
      <div className="bm-summary-row">
        {[
          { label: "Borrowing", count: counts.borrowing, color: "#2c8df4", bg: "#e6f4ff" },
          { label: "Overdue",   count: counts.overdue,   color: "#ff4d4f", bg: "#fff1f0" },
          { label: "Returned",  count: counts.returned,  color: "#52c41a", bg: "#f6ffed" },
        ].map(s => (
          <div key={s.label} className="bm-chip" style={{ background: s.bg, color: s.color }}>
            <span className="bm-chip-count">{s.count}</span>
            <span className="bm-chip-label">{s.label}</span>
          </div>
        ))}
        <span className="bm-chip-total">Total this page: <strong>{borrows.length}</strong></span>
      </div>

      {/* ── Filter summary ── */}
      {(search || status) && (
        <div className="filter-summary">
          {search && <span className="filter-tag">🔍 "{search}"</span>}
          {status && <span className="filter-tag">📋 {status}</span>}
          <span className="filter-count">{total} result{total !== 1 ? "s" : ""} found</span>
        </div>
      )}

      {/* ── Table ── */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "6rem" }}><Spin size="large" /></div>
      ) : borrows.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>{search || status ? "No records match your search" : "No borrow records found"}</p>
          {(search || status) && (
            <button className="btn-reset" onClick={handleReset}>Clear filters</button>
          )}
        </div>
      ) : (
        <Table
          columns={columns}
          rows={borrows}
          getActions={getActions}
          rowClassName={row => row.status === "overdue" ? "bm-row--overdue" : ""}
        />
      )}

      {/* ── Pagination ── */}
      {!loading && borrows.length > 0 && (
        <CustomPagination
          total={total} pageSize={PAGE_SIZE}
          currentPage={page} onChange={handlePageChange}
        />
      )}

      {/* ── Modals ── */}
      {viewId      && <ViewModal   borrowId={viewId}    onClose={() => setViewId(null)} />}
      {createOpen  && <CreateModal onClose={() => setCreateOpen(false)} onCreated={reload} />}
      {returnBorrow && (
        <ReturnModal
          borrow={returnBorrow}
          onClose={() => setReturnBorrow(null)}
          onReturned={reload}
        />
      )}
    </div>
  );
};

export default BorrowManagement;