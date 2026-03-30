import React, { useState, useEffect, useCallback, useRef } from "react";
import { Spin, Select } from "antd";
import {
  PlusOutlined, EyeOutlined, EditOutlined,
  CopyOutlined, DeleteOutlined, CloseOutlined,
  BookOutlined, UserOutlined, EnvironmentOutlined,
  TagOutlined, CalendarOutlined, FileTextOutlined,
  ExclamationCircleOutlined, SaveOutlined,
  SortAscendingOutlined,
} from "@ant-design/icons";
import SearchBar        from "../../components/SearchBar";
import Table            from "../../components/Table";
import CustomPagination from "../../components/Pagination";
import Filter           from "../../components/Filter";
import bookService      from "../../services/bookService";
import { useToast }     from "../../components/Toast";
import "../../style/BookManagement.scss";

const CONDITION_OPTIONS = ["excellent", "good", "fair", "poor"];
const STATUS_OPTIONS    = ["available", "borrowed", "lost", "damaged"];
const PAGE_SIZE         = 8;

const SORT_OPTIONS = [
  { label: "Newest First",  sortBy: "created_at",       sortOrder: "DESC" },
  { label: "Oldest First",  sortBy: "created_at",       sortOrder: "ASC"  },
  { label: "Title A→Z",     sortBy: "title",            sortOrder: "ASC"  },
  { label: "Title Z→A",     sortBy: "title",            sortOrder: "DESC" },
  { label: "Author A→Z",    sortBy: "author",           sortOrder: "ASC"  },
  { label: "Most Borrowed", sortBy: "borrowed_all_time", sortOrder: "DESC" },
  { label: "Qty High→Low",  sortBy: "quantity",         sortOrder: "DESC" },
  { label: "Qty Low→High",  sortBy: "quantity",         sortOrder: "ASC"  },
];

// Modal: ADD BOOK

