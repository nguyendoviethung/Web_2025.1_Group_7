import React, { useState } from "react";
import {
  PlusOutlined,
  EyeOutlined,
  EditOutlined,
  CopyOutlined,
  DeleteOutlined,
  CloseOutlined,
  BookOutlined,
  UserOutlined,
  EnvironmentOutlined,
  TagOutlined,
  CalendarOutlined,
  FileTextOutlined,
  ExclamationCircleOutlined,
  SaveOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import SearchBar from "../../components/SearchBar";
import "../../style/BookManagement.scss";
import Table from "../../components/Table";
import CustomPagination from "../../components/Pagination";
import Filter from "../../components/Filter";

// ─── Dữ liệu mẫu ─────────────────────────────────────────────────────────────
const INITIAL_BOOKS = [
  {
    id: "BK001",
    name: "Harry Potter and the Philosopher's Stone",
    bookCover: "https://picsum.photos/40/60?random=1",
    author: "J.K. Rowling",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=JK",
    genre: "Fantasy",
    publisher: "Bloomsbury",
    publishYear: 1997,
    language: "English",
    pages: 223,
    location: "8 - 2 - 2",
    quantity: 40,
    available: 35,
    currentlyBorrowed: 5,
    borrowedAllTime: 128,
    description: "The first novel in the Harry Potter series, following a young wizard Harry Potter and his first year at Hogwarts School of Witchcraft and Wizardry.",
  },
  {
    id: "BK002",
    name: "The Lord of the Rings",
    bookCover: "https://picsum.photos/40/60?random=2",
    author: "J.R.R. Tolkien",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Tolkien",
    genre: "Fantasy",
    publisher: "Allen & Unwin",
    publishYear: 1954,
    language: "English",
    pages: 1178,
    location: "5 - 1 - 3",
    quantity: 25,
    available: 22,
    currentlyBorrowed: 3,
    borrowedAllTime: 95,
    description: "An epic high-fantasy novel set in Middle-earth, following the quest to destroy the One Ring.",
  },
  {
    id: "BK003",
    name: "1984",
    bookCover: "https://picsum.photos/40/60?random=3",
    author: "George Orwell",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Orwell",
    genre: "Dystopian Fiction",
    publisher: "Secker & Warburg",
    publishYear: 1949,
    language: "English",
    pages: 328,
    location: "3 - 4 - 1",
    quantity: 30,
    available: 22,
    currentlyBorrowed: 8,
    borrowedAllTime: 210,
    description: "A dystopian novel set in a totalitarian society ruled by Big Brother, exploring themes of surveillance and repression.",
  },
  {
    id: "BK004",
    name: "To Kill a Mockingbird",
    bookCover: "https://picsum.photos/40/60?random=4",
    author: "Harper Lee",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Harper",
    genre: "Southern Gothic",
    publisher: "J. B. Lippincott & Co.",
    publishYear: 1960,
    language: "English",
    pages: 281,
    location: "2 - 3 - 5",
    quantity: 18,
    available: 16,
    currentlyBorrowed: 2,
    borrowedAllTime: 74,
    description: "A novel about racial injustice and moral growth in the American South.",
  },
  {
    id: "BK005",
    name: "Pride and Prejudice",
    bookCover: "https://picsum.photos/40/60?random=5",
    author: "Jane Austen",
    authorAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jane",
    genre: "Romantic Novel",
    publisher: "T. Egerton",
    publishYear: 1813,
    language: "English",
    pages: 432,
    location: "7 - 2 - 1",
    quantity: 22,
    available: 18,
    currentlyBorrowed: 4,
    borrowedAllTime: 156,
    description: "A romantic novel of manners following Elizabeth Bennet and her complicated relationship with the proud Mr. Darcy.",
  },
];

const CONDITION_OPTIONS = ["Excellent", "Good", "Fair", "Poor"];
const STATUS_OPTIONS = ["Available", "Borrowed", "Damaged", "Lost"];

// ─── Columns ──────────────────────────────────────────────────────────────────
const BOOK_COLUMNS = [
  { key: "id", label: "ISBN" },
  {
    key: "name",
    label: "Book Name",
    render: (value, row) => (
      <div className="book-info">
        <img src={row.bookCover} alt={value} className="book-cover" />
        <span>{value}</span>
      </div>
    ),
  },
  {
    key: "author",
    label: "Author",
    render: (value, row) => (
      <div className="author-info">
        <img src={row.authorAvatar} alt={value} className="author-avatar" />
        <span>{value}</span>
      </div>
    ),
  },
  { key: "location", label: "Location", subtitle: "Floor - Room - Bookshelf" },
  { key: "quantity", label: "Quantity", render: (v) => <strong>{v}</strong> },
];

// ════════════════════════════════════════════════════════════════════════════
// Modal: VIEW
// ════════════════════════════════════════════════════════════════════════════
function ViewModal({ book, onClose }) {
  if (!book) return null;
  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--view" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title "><EyeOutlined /><span>Book Details</span></div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <div className="view-hero">
            <img src={book.bookCover} alt={book.name} className="view-cover-img" />
            <div className="view-hero__info">
              <h3 className="view-title">{book.name}</h3>
              <div className="author-info" style={{ marginBottom: "0.8rem" }}>
                <img src={book.authorAvatar} alt={book.author} className="author-avatar" />
                <span>{book.author}</span>
              </div>
              <span className="view-genre-badge">{book.genre}</span>
            </div>
          </div>
          <p className="view-desc">{book.description}</p>
          <div className="view-grid">
            {[
              { icon: <TagOutlined />,         label: "ISBN",         value: book.id },
              { icon: <BookOutlined />,         label: "Publisher",    value: book.publisher },
              { icon: <CalendarOutlined />,     label: "Publish Year", value: book.publishYear },
              { icon: <UserOutlined />,         label: "Language",     value: book.language },
              { icon: <FileTextOutlined />,     label: "Pages",        value: `${book.pages} pages` },
              { icon: <EnvironmentOutlined />,  label: "Location",     value: book.location },
            ].map((item, i) => (
              <div key={i} className="view-info-item">
                {item.icon}
                <div><label>{item.label}</label><span>{item.value}</span></div>
              </div>
            ))}
          </div>
          <div className="view-stats">
            <div className="stat-card"><span className="stat-num">{book.quantity}</span><span className="stat-lbl">Total Copies</span></div>
            <div className="stat-card stat-card--green"><span className="stat-num">{book.available}</span><span className="stat-lbl">Available</span></div>
            <div className="stat-card stat-card--orange"><span className="stat-num">{book.currentlyBorrowed}</span><span className="stat-lbl">Borrowed Now</span></div>
            <div className="stat-card stat-card--blue"><span className="stat-num">{book.borrowedAllTime}</span><span className="stat-lbl">All-Time Borrowed</span></div>
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
// Modal: EDIT BOOK
// ════════════════════════════════════════════════════════════════════════════
function EditModal({ book, onClose, onSave }) {
  const [form, setForm] = useState({ ...book });
  if (!book) return null;
  const set = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--edit" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title"><EditOutlined /><span>Edit Book</span></div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <div className="edit-form-grid">
            <div className="form-group form-full">
              <label>Book Name <span className="req">*</span></label>
              <input value={form.name} onChange={(e) => set("name", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Author <span className="req">*</span></label>
              <input value={form.author} onChange={(e) => set("author", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input value={form.genre} onChange={(e) => set("genre", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Publisher</label>
              <input value={form.publisher} onChange={(e) => set("publisher", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Publish Year</label>
              <input type="number" value={form.publishYear} onChange={(e) => set("publishYear", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Language</label>
              <input value={form.language} onChange={(e) => set("language", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pages</label>
              <input type="number" value={form.pages} onChange={(e) => set("pages", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Location <small>(Floor - Room - Shelf)</small></label>
              <input value={form.location} placeholder="e.g. 3 - 2 - 1" onChange={(e) => set("location", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Total Quantity</label>
              <input type="number" value={form.quantity} onChange={(e) => set("quantity", +e.target.value)} />
            </div>
            <div className="form-group form-full">
              <label>Description</label>
              <textarea rows={3} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--primary" onClick={() => { onSave(form); onClose(); }}>
            <SaveOutlined /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: ADD COPY
// ════════════════════════════════════════════════════════════════════════════
function AddCopyModal({ book, onClose, onAdd }) {
  const [form, setForm] = useState({ condition: "Good", notes: "" });
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title"><PlusOutlined /><span>Add New Copy</span></div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <p className="copy-modal-book-name">Book: <strong>{book?.name}</strong></p>
          <div className="edit-form-grid">
            <div className="form-group form-full">
              <label>Condition <span className="req">*</span></label>
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                {CONDITION_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group form-full">
              <label>Notes <small>(tuỳ chọn)</small></label>
              <textarea rows={2} placeholder="Ghi chú thêm về bản copy này..." value={form.notes} onChange={(e) => set("notes", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--primary" onClick={() => { onAdd(form); onClose(); }}>
            <PlusOutlined /> Add Copy
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: EDIT COPY
// ════════════════════════════════════════════════════════════════════════════
function EditCopyModal({ copy, onClose, onSave }) {
  const [form, setForm] = useState({ ...copy });
  if (!copy) return null;
  const set = (f, v) => setForm((p) => ({ ...p, [f]: v }));

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--sm" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title"><EditOutlined /><span>Edit Copy</span></div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <p className="copy-modal-book-name">Copy ID: <strong>{copy.copyId}</strong></p>
          <div className="edit-form-grid">
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={(e) => set("status", e.target.value)}>
                {STATUS_OPTIONS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Condition</label>
              <select value={form.condition} onChange={(e) => set("condition", e.target.value)}>
                {CONDITION_OPTIONS.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group form-full">
              <label>Borrower <small>(để trống nếu Available)</small></label>
              <input
                value={form.borrower || ""}
                placeholder="Reader ID hoặc tên..."
                onChange={(e) => set("borrower", e.target.value || null)}
              />
            </div>
            <div className="form-group form-full">
              <label>Due Date <small>(để trống nếu Available)</small></label>
              <input
                type="date"
                value={form.dueDate || ""}
                onChange={(e) => set("dueDate", e.target.value || null)}
              />
            </div>
          </div>
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--primary" onClick={() => { onSave(form); onClose(); }}>
            <SaveOutlined /> Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: MANAGE COPIES
// ════════════════════════════════════════════════════════════════════════════
function ManageCopiesModal({ book, onClose }) {
  if (!book) return null;

  const [copies, setCopies] = useState(
    Array.from({ length: book.quantity }, (_, i) => ({
      copyId: `${book.id}-C${String(i + 1).padStart(3, "0")}`,
      status: i < book.currentlyBorrowed ? "Borrowed" : "Available",
      condition: ["Good", "Good", "Fair", "Good", "Excellent"][i % 5],
      borrower: i < book.currentlyBorrowed ? `Reader #${1000 + i}` : null,
      dueDate: i < book.currentlyBorrowed
        ? new Date(Date.now() + (i + 1) * 7 * 86400000).toLocaleDateString("vi-VN")
        : null,
    }))
  );

  const [showAddModal, setShowAddModal]   = useState(false);
  const [editCopy, setEditCopy]           = useState(null);

  const availableCount = copies.filter((c) => c.status === "Available").length;
  const borrowedCount  = copies.filter((c) => c.status === "Borrowed").length;

  const handleAddCopy = (form) => {
    const newCopy = {
      copyId: `${book.id}-C${String(copies.length + 1).padStart(3, "0")}`,
      status: "Available",
      condition: form.condition,
      borrower: null,
      dueDate: null,
    };
    setCopies((prev) => [...prev, newCopy]);
  };

  const handleSaveCopy = (updated) => {
    setCopies((prev) => prev.map((c) => (c.copyId === updated.copyId ? updated : c)));
  };

  const handleDeleteCopy = (copyId) => {
    setCopies((prev) => prev.filter((c) => c.copyId !== copyId));
  };

  const statusStyle = {
    Available: { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
    Borrowed:  { bg: "#fff7e6", color: "#d46b08", border: "#ffd591" },
    Damaged:   { bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
    Lost:      { bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" },
  };

  const conditionStyle = {
    Excellent: { bg: "#e6f4ff", color: "#0958d9", border: "#91caff" },
    Good:      { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
    Fair:      { bg: "#fff7e6", color: "#d46b08", border: "#ffd591" },
    Poor:      { bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
  };

  const Badge = ({ text, styleMap }) => {
    const s = styleMap[text] || { bg: "#f5f5f5", color: "#333", border: "#d9d9d9" };
    return (
      <span style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "0.3rem 1rem",
        borderRadius: "2rem",
        fontSize: "1.25rem",
        fontWeight: "600",
        background: s.bg,
        color: s.color,
        border: `0.1rem solid ${s.border}`,
        whiteSpace: "nowrap",
      }}>
        {text}
      </span>
    );
  };

  return (
    <>
      <div className="bm-overlay" onClick={onClose}>
        <div className="bm-modal bm-modal--copies" onClick={(e) => e.stopPropagation()}>
          <div className="bm-modal__header">
            <div>
              <div className="bm-modal__header-title"><CopyOutlined /><span>Manage Copies</span></div>
              <p className="bm-modal__subtitle">{book.name}</p>
            </div>
            <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
          </div>

          {/* Summary bar */}
          <div className="copies-summary">
            <span>Total: <strong>{copies.length}</strong></span>
            <span className="cs-sep" />
            <span className="cs-green">Available: <strong>{availableCount}</strong></span>
            <span className="cs-sep" />
            <span className="cs-orange">Borrowed: <strong>{borrowedCount}</strong></span>
            <button
              className="bm-btn bm-btn--primary copies-add-btn"
              onClick={() => setShowAddModal(true)}
            >
              <PlusOutlined /> Add Copy
            </button>
          </div>

          <div className="bm-modal__body bm-modal__body--no-top-pad">
            <table className="copies-table">
              <thead>
                <tr>
                  <th>Copy ID</th>
                  <th>Status</th>
                  <th>Condition</th>
                  <th>Borrower</th>
                  <th>Due Date</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {copies.map((copy) => (
                  <tr key={copy.copyId}>
                    <td><code className="copy-id">{copy.copyId}</code></td>
                    <td><Badge text={copy.status}    styleMap={statusStyle} /></td>
                    <td><Badge text={copy.condition} styleMap={conditionStyle} /></td>
                    <td>{copy.borrower ?? <span className="text-muted">—</span>}</td>
                    <td>{copy.dueDate  ?? <span className="text-muted">—</span>}</td>
                    <td className="copies-actions">
                      <button
                        className="copies-action-btn copies-action-btn--edit"
                        onClick={() => setEditCopy(copy)}
                        title="Edit copy"
                      >
                        <EditOutlined />
                      </button>
                      <button
                        className="copies-action-btn copies-action-btn--del"
                        onClick={() => handleDeleteCopy(copy.copyId)}
                        title="Delete copy"
                      >
                        <DeleteOutlined />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bm-modal__footer">
            <button className="bm-btn bm-btn--secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {/* Sub-modals bên trong ManageCopies */}
      {showAddModal && (
        <AddCopyModal
          book={book}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddCopy}
        />
      )}
      {editCopy && (
        <EditCopyModal
          copy={editCopy}
          onClose={() => setEditCopy(null)}
          onSave={handleSaveCopy}
        />
      )}
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Modal: DELETE CONFIRM
// ════════════════════════════════════════════════════════════════════════════
function DeleteModal({ book, onClose, onConfirm }) {
  if (!book) return null;
  const hasBorrowed = book.currentlyBorrowed > 0;

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--delete" onClick={(e) => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title bm-modal__header-title--danger">
            <ExclamationCircleOutlined /><span>Delete Book</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>

        <div className="bm-modal__body delete-body">
          <div className="delete-icon-wrap"><DeleteOutlined /></div>
          <h3>Are you sure you want to delete this book?</h3>
          <p>
            <strong>"{book.name}"</strong> by {book.author} will be{" "}
            <span className="text-danger">permanently removed</span> and cannot be recovered.
          </p>

          {hasBorrowed && (
            <div className="delete-warning">
              ⚠️&nbsp;This book has <strong>{book.currentlyBorrowed}</strong> copies currently borrowed.
              Please resolve them before deleting.
            </div>
          )}
        </div>

        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button
            className="bm-btn bm-btn--danger"
            disabled={hasBorrowed}
            onClick={() => { onConfirm(book.id); onClose(); }}
          >
            <DeleteOutlined /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// Main Page
// ════════════════════════════════════════════════════════════════════════════
const BookManagement = () => {
  const [books, setBooks]           = useState(INITIAL_BOOKS);
  const [viewBook, setViewBook]     = useState(null);
  const [editBook, setEditBook]     = useState(null);
  const [copiesBook, setCopiesBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);

  const handleSave   = (updated) => setBooks((p) => p.map((b) => (b.id === updated.id ? updated : b)));
  const handleDelete = (id)      => setBooks((p) => p.filter((b) => b.id !== id));

  const ACTIONS = [
    { label: "View",          icon: <EyeOutlined />,    className: "view",   onClick: (row) => setViewBook(row) },
    { label: "Edit",          icon: <EditOutlined />,   className: "edit",   onClick: (row) => setEditBook(row) },
    { label: "Manage Copies", icon: <CopyOutlined />,   className: "copies", onClick: (row) => setCopiesBook(row) },
    { label: "Delete",        icon: <DeleteOutlined />, className: "delete", onClick: (row) => setDeleteBook(row) },
  ];

  return (
    <div className="book-management">
      <div className="header">
        <h1 className="tittle">Books Management</h1>
        <div className="header-actions">
          <Filter filterName="Author" />
          <SearchBar />
          <button className="btn-add"><PlusOutlined /> Add New</button>
        </div>
      </div>

      <Table columns={BOOK_COLUMNS} rows={books} actions={ACTIONS} />
      <CustomPagination />

      {viewBook   && <ViewModal         book={viewBook}   onClose={() => setViewBook(null)} />}
      {editBook   && <EditModal         book={editBook}   onClose={() => setEditBook(null)}   onSave={handleSave} />}
      {copiesBook && <ManageCopiesModal book={copiesBook} onClose={() => setCopiesBook(null)} />}
      {deleteBook && <DeleteModal       book={deleteBook} onClose={() => setDeleteBook(null)} onConfirm={handleDelete} />}
    </div>
  );
};

export default BookManagement;