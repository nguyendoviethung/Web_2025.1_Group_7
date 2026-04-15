import { useState, useEffect, useCallback, useRef } from "react";
import { Spin, Select } from "antd";
import { HistoryOutlined, FilterOutlined } from "@ant-design/icons";
import readerProfileService from "../../services/readerProfileService";
import { useToast }         from "../../components/Toast";
import "../../style/ReaderHistory.scss";
 
const PAGE_SIZE  = 8;
const STATUS_OPTS = [
  { label:"Borrowing", value:"borrowing" },
  { label:"Overdue",   value:"overdue"   },
  { label:"Returned",  value:"returned"  },
];
const STATUS_META = {
  borrowing: { bg:"#e6f4ff", color:"#0958d9", label:"Borrowing" },
  overdue:   { bg:"#fff1f0", color:"#cf1322", label:"Overdue"   },
  returned:  { bg:"#f6ffed", color:"#389e0d", label:"Returned"  },
};
const fmtDate  = d => d ? new Date(d).toLocaleDateString("vi-VN",{day:"2-digit",month:"2-digit",year:"numeric"}) : "—";
const fmtMoney = n => Number(n).toLocaleString("vi-VN") + " đ";
 
export default function ReaderBorrowHistory() {
  const toast = useToast();
  const [items,   setItems]   = useState([]);
  const [total,   setTotal]   = useState(0);
  const [page,    setPage]    = useState(1);
  const [status,  setStatus]  = useState("");
  const [loading, setLoading] = useState(true);
 
  const statusRef = useRef("");
  const pageRef   = useRef(1);
 
  const load = useCallback(async (p, st) => {
    setLoading(true);
    try {
      const res = await readerProfileService.getHistory({ page: p, limit: PAGE_SIZE, status: st });
      setItems(res.history || []);
      setTotal(res.total   || 0);
    } catch { toast.error("Failed to load history"); }
    finally  { setLoading(false); }
  }, []);
 
  useEffect(() => { load(1, ""); }, []);
 
  const handleStatus = (val = "") => {
    setStatus(val); statusRef.current = val;
    setPage(1);     pageRef.current   = 1;
    load(1, val);
  };
 
  const handlePage = (p) => {
    setPage(p); pageRef.current = p;
    load(p, statusRef.current);
  };
 
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
 
  return (
    <div className="reader-history">
      <div className="rh-header">
        <h1> My Borrow History</h1>
        <div className="rh-filters">
          <Select
            allowClear
            placeholder="Filter by status"
            value={status || undefined}
            onChange={val => handleStatus(val ?? "")}
            style={{ width: 180 }}
            suffixIcon={<FilterOutlined style={{ color:"#2c8df4" }} />}
            options={STATUS_OPTS}
          />
          <span className="rh-count">{total} record{total !== 1 ? "s" : ""}</span>
        </div>
      </div>
 
      {loading ? (
        <div className="rh-loading"><Spin size="large" /></div>
      ) : items.length === 0 ? (
        <div className="rh-empty">
          <HistoryOutlined />
          <p>No records found</p>
        </div>
      ) : (
        <>
          <div className="rh-list">
            {items.map(item => {
              const m = STATUS_META[item.status] || STATUS_META.returned;
              const isOverdue = item.status === "overdue";
              return (
                <div key={item.id} className={`rh-item ${isOverdue ? "rh-item--overdue" : ""}`}>
                  <img
                    src={item.book_cover || "https://placehold.co/56x80?text=N/A"}
                    alt={item.book_title}
                    className="rh-cover"
                    onError={e => { e.target.src = "https://placehold.co/56x80?text=N/A"; }}
                  />
                  <div className="rh-info">
                    <div className="rh-title">{item.book_title}</div>
                    <div className="rh-author">{item.book_author}</div>
                    <code className="rh-barcode">{item.barcode}</code>
                    <div className="rh-dates">
                      <span>Borrowed: <strong>{fmtDate(item.borrow_date)}</strong></span>
                      <span>Due: <strong style={{ color: isOverdue ? "#ff4d4f" : "inherit" }}>{fmtDate(item.due_date)}</strong></span>
                      {item.return_date && <span>Returned: <strong style={{ color: "#52c41a" }}>{fmtDate(item.return_date)}</strong></span>}
                    </div>
                    {item.fine_amount > 0 && (
                      <div className="rh-fine">⚠ Fine: {fmtMoney(item.fine_amount)}</div>
                    )}
                  </div>
                  <span className="rh-badge" style={{ background: m.bg, color: m.color }}>
                    {m.label}
                  </span>
                </div>
              );
            })}
          </div>
 
          {totalPages > 1 && (
            <div className="rh-pagination">
              <button className="rh-pg-btn" disabled={page===1} onClick={() => handlePage(page-1)}>‹ Prev</button>
              <span className="rh-pg-info">Page {page} / {totalPages}</span>
              <button className="rh-pg-btn" disabled={page===totalPages} onClick={() => handlePage(page+1)}>Next ›</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
 