function AddBookModal({ onClose, onAdded }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    id: "", isbn: "", title: "", author: "",
    genre: "", publisher: "", publish_year: "",
    language: "Tiếng Việt", pages: "", location: "",
    quantity: 1, description: "", book_cover: "", author_avatar: "",
  });

  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSubmit = async () => {
    const trimmed = {
      ...form,
      id:            form.id.trim(),
      isbn:          form.isbn.trim(),
      title:         form.title.trim(),
      author:        form.author.trim(),
      genre:         form.genre.trim(),
      publisher:     form.publisher.trim(),
      language:      form.language.trim(),
      location:      form.location.trim(),
      book_cover:    form.book_cover.trim(),
      author_avatar: form.author_avatar.trim(),
      description:   form.description.trim(),
    };

    if (!trimmed.id || !trimmed.title) {
      toast.warning("Book ID and Title are required");
      return;
    }

    try {
      setLoading(true);
      await bookService.create({
        ...trimmed,
        publish_year: trimmed.publish_year ? Number(trimmed.publish_year) : null,
        pages:        trimmed.pages        ? Number(trimmed.pages)        : null,
        quantity:     Number(trimmed.quantity),
        available:    Number(trimmed.quantity),
      });
      toast.success("Book added successfully!");
      onAdded();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to add book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--edit" onClick={e => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title">
            <PlusOutlined /><span>Add New Book</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <div className="edit-form-grid">
            <div className="form-group">
              <label>Book ID <span className="req">*</span></label>
              <input placeholder="e.g. BK021" value={form.id}
                     onChange={e => set("id", e.target.value)} />
            </div>
            <div className="form-group">
              <label>ISBN</label>
              <input placeholder="e.g. 978-604-xxxx" value={form.isbn}
                     onChange={e => set("isbn", e.target.value)} />
            </div>
            <div className="form-group form-full">
              <label>Book Title <span className="req">*</span></label>
              <input placeholder="Enter book title" value={form.title}
                     onChange={e => set("title", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input placeholder="Author name" value={form.author}
                     onChange={e => set("author", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input placeholder="e.g. Công Nghệ" value={form.genre}
                     onChange={e => set("genre", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Publisher</label>
              <input placeholder="Publisher name" value={form.publisher}
                     onChange={e => set("publisher", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Publish Year</label>
              <input type="number" placeholder="e.g. 2023" value={form.publish_year}
                     onChange={e => set("publish_year", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Language</label>
              <input value={form.language}
                     onChange={e => set("language", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pages</label>
              <input type="number" placeholder="Number of pages" value={form.pages}
                     onChange={e => set("pages", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Location <small>(Floor-Room-Shelf)</small></label>
              <input placeholder="e.g. 1-2-3" value={form.location}
                     onChange={e => set("location", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" min="1" value={form.quantity}
                     onChange={e => set("quantity", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Book Cover URL</label>
              <input placeholder="https://..." value={form.book_cover}
                     onChange={e => set("book_cover", e.target.value)} />
            </div>
            <div className="form-group form-full">
              <label>Description</label>
              <textarea rows={3} placeholder="Book description..."
                        value={form.description}
                        onChange={e => set("description", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--primary" onClick={handleSubmit} disabled={loading}>
            {loading ? <Spin size="small" /> : <><PlusOutlined /> Add Book</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal: VIEW

function ViewModal({ book, onClose }) {
  if (!book) return null;
  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--view" onClick={e => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title">
            <EyeOutlined /><span>Book Details</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <div className="view-hero">
            <img
              src={book.book_cover || "https://placehold.co/80x112?text=No+Cover"}
              alt={book.title} className="view-cover-img"
              onError={e => { e.target.src = "https://placehold.co/80x112?text=No+Cover"; }}
            />
            <div className="view-hero__info">
              <h3 className="view-title">{book.title}</h3>
              <div className="author-info" style={{ marginBottom: "0.8rem" }}>
                <img
                  src={book.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${book.author}`}
                  alt={book.author} className="author-avatar"
                />
                <span>{book.author || "—"}</span>
              </div>
              {book.genre && <span className="view-genre-badge">{book.genre}</span>}
            </div>
          </div>

          {book.description && <p className="view-desc">{book.description}</p>}

          <div className="view-grid">
            {[
              { icon: <TagOutlined />,         label: "Book ID",      value: book.id },
              { icon: <TagOutlined />,         label: "ISBN",         value: book.isbn         || "—" },
              { icon: <BookOutlined />,        label: "Publisher",    value: book.publisher    || "—" },
              { icon: <CalendarOutlined />,    label: "Publish Year", value: book.publish_year || "—" },
              { icon: <UserOutlined />,        label: "Language",     value: book.language     || "—" },
              { icon: <FileTextOutlined />,    label: "Pages",        value: book.pages ? `${book.pages} pages` : "—" },
              { icon: <EnvironmentOutlined />, label: "Location",     value: book.location     || "—" },
            ].map((item, i) => (
              <div key={i} className="view-info-item">
                {item.icon}
                <div><label>{item.label}</label><span>{item.value}</span></div>
              </div>
            ))}
          </div>

          <div className="view-stats">
            <div className="stat-card">
              <span className="stat-num">{book.quantity}</span>
              <span className="stat-lbl">Total Copies</span>
            </div>
            <div className="stat-card stat-card--green">
              <span className="stat-num">{book.available}</span>
              <span className="stat-lbl">Available</span>
            </div>
            <div className="stat-card stat-card--orange">
              <span className="stat-num">{book.currently_borrowed}</span>
              <span className="stat-lbl">Borrowed Now</span>
            </div>
            <div className="stat-card stat-card--blue">
              <span className="stat-num">{book.borrowed_all_time}</span>
              <span className="stat-lbl">All-Time</span>
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

// Modal: EDIT

function EditModal({ book, onClose, onSaved }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ ...book });
  if (!book) return null;
  const set = (field, value) => setForm(f => ({ ...f, [field]: value }));

  const handleSave = async () => {
    const trimmed = {
      ...form,
      title:       form.title?.trim(),
      author:      form.author?.trim()      || "",
      genre:       form.genre?.trim()       || "",
      publisher:   form.publisher?.trim()   || "",
      language:    form.language?.trim()    || "",
      location:    form.location?.trim()    || "",
      book_cover:  form.book_cover?.trim()  || "",
      description: form.description?.trim() || "",
    };

    if (!trimmed.title) {
      toast.warning("Title is required");
      return;
    }

    try {
      setLoading(true);
      await bookService.update(book.id, trimmed);
      toast.success("Book updated successfully!");
      onSaved();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to update book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--edit" onClick={e => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title">
            <EditOutlined /><span>Edit Book</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <div className="edit-form-grid">
            <div className="form-group form-full">
              <label>Book Title <span className="req">*</span></label>
              <input value={form.title || ""}
                     onChange={e => set("title", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Author</label>
              <input value={form.author || ""}
                     onChange={e => set("author", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Genre</label>
              <input value={form.genre || ""}
                     onChange={e => set("genre", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Publisher</label>
              <input value={form.publisher || ""}
                     onChange={e => set("publisher", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Publish Year</label>
              <input type="number" value={form.publish_year || ""}
                     onChange={e => set("publish_year", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Language</label>
              <input value={form.language || ""}
                     onChange={e => set("language", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Pages</label>
              <input type="number" value={form.pages || ""}
                     onChange={e => set("pages", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Location <small>(Floor-Room-Shelf)</small></label>
              <input value={form.location || ""} placeholder="e.g. 1-2-3"
                     onChange={e => set("location", e.target.value)} />
            </div>
            <div className="form-group">
              <label>Quantity</label>
              <input type="number" value={form.quantity || 0}
                     onChange={e => set("quantity", +e.target.value)} />
            </div>
            <div className="form-group">
              <label>Book Cover URL</label>
              <input value={form.book_cover || ""}
                     onChange={e => set("book_cover", e.target.value)} />
            </div>
            <div className="form-group form-full">
              <label>Description</label>
              <textarea rows={3} value={form.description || ""}
                        onChange={e => set("description", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--primary" onClick={handleSave} disabled={loading}>
            {loading ? <Spin size="small" /> : <><SaveOutlined /> Save Changes</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal: DELETE

function DeleteModal({ book, onClose, onDeleted }) {
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  if (!book) return null;
  const hasBorrowed = book.currently_borrowed > 0;

  const handleDelete = async () => {
    try {
      setLoading(true);
      await bookService.delete(book.id);
      toast.success("Book deleted successfully!");
      onDeleted();
      onClose();
    } catch (err) {
      toast.error(err.message || "Failed to delete book");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--delete" onClick={e => e.stopPropagation()}>
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
            <strong>"{book.title}"</strong> will be{" "}
            <span className="text-danger">permanently removed</span>.
          </p>
          {hasBorrowed && (
            <div className="delete-warning">
              ⚠️ This book has <strong>{book.currently_borrowed}</strong> copies
              currently borrowed. Please resolve them before deleting.
            </div>
          )}
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--danger"
                  disabled={hasBorrowed || loading}
                  onClick={handleDelete}>
            {loading ? <Spin size="small" /> : <><DeleteOutlined /> Delete</>}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal: ADD COPY (bulk)

function AddCopyModalInner({ book, onClose, onAdd, copies = [] }) {
  const [form, setForm] = useState({ quantity: 1, condition: "good", notes: "" });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  const getLastIndex = () => {
    if (copies.length === 0) return 0;
    const sorted = [...copies].sort((a, b) => b.barcode.localeCompare(a.barcode));
    const parts  = sorted[0].barcode.split('-');
    const num    = parseInt(parts[parts.length - 1], 10);
    return isNaN(num) ? 0 : num;
  };

  const lastIndex = getLastIndex();

  const previewBarcodes = () =>
    Array.from({ length: Math.min(form.quantity, 5) }, (_, i) =>
      `${book.id}-${String(lastIndex + i + 1).padStart(3, '0')}`
    );

  const previews = previewBarcodes();

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title">
            <PlusOutlined /><span>Add Book Copies</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <p className="copy-modal-book-name">Book: <strong>{book?.title}</strong></p>
          <div className="edit-form-grid">
            <div className="form-group form-full">
              <label>
                Number of Copies <span className="req">*</span>
                <small style={{ color: "#8c8c8c", fontWeight: 400, marginLeft: "0.8rem" }}>
                  (max 50)
                </small>
              </label>
              <div className="quantity-input-wrap">
                <button type="button" className="qty-btn"
                        onClick={() => set("quantity", Math.max(1, form.quantity - 1))}>
                  −
                </button>
                <input
                  type="number" min="1" max="50"
                  value={form.quantity}
                  onChange={e =>
                    set("quantity", Math.min(50, Math.max(1, Number(e.target.value) || 1)))
                  }
                  className="qty-input"
                />
                <button type="button" className="qty-btn"
                        onClick={() => set("quantity", Math.min(50, form.quantity + 1))}>
                  +
                </button>
              </div>
            </div>

            <div className="form-group form-full">
              <label>Condition</label>
              <select value={form.condition} onChange={e => set("condition", e.target.value)}>
                {CONDITION_OPTIONS.map(c => (
                  <option key={c} value={c}>
                    {c.charAt(0).toUpperCase() + c.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group form-full">
              <label>Notes <small>(optional)</small></label>
              <textarea rows={2} placeholder="e.g. New batch imported 2025"
                        value={form.notes}
                        onChange={e => set("notes", e.target.value)} />
            </div>

            <div className="form-group form-full">
              <label>Barcode Preview</label>
              <div className="barcode-preview">
                {previews.map(bc => (
                  <span key={bc} className="barcode-tag">{bc}</span>
                ))}
                {form.quantity > 5 && (
                  <span className="barcode-more">
                    +{form.quantity - 5} more
                    {" "}(up to {book.id}-{String(lastIndex + form.quantity).padStart(3, '0')})
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="copy-summary">
            <div className="copy-summary__item">
              <span>Will create</span>
              <strong>{form.quantity} cop{form.quantity > 1 ? "ies" : "y"}</strong>
            </div>
            <div className="copy-summary__item">
              <span>Condition</span>
              <strong>{form.condition}</strong>
            </div>
            <div className="copy-summary__item">
              <span>Status</span>
              <strong style={{ color: "#389e0d" }}>Available</strong>
            </div>
          </div>
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--primary"
                  disabled={form.quantity < 1}
                  onClick={() => { onAdd({ ...form, notes: form.notes.trim() }); onClose(); }}>
            <PlusOutlined /> Add {form.quantity} {form.quantity > 1 ? "Copies" : "Copy"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal: EDIT COPY

function EditCopyModalInner({ copy, onClose, onSave }) {
  const [form, setForm] = useState({ ...copy });
  const set = (f, v) => setForm(p => ({ ...p, [f]: v }));

  return (
    <div className="bm-overlay" onClick={onClose}>
      <div className="bm-modal bm-modal--sm" onClick={e => e.stopPropagation()}>
        <div className="bm-modal__header">
          <div className="bm-modal__header-title">
            <EditOutlined /><span>Edit Copy</span>
          </div>
          <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
        </div>
        <div className="bm-modal__body">
          <p className="copy-modal-book-name">Barcode: <strong>{copy.barcode}</strong></p>
          <div className="edit-form-grid">
            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={e => set("status", e.target.value)}>
                {STATUS_OPTIONS.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Condition</label>
              <select value={form.condition} onChange={e => set("condition", e.target.value)}>
                {CONDITION_OPTIONS.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div className="form-group form-full">
              <label>Notes</label>
              <textarea rows={2} value={form.notes || ""}
                        onChange={e => set("notes", e.target.value)} />
            </div>
          </div>
        </div>
        <div className="bm-modal__footer">
          <button className="bm-btn bm-btn--secondary" onClick={onClose}>Cancel</button>
          <button className="bm-btn bm-btn--primary"
                  onClick={() => { onSave({ ...form, notes: form.notes?.trim() || "" }); onClose(); }}>
            <SaveOutlined /> Save
          </button>
        </div>
      </div>
    </div>
  );
}

// Modal: MANAGE COPIES

function ManageCopiesModal({ book, onClose }) {
  const toast = useToast();
  const [copies,   setCopies]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showAdd,  setShowAdd]  = useState(false);
  const [editCopy, setEditCopy] = useState(null);

  useEffect(() => { loadCopies(); }, []);

  const loadCopies = async () => {
    try {
      setLoading(true);
      const res = await bookService.getCopies(book.id);
      setCopies(res.copies || []);
    } catch {
      toast.error("Failed to load copies");
    } finally {
      setLoading(false);
    }
  };

  const handleAddCopy = async (form) => {
    try {
      await bookService.addCopy(book.id, form);
      toast.success(`${form.quantity} cop${form.quantity > 1 ? "ies" : "y"} added!`);
      loadCopies();
    } catch (err) {
      toast.error(err.message || "Failed to add copies");
    }
  };

  const handleSaveCopy = async (updated) => {
    try {
      await bookService.updateCopy(updated.id, updated);
      toast.success("Copy updated!");
      loadCopies();
    } catch (err) {
      toast.error(err.message || "Failed to update copy");
    }
  };

  const handleDeleteCopy = async (copyId) => {
    try {
      await bookService.deleteCopy(copyId);
      toast.success("Copy deleted!");
      loadCopies();
    } catch (err) {
      toast.error(err.message || "Failed to delete copy");
    }
  };

  const statusStyle = {
    available: { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
    borrowed:  { bg: "#fff7e6", color: "#d46b08", border: "#ffd591" },
    damaged:   { bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
    lost:      { bg: "#f5f5f5", color: "#595959", border: "#d9d9d9" },
  };
  const conditionStyle = {
    excellent: { bg: "#e6f4ff", color: "#0958d9", border: "#91caff" },
    good:      { bg: "#f6ffed", color: "#389e0d", border: "#b7eb8f" },
    fair:      { bg: "#fff7e6", color: "#d46b08", border: "#ffd591" },
    poor:      { bg: "#fff1f0", color: "#cf1322", border: "#ffa39e" },
  };

  const Badge = ({ text, styleMap }) => {
    const s = styleMap[text?.toLowerCase()] || { bg: "#f5f5f5", color: "#333", border: "#d9d9d9" };
    return (
      <span style={{
        display: "inline-flex", alignItems: "center",
        padding: "0.3rem 1rem", borderRadius: "2rem",
        fontSize: "1.25rem", fontWeight: "600",
        background: s.bg, color: s.color,
        border: `0.1rem solid ${s.border}`,
      }}>
        {text}
      </span>
    );
  };

  const availableCount = copies.filter(c => c.status === "available").length;
  const borrowedCount  = copies.filter(c => c.status === "borrowed").length;

  if (!book) return null;

  return (
    <>
      <div className="bm-overlay" onClick={onClose}>
        <div className="bm-modal bm-modal--copies" onClick={e => e.stopPropagation()}>
          <div className="bm-modal__header">
            <div>
              <div className="bm-modal__header-title">
                <CopyOutlined /><span>Manage Copies</span>
              </div>
              <p className="bm-modal__subtitle">{book.title}</p>
            </div>
            <button className="bm-btn-close" onClick={onClose}><CloseOutlined /></button>
          </div>

          <div className="copies-summary">
            <span>Total: <strong>{copies.length}</strong></span>
            <span className="cs-sep" />
            <span className="cs-green">Available: <strong>{availableCount}</strong></span>
            <span className="cs-sep" />
            <span className="cs-orange">Borrowed: <strong>{borrowedCount}</strong></span>
            <button className="bm-btn bm-btn--primary copies-add-btn"
                    onClick={() => setShowAdd(true)}>
              <PlusOutlined /> Add Copies
            </button>
          </div>

          <div className="bm-modal__body bm-modal__body--no-top-pad">
            {loading ? (
              <div style={{ textAlign: "center", padding: "4rem" }}><Spin /></div>
            ) : copies.length === 0 ? (
              <div style={{ textAlign: "center", padding: "4rem", color: "#bfbfbf" }}>
                No copies yet. Click "Add Copies" to add.
              </div>
            ) : (
              <table className="copies-table">
                <thead>
                  <tr>
                    <th>Barcode</th>
                    <th>Status</th>
                    <th>Condition</th>
                    <th>Notes</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {copies.map(copy => (
                    <tr key={copy.id}>
                      <td><code className="copy-id">{copy.barcode}</code></td>
                      <td><Badge text={copy.status}    styleMap={statusStyle} /></td>
                      <td><Badge text={copy.condition} styleMap={conditionStyle} /></td>
                      <td>{copy.notes || <span className="text-muted">—</span>}</td>
                      <td className="copies-actions">
                        <button className="copies-action-btn copies-action-btn--edit"
                                onClick={() => setEditCopy(copy)} title="Edit">
                          <EditOutlined />
                        </button>
                        <button className="copies-action-btn copies-action-btn--del"
                                onClick={() => handleDeleteCopy(copy.id)} title="Delete">
                          <DeleteOutlined />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="bm-modal__footer">
            <button className="bm-btn bm-btn--secondary" onClick={onClose}>Close</button>
          </div>
        </div>
      </div>

      {showAdd && (
        <AddCopyModalInner
          book={book} copies={copies}
          onClose={() => setShowAdd(false)}
          onAdd={handleAddCopy}
        />
      )}
      {editCopy && (
        <EditCopyModalInner
          copy={editCopy}
          onClose={() => setEditCopy(null)}
          onSave={handleSaveCopy}
        />
      )}
    </>
  );
}

// Columns

const BOOK_COLUMNS = [
  { key: "id", label: "Book ID" },
  {
    key: "title",
    label: "Book Name",
    sortable: false,
    render: (value, row) => (
      <div className="book-info">
        <img
          src={row.book_cover || "https://placehold.co/36x50?text=N/A"}
          alt={value} className="book-cover"
          onError={e => { e.target.src = "https://placehold.co/36x50?text=N/A"; }}
        />
        <span>{value}</span>
      </div>
    ),
  },
  {
    key: "author",
    label: "Author",
    sortable: false,
    render: (value, row) => (
      <div className="author-info">
        <img
          src={row.author_avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${value}`}
          alt={value} className="author-avatar"
        />
        <span>{value || "—"}</span>
      </div>
    ),
  },
  { key: "genre",    label: "Genre",    sortable: false },
  { key: "location", label: "Location", sortable: false, subtitle: "Floor - Room - Shelf" },
  { key: "quantity", label: "Quantity", sortable: false, render: v => <strong>{v}</strong> },
];


// Main Page

const BookManagement = () => {
  const toast = useToast();

  const [books,        setBooks]        = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [total,        setTotal]        = useState(0);
  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState("");
  const [genre,        setGenre]        = useState("");
  const [sortBy,       setSortBy]       = useState("created_at");
  const [sortOrder,    setSortOrder]    = useState("DESC");
  const [genreOptions, setGenreOptions] = useState([]);

  //  Refs để tránh stale closure — luôn giữ giá trị mới nhất
  const sortByRef    = useRef("created_at");
  const sortOrderRef = useRef("DESC");
  const searchRef    = useRef("");
  const genreRef     = useRef("");
  const pageRef      = useRef(1);

  const [viewBook,   setViewBook]   = useState(null);
  const [editBook,   setEditBook]   = useState(null);
  const [copiesBook, setCopiesBook] = useState(null);
  const [deleteBook, setDeleteBook] = useState(null);
  const [showAdd,    setShowAdd]    = useState(false);

  const searchTimer = useRef(null);

  // ── Load genres ───────────────────────────────────────
  const loadGenres = async () => {
    try {
      const res = await bookService.getGenres();
      setGenreOptions(res.genres || []);
    } catch { /* không block UI */ }
  };

  // ── Load sách ─────────────────────────────────────────
  const loadBooks = useCallback(async (p, s, g, sb, so) => {
    try {
      setLoading(true);
      const res = await bookService.getAll({
        page:      p,
        limit:     PAGE_SIZE,
        search:    s,
        genre:     g,
        sortBy:    sb,
        sortOrder: so,
      });
      setBooks(res.books || []);
      setTotal(res.total || 0);
    } catch {
      toast.error("Failed to load books");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBooks(1, "", "", "created_at", "DESC");
    loadGenres();
  }, []);

  // ── Search debounce 400ms ─────────────────────────────
  const handleSearch = (value) => {
    const trimmed = value.trimStart();
    setSearch(trimmed);
    searchRef.current = trimmed;      
    setPage(1);
    pageRef.current = 1;              
    clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      loadBooks(1, trimmed.trim(), genreRef.current, sortByRef.current, sortOrderRef.current);
    }, 400);
  };

  // ── Filter genre ──────────────────────────────────────
  const handleGenreChange = (value) => {
    setGenre(value);
    genreRef.current = value;          
    setPage(1);
    pageRef.current = 1;              
    loadBooks(1, searchRef.current, value, sortByRef.current, sortOrderRef.current);
  };

  // ── Sort ──────────────────────────────────────────────
  const handleSortChange = (val) => {
    const [sb, so] = val.split("__");
    setSortBy(sb);        sortByRef.current    = sb;   
    
    setSortOrder(so);     sortOrderRef.current = so;  
    
    setPage(1);           pageRef.current      = 1;    
    loadBooks(1, searchRef.current, genreRef.current, sb, so);
  };

  // ── Phân trang ────────────────────────────────────────
  const handlePageChange = (p) => {
    setPage(p);
    pageRef.current = p;               // ✅ sync ref
    // ✅ dùng ref — không bị stale dù state chưa re-render
    loadBooks(p, searchRef.current, genreRef.current, sortByRef.current, sortOrderRef.current);
  };

  // ── Reset tất cả ──────────────────────────────────────
  const handleReset = () => {
    setSearch("");        searchRef.current    = "";
    setGenre("");         genreRef.current     = "";
    setSortBy("created_at");   sortByRef.current    = "created_at";
    setSortOrder("DESC");      sortOrderRef.current = "DESC";
    setPage(1);                pageRef.current      = 1;
    loadBooks(1, "", "", "created_at", "DESC");
  };

  // ── Reload sau edit/add ───────────────────────────────
  const reload = () =>
    loadBooks(pageRef.current, searchRef.current, genreRef.current, sortByRef.current, sortOrderRef.current);

  // ── Reload sau delete ─────────────────────────────────
  const reloadAfterDelete = () => {
    const newTotal   = total - 1;
    const maxPage    = Math.max(1, Math.ceil(newTotal / PAGE_SIZE));
    const targetPage = pageRef.current > maxPage ? maxPage : pageRef.current;
    if (targetPage !== pageRef.current) {
      setPage(targetPage);
      pageRef.current = targetPage;
    }
    loadBooks(targetPage, searchRef.current, genreRef.current, sortByRef.current, sortOrderRef.current);
  };

  const hasFilter = search || genre || sortBy !== "created_at" || sortOrder !== "DESC";

  const ACTIONS = [
    { label: "View",          icon: <EyeOutlined />,    className: "view",   onClick: row => setViewBook(row)   },
    { label: "Edit",          icon: <EditOutlined />,   className: "edit",   onClick: row => setEditBook(row)   },
    { label: "Manage Copies", icon: <CopyOutlined />,   className: "copies", onClick: row => setCopiesBook(row) },
    { label: "Delete",        icon: <DeleteOutlined />, className: "delete", onClick: row => setDeleteBook(row) },
  ];

  return (
    <div className="book-management">

      {/* ── Header ── */}
      <div className="header">
        <h1 className="tittle">Books Management</h1>
        <div className="header-actions">
          <Filter
            filterName="Genre"
            options={genreOptions}
            value={genre}
            onChange={handleGenreChange}
          />

          <Select
            value={`${sortBy}__${sortOrder}`}
            style={{ width: 180 }}
            onChange={handleSortChange}
            suffixIcon={
              <SortAscendingOutlined style={{ color: "#088ef5", fontSize: "1.5rem" }} />
            }
            options={SORT_OPTIONS.map(o => ({
              label: o.label,
              value: `${o.sortBy}__${o.sortOrder}`,
            }))}
          />

          <SearchBar
            value={search}
            onChange={handleSearch}
            placeholder="Search by title, author..."
          />

          {hasFilter && (
            <button className="btn-reset" onClick={handleReset}>✕ Reset</button>
          )}

          <button className="btn-add" onClick={() => setShowAdd(true)}>
            <PlusOutlined /> Add New
          </button>
        </div>
      </div>

      {/* ── Filter summary ── */}
      {(search || genre) && (
        <div className="filter-summary">
          {search && <span className="filter-tag">🔍 "{search}"</span>}
          {genre  && <span className="filter-tag">📂 {genre}</span>}
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
      ) : books.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <p>{search || genre ? "No books match your search" : "No books found"}</p>
          {(search || genre) && (
            <button className="btn-reset" onClick={handleReset}>Clear filters</button>
          )}
        </div>
      ) : (
        <Table columns={BOOK_COLUMNS} rows={books} actions={ACTIONS} />
      )}

      {/* ── Pagination ── */}
      {!loading && books.length > 0 && (
        <CustomPagination
          total={total}
          pageSize={PAGE_SIZE}
          currentPage={page}
          onChange={handlePageChange}
        />
      )}

      {/* ── Modals ── */}
      {showAdd    && <AddBookModal      onClose={() => setShowAdd(false)}    onAdded={reload}             />}
      {viewBook   && <ViewModal         book={viewBook}   onClose={() => setViewBook(null)}               />}
      {editBook   && <EditModal         book={editBook}   onClose={() => setEditBook(null)}   onSaved={reload} />}
      {copiesBook && <ManageCopiesModal book={copiesBook} onClose={() => setCopiesBook(null)}             />}
      {deleteBook && <DeleteModal       book={deleteBook} onClose={() => setDeleteBook(null)} onDeleted={reloadAfterDelete} />}
    </div>
  );
};

export default BookManagement;