// frontend/src/pages/reader/BookCatalog.jsx
// Reviews tab is read-only — writing is done via notification

import { useState, useEffect, useCallback, useRef } from "react";
import { Spin, Select, Rate } from "antd";
import {
  SearchOutlined, FilterOutlined, BookOutlined,
  UserOutlined, EnvironmentOutlined, CloseOutlined,
  CalendarOutlined, FileTextOutlined, SaveOutlined,
} from "@ant-design/icons";
import bookService        from "../../services/bookService";
import reservationService from "../../services/reservationService";
import reviewService      from "../../services/reviewService";
import { useToast }       from "../../components/Toast";
import "../../style/BookCatalog.scss";

const PAGE_SIZE = 12;
const SORT_OPTIONS = [
  { label: "Newest",        value: "created_at__DESC"       },
  { label: "Most Borrowed", value: "borrowed_all_time__DESC" },
  { label: "Top Rated",     value: "avg_rating__DESC"        },
  { label: "Title A→Z",     value: "title__ASC"              },
];

// ── Star display ──────────────────────────────────────
function StarDisplay({ value, size = 14 }) {
  return <Rate value={value} disabled style={{ fontSize: size, color: "#faad14" }} />;
}

// ── Read-only Review Section ──────────────────────────
function ReviewSection({ bookId, bookTitle }) {
  const [reviews, setReviews] = useState([]);
  const [dist,    setDist]    = useState([]);
  const [total,   setTotal]   = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    reviewService.getByBook(bookId, { limit: 10 })
      .then(res => {
        setReviews(res.reviews || []);
        setDist(res.distribution || []);
        setTotal(res.total || 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [bookId]);

  if (loading) return <div style={{ padding:"2rem", textAlign:"center" }}><Spin /></div>;

  return (
    <div className="bc-reviews">
      <div className="bc-reviews-header">
        <h4>Borrower Reviews ({total})</h4>
        <p className="bc-reviews-hint">
          Only readers who have returned this book can leave reviews.<br />
          <span>Return a copy → check your notifications to write a review.</span>
        </p>
      </div>

      {/* Rating distribution */}
      {dist.length > 0 && (
        <div className="bc-rating-dist">
          {[5, 4, 3, 2, 1].map(star => {
            const found = dist.find(d => d.rating === star);
            const count = found?.count || 0;
            const pct   = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={star} className="bc-rating-row">
                <span className="bc-rating-star">{star} ★</span>
                <div className="bc-rating-bar">
                  <div className="bc-rating-fill" style={{ width: `${pct}%` }} />
                </div>
                <span className="bc-rating-count">{count}</span>
              </div>
            );
          })}
        </div>
      )}

      {/* Review list */}
      <div className="bc-review-list">
        {reviews.length === 0 ? (
          <div className="bc-review-locked">
            <p>No reviews yet. Be the first to review after returning this book!</p>
          </div>
        ) : (
          reviews.map(r => (
            <div key={r.id} className="bc-review-item">
              <div className="bc-review-meta">
                <img
                  src={r.reviewer_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reviewer_name}`}
                  alt={r.reviewer_name}
                  onError={e => { e.target.src = `https://api.dicebear.com/7.x/avataaars/svg?seed=${r.reviewer_name}`; }}
                />
                <div>
                  <div className="bc-review-name">{r.reviewer_name}</div>
                  <StarDisplay value={r.rating} size={13} />
                </div>
                <span className="bc-review-date">
                  {new Date(r.created_at).toLocaleDateString("vi-VN")}
                </span>
              </div>
              {r.content && <p className="bc-review-content">{r.content}</p>}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Book Detail Modal ─────────────────────────────────
function BookDetailModal({ book, onClose }) {
  const toast = useToast();
  const [tab,       setTab]      = useState("info");
  const [reserving, setReserving]= useState(false);
  const [reserved,  setReserved] = useState(false);

  if (!book) return null;
  const available = book.available ?? 0;
  const canReserve = available === 0;

  const handleReserve = async () => {
    setReserving(true);
    try {
      await reservationService.create(book.id);
      setReserved(true);
      toast.success(`Reserved "${book.title}"! We'll notify you when it's available.`);
    } catch (err) {
      toast.error(err.message || "Failed to reserve");
    } finally {
      setReserving(false);
    }
  };

  return (
    <div className="bc-overlay" onClick={onClose}>
      <div className="bc-modal" onClick={e => e.stopPropagation()}>
        <button className="bc-modal-close" onClick={onClose}><CloseOutlined /></button>

        {/* Hero */}
        <div className="bc-modal-hero">
          <img
            src={book.book_cover || "https://placehold.co/120x170?text=No+Cover"}
            alt={book.title} className="bc-modal-cover"
            onError={e => { e.target.src = "https://placehold.co/120x170?text=No+Cover"; }}
          />
          <div className="bc-modal-meta">
            <span className="bc-genre-badge">{book.genre || "Unknown"}</span>
            <h2 className="bc-modal-title">{book.title}</h2>
            <div className="bc-modal-author">
              <img
                src={book.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${book.author}`}
                alt={book.author} className="bc-author-avatar"
              />
              <span>{book.author || "Unknown author"}</span>
            </div>

            {book.review_count > 0 && (
              <div className="bc-modal-rating">
                <StarDisplay value={Math.round(book.avg_rating)} size={16} />
                <span className="bc-modal-rating-text">
                  {Number(book.avg_rating).toFixed(1)} ({book.review_count} reviews)
                </span>
              </div>
            )}

            <div className="bc-modal-avail">
              <span className={`bc-avail-badge ${available > 0 ? "bc-avail-badge--ok" : "bc-avail-badge--none"}`}>
                {available > 0 ? `${available} copies available` : "Currently unavailable"}
              </span>
            </div>

            {canReserve && (
              <button
                className={`bc-reserve-btn ${reserved ? "bc-reserve-btn--done" : ""}`}
                onClick={handleReserve}
                disabled={reserving || reserved}
              >
                {reserved ? "✓ Reserved" : reserving ? <Spin size="small" /> : <><SaveOutlined /> Reserve</>}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bc-modal-tabs">
          <button className={`bc-tab ${tab === "info" ? "bc-tab--active" : ""}`} onClick={() => setTab("info")}>
            Information
          </button>
          <button className={`bc-tab ${tab === "reviews" ? "bc-tab--active" : ""}`} onClick={() => setTab("reviews")}>
            Reviews {book.review_count > 0 ? `(${book.review_count})` : ""}
          </button>
        </div>

        {tab === "info" && (
          <>
            {book.description && <p className="bc-modal-desc">{book.description}</p>}
            <div className="bc-modal-grid">
              {[
                { icon: <BookOutlined />,        label:"Book ID",      value: book.id },
                { icon: <FileTextOutlined />,    label:"ISBN",         value: book.isbn || "—" },
                { icon: <UserOutlined />,        label:"Publisher",    value: book.publisher || "—" },
                { icon: <CalendarOutlined />,    label:"Publish Year", value: book.publish_year || "—" },
                { icon: <FileTextOutlined />,    label:"Language",     value: book.language || "—" },
                { icon: <FileTextOutlined />,    label:"Pages",        value: book.pages ? `${book.pages} pages` : "—" },
                { icon: <EnvironmentOutlined />, label:"Location",     value: book.location || "—" },
              ].map((item, i) => (
                <div key={i} className="bc-modal-info-item">
                  {item.icon}
                  <div><label>{item.label}</label><span>{item.value}</span></div>
                </div>
              ))}
            </div>
            <div className="bc-modal-stats">
              {[
                { num: book.quantity,           lbl: "Total Copies", clr: "#262626" },
                { num: book.available,          lbl: "Available",    clr: "#52c41a" },
                { num: book.currently_borrowed, lbl: "Borrowed Now", clr: "#fa8c16" },
                { num: book.borrowed_all_time,  lbl: "All-Time",     clr: "#2c8df4" },
              ].map((s, i) => (
                <div key={i} className="bc-modal-stat">
                  <span style={{ color: s.clr }}>{s.num ?? 0}</span>
                  <small>{s.lbl}</small>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "reviews" && (
          <ReviewSection bookId={book.id} bookTitle={book.title} />
        )}
      </div>
    </div>
  );
}

// ── Main BookCatalog page ─────────────────────────────
export default function BookCatalog() {
  const toast = useToast();

  const [books,        setBooks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState("");
  const [genre,        setGenre]        = useState("");
  const [sort,         setSort]         = useState("created_at__DESC");
  const [genreOptions, setGenreOptions] = useState([]);
  const [selectedBook, setSelectedBook] = useState(null);

  const searchRef = useRef(""); const genreRef = useRef(""); const sortRef  = useRef("created_at__DESC");
  const pageRef   = useRef(1);  const timer    = useRef(null);

  const loadBooks = useCallback(async (p, s, g, sortVal) => {
    const [sb, so] = sortVal.split("__");
    try {
      setLoading(true);
      const res = await bookService.getAll({ page: p, limit: PAGE_SIZE, search: s, genre: g, sortBy: sb, sortOrder: so });
      setBooks(res.books || []);
      setTotal(res.total || 0);
    } catch { toast.error("Failed to load books"); }
    finally  { setLoading(false); }
  }, []);

  useEffect(() => {
    bookService.getGenres().then(res => setGenreOptions(res.genres || [])).catch(() => {});
    loadBooks(1, "", "", "created_at__DESC");
  }, []);

  const handleSearch = (e) => {
    const v = e.target.value;
    setSearch(v); searchRef.current = v;
    setPage(1); pageRef.current = 1;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => loadBooks(1, v.trim(), genreRef.current, sortRef.current), 400);
  };

  const handleGenre = (val = "") => {
    setGenre(val); genreRef.current = val;
    setPage(1); pageRef.current = 1;
    loadBooks(1, searchRef.current, val, sortRef.current);
  };

  const handleSort = (val) => {
    setSort(val); sortRef.current = val;
    setPage(1); pageRef.current = 1;
    loadBooks(1, searchRef.current, genreRef.current, val);
  };

  const handlePage = (p) => {
    setPage(p); pageRef.current = p;
    loadBooks(p, searchRef.current, genreRef.current, sortRef.current);
  };

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="book-catalog">
      <div className="bc-header">
        <h1>📚 Book Catalog</h1>
        <p>{total} books available in library</p>
      </div>

      <div className="bc-filters">
        <div className="bc-search">
          <SearchOutlined className="bc-search-icon" />
          <input placeholder="Search by title, author..." value={search} onChange={handleSearch} />
        </div>
        <Select allowClear placeholder="Genre" value={genre || undefined} onChange={val => handleGenre(val ?? "")}
          style={{ width: 160 }} suffixIcon={<FilterOutlined style={{ color: "#2c8df4" }} />} options={genreOptions} />
        <Select value={sort} onChange={handleSort} style={{ width: 190 }}
          options={SORT_OPTIONS.map(o => ({ label: o.label, value: o.value }))} />
        {(search || genre) && (
          <button className="bc-reset" onClick={() => {
            setSearch(""); searchRef.current = ""; setGenre(""); genreRef.current = "";
            setSort("created_at__DESC"); sortRef.current = "created_at__DESC";
            setPage(1); pageRef.current = 1; loadBooks(1, "", "", "created_at__DESC");
          }}>✕ Reset</button>
        )}
      </div>

      {loading ? (
        <div className="bc-loading"><Spin size="large" /></div>
      ) : books.length === 0 ? (
        <div className="bc-empty"><BookOutlined /><p>No books found</p></div>
      ) : (
        <>
          <div className="bc-grid">
            {books.map(book => (
              <div key={book.id} className="bc-card" onClick={() => setSelectedBook(book)}>
                <div className="bc-card-cover-wrap">
                  <img
                    src={book.book_cover || "https://placehold.co/140x200?text=No+Cover"}
                    alt={book.title} className="bc-card-cover"
                    onError={e => { e.target.src = "https://placehold.co/140x200?text=No+Cover"; }}
                  />
                  <span className={`bc-card-avail ${book.available > 0 ? "bc-card-avail--ok" : "bc-card-avail--none"}`}>
                    {book.available > 0 ? `${book.available} left` : "Unavailable"}
                  </span>
                </div>
                {book.genre && <span className="bc-card-genre">{book.genre}</span>}
                <h3 className="bc-card-title">{book.title}</h3>
                <p className="bc-card-author">{book.author || "Unknown"}</p>
                {book.review_count > 0 && (
                  <div className="bc-card-rating">
                    <span className="bc-card-star">★</span>
                    <span>{Number(book.avg_rating).toFixed(1)}</span>
                    <span className="bc-card-rating-count">({book.review_count})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
          {totalPages > 1 && (
            <div className="bc-pagination">
              <button className="bc-page-btn" disabled={page===1} onClick={() => handlePage(page-1)}>‹</button>
              {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                let p = i + 1;
                if (totalPages > 7) {
                  if (page <= 4) p = i + 1;
                  else if (page >= totalPages - 3) p = totalPages - 6 + i;
                  else p = page - 3 + i;
                }
                return (
                  <button key={p} className={`bc-page-btn ${p===page ? "bc-page-btn--active" : ""}`} onClick={() => handlePage(p)}>{p}</button>
                );
              })}
              <button className="bc-page-btn" disabled={page===totalPages} onClick={() => handlePage(page+1)}>›</button>
            </div>
          )}
        </>
      )}

      {selectedBook && <BookDetailModal book={selectedBook} onClose={() => setSelectedBook(null)} />}
    </div>
  );
}